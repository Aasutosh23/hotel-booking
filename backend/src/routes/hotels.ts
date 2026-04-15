import express, { Request, Response } from "express";
import Hotel from "../models/hotel";
import { HotelSearchResponse } from "../shared/types";

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

export default router;
