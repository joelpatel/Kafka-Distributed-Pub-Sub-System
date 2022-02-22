import React from "react";

import "./SubscriptionsControls.css";

const subscriptionsControls = (props) => (
  <div className="subscriptions-controls__controls">
    <button
      className={props.activeButton === "list" ? "active" : ""}
      onClick={props.changeOutputTypeHandler.bind(this, "list")}
    >
      List
    </button>
    {/* <button
      className={props.activeButton === "chart" ? "active" : ""}
      onClick={props.changeOutputTypeHandler.bind(this, "chart")}
    >
      Chart
    </button> */}
  </div>
);

export default subscriptionsControls;
