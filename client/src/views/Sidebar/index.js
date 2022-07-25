import React from "react";
import { useDispatch, useSelector } from "react-redux";
// import { Link } from "react-router-dom";

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
  closeSendMessage,
} from "../../slices/mailSlice";
import SidebarOption from "./Option";

import styles from "./Sidebar.module.css";

function Sidebar() {
  const dispatch = useDispatch();
  const folderName = useSelector(selecteFolder);

  const onCompose = () => {
    dispatch(selectMail(null));
    dispatch(closeSendMessage());
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

      <SidebarOption
        Icon={InboxIcon}
        title="Inbox"
        number={54}
        selected={folderName === "inbox" ? true : false}
        onClick={() => {
          dispatch(closeSendMessage());
          dispatch(setFolder("inbox"));
        }}
      />

      <SidebarOption
        customClassName="unused"
        Icon={StarIcon}
        title="Starred"
        number={12}
        selected={folderName === "starred" ? true : false}
        onClick={() => {
          dispatch(closeSendMessage());
          dispatch(setFolder("starred"));
        }}
      />
      <SidebarOption
        customClassName="unused"
        Icon={AccessTimeIcon}
        title="Snoozed"
        number={9}
        selected={folderName === "snoozed" ? true : false}
        onClick={() => {
          dispatch(closeSendMessage());
          dispatch(setFolder("snoozed"));
        }}
      />
      <SidebarOption
        customClassName="unused"
        Icon={LabelImportantIcon}
        title="Important"
        number={12}
        selected={folderName === "important" ? true : false}
        onClick={() => {
          dispatch(closeSendMessage());
          dispatch(setFolder("important"));
        }}
      />

      <SidebarOption
        Icon={NearMeIcon}
        title="Sent"
        number={81}
        selected={folderName === "sent" ? true : false}
        onClick={() => {
          dispatch(closeSendMessage());
          dispatch(setFolder("sent"));
        }}
      />

      <SidebarOption
        customClassName="unused"
        Icon={NoteIcon}
        title="Drafts"
        number={5}
        selected={folderName === "drafts" ? true : false}
        onClick={() => {
          dispatch(closeSendMessage());
          dispatch(setFolder("drafts"));
        }}
      />
      <SidebarOption
        customClassName="unused"
        Icon={ExpandMoreIcon}
        title="More"
        selected={folderName === "more" ? true : false}
        onClick={() => {
          dispatch(closeSendMessage());
          dispatch(setFolder("more"));
        }}
      />

      <div className={styles["sidebar-footer"]}>
        <div className={styles["sidebar-footerIcons"]}>
          <IconButton className="unused">
            <PersonIcon />
          </IconButton>
          <IconButton className="unused">
            <DuoIcon />
          </IconButton>
          <IconButton className="unused">
            <PhoneIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
