import express from "express"; // Express 모듈을 가져옴 (서버 애플리케이션 생성용)
import dotenv from "dotenv"; // 환경 변수 관리를 위한 dotenv 모듈
import cookieParser from "cookie-parser"; // 요청의 쿠키를 파싱하기 위한 미들웨어
import compression from "compression"; // 응답 데이터를 압축하여 전송하기 위한 미들웨어
import cors from "cors"; // Cross-Origin Resource Sharing (CORS) 설정을 위한 미들웨어
import swaggerUI from "swagger-ui-express"; // Swagger UI를 Express에 통합하기 위한 모듈
import swaggerDocument from "@data/swagger.json"; // Swagger 문서 JSON 파일
import { connectDB } from "@utils"; // 데이터베이스 연결을 위한 유틸리티 함수
import { errorHandler } from "@middlewares"; // 에러 처리 미들웨어
import routes from "@routes"; // 라우팅 처리 모듈
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

dotenv.config({ path: ".env.development.local" }); // .env.development.local 파일에 정의된 환경 변수 로드

const app = express(); // Express 애플리케이션 인스턴스 생성

// Swagger UI를 /swagger 경로에서 사용할 수 있도록 설정
app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
// Swagger UI 페이지는 API 문서화를 돕기 위해 사용됨

// CORS 설정 (클라이언트와 서버 간의 크로스 도메인 요청을 허용)
app.use(
  cors({
    origin: process.env.BASE_URL, // 허용할 클라이언트 도메인 (환경 변수에서 로드)
    methods: ["GET, POST, PUT, PATCH, DELETE"], // 허용할 HTTP 메서드
    credentials: true, // 쿠키 및 인증 정보를 포함한 요청 허용
  })
);

// JSON 데이터 파싱 미들웨어 (요청 본문에 JSON 데이터가 있을 때 처리)
app.use(express.json({ limit: "10mb" })); // 요청 본문의 JSON 데이터를 파싱, 크기 제한은 10MB

// URL-encoded 데이터 파싱 미들웨어 (폼 데이터 처리용)
app.use(express.urlencoded({ limit: "10mb", extended: true })); // URL-encoded 데이터를 파싱, 객체 형식 허용

// 응답 데이터 압축 미들웨어 (클라이언트로 보내는 응답 데이터를 압축)
app.use(compression()); // 클라이언트로 보내는 응답 데이터를 gzip으로 압축하여 성능 향상

// 쿠키 파싱 미들웨어 (클라이언트의 쿠키를 쉽게 다루기 위해)
app.use(cookieParser()); // 클라이언트에서 보낸 쿠키를 req.cookies 객체에 저장

// 데이터베이스 연결 (MongoDB와 같은 데이터베이스 연결 함수)
connectDB(); // 데이터베이스에 연결 (예: MongoDB)

// 서버 포트 설정 (환경 변수에서 포트를 설정하거나 기본값 3000번 사용)
const PORT = process.env.PORT || 3000; // 기본 포트 3000번 사용, 환경 변수에서 포트를 설정할 수 있음

// 서버 시작 (서버가 실행될 포트를 설정)
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에 연결됨`); // 서버가 실행되었음을 알림
});

// 라우팅 설정 (기본 경로에 라우터를 설정)
app.use("/", routes()); // 기본 경로에서 라우터를 설정

// 에러 처리 미들웨어 설정 (모든 요청 후에 에러를 처리)
app.use(errorHandler); // 에러가 발생한 경우 에러 처리 미들웨어로 전달
