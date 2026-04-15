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

  const hotels = await Hotel.find(query).skip(skip).limit(pageSize);

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
