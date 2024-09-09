import React, { useState, useEffect, ChangeEvent } from "react";
import "./FriendModal.css";
import getAPIURL from "../../utils/getAPIURL";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  userNodeId: string | null; // 사용자의 노드 ID
}

const APIURL = getAPIURL();

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, userNodeId }) => {
  const [memo, setMemo] = useState("");
  const [member, setMember] = useState<{ nickname: string; email: string } | null>(null);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  useEffect(() => {
    if (userNodeId && isOpen) {
      fetchMemo();
      getMemberInfo();
    }
  }, [userNodeId, isOpen]);

  const getMemberInfo = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/domain/friend/get-member`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_node_id: userNodeId }),
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMember(data); // 서버에서 받은 데이터를 `member` 상태에 저장
      } else {
        console.error("Failed to load member info.");
        setResponseMessage("Failed to load member info.");
      }
    } catch (error) {
      setResponseMessage(`${error}`);
    }
  };

  const fetchMemo = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/domain/friend/memo/get-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_node_id: userNodeId }),
          
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMemo(data.memo); // 서버에서 받은 메모 데이터를 `memo` 상태에 저장
      } else {
        console.error("Failed to load memo.");
        setResponseMessage("Failed to load memo.");
      }
    } catch (error) {
      setResponseMessage(`${error}`);
    }
  };

  const handleMemoChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setMemo(event.target.value);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/domain/friend/memo/modify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_node_id: userNodeId, new_memo: memo }),
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResponseMessage(`Memo updated: ${data.new_memo}`);
        fetchMemo();
      } else {
        setResponseMessage("Failed to update memo.");
      }
    } catch (error) {
      setResponseMessage(`${error}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="transparent-container">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          X
        </button>

        {/* 프로필 섹션 */}
        {member && (
          <div className="profile-section">
            <h2>Profile</h2>
            <p>Nickname: {member.nickname}</p>
            <p>Email: {member.email}</p>
          </div>
        )}

        {/* 메모 섹션 */}
        <div className="memo-section">
          <textarea
            value={memo}
            onChange={handleMemoChange}
            className="modal-input"
            placeholder="Edit your memo here..."
          />
        </div>

        <button onClick={handleSave} className="modal-save-button">
          ✔️
        </button>
        {responseMessage && <p className="modal-response">{responseMessage}</p>}
      </div>
    </div>
  );
};

export default Modal;
