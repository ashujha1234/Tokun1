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
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

type CartItem = {
  id: string;
  title: string;
  description?: string;
  category: string;
  price?: number;
  imageUrl?: string;
  videoUrl?: string;
  preview?: string;
  isFree?: boolean;
  exclusive?: boolean;   // 👈 add this
};

type CartContextType = {
  cart: CartItem[];
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (promptId: string) => Promise<void>;
  removeFromCart: (promptId: string) => Promise<void>;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth() || ({} as any);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

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
            price: i.prompt.price,
            imageUrl: i.prompt.attachment?.type === "image" ? `${API_BASE}${i.prompt.attachment.path}` : undefined,
            videoUrl: i.prompt.attachment?.type === "video" ? `${API_BASE}${i.prompt.attachment.path}` : undefined,
            isFree: !!i.prompt.free,
              exclusive: !!i.prompt.exclusive,  
          }))
        );
      }
    } catch (err) {
      console.error("Fetch cart failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Add prompt to cart */
  const addToCart = async (promptId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/cart/add/${promptId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (data?.success) {
        await fetchCart(); // refresh
      } else {
        console.error("Add to cart error:", data.error);
      }
    } catch (err) {
      console.error("Add to cart error:", err);
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
  const clearCart = () => setCart([]);

  useEffect(() => {
    if (token) fetchCart();
  }, [token]);

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};

