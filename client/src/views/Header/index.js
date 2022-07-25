import React, { useState, useEffect } from "react";
import Popup from "reactjs-popup";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import MenuIcon from "@material-ui/icons/Menu";
import { Avatar, IconButton } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
// import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import AppsIcon from "@material-ui/icons/Apps";
import NotificationsIcon from "@material-ui/icons/Notifications";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";

import { selectCurrentUser, resetUser } from "../../slices/userSlice";
import { getCurrentUser } from "../../util/user";
import useGunContext from "../../context/useGunContext";
import useSessionChannel from "../../hooks/useSessionChannel";

import logo from "../../aseets/logo.png";
import styles from "./Header.module.css";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const sessionChannel = useSessionChannel();
  const { getUser } = useGunContext();

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(async () => {
    const current_user = await getCurrentUser(user);
    setCurrentUser(current_user);
  }, []);

  const signOut = (evt) => {
    sessionStorage.removeItem("account");

    const current_gun_user = getUser();
    current_gun_user.leave();

    if (current_gun_user._.sea) {
      window.sessionStorage.removeItem("pair");
    }

    // logged out from click, notify other tabs
    if (evt) {
      sessionChannel.postMessage({
        eventName: "REMOVE_YOUR_CREDS",
      });
    }

    dispatch(resetUser());
    navigate("/");
  };

  if (!currentUser) return null;

  return (
    <div className={styles.header}>
      <div className={styles["header-left"]}>
        <IconButton>
          <MenuIcon />
        </IconButton>
        <img src={logo} alt="mykloud logo" />
      </div>
      <div className={styles["header-middle"]}>
        <SearchIcon />
        <input type="text" placeholder="Search mail" className="unused" />
        {/* <ArrowDropDownIcon className={styles["header-inputCaret"]} /> */}
      </div>
      <div className={styles["header-right"]}>
        <IconButton className="unused">
          <HelpOutlineIcon />
        </IconButton>
        <IconButton className="unused">
          <NotificationsIcon />
        </IconButton>
        <IconButton className="unused">
          <AppsIcon />
        </IconButton>

        <Popup
          trigger={<Avatar src={currentUser?.photoUrl} className="pointer" />}
          position="bottom right"
          className="pointer"
        >
          <div className={styles["popup-container"]}>
            <div className="top-content">
              <Avatar src={currentUser?.photoUrl} className="margin-auto" />
              <b>{`${currentUser.firstName} ${currentUser.lastName}`}</b>
              <p>{currentUser.email}</p>
            </div>
            <hr />
            <div className="bottom-content">
              <button className="btn btn-primary" onClick={signOut}>
                Logout
              </button>
            </div>
          </div>
        </Popup>
      </div>
    </div>
  );
}

export default Header;
