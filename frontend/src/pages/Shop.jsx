import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { role, token } = useAuth();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete product");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("An error occurred");
    }
  };

  if (loading) return <div className="loader">Loading collections...</div>;

  return (
    <motion.div 
      className="shop-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1 
        className="shop-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Our Collection
      </motion.h1>
      <div className="product-grid">
        {products.map((product, index) => (
          <motion.div 
            key={product.id} 
            className="product-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="product-image-container">
              <img src={`/api${product.image_url}`} alt={product.name} className="product-image" />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="price">₹{product.price.toFixed(2)}</p>
              <p className="category">{product.category}</p>
              
              <div className="product-actions">
                <select id={`size-${product.id}`} className="size-selector">
                  {product.sizes.split(',').map(size => (
                    <option key={size} value={size.trim()}>{size.trim()}</option>
                  ))}
                </select>
                <button 
                  className="btn-add"
                  onClick={() => {
                    const size = document.getElementById(`size-${product.id}`).value;
                    addToCart(product, size);
                    alert(`${product.name} added to cart!`);
                  }}
                >
                  Add to Cart
                </button>
                {role === 'admin' && (
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(product.id)}
                    style={{ backgroundColor: '#ff4444', color: 'white', marginTop: '10px', padding: '0.8rem 1.5rem', border: 'none', borderRadius: '5px', fontWeight: '600', cursor: 'pointer', width: '100%' }}
                  >
                    Delete Product
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Shop;
