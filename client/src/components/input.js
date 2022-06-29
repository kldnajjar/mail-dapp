import React from "react";
import styles from "./Input.module.css";

const Input = (props) => {
  return (
    <div className="form-group mb-3">
      <label>{props.label}</label>
      <div className={styles["input-container"]}>
        <input
          type={props.type}
          className={`form-control ${props.className ? props.className : ""} ${
            props.posttext ? styles["post-input-padding"] : ""
          }`}
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
        />
        {props.posttext && (
          <div className={styles["input-post-text"]}>{props.posttext}</div>
        )}
      </div>
    </div>
  );
};

export default Input;
