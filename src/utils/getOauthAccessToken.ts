import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  KAKAO_REDIRECT_URI,
  KAKAO_REST_API_KEY,
  NAVER_CLIENT_ID,
  NAVER_CLIENT_SECRET,
  NAVER_REDIRECT_URI,
} from "@constants";
import { OauthType } from "@types";

/**
 * 주어진 OAuth 코드와 타입에 따라 액세스 토큰을 발급받는 함수
 *
 * 이 함수는 제공된 authorization code와 OAuth 타입에 따라 액세스 토큰을 요청합니다.
 * - 'google', 'kakao', 'naver' 타입에 대해서만 요청을 처리합니다.
 *
 * @param {string | null} code - OAuth 인증을 완료한 후 제공받은 authorization code
 * @param {OauthType | null} type - OAuth 제공자의 타입 (예: 'google', 'kakao', 'naver')
 * @returns {Promise<string | undefined>} - 발급된 액세스 토큰을 반환하거나 실패 시 undefined
 * @throws {Error} - 엑세스 토큰 발급 실패 시 에러를 발생시킴
 */
const getOauthAccessToken = async (
  code: string | null,
  type: OauthType | null
): Promise<string | undefined> => {
  // code와 type이 유효하지 않으면 함수 종료
  if (!code || !type) return;

  try {
    let requestUrl = ""; // 요청할 URL을 저장할 변수
    let requestBody: Record<string, string>; // 요청 본문을 저장할 변수
    let header = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    // 'google' 타입에 대한 처리
    if (type === "google") {
      requestUrl = "https://oauth2.googleapis.com/token"; // Google OAuth 토큰 요청 URL

      // 요청 본문에 필요한 파라미터 설정
      requestBody = {
        grant_type: "authorization_code", // 인증 코드 요청
        client_id: GOOGLE_CLIENT_ID, // Google OAuth 클라이언트 ID
        client_secret: GOOGLE_CLIENT_SECRET, // Google OAuth 클라이언트 비밀
        redirect_uri: GOOGLE_REDIRECT_URI, // 리디렉션 URI
        code, // 인증 코드
      };
    } else if (type === "kakao") {
      requestUrl = "https://kauth.kakao.com/oauth/token"; // Kakao OAuth 토큰 요청 URL

      // 요청 본문에 필요한 파라미터 설정
      requestBody = {
        grant_type: "authorization_code", // 인증 코드 요청
        client_id: KAKAO_REST_API_KEY, // Kakao OAuth 클라이언트 ID
        redirect_uri: KAKAO_REDIRECT_URI, // 리디렉션 URI
        code, // 인증 코드
      };
    } else if (type === "naver") {
      requestUrl = "https://nid.naver.com/oauth2.0/token"; // Naver OAuth 토큰 요청 URL

      // 요청 본문에 필요한 파라미터 설정
      requestBody = {
        grant_type: "authorization_code", // 인증 코드 요청
        client_id: NAVER_CLIENT_ID, // Naver OAuth 클라이언트 ID
        client_secret: NAVER_CLIENT_SECRET, // Naver OAuth 클라이언트 비밀
        redirect_uri: NAVER_REDIRECT_URI, // 리디렉션 URI
        code, // 인증 코드
        state: type, // OAuth state
      };

      // Naver OAuth에서 필요한 추가 헤더 설정
      interface CustomHeaders {
        "Content-Type": string;
        "X-Naver-Client-Id"?: string;
        "X-Naver-Client-Secret"?: string;
      }

      header = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
      } as CustomHeaders;
    } else {
      // 지원되지 않는 OAuth 타입일 경우 에러 발생
      throw new Error("지원되지 않는 OAuth 타입입니다.");
    }

    // 액세스 토큰 요청
    const response = await fetch(requestUrl, {
      method: "POST", // POST 요청
      headers: header, // 요청 헤더 설정
      body: new URLSearchParams(requestBody).toString(), // 요청 본문을 URLSearchParams로 인코딩하여 전송
    });

    // 응답이 실패했을 경우 에러 처리
    if (!response.ok) {
      const errorText = await response.text(); // 응답 본문을 텍스트로 가져오기
      console.error(`Error: ${response.status}, ${errorText}`);
      throw new Error("엑세스 토큰 취득 실패");
    }

    // 응답을 JSON 형태로 파싱
    const res = await response.json();

    // 응답에 액세스 토큰이 포함되지 않으면 에러 발생
    if (!res.access_token) {
      throw new Error("엑세스 토큰 취득 실패");
    }

    // 액세스 토큰만 반환
    return res.access_token;
  } catch (error) {
    // 에러 발생 시 콘솔에 로그 출력하고 에러를 호출 측으로 재발생시킴
    console.error("엑세스 토큰 발급 중 에러:", error);
    throw error; // 재발생시켜 호출 측에서 에러를 처리하도록 함
  }
};

export default getOauthAccessToken;
