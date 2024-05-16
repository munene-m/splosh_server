import mongoose, { Document, ObjectId, Schema } from "mongoose";

interface WheelSpinDoc extends Document {
  userId: ObjectId;
  amountWon: number;
}

const wheelSpinSchema = new mongoose.Schema<WheelSpinDoc>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  amountWon: {
    type: Number,
  },
});
const Wheelspin = mongoose.model<WheelSpinDoc>("User", wheelSpinSchema);
export { Wheelspin };
