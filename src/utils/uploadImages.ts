import { v2 as cloudinary } from "cloudinary";

const uploadImages = async (images: string[]) => {
  const results = [];
  for (const image of images) {
    const result = await cloudinary.uploader.upload(image);

    results.push(result.secure_url);
  }

  return results;
};

export default uploadImages;
