import React, { useEffect } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import DefaultButton from "../../components/Button/DefaultButton";
import Input from "../../components/Input/DefaultInput";
import VerifyInput from "../../components/Input/VerifyInput/VerifyInput";
import PwInput from "../../components/Input/PwInput/PwInput";
import style from "./SignupPage.module.css";

// ~RequestData는 python backend에서 요구하는 형식과 맞춰야함
type SignupRequestData = {
  email: string;
  password: string;
  concern: string[];
  nickname: string;
  username: string;
};
type VerificationCodeRequestData = {
  email: string;
};
type SendVerificationCodeRequestData = {
  verifycode: string;
  email: string;
};

export default function Signup() {
  const [userEmailInput, setEmailInput] = useState<string>("");
  const [userPwInput, setUserPwInput] = useState<string>("");
  const [userConcernInput, setUserConcernInput] = useState<string>("");
  const [userNicknameInput, setUserNicknameInput] = useState<string>("");
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [userVerificationCodeInput, setUserVerificationCodeInput] =
    useState<string>("");
  const [showVerifyIntputBox, setShowVerifyInputBox] = useState<boolean>(false);

  const onSignupClickHandler = async () => {
    const signupRequestData: SignupRequestData = {
      email: userEmailInput,
      password: userPwInput,
      concern: userConcernInput.split(",").map((item) => item.trim()),
      nickname: userNicknameInput,
      username: usernameInput,
    };
    const verificationCodeRequest: VerificationCodeRequestData = {
      email: userEmailInput,
    };

    if (
      userEmailInput === "" ||
      userPwInput === "" ||
      userNicknameInput === "" ||
      usernameInput === ""
    ) {
      alert("모든 항목을 입력해주세요");
    } else {
      try {
        const signupResponse = await fetch(
          "http://localhost:8000/domain/auth/signup",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(signupRequestData),
          }
        );

        if (signupResponse.ok) {
          setShowVerifyInputBox(true);

          try {
            const verifyResponse = await fetch(
              "http://localhost:8000/domain/auth/send-verification-code",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(verificationCodeRequest),
              }
            );
            if (!verifyResponse.ok) {
              throw new Error("server no response");
            }
          } catch (error) {
            if (error instanceof Error) {
              alert(`Verify failed: ${error.message}`);
            } else {
              alert("Verify failed: unknown error occurred.");
            }
          }
        } else {
          alert("회원가입 실패");
        }
      } catch (error) {
        if (error instanceof Error) {
          alert(`Signup failed: ${error.message}`);
        } else {
          alert("Signup failed: unknown error occurred.");
        }
      }
    }
  };

  const onVerifyClickHandler = async () => {
    const sendVerificationCodeRequest: SendVerificationCodeRequestData = {
      verifycode: userVerificationCodeInput,
      email: userEmailInput,
    };

    try {
      const response = await fetch(
        "http://localhost:8000/domain/auth/verify-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sendVerificationCodeRequest),
        }
      );
      if (response.ok) {
        alert("Verify successful");
        window.location.replace("/");
      } else {
        alert(`Verify failed: ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`Verify failed: ${error.message}`);
      }
    }
  };

  // 로그인이 되어있는지 확인하는 useEffect
  // 로그인이 되어있으면 alert을 띄우고 메인페이지로 이동
  useEffect(() => {
    const checkLogin = async () => {
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
            alert("이미 로그인 되어있습니다.");
            window.location.replace("/");
          }
        }
      } catch (error) {
        alert(error);
      }
    };
    checkLogin();
  }, []);

  return (
    <>
      <div className={style.goHomeButtonContainer}>
        <Link to={"/"}>
          <DefaultButton placeholder="랜딩화면으로" />
        </Link>
      </div>
      <div>회원가입 페이지</div>
      <div className={style.emailInputContainer}>
        <Input
          placeholder="email"
          value={userEmailInput}
          onChange={(e) => setEmailInput(e)}
        />
        <p>Current Content: {userEmailInput}</p>
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
      {showVerifyIntputBox && (
        <div>
          <div className={style.verifyInputContainer}>
            <VerifyInput
              placeholder="인증번호"
              value={userVerificationCodeInput}
              onChange={(e) => {
                setUserVerificationCodeInput(e);
              }}
              onClick={() => onVerifyClickHandler()}
            />
          </div>
        </div>
      )}
      {!showVerifyIntputBox && (
        <div className={style.signUpButtonContainer}>
          <DefaultButton
            placeholder="회원가입!"
            onClick={() => onSignupClickHandler()}
          />
        </div>
      )}
    </>
  );
}
