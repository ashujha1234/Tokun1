// models/Prompt.js
const mongoose = require("mongoose");

const AttachmentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, enum: ["image", "video","other"], required: true }, // only image or video
});


const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
}, { _id: false }); // embedded subdocument

const PromptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: String,
    promptText: { type: String, required: true },
    free: { type: Boolean, default: true },
    price: { type: Number, default: 0 },
    tags: [String],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    attachment: { type: AttachmentSchema, required: true}, // only one
      

       draft: { type: Boolean, default: false },
    flagged: { type: Boolean, default: false },
     exclusive: { type: Boolean, default: false },   // ✅ new
     sold: { type: Boolean, default: false },  

    tokun_price: { type: Number, default: 0 }, // <-- new field
    ratings: [ratingSchema],      // <--- store user ratings
    averageRating: { type: Number, default: 0 }, // <--- store calculated avg
    // NEW FIELD: uploadCode (can be null, single, or multiple)
    uploadCode: {
      type: [AttachmentSchema], // array of attachments
      default: [], // empty array if none
    },


      // Soft delete
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },

    // For reporting / analytics
    salesCount: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },

  },
  { timestamps: true }
);

// Pre-save middleware to calculate tokun_price
PromptSchema.pre("save", function (next) {
  const commissionPercent = Number(process.env.TOKUN_COMMISSION_PERCENT || 0);

  if (!this.free && Number.isFinite(this.price)) {
    this.tokun_price = +(this.price + (this.price * commissionPercent / 100)).toFixed(2);
  } else {
    this.tokun_price = 0;
  }
// calculate average rating if ratings exist
  if (this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = +(sum / this.ratings.length).toFixed(2);
  } else {
    this.averageRating = 0;
  }
  next();
});

module.exports = mongoose.model("Prompt", PromptSchema);
//68b2ba00c0a62cea52479a58