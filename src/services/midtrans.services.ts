import { snap } from "../config/payment_gateaway/midtrans.js";
import type { UserData } from "../interfaces/userData.js";
import type { ShippingAddressData } from "../interfaces/shippingAddressData.js";
import type { ItemData } from "../interfaces/itemData.js";

interface midtransServiceConfig {
  orderId: string;
  totalAmount: number;
  user: UserData;
  items: ItemData[];
  shippingAddress: ShippingAddressData;
}
export class MidtransService {
  private readonly _orderId: string;
  private readonly _totalAmount: number;
  private readonly _items: ItemData[];
  private readonly _userName: string;
  private readonly _userEmail: string;
  private readonly _receiverName: string;
  private readonly _receiverPhoneNumber: string;
  private readonly _receiverAddress: string;
  private readonly _receiverCity: string;
  private readonly _postalCode: string;

  constructor({
    orderId,
    totalAmount,
    items,
    user,
    shippingAddress,
  }: midtransServiceConfig) {
    this._orderId = orderId;
    this._totalAmount = totalAmount;
    this._items = items;
    this._userName = user.name;
    this._userEmail = user.email;
    this._receiverName = shippingAddress.receiverName;
    this._receiverPhoneNumber = shippingAddress.phoneNumber;
    this._receiverAddress = shippingAddress.address;
    this._receiverCity = shippingAddress.city;
    this._postalCode = shippingAddress.postalCode;
  }

  async createTransaction() {
    try {
      const parameters = {
        transaction_details: {
          order_id: this._orderId,
          gross_amount: this._totalAmount,
        },
        item_details: this._items,
        customer_details: {
          first_name: this._userName,
          email: this._userEmail,
          shipping_address: {
            first_name: this._receiverName,
            phone: this._receiverPhoneNumber,
            address: this._receiverAddress,
            city: this._receiverCity,
            postal_code: this._postalCode,
          },
        },
        enabled_payments: [
          "credit_card",
          "mandiri_clickpay",
          "cimb_clicks",
          "bca_klikbca",
          "bca_klikpay",
          "bri_epay",
          "echannel",
          "mandiri_ecash",
          "permata_va",
          "bca_va",
          "bni_va",
          "other_va",
          "gopay",
          "kioson",
          "indomaret",
          "gci",
          "danamon_online",
        ],
        credit_card: {
          secure: true,
          bank: "bca",
          installment: {
            required: false,
            terms: {
              bni: [3, 6, 12],
              mandiri: [3, 6, 12],
              cimb: [3],
              bca: [3, 6, 12],
              offline: [6, 12],
            },
          },
          whitelist_bins: ["48111111", "41111111"],
        },
        bca_va: {
          va_number: "12345678911",
          free_text: {
            inquiry: [
              {
                en: "text in English",
                id: "text in Bahasa Indonesia",
              },
            ],
            payment: [
              {
                en: "text in English",
                id: "text in Bahasa Indonesia",
              },
            ],
          },
        },
        bni_va: {
          va_number: "12345678",
        },
        permata_va: {
          va_number: "1234567890",
          recipient_name: "SUDARSONO",
        },
      };

      const createTransaction = await snap.createTransaction(parameters);
      const token = createTransaction.token;

      return token;
    } catch (error) {
      throw error;
    }
  }
}
