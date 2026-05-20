import { useState } from 'react';
import './AdminVideoUploadForm.css';

export default function AdminVideoUploadForm() {
  const [formData, setFormData] = useState({ title: '', video: null });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVideoChange = (e) => {
    setFormData(prev => ({ ...prev, video: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccess(false);
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('video', formData.video);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });
      
      const result = await response.json();
      if (response.ok) {
        setSuccess(true);
        setMessage('✨ Video uploaded successfully!');
        setFormData({ title: '', video: null });
        e.target.reset();
      } else {
        setMessage(`Error: ${result.msg || result.error || 'Failed to upload video.'}`);
      }
    } catch {
      setMessage('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-container glass-panel">
      <h2>Upload Store/Saree Video</h2>
      {message && <div className={`message ${success ? 'success' : 'error'}`}>{message}</div>}
      
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Video Title</label>
          <input type="text" name="title" onChange={handleInputChange} required placeholder="e.g. New Bridal Collection Walkthrough" />
        </div>
        
        <div className="form-group">
          <label>Video File (MP4, WebM)</label>
          <input type="file" name="video" accept="video/*" onChange={handleVideoChange} required />
        </div>
        
        <button type="submit" disabled={loading} className="submit-btn primary-btn glass-button">
          {loading ? 'Uploading Video...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
}
