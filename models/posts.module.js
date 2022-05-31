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
    content: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
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
