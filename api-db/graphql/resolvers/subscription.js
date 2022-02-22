const Subscription = require("../../models/subscription");
const Topic = require("../../models/topic");

const { transformSubscription, transformTopic } = require("./merge");

module.exports = {
  subscriptions: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }
    try {
      const subscriptions = await Subscription.find({ user: req.userId });
      return subscriptions.map((subscription) => {
        return transformSubscription(subscription);
      });
    } catch (err) {
      throw err;
    }
  },
  subscribe: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }
    const fetchedTopic = await Topic.findOne({ _id: args.topicID });
    const exists = await Subscription.findOne({ user: req.userId, topic: args.topicID });
    if (!exists){
    const subscription = new Subscription({
      user: req.userId,
      topic: fetchedTopic,
    });
    const result = await subscription.save();
    return transformSubscription(result);}
  },
  cancelSubscription: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }
    try {
      const subscription = await Subscription.findById(args.subscriptionID).populate("topic");
      const topic = transformTopic(subscription.topic);
      await Subscription.deleteOne({ _id: args.subscriptionID });
      return topic;
    } catch (err) {
      throw err;
    }
  },
};
