import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

const uploadImage = async (image: string): Promise<UploadApiResponse> => {
  return await cloudinary.uploader.upload(image);
};

export default uploadImage;
