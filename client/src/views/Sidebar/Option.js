import React from "react";

import styles from "./Option.module.css";

function SidebarOption({
  Icon,
  title,
  number,
  selected,
  onClick,
  customClassName,
}) {
  return (
    <div
      className={`${styles.sidebarOption} ${
        selected && styles["sidebarOption--active"]
      } ${customClassName}`}
      onClick={onClick}
    >
      <Icon />
      <h3 className="mb-0">{title}</h3>
      <p className="mb-0">{number}</p>
    </div>
  );
}

export default SidebarOption;
