import { configureStore } from "@reduxjs/toolkit";
import mailReducer from "../slices/mailSlice";
import userReducer from "../slices/userSlice";

export const store = configureStore({
  reducer: {
    mail: mailReducer,
    user: userReducer,
  },
});
