interface IApiResponse {
  success: boolean;
  message: string;
  code: Uppercase<string>; // 항상 대문자로 변환되도록 설정
  timestamp: string; // 응답 시간
  requestId?: string; // 요청 추적 ID
}

interface IApiSuccessResponse<T = null> extends IApiResponse {
  data?: T; // 데이터 (선택적)
  meta?: any; // 메타데이터 (선택적)
}

interface IApiErrorResponse extends IApiResponse {
  errorDetails?: any;
}

export type { IApiResponse, IApiSuccessResponse, IApiErrorResponse };
