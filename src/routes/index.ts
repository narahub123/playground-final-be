import express from "express";
import userRouter from "./user.router";
import signupRouter from "./signup.router";
import oauthRouter from "./oauth.router";
import loginRouter from "./login.router";

// express.Router() 인스턴스를 생성합니다.
const router = express.Router();

// 이 함수는 새로운 express.Router() 인스턴스를 반환합니다.
// 반환된 라우터는 다른 모듈에서 사용될 수 있습니다.
export default (): express.Router => {
  userRouter(router);
  signupRouter(router);
  oauthRouter(router);
  loginRouter(router);
  return router; // 라우터 인스턴스를 반환
};
