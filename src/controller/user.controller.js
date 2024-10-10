import { z } from "zod";
import { User } from "../models/user.model.js";
import { Account } from "../models/account.model.js";

const userValidationSchema = z.object({
  email: z.string().email(),
  firstname: z.string(),
  lastname: z.string(),
  password: z
    .string()
    .min(8, { message: "Password must be atleast 8 characters long" }),
});

const SignUp = async (req, res) => {
  try {
    const { email, firstname, lastname, password } = req.body;

    userValidationSchema.parse({
      email: email,
      firstname: firstname,
      lastname: lastname,
      password: password,
    });

    const isUserExists = await User.findOne({ email: email });

    if (isUserExists) {
      return res.json({ message: "User Already Exists" });
    }

    const newUser = await User.create({
      email,
      firstname,
      lastname,
      password,
    });

    const isUserCreated = await User.findById(newUser._id).select("-password");

    if (!isUserCreated) {
      throw new Error("User was not created successfully");
    }

    await Account.create({
      userId: isUserCreated._id,
      balance: Math.ceil(Math.random() * 10000),
    });

    res
      .status(200)
      .json({ message: "User Created Successfully", isUserCreated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const LogIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.log("Please provide email and password");
  }

  const userExists = await User.findOne({ email: email });

  if (!userExists) {
    return res.status(400).json({ message: "Incorrect Username and Password" });
  }

  const passwordMatch = await userExists.isPasswordCorrect(password);

  if (!passwordMatch) {
    return res.status(400).json({ message: "Incorrect Username and Password" });
  }

  const jwtToken = await userExists.generateAccessToken();

  res.status(200).json({ message: "Login Successfull", jwtToken });
};

const userUpdateSchema = z.object({
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  password: z
    .string()
    .min(8, { message: "Minimum length of password is 8" })
    .optional(),
});

const updateProfile = async (req, res) => {
  const { success } = userUpdateSchema.safeParse(req.body);

  if (!success) {
    res.status(411).json({ message: "Error while updating information" });
  }

  const userFound = await User.findOne({ _id: req.userId });

  if (req.body.firstname) userFound.firstname = req.body.firstname;
  if (req.body.lastname) userFound.lastname = req.body.lastname;
  if (req.body.password) userFound.password = req.body.password;

  await userFound.save();

  res.status(200).json({ message: "User Updated Successfully", userFound });
};

const getAllUserDoc = async (req, res) => {
  const filter = req.query.filterName || "";

  const docs = await User.find({
    $or: [
      {
        firstname: {
          $regex: filter,
        },
      },
      {
        lastname: {
          $regex: filter,
        },
      },
    ],
  });

  let document = docs.map((eachDoc) => ({
    email: eachDoc.email,
    firstname: eachDoc.firstname,
    lastname: eachDoc.lastname,
    _id: eachDoc._id,
  }));

  res.status(200).json({
    document: document,
  });
};

const getCurrentUser = async (req, res) => {
  if (!req.userId) {
    return res.status(400).json({ message: "No Current user Exist" });
  }

  const userDoc = await User.findById(req.userId).select("-password");

  return res
    .status(200)
    .json({ message: "Current user fetched successfully", userData: userDoc });
};

export { SignUp, LogIn, updateProfile, getAllUserDoc, getCurrentUser };
