import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import { GunContextProvider } from "./context/useGunContext";
import { store } from "./app/store";
import App from "./App";

import "broadcastchannel-polyfill";
import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";
import "./styles/general.css";

ReactDOM.render(
  <BrowserRouter>
    <Provider store={store}>
      <GunContextProvider>
        <App />
      </GunContextProvider>
    </Provider>
  </BrowserRouter>,
  document.getElementById("root")
);

module.hot.accept();
