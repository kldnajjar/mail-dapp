import React from "react";

import Navigator from "./Navigator";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <>
      <Navigator />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default App;
