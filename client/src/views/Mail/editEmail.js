import React from "react";
import { selectOpenMail } from "../../features/mailSlice";
import { useSelector } from "react-redux";
import styles from "./Mail.module.css";

function EditEmail() {
  const selectedMail = useSelector(selectOpenMail);

  let email = {
    subject: "Hey",
    sender: "tsar@zhuk.com",
    recipient: "suleiman@zhukov.com",
    body: "Hello, tsar",
    key: "",
  };

  return (
    <div className={styles["mail-body"]}>
      <div className={styles["mail-bodyHeader"]}>
        <div className={styles["mail-subject"]}>
          <h5>{selectedMail?.subject}</h5>
          {/* <LabelImportantIcon className={styles["mail-important"]} /> */}
        </div>
        <p className={styles["mail-time"]}>{selectedMail?.time}</p>
      </div>

      <div className={styles["mail-message"]}>
        <p>{selectedMail?.description}</p>
      </div>
    </div>
  );
}

export default EditEmail;
