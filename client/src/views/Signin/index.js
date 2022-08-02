import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Input from "../../components/input";
import useGunContext from "../../context/useGunContext";
import useSessionChannel from "../../hooks/useSessionChannel";
import { setUser } from "../../slices/userSlice";

import styles from "./Signin.module.css";

const SignIn = () => {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const sessionChannel = useSessionChannel();

  const { getGun, getUser } = useGunContext();
  const user = JSON.parse(sessionStorage.getItem("account"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      pageRedirection("/account");
    }
  }, []);

  const pageRedirection = (page) => {
    navigate(page, { replace: true });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    getUser().auth(email, password, ({ err }) => {
      if (err) {
        return toast.error(err);
      }
      loginSuccess();
    });
  };

  const loginSuccess = () => {
    sessionChannel.postMessage({
      eventName: "I_HAVE_CREDS",
      value: window.sessionStorage.getItem("pair"),
    });

    getGun()
      .get("accounts")
      .get(getUser().is.alias)
      .once((user) => {
        if (!user) {
          return toast.error("Please retry login")
        }
        sessionStorage.setItem("account", JSON.stringify(user));
        dispatch(setUser(user));
        pageRedirection("/account");
      });
  };

  const renderLogin = () => {
    return (
      <form className={styles.form_container} onSubmit={handleSubmit}>
        <h3>Sign In</h3>

        <Input
          type="email"
          label="Email address"
          placeholder="Enter email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <Input
          type="password"
          label="Password"
          placeholder="Enter password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
        <div className="footer-container">
          Don't have an account
          <button className="link " onClick={() => pageRedirection("/sign-up")}>
            register
          </button>
        </div>
      </form>
    );
  };

  return <>{renderLogin()}</>;
};

export default SignIn;
