const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const people_pub = new Schema(
    {
        pubData: {
            type: Object
        },
        pubDate: {
            type: Date
        }
    }
)

module.exports = mongoose.model("PEOPLE_PUB", people_pub);