import mongoose, { Schema, models, model } from 'mongoose';

export interface OrderItem {
	productId: string;
	name: string;
	slug?: string;
	image?: string;
	price: number;
	size?: number;
	quantity: number;
}

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
	items: OrderItem[];
	total: number;
	delivered: boolean;
	deliveredAt?: Date;
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
	items: [{
		productId: { type: String, required: true },
		name: { type: String, required: true },
		slug: { type: String },
		image: { type: String },
		price: { type: Number, required: true, min: 0 },
		size: { type: Number },
		quantity: { type: Number, required: true, min: 1 },
	}],
	total: { type: Number, required: true, min: 0 },
	delivered: { type: Boolean, default: false },
	deliveredAt: { type: Date },
}, { timestamps: true });

export const Order = models.Order || model<OrderDocument>('Order', OrderSchema);
