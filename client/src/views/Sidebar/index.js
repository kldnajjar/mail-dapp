import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { Button, IconButton } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import InboxIcon from "@material-ui/icons/Inbox";
import StarIcon from "@material-ui/icons/Star";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import LabelImportantIcon from "@material-ui/icons/LabelImportant";
import NearMeIcon from "@material-ui/icons/NearMe";
import NoteIcon from "@material-ui/icons/Note";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PersonIcon from "@material-ui/icons/Person";
import DuoIcon from "@material-ui/icons/Duo";
import PhoneIcon from "@material-ui/icons/Phone";

import {
  openSendMessage,
  selectMail,
  setFolder,
  selecteFolder,
} from "../../slices/mailSlice";
import SidebarOption from "./Option";

import styles from "./Sidebar.module.css";

function Sidebar() {
  const dispatch = useDispatch();
  const folderName = useSelector(selecteFolder);

  const onCompose = () => {
    dispatch(selectMail(null));
    dispatch(openSendMessage());
  };

  return (
    <div className={styles.sidebar}>
      <Button
        className={styles["sidebar-compose"]}
        onClick={onCompose}
        startIcon={<AddIcon fontSize="large" />}
      >
        Compose
      </Button>

      <Link to="/" className={styles["sidebar-link"]}>
        <SidebarOption
          Icon={InboxIcon}
          title="Inbox"
          number={54}
          selected={folderName === "inbox" ? true : false}
          onClick={() => {
            dispatch(setFolder("inbox"));
          }}
        />
      </Link>

      <SidebarOption
        Icon={StarIcon}
        title="Starred"
        number={12}
        selected={folderName === "starred" ? true : false}
        onClick={() => {
          dispatch(setFolder("starred"));
        }}
      />
      <SidebarOption
        Icon={AccessTimeIcon}
        title="Snoozed"
        number={9}
        selected={folderName === "snoozed" ? true : false}
        onClick={() => {
          dispatch(setFolder("snoozed"));
        }}
      />
      <SidebarOption
        Icon={LabelImportantIcon}
        title="Important"
        number={12}
        selected={folderName === "important" ? true : false}
        onClick={() => {
          dispatch(setFolder("important"));
        }}
      />

      <SidebarOption
        Icon={NearMeIcon}
        title="Sent"
        number={81}
        selected={folderName === "sent" ? true : false}
        onClick={() => {
          dispatch(setFolder("sent"));
        }}
      />

      <SidebarOption
        Icon={NoteIcon}
        title="Drafts"
        number={5}
        selected={folderName === "drafts" ? true : false}
        onClick={() => {
          dispatch(setFolder("drafts"));
        }}
      />
      <SidebarOption
        Icon={ExpandMoreIcon}
        title="More"
        selected={folderName === "more" ? true : false}
        onClick={() => {
          dispatch(setFolder("more"));
        }}
      />

      <div className={styles["sidebar-footer"]}>
        <div className={styles["sidebar-footerIcons"]}>
          <IconButton>
            <PersonIcon />
          </IconButton>
          <IconButton>
            <DuoIcon />
          </IconButton>
          <IconButton>
            <PhoneIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
