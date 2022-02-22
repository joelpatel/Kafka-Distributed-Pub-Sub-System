const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const apod_pub = new Schema(
    {
        pubData: {
            type: Object
        },
        pubDate: {
            type: Date
        }
    }
)

module.exports = mongoose.model("APOD_PUB", apod_pub);