const express = require("express");
const mongoose = require("mongoose");
const Account = require("../db/account");
const User = require("../db/user");
const { authenticateUser } = require("../middlewares/auth");
const router = express.Router();

router.get("/balance", authenticateUser, async (req, res) => {
  try {
    const { userId } = req || {};
    const userAccount = await Account.findOne({ userId })
    res.status(200).json({
      balance: userAccount?.balance,
    });
  } catch (error) {
    console.log("error", error);
    res.status(400).json({ message: "Error while processing your request." });
  }
})

router.post("/transfer", authenticateUser, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId } = req || {};
    const { to, amount } = req?.body || {};
    const userAccount = await Account.findOne({ userId }).session(session);
    
    if(!userAccount || userAccount.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const toUserAccount = await Account.findOne({ userId: to }).session(session);
    
    if(!toUserAccount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "To user account is invalid" });
    }

    await Account.updateOne({ userId }, { $inc: { balance: -amount } }).session(session);
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    await session.commitTransaction();

    res.status(200).json({ message: "Transfer successful" });
  } catch (error) {
    await session.abortTransaction();
    console.log("error", error);
    res.status(400).json({ error, message: "Error while processing your request." });
  }
})

module.exports = router;
