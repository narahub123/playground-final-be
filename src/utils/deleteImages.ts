import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

const deleteImages = async (images: UploadApiResponse[]) => {
  try {
    for (const image of images) {
      await cloudinary.uploader.destroy(image.public_id);
    }
  } catch (error) {
    console.error("이미지 삭제 실패", error);
  }
};

export default deleteImages;
