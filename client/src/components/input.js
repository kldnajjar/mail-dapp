import React from "react";

const Input = (props) => {
  return (
    <div className="mb-3">
      <label>{props.label}</label>
      <input
        type={props.type}
        className="form-control"
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
      />
    </div>
  );
};

export default Input;
