import { transporter } from "../utils/transporter";

const sendEmail = async (email: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `PlayGround Team <${process.env.NODEMAILER_USER}>`,
      to: email,
      subject,
      html,
    });

    return info;
  } catch (error: any) {
    console.error("[sendEmail] Error:", error.message, {
      stack: error.stack,
    });

    // 이메일 전송 실패 시 에러 처리
    if (error.code === "ENOTFOUND") {
      throw new Error("SMTP 서버에 연결할 수 없습니다.");
    } else if (error.responseCode && error.responseCode === 550) {
      // responseCode가 없다면 조건을 피해갈 수 있으므로 추가 조건을 체크
      throw new Error(
        "이메일 전송 실패: 수신자의 이메일 서버에서 거부되었습니다."
      );
    } else if (error.responseCode && error.responseCode === 421) {
      throw new Error("서버 과부하로 이메일 전송 실패.");
    } else if (error.code === "ECONNREFUSED") {
      // 연결 거부 오류 처리
      throw new Error("이메일 서버 연결이 거부되었습니다.");
    } else if (error.code === "ETIMEDOUT") {
      // 연결 시간 초과 오류 처리
      throw new Error("이메일 서버 연결 시간 초과.");
    } else {
      // 알 수 없는 오류 처리
      throw new Error("알 수 없는 오류가 발생했습니다.");
    }
  }
};

export { sendEmail };
