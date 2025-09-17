import Link from "next/link";

export default function Footer() {
	return (
		<footer className="bg-gray-900 text-white py-12">
			<div className="max-w-6xl mx-auto px-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div>
						<h3 className="text-lg font-semibold mb-4">Footwear Store</h3>
						<p className="text-gray-400">
							Your one-stop destination for quality footwear. We offer the latest trends in shoes for men, women, and kids.
						</p>
					</div>
					
					<div>
						<h3 className="text-lg font-semibold mb-4">Quick Links</h3>
						<ul className="space-y-2">
							<li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
							<li><Link href="/search?q=men" className="text-gray-400 hover:text-white">Men's Shoes</Link></li>
							<li><Link href="/search?q=women" className="text-gray-400 hover:text-white">Women's Shoes</Link></li>
							<li><Link href="/search?q=kids" className="text-gray-400 hover:text-white">Kids' Shoes</Link></li>
						</ul>
					</div>
					
					<div>
						<h3 className="text-lg font-semibold mb-4">Contact Us</h3>
						<div className="space-y-2 text-gray-400">
							<p>📧 support@footwearstore.com</p>
							<p>📞 +1 (555) 123-4567</p>
							<p>📍 123 Shoe Street, Fashion City, FC 12345</p>
							<p>🕒 Mon-Fri: 9AM-6PM, Sat-Sun: 10AM-4PM</p>
						</div>
					</div>
				</div>
				
				<div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
					<p>&copy; 2024 Footwear Store. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}
