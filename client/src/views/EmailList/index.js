import { Checkbox, IconButton } from "@material-ui/core";
import React, { useEffect, useState, useCallback } from "react";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import RedoIcon from "@material-ui/icons/Redo";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import KeyboardHideIcon from "@material-ui/icons/KeyboardHide";
import SettingsIcon from "@material-ui/icons/Settings";
import InboxIcon from "@material-ui/icons/Inbox";
import PeopleIcon from "@material-ui/icons/People";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import Section from "../Section";
import EmailRow from "../EmailRow";
import styles from "./EmailList.module.css";
import useGunContext from "../../context/useGunContext";
import { decryption } from "../../util/privacy";
import "gun/sea";
// import { db } from "../../firebase";

function EmailList() {
  const [emails, setEmails] = useState([]);
  const { getGun, getUser, getMails } = useGunContext();

const getDecryptedMails = (mail, getGun, getUser) =>{
  const kmailsArray = Object.keys(mail).slice(1)
  const promises =  kmailsArray.map(async kmail => await decryption(kmail, getGun, getUser));
  
  Promise.all(promises).then(function(results) {
    setEmails(results)
  })
}

  const getAllEmailsFromDB = async (getGun, getUser, getMails) => {
    await getUser()
      .get("alias")
      .once(async (alias) => {
        getMails().once(mail => getDecryptedMails(mail, getGun, getUser));
      });
  };
  

  useEffect(() => {
    getAllEmailsFromDB(getGun, getUser, getMails);
  }, []);

  return (
    <div className={styles.emailList}>
      <div className={styles["emailList-settings"]}>
        <div className={styles["emailList-settingsLeft"]}>
          <Checkbox />
          <IconButton>
            <ArrowDropDownIcon />
          </IconButton>
          <IconButton>
            <RedoIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </div>
        <div className={styles["emailList-settingsRight"]}>
          <IconButton>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton>
            <ChevronRightIcon />
          </IconButton>
          <IconButton>
            <KeyboardHideIcon />
          </IconButton>
          <IconButton>
            <SettingsIcon />
          </IconButton>
        </div>
      </div>
      {/* <div className={styles["emailList-sections"]}>
        <Section Icon={InboxIcon} title="Primary" color="red" selected />
        <Section Icon={PeopleIcon} title="Social" color="#1A73E8" />
        <Section Icon={LocalOfferIcon} title="Promotions" color="green" />
      </div> */}

      <div className={styles["emailList-list"]}>
        {emails.map(({ subject, sender, recipient, body }, reactKey) => (
          <EmailRow
            key={`email-row-${reactKey}`}
            sender={sender}
            recipient={recipient}
            subject={subject}
            body={body}
            // time={new Date(timestamp?.seconds * 1000).toUTCString()}
          />
        ))}
      </div>
    </div>
  );
}

export default EmailList;
