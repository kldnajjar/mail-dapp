import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Header from "../Header";
import Sidebar from "../Sidebar";
import Mail from "../Mail";
import EmailList from "../EmailList";
import { selectSendMessageIsOpen } from "../../features/mailSlice";

// import styles from './Profile.module.css';

const Profile = () => {
  const navigate = useNavigate();
  const [isComposing, setIsComposing] = useState(false);
  const sendMessageIsOpen = useSelector(selectSendMessageIsOpen);
  const profile = JSON.parse(sessionStorage.getItem("profile"));

  useEffect(() => {
    if (!profile) {
      return navigate("/sign-in");
    }
  }, []);

  const renderProfile = () => {
    return (
      <div className="app">
        <Header />
        <div className="app-body">
          <Sidebar isComposing={isComposing} setIsComposing={setIsComposing} />
          {sendMessageIsOpen ? <Mail /> : <EmailList />}
        </div>
      </div>
    );
  };

  return <>{profile ? renderProfile() : null}</>;
};

export default Profile;
