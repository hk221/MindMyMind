import React from "react";

function MockupHousing(props) {
  return (
    <div
      style={{
        ...props.style,
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: 500,
          height: 500,
          outline: 2,
          outlineColor: "black",
          display: "flex",
          borderStyle: "solid",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {props.children}
      </div>
      <div>
        <h2>Instance {props.number}</h2>
      </div>
    </div>
  );
}

export default MockupHousing;
