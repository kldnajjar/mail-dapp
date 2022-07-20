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
import Compose from "./compose";
import Conversation from "./conversation";

import styles from "./Mail.module.css";

function renderPage() {
  const selectedMail = useSelector(selectOpenMail);
  const isReply = useSelector(selectedMailToReply);
  const isForward = useSelector(selectedMailToForward);
  
  if (selectedMail) {
    if (isReply) {
      return <ReplyEmail />;
    } else if (isForward) {
      return <ForwardEmail />;
    }
    return <Conversation />;
  } else {
    return <Compose />;
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
