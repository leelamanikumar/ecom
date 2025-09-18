import mongoose, { Schema, models, model } from 'mongoose';

export interface OrderDocument extends mongoose.Document {
	phone: string;
	shipping: {
		fullName: string;
		address1: string;
		address2?: string;
		city: string;
		state: string;
		postalCode: string;
	};
	total: number;
	createdAt: Date;
	updatedAt: Date;
}

const OrderSchema = new Schema<OrderDocument>({
	phone: { type: String, required: true, trim: true },
	shipping: {
		fullName: { type: String, required: true, trim: true },
		address1: { type: String, required: true, trim: true },
		address2: { type: String, trim: true },
		city: { type: String, required: true, trim: true },
		state: { type: String, required: true, trim: true },
		postalCode: { type: String, required: true, trim: true },
	},
	total: { type: Number, required: true, min: 0 },
}, { timestamps: true });

export const Order = models.Order || model<OrderDocument>('Order', OrderSchema);
