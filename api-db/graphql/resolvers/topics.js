const Topic = require("../../models/topic");
const User = require("../../models/user");
const { transformTopic } = require("./merge");

module.exports = {
  topics: async () => {
    try {
      const topics = await Topic.find();
      return topics.map((topic) => {
        return transformTopic(topic);
      });
    } catch (err) {
      throw err;
    }
  },
  createTopic: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }
    const topic = new Topic({
      title: args.topicInput.title,
      description: args.topicInput.description,
      date: new Date(args.topicInput.date),
    });
  },
};