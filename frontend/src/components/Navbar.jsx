import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
  const { token, role, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="Niara by Neenu Logo" className="logo-img" />
          Niara by <span>Neenu</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/shop" className="nav-link">Shop</Link>
          
          {role === 'admin' && (
            <Link to="/admin" className="nav-link">Admin</Link>
          )}

          <Link to="/cart" className="nav-link cart-icon">
            <ShoppingCart size={24} />
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </Link>
          
          {token ? (
            <button onClick={handleLogout} className="btn-icon">
              <LogOut size={24} />
            </button>
          ) : (
            <Link to="/login" className="btn-icon">
              <User size={24} />
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
