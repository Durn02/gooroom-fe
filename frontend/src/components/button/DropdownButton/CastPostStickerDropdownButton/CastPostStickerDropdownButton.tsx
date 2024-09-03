import React, { useState, MouseEvent } from "react";
import styles from "./CastPostStickerDropdownButton.module.css";

interface CastPostStickerDropdownButtonProps {
  cast_fuction: (cast_message: string) => void;
}

const CastPostStickerDropdownButton: React.FC<
  CastPostStickerDropdownButtonProps
> = ({ cast_fuction }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    const selectedOption = (event.target as HTMLButtonElement).innerText;

    if (selectedOption === "C") {
      const message = prompt("Please enter your message:");
      if (message) {
        cast_fuction(message);
      }
    }
  };

  return (
    <div className={styles.toggleContainer}>
      <button
        className={`${styles.toggleButton} ${isOpen ? styles.open : ""}`}
        onClick={handleClick}
      >
        {isOpen ? "-" : "+"}
      </button>
      <div className={`${styles.dropdown} ${isOpen ? styles.show : ""}`}>
        <button className={styles.dropdownItem} onClick={handleButtonClick}>
          A
        </button>
        <button className={styles.dropdownItem} onClick={handleButtonClick}>
          B
        </button>
        <button className={styles.dropdownItem} onClick={handleButtonClick}>
          C
        </button>
      </div>
    </div>
  );
};

export default CastPostStickerDropdownButton;
