import bcrypt from "bcryptjs";
import type mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import type { OrganizationRole } from "@/models/rbac";

export type AuthenticatedStoreAdmin = {
  _id: mongoose.Types.ObjectId;
  name: string;
  mobileNumber: string;
  organizationId: mongoose.Types.ObjectId;
  role: OrganizationRole;
  isActive: boolean;
};

/**
 * Looks up {@link User} by normalized mobile number and verifies the password.
 * When the same mobile exists in multiple organizations, each candidate is checked until one matches.
 */
export async function authenticateWithMobilePassword(
  mobileNumber: string,
  password: string,
): Promise<AuthenticatedStoreAdmin | null> {
  await connectToDatabase();
  const normalized = mobileNumber.replace(/\s+/g, "");
  const users = await User.find({ mobileNumber: normalized });

  for (const doc of users) {
    if (!doc.isActive) continue;
    const match = await bcrypt.compare(password, doc.password);
    if (match) {
      return {
        _id: doc._id,
        name: doc.name,
        mobileNumber: doc.mobileNumber,
        organizationId: doc.organizationId,
        role: doc.role,
        isActive: doc.isActive,
      };
    }
  }

  return null;
}
