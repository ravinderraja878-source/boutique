import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Payment.css';

const Payment = () => {
  const { cart, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    pincode: '',
    phone: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="payment-empty">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="btn-primary mt-4">Continue Shopping</button>
      </div>
    );
  }

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!shippingInfo.address || !shippingInfo.pincode || !shippingInfo.phone) {
      alert('Please fill out all shipping details');
      return;
    }

    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          total_amount: totalAmount,
          address: shippingInfo.address,
          pincode: shippingInfo.pincode,
          phone: shippingInfo.phone,
          payment_method: selectedMethod
        })
      });

      if (response.ok) {
        alert("Payment successful! Your order has been placed.");
        clearCart();
        navigate('/');
      } else {
        const data = await response.json();
        alert(`Payment failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-container glass-panel">
        <h2>Complete Your Order</h2>
        
        <form onSubmit={handlePayment} className="checkout-form">
          <div className="shipping-section">
            <h3>Shipping Details</h3>
            <div className="form-group">
              <label>Full Address</label>
              <textarea 
                name="address" 
                value={shippingInfo.address} 
                onChange={handleInputChange} 
                required 
                placeholder="123 Example Street, Apt 4B, City, State"
                rows="3"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Pincode</label>
                <input 
                  type="text" 
                  name="pincode" 
                  value={shippingInfo.pincode} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="123456"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={shippingInfo.phone} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          </div>

          <div className="payment-section">
            <h3 className="section-title">Payment Options</h3>
            <p className="payment-amount">Total Amount: <span>₹{totalAmount.toFixed(2)}</span></p>
            
            <div className="method-options">
            <label className={`method-label ${selectedMethod === 'gpay' ? 'selected' : ''}`}>
              <input type="radio" name="payment" value="gpay" onChange={(e) => setSelectedMethod(e.target.value)} />
              Google Pay
            </label>
            <label className={`method-label ${selectedMethod === 'phonepe' ? 'selected' : ''}`}>
              <input type="radio" name="payment" value="phonepe" onChange={(e) => setSelectedMethod(e.target.value)} />
              PhonePe
            </label>
            <label className={`method-label ${selectedMethod === 'paytm' ? 'selected' : ''}`}>
              <input type="radio" name="payment" value="paytm" onChange={(e) => setSelectedMethod(e.target.value)} />
              Paytm
            </label>
            <label className={`method-label ${selectedMethod === 'cod' ? 'selected' : ''}`}>
              <input type="radio" name="payment" value="cod" onChange={(e) => setSelectedMethod(e.target.value)} />
              Cash on Delivery (COD)
            </label>
          </div>
        </div>

        {selectedMethod && selectedMethod !== 'cod' && (
          <div className="upi-details">
            <p>Please send the exact amount to the following UPI ID:</p>
            <div className="upi-id-box">
              <strong>7981452169@ptyes</strong>
            </div>
            <div className="qr-code-container">
              <img src="/qr.png" alt="UPI QR Code" className="qr-code-img" />
            </div>
            <p className="upi-instruction">After transferring the money, click the Confirm Payment button below.</p>
          </div>
        )}

        {selectedMethod === 'cod' && (
          <div className="upi-details cod-details">
            <p>You have selected Cash on Delivery.</p>
            <p className="upi-instruction">You will pay ₹{totalAmount.toFixed(2)} in cash when your order is delivered to your address.</p>
          </div>
        )}

        <button 
          type="submit"
          className="btn-confirm-payment primary-btn glass-button" 
          disabled={!selectedMethod || isProcessing}
        >
          {isProcessing ? 'Processing Order...' : 'Confirm Order & Payment'}
        </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;
