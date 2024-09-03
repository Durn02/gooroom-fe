import React from "react";
import style from "./DefaultInput.module.css";

interface props {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

const Input = ({ placeholder, value, onChange }: props) => {
  return (
    <input
      className={style.input}
      type="input"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    ></input>
  );
};

export default Input;
