import { Checkbox, IconButton } from "@material-ui/core";
import React from "react";
import StarBorderOutlinedIcon from "@material-ui/icons/StarBorderOutlined";
import LabelImportantOutlinedIcon from "@material-ui/icons/LabelImportantOutlined";
import { selectMail, openSendMessage } from "../../features/mailSlice";
import { useDispatch } from "react-redux";
import styles from "./EmailRow.module.css";

function EmailRow({ id, title, subject, description, time }) {
  const dispatch = useDispatch();

  const openMail = () => {
    dispatch(
      selectMail({
        id,
        title,
        subject,
        description,
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
      <h3 className={`${styles["emailRow-title"]} mb-0`}>{title}</h3>
      <div className={styles["emailRow-message"]}>
        <h4>
          {subject}{" "}
          <span className={styles["emailRow-description"]}>
            {" "}
            - {description}
          </span>
        </h4>
      </div>
      <p className={`${styles["emailRow-time"]} mb-0`}>{time}</p>
    </div>
  );
}

export default EmailRow;
