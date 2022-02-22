import React from "react";

import "./TopicItem.css";

const topicItem = (props) => (
  <li key={props.topicId} className="topics__list-item">
    <div>
      <h2>{props.title}</h2>
      {/* <em>{props.description}</em>
      <br /> */}
    </div>
    <div>
        <button
          className="btn"
          onClick={props.onDetail.bind(this, props.topicId)}
        >
          View Details
        </button>
      
    </div>
  </li>
);

export default topicItem;
