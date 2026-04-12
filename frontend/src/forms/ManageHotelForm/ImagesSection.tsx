import { useFormContext, useWatch } from "react-hook-form";
import type { HotelFormData } from "./ManageHotelForm";
import { useEffect, useMemo } from "react";

const ImagesSection = () => {
 const { setValue, control } = useFormContext<HotelFormData>();

 // ✅ Existing images (from backend)
 const imageUrls =
  useWatch({
   control,
   name: "imageUrls",
  }) || [];

 // ✅ New uploaded files
 const imageFiles = useWatch({
  control,
  name: "imageFiles",
 });

 // ✅ Convert files → preview URLs
 const previewUrls = useMemo(() => {
  if (!imageFiles) return [];
  return Array.from(imageFiles).map((file) => URL.createObjectURL(file));
 }, [imageFiles]);

 // ✅ Cleanup memory
 useEffect(() => {
  return () => {
   previewUrls.forEach((url) => URL.revokeObjectURL(url));
  };
 }, [previewUrls]);

 // ✅ Combine both
 const allImages = [...imageUrls, ...previewUrls];

 // ✅ Handle adding more files (IMPORTANT FIX)
 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  const existingFiles = imageFiles ? Array.from(imageFiles) : [];

  const newFiles = Array.from(files);

  const combined = [...existingFiles, ...newFiles];

  // Limit to max 6
  if (combined.length + imageUrls.length > 6) {
   alert("Max 6 images allowed");
   return;
  }

  const dataTransfer = new DataTransfer();
  combined.forEach((file) => dataTransfer.items.add(file));

  setValue("imageFiles", dataTransfer.files, {
   shouldDirty: true,
   shouldValidate: true,
  });

  // reset input so same file can be selected again
  e.target.value = "";
 };

 // ✅ Delete handler
 const handleDelete = (
  e: React.MouseEvent<HTMLButtonElement>,
  index: number,
 ) => {
  e.preventDefault();

  if (index < imageUrls.length) {
   // remove existing image
   const updatedUrls = imageUrls.filter((_, i) => i !== index);

   setValue("imageUrls", updatedUrls, {
    shouldDirty: true,
   });
  } else {
   // remove new file
   const fileIndex = index - imageUrls.length;

   const updatedFiles = Array.from(imageFiles || []).filter(
    (_, i) => i !== fileIndex,
   );

   const dataTransfer = new DataTransfer();
   updatedFiles.forEach((file) => dataTransfer.items.add(file));

   setValue("imageFiles", dataTransfer.files, {
    shouldDirty: true,
   });
  }
 };

 return (
  <div>
   <h2 className="text-2xl font-bold mb-3">Images</h2>

   <div className="border rounded p-4 flex flex-col gap-4">
    {/* ✅ Image Grid */}
    {allImages.length > 0 ? (
     <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
      {allImages.map((url, index) => (
       <div key={url + index} className="relative group">
        <img
         src={url}
         alt="preview"
         className="w-full h-32 object-cover rounded border"
        />

        <button
         onClick={(e) => handleDelete(e, index)}
         className="absolute inset-0 flex items-center justify-center 
                  bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 
                  text-white text-sm font-semibold rounded"
        >
         Delete
        </button>
       </div>
      ))}
     </div>
    ) : (
     <p className="text-gray-500">⚠️ No images found</p>
    )}

    {/* ✅ File Input (CUSTOM CONTROLLED) */}
    <input
     type="file"
     name="imageFiles"
     multiple
     accept="image/*"
     onChange={handleFileChange}
     className="w-full text-gray-700 font-normal"
    />
   </div>

   {/* ✅ Validation Error */}
   {imageUrls.length + (imageFiles?.length || 0) === 0 && (
    <span className="text-red-500 text-sm font-bold">
     At least one image should be added
    </span>
   )}
  </div>
 );
};

export default ImagesSection;
