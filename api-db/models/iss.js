const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const issSchema = new Schema(
    {
        name: {
            type: String
        },
        latitude: {
            type: Number
        },
        longitude: {
            type: Number
        },
        altitude: {
            type: Number
        },
        velocity: {
            type: Number
        },
        visibility: {
            type: String
        },
        timestamp: {
            type: Number
        },
    }
)

module.exports = mongoose.model("ISS", issSchema);