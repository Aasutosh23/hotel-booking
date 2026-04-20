import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import * as apiClient from "../api-client";
import { AiFillStar } from "react-icons/ai";
import GuestInfoForm from "../forms/GuestInfoForm/GuestInfoForm";

const Detail = () => {
 const { hotelId } = useParams();

 const { data: hotel } = useQuery({
  queryKey: ["fetchHotelById", hotelId],
  queryFn: () => apiClient.fetchHotelById(hotelId as string),
  enabled: !!hotelId,
 });

 if (!hotel) {
  return <></>;
 }

 return (
  <div className="space-y-6">
   {/* Title + Stars */}
   <div>
    <span className="flex">
     {Array.from({ length: hotel.starRating }).map((_, index) => (
      <AiFillStar key={index} className="fill-yellow-400" />
     ))}
    </span>
    <h1 className="text-3xl font-bold">{hotel.name}</h1>
   </div>

   {/* Images */}
   <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    {hotel.imageUrls.map((image, index) => (
     <div key={image || index} className="h-[300px]">
      <img
       src={image}
       alt={hotel.name}
       className="rounded-md w-full h-full object-cover object-center"
      />
     </div>
    ))}
   </div>

   {/* Facilities */}
   <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
    {hotel.facilities.map((facility) => (
     <div key={facility} className="border border-slate-300 rounded-sm p-3">
      {facility}
     </div>
    ))}
   </div>

   {/* Description + Form */}
   <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
    <div className="whitespace-pre-line">{hotel.description}</div>
    <div className="h-fit">
     <GuestInfoForm hotelId={hotel._id} pricePerNight={hotel.pricePerNight} />
    </div>
   </div>
  </div>
 );
};

export default Detail;
