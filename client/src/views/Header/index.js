import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import MenuIcon from "@material-ui/icons/Menu";
import { Avatar, IconButton } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import AppsIcon from "@material-ui/icons/Apps";
import NotificationsIcon from "@material-ui/icons/Notifications";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";

import { selectCurrentUser, resetUser } from "../../slices/userSlice";
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

  const signOut = (evt) => {
    sessionStorage.removeItem("account");

    const current_user = getUser();
    current_user.leave();

    if (current_user._.sea) {
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
        <input type="text" placeholder="Search mail" />
        <ArrowDropDownIcon className={styles["header-inputCaret"]} />
      </div>
      <div className={styles["header-right"]}>
        <IconButton onClick={signOut}>
          <ExitToAppIcon />
        </IconButton>
        <IconButton>
          <HelpOutlineIcon />
        </IconButton>
        <IconButton>
          <NotificationsIcon />
        </IconButton>
        <IconButton>
          <AppsIcon />
        </IconButton>
        <Avatar onClick={signOut} src={user?.photoUrl} />
      </div>
    </div>
  );
}

export default Header;
