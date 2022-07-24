import React from "react";
import { useSelector } from "react-redux";

import {
  selectedMailToForward,
  selectedMailToReply,
  selectedMailToReplyAll,
  selectOpenMail,
} from "../../slices/mailSlice";
import Tool from "./tool";
import Reply from "./reply";
import ReplyToAll from "./replyToAll";
import Forward from "./forward";
import Compose from "./compose";
import Conversation from "./conversation";

import styles from "./Mail.module.css";

function renderPage() {
  const selectedMail = useSelector(selectOpenMail);
  const isReply = useSelector(selectedMailToReply);
  const isReplyToAll = useSelector(selectedMailToReplyAll);
  const isForward = useSelector(selectedMailToForward);

  if (selectedMail) {
    if (isReply) {
      return <Reply />;
    } else if (isReplyToAll) {
      return <ReplyToAll />;
    } else if (isForward) {
      return <Forward />;
    }
    return <Conversation />;
  } else {
    return <Compose />;
  }
}

function Mail() {
  return (
    <div className={styles.mail}>
      <Tool />
      {renderPage()}
    </div>
  );
}

export default Mail;
