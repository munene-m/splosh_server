import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  previousPrice: { type: String },
  image: { type: String },
});

export const productModel = mongoose.model("Product", productSchema);
export const getProductById = (id: string) => productModel.findById(id);
export const getAllProducts = () => productModel.find();
export const deleteProductById = (id: string) =>
  productModel.findOneAndDelete({ _id: id });
