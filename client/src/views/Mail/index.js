import React from "react";
import {
  selectedMailToForward,
  selectedMailToReply,
  selectOpenMail,
} from "../../features/mailSlice";
import { useSelector } from "react-redux";

import MailTool from "./mailTool";
import ReplyEmail from "./reply";
import ForwardEmail from "./forward";
import EditEmail from "./composeEmail";
import ReadEmail from "./readEmail";

import styles from "./Mail.module.css";

function renderPage() {
  const selectedMail = useSelector(selectOpenMail);
  const isReply = useSelector(selectedMailToReply);
  const isForward = useSelector(selectedMailToForward);
  console.log("khaled", isReply, isForward);
  if (selectedMail) {
    if (isReply) {
      return <ReplyEmail />;
    } else if (isForward) {
      return <ForwardEmail />;
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
