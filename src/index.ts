import express from "express"; // Express 모듈을 가져옴 (서버 애플리케이션 생성용)
import dotenv from "dotenv"; // 환경 변수 관리를 위한 dotenv 모듈
import cookieParser from "cookie-parser"; // 요청의 쿠키를 파싱하기 위한 미들웨어
import compression from "compression"; // 응답 데이터를 압축하여 전송하기 위한 미들웨어
import cors from "cors"; // Cross-Origin Resource Sharing (CORS) 설정을 위한 미들웨어

dotenv.config(); // .env 파일에 정의된 환경 변수 로드

const app = express(); // Express 애플리케이션 인스턴스 생성

// CORS 설정
app.use(
  cors({
    origin: process.env.BASE_URL, // 허용할 클라이언트 도메인
    methods: ["GET, POST, PUT, PATCH, DELETE"], // 허용할 HTTP 메서드
    credentials: true, // 쿠키 및 인증 정보를 포함한 요청 허용
  })
);

// JSON 및 URL-encoded 데이터 파싱 미들웨어
app.use(express.json({ limit: "10mb" })); // 요청 본문의 JSON 데이터를 파싱, 크기 제한은 10MB
app.use(express.urlencoded({ limit: "10mb", extended: true })); // URL-encoded 데이터를 파싱, 객체 형식 허용

// 응답 데이터 압축 미들웨어
app.use(compression()); // 클라이언트로 보내는 응답 데이터를 gzip으로 압축

// 쿠키 파싱 미들웨어
app.use(cookieParser()); // 클라이언트에서 보낸 쿠키를 req.cookies 객체에 저장

// 서버 포트 설정
const PORT = process.env.PORT || 3000; // 기본 포트 3000번 사용

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에 연결됨`); // 서버가 실행되었음을 알림
});
