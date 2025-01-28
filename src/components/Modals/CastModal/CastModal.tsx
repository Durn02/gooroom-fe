import React, { useEffect } from "react";
import styles from "./CastModal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  setCastMessage: (value: string) => void;
  cast: () => void;
}

const CastModal = ({ isOpen, onClose, setCastMessage, cast }: ModalProps) => {
  if (!isOpen) return null;

  useEffect(() => {
    if (isOpen) {
      const inputElement = document.getElementById(
        "castMessageInput"
      ) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, [isOpen]);

  const onCastButtonClickHandler = () => {
    onClose();
    cast();
  };
  const handlePressKeyboard = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onCastButtonClickHandler();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* <form> */}
        <button className={styles.modalCloseButton} onClick={onClose}>
          X
        </button>
        <input
          id="castMessageInput"
          className={styles.modalInput}
          type="text"
          placeholder="cast message를 입력하세요"
          onChange={(e) => {
            setCastMessage(e.target.value);
          }}
          onKeyDown={handlePressKeyboard}
        ></input>
        <button
          className={styles.modalSubmitButton}
          onClick={onCastButtonClickHandler}
        >
          전송
        </button>
      </div>
    </div>
  );
};

export default CastModal;
