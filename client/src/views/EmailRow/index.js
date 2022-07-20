import React from "react";
import { useDispatch } from "react-redux";

import { Checkbox, IconButton } from "@material-ui/core";
import StarBorderOutlinedIcon from "@material-ui/icons/StarBorderOutlined";
import LabelImportantOutlinedIcon from "@material-ui/icons/LabelImportantOutlined";

import { selectMail, openSendMessage } from "../../slices/mailSlice";

import styles from "./EmailRow.module.css";

function EmailRow({ subject, sender, recipient, body, id, senderEpub, keys }) {
  const dispatch = useDispatch();

  const openMail = () => {
    dispatch(
      selectMail({
        subject,
        sender,
        recipient,
        body,
        id,
        senderEpub,
        keys,
      })
    );
    dispatch(openSendMessage());
  };

  return (
    <div onClick={openMail} className={styles.emailRow}>
      <div className={styles["emailRow-options"]}>
        <Checkbox />
        <IconButton>
          <StarBorderOutlinedIcon />
        </IconButton>
        <IconButton>
          <LabelImportantOutlinedIcon />
        </IconButton>
      </div>
      <div className={styles["emailRow-message"]}>
        <h4>
          {subject}{" "}
          <span className={styles["emailRow-description"]}> - {body}</span>
        </h4>
      </div>
    </div>
  );
}

export default EmailRow;
