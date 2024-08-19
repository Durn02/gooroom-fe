import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import DefaultButton from "../../components/Button/DefaultButton";
import style from "./LandingPage.module.css";

export default function Landing() {
  const verifyAccessToken = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/domain/auth/verify-access-token",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // 쿠키를 포함시키기 위해 필요
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.message === "access token validation check successfull") {
          // 서버가 보낸 메시지에 따라 조건 수정
          window.location.href = "/main";
        }
      } else {
        const refresh_response = await fetch(
          "http://localhost:8000/domain/auth/refresh-acc-token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (refresh_response.ok) {
          window.location.href = "/main";
        }
      }
    } catch (error) {
      alert("unknown error occurred");
    }
  };

  useEffect(() => {
    verifyAccessToken();
  }, []);

  return (
    <>
      <div>gooroom에 오신 것을 환영합니다</div>
      <div className={style.toSignInPageButtonContainer}>
        <Link to={"signin"}>
          <DefaultButton placeholder="로그인 페이지로" />
        </Link>
      </div>
      <div className={style.toSignUpPageButtonContainer}>
        <Link to={"signup"}>
          <DefaultButton placeholder="회원가입 페이지로" />
        </Link>
      </div>
      <div className={style.toMainPageButtonContainer}>
        <Link to={"main"}>
          <DefaultButton placeholder="메인 페이지로" />
        </Link>
      </div>
    </>
  );
}
