import { Request, Response } from "express";
import { customAlphabet } from "nanoid/non-secure";
import axios from "axios";
const apiKey = process.env.CHPTER_PUBLIC_KEY_TEST;
export const initiateOrder = async (req: Request, res: Response) => {
  const {
    customerName,
    location,
    phoneNumber,
    email,
    total,
    products,
    callback,
  } = req.body;

  if (!customerName || !location || !phoneNumber || !email || !total) {
    return res
      .status(400)
      .json({ message: "Please enter all required fields" });
  }
  try {
    const alphabet =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const generateNanoid = customAlphabet(alphabet, 10); // Generates IDs of length 10
    const transactionRef = generateNanoid();
    const response = await axios.post(
      "https://api.chpter.co/v1/initiate/mpesa-payment",
      {
        customer_details: {
          full_name: customerName,
          location,
          phone_number: phoneNumber,
          email,
        },
        products,
        amount: {
          currency: "KES",
          total,
        },
        callback_details: {
          transaction_reference: transactionRef,
          callback_url: callback,
        },
      },
      {
        headers: {
          "Api-Key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "An error occured.", error });
  }
};
