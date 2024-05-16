import { Request, Response } from "express";
import {
  getProductById,
  getAllProducts,
  productModel,
  deleteProductById,
} from "../models/products";
import { generateAffiliateLink } from "../utils/generateLink";
import { User } from "../models/users";
import multer from "multer";
import dotenv from "dotenv";
import logger from "../utils/logging";
import { validateProductFields } from "../utils/validation";
import { AffiliateLinkModel } from "../models/affiliateLink";
import cloudinary from "cloudinary";
dotenv.config();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const options = {
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

cloudinary.v2.config(options);

export async function createProduct(req: Request, res: Response) {
  const { name, description, price, previousPrice } = req.body;
  const image = req.file;
  const validationError = validateProductFields(
    name,
    description,
    price,
    previousPrice,
    image
  );
  if (validationError) {
    return res.status(400).json(validationError);
  }
  if (!image) {
    return res.status(400).json({ message: "Product image is required" });
  }

  try {
    // Upload image to Cloudinary
    const result = await cloudinary.v2.uploader.upload(image.path, {
      crop: "scale",
      quality: 50,
    });

    // Create product
    const product = await productModel.create({
      name,
      description,
      price,
      previousPrice,
      image: result.secure_url,
    });

    if (!product) {
      return res
        .status(400)
        .json({ error: "An error occurred when creating product" });
    }

    // Find all agent users
    const users = await User.find({ isAgent: true });

    // Create affiliate links for agent users if they don't already exist
    for (const user of users) {
      // Check if an affiliate link already exists for this user and product
      const existingLink = await AffiliateLinkModel.findOne({
        user: user._id,
        product: product._id,
      });

      // If an affiliate link doesn't exist, create a new one
      if (!existingLink) {
        const affiliateLink = await AffiliateLinkModel.create({
          user: user._id,
          product: product._id,
          link: generateAffiliateLink(product.id, user.id),
        });
        if (!affiliateLink) {
          logger.error("Failed to create affiliate link for user:", user._id);
        }
      }
    }

    res.status(201).json({
      _id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      previousPrice: product.previousPrice,
    });
    logger.info(`Product - ${product.id} has been created successfully`);
  } catch (error) {
    logger.error("An error occurred:", error);
    res.status(400).json({ message: "An error occurred" });
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res
        .status(400)
        .json({ error: "The product you tried to update does not exist" });
    }
    const { name, description, price, previousPrice } = req.body;
    let image = product.image;

    if (req.file) {
      // If a new image is uploaded, update it in Cloudinary
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        // width: 500,
        // height: 500,
        crop: "scale",
        quality: 60,
      });
      image = result.secure_url;
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      { name, description, price, image, previousPrice },
      { new: true }
    );
    logger.info(`Product - ${updatedProduct?.id} updated successfully!`);
    res.status(200).json(updatedProduct);
  } catch (error) {}
}

export async function getProducts(req: Request, res: Response) {
  try {
    const items = await getAllProducts();

    res.status(200).json(items);
  } catch (error) {
    logger.error("There are no products at this time");
    res.status(400).json({ message: "There are no products at this time" });
  }
}

export async function getProduct(req: Request, res: Response) {
  try {
    const item = await getProductById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "This product does not exist" });
    } else {
      res.status(200).json(item);
    }
  } catch (error) {
    logger.error(`Product does not exist`);
    res.status(400).json(error);
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    await deleteProductById(req.params.id);
    await AffiliateLinkModel.deleteMany({ product: req.params.id });

    return res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    logger.error("Item not found");
    res.status(400).json({ message: "Product not found" });
  }
}
