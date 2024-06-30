import React from "react";
import { Link } from "react-router-dom";
import DefaultButton from "../../components/button/DefaultButton";
// import style from "./LandingPage.module.css";

export default function Landing() {
  return (
    <>
      <div>gooroom에 오신 것을 환영합니다</div>
      <Link to={"signin"}>
        <DefaultButton placeholder="로그인 페이지로" />
      </Link>
    </>
  );
}
