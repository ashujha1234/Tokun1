const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: { type: String, required: true },
    description: { type: String, required: true },

    // CATEGORY
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    // SERVICE DETAILS
    screens: String,        // "21 Screens"
    prototype: String,      // "Yes" | "No"
    fileType: String,       // "Figma" | "Source File"
    delivery: String,       // "7 Days Delivery"
    revisions: String,      // "2 Revisions"

    price: {
      type: Number,
      required: true,
    },

    // MEDIA (IMAGE / VIDEO)
    media: [
      {
        type: String, // /uploads/services/xxx.jpg
      },
    ],

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", ServiceSchema);
