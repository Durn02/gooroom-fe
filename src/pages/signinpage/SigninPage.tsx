import React, { useContext } from "react";
import { Link } from "react-router-dom";
import DefaultButton from "../../components/Button/DefaultButton";
import style from "./SigninPage.module.css";
import Input from "../../components/Input/DefaultInput";
import PwInput from "../../components/Input/PwInput/PwInput";
import { useState, useEffect } from "react";
import { IsLoginContext } from "../../shared/IsLoginContext";
import getAPIURL from "../../utils/getAPIURL";

type signinRequestData = {
  email: string;
  password: string;
};
type VerifyCodeRequestData = {
  verifycode: string;
  email: string;
};
type VerifyRequestData = {
  email: string;
};
const APIURL = getAPIURL();

export default function Signin() {
  console.log(APIURL);
  const [emailVerification, setEmailVerification] = useState(false);

  const onSignInButtonClickHandler = () => {
    const signinRequestData: signinRequestData = {
      email: userEmailInput,
      password: userPwInput,
    };

    if (!userEmailInput) {
      alert("이메일을 입력해주세요");
    } else if (!userPwInput) {
      alert("비밀번호를 입력해주세요");
    } else {
      try {
        fetch(`${APIURL}/domain/auth/signin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(signinRequestData),
          credentials: "include",
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data.message);
            if (data.detail === "not registered email") {
              alert("가입되지 않은 이메일입니다");
            } else if (data.detail === "not verified email") {
              alert("이메일 인증을 해주세요");
              setEmailVerification(true);
            } else if (data.detail === "inconsistent password") {
              alert("비밀번호가 일치하지 않습니다");
            } else if (data.message === "login success") {
              sessionStorage.setItem("userId", userEmailInput);
              alert("로그인 성공");
              window.location.replace("/");
            } else {
              alert("알 수 없는 이유로 로그인에 실패했습니다");
            }
          });
      } catch (e) {
        alert(e);
      }
    }
  };
  const onVerifyButtonClickHandler = async () => {
    const verifyCodeRequest: VerifyCodeRequestData = {
      verifycode: userVerifyInput,
      email: userEmailInput,
    };

    try {
      const response = await fetch(`${APIURL}/domain/auth/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verifyCodeRequest),
      });
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
  const onResendVerifyButtonClickHandler = async () => {
    const verifyRequest: VerifyRequestData = {
      email: userEmailInput,
    };
    try {
      const verifyResponse = await fetch(
        `${APIURL}/domain/auth/send-verification-code`,
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
  };
  const [userEmailInput, setUserEmailInput] = useState("");
  const [userPwInput, setUserPwInput] = useState("");
  const [userVerifyInput, setUserVerifyCodeInput] = useState("");
  const isLoggedin = useContext(IsLoginContext);
  // 로그인이 되어있는지 확인하는 useEffect
  // 로그인이 되어있으면 alert을 띄우고 메인페이지로 이동
  useEffect(() => {
    const checkLogin = async () => {
      if (isLoggedin.isLogin) {
        alert("이미 로그인 되어있습니다.");
        window.location.replace("/");
      } else {
        try {
          const response = await fetch(
            `${APIURL}/domain/auth/verify-access-token`,
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
      }
    };

    checkLogin();
  }, []);

  return (
    <>
      <div className={style.toMainPageButtonContainer}>
        <Link to={"/"}>
          <DefaultButton placeholder="랜딩화면으로" />
        </Link>
      </div>

      <div>로그인 페이지</div>

      <div className={style.idInputContainer}>
        <Input
          placeholder="email"
          value={userEmailInput}
          onChange={(e) => setUserEmailInput(e)}
          onEnter={onSignInButtonClickHandler}
        />
      </div>

      <div className={style.pwInputContainer}>
        <PwInput
          placeholder="password"
          value={userPwInput}
          onChange={(e) => {
            setUserPwInput(e);
          }}
          onEnter={onSignInButtonClickHandler}
        />
      </div>

      {emailVerification && (
        <>
          <div className={style.VerifyInputContainer}>
            <Input
              placeholder="인증번호 입력"
              value={userVerifyInput}
              onChange={(e) => {
                setUserVerifyCodeInput(e);
              }}
            />
          </div>
          <div className={style.resendVerificationCodeButtonContainer}>
            <DefaultButton
              placeholder="인증번호 재전송"
              onClick={() => {
                alert("인증번호 재전송");
                onResendVerifyButtonClickHandler();
              }}
            />
          </div>
          <div className={style.verifyButtonContainer}>
            <DefaultButton
              placeholder="인증하기"
              onClick={() => onVerifyButtonClickHandler()}
            />
          </div>
        </>
      )}

      <div className={style.signInButtonContainer}>
        <DefaultButton
          placeholder="로그인!"
          onClick={() => onSignInButtonClickHandler()}
        />
      </div>
    </>
  );
}
