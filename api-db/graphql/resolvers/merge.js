const DataLoader = require("dataloader");

const Topic = require("../../models/topic");
const User = require("../../models/user");
const { dateToString } = require("../../helpers/date");

const topicLoader = new DataLoader((topicIds) => {
  return topics(topicIds);
});

const userLoader = new DataLoader((userIds) => {
  return User.find({ _id: { $in: userIds } });
});

const topics = async (topicIds) => {
  try {
    const topics = await Topic.find({ _id: { $in: topicIds } });
    topics.sort((a, b) => {
      return (
        topicIds.indexOf(a._id.toString()) - topicIds.indexOf(b._id.toString())
      );
    });
    return topics.map((topic) => {
      return transformTopic(topic);
    });
  } catch (err) {
    throw err;
  }
};

const singleTopic = async (topicId) => {
  try {
    const topic = await topicLoader.load(topicId.toString());
    return topic;
  } catch (err) {
    throw err;
  }
};

const user = async (userId) => {
  try {
    const user = await userLoader.load(userId.toString());
    return {
      ...user._doc,
      _id: user.id,
    };
  } catch (err) {
    throw err;
  }
};

const transformTopic = (topic) => {
  return {
    ...topic._doc,
    _id: topic.id,
    date: dateToString(topic._doc.date),
  };
};

const transformSubscription = (subscription) => {
  return {
    ...subscription._doc,
    _id: subscription.id,
    user: user.bind(this, subscription._doc.user),
    topic: singleTopic.bind(this, subscription._doc.topic),
    createdAt: dateToString(subscription._doc.createdAt),
    updatedAt: dateToString(subscription._doc.updatedAt),
  };
};

exports.user = user;
exports.topics = topics;
exports.singleTopic = singleTopic;
exports.transformTopic = transformTopic;
exports.transformSubscription = transformSubscription;
