const express = require("express");
const zod = require("zod");
const {
  validateUserSignUpInputs,
  validateUserSignInInputs,
} = require("../middlewares/user");
const User = require("../db/user");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authenticateUser } = require("../middlewares/auth");

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

router.post("/signin", validateUserSignInInputs, async (req, res) => {
  const { username, password } = req?.body || {};
  const user = await User.findOne({ username: username });
  if (!user) {
    return res.status(411).json({
      message:
        "User not found. Please check wether you provided correct username",
    });
  } else {
    if (await user.validatePassword(password)) {
      const token = jwt.sign(
        { username: user?.username, userId: user?._id },
        JWT_SECRET
      );
      return res.status(200).json({
        token,
      });
    } else {
      return res.status(411).json({
        message: "Incorrect Password",
      });
    }
  }
});
router.use(authenticateUser);
router.put("/", validateUpdateUserInputs, async (req, res) => {
  const { userId, body } = req || {};
  const { firstName, lastName, password } = body || {};
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(411).json({
        message: "User not found.",
      });
    }
    user.password = password ? user.createHash(password) : user.password;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    await user.save();
    res
      .status(200)
      .json({ message: "User info has been updated successfully" });
  } catch (error) {
    res.status(411).json({ message: "Error while updating information." });
  }
});

router.get("/bulk", async (req, res) => {
  try {
    const searchParams = req.query;
    const filterKeyword = searchParams.filter;
    const users = await User.find({
      $or: [
        { firstName: { $regex: filterKeyword, $options: "i" } }, // Case-insensitive match
        { lastName: { $regex: filterKeyword, $options: "i" } }, // Case-insensitive match
      ],
    });
    res.status(200).json({
      users: users.map((user) => ({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id,
      })),
    });
  } catch (error) {
    res.status(411).json({ message: "Error while processing your request." });
  }
});

module.exports = router;
