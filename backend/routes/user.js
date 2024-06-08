const express = require("express");
const {
  validateUserSignUpInputs,
  validateUserSignInInputs,
  validateUpdateUserInputs,
} = require("../middlewares/user");
const User = require("../db/user");
const jwt = require("jsonwebtoken");
const { authenticateUser } = require("../middlewares/auth");
const Account = require("../db/account");
const secrets = require("../config/secrets.json");
const JWT_SECRET = secrets?.development?.jwt_secret;
const max = 1000000;
const min = 1;

const router = express.Router();

router.post("/signup", validateUserSignUpInputs, async (req, res) => {
  try {
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

    if (!user) {
      return res.status(400).json({
        message: "There was an error while creating the user",
      });
    }

    const account = await Account.create({
      userId: user._id,
      balance: Math.floor(Math.random() * (max - min + 1)) + min,
    });

    if (!account) {
      return res.status(400).json({
        message:
          "User has been created. But, there was an error while creating the user bank account",
      });
    }

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
  } catch (error) {
    console.error("error", error);
    res.status(400).json({
      message: "There was an error while processing your request",
    });
  }
});

router.post("/signin", validateUserSignInInputs, async (req, res) => {
  try {
    const { username, password } = req?.body || {};
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(411).json({
        message:
          "User not found. Please check wether you provided correct username",
      });
    } else {
      const isInvalidPassword = await user.validatePassword(password);
      if (isInvalidPassword) {
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
  } catch (error) {
    return res
      .status(400)
      .json({
        error: true,
        message: "There was an error while processing your request",
        errorInfo: { message: error?.message, stack: error?.stack },
      });
  }
});

// router.use(authenticateUser);
router.put(
  "/",
  authenticateUser,
  validateUpdateUserInputs,
  async (req, res) => {
    const { userId, body } = req || {};
    const { firstName, lastName, password } = body || {};
    try {
      const user = await User.findOne({ _id: userId });
      if (!user) {
        return res.status(411).json({
          message: "User not found.",
        });
      }
      user.password = password ? await user.createHash(password) : user.password;
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      await user.save();
      res
        .status(200)
        .json({ message: "User info has been updated successfully" });
    } catch (error) {
      res.status(411).json({ message: "Error while updating information.", error });
    }
  }
);

router.get("/bulk", authenticateUser, async (req, res) => {
  try {
    const searchParams = req.query;
    const filterKeyword = searchParams.filter || "";
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

router.use((err, req, res, next) => {
  console.error(err.stack); // Log the error for debugging
  res.status(500).json({ error: err.message }); // Send a response to the client
});

module.exports = router;
