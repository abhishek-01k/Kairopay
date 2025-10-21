import mongoose, { Schema, Document, Model } from "mongoose";
import {
  TRANSACTION_STATUS,
  type TransactionStatus,
} from "@/lib/constants/transaction-status";
import { type Chain } from "@/lib/constants/chains";
import { type Asset } from "@/lib/constants/assets";

export interface ITransaction extends Document {
  tx_hash: string;
  order_id: string;
  merchant_id: string;
  app_id: string;
  chain: Chain;
  asset: Asset;
  amount: number;
  usd_value: number;
  from: string;
  to: string;
  status: TransactionStatus;
  confirmed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    tx_hash: { type: String, required: true, unique: true, index: true },
    order_id: { type: String, required: true, index: true },
    merchant_id: { type: String, required: true, index: true },
    app_id: { type: String, required: true, index: true },
    chain: { type: String, required: true },
    asset: { type: String, required: true },
    amount: { type: Number, required: true },
    usd_value: { type: Number, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.PENDING,
      index: true,
    },
    confirmed_at: { type: Date },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
