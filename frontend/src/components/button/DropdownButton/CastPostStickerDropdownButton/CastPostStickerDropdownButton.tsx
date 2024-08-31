import React, { useState } from "react";
import styles from "./CastPostStickerDropdownButton.module.css";

const CastPostStickerDropdownButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
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
        <button className={styles.dropdownItem}>A</button>
        <button className={styles.dropdownItem}>B</button>
        <button className={styles.dropdownItem}>C</button>
      </div>
    </div>
  );
};

export default CastPostStickerDropdownButton;
