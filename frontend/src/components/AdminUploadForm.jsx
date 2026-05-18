import { useState } from 'react';
import './AdminUploadForm.css';

export default function AdminUploadForm() {
  const [formData, setFormData] = useState({
    name: '', category: '', price: '', sizes: '', description: '', image: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccess(false);
    
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));

    try {
      // Dummy token for demonstration. In a real app, you get this from login endpoint
      const token = localStorage.getItem('token') || 'dummy-admin-token';
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });
      
      const result = await response.json();
      if (response.ok) {
        setSuccess(true);
        setMessage('✨ Product added successfully to inventory!');
        setFormData({name: '', category: '', price: '', sizes: '', description: '', image: null});
        e.target.reset();
      } else {
        setMessage(`Error: ${result.msg || result.error || 'Failed to add product.'}`);
      }
    } catch {
      setMessage('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-container glass-panel">
      <h2>Add New Premium Dress</h2>
      {message && <div className={`message ${success ? 'success' : 'error'}`}>{message}</div>}
      
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Dress Name</label>
          <input type="text" name="name" onChange={handleInputChange} required placeholder="e.g. Midnight Silk Gown" />
        </div>
        
        <div className="form-group">
          <label>Category</label>
          <input type="text" name="category" onChange={handleInputChange} required placeholder="e.g. Evening Wear" />
        </div>
        
        <div className="form-group">
          <label>Price (₹)</label>
          <input type="number" step="0.01" name="price" onChange={handleInputChange} required placeholder="299.99" />
        </div>
        
        <div className="form-group">
          <label>Sizes Available</label>
          <input type="text" name="sizes" onChange={handleInputChange} required placeholder="S, M, L" />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" onChange={handleInputChange} rows="4" required placeholder="Luxurious detailing..."></textarea>
        </div>
        
        <div className="form-group">
          <label>Product Image</label>
          <input type="file" name="image" accept="image/*" onChange={handleImageChange} required />
        </div>
        
        <button type="submit" disabled={loading} className="submit-btn primary-btn glass-button">
          {loading ? 'Uploading Details...' : 'Upload Dress to Store'}
        </button>
      </form>
    </div>
  );
}
