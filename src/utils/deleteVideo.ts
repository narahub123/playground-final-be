import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

const deleteVideo = async (video: UploadApiResponse) => {
  try {
    await cloudinary.uploader.destroy(video.public_id, {
      resource_type: "video",
    });
  } catch (error) {
    console.error("동영상 삭제 실패");
  }
};

export default deleteVideo;
