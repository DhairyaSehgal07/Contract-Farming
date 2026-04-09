import mongoose, { Schema, model, models } from "mongoose";

export interface IChatAttachment {
  kind: "image" | "video" | "file";
  url: string;
}

export interface IChatMessage {
  _id?: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  senderUserId: mongoose.Types.ObjectId;
  recipientUserId: mongoose.Types.ObjectId;
  message: string;
  attachments: IChatAttachment[];
  sentAt: Date;
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const chatAttachmentSchema = new Schema<IChatAttachment>(
  {
    kind: {
      type: String,
      required: true,
      enum: ["image", "video", "file"],
    },
    url: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const chatMessageSchema = new Schema<IChatMessage>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    senderUserId: {
      type: Schema.Types.ObjectId,
      ref: "StoreAdminUser",
      required: true,
      index: true,
    },
    recipientUserId: {
      type: Schema.Types.ObjectId,
      ref: "StoreAdminUser",
      required: true,
      index: true,
    },
    message: { type: String, required: true, trim: true },
    attachments: { type: [chatAttachmentSchema], default: [] },
    sentAt: { type: Date, required: true, default: Date.now, index: true },
    readAt: { type: Date },
  },
  { timestamps: true },
);

chatMessageSchema.index({ organizationId: 1, senderUserId: 1, recipientUserId: 1, sentAt: -1 });

export const ChatMessage =
  models.ChatMessage || model<IChatMessage>("ChatMessage", chatMessageSchema);
