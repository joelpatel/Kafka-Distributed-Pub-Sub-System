const { Kafka } = require("kafkajs");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");


const ISS_PUB = require("./models/iss_pub");
const PEOPLE_PUB = require("./models/people_pub");
const APOD_PUB = require("./models/apod_pub");

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



mongoose
  .connect(
    `mongodb://mongo:27017/project2`
  )
  .then(async () => {
    const apod_url =
      "https://api.nasa.gov/planetary/apod?api_key=qGtlaG4RHfbMjEmvfh4dEZcWD8YnErOOPjHQkKsu";
    const people_url = "http://api.open-notify.org/astros.json";
    const iss_url = "https://api.wheretheiss.at/v1/satellites/25544";

    // kafka producers setup ⤵️

    const kafka1 = new Kafka({
      clientId: "apod-producer",
      brokers: ["kafka1:29092"],
      connectionTimeout: 80000,
      retry: {
        retries:1000
      }
    });
    const admin1 = kafka1.admin();
    await admin1.connect();

    await admin1.createTopics({
      topics: [
        {
          topic: "Astronomy_Picture_of_the_Day",
        },
      ],
    });
    console.log("1 Partitions of Astronomy Picture of the Day created.");
    await admin1.disconnect();
    const producer1 = kafka1.producer();
    await producer1.connect();
    console.log("Producer1 connected");


    const kafka2 = new Kafka({
      clientId: "people-producer",
      brokers: ["kafka2:29102"],
      connectionTimeout: 80000,
      retry: {
        retries:1000
      }
    });
    const admin2 = kafka2.admin();
    await admin2.connect();

    await admin2.createTopics({
      topics: [
        {
          topic: "People_Orbiting_the_Earth",
        },
      ],
    });
    console.log("1 Partitions of People Orbiting the Earth created.");
    await admin2.disconnect();
    const producer2 = kafka2.producer();
    await producer2.connect();
    console.log("Producer2 connected");


    const kafka3 = new Kafka({
      clientId: "iss-producer",
      brokers: ["kafka3:29132"],
      connectionTimeout: 80000,
      retry: {
        retries:1000
      }
    });
    const admin3 = kafka3.admin();
    await admin3.connect();

    await admin3.createTopics({
      topics: [
        {
          topic: "ISS_Current_Location",
          numPartitions: 2,
          replicationFactor: 2, // default: 1
        },
      ],
    });
    console.log("2 Partitions of ISS Current Location created.");
    let metadata = await admin3.fetchTopicMetadata()
    metadata.topics.forEach(topic => {
      console.log(topic.partitions)
    })
    await admin3.disconnect();
    const producer3 = kafka3.producer();
    await producer3.connect();
    console.log("Producer3 connected");

    try {
      setInterval(() => {
        console.log("inside interval");
        const promise1 = axios.get(apod_url);
        const promise2 = axios.get(people_url);
        const promise3 = axios.get(iss_url);

        axios
          .all([promise1, promise2, promise3])
          .then(
            axios.spread(async (...responses) => {
              const responseOne = responses[0];
              const responseTwo = responses[1];
              const responseThree = responses[2];

              if (responseThree) {
                ISS_PUB.findOne()
                  .sort({ pubDate: -1 })
                  .exec(async (err, lastEntry) => {
                    if (lastEntry) {
                      let storedLat = lastEntry.pubData.latitude;
                      let storedLong = lastEntry.pubData.longitude;

                      let currentLat = responseThree.data.latitude;
                      let currentLong = responseThree.data.longitude;

                      const R = 6371e3; // metres
                      const φ1 = (currentLat * Math.PI) / 180; // φ, λ in radians
                      const φ2 = (storedLat * Math.PI) / 180;
                      const Δφ = ((storedLat - currentLat) * Math.PI) / 180;
                      const Δλ = ((storedLong - currentLong) * Math.PI) / 180;

                      const a =
                        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                        Math.cos(φ1) *
                          Math.cos(φ2) *
                          Math.sin(Δλ / 2) *
                          Math.sin(Δλ / 2);
                      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                      const d = (R * c) / 1000; // in metres

                      if (d >= 100) {
                        const iss_pub = new ISS_PUB({
                          pubData: responseThree.data,
                          pubDate: new Date(Date.now()),
                        });
                        await iss_pub.save();
                        
                        
                        const producedData = await producer3.send({
                          topic: "ISS_Current_Location",
                          messages: [
                            {
                              value: JSON.stringify(responseThree.data),
                              partition: responseThree.data.visibility == "daylight" ? 0 : 1,       // if daylight then in partition 0
                            },                                                                      // else             in partition 1
                          ],
                        });
                        console.log(`Produced data ${JSON.stringify(producedData)}`);

                      }
                    } else {
                      const iss_pub = new ISS_PUB({
                        pubData: responseThree.data,
                        pubDate: new Date(Date.now()),
                      });
                      await iss_pub.save();

                      let latitude = Math.floor(responseThree.data.latitude)
                      const producedData = await producer3.send({
                        topic: "ISS_Current_Location",
                        messages: [
                          {
                            value: JSON.stringify(responseThree.data),
                            partition: responseThree.data.visibility == "daylight" ? 0 : 1,       // if daylight then in partition 0
                          },                                                                      // else             in partition 1
                        ],
                      });
                      console.log(`Produced data ${JSON.stringify(producedData)}`);
                    }
                  });
              }

              if (responseTwo) {
                console.log("inside people pub response")
                PEOPLE_PUB.findOne()
                  .sort({ pubDate: -1 })
                  .exec(async (err, lastEntry) => {
                    if (lastEntry) {
                      let storedPeople = lastEntry.pubData.people;
                      let currentPeople = responseTwo.data.people;
                      if (
                        JSON.stringify(storedPeople) !==
                        JSON.stringify(currentPeople)
                      ) {
                        const people_pub = new PEOPLE_PUB({
                          pubData: responseTwo.data,
                          pubDate: new Date(Date.now()),
                        });
                        await people_pub.save();

                        const producedData = await producer2.send({
                          topic: "People_Orbiting_the_Earth",
                          messages: [
                            {
                              value: JSON.stringify(responseTwo.data),
                              partition: 0,
                            },
                          ],
                        });
                        console.log(`Produced data ${JSON.stringify(producedData)}`);

                      } else if (
                        JSON.stringify(storedPeople) ==   // NOTE ==> remove this else if block if you want actual new events functionality
                        JSON.stringify(currentPeople)     // the people topic doesn't get updates very often so it won't produce/publish data to the broker network
                      ) {                                 // thus it won't be visible at the frontend
                        const people_pub = new PEOPLE_PUB({    // instead, constantly publishing data will get it to the users (albeit it won't be a new event) 
                          pubData: responseTwo.data,
                          pubDate: new Date(Date.now()),
                        });
                        await people_pub.save();

                        const producedData = await producer2.send({
                          topic: "People_Orbiting_the_Earth",
                          messages: [
                            {
                              value: JSON.stringify(responseTwo.data),
                              partition: 0,
                            },
                          ],
                        });
                        console.log(`Produced data ${JSON.stringify(producedData)}`);

                      }
                    } else {
                      const people_pub = new PEOPLE_PUB({
                        pubData: responseTwo.data,
                        pubDate: new Date(Date.now()),
                      });
                      await people_pub.save();

                      const producedData = await producer2.send({
                        topic: "People_Orbiting_the_Earth",
                        messages: [
                          {
                            value: JSON.stringify(responseTwo.data),
                            partition: 0,
                          },
                        ],
                      });
                      console.log(`Produced data ${JSON.stringify(producedData)}`);

                    }
                  });
              }

              if (responseOne) {
                APOD_PUB.findOne()
                  .sort({ pubDate: -1 })
                  .exec(async (err, lastEntry) => {
                    if (lastEntry) {
                      let storedURL = lastEntry.pubData.url;
                      let currentURL = responseOne.data.url;
                      if (
                        JSON.stringify(storedURL) !== JSON.stringify(currentURL)
                      ) {
                        const apod_pub = new APOD_PUB({
                          pubData: responseOne.data,
                          pubDate: new Date(Date.now()),
                        });
                        await apod_pub.save();

                        const producedData = await producer1.send({
                          topic: "Astronomy_Picture_of_the_Day",
                          messages: [
                            {
                              value: JSON.stringify(responseOne.data),
                              partition: 0,
                            },
                          ],
                        });
                        console.log(`Produced data ${JSON.stringify(producedData)}`);


                      } else if (
                        JSON.stringify(storedURL) == JSON.stringify(currentURL)   // NOTE ==> remove this else if block if you want actual new events functionality
                      ) {                                                         // the picture topic doesn't get updates very often so it won't produce/publish data to the broker network
                        const apod_pub = new APOD_PUB({                           // thus it won't be visible at the frontend
                          pubData: responseOne.data,                              // instead, constantly publishing data will get it to the users (albeit it won't be a new event) 
                          pubDate: new Date(Date.now()),
                        });
                        await apod_pub.save();

                        const producedData = await producer1.send({
                          topic: "Astronomy_Picture_of_the_Day",
                          messages: [
                            {
                              value: JSON.stringify(responseOne.data),
                              partition: 0,
                            },
                          ],
                        });
                        console.log(`Produced data ${JSON.stringify(producedData)}`);


                      }
                    } else {
                      const apod_pub = new APOD_PUB({
                        pubData: responseOne.data,
                        pubDate: new Date(Date.now()),
                      });
                      await apod_pub.save();

                      const producedData = await producer1.send({
                        topic: "Astronomy_Picture_of_the_Day",
                        messages: [
                          {
                            value: JSON.stringify(responseOne.data),
                            partition: 0,
                          },
                        ],
                      });
                      console.log(`Produced data ${JSON.stringify(producedData)}`);



                    }
                  });
              }
            })
          )
          .catch((errors) => {
            console.log(errors);
          });
      }, 2000);
    } catch (err) {}

    app.listen(5005);
  })
  .catch((err) => {
    console.log(err);
  });
