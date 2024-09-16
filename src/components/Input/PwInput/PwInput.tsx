import React from "react";
import { useState } from "react";
import style from "./PwInput.module.css";

interface props {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
}

const PwInput = ({ placeholder, value, onChange, onEnter }: props) => {
  const [setShow, setShowState] = useState("password");
  const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onEnter && e.key === "Enter") {
      onEnter();
    }
  };

  return (
    <div className={style.pwInputContainer}>
      <input
        className={style.inputContainer}
        type={setShow}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handlePressEnter}
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
