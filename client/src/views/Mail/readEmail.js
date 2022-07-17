import React from "react";
import { selectOpenMail, setReply } from "../../features/mailSlice";
import { useSelector, useDispatch } from "react-redux";

import { IconButton } from "@material-ui/core";
import ReplyIcon from "@material-ui/icons/Reply";

import styles from "./Mail.module.css";

function ReadEmail() {
  const selectedMail = useSelector(selectOpenMail);
  const dispatch = useDispatch();

  console.log(selectedMail);

  return (
    <div className={styles["mail-body"]}>
      <div className={styles["mail-bodyHeader"]}>
        <div className={styles["mail-subject"]}>
          <div>
            <h5>{selectedMail.subject}</h5>
            <br />
            <h6>
              From: <b>{`<${selectedMail.sender}>`}</b>
            </h6>
          </div>

          {/* <LabelImportantIcon className={styles["mail-important"]} /> */}
        </div>
        <div className="">
          <IconButton onClick={() => dispatch(setReply(true))}>
            <ReplyIcon />
          </IconButton>
        </div>
        {/* <p className={styles["mail-time"]}>{selectedMail.time}</p> */}
      </div>

      <div className={styles["mail-message"]}>
        <p>{selectedMail.body}</p>
      </div>
    </div>
  );
}

export default ReadEmail;
