import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import lodash from "lodash";
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

import {
  resetEmailActions,
  selectedFolder,
  setNumberOfMessage,
  setNumberOfNewMessage,
} from "../../slices/mailSlice";
import { selectCurrentUser } from "../../slices/userSlice";
import { getCurrentUserAlias } from "../../util/user";
import useGunContext from "../../context/useGunContext";
import { decryption } from "../../util/privacy";
import EmailRow from "../EmailRow";

import styles from "./EmailList.module.css";

function EmailList() {
  const dispatch = useDispatch();
  const { getGun, getUser } = useGunContext();
  const user = useSelector(selectCurrentUser);
  const folderName = useSelector(selectedFolder);

  const [emails, setEmails] = useState([]);
  const [newEmails, setNewEmails] = useState();

  useEffect(async () => {
    dispatch(resetEmailActions());
    await getAllEmails(getGun, getUser);
  }, [folderName]);

  const getAllEmails = async (getGun, getUser) => {
    const alias = await getCurrentUserAlias(user, getUser);
    let emailsNum = 0;

    const folderNode = getGun()
      .get("accounts")
      .get(alias)
      .get("folders")
      .get(folderName);

    var startTime = performance.now();
    const emails = [];
    let counter = 0;

    folderNode
      .on(async (data) => {
        delete data.label;
        delete data.new;
        const obj = Object.keys(data);

        counter = Object.keys(data).length - 1;

        emailsNum = obj.slice(1).length;
        if (obj.length === 1) {
          setEmails([]);
        }
      })
      .map()
      .once(async (data) => {
        console.log("data", data)
        if (data && typeof data !== "string") {
          folderNode.get("new").once((data) => {
            let array = JSON.parse(data);
            dispatch(setNumberOfNewMessage(array.length));
            setNewEmails(array.length);
          });
          const conversation = await decryption(data, getUser, alias);
          emails.push(conversation);
          if (counter > emailsNum) {
            setEmails((prev) => [conversation, ...prev]);
          }
          var endTime = performance.now();
          if (counter === emailsNum) {
            var endTime = performance.now();
            console.log(
              `Call to do something took ${endTime - startTime} milliseconds`
            );

            const newEmails = lodash.uniqBy(emails, "id");

            newEmails.sort((a, b) => {
              return b.time - a.time;
            });
            
            setEmails(newEmails);
          }
        }
        folderNode.off()
      });
  };

  const renderEmails = () => {
    return emails.map(
      (
        { subject, sender, recipient, body, id, senderEpub, keys, time },
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
          time={time}
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
          <Checkbox className="unused" />
          <IconButton className="unused">
            <ArrowDropDownIcon />
          </IconButton>
          <IconButton className="unused">
            <RedoIcon />
          </IconButton>
          <IconButton className="unused">
            <MoreVertIcon />
          </IconButton>
        </div>
        <div className={styles["emailList-settingsRight"]}>
          <IconButton className="unused">
            <ChevronLeftIcon />
          </IconButton>
          <IconButton className="unused">
            <ChevronRightIcon />
          </IconButton>
          <IconButton className="unused">
            <KeyboardHideIcon />
          </IconButton>
          <IconButton className="unused">
            <SettingsIcon />
          </IconButton>
        </div>
      </div>
      <div className={styles["emailList-list"]}>{renderEmails()}</div>
    </div>
  );
}

export default EmailList;
