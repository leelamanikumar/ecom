"use client";

import { useEffect, useState } from "react";
import { getProductImageUrl } from "@/lib/cloudinary";

interface ProductListItem {
	_id: string;
	name: string;
	slug: string;
	price: number;
	images: string[];
}

type ProductDraft = {
	name: string;
	slug: string;
	description: string;
	brand: string;
	category: 'men' | 'women' | 'kids' | 'unisex';
	sizes: number[];
	price: number;
	images: string[];
	inStock: boolean;
};

export default function AdminPage() {
	const [product, setProduct] = useState<ProductDraft>({
		name: '',
		slug: '',
		description: '',
		brand: '',
		category: 'men',
		sizes: [],
		price: 0,
		images: [],
		inStock: true,
	});
	const [uploading, setUploading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState('');
	const [list, setList] = useState<ProductListItem[]>([]);
	const [loadingList, setLoadingList] = useState(true);
	const [orders, setOrders] = useState<Array<{ _id: string; phone: string; total: number; delivered: boolean; createdAt: string }>>([]);
	const [loadingOrders, setLoadingOrders] = useState(false);

	useEffect(() => {
		refreshList();
		refreshOrders();
	}, []);

	async function refreshList() {
		setLoadingList(true);
		try {
			const res = await fetch('/api/products', { cache: 'no-store' });
			const data: ProductListItem[] = await res.json();
			setList(data);
		} catch (e: unknown) {
			console.error(e);
		} finally {
			setLoadingList(false);
		}
	}

	async function refreshOrders() {
		setLoadingOrders(true);
		try {
			const res = await fetch('/api/order', { cache: 'no-store' });
			const data = await res.json();
			setOrders(data);
		} catch (e) {
			console.error(e);
		} finally {
			setLoadingOrders(false);
		}
	}

	async function markDelivered(id: string, delivered: boolean) {
		try {
			const res = await fetch('/api/order', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id, delivered }),
			});
			if (!res.ok) {
				const data = await res.json();
				alert(data?.error || 'Failed to update order');
				return;
			}
			refreshOrders();
		} catch (e) {
			alert((e as Error).message);
		}
	}

	async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
		const files = event.target.files;
		if (!files) return;

		setUploading(true);
		try {
			const uploadPromises = Array.from(files).map(async (file) => {
				const formData = new FormData();
				formData.append('file', file);

				const response = await fetch('/api/upload', {
					method: 'POST',
					body: formData,
				});

				if (!response.ok) {
					throw new Error('Upload failed');
				}

				const data: { public_id: string } = await response.json();
				return data.public_id;
			});

			const publicIds = await Promise.all(uploadPromises);
			setProduct(prev => ({
				...prev,
				images: [...prev.images, ...publicIds]
			}));
			setMessage(`Uploaded ${publicIds.length} image(s) successfully`);
		} catch (error) {
			setMessage('Upload failed: ' + (error as Error).message);
		} finally {
			setUploading(false);
		}
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSaving(true);
		setMessage('');

		try {
			const response = await fetch('/api/products', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(product),
			});

			if (!response.ok) {
				throw new Error('Failed to save product');
			}

			setMessage('Product saved successfully!');
			setProduct({
				name: '',
				slug: '',
				description: '',
				brand: '',
				category: 'men',
				sizes: [],
				price: 0,
				images: [],
				inStock: true,
			});
			refreshList();
		} catch (error) {
			setMessage('Save failed: ' + (error as Error).message);
		} finally {
			setSaving(false);
		}
	}

	function removeImage(index: number) {
		setProduct(prev => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index)
		}));
	}

	function addSize() {
		const size = prompt('Enter size:');
		if (size && !isNaN(Number(size))) {
			setProduct(prev => ({
				...prev,
				sizes: [...prev.sizes, Number(size)]
			}));
		}
	}

	function removeSize(index: number) {
		setProduct(prev => ({
			...prev,
			sizes: prev.sizes.filter((_, i) => i !== index)
		}));
	}

	async function deleteProduct(idOrSlug: string) {
		if (!confirm('Delete this product?')) return;
		const res = await fetch(`/api/products/${idOrSlug}`, { method: 'DELETE' });
		if (res.ok) {
			refreshList();
		} else {
			const data: { error?: string } = await res.json();
			alert('Delete failed: ' + (data?.error || res.statusText));
		}
	}

	return (
		<div className="max-w-5xl mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-6">Admin</h1>

			<section className="mb-10">
				<h2 className="text-lg font-semibold mb-3">Products</h2>
				{loadingList ? (
					<p>Loading…</p>
				) : (
					<ul className="divide-y border rounded">
						{list.map((p) => (
							<li key={p._id} className="p-3 flex items-center gap-3">
								<div className="w-14 h-14 bg-gray-100 rounded overflow-hidden">
									{p.images?.[0] ? (
										<img src={getProductImageUrl(p.images[0], 'thumbnail')} alt={p.name} className="w-full h-full object-cover" />
									) : (
										<div className="w-full h-full grid place-items-center text-gray-400">No</div>
									)}
								</div>
								<div className="flex-1 min-w-0">
									<div className="font-medium truncate">{p.name}</div>
									<div className="text-sm text-gray-500">₹{p.price.toFixed(2)}</div>
								</div>
								<button className="px-3 py-1 border rounded" onClick={() => deleteProduct(p.slug || p._id)}>Delete</button>
							</li>
						))}
					</ul>
				)}
			</section>

			<section className="mb-10">
				<h2 className="text-lg font-semibold mb-3">Orders</h2>
				{loadingOrders ? (
					<p>Loading…</p>
				) : orders.length === 0 ? (
					<p>No orders yet.</p>
				) : (
					<ul className="divide-y border rounded">
						{orders.map((o) => (
							<li key={o._id} className="p-3 flex items-center justify-between gap-3">
								<div>
									<div className="font-medium">{o.phone}</div>
									<div className="text-sm text-gray-600">₹{o.total.toFixed(2)} • {new Date(o.createdAt).toLocaleString()}</div>
								</div>
								<div className="flex items-center gap-3">
									<span className={`text-sm ${o.delivered ? 'text-green-700' : 'text-orange-700'}`}>{o.delivered ? 'Delivered' : 'Pending'}</span>
									<button className="px-3 py-1 border rounded" onClick={() => markDelivered(o._id, !o.delivered)}>{o.delivered ? 'Mark Pending' : 'Mark Delivered'}</button>
								</div>
							</li>
						))}
					</ul>
				)}
			</section>

			<section>
				<h2 className="text-lg font-semibold mb-3">Add New Product</h2>
				{message && (
					<div className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
						{message}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium mb-2">Product Name</label>
							<input
								type="text"
								required
								value={product.name}
								onChange={(e) => setProduct(prev => ({ ...prev, name: e.target.value }))}
								className="w-full border rounded px-3 py-2"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">Slug (URL-friendly)</label>
							<input
								type="text"
								required
								value={product.slug}
								onChange={(e) => setProduct(prev => ({ ...prev, slug: e.target.value }))}
								className="w-full border rounded px-3 py-2"
								placeholder="nike-air-max"
							/>
						</div>

						<div>
							<label className="block text sm font-medium mb-2">Brand</label>
							<input
								type="text"
								value={product.brand}
								onChange={(e) => setProduct(prev => ({ ...prev, brand: e.target.value }))}
								className="w-full border rounded px-3 py-2"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">Category</label>
							<select
								value={product.category}
								onChange={(e) => setProduct(prev => ({ ...prev, category: e.target.value as ProductDraft['category'] }))}
								className="w-full border rounded px-3 py-2"
							>
								<option value="men">Men</option>
								<option value="women">Women</option>
								<option value="kids">Kids</option>
								<option value="unisex">Unisex</option>
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">Price (₹)</label>
							<input
								type="number"
								required
								min="0"
								value={product.price}
								onChange={(e) => setProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
								className="w-full border rounded px-3 py-2"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">In Stock</label>
							<input
								type="checkbox"
								checked={product.inStock}
								onChange={(e) => setProduct(prev => ({ ...prev, inStock: e.target.checked }))}
								className="mr-2"
							/>
							Available
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2">Description</label>
						<textarea
							value={product.description}
							onChange={(e) => setProduct(prev => ({ ...prev, description: e.target.value }))}
							className="w-full border rounded px-3 py-2 h-24"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2">Sizes</label>
						<div className="flex flex-wrap gap-2 mb-2">
							{product.sizes.map((size, index) => (
								<span key={index} className="px-3 py-1 bg-gray-100 rounded flex items-center gap-2">
									{size}
									<button
										type="button"
										onClick={() => removeSize(index)}
										className="text-red-600 hover:text-red-800"
									>
										×
									</button>
								</span>
							))}
						</div>
						<button
							type="button"
							onClick={addSize}
							className="px-3 py-1 border rounded text-sm"
						>
							Add Size
						</button>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2">Images</label>
						<input
							type="file"
							multiple
							accept="image/*"
							onChange={handleImageUpload}
							disabled={uploading}
							className="mb-4"
						/>
						{uploading && <p className="text-sm text-gray-600">Uploading...</p>}
						
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{product.images.map((publicId, index) => (
								<div key={index} className="relative">
									<img
										src={getProductImageUrl(publicId, 'thumbnail')}
										alt={`Product ${index + 1}`}
										className="w-full h-24 object-cover rounded border"
									/>
									<button
										type="button"
										onClick={() => removeImage(index)}
										className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
									>
										×
									</button>
								</div>
							))}
						</div>
					</div>

					<button
						type="submit"
						disabled={saving || product.images.length === 0}
						className="px-6 py-2 bg-black text-white rounded disabled:opacity-50"
					>
						{saving ? 'Saving...' : 'Save Product'}
					</button>
				</form>
			</section>
		</div>
	);
}
