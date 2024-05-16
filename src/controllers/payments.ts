import { Request, Response } from "express";
import Payments from "../models/payments";
import logger from "../utils/logging";
import { Wheelspin } from "../models/wheelSpin";

export async function handleCallback(req: Request, res: Response) {
  try {
    const paymentResponse = new Payments({
      data: req.body,
      timestamp: new Date(),
    });
    await paymentResponse.save();

    logger.info(`Payment response sent - ${paymentResponse.data.Message}`);

    res
      .status(200)
      .json({ message: "Callback response received", paymentResponse });
  } catch (error) {
    // Handle errors and send an appropriate response
    logger.error("Error occured while handling callback: ", error);
    res
      .status(500)
      .json({ message: "An error occurred while handling callback" });
  }
}

export async function getCallbackResponse(req: Request, res: Response) {
  try {
    const { transactionRef } = req.body;

    const response = await Payments.findOne({
      "data.transaction_reference": transactionRef,
    }).sort({ timestamp: -1 });

    if (!response) {
      logger.error(`No record found for transactionRef: ${transactionRef}`);
      return res
        .status(404)
        .json({ message: "No record found for transactionRef" });
    }
    const success = response.data.Success;
    res.status(200).json({ success });
  } catch (error) {
    logger.error(error);
    res
      .status(500)
      .json({ message: "An error occurred when fetching your response" });
  }
}

export const getWheelSpinPayout = async (req: Request, res: Response) => {
  const userId = req.params.id;
  if (!userId) {
    return res.status(400).json({ error: "User id is required" });
  }
  try {
    const payouts = await Wheelspin.find({ userId });
    res.status(200).json(payouts);
  } catch (error) {
    return res.status(500).json({ error: "An error occured" });
  }
};
