import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

const uploadVideo = async (filePath: string): Promise<UploadApiResponse> => {
  return await cloudinary.uploader.upload(filePath, {
    resource_type: "video", // 필수
  });
};

export default uploadVideo;
