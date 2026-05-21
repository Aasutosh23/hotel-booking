import express, { Request, Response } from "express";
import Hotel from "../models/hotel";
import { BookingType, HotelSearchResponse } from "../shared/types";
import { param, validationResult } from "express-validator";
import Stripe from "stripe";
import verifyToken from "../middleware/auth";

const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

const router = express.Router();

router.get("/search", async (req: Request, res: Response) => {
 try {
  const pageSize = 5;
  const pageNumber = parseInt(req.query.page ? req.query.page.toString() : "1");
  const skip = (pageNumber - 1) * pageSize;

  const query: Record<string, unknown> = {};

  let sortOptions = {};
  switch (req.query.sortOption) {
   case "starRating":
    sortOptions = { starRating: -1 };
    break;
   case "pricePerNightAsc":
    sortOptions = { pricePerNight: 1 };
    break;
   case "pricePerNightDesc":
    sortOptions = { pricePerNight: -1 };
    break;
  }

  if (req.query.destination) {
   const destination = req.query.destination.toString();
   query["$or"] = [
    { city: { $regex: destination, $options: "i" } },
    { country: { $regex: destination, $options: "i" } },
   ];
  }

  if (req.query.adultCount) {
   query["adultCount"] = { $gte: parseInt(req.query.adultCount.toString()) };
  }

  if (req.query.childCount) {
   query["childCount"] = { $gte: parseInt(req.query.childCount.toString()) };
  }

  if (req.query.facilities) {
   const facilities = Array.isArray(req.query.facilities)
    ? req.query.facilities
    : [req.query.facilities];

   query["facilities"] = {
    $all: facilities,
   };
  }

  if (req.query.types) {
   const types = Array.isArray(req.query.types)
    ? req.query.types
    : [req.query.types];

   query["type"] = { $in: types };
  }

  if (req.query.stars) {
   const stars = Array.isArray(req.query.stars)
    ? (req.query.stars as string[])
    : [req.query.stars as string];

   const starRatings = stars.map((star) => parseInt(star));

   query["starRating"] = { $in: starRatings };
  }

  if (req.query.maxPrice) {
   query["pricePerNight"] = {
    $lte: parseInt(req.query.maxPrice as string),
   };
  }

  const hotels = await Hotel.find(query)
   .sort(sortOptions)
   .skip(skip)
   .limit(pageSize);

  const total = await Hotel.countDocuments(query);

  const response: HotelSearchResponse = {
   data: hotels,
   pagination: {
    total,
    page: pageNumber,
    pages: Math.ceil(total / pageSize),
   },
  };

  res.json(response);
 } catch (error) {
  console.log("error", error);
  res.status(500).json({ message: "Something went wrong" });
 }
});

router.get(
 "/:id",
 [param("id").notEmpty().withMessage("Hotel ID is required")],
 async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
   return res.status(400).json({ errors: errors.array() });
  }

  const id = req.params.id.toString();

  try {
   const hotel = await Hotel.findById(id);
   res.json(hotel);
  } catch (error) {
   console.log(error);
   res.status(500).json({ message: "Error fetching hotel" });
  }
 },
);

router.post(
 "/:hotelId/bookings/create-payment-intent",
 verifyToken,
 async (req: Request, res: Response) => {
  const { numberOfNights } = req.body;
  const hotelId = req.params.hotelId;

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
   return res.status(400).json({ message: "Hotel not found" });
  }

  const totalCost = hotel.pricePerNight * numberOfNights;

  const paymentIntent = await stripe.paymentIntents.create({
   amount: totalCost,
   currency: "usd",
   metadata: {
    hotelId,
    userId: req.userId,
   },
  });

  if (!paymentIntent.client_secret) {
   return res.status(500).json({ message: "Error creating payment intent" });
  }

  const response = {
   paymentIntentId: paymentIntent.id,
   clientSecret: paymentIntent.client_secret.toString(),
   totalCost,
  };

  res.send(response);
 },
);

router.post(
 "/:hotelId/bookings",
 verifyToken,
 async (req: Request, res: Response) => {
  try {
   const paymentIntentId = req.body.paymentIntentId;

   const paymentIntent = await stripe.paymentIntents.retrieve(
    paymentIntentId as string,
   );

   if (!paymentIntent) {
    return res.status(400).json({ message: "Payment intent not found" });
   }

   if (
    paymentIntent.metadata.hotelId !== req.params.hotelId ||
    paymentIntent.metadata.userId !== req.userId
   ) {
    return res.status(400).json({ message: "Payment intent mismatch" });
   }

   if (paymentIntent.status !== "succeeded") {
    return res.status(400).json({
     message: `Payment intent not succeeded. Status: ${paymentIntent.status}`,
    });
   }

   const newBooking: BookingType = {
    ...req.body,
    userId: req.userId,
   };

   const hotel = await Hotel.findOneAndUpdate(
    { _id: req.params.hotelId },
    {
     $push: { bookings: newBooking },
    },
   );

   if (!hotel) {
    return res.status(400).json({ message: "Hotel not found" });
   }

   await hotel.save();
   res.status(200).send();
  } catch (error) {
   console.log(error);
   res.status(500).json({ message: "Something went wrong" });
  }
 },
);

export default router;
