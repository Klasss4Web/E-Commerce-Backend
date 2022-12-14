import express from "express";
import asyncHandler from "express-async-handler";
import { adminOnly, protect } from "../middleware/authMidedleware.js";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import sgMail from "@sendgrid/mail";

const userRoute = express.Router();

const API_KEY =
  "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";

sgMail.setApiKey(API_KEY);

//LOGIN
userRoute.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if(user?.status.toLowerCase() === "active") {
        res.status(200).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          userType: user.userType,
          createdAt: user.createdAt,
          token: generateToken(user._id),
        });
      } else {
        res.status(401)
        throw new Error(`Your account is ${user?.status}, contact admin`)
      }
    } else {
      res.status(401);
      throw new Error("Invalid Email or Password");
    }
  })
);

//REGISTER
userRoute.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user?._id,
        name: user?.name,
        email: user?.email,
        image: user?.image,
        isAdmin: user?.isAdmin,
        userType: user?.userType,
        createdAt: user?.createdAt,
        token: generateToken(user?._id),
      });

      const message = {
        to: email,
        from: {
          name: "Ochade's Ecommerce",
          email: "eochade15@gmail.com",
        },
        message: "Account creation on Ochade's commerce",
        text: "Your account have been successfully created",
      };

      sgMail
        .send(message)
        .then((response) => {
          console.log("response", response, "Email sent");
        })
        .catch((error) => console.log("Error sending mail", error.response));
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  })
);

//ADMIN CREATE USERS
userRoute.post(
  "/admin/create-user",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { name, email, password, userType, image } = req.body;
    const userExists = await User.findOne({ email });

    const isAdmin = userType === "admin" ? true : false;

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      image,
      isAdmin,
      password,
      userType,
    });

    if (user) {
      res.status(201).json({
        _id: user?._id,
        name: user?.name,
        email: user?.email,
        image: user?.image,
        isAdmin: user?.isAdmin,
        userType: user?.userType,
        createdAt: user?.createdAt,
        token: generateToken(user?._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  })
);

//PROFILE
userRoute.get(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    // res.send("User Profile")
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user?.image,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

//UPDATE PROFILE
userRoute.put(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    // res.send("User Profile")
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req?.body?.name || user?.name;
      user.email = req?.body?.email || user?.email;
      user.image = req?.body?.image || user?.image;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updateUser = await user.save();
      res.json({
        _id: updateUser._id,
        name: updateUser.name,
        email: updateUser.email,
        isAdmin: updateUser.isAdmin,
        createdAt: updateUser.createdAt,
        token: generateToken(updateUser._id),
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

//UPDATE ADMIN PROFILE
userRoute.put(
  "/admin/profile",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    // res.send("User Profile")
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req?.body?.name || user?.name;
      user.email = req?.body?.email || user?.email;
      user.image = req?.body?.image || user?.image;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updateUser = await user.save();
      res.json({
        _id: updateUser._id,
        name: updateUser.name,
        email: updateUser.email,
        isAdmin: updateUser.isAdmin,
        createdAt: updateUser.createdAt,
        token: generateToken(updateUser._id),
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

//UPDATE USER STATUS: BAN AND UNBAN
userRoute.put(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const user = await User.findById(req.params.id);

    if (user) {
      user.status = status;

      const updateUserStatus = await user.save();
      res.json({
        _id: updateUserStatus._id,
        name: updateUserStatus.name,
        email: updateUserStatus.email,
        status: updateUserStatus.status,
        isAdmin: updateUserStatus.isAdmin,
        createdAt: updateUserStatus.createdAt,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

//DELETE USER: ADMIN ONLY ACCESS
userRoute.delete(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.remove();
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404);
      throw new Error("User Not Found");
    }
  })
);

//GET ALL USER: ADMIN ONLY ACCESS
userRoute.get(
  "/",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
  })
);

export default userRoute;
