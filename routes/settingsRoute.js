import express from "express";
import asyncHandler from "express-async-handler";
import { adminOnly, protect } from "../middleware/authMidedleware.js";
import Settings from "../models/appSettings.js";

const settingsRoute = express.Router();

//ADMIN CREATE USERS
settingsRoute.post(
  "/company-profile",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const {
      companyName,
      companyEmail,
      companyPhone,
      primaryColor,
      secondaryColor,
      logo,
      stripKey,
      paypalKey,
      paystackKey,
      flutterwaveKey,
    } = req.body;
    const companyExists = await Settings.findOne({ companyEmail });

    // const isAdmin = userType === "admin" ? true : false;

    if (companyExists) {
      res.status(400);
      throw new Error("Organisation already exists");
    }

    const company = await Settings.create({
      companyName,
      companyEmail,
      companyPhone,
      primaryColor,
      secondaryColor,
      logo,
      stripKey,
      paypalKey,
      paystackKey,
      flutterwaveKey,
    });

    if (company) {
      res.status(201).json({
        _id: company?._id,
        logo: companyPhone?.logo,
        companyName: company?.companyName,
        companyEmail: company?.companyEmail,
        companyPhone: company?.companyPhone,
        primaryColor: company?.primaryColor,
        secondaryColor: company?.secondaryColor,
        stripKey: company?.stripKey,
        paypalKey: company?.paypalKey,
        paystackKey: company?.paystackKey,
        flutterwaveKey: company?.flutterwaveKey,
        createdAt: company?.createdAt,
        // token: generateToken(user?._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid Organisation's data");
    }
  })
);

//ADMIN GET COMPANY PROFILE
settingsRoute.get(
  "/company-profile",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    // res.send("User Profile")
    const companyDetails = await Settings.find({});

    if (companyDetails) {
      res.json(companyDetails[0]);
    } else {
      res.status(404);
      throw new Error("Organisation not found");
    }
  })
);

//GET COMPANY PROFILE
settingsRoute.get(
  "/company-details",
  // protect,
  // adminOnly,
  asyncHandler(async (req, res) => {
    // res.send("User Profile")
    const companyDetails = await Settings.find({});

    if (companyDetails) {
      res.json({
        companyName: companyDetails[0]?.companyName,
        companyEmail: companyDetails[0]?.companyEmail,
        companyPhone: companyDetails[0]?.companyPhone,
        primaryColor: companyDetails[0]?.primaryColor,
        secondaryColor: companyDetails[0]?.secondaryColor,
        logo: companyDetails[0]?.logo,
      });
    } else {
      res.status(404);
      throw new Error("Organisation not found");
    }
  })
);

//UPDATE PROFILE
settingsRoute.put(
  "/company-profile",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    // res.send("User Profile")
    const organisation = await Settings.findById(req.body._id);

    if (organisation) {
      organisation.companyName = req?.body?.companyName || organisation?.name;
      organisation.companyEmail =
        req?.body?.companyEmail || organisation?.email;
      organisation.logo = req?.body?.logo || organisation?.logo;
      if (req.body.primaryColor) {
        organisation.primaryColor = req.body.primaryColor;
      }
      if (req.body.secondaryColor) {
        organisation.secondaryColor = req.body.secondaryColor;
      }
      const updateOrganisationDetails = await organisation.save();

      res.json({
        _id: updateOrganisationDetails._id,
        companyName: updateOrganisationDetails.companyName,
        companyEmail: updateOrganisationDetails.companyEmail,
        // paystackKey: updateOrganisationDetails.paystackKey,
        logo: updateOrganisationDetails.logo,
        createdAt: updateOrganisationDetails.createdAt,
        // token: generateToken(updateOrganisationDetails._id),
      });
    } else {
      res.status(404);
      throw new Error("Organisation not found");
    }
  })
);

export default settingsRoute;
