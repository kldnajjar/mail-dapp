import React, { useState } from "react";

import { useNavigate } from "react-router-dom";
import useGunContext from "../../context/useGunContext";
import { toast } from "react-toastify";

import styles from "./Signup.module.css";
import Input from "../../components/input";

const SignUp = () => {
  let navigate = useNavigate();
  const { getGun, getUser } = useGunContext();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const pageRedirection = () => {
    navigate("/sign-in", { replace: true });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // check if user with email already exists
    getGun()
      .get(`~@${email}`)
      .once((user) => {
        if (user) {
          toast.error("Email already taken");
        } else {
          getUser().create(email, password, ({ err, pub }) => {
            if (err) {
              console.log(`Error: creating user: ${err}`);
              toast.error(err);
            } else {
              registerNewUser(pub);
            }
          });
        }
      });
  };

  const registerNewUser = (pub) => {
    // add user to user/profile list
    // getGun().get("profiles").get(pub).put({ email, firstName, lastName });
    getGun()
      .get("profiles")
      .get(pub)
      .put({
        email, firstName, lastName
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
