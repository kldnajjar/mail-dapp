import React from "react";

import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import ErrorIcon from "@material-ui/icons/Error";
import DeleteIcon from "@material-ui/icons/Delete";
import EmailIcon from "@material-ui/icons/Email";
import WatchLaterIcon from "@material-ui/icons/WatchLater";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import LabelImportantIcon from "@material-ui/icons/LabelImportant";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import UnfoldMoreIcon from "@material-ui/icons/UnfoldMore";
import PrintIcon from "@material-ui/icons/Print";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { IconButton } from "@material-ui/core";

import { useDispatch } from "react-redux";
import { closeSendMessage } from "../../features/mailSlice";

import styles from "./Mail.module.css";

function MailTool() {
  const dispatch = useDispatch();

  return (
    <div className={styles["mail-tools"]}>
      <div className={styles["mail-toolsLeft"]}>
        <IconButton onClick={() => dispatch(closeSendMessage())}>
          <ArrowBackIcon />
        </IconButton>

        <IconButton>
          <MoveToInboxIcon />
        </IconButton>

        <IconButton>
          <ErrorIcon />
        </IconButton>

        <IconButton>
          <DeleteIcon />
        </IconButton>

        <IconButton>
          <EmailIcon />
        </IconButton>

        <IconButton>
          <WatchLaterIcon />
        </IconButton>

        <IconButton>
          <CheckCircleIcon />
        </IconButton>

        <IconButton>
          <LabelImportantIcon />
        </IconButton>

        <IconButton>
          <MoreVertIcon />
        </IconButton>
      </div>
      <div className={styles["mail-toolsRight"]}>
        <IconButton>
          <UnfoldMoreIcon />
        </IconButton>

        <IconButton>
          <PrintIcon />
        </IconButton>

        <IconButton>
          <ExitToAppIcon />
        </IconButton>
      </div>
    </div>
  );
}

export default MailTool;
