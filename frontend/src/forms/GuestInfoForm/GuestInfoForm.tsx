import DatePicker from "react-datepicker";
import { useForm } from "react-hook-form";

type Props = {
 hotelId: string;
 pricePerNight: number;
};

type GuestInfoFormData = {
 checkIn: Date;
 checkOut: Date;
 adultCount: number;
 childrenCount: number;
};

const GuestInfoForm = ({ hotelId, pricePerNight }: Props) => {
 const {
  watch,
  register,
  handleSubmit,
  setValue,
  formState: { errors },
 } = useForm<GuestInfoFormData>();

 const checkIn = watch("checkIn");
 const checkOut = watch("checkOut");

 const minDate = new Date();
 const maxDate = new Date();
 maxDate.setFullYear(maxDate.getFullYear() + 1);

 return (
  <div className="flex flex-col p-4 bg-blue-200 gap-4">
   <h3 className="text-md font-bold">${pricePerNight}</h3>
   <form>
    <div className="grid grid-cols-1 gap-4 items-center">
     <div>
      <DatePicker
       required
       selected={checkIn}
       onChange={(date: Date | null) => {
        if (date) setValue("checkIn", date);
       }}
       selectsStart
       startDate={checkIn}
       endDate={checkOut}
       minDate={minDate}
       maxDate={maxDate}
       placeholderText="Check-in Date"
       className="min-w-full bg-white p-2 focus:outline-none"
       wrapperClassName="min-w-full"
      />
     </div>
     <div>
      <DatePicker
       required
       selected={checkOut}
       onChange={(date: Date | null) => {
        if (date) setValue("checkOut", date);
       }}
       selectsEnd
       startDate={checkIn}
       endDate={checkOut}
       minDate={minDate}
       maxDate={maxDate}
       placeholderText="Check-in Date"
       className="min-w-full bg-white p-2 focus:outline-none"
       wrapperClassName="min-w-full"
      />
     </div>

     <div className="flex bg-white px-2 py-1 gap-2">
      <label className="items-center flex">
       Adults:{" "}
       <input
        className="w-full p-1 focus:outline-none font-bold"
        type="number"
        min={1}
        max={20}
        {...register("adultCount", {
         required: "This field is required",
         min: {
          value: 1,
          message: "There must be at least one adult",
         },
         valueAsNumber: true,
        })}
       />
      </label>
      <label className="items-center flex">
       Children:{" "}
       <input
        className="w-full p-1 focus:outline-none font-bold"
        type="number"
        min={0}
        max={20}
        {...register("childrenCount", {
         valueAsNumber: true,
        })}
       />
      </label>
      {errors.adultCount && (
       <span className="text-red-500 font-semibold text-sm">
        {errors.adultCount.message}
       </span>
      )}
     </div>
    </div>
   </form>
  </div>
 );
};

export default GuestInfoForm;
