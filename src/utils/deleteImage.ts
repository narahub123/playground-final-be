import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

const deleteImage = async (image: UploadApiResponse) => {
  try {
    await cloudinary.uploader.destroy(image.public_id);
  } catch (error) {
    console.error("이미지 삭제 실패");
  }
};

export default deleteImage;
