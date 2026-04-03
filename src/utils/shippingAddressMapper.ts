import type { ShippingAddressData } from "../interfaces/shippingAddressData.js";

export const mapToShippingAddress = (data: ShippingAddressData) => ({
  receiverName: data.receiverName,
  phoneNumber: data.phoneNumber,
  address: data.address,
  province: data.province,
  city: data.city,
  postalCode: data.postalCode,
});

export const mapToSnakeCase = (data: ShippingAddressData) => ({
  receiver_name: data.receiverName,
  phone_number: data.phoneNumber,
  address: data.address,
  province: data.province,
  city: data.city,
  postal_code: data.postalCode,
});
