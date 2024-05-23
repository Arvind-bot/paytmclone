const express = require("express");
const zod = require("zod");
const { validateUserSignUpInputs, validateUserSignInInputs } = require("../middlewares/user");
const User = require("../db/user");
const { JWT_SECRET } = require("../config");

const router = express.Router();

router.post("/signup", validateUserSignUpInputs, async (req, res) => {
  const { body } = req || {};
  const { username, password, firstName, lastName } = body || {};
  const userAlreadyExist = await User.findOne({ username });
  if (userAlreadyExist) {
    res.status(411).json({
      message:
        "username/Email already taken, please try with different username/email",
    });
    return;
  }

  const newUser = new User({
    username,
    firstName,
    lastName,
  });
  newUser.password = await newUser.createHash(password);
  const user = await newUser.save();

  const token = jwt.sign(
    {
      userId: user?._id,
    },
    JWT_SECRET
  );

  res.status(200).json({
    message: "User created successfully",
    token,
  });
});

router.post("/signup", validateUserSignInInputs, async (req, res) => {
  const {  username, password } = req?.body || {};
  const user = await User.findOne({ username: username });
  if (!user) {
    return res.status(411).json({
      message: "User not found. Please check wether you provided correct username",
    });
  } else {
    if (await user.validatePassword(password)) {
      const token = jwt.sign({ username: user?.username, userId: user?._id }, JWT_SECRET);
      return res.status(200).json({
        token
      });
    } else {
      return res.status(411).json({
        message: "Incorrect Password",
      });
    }
  }
});

module.exports = router;
