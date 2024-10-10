import express from "express";
import connectToDatabase from "./db/connection.js";
import userRouter from "./router/user.router.js";
import cors from "cors";
import accountRouter from "./router/account.router.js";

const app = express();

connectToDatabase()
  .then((res) => {
    console.log("MongoDB Connected Successfully");
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server Started on ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log("MongoDB Connection error", err));

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Health OK !" });
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/account", accountRouter);
