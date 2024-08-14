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
type VerifyRequestData = {
  email: string;
};
type VerifyCodeRequestData = {
  verifycode: string;
  email: string;
};

export default function Signup() {
  const [userEmailInput, setEmailInput] = useState("");
  const [userPwInput, setUserPwInput] = useState("");
  const [userConcernInput, setUserConcernInput] = useState("");
  const [userNicknameInput, setUserNicknameInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [userVerifyInput, setUserVerifyInput] = useState("");
  const [showVerifyButton, setShowVerifyButton] = useState<boolean>(false);

  const onSignupClickHandler = async () => {
    const signupRequestData: SignupRequestData = {
      email: userEmailInput,
      password: userPwInput,
      concern: userConcernInput.split(",").map((item) => item.trim()),
      nickname: userNicknameInput,
      username: usernameInput,
    };
    const verifyRequest: VerifyRequestData = {
      email: userEmailInput,
    };
    try {
      await fetch("http://localhost:8000/domain/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupRequestData),
      }).then(async () => {
        setShowVerifyButton(true);

        try {
          const verifyResponse = await fetch(
            "http://localhost:8000/domain/auth/send-verification-code",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(verifyRequest),
            }
          );
          if (!verifyResponse.ok) {
            throw new Error("server no response");
          }
        } catch (error) {
          if (error instanceof Error) {
            alert(`Verify failed: ${error.message}`);
          } else {
            alert("Verify failed: An unknown error occurred.");
          }
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        alert(`Signup failed: ${error.message}`);
      } else {
        alert("Signup failed: An unknown error occurred.");
      }
    }
  };
  const onVerifyClickHandler = async () => {
    const verifyCodeRequest: VerifyCodeRequestData = {
      verifycode: userVerifyInput,
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
          body: JSON.stringify(verifyCodeRequest),
        }
      );
      if (response.ok) {
        alert("Verify successful");
        window.location.href = "/";
      } else {
        alert(`Verify failed: ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`Verify failed: ${error.message}`);
      }
    }
  };

  return (
    <>
      <div className={style.goHomeButtonContainer}>
        <Link to={"/"}>
          <DefaultButton placeholder="메인화면으로" />
        </Link>
      </div>
      <div>로그인 페이지</div>
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
      {showVerifyButton && (
        <div>
          <div className={style.verifyInputContainer}>
            <Input
              placeholder="인증번호"
              value={userVerifyInput}
              onChange={(e) => {
                setUserVerifyInput(e);
              }}
            />
          </div>
          <div className={style.verifyButtonContainer}>
            <DefaultButton
              placeholder="인증하기"
              onClick={() => onVerifyClickHandler()}
            />
          </div>
        </div>
      )}
      <div className={style.signUpButtonContainer}>
        <DefaultButton
          placeholder="회원가입!"
          onClick={() => onSignupClickHandler()}
        />
      </div>
    </>
  );
}
