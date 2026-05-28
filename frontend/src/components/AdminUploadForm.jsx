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
    
    if (!formData.image) {
      setMessage('Error: Please select a product image.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token') || 'dummy-admin-token';
      let imageUrl = null;

      // 1. Try to get Cloudinary signature from backend
      let signData = { cloudinary_configured: false };
      try {
        const signResponse = await fetch('/api/admin/cloudinary-sign', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ folder: 'boutique/products' })
        });
        
        if (signResponse.ok) {
          signData = await signResponse.json();
        } else {
          const errText = await signResponse.text();
          let errJson = {};
          try { errJson = JSON.parse(errText); } catch {}
          throw new Error(`Signature service returned status ${signResponse.status}: ${errJson.error || errJson.msg || errText}`);
        }
      } catch (err) {
        console.error('Cloudinary sign fetch error:', err);
        // Show signature service error to help diagnostic
        setMessage(`Direct upload initialization status: ${err.message}.`);
      }

      if (signData.cloudinary_configured) {
        setMessage('Uploading image directly to Cloudinary...');
        const { signature, timestamp, api_key, cloud_name, folder } = signData;
        
        const cloudinaryForm = new FormData();
        cloudinaryForm.append('file', formData.image);
        cloudinaryForm.append('api_key', api_key);
        cloudinaryForm.append('timestamp', timestamp);
        cloudinaryForm.append('signature', signature);
        cloudinaryForm.append('folder', folder);

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;
        const uploadResponse = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: cloudinaryForm
        });

        if (!uploadResponse.ok) {
          const errorResult = await uploadResponse.json().catch(() => ({}));
          throw new Error(errorResult?.error?.message || `Cloudinary upload failed (Status ${uploadResponse.status})`);
        }

        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.secure_url;
      } else {
        // Cloudinary is not configured or signature fetch failed
        // Check file size against Vercel's 4.5MB payload limit
        const fileSizeMB = formData.image.size / (1024 * 1024);
        if (fileSizeMB > 4.5) {
          throw new Error(`Image file size is ${fileSizeMB.toFixed(2)} MB. Direct local upload is disabled for files larger than 4.5 MB on serverless platforms. To upload this file, you must configure the CLOUDINARY_URL environment variable in your Vercel deployment and redeploy.`);
        }
      }

      // 2. Submit data to backend
      let response;
      if (imageUrl) {
        setMessage('Saving product details to store...');
        response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: formData.name,
            category: formData.category,
            price: formData.price,
            sizes: formData.sizes,
            description: formData.description,
            image_url: imageUrl
          })
        });
      } else {
        setMessage('Uploading product details to local server...');
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: data
        });
      }
      
      const result = await response.json();
      if (response.ok) {
        setSuccess(true);
        setMessage('✨ Product added successfully to inventory!');
        setFormData({name: '', category: '', price: '', sizes: '', description: '', image: null});
        e.target.reset();
      } else {
        setMessage(`Error: ${result.msg || result.error || 'Failed to add product.'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage(`Error: ${err.message || 'Please try again.'}`);
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
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. Midnight Silk Gown" />
        </div>
        
        <div className="form-group">
          <label>Category</label>
          <input type="text" name="category" value={formData.category} onChange={handleInputChange} required placeholder="e.g. Evening Wear" />
        </div>
        
        <div className="form-group">
          <label>Price (₹)</label>
          <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} required placeholder="299.99" />
        </div>
        
        <div className="form-group">
          <label>Sizes Available</label>
          <input type="text" name="sizes" value={formData.sizes} onChange={handleInputChange} required placeholder="S, M, L" />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" required placeholder="Luxurious detailing..."></textarea>
        </div>
        
        <div className="form-group">
          <label>Product Image</label>
          <input type="file" name="image" accept="image/*" onChange={handleImageChange} required />
        </div>
        
        <button type="submit" disabled={loading} className="submit-btn primary-btn glass-button">
          {loading ? 'Processing...' : 'Upload Dress to Store'}
        </button>
      </form>
    </div>
  );
}
