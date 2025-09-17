"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

export interface CartItem {
	productId: string;
	name: string;
	slug?: string;
	image?: string;
	price: number;
	size?: number;
	quantity: number;
}

interface CartState {
	items: CartItem[];
}

type Action =
	| { type: 'ADD_ITEM'; item: CartItem }
	| { type: 'REMOVE_ITEM'; productId: string; size?: number }
	| { type: 'CHANGE_QTY'; productId: string; size?: number; quantity: number }
	| { type: 'CLEAR' };

const CartContext = createContext<{
	state: CartState;
	addItem: (item: CartItem) => void;
	removeItem: (productId: string, size?: number) => void;
	changeQty: (productId: string, size: number | undefined, quantity: number) => void;
	clear: () => void;
}>({
	state: { items: [] },
	addItem: () => {},
	removeItem: () => {},
	changeQty: () => {},
	clear: () => {},
});

function cartReducer(state: CartState, action: Action): CartState {
	switch (action.type) {
		case 'ADD_ITEM': {
			const key = (i: CartItem) => `${i.productId}-${i.size ?? 'na'}`;
			const existingIndex = state.items.findIndex((i) => key(i) === key(action.item));
			const newItems = [...state.items];
			if (existingIndex >= 0) {
				newItems[existingIndex] = { ...newItems[existingIndex], quantity: newItems[existingIndex].quantity + action.item.quantity };
			} else {
				newItems.push(action.item);
			}
			return { items: newItems };
		}
		case 'REMOVE_ITEM': {
			const key = (i: CartItem) => `${i.productId}-${i.size ?? 'na'}`;
			return { items: state.items.filter((i) => key(i) !== `${action.productId}-${action.size ?? 'na'}`) };
		}
		case 'CHANGE_QTY': {
			const key = (i: CartItem) => `${i.productId}-${i.size ?? 'na'}`;
			return {
				items: state.items.map((i) =>
					key(i) === `${action.productId}-${action.size ?? 'na'}`
						? { ...i, quantity: Math.max(1, action.quantity) }
						: i
				),
			};
		}
		case 'CLEAR':
			return { items: [] };
		default:
			return state;
	}
}

function useLocalStorageReducer<TState, TAction>(
	reducer: (s: TState, a: TAction) => TState,
	initial: TState,
	key: string
) {
	const [state, dispatch] = useReducer(reducer as any, initial);
	useEffect(() => {
		const stored = localStorage.getItem(key);
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				dispatch({ type: '__INIT__', state: parsed } as any);
			} catch {}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(state));
	}, [key, state]);
	function initDispatch(action: any) {
		if (action?.type === '__INIT__') return;
		dispatch(action);
	}
	return [state, initDispatch] as const;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [state, dispatch] = useLocalStorageReducer<CartState, Action>(cartReducer, { items: [] }, 'cart:v1');

	const api = useMemo(() => ({
		state,
		addItem: (item: CartItem) => dispatch({ type: 'ADD_ITEM', item }),
		removeItem: (productId: string, size?: number) => dispatch({ type: 'REMOVE_ITEM', productId, size }),
		changeQty: (productId: string, size: number | undefined, quantity: number) => dispatch({ type: 'CHANGE_QTY', productId, size, quantity }),
		clear: () => dispatch({ type: 'CLEAR' }),
	}), [state]);

	return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
	return useContext(CartContext);
}
