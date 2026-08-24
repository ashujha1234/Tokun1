const mongoose = require("mongoose");
const { Schema } = mongoose;

// Each saved item reference
const SavedItemSchema = new Schema(
  {
    ref: { type: Schema.Types.ObjectId, required: true, refPath: "on" }, // actual document reference
    // "User" is a saved creator profile — the person, not a document they made.
    on: { type: String, required: true, enum: ["Smartgen", "Prompt","PromptOptimizer","User"] }, // type of document
    name: { type: String, trim: true }, // optional label user wants to give to this item
  },
  { timestamps: true }
);

// A collection/folder
const CollectionFolderSchema = new Schema(
  {
    title: { type: String, required: true, trim: true }, // collection name, e.g., "Coding"
    items: { type: [SavedItemSchema], default: [] },    // items inside this collection
  },
  { timestamps: true }
);

// Main SavedCollection per user
const SavedCollectionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    
    // Sections: Smartgen and Prompt
    sections: {
      smartgen: {
        directItems: { type: [SavedItemSchema], default: [] },    // items saved directly
        collections: { type: [CollectionFolderSchema], default: [] }, // collections/folders
      },
      prompt: {
        directItems: { type: [SavedItemSchema], default: [] },
        collections: { type: [CollectionFolderSchema], default: [] },
      },
      promptOptimizer: {
        directItems: { type: [SavedItemSchema], default: [] },
        collections: { type: [CollectionFolderSchema], default: [] },
      },
      /* Creators, saved from the directory. The other three sections hold
         things you made or bought; this one holds people you want to come back
         to, which is the whole reason the directory exists and had no way to
         act on it — you found someone good and then had to remember their name.

         `collections` is here for shape only: saving into folders is gone (see
         the note in routes/savedCollectionRoutes.js), and this section never
         had any to inherit. */
      creator: {
        directItems: { type: [SavedItemSchema], default: [] },
        collections: { type: [CollectionFolderSchema], default: [] },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SavedCollection", SavedCollectionSchema);
