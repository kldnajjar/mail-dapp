import React from "react";
import { selectOpenMail } from "../../features/mailSlice";
import { useSelector } from "react-redux";
import styles from "./Mail.module.css";
import MailTool from "./mailTool";
import EditEmail from "./editEmail";
import ReadEmail from "./readEmail";

function Mail() {
  const selectedMail = useSelector(selectOpenMail);

  return (
    <div className={styles.mail}>
      <MailTool />
      {selectedMail ? <ReadEmail /> : <EditEmail />}
    </div>
  );
}

export default Mail;
