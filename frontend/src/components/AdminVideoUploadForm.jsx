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

    if (!formData.video) {
      setMessage('Error: Please select a video file.');
      setLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      let videoUrl = null;

      // 1. Try to get Cloudinary signature from backend
      let signData = { cloudinary_configured: false };
      try {
        const signResponse = await fetch('/api/admin/cloudinary-sign', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ folder: 'boutique/videos' })
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
        setMessage('Uploading video directly to Cloudinary...');
        const { signature, timestamp, api_key, cloud_name, folder } = signData;
        
        const cloudinaryForm = new FormData();
        cloudinaryForm.append('file', formData.video);
        cloudinaryForm.append('api_key', api_key);
        cloudinaryForm.append('timestamp', timestamp);
        cloudinaryForm.append('signature', signature);
        cloudinaryForm.append('folder', folder);

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/video/upload`;
        const uploadResponse = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: cloudinaryForm
        });

        if (!uploadResponse.ok) {
          const errorResult = await uploadResponse.json().catch(() => ({}));
          throw new Error(errorResult?.error?.message || `Cloudinary upload failed (Status ${uploadResponse.status})`);
        }

        const uploadResult = await uploadResponse.json();
        videoUrl = uploadResult.secure_url;
      } else {
        // Cloudinary is not configured or signature fetch failed
        // Check file size against Vercel's 4.5MB payload limit
        const fileSizeMB = formData.video.size / (1024 * 1024);
        if (fileSizeMB > 4.5) {
          throw new Error(`Video file size is ${fileSizeMB.toFixed(2)} MB. Direct local upload is disabled for files larger than 4.5 MB on serverless platforms. To upload this file, you must configure the CLOUDINARY_URL environment variable in your Vercel deployment and redeploy.`);
        }
      }

      // 2. Submit data to backend
      let response;
      if (videoUrl) {
        setMessage('Saving video details to store...');
        response = await fetch('/api/admin/videos', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: formData.title,
            video_url: videoUrl
          })
        });
      } else {
        setMessage('Uploading video to local server...');
        const data = new FormData();
        data.append('title', formData.title);
        data.append('video', formData.video);
        
        response = await fetch('/api/admin/videos', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: data
        });
      }
      
      let result;
      const responseText = await response.text();
      try {
        result = JSON.parse(responseText);
      } catch {
        setMessage(`Server Error (Status ${response.status}): ${responseText.substring(0, 150)}...`);
        setLoading(false);
        return;
      }
      
      if (response.ok) {
        setSuccess(true);
        setMessage('✨ Video uploaded successfully!');
        setFormData({ title: '', video: null });
        // Reset file input in the form
        const fileInput = e.target.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        setMessage(`Error: ${result.msg || result.error || 'Failed to add video.'}`);
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
      <h2>Add Store/Saree Video</h2>
      {message && <div className={`message ${success ? 'success' : 'error'}`}>{message}</div>}

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
        
        <div className="form-group">
          <label>Video File (MP4, WebM)</label>
          <input 
            type="file" 
            name="video" 
            accept="video/*" 
            onChange={handleVideoChange} 
            required 
          />
          <span className="form-help-text">Max file size limit is 500MB. Cloudinary direct upload is supported for large files.</span>
        </div>
        
        <button type="submit" disabled={loading} className="submit-btn primary-btn glass-button">
          {loading ? 'Processing...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
}
