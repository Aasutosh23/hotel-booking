import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../api-client";

const Booking = () => {
 const { data: currentUser } = useQuery({
  queryKey: ["fetchCurrentUser"],
  queryFn: apiClient.fetchCurrentUser,
 });

 console.log(currentUser?.email);

 return <div>Booking</div>;
};

export default Booking;
