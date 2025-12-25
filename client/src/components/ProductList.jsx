import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { API_URL } from "../config";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {products.map((product) => (
        <div
          key={product._id}
          className="bg-white shadow-lg rounded-xl p-4 hover:shadow-xl transition-all transform hover:scale-105 flex flex-col items-center w-full"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover mb-3 rounded-lg"
          />
          <h3 className="text-lg sm:text-xl font-semibold text-center">{product.name}</h3>
          <p className="text-gray-500 mb-2 text-center line-clamp-2">{product.description}</p>
          <p className="text-blue-600 font-bold text-lg mb-4">
            ₹{product.price}
          </p>
          <button
            onClick={() =>
              addToCart({
                _id: product._id,
                name: product.name,
                price: Number(product.price),
                image: product.image,
                quantity: 1, // ✅ ensure default quantity
              })
            }
            className="bg-blue-600 w-full sm:w-auto text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}
