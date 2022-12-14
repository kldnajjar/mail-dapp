import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { selectSendMessageIsOpen } from "../../slices/mailSlice";
import { setUser } from "../../slices/userSlice";
import Header from "../Header";
import Sidebar from "../Sidebar";
import Mail from "../Mail";
import EmailList from "../EmailList";

// import styles from './Account.module.css';

const Account = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sendMessageIsOpen = useSelector(selectSendMessageIsOpen);
  const user = JSON.parse(sessionStorage.getItem("account"));

  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    } else {
      return navigate("/sign-in");
    }
  }, []);

  const renderAccount = () => {
    return (
      <div className="app">
        <Header />
        <div className="app-body">
          <Sidebar />
          {sendMessageIsOpen ? <Mail /> : <EmailList />}
        </div>
      </div>
    );
  };

  return <>{user ? renderAccount() : null}</>;
};

export default Account;
