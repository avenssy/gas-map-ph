import { Document, Schema, model, models,Types } from "mongoose";

//Gas Price Schema
export interface GasPrice extends Document {
    gasStationId:Types.ObjectId;
    name: string;
    address: string;
    lat: number;
    lon: number;
    lastUpdateDate: Date;
    dieselPrice: number;
    unleadedPrice: number;
    premiumPrice: number;
}

const GasPriceSchema = new Schema<GasPrice>(
  {
    gasStationId:{ type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    name: { type: String},
    address: { type: String},
    lat: {type: Number},
    lon: {type: Number},
    lastUpdateDate: { type: Date ,required: true },
    dieselPrice: {type: Number},
    unleadedPrice: {type: Number},
    premiumPrice: {type: Number},
  },
);

export const GasPriceModel = models?.siteVisit || model<GasPrice>("gas-prices", GasPriceSchema);