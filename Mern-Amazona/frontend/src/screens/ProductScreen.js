import axios from 'axios';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Rating from '../components/Rating';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';
import { Store } from '../Store';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
  switch (action.type) {
    case 'REFRESH_PRODUCT': return { ...state, product: action.payload };
    case 'CREATE_REQUEST': return { ...state, loadingCreateReview: true };
    case 'CREATE_SUCCESS': return { ...state, loadingCreateReview: false };
    case 'CREATE_FAIL': return { ...state, loadingCreateReview: false };
    case 'FETCH_REQUEST': return { ...state, loading: true };
    case 'FETCH_SUCCESS': return { ...state, product: action.payload, loading: false };
    case 'FETCH_FAIL': return { ...state, loading: false, error: action.payload };
    default: return state;
  }
};

function ProductScreen() {
  const reviewsRef = useRef();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const navigate = useNavigate();
  const { slug } = useParams();
  const [{ loading, error, product, loadingCreateReview }, dispatch] = useReducer(reducer, {
    product: null,
    loading: true,
    error: '',
    loadingCreateReview: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get(`/api/products/slug/${slug}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [slug]);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const addToCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    try {
      const { data } = await axios.get(`/api/products/${product._id}`);
      if (data.countInStock < quantity) {
        window.alert('Lo sentimos. El producto no tiene suficiente stock.');
        return;
      }
      ctxDispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
      navigate('/cart');
    } catch (err) {
      toast.error(getError(err));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!comment || !rating) {
      toast.error('Por favor, escribe un comentario y selecciona una valoración.');
      return;
    }
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      const { data } = await axios.post(`/api/products/${product._id}/reviews`, {
        rating: Number(rating),
        comment,
        name: userInfo.name,
      }, { headers: { Authorization: `Bearer ${userInfo.token}` } });
      const updatedProduct = {
        ...product,
        reviews: [data.review, ...(product.reviews || [])],
        numReviews: data.numReviews,
        rating: data.rating,
      };
      dispatch({ type: 'REFRESH_PRODUCT', payload: updatedProduct });
      setRating(0);
      setComment('');
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('Reseña publicada correctamente.');
      setTimeout(() => {
        if (reviewsRef.current) window.scrollTo({ behavior: 'smooth', top: reviewsRef.current.offsetTop });
      }, 100);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  if (loading) return <LoadingBox />;
  if (error) return <MessageBox variant="danger">{error}</MessageBox>;

  return (
    <div className="product-detail-page">
      <div className="product-back"><Link to="/search"><i className="fas fa-arrow-left me-2" />Volver a la tienda</Link></div>
      <Row className="product-detail-grid">
        <Col lg={7}>
          <div className="product-gallery-main">
            <img className="img-large" src={selectedImage || product.image} alt={product.name} />
          </div>
          <Row xs={4} className="g-2 mt-2">
            {[product.image, ...(product.images || [])].map((x) => (
              <Col key={x}>
                <button className={`product-thumb ${selectedImage === x ? 'active' : ''}`} type="button" onClick={() => setSelectedImage(x)}>
                  <img src={x} alt="Vista del producto" />
                </button>
              </Col>
            ))}
          </Row>
        </Col>

        <Col lg={5}>
          <div className="product-purchase-panel">
            <Helmet><title>{product.name}</title></Helmet>
            <span className="product-label">Zapatillas</span>
            <h1>{product.name}</h1>
            <Rating rating={product.rating} numReviews={product.numReviews} />
            <div className="product-detail-price">Bs {product.price}</div>
            <div className="product-description"><h3>Descripción</h3><p>{product.description}</p></div>
            <div className="product-stock-row">
              {product.countInStock > 0 ? <Badge bg="success">Disponible</Badge> : <Badge bg="danger">Agotado</Badge>}
              {product.countInStock > 0 && <span>{product.countInStock} disponibles</span>}
            </div>
            {product.countInStock > 0 && <Button onClick={addToCartHandler} className="product-buy-button"><i className="fas fa-shopping-bag me-2" />Agregar al carrito</Button>}
          </div>
        </Col>
      </Row>

      <section className="product-reviews" ref={reviewsRef}>
        <div className="home-section-head"><div><span className="section-kicker">Opiniones de clientes</span><h2>RESEÑAS</h2></div></div>
        {(product.reviews || []).length === 0 ? <MessageBox>Aún no hay reseñas para este producto.</MessageBox> : (
          <ListGroup>
            {(product.reviews || []).map((review) => (
              <ListGroup.Item key={review._id}>
                <strong>{review.name}</strong>
                <Rating rating={review.rating} caption=" " />
                <p className="review-date">{review.createdAt ? review.createdAt.substring(0, 10) : ''}</p>
                <p>{review.comment}</p>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        <div className="review-form">
          {userInfo ? (
            <form onSubmit={submitHandler}>
              <h2>Comparte tu experiencia</h2>
              <Form.Group className="mb-3" controlId="rating">
                <Form.Label>Valoración</Form.Label>
                <Form.Select aria-label="Valoración" value={rating} onChange={(e) => setRating(e.target.value)}>
                  <option value="">Selecciona...</option>
                  <option value="1">1 - Muy mala</option>
                  <option value="2">2 - Mala</option>
                  <option value="3">3 - Buena</option>
                  <option value="4">4 - Muy buena</option>
                  <option value="5">5 - Excelente</option>
                </Form.Select>
              </Form.Group>
              <FloatingLabel controlId="floatingTextarea" label="Comentario" className="mb-3">
                <Form.Control as="textarea" placeholder="Escribe tu comentario" value={comment} onChange={(e) => setComment(e.target.value)} />
              </FloatingLabel>
              <Button disabled={loadingCreateReview} type="submit">Publicar reseña</Button>
              {loadingCreateReview && <LoadingBox />}
            </form>
          ) : (
            <MessageBox>Para escribir una reseña, <Link to={`/signin?redirect=/product/${product.slug}`}>inicia sesión</Link>.</MessageBox>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProductScreen;
