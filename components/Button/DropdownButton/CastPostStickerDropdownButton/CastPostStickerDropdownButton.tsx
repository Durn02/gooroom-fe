import React, { useState, MouseEvent } from 'react';
import styles from './CastPostStickerDropdownButton.module.css';

interface CastPostStickerDropdownButtonProps {
  cast_fuction?: () => void;
}

const CastPostStickerDropdownButton: React.FC<CastPostStickerDropdownButtonProps> = ({ cast_fuction }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    const selectedOption = event.currentTarget.id;

    if (selectedOption === 'cast') {
      cast_fuction();
    }
  };

  return (
    <div className={styles.toggleContainer}>
      <button className={`${styles.toggleButton} ${isOpen ? styles.open : ''}`} onClick={handleClick}>
        {isOpen ? '-' : '+'}
      </button>
      <div className={`${styles.dropdown} ${isOpen ? styles.show : ''}`}>
        <button className={styles.dropdownItem} onClick={handleButtonClick} id="post">
          A
        </button>
        <button className={styles.dropdownItem} onClick={handleButtonClick} id="sticker">
          Bs
        </button>
        <button className={styles.dropdownItem} onClick={handleButtonClick} id="cast">
          C
        </button>
      </div>
    </div>
  );
};

export default CastPostStickerDropdownButton;
