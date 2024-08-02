import React from "react";
import { useState } from "react";
import style from "./PwInput.module.css";

interface props {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

const PwInput = ({ placeholder, value, onChange }: props) => {
  const [setShow, setShowState] = useState("password");

  return (
    <div className={style.pwInputContainer}>
      <input
        className={style.inputContainer}
        type={setShow}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      ></input>

      <div className={style.pwShowButtonContainer}>
        <button
          className={style.pwShowButton}
          onMouseDown={() => {
            setShowState("text");
          }}
          onMouseUp={() => {
            setShowState("password");
          }}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default PwInput;
