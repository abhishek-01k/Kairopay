import mongoose, { Schema, Document, Model } from "mongoose";
import { ORDER_STATUS, type OrderStatus } from "@/lib/constants/order-status";

export interface IOrder extends Document {
  order_id: string;
  merchant_id: string;
  app_id: string;
  customer_did?: string;
  amount_usd: number;
  currency: string;
  metadata?: Record<string, unknown>;
  webhook_url?: string;
  status: OrderStatus;
  checkout_url: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    order_id: { type: String, required: true, unique: true, index: true },
    merchant_id: { type: String, required: true, index: true },
    app_id: { type: String, required: true, index: true },
    customer_did: { type: String, index: true },
    amount_usd: { type: Number, required: true },
    currency: { type: String, required: true, default: "USD" },
    metadata: { type: Schema.Types.Mixed },
    webhook_url: { type: String },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.CREATED,
      index: true,
    },
    checkout_url: { type: String, required: true },
    expires_at: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
