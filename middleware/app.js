var mongoose = require("mongoose");
var http = require("http");
var app = require("express")();
var server = require("http").Server(app);
var http = require("http").Server(app);
var io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});
var socketio_port = "33334";
var app = require("express")();
var { Kafka } = require("kafkajs");

const Subscription = require("./models/subscription");
const Topic = require("./models/topic");

class consumer_middleware {
  constructor() {
    this.consumer = null;
  }

  async socket_disconnect_handler() {
    await this.consumer.disconnect();
  }

  async broker(socket, userId) {
    try {
      const kafka = new Kafka({
        clientId: String(userId),
        brokers: [
          "kafka1:29092",
          "kafka2:29102",
          "kafka3:29132",
        ], // instead of connecting to all, you can also omit any 2 and connect to a single broker and it'll work as well
      }); // or you can also implement a logic which will randomly connect to any 1 broker.

      this.consumer = kafka.consumer({ groupId: String(userId) });

      // get list of topics
      let topic3 = await Topic.findOne({
        title: "ISS Current Location",
      });
      const IT1K_topic_id = topic3._id;
      let topic2 = await Topic.findOne({
        title: "People Orbiting the Earth",
      });
      const POtE_topic_id = topic2._id;
      let topic1 = await Topic.findOne({
        title: "Astronomy Picture of the Day",
      });
      const APOD_topic_id = topic1._id;

      const subscriptions = await Subscription.find({ user: userId });

      await this.consumer.connect();

      subscriptions.forEach(async (subscription) => {
        if (subscription.topic.toString() == APOD_topic_id.toString()) {
          // subscribe to APOD messages
          const apod_topic = "Astronomy_Picture_of_the_Day";
          await this.consumer.subscribe({ topic: apod_topic });
        }
        if (subscription.topic.toString() == POtE_topic_id.toString()) {
          // subscribe to People messages
          const people_topic = "People_Orbiting_the_Earth";
          await this.consumer.subscribe({ topic: people_topic });
        }
        if (subscription.topic.toString() == IT1K_topic_id.toString()) {
          // subscribe to Iss messages
          const iss_topic = "ISS_Current_Location";
          await this.consumer.subscribe({ topic: iss_topic });
        }
      });

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          // console.log("message_middleware: " + message.value);
          console.log(
            "partition: " +
              partition +
              " ==> topic " +
              topic +
              " ==> message_middleware: " +
              message.value +
              "\n\n\n"
          );
          socket.emit(topic, `${message.value}`);
          socket.emit(String(userId) + "_MESSAGE", `${message.value}`);
          socket.broadcast.emit(
            String(userId) + "_MESSAGE",
            `${message.value}`
          );
        },
      });
    } catch {}
  }
}

mongoose
  .connect(`mongodb://mongo:27017/project2`)
  .then(async () => {
    // socketIO middleware
    io.on("connection", function (socket) {
      console.log("connected to the web client");

      let userId = socket.handshake.query["userId"];
      let new_connection = new consumer_middleware();
      new_connection.broker(socket, userId);

      socket.on("disconnect", async () => {
        console.log("TODO implement disconnect and unsub logic here");

        new_connection.socket_disconnect_handler();
      });
    });

    //Express Web Endpoints / REST API's
    http.listen(socketio_port, function () {
      console.log("listening on *:" + socketio_port);
    });

    const errorTypes = ["unhandledRejection", "uncaughtException"];
    const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2"];

    errorTypes.map((type) => {
      process.on(type, async (e) => {
        try {
          console.log(`process.on ${type}`);
          console.error(e);
          await consumer.disconnect();
          process.exit(0);
        } catch (_) {
          process.exit(1);
        }
      });
    });

    signalTraps.map((type) => {
      process.once(type, async () => {
        try {
          await consumer.disconnect();
        } finally {
          process.kill(process.pid, type);
        }
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });
