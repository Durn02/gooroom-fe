import React from "react";
import { Link } from "react-router-dom";
import DefaultButton from "../../components/Button/DefaultButton";
import style from "./SigninPage.module.css";
import Input from "../../components/Input/DefaultInput";
import PwInput from "../../components/Input/PwInput/PwInput";
import { useState } from "react";

export default function Signin() {
  const onClickHandler = () => {
    alert(userIdInput + userPwInput);
  };
  const [userIdInput, setUserIdInput] = useState("");
  const [userPwInput, setUserPwInput] = useState("");

  return (
    <>
      <div className={style.toMainPageButtonContainer}>
        <Link to={"/"}>
          <DefaultButton placeholder="메인화면으로" />
        </Link>
      </div>

      <div>로그인 페이지</div>

      <div className={style.idInputContainer}>
        <Input
          placeholder="email"
          value={userIdInput}
          onChange={(e) => setUserIdInput(e)}
        />
      </div>

      <div className={style.pwInputContainer}>
        <PwInput
          placeholder="password"
          value={userPwInput}
          onChange={(e) => {
            setUserPwInput(e);
          }}
        />
      </div>

      <div className={style.signInButtonContainer}>
        <DefaultButton placeholder="로그인!" onClick={() => onClickHandler()} />
      </div>
    </>
  );
}
