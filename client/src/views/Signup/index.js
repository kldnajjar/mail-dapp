import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Input from "../../components/input";
import useGunContext from "../../context/useGunContext";

import styles from "./Signup.module.css";

const SignUp = () => {
  let navigate = useNavigate();
  const { getGun, getUser , getUsersEpub } = useGunContext();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const pageRedirection = () => {
    navigate("/sign-in", { replace: true });
  };

  // function to store all users epub in the database
  const addUsersEpub = (getGun , getUsersEpub , email , pub  ) => {
    getGun().get(`~@${email}`).get(`~${pub}`).once((user) => {
      getUsersEpub().put({[email] : user.epub})
    })

  }

  const handleSubmit = (event) => {
    event.preventDefault();

    getGun()
      .get(`~@${email}`)
      .once((user) => {
        if (user) {
          toast.error("Email already taken");
        } else {
          getUser().create(email, password, ({ err, pub }) => {
            addUsersEpub(getGun , getUsersEpub , email , pub);
            if (err) {
              console.log(`Error: creating user: ${err}`);
              toast.error(err);
            } else {
              registerNewUser(email);
            }
          });
        }
      });
  };

  const registerNewUser = (email) => {
    getGun().get("accounts").get(email).put({
      email,
      firstName,
      lastName,
    });

    getGun().get("accounts").get(email).get("folders").get("inbox").put({
      label: "inbox",
      new  : JSON.stringify([])
    });

    getGun().get("accounts").get(email).get("folders").get("sent").put({
      label: "sent",
    });

    toast.success("User created");
    navigate("/sign-in", { replace: true });
  };

  return (
    <form className={styles.form_container} onSubmit={handleSubmit}>
      <h3>Sign Up</h3>
      <Input
        type="text"
        label="First name"
        placeholder="First name"
        value={firstName}
        onChange={(event) => setFirstName(event.target.value)}
      />

      <Input
        type="text"
        label="Last name"
        placeholder="Last name"
        value={lastName}
        onChange={(event) => setLastName(event.target.value)}
      />

      <Input
        type="text"
        label="Email address"
        placeholder="Email address"
        posttext="@mykloud.io"
        value={email.substring(0, email.indexOf("@mykloud.io"))}
        onChange={(event) => setEmail(`${event.target.value}@mykloud.io`)}
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
          Register
        </button>
      </div>
      <div className="footer-container">
        Already registered
        <button className="link " onClick={pageRedirection}>
          sign in?
        </button>
      </div>
    </form>
  );
};

export default SignUp;
