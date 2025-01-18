import { OauthType, UserData } from "@types";

/**
 * 주어진 OAuth 토큰을 사용하여 사용자 정보를 가져오는 함수
 * - Google, Kakao, Naver에 대해서만 사용자 정보를 요청할 수 있음
 *
 * @param {string} token - OAuth 인증을 통해 받은 액세스 토큰
 * @param {OauthType} type - OAuth 제공자의 타입 (google, kakao, naver)
 * @returns {Promise<UserData | undefined>} - 사용자 정보 (이메일, 사용자명, 프로필 이미지) 또는 undefined
 * @throws {Error} - 요청된 서비스의 사용자 정보를 처리하는 중 오류 발생 시 예외를 던짐
 */
const getOauthUserInfo = async (
  token: string,
  type: OauthType
): Promise<UserData | undefined> => {
  // 토큰이나 타입이 없으면 함수 종료
  if (!token || !type) return;

  try {
    let requestUrl = ""; // 요청할 URL을 저장할 변수
    let userData: UserData | undefined; // 사용자 정보를 저장할 변수

    // OAuth 타입에 따라 요청 URL 설정
    if (type === "google") {
      requestUrl = "https://www.googleapis.com/userinfo/v2/me"; // Google API의 사용자 정보 요청 URL
    } else if (type === "kakao") {
      requestUrl = "https://kapi.kakao.com/v2/user/me"; // Kakao API의 사용자 정보 요청 URL
    } else if (type === "naver") {
      requestUrl = "https://openapi.naver.com/v1/nid/me"; // Naver API의 사용자 정보 요청 URL
    } else {
      throw new Error("지원되지 않는 OAuth 타입입니다."); // 지원되지 않는 OAuth 타입일 경우 예외 처리
    }

    // 사용자 정보 요청
    const response = await fetch(requestUrl, {
      method: "GET", // GET 방식으로 요청
      headers: {
        Authorization: `Bearer ${token}`, // Authorization 헤더에 Bearer 토큰 포함
      },
    });

    // 응답이 실패했을 경우 처리
    if (!response.ok) {
      const errorText = await response.text(); // 응답 본문을 텍스트로 확인
      console.error(`Error: ${response.status}, ${errorText}`);
      throw new Error("사용자 정보 취득 실패");
    }

    // 응답을 JSON 형식으로 파싱
    const res = await response.json();

    // OAuth 타입에 따라 응답 데이터를 처리
    if (type === "google") {
      const { email, name, picture } = res; // Google 응답 데이터에서 필요한 정보 추출
      userData = {
        email,
        username: name,
        profileImage: picture,
      };
    } else if (type === "kakao") {
      const { kakao_account } = res; // Kakao 응답 데이터에서 필요한 정보 추출
      const { email, profile } = kakao_account;
      const { nickname, profile_image_url } = profile;

      userData = {
        email,
        username: nickname,
        profileImage: profile_image_url,
      };
    } else if (type === "naver") {
      const {
        nickname,
        profile_image,
        gender,
        email,
        mobile_e164,
        birthday,
        birthyear,
      } = res.response; // Naver 응답 데이터에서 필요한 정보 추출

      // 생일 정보가 있을 경우, 형식을 맞춰서 birth 값 설정
      const birth =
        birthday && birthyear
          ? birthyear + birthday.replace("-", "")
          : undefined;

      userData = {
        email,
        username: nickname,
        profileImage: profile_image,
        gender,
        phone: mobile_e164,
        birth,
      };
    }

    return userData; // 사용자 정보 반환
  } catch (error) {
    // 에러 발생 시 로그 출력하고 예외 던짐
    console.log(error);
    throw new Error("사용자 정보 처리 중 에러 발생");
  }
};

export default getOauthUserInfo;
