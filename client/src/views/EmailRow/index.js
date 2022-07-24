import React from "react";
import { useDispatch } from "react-redux";
import moment from "moment";

import { Checkbox, IconButton } from "@material-ui/core";
import StarBorderOutlinedIcon from "@material-ui/icons/StarBorderOutlined";
import LabelImportantOutlinedIcon from "@material-ui/icons/LabelImportantOutlined";

import { selectMail, openSendMessage } from "../../slices/mailSlice";

import styles from "./EmailRow.module.css";

function EmailRow({
  subject,
  sender,
  recipient,
  body,
  id,
  senderEpub,
  keys,
  time,
}) {
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
        time,
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
        <div className={styles["emailRow-time"]}>
          {time && moment(time).format("MMMM Do YYYY, h:mm:ss a")}
        </div>
      </div>
    </div>
  );
}

export default EmailRow;
