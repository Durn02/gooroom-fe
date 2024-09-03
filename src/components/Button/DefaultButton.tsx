import React from "react";
import style from "./DefaultButton.module.css";

interface Props {
  onClick?: () => void;
  placeholder: string;
}

const DefaultButton = ({ onClick, placeholder }: Props) => {
  return (
    <button className={style.defaultButton} onClick={onClick}>
      {placeholder}
    </button>
  );
};

export default DefaultButton;
