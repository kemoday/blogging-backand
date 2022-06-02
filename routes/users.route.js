var jwt = require("jsonwebtoken");
const Users = require("./../models/users.module");
const router = require("express").Router();
const Joi = require("joi");
const bcrypt = require("bcrypt");

const validateSinggingupData = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).send({ error: true, message: error.details[0].message });
  } else {
    next();
  }
};

const isLoggedIn = (req, res, next) => {
  if (req.cookies.token) {
    try {
      jwt.verify(req.cookies.token, process.env.JWT_SECRET);
      return res
        .status(401)
        .send({ error: true, message: "you are already logged in." });
    } catch (error) {
      res
        .status(404)
        .clearCookie("token")
        .send({ error: true, message: "invaild token" });
    }
  } else next();
};

const validateSingginData = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.send({ error: true, message: error.details[0].message });
  } else {
    next();
  }
};

router
  .route("/signup")
  .post(isLoggedIn, validateSinggingupData, async (req, res) => {
    const hashed_password = await bcrypt.hash(req.body.password, 10);
    const hashed_body = { ...req.body, password: hashed_password, posts: [] };

    const new_user = new Users(hashed_body);
    new_user
      .save()
      .then((user) => {
        const token = jwt.sign(
          { email: req.body.email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        res
          .status(201)
          .cookie("token", token, {
            maxAge: 1000 * 60 * 60 * 60,
            secure: false,
            httpOnly: false,
          })
          .send(user);
      })
      .catch((error) => {
        console.log(error);
        if (error.code == "11000")
          res
            .status(400)
            .send({ error: true, message: "email already exists." });
        else
          res
            .status(500)
            .send({ error: true, message: "error while adding new user" });
      });
  });

router.route("/signin").post(validateSingginData, async (req, res) => {
  const user_password = req.body.password;
  const user_email = req.body.email;

  try {
    const user = await Users.findOne({ email: user_email })
      .populate({
        path: "polls",
        model: "Polls",
      })
      .exec();

    if (user === null)
      return res
        .status(404)
        .send({ error: true, message: "user is not found" });

    if (bcrypt.compare(user_password, user.password)) {
      const token = jwt.sign(
        { email: req.body.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res
        .cookie("token", token, {
          maxAge: 1000 * 60 * 60 * 60,
          secure: false,
          httpOnly: false,
        })
        .send(user);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: true, message: "error while logging in" });
  }
});

router.route("/info").get(async (req, res) => {
  console.log("cookies", req.cookies);
  if (req.cookies.token) {
    jwt.verify(
      req.cookies.token,
      process.env.JWT_SECRET,
      function (err, decoded) {
        if (err) {
          return res
            .status(401)
            .clearCookie("token")
            .send({ error: true, message: "jwt token expired." });
        } else {
          Users.findOne({ email: decoded.email }, (err, user) => {
            if (err) {
              res.status(500).send(err);
            } else {
              delete user._doc.posts;
              res.send(user);
            }
          });
        }
      }
    );
  } else res.send("you are not sigen in.");
});

router.route("/signout").get((req, res) => {
  res.status(200).clearCookie("token").send();
});

module.exports = router;
