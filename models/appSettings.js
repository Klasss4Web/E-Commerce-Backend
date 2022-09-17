import mongoose from "mongoose";
import bcrypt from "bcrypt"

const settingsSchema = mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },

    companyEmail: {
      type: String,
      required: true,
      unique: true,
    },
    companyPhone: {
      type: String,
      required: false,
    },
    logo: {
      type: String,
      required: false,
    },
    primaryColor: {
      type: String,
      required: false,
    },
    secondaryColor: {
      type: String,
      required: false,
    },
    stripKey: {
      type: String,
      required: false,
    },
    paypalKey: {
      type: String,
      required: false,
    },
    paystackKey: {
      type: String,
      required: false,
    },
    flutterwaveKey: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
