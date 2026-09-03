import { useEffect, useReducer } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Product from '../components/Product';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST': return { ...state, loading: true };
    case 'FETCH_SUCCESS': return { ...state, products: action.payload, loading: false };
    case 'FETCH_FAIL': return { ...state, loading: false, error: action.payload };
    default: return state;
  }
};

const styleImages = {
  Running: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=85',
  Urbano: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85',
  Basketball: 'https://images.unsplash.com/photo-1518407613690-d9fc990e795f?auto=format&fit=crop&w=900&q=85',
  Casual: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=85',
};

function HomeScreen() {
  const [{ loading, error, products }, dispatch] = useReducer(reducer, { products: [], loading: true, error: '' });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get('/api/products');
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };
    fetchData();
  }, []);

  const heroImage = 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1500&q=90';
  const categories = ['Running', 'Urbano', 'Basketball', 'Casual'];

  return (
    <div className="home-page">
      <Helmet><title>Tienda de Tenis | Impulsa tu estilo</title></Helmet>

      {!loading && !error && (
        <section className="home-hero-v2">
          <img className="home-hero-bg" src={heroImage} alt="Mujer corriendo de noche" />
          <div className="home-hero-overlay" />
          <div className="home-hero-copy-v2">
            <span className="home-kicker">Nueva colección <span>→</span></span>
            <h1>IMPULSA<br /><em>TU ESTILO</em></h1>
            <p>Diseñadas para moverte contigo.<br />Comodidad, flow y actitud en cada paso.</p>
            <div className="hero-actions">
              <Button as={Link} to="/search">Explorar colección <i className="fas fa-arrow-right ms-2" /></Button>
              <span className="hero-video-link"><span className="play-circle">▶</span> Ver inspiración</span>
            </div>
          </div>
          <div className="hero-social"><span>◎</span><span>♪</span><span>▶</span></div>
          <div className="hero-dots"><b></b><i></i><i></i></div>
        </section>
      )}

      {loading ? <LoadingBox /> : error ? <MessageBox variant="danger">{error}</MessageBox> : (
        <>
          <section className="style-section">
            <div className="home-section-head">
              <div><span className="section-kicker">Encuentra tu vibe</span><h2>EXPLORA POR ESTILO</h2></div>
              <Link className="home-see-all" to="/search">Ver todos <i className="fas fa-arrow-right ms-1" /></Link>
            </div>
            <Row className="g-3">
              {categories.map((category) => (
                <Col key={category} xs={6} md={3}>
                  <Link className="category-tile-v2" to={`/search?category=${encodeURIComponent(category)}`} style={{ backgroundImage: `url(${styleImages[category]})` }}>
                    <span>{category}</span><i className="fas fa-arrow-right" />
                  </Link>
                </Col>
              ))}
            </Row>
          </section>

          <section className="featured-section">
            <div className="home-section-head">
              <div><span className="section-kicker">Lo que está pegando</span><h2>DESTACADOS</h2></div>
              <Link className="home-see-all" to="/search">Ver todos <i className="fas fa-arrow-right ms-1" /></Link>
            </div>
            <Row>
              {products.map((product) => (
                <Col key={product.slug} sm={6} md={4} lg={3} className="mb-4"><Product product={product} /></Col>
              ))}
            </Row>
          </section>

          <section className="home-benefits-v2">
            <div><i className="fas fa-truck" /><strong>Envíos a todo el país</strong><span>Recibe donde estés.</span></div>
            <div><i className="fas fa-sync-alt" /><strong>Cambios fáciles</strong><span>Compra sin complicaciones.</span></div>
            <div><i className="fas fa-shield-alt" /><strong>Compra segura</strong><span>Tu compra protegida.</span></div>
          </section>
        </>
      )}
    </div>
  );
}

export default HomeScreen;
