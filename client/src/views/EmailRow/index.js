import React from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

import { Checkbox, IconButton } from "@material-ui/core";
import StarBorderOutlinedIcon from "@material-ui/icons/StarBorderOutlined";
import LabelImportantOutlinedIcon from "@material-ui/icons/LabelImportantOutlined";

import { selectMail, openSendMessage , setNumberOfMessage , setNumberOfNewMessage , selectedFolder } from "../../slices/mailSlice";
import { selectCurrentUser } from "../../slices/userSlice";
import {getCurrentUserAlias} from "../../util/user";
import useGunContext from "../../context/useGunContext";

import styles from "./EmailRow.module.css";

function EmailRow(props) {
  const { getGun , getUser } = useGunContext();
  const user = useSelector(selectCurrentUser);
  const folderName = useSelector(selectedFolder);
  const dispatch = useDispatch();
  const { subject, sender, recipient, body, id, senderEpub, keys, time } =
    props;

  const openMail = async () => {
    const alias = await getCurrentUserAlias(user, getUser);
     getGun()
        .get("accounts")
        .get(alias)
        .get("folders")
        .get(folderName).get("new")
        .once((data) => {
          let array = JSON.parse(data);
          let newArray = array.filter((elem)=>{return elem != id.split("/")[1]});
          dispatch(setNumberOfNewMessage(newArray.length));
          let JsonArray = JSON.stringify(newArray);
          getGun()
            .get("accounts")
            .get(alias)
            .get("folders")
            .get(folderName)
            .put({ new: JsonArray });
        });




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
        <Checkbox className="unused" />
        <IconButton className="unused">
          <StarBorderOutlinedIcon />
        </IconButton>
        <IconButton className="unused">
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
