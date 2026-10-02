import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ILabCode extends Document {
  groupId: Types.ObjectId;
  title: string;
  language: string;
  type: "code" | "pdf";
  code?: string;
  fileData?: string;
  fileName?: string;
  fileSize?: number;
  uploaderName?: string;
  description?: string;
  createdAt: Date;
}

const LabCodeSchema = new Schema<ILabCode>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: [true, "Group ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    language: {
      type: String,
      required: [true, "Programming language or format is required"],
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ["code", "pdf"],
      default: "code",
    },
    code: {
      type: String,
      default: "",
    },
    fileData: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      default: "",
      trim: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    uploaderName: {
      type: String,
      trim: true,
      maxlength: [50, "Uploader name cannot exceed 50 characters"],
      default: "Anonymous",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: -1,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Prevent overwrite during hot-reloads
const LabCode: Model<ILabCode> =
  mongoose.models.LabCode || mongoose.model<ILabCode>("LabCode", LabCodeSchema);

export default LabCode;
