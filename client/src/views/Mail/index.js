import React from "react";
import { selectedMailToReply, selectOpenMail } from "../../features/mailSlice";
import { useSelector } from "react-redux";

import MailTool from "./mailTool";
import ReplyEmail from "./reply";
import EditEmail from "./editEmail";
import ReadEmail from "./readEmail";

import styles from "./Mail.module.css";

function renderPage() {
  const selectedMail = useSelector(selectOpenMail);
  const reply = useSelector(selectedMailToReply);

  if (selectedMail) {
    if (reply) {
      return <ReplyEmail />;
    }
    return <ReadEmail />;
  } else {
    return <EditEmail />;
  }
}

function Mail() {
  return (
    <div className={styles.mail}>
      <MailTool />
      {renderPage()}
    </div>
  );
}

export default Mail;
