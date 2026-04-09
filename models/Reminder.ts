import mongoose, { Schema, model, models } from "mongoose";

export const REMINDER_TYPES = [
  "first_visit",
  "roguing",
  "strip_test",
  "final_follow_up",
  "seed_prep_qc_hold",
  "dispatch_follow_up",
  "receipt_discrepancy_closure",
  "dehaulming_readiness",
  "harvest_scheduling",
] as const;
export type ReminderType = (typeof REMINDER_TYPES)[number];

export const REMINDER_STATUS = ["pending", "completed", "dismissed"] as const;
export type ReminderStatus = (typeof REMINDER_STATUS)[number];

export interface IReminder {
  _id?: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  landId: mongoose.Types.ObjectId;
  cycleId?: string;
  reminderType: ReminderType;
  dueDate: Date;
  status: ReminderStatus;
  escalationLevel?: number;
  assignedToUserId?: mongoose.Types.ObjectId;
  completedAt?: Date;
  dismissedAt?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const reminderSchema = new Schema<IReminder>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
      index: true,
    },
    landId: {
      type: Schema.Types.ObjectId,
      ref: "Land",
      required: true,
      index: true,
    },
    cycleId: { type: String, trim: true, index: true },
    reminderType: { type: String, required: true, enum: REMINDER_TYPES },
    dueDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      required: true,
      enum: REMINDER_STATUS,
      default: "pending",
      index: true,
    },
    escalationLevel: { type: Number, min: 0 },
    assignedToUserId: {
      type: Schema.Types.ObjectId,
      ref: "StoreAdminUser",
      required: false,
      index: true,
    },
    completedAt: { type: Date },
    dismissedAt: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

reminderSchema.index(
  { organizationId: 1, landId: 1, reminderType: 1, dueDate: 1 },
  { unique: true },
);
reminderSchema.index({ organizationId: 1, cycleId: 1, status: 1, dueDate: 1 });

export const Reminder = models.Reminder || model<IReminder>("Reminder", reminderSchema);
