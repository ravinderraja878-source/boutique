/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, size) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product_id === product.id && item.size === size);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product_id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product_id: product.id, name: product.name, price: product.price, size, quantity: 1, image_url: product.image_url }];
    });
  };

  const removeFromCart = (productId, size) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.product_id === productId && item.size === size)));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
