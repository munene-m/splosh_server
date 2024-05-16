import mongoose, { Schema, Document, ObjectId } from "mongoose";
export interface IPayment extends Document {
  data: {
    Message: string;
    Success: boolean;
    success: boolean;
  };
  transactionRef: string;
  payoutRef: string;
  transactionType: string;
  userId: ObjectId;
}
const paymentSchema: Schema = new Schema(
  {
    data: {
      type: Object,
    },
    transactionRef: {
      type: String,
    },
    payoutRef: {
      type: String,
    },
    transactionType: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>("splosh-payment", paymentSchema);
