import mongoose, { Schema, Document, Model } from "mongoose";

export interface IApp {
  app_id: string;
  api_key: string;
  name: string;
  webhook_url?: string;
  created_at: Date;
}

export interface IMerchant extends Document {
  merchant_id: string;
  privy_did: string;
  evm_wallet?: string;
  sol_wallet?: string;
  apps: IApp[];
  created_at: Date;
  updated_at: Date;
}

const AppSchema = new Schema<IApp>({
  app_id: { type: String, required: true, unique: true },
  api_key: { type: String, required: true },
  name: { type: String, required: true },
  webhook_url: { type: String },
  created_at: { type: Date, default: Date.now },
});

const MerchantSchema = new Schema<IMerchant>(
  {
    merchant_id: { type: String, required: true, unique: true, index: true },
    privy_did: { type: String, required: true, unique: true, index: true },
    evm_wallet: { type: String },
    sol_wallet: { type: String },
    apps: [AppSchema],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Merchant: Model<IMerchant> =
  mongoose.models.Merchant ||
  mongoose.model<IMerchant>("Merchant", MerchantSchema);

export default Merchant;
