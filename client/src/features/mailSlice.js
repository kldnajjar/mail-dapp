import { createSlice } from "@reduxjs/toolkit";

export const mailSlice = createSlice({
  name: "mail",
  initialState: {
    selectedMail: null,
    sendMessageIsOpen: false,
    folderOpened: "inbox",
    isReply: false,
    emailsList: [],
  },
  reducers: {
    addEmailList: (state, action) => {
      state.emailsList.push(action.payload);
    },
    setFolder: (state, action) => {
      state.folderOpened = action.payload.value;
    },
    selectMail: (state, action) => {
      state.selectedMail = action.payload;
    },
    openSendMessage: (state) => {
      state.sendMessageIsOpen = true;
    },
    closeSendMessage: (state) => {
      state.sendMessageIsOpen = false;
    },
    setReply: (state, action) => {
      state.isReply = action.payload;
    },
  },
});

export const {
  selectMail,
  openSendMessage,
  closeSendMessage,
  setFolder,
  addEmailList,
  setReply,
} = mailSlice.actions;

export const selectOpenMail = (state) => state.mail.selectedMail;
export const selectSendMessageIsOpen = (state) => state.mail.sendMessageIsOpen;
export const selectedMailToReply = (state) => state.mail.isReply;

export default mailSlice.reducer;
