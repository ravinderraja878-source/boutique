import { motion } from 'framer-motion';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <motion.div 
        className="footer-container"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="footer-logo">
          <img src="/logo.png" alt="Niara by Neenu Logo" className="footer-logo-img" />
          <div className="footer-brand">
            <h3>Niara by <span>Neenu</span></h3>
            <p className="founder-name">Founder: Neenu Ralish</p>
          </div>
        </div>
        <div className="footer-social">
          <a href="https://www.instagram.com/niara_by_neenu/" target="_blank" rel="noopener noreferrer" className="instagram-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            @niara_by_neenu
          </a>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
