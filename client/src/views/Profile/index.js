import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../Header";
import Sidebar from "../Sidebar";
// import Mail from "../Mail";
import EmailList from "../EmailList";
// import styles from './Profile.module.css';

const Profile = () => {
  const navigate = useNavigate();

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
          <Sidebar />
          <EmailList />
        </div>
      </div>
    );
  };

  return <>{profile ? renderProfile() : null}</>;
};

export default Profile;
