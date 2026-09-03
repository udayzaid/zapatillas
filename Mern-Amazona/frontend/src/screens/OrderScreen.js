import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams, Link } from 'react-router-dom';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';

import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

import { Store } from '../Store';
import { getError } from '../utils';
import { toast } from 'react-toastify';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return {
        ...state,
        loading: true,
        error: '',
      };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        order: action.payload,
        error: '',
      };

    case 'FETCH_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case 'PAY_REQUEST':
      return {
        ...state,
        loadingPay: true,
      };

    case 'PAY_SUCCESS':
      return {
        ...state,
        loadingPay: false,
        successPay: true,
        order: action.payload,
      };

    case 'PAY_FAIL':
      return {
        ...state,
        loadingPay: false,
      };

    case 'DELIVER_REQUEST':
      return {
        ...state,
        loadingDeliver: true,
      };

    case 'DELIVER_SUCCESS':
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: true,
        order: action.payload,
      };

    case 'DELIVER_FAIL':
      return {
        ...state,
        loadingDeliver: false,
      };

    default:
      return state;
  }
}

export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const { id: orderId } = useParams();
  const navigate = useNavigate();

  const [
    {
      loading,
      error,
      order,
      loadingPay,
      loadingDeliver,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
    loadingPay: false,
    loadingDeliver: false,
  });

  // Datos de la tarjeta de demostración
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });

        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        });

        dispatch({
          type: 'FETCH_SUCCESS',
          payload: data,
        });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };

    if (!userInfo) {
      navigate('/login');
      return;
    }

    fetchOrder();
  }, [orderId, userInfo, navigate]);

  // ===============================
  // PAGO SIMULADO
  // ===============================
  const confirmDemoPayment = async (paymentType, cardData = null) => {
    try {
      // Validación de tarjeta
      if (paymentType === 'Tarjeta') {
        const cleanCardNumber = cardData.cardNumber.replace(/\s/g, '');

        if (cleanCardNumber.length !== 16) {
          toast.error('El número de tarjeta debe tener 16 dígitos');
          return;
        }

        if (!cardData.cardName.trim()) {
          toast.error('Ingrese el nombre del titular');
          return;
        }

        if (!/^\d{2}\/\d{2}$/.test(cardData.cardExpiry)) {
          toast.error('La fecha debe tener el formato MM/AA');
          return;
        }

        if (!/^\d{3,4}$/.test(cardData.cardCvv)) {
          toast.error('El CVV debe tener 3 o 4 dígitos');
          return;
        }
      }

      dispatch({ type: 'PAY_REQUEST' });

      const paymentData = {
        id: `DEMO-${Date.now()}`,
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: userInfo.email,
        paymentType,
      };

      const { data } = await axios.put(
        `/api/orders/${order._id}/pay`,
        paymentData,
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      dispatch({
        type: 'PAY_SUCCESS',
        payload: data.order,
      });

      toast.success('¡Pago realizado correctamente!');
    } catch (err) {
      dispatch({
        type: 'PAY_FAIL',
      });

      toast.error(getError(err));
    }
  };

  // ===============================
  // PAGO CON PAYPAL SIMULADO
  // ===============================
  const paypalDemoHandler = () => {
    if (
      window.confirm(
        `¿Confirmar pago simulado con PayPal por $${order.totalPrice.toFixed(
          2
        )}?`
      )
    ) {
      confirmDemoPayment('PayPal');
    }
  };

  // ===============================
  // PAGO CON TARJETA SIMULADA
  // ===============================
  const cardPaymentHandler = (e) => {
    e.preventDefault();

    confirmDemoPayment('Tarjeta', {
      cardNumber,
      cardName,
      cardExpiry,
      cardCvv,
    });
  };

  // ===============================
  // MARCAR COMO ENTREGADO
  // ===============================
  const deliverOrderHandler = async () => {
    try {
      dispatch({ type: 'DELIVER_REQUEST' });

      const { data } = await axios.put(
        `/api/orders/${order._id}/deliver`,
        {},
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      dispatch({
        type: 'DELIVER_SUCCESS',
        payload: {
          ...order,
          isDelivered: true,
          deliveredAt: new Date().toISOString(),
        },
      });

      toast.success(data.message || 'Pedido entregado');
    } catch (err) {
      toast.error(getError(err));

      dispatch({
        type: 'DELIVER_FAIL',
      });
    }
  };

  if (loading) {
    return <LoadingBox />;
  }

  if (error) {
    return <MessageBox variant="danger">{error}</MessageBox>;
  }

  return (
    <div>
      <Helmet>
        <title>Order {orderId}</title>
      </Helmet>

      <h1 className="my-3">Order {orderId}</h1>

      <Row>
        <Col md={8}>
          {/* SHIPPING */}
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping</Card.Title>

              <Card.Text>
                <strong>Name:</strong>{' '}
                {order.shippingAddress.fullName}
                <br />

                <strong>Address:</strong>{' '}
                {order.shippingAddress.address},{' '}
                {order.shippingAddress.city},{' '}
                {order.shippingAddress.postalCode},{' '}
                {order.shippingAddress.country}
                <br />

                {order.shippingAddress.location &&
                  order.shippingAddress.location.lat && (
                    <>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={`https://maps.google.com?q=${order.shippingAddress.location.lat},${order.shippingAddress.location.lng}`}
                      >
                        Show On Map
                      </a>
                    </>
                  )}
              </Card.Text>

              {order.isDelivered ? (
                <MessageBox variant="success">
                  Delivered at {order.deliveredAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">
                  Not Delivered
                </MessageBox>
              )}
            </Card.Body>
          </Card>

          {/* PAYMENT STATUS */}
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment</Card.Title>

              <Card.Text>
                <strong>Method:</strong>{' '}
                {order.paymentMethod}
              </Card.Text>

              {order.isPaid ? (
                <MessageBox variant="success">
                  Paid at {order.paidAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">
                  Not Paid
                </MessageBox>
              )}
            </Card.Body>
          </Card>

          {/* PRODUCTS */}
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>

              <ListGroup variant="flush">
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        />{' '}
                        <Link to={`/product/${item.slug}`}>
                          {item.name}
                        </Link>
                      </Col>

                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>

                      <Col md={3}>
                        ${item.price}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* ORDER SUMMARY */}
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>

              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>
                      ${order.itemsPrice.toFixed(2)}
                    </Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>
                      ${order.shippingPrice.toFixed(2)}
                    </Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>
                      ${order.taxPrice.toFixed(2)}
                    </Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>Order Total</strong>
                    </Col>

                    <Col>
                      <strong>
                        ${order.totalPrice.toFixed(2)}
                      </strong>
                    </Col>
                  </Row>
                </ListGroup.Item>

                {/* ===============================
                    MÉTODOS DE PAGO
                =============================== */}

                {!order.isPaid && (
                  <ListGroup.Item>
                    <h5 className="mb-3">
                      Payment
                    </h5>

                    {loadingPay ? (
                      <LoadingBox />
                    ) : (
                      <>
                        {/* PAYPAL SIMULADO */}
                        <Button
                          type="button"
                          className="w-100 mb-3"
                          variant="warning"
                          onClick={paypalDemoHandler}
                        >
                          🟡 PayPal - Pago de demostración
                        </Button>

                        <div className="text-center mb-3">
                          <strong>O pagar con tarjeta</strong>
                        </div>

                        {/* TARJETA */}
                        <Form onSubmit={cardPaymentHandler}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Número de tarjeta
                            </Form.Label>

                            <Form.Control
                              type="text"
                              placeholder="4111 1111 1111 1111"
                              value={cardNumber}
                              onChange={(e) =>
                                setCardNumber(e.target.value)
                              }
                              maxLength={19}
                              required
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>
                              Nombre del titular
                            </Form.Label>

                            <Form.Control
                              type="text"
                              placeholder="UDAY ZAID"
                              value={cardName}
                              onChange={(e) =>
                                setCardName(e.target.value)
                              }
                              required
                            />
                          </Form.Group>

                          <Row>
                            <Col>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  Vencimiento
                                </Form.Label>

                                <Form.Control
                                  type="text"
                                  placeholder="12/30"
                                  value={cardExpiry}
                                  onChange={(e) =>
                                    setCardExpiry(e.target.value)
                                  }
                                  maxLength={5}
                                  required
                                />
                              </Form.Group>
                            </Col>

                            <Col>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  CVV
                                </Form.Label>

                                <Form.Control
                                  type="password"
                                  placeholder="123"
                                  value={cardCvv}
                                  onChange={(e) =>
                                    setCardCvv(e.target.value)
                                  }
                                  maxLength={4}
                                  required
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Button
                            type="submit"
                            variant="dark"
                            className="w-100"
                          >
                            💳 Confirmar pago
                          </Button>
                        </Form>

                        <div className="text-center mt-3">
                          <small className="text-muted">
                            Pago de demostración. No se
                            realiza ningún cobro real.
                          </small>
                        </div>
                      </>
                    )}
                  </ListGroup.Item>
                )}

                {/* ADMINISTRADOR */}
                {userInfo.isAdmin &&
                  order.isPaid &&
                  !order.isDelivered && (
                    <ListGroup.Item>
                      {loadingDeliver && <LoadingBox />}

                      <div className="d-grid">
                        <Button
                          type="button"
                          onClick={deliverOrderHandler}
                        >
                          Deliver Order
                        </Button>
                      </div>
                    </ListGroup.Item>
                  )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}