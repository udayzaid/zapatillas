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
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function HomeScreen() {
  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: '',
  });

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

  const heroProduct = products[0];
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))].slice(0, 4);

  return (
    <div className="home-page">
      <Helmet><title>Tienda de Tenis</title></Helmet>

      {!loading && !error && heroProduct && (
        <section className="home-hero">
          <div className="home-hero-copy">
            <span className="home-kicker">Nueva colección</span>
            <h1>Muévete.<br />Destaca.</h1>
            <p>Encuentra zapatillas pensadas para tu ritmo, tu estilo y todos los días que quieres hacer diferentes.</p>
            <Button as={Link} to="/search">Explorar productos <i className="fas fa-arrow-right ms-2"></i></Button>
          </div>
          <img className="home-hero-product" src={heroProduct.image} alt={heroProduct.name} />
        </section>
      )}

      {loading ? <LoadingBox /> : error ? <MessageBox variant="danger">{error}</MessageBox> : (
        <>
          {categories.length > 0 && (
            <section className="mb-5">
              <div className="home-section-head">
                <div>
                  <h2>Explora por estilo</h2>
                  <p>Encuentra el par que va contigo.</p>
                </div>
              </div>
              <Row className="g-3">
                {categories.map((category) => (
                  <Col key={category} xs={6} md={3}>
                    <Link className="category-tile" to={`/search?category=${encodeURIComponent(category)}`}>
                      <span>{category}</span><i className="fas fa-arrow-right"></i>
                    </Link>
                  </Col>
                ))}
              </Row>
            </section>
          )}

          <section className="home-benefits">
            <Row className="g-3">
              <Col md={4}><div className="home-benefit"><i className="fas fa-truck"></i><strong>Envío fácil</strong><span>Recibe tu pedido sin complicaciones.</span></div></Col>
              <Col md={4}><div className="home-benefit"><i className="fas fa-shield-alt"></i><strong>Compra segura</strong><span>Tu compra siempre bajo control.</span></div></Col>
              <Col md={4}><div className="home-benefit"><i className="fas fa-headset"></i><strong>Estamos para ayudarte</strong><span>Soporte cuando lo necesites.</span></div></Col>
            </Row>
          </section>

          <section>
            <div className="home-section-head">
              <div><h2>Productos destacados</h2><p>Los favoritos para empezar tu próxima aventura.</p></div>
              <Link className="home-see-all" to="/search">Ver todos <i className="fas fa-arrow-right ms-1"></i></Link>
            </div>
            <Row>
              {products.map((product) => (
                <Col key={product.slug} sm={6} md={4} lg={3} className="mb-4">
                  <Product product={product} />
                </Col>
              ))}
            </Row>
          </section>
        </>
      )}
    </div>
  );
}

export default HomeScreen;
