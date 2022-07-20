import { Checkbox, IconButton } from "@material-ui/core";
import React, { useEffect, useState, useCallback } from "react";

import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import RedoIcon from "@material-ui/icons/Redo";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import KeyboardHideIcon from "@material-ui/icons/KeyboardHide";
import SettingsIcon from "@material-ui/icons/Settings";
// import InboxIcon from "@material-ui/icons/Inbox";
// import PeopleIcon from "@material-ui/icons/People";
// import LocalOfferIcon from "@material-ui/icons/LocalOffer";
// import Section from "../Section";
import EmailRow from "../EmailRow";
import styles from "./EmailList.module.css";
import useGunContext from "../../context/useGunContext";
import { decryption } from "../../util/privacy";
import { useSelector, useDispatch } from "react-redux";
import { resetEmailActions } from "../../features/mailSlice";
import "gun/sea";
import "gun/lib/path.js";

function EmailList() {
  const dispatch = useDispatch();
  const [emails, setEmails] = useState([]);
  const { getGun, getUser } = useGunContext();
  const folder = useSelector((state) => state?.mail?.folderOpened);
  const emailsList = useSelector((state) => state?.mail?.emailsList);
  const profile = JSON.parse(sessionStorage.getItem("profile"));
  async function getCurrentUserAlias(getUser) {
    let name;
    await getUser()
      .get("alias")
      .once((alias) => {
        name = alias;
      });
    return name;
  }

  async function getAllEmails(getGun, getUser, profile) {
    const alias = await getCurrentUserAlias(getUser);
    let emailsNum = 0;
    const inboxNode = getGun()
      .get("profiles")
      .get(alias)
      .get("folders")
      .get("inbox");
    await inboxNode.once(async (data) => {
      delete data.label;
      emailsNum = Object.keys(data).slice(1).length;
    });
    var startTime = performance.now();
    const array = [];
    let counter = 0;
    await inboxNode.map().once(async (data) => {
      if (data !== "inbox") {
        const conversation = await decryption(
          data,
          getGun,
          getUser,
          profile.email
        );
        array.push(conversation);
        counter++;
        if (counter > emailsNum) {
          setEmails((prev) => [...prev, conversation]);
        }
        var endTime = performance.now();
        if (counter == emailsNum) {
          var endTime = performance.now();
          console.log(
            `Call to doSomething took ${endTime - startTime} milliseconds`
          );
          setEmails([...array]);
        }
      }
    });
  }

  useEffect(async () => {
    dispatch(resetEmailActions());
    await getAllEmails(getGun, getUser, profile);
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
      <div className={styles["emailList-list"]}>
        {emails[0] &&
          emails?.map(
            (
              { subject, sender, recipient, body, id, senderEpub, keys },
              reactKey
            ) => (
              <EmailRow
                key={`email-row-${reactKey}`}
                sender={sender}
                // recipient={recipient}
                subject={subject}
                body={body}
                id={id}
                senderEpub={senderEpub}
                keys={keys}
                // time={new Date(timestamp?.seconds * 1000).toUTCString()}
              />
            )
          )}
      </div>
    </div>
  );
}

export default EmailList;
