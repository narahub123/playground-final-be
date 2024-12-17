import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.development.local" }); // .env 파일에 정의된 환경 변수 로드

const mongoURI = process.env.MONGO_URI || "";

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);

    console.log("몽고 DB 연결 성공");
  } catch (error) {
    console.log("몽고 DB 연결 실패", error);
    process.exit(1); // 연결 실패시 애플리케이션 종료
  }
};

export default connectDB;
