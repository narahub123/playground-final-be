import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import deleteImage from "./deleteImage";
import deleteVideo from "./deleteVideo";

const deleteMedia = async (media: UploadApiResponse[]) => {
  try {
    for (const medium of media) {
      if (medium.resource_type === "image") {
        deleteImage(medium);
      } else {
        deleteVideo(medium);
      }
    }
  } catch (error) {
    console.error("");
  }
};

export default deleteMedia;
