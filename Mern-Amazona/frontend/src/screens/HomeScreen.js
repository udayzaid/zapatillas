import { useEffect, useReducer, useState } from 'react';
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

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1706459418431-f68031d1b006?auto=format&fit=crop&w=1800&q=88',
    alt: 'Mujer corriendo de noche por la ciudad',
    kicker: 'Nueva colección',
    title: 'IMPULSA',
    accent: 'TU ESTILO',
    text: 'Muévete con actitud. Comodidad, flow y energía en cada paso.',
  },
  {
    image: 'https://images.unsplash.com/photo-1726195221456-7e104a23bbff?auto=format&fit=crop&w=1800&q=88',
    alt: 'Mujer corriendo en una pista de noche',
    kicker: 'Activa tu ritmo',
    title: 'CORRE',
    accent: 'SIN LÍMITES',
    text: 'Encuentra tu ritmo y haz que cada recorrido cuente.',
  },
  {
    image: 'https://images.unsplash.com/photo-1759169523010-b67a2cb2f1fe?auto=format&fit=crop&w=1800&q=88',
    alt: 'Corredor en una carrera urbana',
    kicker: 'Tu próximo desafío',
    title: 'LLEGA',
    accent: 'MÁS LEJOS',
    text: 'Diseño, comodidad y energía para acompañarte.',
  },
];

const styleCards = [
  {
    label: 'Correr',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=85',
  },
  {
    label: 'Urbano',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85',
  },
  {
    label: 'Baloncesto',
    image: 'https://images.unsplash.com/photo-1518407613690-d9fc990e795f?auto=format&fit=crop&w=900&q=85',
  },
  {
    label: 'Casual',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=85',
  },
];

function HomeScreen() {
  const [{ loading, error, products }, dispatch] = useReducer(reducer, { products: [], loading: true, error: '' });
  const [activeSlide, setActiveSlide] = useState(0);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[activeSlide];

  return (
    <div className="home-page">
      <Helmet><title>Tienda de Tenis | Impulsa tu estilo</title></Helmet>

      {!loading && !error && (
        <section className="home-hero-v2">
          {heroSlides.map((item, index) => (
            <img
              key={item.image}
              className={`home-hero-bg ${index === activeSlide ? 'is-active' : ''}`}
              src={item.image}
              alt={item.alt}
            />
          ))}
          <div className="home-hero-overlay" />
          <div className="home-hero-copy-v2 hero-content-animated" key={activeSlide}>
            <span className="home-kicker">{slide.kicker} <span>→</span></span>
            <h1>{slide.title}<br /><em>{slide.accent}</em></h1>
            <p>{slide.text}</p>
            <div className="hero-actions">
              <Button as={Link} to="/search">Explorar colección <i className="fas fa-arrow-right ms-2" /></Button>
              <Link className="hero-video-link" to="/search"><span className="play-circle">▶</span> Ver inspiración</Link>
            </div>
          </div>
          <div className="hero-social" aria-label="Redes sociales"><span>◎</span><span>♪</span><span>▶</span></div>
          <div className="hero-dots">
            {heroSlides.map((_, index) => (
              <button key={index} type="button" className={index === activeSlide ? 'active' : ''} onClick={() => setActiveSlide(index)} aria-label={`Ir a la diapositiva ${index + 1}`} />
            ))}
          </div>
        </section>
      )}

      {loading ? <LoadingBox /> : error ? <MessageBox variant="danger">{error}</MessageBox> : (
        <>
          <section className="style-section">
            <div className="home-section-head">
              <div><span className="section-kicker">Encuentra tu estilo</span><h2>EXPLORA POR ESTILO</h2></div>
              <Link className="home-see-all" to="/search">Ver todos <i className="fas fa-arrow-right ms-1" /></Link>
            </div>
            <Row className="g-3">
              {styleCards.map((card) => (
                <Col key={card.label} xs={6} md={3}>
                  <Link className="category-tile-v2" to="/search" style={{ backgroundImage: `url(${card.image})` }}>
                    <span>{card.label}</span><i className="fas fa-arrow-right" />
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
