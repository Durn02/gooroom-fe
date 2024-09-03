import React, { useState, useEffect } from "react";
import "./FriendModal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  userNodeId: string | null;  // 사용자의 노드 ID
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, userNodeId }) => {
  const [memo, setMemo] = useState("");
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userNodeId && isOpen) {
      fetchMemo();
    }
  }, [userNodeId, isOpen]);

  const fetchMemo = async () => {
    try {
      const response = await fetch(`http://localhost:8000/domain/friend/memo/get-content`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_node_id: userNodeId }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setMemo(data.memo); 
      } else {
        console.error("에러가 발생했습니다.")
        setResponseMessage("Failed to load memo.");
      }
    } catch (error) {
      setResponseMessage("An error occurred while fetching memo.");
    }
  };

  const handleMemoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMemo(event.target.value);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:8000/domain/friend/memo/modify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_node_id: userNodeId, new_memo: memo }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setResponseMessage(`Memo updated: ${data.new_memo}`);
        fetchMemo();
      } else {
        setResponseMessage("Failed to update memo.");
      }
    } catch (error) {
      setResponseMessage("An error occurred while saving memo.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          X
        </button>
        <h2>This is FriendPage. Edit Memo</h2>
        <input
          type="text"
          value={memo}
          onChange={handleMemoChange}
          className="modal-input"
          placeholder="Edit your memo here..."
        />
        <button onClick={handleSave} className="modal-save-button">
          ✔️
        </button>
        {responseMessage && <p className="modal-response">{responseMessage}</p>}
      </div>
    </div>
  );
};

export default Modal;
