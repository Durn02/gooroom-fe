import React from "react";
import { Link } from "react-router-dom";
import DefaultButton from "../../components/Button/DefaultButton";
import style from "./LandingPage.module.css";

export default function Landing() {
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
