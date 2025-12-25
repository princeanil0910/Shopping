import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";



export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    setIsAdmin(!!localStorage.getItem("adminAuth"));
  }, [location]);

  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-blue-700 text-white px-4 sm:px-8 py-4 shadow-md relative sm:flex sm:justify-between sm:items-center">
      <div className="flex justify-between items-center">
      {/* Logo */}
      <Link
        to="/"
          className="text-2xl font-bold tracking-wide hover:text-blue-200 transition-transform transform hover:scale-105"
      >
        🛍️ ShopNow
      </Link>

        {/* Mobile menu button */}
        <button
          className="sm:hidden p-2 rounded hover:bg-white/10"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* Navigation Links */}
      <div className={`sm:flex items-center gap-6 ${open ? "flex" : "hidden sm:flex"} sm:static absolute left-0 right-0 sm:left-auto sm:right-auto top-full sm:top-auto bg-blue-700 sm:bg-transparent px-4 sm:px-0 py-3 sm:py-0 border-t border-blue-600 sm:border-0 z-50 flex-col sm:flex-row flex-wrap max-w-full`}>
        <Link
          to="/"
          className="hover:text-blue-200 font-semibold transition-colors"
        >
          Home
        </Link>

        {user && (
          <Link to="/my-orders" className="hover:text-blue-200 font-semibold transition-transform transform hover:scale-105">My Orders</Link>
        )}
        {isAdmin && (
          <Link to="/admin-dashboard" className="hover:text-blue-200 font-semibold">Admin</Link>
        )}
        {!user && (
          <Link to="/admin-login" className="hover:text-blue-200 font-semibold">Admin Access</Link>
        )}

        {user && (
          <>
            <Link
              to="/cart"
              className="hover:text-blue-200 font-semibold transition-transform transform hover:scale-105 flex items-center gap-2"
            >
              <ShoppingCart size={22} />
              Cart
              {cartItems.length > 0 && (
                <span className="ml-1 bg-white text-blue-700 px-2 py-0.5 rounded-full text-sm font-bold">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </>
        )}

        {!user ? (
          <Link to="/login" className="hover:text-blue-200 font-semibold transition-transform transform hover:scale-105">Login</Link>
        ) : (
          <button onClick={logout} className="bg-white/10 px-3 py-1 rounded hover:bg-white/20 font-semibold transition-transform transform hover:scale-105">Logout</button>
        )}
      </div>
    </nav>
  );
}
