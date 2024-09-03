import React from "react";
import style from "./VerifyInput.module.css";

interface props {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onClick: () => void;
}

const VerifyInput = ({ placeholder, value, onChange, onClick }: props) => {
  return (
    <>
      <div className={style.verifyInputContainer}>
        <input
          className={style.inputContainer}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        ></input>

        <div className={style.verifyButtonContainer}>
          <button className={style.verifyButton} onClick={() => onClick()}>
            인증하기
          </button>
        </div>
      </div>
    </>
  );
};

export default VerifyInput;
