'use client';

import React, { useState, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
//import "./ProfileModal.css";
import style from "./ProfileModal.module.css";
import { API_URL } from "@/lib/utils/config";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const APIURL = API_URL;

const ProfileModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [profileData, setProfileData] = useState({
    my_memo: "",
    nickname: "",
    username: "",
    concern: [] as string[], // concern을 배열로 초기화
  });
  const [newConcern, setNewConcern] = useState<string>(""); // 새로운 concern 입력값

  useEffect(() => {
    if (isOpen) {
      fetchProfileData();
    }
  }, [isOpen]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`${APIURL}/domain/user/my/info`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error("An error occurred while fetching profile data.", error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleNewConcernChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewConcern(event.target.value);
  };

  const handleNewConcernKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" && newConcern.trim() !== "") {
      addConcern();
    }
  };

  const addConcern = () => {
    setProfileData((prevData) => ({
      ...prevData,
      concern: [...prevData.concern, newConcern.trim()],
    }));
    setNewConcern(""); // 입력 필드를 초기화
  };

  const removeConcern = (index: number) => {
    setProfileData((prevData) => ({
      ...prevData,
      concern: prevData.concern.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${APIURL}/domain/user/info/change`, {
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
        console.log(`Profile updated: ${data.my_memo}`);
        fetchProfileData(); // 저장 후 최신 프로필 데이터 다시 가져오기
      } else {
        console.error("Failed to update profile.");
      }
    } catch (error) {
      console.error("An error occurred while saving profile.", error);
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
      className={style.slideFade}
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
            value={newConcern}
            onChange={handleNewConcernChange}
            onKeyPress={handleNewConcernKeyPress}
            className="modal-input"
            placeholder="Enter a new concern..."
          />
          <button onClick={addConcern} className="modal-add-button">
            Add
          </button>
          <ul className="concern-list">
            {profileData.concern.map((item, index) => (
              <li key={index} className="concern-item">
                {item} <button onClick={() => removeConcern(index)}>X</button>
              </li>
            ))}
          </ul>
          <button onClick={handleSave} className="modal-save-button">
            Save
          </button>
        </div>
      </div>
    </CSSTransition>
  );
};

export default ProfileModal;
