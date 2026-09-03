import React, { useEffect, useReducer, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Rating from '../components/Rating';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import Product from '../components/Product';
import LinkContainer from 'react-router-bootstrap/LinkContainer';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload.products || [], page: action.payload.page || 1, pages: action.payload.pages || 0, countProducts: action.payload.countProducts || 0, loading: false, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload, products: [], pages: 0, countProducts: 0 };
    default:
      return state;
  }
};

const prices = [
  { name: '$1 to $50', value: '1-50' },
  { name: '$51 to $200', value: '51-200' },
  { name: '$201 to $1000', value: '201-1000' },
];

export const ratings = [
  { name: '4stars & up', rating: 4 },
  { name: '3stars & up', rating: 3 },
  { name: '2stars & up', rating: 2 },
  { name: '1stars & up', rating: 1 },
];

export default function SearchScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const category = sp.get('category') || 'all';
  const query = sp.get('query') || 'all';
  const price = sp.get('price') || 'all';
  const rating = sp.get('rating') || 'all';
  const order = sp.get('order') || 'newest';
  const page = sp.get('page') || 1;

  const [{ loading, error, products, pages, countProducts }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    products: [],
    pages: 0,
    countProducts: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(`/api/products/search?page=${page}&query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}&price=${encodeURIComponent(price)}&rating=${encodeURIComponent(rating)}&order=${encodeURIComponent(order)}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [category, order, page, price, query, rating]);

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/products/categories');
        setCategories(data || []);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);

  const getFilterUrl = (filter, skipPathname) => {
    const filterPage = filter.page || page;
    const filterCategory = filter.category || category;
    const filterQuery = filter.query || query;
    const filterRating = filter.rating || rating;
    const filterPrice = filter.price || price;
    const sortOrder = filter.order || order;
    return `${skipPathname ? '' : '/search?'}category=${encodeURIComponent(filterCategory)}&query=${encodeURIComponent(filterQuery)}&price=${encodeURIComponent(filterPrice)}&rating=${encodeURIComponent(filterRating)}&order=${encodeURIComponent(sortOrder)}&page=${filterPage}`;
  };

  return (
    <div>
      <Helmet><title>Buscar productos</title></Helmet>
      <Row>
        <Col md={3}>
          <h3>Departamento</h3>
          <ul>
            <li><Link className={category === 'all' ? 'text-bold' : ''} to={getFilterUrl({ category: 'all' })}>Todos</Link></li>
            {categories.map((c) => <li key={c}><Link className={c === category ? 'text-bold' : ''} to={getFilterUrl({ category: c })}>{c}</Link></li>)}
          </ul>
          <h3>Precio</h3>
          <ul>
            <li><Link className={price === 'all' ? 'text-bold' : ''} to={getFilterUrl({ price: 'all' })}>Cualquier precio</Link></li>
            {prices.map((p) => <li key={p.value}><Link to={getFilterUrl({ price: p.value })} className={p.value === price ? 'text-bold' : ''}>{p.name}</Link></li>)}
          </ul>
          <h3>Valoración</h3>
          <ul>
            {ratings.map((r) => <li key={r.name}><Link to={getFilterUrl({ rating: r.rating })} className={`${r.rating}` === `${rating}` ? 'text-bold' : ''}><Rating caption={' y más'} rating={r.rating}></Rating></Link></li>)}
            <li><Link to={getFilterUrl({ rating: 'all' })} className={rating === 'all' ? 'text-bold' : ''}><Rating caption={' y más'} rating={0}></Rating></Link></li>
          </ul>
        </Col>
        <Col md={9}>
          {loading ? <LoadingBox /> : error ? <MessageBox variant="danger">{error}</MessageBox> : <>
            <Row className="justify-content-between mb-3">
              <Col md={6}>
                <div>
                  {countProducts} resultados
                  {query !== 'all' && ' : ' + query}
                  {category !== 'all' && ' : ' + category}
                  {price !== 'all' && ' : Precio ' + price}
                  {rating !== 'all' && ' : Valoración ' + rating + ' y más'}
                  {query !== 'all' || category !== 'all' || rating !== 'all' || price !== 'all' ? <Button variant="light" onClick={() => navigate('/search')}><i className="fas fa-times-circle"></i></Button> : null}
                </div>
              </Col>
              <Col className="text-end">
                Ordenar por{' '}
                <select value={order} onChange={(e) => navigate(getFilterUrl({ order: e.target.value }))}>
                  <option value="newest">Más recientes</option>
                  <option value="lowest">Precio: menor a mayor</option>
                  <option value="highest">Precio: mayor a menor</option>
                  <option value="toprated">Mejor valorados</option>
                </select>
              </Col>
            </Row>
            {products.length === 0 && <MessageBox>No se encontraron productos</MessageBox>}
            <Row>{products.map((product) => <Col sm={6} lg={4} className="mb-3" key={product._id}><Product product={product} /></Col>)}</Row>
            <div>
              {[...Array(pages).keys()].map((x) => <LinkContainer key={x + 1} className="mx-1" to={getFilterUrl({ page: x + 1 })}>
                <Button className={Number(page) === x + 1 ? 'text-bold' : ''} variant="light">{x + 1}</Button>
              </LinkContainer>)}
            </div>
          </>}
        </Col>
      </Row>
    </div>
  );
}
