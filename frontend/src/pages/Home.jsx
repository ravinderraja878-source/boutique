import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <header className="hero">
        <div className="hero-content">
          <h1>Elegance Redefined</h1>
          <p>Discover the latest trends in luxury fashion.</p>
          <Link to="/shop" className="btn-primary">Shop Now</Link>
        </div>
      </header>
      
      <section className="featured">
        <h2>Curated Collections</h2>
        <div className="featured-grid">
          <div className="featured-card">
            <h3>Summer Essentials</h3>
            <Link to="/shop?category=summer" className="link">Explore</Link>
          </div>
          <div className="featured-card">
            <h3>Evening Wear</h3>
            <Link to="/shop?category=evening" className="link">Explore</Link>
          </div>
          <div className="featured-card">
            <h3>Accessories</h3>
            <Link to="/shop?category=accessories" className="link">Explore</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
