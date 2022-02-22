const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const mongoose = require("mongoose");

const graphQLSchema = require("./graphql/schema/index");
const graphQLResolvers = require("./graphql/resolvers/index");
const isAuth = require("./middleware/is-auth");

const Topic = require("./models/topic");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(isAuth);


app.use(
  "/graphql",
  graphqlHttp({
    schema: graphQLSchema,
    rootValue: graphQLResolvers,
    graphiql: true,
  })
);

mongoose
  .connect(
    `mongodb://mongo:27017/project2`
  )
  .then(async () => {
    let topic = await Topic.findOne({ title: "Astronomy Picture of the Day" });
    console.log("executing topics check");
    if (!topic) {
      const topic = new Topic({
        title: "Astronomy Picture of the Day",
        description:
          "Get NEW Astronomy Picture Every Day.",
        date: new Date(Date.now()),
      });
      await topic.save();
      console.log("topics updated");
    }
    topic = await Topic.findOne({ title: "ISS Current Location" });
    console.log("executing topics check");
    if (!topic) {
      const topic = new Topic({
        title: "ISS Current Location",
        description:
          "Get positional data of International Space Station when it travels 100 kilometers.",
        date: new Date(Date.now()),
      });
      await topic.save();
      console.log("topics updated");
    }
    topic = await Topic.findOne({ title: "People Orbiting the Earth" });
    console.log("executing topics check");
    if (!topic) {
      const topic = new Topic({
        title: "People Orbiting the Earth",
        description:
          "Get updates when there's change in people orbiting the Earth in Low Earth Orbit.",
        date: new Date(Date.now()),
      });
      await topic.save();
      console.log("topics updated");
    }
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });