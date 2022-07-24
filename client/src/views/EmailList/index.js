import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "gun/sea";
import "gun/lib/path.js";

import { Checkbox, IconButton } from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import RedoIcon from "@material-ui/icons/Redo";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import KeyboardHideIcon from "@material-ui/icons/KeyboardHide";
import SettingsIcon from "@material-ui/icons/Settings";

import { resetEmailActions, selecteFolder } from "../../slices/mailSlice";
import { selectCurrentUser } from "../../slices/userSlice";
import { getCurrentUserAlias } from "../../util/user";
import useGunContext from "../../context/useGunContext";
import { decryption } from "../../util/privacy";
import EmailRow from "../EmailRow";

import styles from "./EmailList.module.css";

function EmailList() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const folderName = useSelector(selecteFolder);
  const [emails, setEmails] = useState([]);
  const { getGun, getUser } = useGunContext();
  const account = JSON.parse(sessionStorage.getItem("account"));

  useEffect(async () => {
    dispatch(resetEmailActions());
    await getAllEmails(getGun, getUser, account);
  }, [folderName]);

  const getAllEmails = async (getGun, getUser, account) => {
    const alias = await getCurrentUserAlias(user, getUser);

    let emailsNum = 0;
    const inboxNode = getGun()
      .get("accounts")
      .get(alias)
      .get("folders")
      .get(folderName);
    await inboxNode.once(async (data) => {
      delete data.label;
      emailsNum = Object.keys(data).slice(1).length;
    });
    var startTime = performance.now();
    const array = [];
    let counter = 0;
    await inboxNode.map().once(async (data) => {
      if (data !== "inbox") {
        const conversation = await decryption(data, getUser, alias);

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
  };

  const renderEmails = () => {
    return emails.map(
      (
        { subject, sender, recipient, body, id, senderEpub, keys },
        reactKey
      ) => (
        <EmailRow
          key={`email-row-${reactKey}`}
          sender={sender}
          recipient={recipient}
          subject={subject}
          body={body}
          id={id}
          senderEpub={senderEpub}
          keys={keys}
          // time={new Date(timestamp?.seconds * 1000).toUTCString()}
        />
      )
    );
  };

  const renderEmptyList = () => {
    return (
      <div className={`${styles.emptyList}`}>
        <h4>There are no conversations</h4>
      </div>
    );
  };

  if (!emails.length) {
    return (
      <div className={styles.emailList}>
        <div className={styles["emailList-list"]}>{renderEmptyList()}</div>
      </div>
    );
  }

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
      <div className={styles["emailList-list"]}>{renderEmails()}</div>
    </div>
  );
}

export default EmailList;
