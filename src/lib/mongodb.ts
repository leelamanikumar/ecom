import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
	throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

interface MongooseCache {
	conn: typeof mongoose | null;
	promise: Promise<typeof mongoose> | null;
}

// Use a global cached connection across hot reloads in development
// to prevent exhausting database connections.
let cached = (global as unknown as { mongoose?: MongooseCache }).mongoose;

if (!cached) {
	cached = { conn: null, promise: null };
	(global as unknown as { mongoose?: MongooseCache }).mongoose = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
	if (cached!.conn) {
		return cached!.conn;
	}

	if (!cached!.promise) {
		cached!.promise = mongoose.connect(MONGODB_URI, {
			bufferCommands: false,
		});
	}

	cached!.conn = await cached!.promise;
	return cached!.conn;
}
