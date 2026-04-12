import express, { Request, Response } from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import { Hotel } from "../models/hotel";
import { HotelType } from "../shared/types";
import verifyToken from "../middleware/auth";
import { body } from "express-validator";

const router = express.Router();

// ✅ Cloudinary config (VERY IMPORTANT)
cloudinary.v2.config({
 cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
 api_key: process.env.CLOUDINARY_API_KEY,
 api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer setup
const storage = multer.memoryStorage();
const upload = multer({
 storage,
 limits: { fileSize: 5 * 1024 * 1024 },
});

// ======================
// 🟢 CREATE HOTEL
// ======================
router.post(
 "/",
 verifyToken,
 [
  body("name").notEmpty().withMessage("Name is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("country").notEmpty().withMessage("Country is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("type").notEmpty().withMessage("Hotel type is required"),
  body("adultCount").notEmpty().withMessage("Adult count is required"),
  body("pricePerNight")
   .notEmpty()
   .isNumeric()
   .withMessage("Price per night is required"),
  body("facilities")
   .notEmpty()
   .isArray()
   .withMessage("Facilities are required"),
 ],
 upload.array("imageFiles", 6),
 async (req: Request, res: Response) => {
  try {
   const imageFiles = (req.files as Express.Multer.File[]) || [];

   // ❗ optional: enforce at least 1 image
   if (imageFiles.length === 0) {
    return res
     .status(400)
     .json({ message: "Please upload at least one image" });
   }

   const newHotel: HotelType = req.body;

   const imageUrls = await uploadImages(imageFiles);

   newHotel.imageUrls = imageUrls;
   newHotel.lastUpdated = new Date();
   newHotel.userId = req.userId;

   const hotel = new Hotel(newHotel);
   await hotel.save();

   res.status(201).json(hotel);
  } catch (e) {
   console.error("Error creating hotel:", e);
   res.status(500).json({ message: "Something went wrong" });
  }
 },
);

// ======================
// 🟢 GET ALL HOTELS
// ======================
router.get("/", verifyToken, async (req: Request, res: Response) => {
 try {
  const hotels = await Hotel.find({ userId: req.userId });
  res.json(hotels);
 } catch (error) {
  res.status(500).json({ message: "Error fetching hotels" });
 }
});

// ======================
// 🟢 GET HOTEL BY ID
// ======================
router.get("/:id", verifyToken, async (req: Request, res: Response) => {
 try {
  const hotel = await Hotel.findOne({
   _id: req.params.id,
   userId: req.userId,
  });

  res.json(hotel);
 } catch (error) {
  res.status(500).json({ message: "Error fetching hotel" });
 }
});

// ======================
// 🟢 UPDATE HOTEL
// ======================
router.put(
 "/:hotelId",
 verifyToken,
 upload.array("imageFiles"),
 async (req: Request, res: Response) => {
  try {
   const body = req.body;

   const updateData = {
    name: body.name,
    city: body.city,
    country: body.country,
    description: body.description,
    type: body.type,
    pricePerNight: Number(body.pricePerNight),
    starRating: Number(body.starRating),
    adultCount: Number(body.adultCount),
    childCount: Number(body.childCount),
    facilities: Array.isArray(body.facilities)
     ? body.facilities
     : body.facilities
       ? [body.facilities]
       : [],
    lastUpdated: new Date(),
   };

   const hotel = await Hotel.findOneAndUpdate(
    {
     _id: req.params.hotelId,
     userId: req.userId,
    },
    { $set: updateData },
    { new: true },
   );

   if (!hotel) {
    return res.status(404).json({ message: "Hotel not found" });
   }

   const files = (req.files as Express.Multer.File[]) || [];
   const newImageUrls = await uploadImages(files);

   const existingImageUrls = Array.isArray(body.imageUrls)
    ? body.imageUrls
    : body.imageUrls
      ? [body.imageUrls]
      : [];

   hotel.imageUrls = [...newImageUrls, ...existingImageUrls];

   await hotel.save();

   res.status(200).json(hotel);
  } catch (error) {
   console.error("Error updating hotel:", error);
   res.status(500).json({ message: "Something went wrong" });
  }
 },
);

// ======================
// 🟢 IMAGE UPLOAD FUNCTION
// ======================
async function uploadImages(imageFiles: Express.Multer.File[]) {
 if (!imageFiles || imageFiles.length === 0) {
  return [];
 }

 const uploadPromises = imageFiles.map((image) => {
  return new Promise<string>((resolve, reject) => {
   const stream = cloudinary.v2.uploader.upload_stream(
    {
     transformation: [
      { width: 1024, height: 1024, crop: "limit" },
      { quality: "auto" },
      { fetch_format: "auto" },
     ],
    },
    (error, result) => {
     if (error) {
      reject(error);
     } else {
      resolve(result?.secure_url || "");
     }
    },
   );

   stream.end(image.buffer);
  });
 });

 return await Promise.all(uploadPromises);
}

export default router;
