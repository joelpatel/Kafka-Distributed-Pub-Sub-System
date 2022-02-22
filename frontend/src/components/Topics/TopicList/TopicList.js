import React from "react";

import TopicItem from "./TopicItem/TopicItem";
import "./TopicList.css";

const topicList = (props) => {
  const topics = props.topics.map((topic) => {
    return (
      <TopicItem
        key={topic._id}
        topicId={topic._id}
        title={topic.title}
        description={topic.description}
        date={topic.date}
        userId={props.authUserId}
        onDetail={props.onViewDetail}
      />
    );
  });

  return <ul className="topic_list">{topics}</ul>;
};

export default topicList;