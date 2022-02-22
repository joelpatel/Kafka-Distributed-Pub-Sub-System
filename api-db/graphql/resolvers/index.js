const authResolver = require("./auth");
const topicsResolver = require("./topics");
const subscriptionResolver = require("./subscription");

const rootResolver = {
  ...authResolver,
  ...topicsResolver,
  ...subscriptionResolver,
};

module.exports = rootResolver;
