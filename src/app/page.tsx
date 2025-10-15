import ProductsGrid from "@/components/ProductsGrid";

export default function Home() {
	return (
		<div className="min-h-screen p-4 sm:p-10">
			<h1 className="text-2xl sm:text-3xl font-semibold mb-6">Footwear Store</h1>
			<ProductsGrid />
		</div>
	);
}
