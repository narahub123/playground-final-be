import { Request, Response, NextFunction } from "express"; // Express의 Request, Response, NextFunction 타입을 가져옵니다.

// 비동기 함수의 에러 처리를 위한 wrapper 함수
const asyncWrapper = (
  name: string, // 함수 이름을 전달받습니다. 에러 발생 시 이 이름을 출력할 때 사용
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any> // 비동기 처리를 위한 함수. Express의 Request, Response, NextFunction을 받으며, Promise를 반환하는 함수입니다.
) => {
  // 반환되는 함수는 Express 미들웨어 함수로 사용됩니다.
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 비동기 함수 fn을 실행합니다. await를 사용하여 비동기적으로 실행합니다.
      await fn(req, res, next);
    } catch (err: any) {
      // 에러가 발생하면 에러 메시지와 함께 함수 이름을 출력합니다.
      console.log(`${name}에서 에러 발생`, err);

      // 에러가 발생했을 때, 다음 미들웨어로 에러를 전달합니다.
      next(err);
    }
  };
};

// asyncWrapper를 다른 파일에서 사용할 수 있도록 기본 내보내기(export)
export default asyncWrapper;
