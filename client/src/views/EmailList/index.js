import { Checkbox, IconButton } from "@material-ui/core";
import React, { useEffect, useState, useCallback } from "react";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import RedoIcon from "@material-ui/icons/Redo";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import KeyboardHideIcon from "@material-ui/icons/KeyboardHide";
import SettingsIcon from "@material-ui/icons/Settings";
import InboxIcon from "@material-ui/icons/Inbox";
import PeopleIcon from "@material-ui/icons/People";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import Section from "../Section";
import EmailRow from "../EmailRow";
import styles from "./EmailList.module.css";
import useGunContext from "../../context/useGunContext";
import { decryption } from "../../util/privacy";
import { useSelector , useDispatch } from "react-redux";
import { addEmailList, closeSendMessage } from "../../features/mailSlice";
import "gun/sea";
import "gun/lib/path.js"

// import { db } from "../../firebase";

function EmailList() {
  const dispatch = useDispatch();
  const [emails, setEmails] = useState([]);
  const { getGun, getUser } = useGunContext();
  const folder = useSelector(state=>state?.mail?.folderOpened);
  const emailsList = useSelector(state=>state?.mail?.emailsList);
  const profile = JSON.parse(sessionStorage.getItem("profile"));

  async function getCurrentUserAlias(getUser) {
    let name
    await getUser().get("alias").once((alias) => {
      name = alias
    });
    return name
  }

  async function getAllEmails(getGun, getUser, profile) {
    const alias = await getCurrentUserAlias(getUser)
    await getGun().get("profiles").get(alias).get("folders").get("inbox").once( async (data)=>{
      delete data.label;
      if (data) {
        const Array = Object.keys(data).slice(1);
        console.log(Array)
      
        var startTime = performance.now()
        if (Array.length) {
          const yy = []
          for (let i = 0; i < Array.length; i++) {
            const conversation = await decryption(Array[i], getGun, getUser, profile.email);
            yy.push(conversation)
          }
          setEmails(yy)
          var endTime = performance.now()
          console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)
        }
      } else {
        // TODO: Show new UI when there is no emails
      }
    })
  }

  useEffect( async () => {
    getAllEmails(getGun, getUser, profile)
  }, []);

  return (
    <div className={styles.emailList}>
      <div className={styles["emailList-settings"]}>
        <div className={styles["emailList-settingsLeft"]}>
          <Checkbox />
          <IconButton>
            <ArrowDropDownIcon />
          </IconButton>
          <IconButton>
            <RedoIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </div>
        <div className={styles["emailList-settingsRight"]}>
          <IconButton>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton>
            <ChevronRightIcon />
          </IconButton>
          <IconButton>
            <KeyboardHideIcon />
          </IconButton>
          <IconButton>
            <SettingsIcon />
          </IconButton>
        </div>
      </div>
      {/* <div className={styles["emailList-sections"]}>
        <Section Icon={InboxIcon} title="Primary" color="red" selected />
        <Section Icon={PeopleIcon} title="Social" color="#1A73E8" />
        <Section Icon={LocalOfferIcon} title="Promotions" color="green" />
      </div> */}

      {/* <div>
        {emailsList.map((elem)=>{
          return <p>{elem}</p>
        })}
      </div>

      <button onClick={()=>{
        getGun().get("profiles").get("omar@mykloud.io").get("folders").get("inbox").put({
          test : "1"
        })
      }}>TEST</button> */}


  
      <div className={styles["emailList-list"]}>
        {emails?.map(({ subject, sender, body }, reactKey) => (
          <EmailRow
            key={`email-row-${reactKey}`}
            sender={sender}
            // recipient={recipient}
            subject={subject}
            body={body}
            // time={new Date(timestamp?.seconds * 1000).toUTCString()}
          />
        ))}
      </div>
    </div>
  );
}

export default EmailList;
