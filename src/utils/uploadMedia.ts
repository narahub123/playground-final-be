import { UploadApiResponse } from "cloudinary";
import uploadImage from "./uploadImage";
import uploadVideo from "./uploadVideo";

const uploadMedia = async (media: string[]): Promise<UploadApiResponse[]> => {
  const savedMedia: UploadApiResponse[] = [];

  if (media.length > 0) {
    for (const medium of media as string[]) {
      if (medium.startsWith("data:image")) {
        console.log("이미지");
        const imageUrl = await uploadImage(medium);
        savedMedia.push(imageUrl);
      } else {
        console.log("동영상");
        const videoUrl = await uploadVideo(medium);
        savedMedia.push(videoUrl);
      }
    }
  }

  return savedMedia;
};

export default uploadMedia;
