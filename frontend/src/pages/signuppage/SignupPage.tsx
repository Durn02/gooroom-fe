import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import DefaultButton from "../../components/Button/DefaultButton";
import Input from "../../components/Input/DefaultInput";
import PwInput from "../../components/Input/PwInput/PwInput";
import style from "./SignupPage.module.css";

type SignupRequestData = {
  email: string;
  password: string;
  concern: string[];
  nickname: string;
  username: string;
};

export default function Signup() {
  const onSignupClickHandler = async () => {
    const concernArray = userConcernInput.split(",").map((item) => item.trim());

    const requesData: SignupRequestData = {
      email: userIdInput,
      password: userPwInput,
      concern: concernArray,
      nickname: userNicknameInput,
      username: usernameInput,
    };

    try {
      console.log(requesData);

      const response = await fetch("http://localhost:8000/domain/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requesData),
      });

      if (!response.ok) {
        throw new Error("server no response");
      }

      const responseData = await response.json();
      alert(`Signup successful: ${responseData.message}`);
    } catch (error) {
      if (error instanceof Error) {
        alert(`Signup failed: ${error.message}`);
      } else {
        alert("Signup failed: An unknown error occurred.");
      }
    }
  };

  const [userIdInput, setUserIdInput] = useState("");
  const [userPwInput, setUserPwInput] = useState("");
  const [userConcernInput, setUserConcernInput] = useState("");
  const [userNicknameInput, setUserNicknameInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");

  return (
    <>
      <div className={style.goHomeButtonContainer}>
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
        <p>Current Content: {userIdInput}</p>
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

      <div className={style.pwInputContainer}>
        <Input
          placeholder="concern"
          value={userConcernInput}
          onChange={(e) => {
            setUserConcernInput(e);
          }}
        />
      </div>

      <div className={style.nicknameInputContainer}>
        <Input
          placeholder="nickname"
          value={userNicknameInput}
          onChange={(e) => setUserNicknameInput(e)}
        />
      </div>

      <div className={style.usernameInputContainer}>
        <Input
          placeholder="username"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e)}
        />
      </div>

      <div className={style.signUpButtonContainer}>
        <DefaultButton
          placeholder="회원가입!"
          onClick={() => onSignupClickHandler()}
        />
      </div>
    </>
  );
}
