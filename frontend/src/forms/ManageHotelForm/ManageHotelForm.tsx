import { FormProvider, useForm } from "react-hook-form";
import DetailsSection from "./DetailsSection";
import TypeSection from "../TypeSection";
import FacilitiesSection from "./FacilitiesSection";
import GuestsSection from "./GuestsSection";
import ImagesSection from "./ImagesSection";
import type { HotelType } from "../../../../backend/src/shared/types";
import { useEffect, useRef } from "react";

export type HotelFormData = {
 name: string;
 city: string;
 country: string;
 description: string;
 type: string;
 pricePerNight: number;
 starRating: number;
 facilities: string[];
 imageFiles: FileList;
 imageUrls?: string[];
 adultCount: number;
 childCount: number;
};

type Props = {
 hotel?: HotelType;
 onSave: (hotelFormData: FormData) => void;
 isLoading: boolean;
};

const ManageHotelForm = ({ onSave, isLoading, hotel }: Props) => {
 const formMethods = useForm<HotelFormData>({
  defaultValues: hotel
   ? {
      ...hotel,
      pricePerNight: Number(hotel.pricePerNight),
      starRating: Number(hotel.starRating),
      adultCount: Number(hotel.adultCount),
      childCount: Number(hotel.childCount),
     }
   : {},
 });

 const { handleSubmit, reset } = formMethods;

 const lastResetHotelIdRef = useRef<string | null>(null);

 useEffect(() => {
  if (!hotel) {
   lastResetHotelIdRef.current = null;
   return;
  }
  const id = String(hotel._id ?? hotel.id ?? "");
  if (!id || lastResetHotelIdRef.current === id) {
   return;
  }
  lastResetHotelIdRef.current = id;
  reset({
   ...hotel,
   pricePerNight: Number(hotel.pricePerNight),
   starRating: Number(hotel.starRating),
   adultCount: Number(hotel.adultCount),
   childCount: Number(hotel.childCount),
   imageFiles: undefined as any,
  });
 }, [hotel, reset]);

 const onSubmit = handleSubmit((formDataJson: HotelFormData) => {
  const formData = new FormData();

  const rawImageUrls = formDataJson.imageUrls;
  const imageUrlsToSend =
   rawImageUrls !== undefined ? rawImageUrls : (hotel?.imageUrls ?? []);

  formData.append("name", formDataJson.name);
  formData.append("city", formDataJson.city);
  formData.append("country", formDataJson.country);
  formData.append("description", formDataJson.description);
  formData.append("type", formDataJson.type);
  formData.append("pricePerNight", formDataJson.pricePerNight.toString());
  formData.append("starRating", formDataJson.starRating.toString());
  formData.append("adultCount", formDataJson.adultCount.toString());
  formData.append("childCount", formDataJson.childCount.toString());

  formDataJson.facilities.forEach((facility) => {
   formData.append("facilities", facility);
  });

  imageUrlsToSend.forEach((url) => {
   formData.append("imageUrls", url);
  });

  if (formDataJson.imageFiles) {
   Array.from(formDataJson.imageFiles).forEach((imageFile) => {
    formData.append("imageFiles", imageFile);
   });
  }

  onSave(formData);
 });

 return (
  <FormProvider {...formMethods}>
   <form className="flex flex-col gap-10" onSubmit={onSubmit} noValidate>
    <DetailsSection />
    <TypeSection />
    <FacilitiesSection />
    <GuestsSection />
    <ImagesSection />

    <span className="flex justify-end">
     <button
      disabled={isLoading}
      type="submit"
      className="bg-blue-600 text-white p-2 font-bold hover:bg-blue-500 text-xl disabled:bg-gray-500"
     >
      {isLoading ? "Saving..." : "Save"}
     </button>
    </span>
   </form>
  </FormProvider>
 );
};

export default ManageHotelForm;
