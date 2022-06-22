import { Button, IconButton } from "@material-ui/core";
import React from "react";
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
import SidebarOption from "./Option";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { openSendMessage } from "../../features/mailSlice";
import styles from "./Sidebar.module.css";
import useGunContext from "../../context/useGunContext";
import { encryption } from "../../util/privacy";

function Sidebar() {
  const { getGun, getUser, getMails } = useGunContext();
  const dispatch = useDispatch();

  let email = {
    subject: "Hey",
    sender: "tsar@zhuk.com",
    recipient: "suleiman@zhukov.com",
    body: "Hello, tsar",
    key: "",
  };

  async function onCompose(e) {
    e.preventDefault();
    const newEmail = await encryption(email, getGun, getUser);
    getMails().set(newEmail);
    console.log(newEmail);
  }

  return (
    <div className={styles.sidebar}>
      <Button
        className={styles["sidebar-compose"]}
        // onClick={() => dispatch(openSendMessage())}
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
          selected={true}
        />
      </Link>

      <SidebarOption Icon={StarIcon} title="Starred" number={12} />
      <SidebarOption Icon={AccessTimeIcon} title="Snoozed" number={9} />
      <SidebarOption Icon={LabelImportantIcon} title="Important" number={12} />
      <SidebarOption Icon={NearMeIcon} title="Sent" number={81} />
      <SidebarOption Icon={NoteIcon} title="Drafts" number={5} />
      <SidebarOption Icon={ExpandMoreIcon} title="More" />

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
