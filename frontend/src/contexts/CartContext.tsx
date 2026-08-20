// import { createContext, useContext, useState, ReactNode } from "react";

// type CartItem = {
//   id: string;
//   title: string;
//   description?: string;
//   category: string;
//   price?: number;
//   imageUrl?: string;
//   videoUrl?: string;
//   preview?: string;
//   isFree?: boolean;
// };

// type CartContextType = {
//   cart: CartItem[];
//   addToCart: (item: CartItem) => void;
//   removeFromCart: (id: string) => void;
//   clearCart: () => void;
// };

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export const CartProvider = ({ children }: { children: ReactNode }) => {
//   const [cart, setCart] = useState<CartItem[]>([]);

//   const addToCart = (item: CartItem) => {
//     setCart((prev) => {
//       if (prev.find((p) => p.id === item.id)) return prev; // avoid duplicates
//       return [...prev, item];
//     });
//   };

//   const removeFromCart = (id: string) => {
//     setCart((prev) => prev.filter((p) => p.id !== id));
//   };

//   const clearCart = () => setCart([]);

//   return (
//     <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => {
//   const ctx = useContext(CartContext);
//   if (!ctx) throw new Error("useCart must be used inside CartProvider");
//   return ctx;
// };


// src/contexts/CartContext.tsx
import { createContext, useCallback, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

type CartItem = {
  id: string;
  title: string;
  description?: string;
  category: string;
  /**
   * What checkout will charge for this item — list price plus Tokun's platform
   * fee. Deliberately not the seller's list price: this figure is summed into
   * the cart total the buyer sees, and /api/cart/checkout bills the same one.
   */
  price?: number;
  /** The seller's list price, kept so a fee breakdown can be shown. */
  listPrice?: number;
  imageUrl?: string;
  videoUrl?: string;
  preview?: string;
  isFree?: boolean;
  exclusive?: boolean;   // 👈 add this
};

/* What happened, so the caller can say so.
   addToCart used to return void and swallow every failure into console.error —
   the server refuses for real reasons (already in the cart, already purchased,
   one-time prompt already sold, signed out) and the UI answered every one of
   them with "Added to Cart". */
export type AddToCartResult = {
  ok: boolean;
  error?: string;
  message?: string;
};

/* The buyer's Refer & Earn welcome credit, as it applies to THIS cart.
   Server-computed (GET /api/cart) rather than a percentage the client works out
   for itself: the credit is capped (maxAmount) and can never exceed Tokun's own
   cut on the order, so "5% of the total" is the right answer only sometimes —
   and checkout would then charge a different number than the cart displayed. */
export type CartWelcomeDiscount = {
  percent: number;
  maxAmount: number;
  /** Rupees off this cart. */
  amount: number;
  expiresAt?: string;
};

type CartContextType = {
  cart: CartItem[];
  loading: boolean;
  /** null when the buyer has no credit, or it can't apply to this cart. */
  welcomeDiscount: CartWelcomeDiscount | null;
  /** What checkout will charge, discount included. */
  payableTotal: number;
  fetchCart: () => Promise<void>;
  addToCart: (promptId: string) => Promise<AddToCartResult>;
  removeFromCart: (promptId: string) => Promise<void>;
  clearCart: () => void;
  /** Is this product already in the cart? */
  isInCart: (promptId: string | number) => boolean;
};

/* The server's error codes, in the buyer's words. Anything unmapped falls back
   to the server's own `message` and then to a generic line, so a new code can
   never surface as a bare identifier. */
const ADD_ERROR_MESSAGES: Record<string, string> = {
  not_signed_in: "Sign in to add products to your cart.",
  already_in_cart: "This product is already in your cart.",
  already_purchased: "You already own this product — it's in your purchase history.",
  prompt_already_sold: "This one-time product has already been sold.",
  prompt_deleted: "This product is no longer available.",
  prompt_not_found: "This product is no longer available.",
  seller_not_verified: "This Creator is still being verified — the product isn't buyable yet.",
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth() || ({} as any);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [welcomeDiscount, setWelcomeDiscount] = useState<CartWelcomeDiscount | null>(null);
  const [payableTotal, setPayableTotal] = useState(0);

  /** 🔹 Fetch cart from backend */
  const fetchCart = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const data = await res.json();
      if (data?.success) {
        setCart(
          (data.cart.items || []).map((i: any) => ({
            id: i.prompt._id,
            title: i.prompt.title,
            description: i.prompt.description,
            category: i.prompt.categories?.[0]?.name || "General",
            // Falls back to the list price rather than 0 — a prompt saved before
            // the tokun_price hook existed would otherwise show up as free.
            price:
              Number(i.prompt.tokun_price) > 0 ? Number(i.prompt.tokun_price) : i.prompt.price,
            listPrice: i.prompt.price,
            imageUrl: i.prompt.attachment?.type === "image"
  ? (i.prompt.attachment.path?.startsWith("http")
      ? i.prompt.attachment.path
      : `${API_BASE}${i.prompt.attachment.path}`)
  : undefined,
videoUrl: i.prompt.attachment?.type === "video"
  ? (i.prompt.attachment.path?.startsWith("http")
      ? i.prompt.attachment.path
      : `${API_BASE}${i.prompt.attachment.path}`)
  : undefined,
            isFree: !!i.prompt.free,
              exclusive: !!i.prompt.exclusive,  
          }))
        );
        setWelcomeDiscount(data.welcomeDiscount || null);
        setPayableTotal(Number(data.payableTotal ?? data.totalTokunPrice ?? 0));
      }
    } catch (err) {
      console.error("Fetch cart failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Add prompt to cart */
  const addToCart = async (promptId: string): Promise<AddToCartResult> => {
    // Was a bare `return` — a signed-out click did nothing at all and still got
    // a success toast from the caller.
    if (!token) {
      return { ok: false, error: "not_signed_in", message: ADD_ERROR_MESSAGES.not_signed_in };
    }

    const fail = (error: string, serverMessage?: string): AddToCartResult => ({
      ok: false,
      error,
      message: ADD_ERROR_MESSAGES[error] || serverMessage || "Couldn't add this prompt to your cart.",
    });

    try {
      const res = await fetch(`${API_BASE}/api/cart/add/${promptId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        console.error("Add to cart error:", data?.error);
        return fail(data?.error || `http_${res.status}`, data?.message);
      }

      await fetchCart(); // refresh
      return { ok: true };
    } catch (err) {
      console.error("Add to cart error:", err);
      return fail("network_error");
    }
  };

  /** 🔹 Remove prompt from cart */
const removeFromCart = async (promptId: string) => {
  if (!token) return; // get token from useAuth
  try {
    const res = await fetch(`${API_BASE}/api/cart/remove/${promptId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || "server_error");
    }

    // refresh cart after removal
    await fetchCart();
  } catch (err) {
    console.error("[removeFromCart] failed:", err);
  }
};



  /** 🔹 Clear local cart */
  const clearCart = () => {
    setCart([]);
    // The credit belongs to the cart it was previewed against — an emptied cart
    // has no discount to show.
    setWelcomeDiscount(null);
    setPayableTotal(0);
  };

  useEffect(() => {
    if (token) fetchCart();
  }, [token]);

  /* Asked here rather than written out per screen.

     Five screens offer "Add to Cart" — the marketplace card, the details panel,
     the library, the profile grid and the reel card — so five copies of
     `cart.some(...)` is five chances to compare a number id against a string
     one and quietly always answer false. The ids arrive as both: a card passes
     `prompt.id` straight through, and the cart stores what the API returned. */
  const isInCart = useCallback(
    (promptId: string | number) => cart.some((i) => String(i.id) === String(promptId)),
    [cart]
  );

  return (
    <CartContext.Provider value={{ cart, loading, welcomeDiscount, payableTotal, fetchCart, addToCart, removeFromCart, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};

