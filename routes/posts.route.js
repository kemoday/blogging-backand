const Posts = require("../models/posts.module");
const Users = require("../models/users.module");
const router = require("express").Router();
const Joi = require("joi");
const jsonwebtoken = require("jsonwebtoken");

const validatePollData = (req, res, next) => {
  const schema = Joi.object({
    arthur: Joi.string().required(),
    title: Joi.string().required(),
    content: Joi.string().required(),
    summary: Joi.string().required(),
  });

  const { error } = schema.validate(req.body.poll);
  if (error) {
    res.send({ error: true, message: error.details[0].message });
  } else {
    next();
  }
};

const isLoggedIn = async (req, res, next) => {
  if (req.cookies.token) {
    try {
      const { email } = jsonwebtoken.verify(
        req.cookies.token,
        process.env.JWT_SECRET
      );
      return next();
    } catch (error) {
      return res.status(404).send({ error: true, message: "invaild token" });
    }
  } else
    return res
      .status(401)
      .send({ error: true, message: "you are not logged in." });
};
// C : /poll        -> post

router.route("/").post(isLoggedIn, validatePollData, (req, res) => {
  const post = new Posts({ ...req.body });
  post
    .save()
    .then((post) => {
      Users.findOne({ _id: post.arthur }).then((user) => {
        user.posts.unshift(post);
        user.save().then(() => {
          return res.send(post);
        });
      });
    })
    .catch((error) => {
      console.log(error);
      res
        .status(501)
        .send({ error: true, message: "error while adding new post" });
    });
});

router.route("/user/:id").get(async (req, res) => {
  try {
    const posts = await Posts.find({ arthur: req.params.id });
    res.send(posts);
  } catch (error) {
    console.log(error);
    res
      .status(501)
      .send({ error: true, message: "error while adding new post" });
  }
});

router.route("/").get(async (req, res) => {
  try {
    const posts = await Posts.find();
    res.send(posts);
  } catch (error) {
    console.log(error);
    res
      .status(501)
      .send({ error: true, message: "error while adding new post" });
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    const post = await Posts.findOneAndUpdate(
      { _id: req.params.id },
      {
        $inc: { views: 1 },
      },
      { new: true, upsert: true }
    );
    res.send(post);
  } catch (error) {
    console.log(error);
    res
      .status(501)
      .send({ error: true, message: "error while adding new post" });
  }
});

router.route("/:id").delete(async (req, res) => {
  try {
    const post = await Posts.findOneAndRemove({ _id: req.params.id });
    res.send(post);
  } catch (error) {
    console.log(error);
    res
      .status(501)
      .send({ error: true, message: "error while adding new post" });
  }
});

module.exports = router;
