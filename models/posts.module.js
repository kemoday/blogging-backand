const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Postschema = new Schema(
  {
    arthur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail: {
      type: String,
      required: true,
      trim: true,
    },
    comments: [
      {
        text: {
          type: String,
          trim: true,
          required: true,
        },
        votes: {
          type: Number,
          required: true,
          trim: true,
          default: 0,
        },
      },
    ],
    views: {
      trim: true,
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Posts = mongoose.model("Posts", Postschema);

module.exports = Posts;
