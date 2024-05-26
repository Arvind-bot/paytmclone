const express = require("express");
const Account = require("../db/account");
const User = require("../db/user");
const router = express.Router();

router.get("/balance", async (req, res) => {
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

router.post("/transfer", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId } = req || {};
    const { to, amount } = req?.body || {};
    const userAccount = await Account.findOne({ userId }).session(session);
    
    if(!userAccount || userAccount.balance <= amount) {
      throw new Error({ message: "Insufficient balance" });
    }

    const toUserAccount = await Account.findOne({ userId: to }).session(session);
    
    if(!toUserAccount) {
      throw new Error({ message: "Invalid account" });
    }

    userAccount.balance -= amount;
    toUserAccount.balance += amount;
    
    await userAccount.save({ session });
    await toUserAccount.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Transfer successful" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log("error", error);
    res.status(400).json({ message: error?.message || "Error while processing your request." });
  }
})

module.exports = router;
