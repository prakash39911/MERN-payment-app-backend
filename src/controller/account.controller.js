import mongoose from "mongoose";
import { Account } from "../models/account.model.js";

const getBalance = async (req, res) => {
  const accountInfo = await Account.find({ userId: req.userId });

  return res.status(200).json(accountInfo[0].balance);
};

const transferFunds = async (req, res) => {
  // There are 2 problems we have to deal while transferring funds---
  // 1. if database or Node Server crashes after first transaction update then this transaction should rollback
  // 2. we have to consider if two transaction request come at almost same time, so simple "if" check will not suffice. It will lead to incorrect data in the database both the users.

  // So to overcome those 2 problems while implementing Fund Transaction, databases offers Transaction. So that either both updation (credit and debit) happens or none of them happen.

  // Start Session
  const session = await mongoose.startSession();

  // Start Transaction
  // Anything after this, either happen together, if not Rollback the transaction. will not partially execute.
  session.startTransaction();

  const { transferTo, amount } = req.body;

  // Checking if user actually exist and he has sufficient funds in his account.
  const transferFromAccount = await Account.findOne({
    userId: req.userId,
  }).session(session);

  if (!transferFromAccount || transferFromAccount.balance < amount) {
    await session.abortTransaction();
    return res.status(400).json({ message: "Insufficient Funds" });
  }

  // is tranfer to account exist or not ?
  const isTransferToAccountExist = await Account.findOne({
    userId: transferTo,
  }).session(session);

  if (!isTransferToAccountExist) {
    await session.abortTransaction();
    return res
      .status(400)
      .json({ message: "Tranfer to account does not exist" });
  }

  // Actual Transcation-- debit one account and credit another account
  await Account.updateOne(
    { userId: req.userId },
    { $inc: { balance: -amount } }
  ).session(session);
  await Account.updateOne(
    { userId: transferTo },
    { $inc: { balance: amount } }
  ).session(session);

  // now we can commit transaction.
  await session.commitTransaction();

  return res.json({ message: "Transaction Successfull" });
};

export { getBalance, transferFunds };
