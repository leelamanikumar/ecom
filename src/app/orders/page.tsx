"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BackButton from "@/components/BackButton";

type OrderItem = {
  productId: string;
  name: string;
  slug?: string;
  image?: string;
  price: number;
  size?: number;
  quantity: number;
};

type Order = {
  _id: string;
  phone: string;
  items: OrderItem[];
  total: number;
  delivered: boolean;
  deliveredAt?: string | null;
  createdAt: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const p = localStorage.getItem('lastPhone');
      if (p) setPhone(p);
    } catch {}
  }, []);

  async function fetchOrders(queryPhone?: string) {
    setLoading(true);
    setError(null);
    try {
      const search = new URLSearchParams();
      const digits = (queryPhone ?? phone).replace(/\D/g, '');
      if (digits) search.set('phone', digits);
      const res = await fetch(`/api/order?${search.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (phone) fetchOrders(phone);
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchOrders(phone);
    try { localStorage.setItem('lastPhone', phone.replace(/\D/g, '')); } catch {}
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <BackButton />
      </div>
      <h1 className="text-2xl font-semibold mb-4">Your Orders</h1>

      <form onSubmit={onSubmit} className="mb-4 flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Phone number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter the phone used at checkout"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-black text-white rounded">Lookup</button>
      </form>

      {error && (
        <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
      )}

      {loading ? (
        <div>Loading…</div>
      ) : orders.length === 0 ? (
        <div className="text-gray-600">No orders found. <Link href="/" className="text-blue-600 underline">Shop now</Link></div>
      ) : (
        <ul className="divide-y border rounded">
          {orders.map((o) => (
            <li key={o._id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium">Order #{o._id.slice(-6)}</div>
                  <div className="text-sm text-gray-600">Placed on {new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">₹{o.total.toFixed(2)}</div>
                  <div className="text-sm">
                    {o.delivered ? (
                      <span className="text-green-700">Delivered {o.deliveredAt ? `on ${new Date(o.deliveredAt).toLocaleDateString()}` : ''}</span>
                    ) : (
                      <span className="text-orange-700">Pending</span>
                    )}
                  </div>
                </div>
              </div>
              
              {o.items && o.items.length > 0 && (
                <div className="border-t pt-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">Items:</div>
                  <ul className="space-y-2">
                    {o.items.map((item, index) => (
                      <li key={index} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-gray-500">
                            {item.size ? `Size ${item.size}` : 'One size'} • Qty: {item.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div>₹{item.price.toFixed(2)} each</div>
                          <div className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


