import { createSlice } from "@reduxjs/toolkit";

export const mailSlice = createSlice({
  name: "mail",
  initialState: {
    selectedMail: null,
    selectedMessage : null,
    sendMessageIsOpen: false,
    folderOpened: "inbox",
    isReply: false,
    isReplyToAll: false,
    isForward: false,
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
    setMessage : (state, action) => {
      state.selectedMessage = action.payload
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
    setReplyToAll: (state, action) => {
      state.isReplyToAll = action.payload;
    },
    setForward: (state, action) => {
      state.isForward = action.payload;
    },
    resetEmailActions: (state) => {
      state.isReply = false;
      state.isReplyToAll = false;
      state.isForward = false;
    },
  },
});

export const {
  selectMail,
  setMessage,
  openSendMessage,
  closeSendMessage,
  setFolder,
  addEmailList,
  setReply,
  setReplyToAll,
  setForward,
  resetEmailActions,
} = mailSlice.actions;

export const selectOpenMail = (state) => state.mail.selectedMail;
export const selectedMessage = (state) => state.mail.selectedMessage;
export const selectSendMessageIsOpen = (state) => state.mail.sendMessageIsOpen;
export const selectedMailToReply = (state) => state.mail.isReply;
export const selectedMailToReplyAll = (state) => state.mail.isReplyToAll;
export const selectedMailToForward = (state) => state.mail.isForward;

export default mailSlice.reducer;
