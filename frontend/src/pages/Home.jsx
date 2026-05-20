import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import './Home.css';

const Home = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        if (response.ok) {
          const data = await response.json();
          setVideos(data);
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div className="home">
      <header className="hero">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1>Elegance Redefined</h1>
          <p>Discover the latest trends in Niara by Neenu.</p>
          <Link to="/shop" className="btn-primary">Shop Now</Link>
        </motion.div>
      </header>
      

      {videos.length > 0 && (
        <section className="store-videos">
          <h2>Store & Saree Videos</h2>
          <div className="video-grid">
            {videos.map((video, index) => (
              <motion.div 
                key={video.id} 
                className="video-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <video controls className="store-video">
                  <source src={`/api${video.video_url}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="video-info">
                  <h3>{video.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Home;
