import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (!token) {
      alert("Please login to checkout.");
      navigate('/login');
      return;
    }
    navigate('/payment');
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="btn-primary mt-4">Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">Your Cart</h1>
      
      <div className="cart-container">
        <div className="cart-items">
          {cart.map((item, index) => (
            <div key={index} className="cart-item">
              <img src={`/api${item.image_url}`} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p>Size: {item.size}</p>
                <p className="item-price">₹{item.price.toFixed(2)}</p>
                <div className="cart-item-actions">
                  <span>Qty: {item.quantity}</span>
                  <button onClick={() => removeFromCart(item.product_id, item.size)} className="btn-remove">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
          <button 
            className="btn-checkout" 
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
