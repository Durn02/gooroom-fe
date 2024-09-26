import React from "react";
import style from "./DefaultInput.module.css";

interface props {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
}

const Input = ({ placeholder, value, onChange, onEnter }: props) => {
  const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onEnter && e.key === "Enter") {
      onEnter();
    }
  };

  return (
    <input
      className={style.input}
      type="input"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handlePressEnter}
    ></input>
  );
};

export default Input;
