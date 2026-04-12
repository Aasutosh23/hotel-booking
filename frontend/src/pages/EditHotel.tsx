import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import * as apiClient from "../api-client";
import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";
import { useAppContext } from "../contexts/AppContext";

const EditHotel = () => {
 const { hotelId } = useParams<{ hotelId: string }>();
 const { showToast } = useAppContext();
 const queryClient = useQueryClient();

 const { data: hotel, isLoading: isInitialLoading } = useQuery({
  queryKey: ["fetchMyHotelById", hotelId],
  queryFn: () => apiClient.fetchMyHotelById(hotelId || ""),
  enabled: !!hotelId,
 });

 const { mutate, isPending } = useMutation({
  mutationFn: ({
   hotelFormData,
   id,
  }: {
   hotelFormData: FormData;
   id: string;
  }) => apiClient.updateMyHotelById(id, hotelFormData),

  onSuccess: async () => {
   showToast({
    message: "Hotel Saved!",
    type: "SUCCESS",
   });

   await queryClient.invalidateQueries({
    queryKey: ["fetchMyHotelById", hotelId],
   });
  },

  onError: (error) => {
   console.error("Update Error:", error);

   showToast({
    message: "Error Saving Hotel",
    type: "ERROR",
   });
  },
 });

 const handleSave = (hotelFormData: FormData) => {
  if (!hotelId) return;
  mutate({ hotelFormData, id: hotelId });
 };

 if (isInitialLoading) {
  return (
   <div className="flex justify-center items-center min-h-screen text-gray-500 text-xl">
    Loading hotel details...
   </div>
  );
 }

 if (!hotel) {
  return (
   <div className="flex justify-center items-center min-h-screen text-red-500 text-xl">
    Hotel not found.
   </div>
  );
 }

 return (
  <ManageHotelForm hotel={hotel} onSave={handleSave} isLoading={isPending} />
 );
};

export default EditHotel;
