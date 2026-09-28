import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGroup extends Document {
  name: string;
  slug: string;
  keyHash: string;
  isPublic: boolean;
  creatorEmail?: string;
  creatorName?: string;
  creatorId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
      maxlength: [80, "Group name cannot exceed 80 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    keyHash: {
      type: String,
      required: [true, "Key hash is required"],
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    creatorEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    creatorName: {
      type: String,
      trim: true,
      default: "",
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Prevent overwrite during hot-reloads
const Group: Model<IGroup> =
  mongoose.models.Group || mongoose.model<IGroup>("Group", GroupSchema);

export default Group;
