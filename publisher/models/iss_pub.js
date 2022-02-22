const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const iss_pub = new Schema(
    {
        // userId: {
        //     type: Schema.Types.ObjectId
        // },
        pubData: {
            type: Object
        },
        pubDate: {
            type: Date
        }
    }
)

module.exports = mongoose.model("ISS_PUB", iss_pub);