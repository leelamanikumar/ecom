import mongoose, { Schema, models, model } from 'mongoose';

export interface ProductDocument extends mongoose.Document {
	name: string;
	slug: string;
	description?: string;
	brand?: string;
	category: 'men' | 'women' | 'kids' | 'unisex';
	sizes: number[]; // e.g., [6,7,8,9,10]
	price: number;
	images: string[];
	inStock: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const ProductSchema = new Schema<ProductDocument>({
	name: { type: String, required: true, trim: true },
	slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
	description: { type: String },
	brand: { type: String },
	category: { type: String, enum: ['men', 'women', 'kids', 'unisex'], required: true },
	sizes: { type: [Number], default: [] },
	price: { type: Number, required: true, min: 0 },
	images: { type: [String], default: [] },
	inStock: { type: Boolean, default: true },
}, { timestamps: true });

ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ name: 'text', brand: 'text', description: 'text' });

export const Product = models.Product || model<ProductDocument>('Product', ProductSchema);
