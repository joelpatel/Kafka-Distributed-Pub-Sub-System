import React from "react";

import "./SubscriptionList.css";

const subscriptionList = (props) => (
  <ul className="subscriptions__list">
    {props.subscriptions.map((subscription) => {
      return (
        <li key={subscription._id} className="subscriptions__item">
          <div className="subscriptions__item-data">
            {subscription.topic.title} -{" "}
            {new Date(subscription.createdAt).toLocaleDateString("en-IN")}
          </div>
          <div className="subscriptions__item-actions">
            <button
              className="btn"
              onClick={props.onDelete.bind(this, subscription._id)}
            >
              Unsubscribe
            </button>
          </div>
        </li>
      );
    })}
  </ul>
);

export default subscriptionList;
