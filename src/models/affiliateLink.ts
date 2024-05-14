import mongoose, { Schema, Document } from "mongoose";

interface AffiliateLink extends Document {
  user: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId;
  link: string;
}

const affiliateLinkSchema = new Schema<AffiliateLink>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  link: { type: String, required: true },
});

const AffiliateLinkModel = mongoose.model<AffiliateLink>(
  "AffiliateLink",
  affiliateLinkSchema
);

export { AffiliateLinkModel };
