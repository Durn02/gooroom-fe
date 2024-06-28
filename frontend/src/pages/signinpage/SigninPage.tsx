import React from "react";
import { Link } from "react-router-dom";
import DefaultButton from "../../components/button/DefaultButton";

export default function Signin() {
  const onClickHandler = () => {
    alert("로그인 버튼 클릭함");
  };
  return (
    <>
      <Link to={"/"}>
        <DefaultButton placeholder="메인화면으로" />
      </Link>
      <div>로그인 페이지</div>
      <div>
        <input type="text" placeholder="아이디" />
      </div>
      <div>
        <input type="password" placeholder="비밀번호" />
      </div>

      <DefaultButton placeholder="로그인" onClick={() => onClickHandler()} />
    </>
  );
}
