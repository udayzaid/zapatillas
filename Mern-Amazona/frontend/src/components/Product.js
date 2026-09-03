import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import axios from 'axios';
import { useContext } from 'react';
import { Store } from '../Store';

function Product(props) {
  const { product } = props;
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart: { cartItems } } = state;

  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert('Lo sentimos. El producto no tiene suficiente stock.');
      return;
    }
    ctxDispatch({ type: 'CART_ADD_ITEM', payload: { ...item, quantity } });
  };

  return (
    <Card className="product-card">
      <div className="product-image-wrap">
        {product.countInStock === 0 && <span className="product-badge">Agotado</span>}
        <Link to={`/product/${product.slug}`}>
          <img src={product.image} className="card-img-top" alt={product.name} />
        </Link>
      </div>
      <Card.Body>
        <Link to={`/product/${product.slug}`}>
          <Card.Title>{product.name}</Card.Title>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <div className="product-card-bottom">
          <Card.Text>Bs {product.price}</Card.Text>
          {product.countInStock === 0 ? (
            <Button variant="light" disabled className="product-cart-button">
              <i className="fas fa-ban"></i>
            </Button>
          ) : (
            <Button onClick={() => addToCartHandler(product)} className="product-cart-button" aria-label={`Agregar ${product.name} al carrito`}>
              <i className="fas fa-plus"></i>
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
export default Product;
