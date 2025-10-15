"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent, useMemo, useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";

export default function NavBar() {
	const router = useRouter();
	const { state } = useCart();
	const cartCount = useMemo(() => state.items.reduce((sum, i) => sum + i.quantity, 0), [state.items]);
	const [query, setQuery] = useState("");
	const [menuOpen, setMenuOpen] = useState(false);
	const [categoriesOpen, setCategoriesOpen] = useState(true);
	const [topCategoriesOpen, setTopCategoriesOpen] = useState(false);
	
	// Refs for click outside detection
	const menuRef = useRef<HTMLDivElement>(null);
	const categoriesRef = useRef<HTMLDivElement>(null);

	function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const trimmed = query.trim();
		if (trimmed.length === 0) return;
		router.push(`/search?q=${encodeURIComponent(trimmed)}`);
	}

	function closeMenu() {
		setMenuOpen(false);
	}

	// Handle click outside to close dropdowns
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			// Close hamburger menu if clicking outside
			if (menuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setMenuOpen(false);
			}
			
			// Close categories dropdown if clicking outside
			if (topCategoriesOpen && categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
				setTopCategoriesOpen(false);
			}
		}

		// Add event listener when dropdowns are open
		if (menuOpen || topCategoriesOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		// Cleanup event listener
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [menuOpen, topCategoriesOpen]);

	return (
		<header className="sticky top-0 z-40 bg-black text-white border-b border-gray-700">
			<div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex flex-wrap items-center gap-2 sm:gap-4 relative">
				{/* Left: menu + brand */}
				<div className="flex items-center gap-2 sm:gap-3">
					<button
						aria-label="Open menu"
						className="h-9 w-9 grid place-items-center border border-white/30 rounded hover:bg-white/10"
						onClick={() => setMenuOpen((v) => !v)}
					>
						<span className="block w-5 h-0.5 bg-white mb-1" />
						<span className="block w-5 h-0.5 bg-white mb-1" />
						<span className="block w-5 h-0.5 bg-white" />
					</button>

					<Link href="/" className="text-base sm:text-lg font-semibold whitespace-nowrap text-white">Footwear Store</Link>
				</div>

				{/* Right: actions */}
				<nav className="ml-auto flex items-center gap-3 sm:gap-4">
					<div className="relative" ref={categoriesRef}>
						<button
							type="button"
							className="text-sm hover:underline text-white"
							onClick={() => setTopCategoriesOpen((v) => !v)}
						>
							Categories
						</button>
						{topCategoriesOpen && (
							<div className="absolute right-0 mt-2 w-48 bg-white text-black border border-gray-200 rounded shadow-lg overflow-hidden">
								<Link href="/search?q=slides" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setTopCategoriesOpen(false)}>Slides</Link>
								<Link href="/search?q=crocs" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setTopCategoriesOpen(false)}>Crocs</Link>
								<Link href="/search?q=shoes" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setTopCategoriesOpen(false)}>Shoes</Link>
								<Link href="/search?q=gadgets" className="block px-4 py-2 hover:bg-gray-50" onClick={() => setTopCategoriesOpen(false)}>Gadgets</Link>
							</div>
						)}
					</div>
					<Link href="/contact" className="text-sm hover:underline text-white">Contact</Link>
					<Link href="/cart" className="relative inline-block text-sm hover:underline text-white">
						Cart
						{cartCount > 0 && (
							<span className="absolute -top-2 -right-3 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] leading-none px-2 py-1">
								{cartCount}
							</span>
						)}
					</Link>
				</nav>

				{/* Full-width search on mobile */}
				<form onSubmit={onSubmit} className="order-3 w-full sm:order-none sm:flex-1 flex items-center gap-2 mt-2 sm:mt-0">
					<input
						type="search"
						placeholder="Search shoes, brands..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-black placeholder:text-gray-500"
					/>
					<button type="submit" className="px-3 py-2 bg-white text-black rounded text-sm hover:bg-gray-100">Search</button>
				</form>

				{/* Legacy side menu dropdown */}
				{menuOpen && (
					<div ref={menuRef} className="absolute left-3 top-full mt-2 w-64 bg-white text-black border rounded shadow-lg overflow-hidden">
						<div className="py-2">
							<Link href="/" className="block px-4 py-2 hover:bg-gray-50" onClick={closeMenu}>Shop</Link>
							<Link href="/orders" className="block px-4 py-2 hover:bg-gray-50" onClick={closeMenu}>View Orders</Link>
							<button
								className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between"
								onClick={() => setCategoriesOpen((v) => !v)}
							>
								<span>Categories</span>
								<span className="text-gray-500">{categoriesOpen ? '▾' : '▸'}</span>
							</button>
							{categoriesOpen && (
								<div className="pl-4">
									<Link href="/search?q=men" className="block px-4 py-2 hover:bg-gray-50" onClick={closeMenu}>Men</Link>
									<Link href="/search?q=women" className="block px-4 py-2 hover:bg-gray-50" onClick={closeMenu}>Women</Link>
									<Link href="/search?q=kids" className="block px-4 py-2 hover:bg-gray-50" onClick={closeMenu}>Kids</Link>
								</div>
							)}
							<Link href="/contact" className="block px-4 py-2 hover:bg-gray-50" onClick={closeMenu}>Contact Us</Link>
						</div>
					</div>
				)}
			</div>
		</header>
	);
}
