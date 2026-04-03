import midtransClient from "midtrans-client";
import { configuration } from "../config.js";

const { Snap } = midtransClient;

export const snap = new Snap({
  isProduction: false,
  serverKey: configuration.midtrans.serverKey,
  clientKey: configuration.midtrans.clientKey,
});
