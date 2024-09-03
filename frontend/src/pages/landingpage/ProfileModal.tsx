import React, { useState, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import "./ProfileModal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [profileData, setProfileData] = useState({
    my_memo: "",
    nickname: "",
    username: "",
    concern: [],
    node_id: "",
  });
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProfileData();
    }
  }, [isOpen]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/domain/user/my/info`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      setProfileData(data);
      setResponseMessage("Failed to load profile data.");
    
    } catch (error) {
      setResponseMessage("An error occurred while fetching profile data.");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:8000/domain/user/info/change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          my_memo: profileData.my_memo,
          nickname: profileData.nickname,
          username: profileData.username,
          concern: profileData.concern,
        }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setResponseMessage(`Profile updated: ${data.my_memo}`);
        fetchProfileData(); // 저장 후 최신 프로필 데이터 다시 가져오기
      } else {
        setResponseMessage("Failed to update profile.");
      }
    } catch (error) {
      setResponseMessage("An error occurred while saving profile.");
    }
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <CSSTransition
      in={isOpen}
      timeout={300}
      classNames="modal"
      mountOnEnter
      unmountOnExit
    >
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-content">
          <button className="modal-close" onClick={onClose}>
            X
          </button>
          <h2>Profile</h2>
          <label>Nickname:</label>
          <input
            type="text"
            name="nickname"
            value={profileData.nickname}
            onChange={handleChange}
            className="modal-input"
            placeholder="Edit your nickname..."
          />
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={profileData.username}
            onChange={handleChange}
            className="modal-input"
            placeholder="Edit your username..."
          />
          <label>Memo:</label>
          <input
            type="text"
            name="my_memo"
            value={profileData.my_memo}
            onChange={handleChange}
            className="modal-input"
            placeholder="Edit your memo..."
          />
          <label>Concerns:</label>
          <input
            type="text"
            name="concern"
            value={profileData.concern.join(", ")} // 배열을 문자열로 표시
            onChange={handleChange}
            className="modal-input"
            placeholder="Edit your concerns..."
          />
          <button onClick={handleSave} className="modal-save-button">
            Save
          </button>
          {responseMessage && <p className="modal-response">{responseMessage}</p>}
        </div>
      </div>
    </CSSTransition>
  );
};

export default ProfileModal;
