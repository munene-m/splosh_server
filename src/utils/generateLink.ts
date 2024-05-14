import { ObjectId } from "mongoose";
const clientUrl = process.env.CLIENT_URL;

export function generateAffiliateLink(
  productId: ObjectId,
  userId: ObjectId
): string {
  return `${clientUrl}/product/${productId}/agent=${userId}`;
}
