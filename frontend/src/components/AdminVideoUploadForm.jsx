import { useState } from 'react';
import './AdminVideoUploadForm.css';

export default function AdminVideoUploadForm() {
  const [formData, setFormData] = useState({ title: '', video: null, video_url: '' });
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
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
    
    try {
      const token = localStorage.getItem('token');
      let response;
      
      if (uploadMode === 'file') {
        if (!formData.video) {
          setMessage('Error: Please select a video file.');
          setLoading(false);
          return;
        }
        const data = new FormData();
        data.append('title', formData.title);
        data.append('video', formData.video);
        
        response = await fetch('/api/admin/videos', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: data
        });
      } else {
        if (!formData.video_url.trim()) {
          setMessage('Error: Please enter a valid video link/URL.');
          setLoading(false);
          return;
        }
        response = await fetch('/api/admin/videos', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: formData.title,
            video_url: formData.video_url
          })
        });
      }
      
      const result = await response.json();
      if (response.ok) {
        setSuccess(true);
        setMessage(uploadMode === 'file' ? '✨ Video uploaded successfully!' : '✨ Video link added successfully!');
        setFormData({ title: '', video: null, video_url: '' });
        // Reset file input in the form
        const fileInput = e.target.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        setMessage(`Error: ${result.msg || result.error || 'Failed to add video.'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-container glass-panel">
      <h2>Add Store/Saree Video</h2>
      {message && <div className={`message ${success ? 'success' : 'error'}`}>{message}</div>}
      
      <div className="upload-mode-toggle">
        <button 
          type="button"
          className={`mode-btn ${uploadMode === 'file' ? 'active' : ''}`}
          onClick={() => {
            setUploadMode('file');
            setMessage('');
          }}
        >
          📁 Upload File
        </button>
        <button 
          type="button"
          className={`mode-btn ${uploadMode === 'url' ? 'active' : ''}`}
          onClick={() => {
            setUploadMode('url');
            setMessage('');
          }}
        >
          🔗 Video Link
        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Video Title</label>
          <input 
            type="text" 
            name="title" 
            value={formData.title}
            onChange={handleInputChange} 
            required 
            placeholder="e.g. New Bridal Collection Walkthrough" 
          />
        </div>
        
        {uploadMode === 'file' ? (
          <div className="form-group">
            <label>Video File (MP4, WebM)</label>
            <input 
              type="file" 
              name="video" 
              accept="video/*" 
              onChange={handleVideoChange} 
              required 
            />
            <span className="form-help-text">Max file size limit is 500MB. Recommended is under 20MB.</span>
          </div>
        ) : (
          <div className="form-group">
            <label>Video Link / URL</label>
            <input 
              type="url" 
              name="video_url" 
              value={formData.video_url}
              onChange={handleInputChange} 
              required 
              placeholder="e.g. https://res.cloudinary.com/demo/video/upload/v12345/saree_vid.mp4" 
            />
            <span className="form-help-text">Paste the direct link to a hosted video file (.mp4, .webm). Recommended for Vercel/production deployment.</span>
          </div>
        )}
        
        <button type="submit" disabled={loading} className="submit-btn primary-btn glass-button">
          {loading ? (uploadMode === 'file' ? 'Uploading Video...' : 'Adding Link...') : (uploadMode === 'file' ? 'Upload Video' : 'Add Video Link')}
        </button>
      </form>
    </div>
  );
}
