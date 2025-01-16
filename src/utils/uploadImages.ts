import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

const uploadImages = async (images: string[]) => {
  const results: UploadApiResponse[] = [];
  for (const image of images) {
    const result = await cloudinary.uploader.upload(image);

    results.push(result);
  }

  return results;
};

export default uploadImages;
