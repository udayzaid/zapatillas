import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import Navbar from 'react-bootstrap/Navbar';
import Badge from 'react-bootstrap/Badge';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import { LinkContainer } from 'react-router-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { Store } from './Store';
import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import SignupScreen from './screens/SignupScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import Button from 'react-bootstrap/Button';
import { getError } from './utils';
import axios from 'axios';
import SearchBox from './components/SearchBox';
import SearchScreen from './screens/SearchScreen';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardScreen from './screens/DashboardScreen';
import AdminRoute from './components/AdminRoute';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import OrderListScreen from './screens/OrderListScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';
import MapScreen from './screens/MapScreen';
import ForgetPasswordScreen from './screens/ForgetPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';

function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { fullBox, cart, userInfo } = state;
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = '/signin';
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/products/categories');
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);

  const cartCount = cart.cartItems.reduce((a, c) => a + c.quantity, 0);

  return (
    <BrowserRouter>
      <div className={sidebarIsOpen ? `${fullBox ? 'site-container active-cont d-flex flex-column full-box' : 'site-container active-cont d-flex flex-column'}` : `${fullBox ? 'site-container d-flex flex-column full-box' : 'site-container d-flex flex-column'}`}>
        <ToastContainer position="bottom-center" limit={1} />
        <header>
          <div className="topbar">
            <span><i className="fas fa-truck" /> Envíos a todo el país</span>
            <span><i className="fas fa-sync-alt" /> Cambios y devoluciones gratis</span>
            <div className="topbar-right"><Link to="/orderhistory">Mis pedidos</Link><span>Ayuda</span></div>
          </div>
          <Navbar expand="lg">
            <Container>
              <Button className="menu-button" variant="dark" onClick={() => setSidebarIsOpen(!sidebarIsOpen)} aria-label="Abrir menú"><i className="fas fa-bars" /></Button>
              <LinkContainer to="/">
                <Navbar.Brand><span className="brand-mark">ϟ</span> TIENDA DE TENIS</Navbar.Brand>
              </LinkContainer>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <SearchBox />
                <Nav className="main-nav ms-auto align-items-lg-center">
                  <Link to="/cart" className="nav-link cart-link"><i className="fas fa-shopping-cart" /> Carrito {cartCount > 0 && <Badge pill>{cartCount}</Badge>}</Link>
                  {userInfo ? (
                    <NavDropdown title={userInfo.name} id="basic-nav-dropdown">
                      <LinkContainer to="/profile"><NavDropdown.Item>Mi perfil</NavDropdown.Item></LinkContainer>
                      <LinkContainer to="/orderhistory"><NavDropdown.Item>Mis pedidos</NavDropdown.Item></LinkContainer>
                      <NavDropdown.Divider />
                      <Link className="dropdown-item" to="#signout" onClick={signoutHandler}>Cerrar sesión</Link>
                    </NavDropdown>
                  ) : <Link className="nav-link" to="/signin"><i className="far fa-user" /> Iniciar sesión</Link>}
                  {userInfo && userInfo.isAdmin && (
                    <NavDropdown title="Administración" id="admin-nav-dropdown">
                      <LinkContainer to="/admin/dashboard"><NavDropdown.Item>Panel de control</NavDropdown.Item></LinkContainer>
                      <LinkContainer to="/admin/products"><NavDropdown.Item>Productos</NavDropdown.Item></LinkContainer>
                      <LinkContainer to="/admin/orders"><NavDropdown.Item>Pedidos</NavDropdown.Item></LinkContainer>
                      <LinkContainer to="/admin/users"><NavDropdown.Item>Usuarios</NavDropdown.Item></LinkContainer>
                    </NavDropdown>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>

        <div className={sidebarIsOpen ? 'active-nav side-navbar d-flex justify-content-between flex-wrap flex-column' : 'side-navbar d-flex justify-content-between flex-wrap flex-column'}>
          <Nav className="flex-column w-100 p-3">
            <Nav.Item><strong>EXPLORA POR CATEGORÍA</strong></Nav.Item>
            {categories.map((category) => (
              <Nav.Item key={category}>
                <LinkContainer to={{ pathname: '/search', search: `category=${category}` }} onClick={() => setSidebarIsOpen(false)}><Nav.Link>{category}<i className="fas fa-arrow-right" /></Nav.Link></LinkContainer>
              </Nav.Item>
            ))}
          </Nav>
        </div>

        <main><Container className="mt-3"><Routes>
          <Route path="/product/:slug" element={<ProductScreen />} />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/search" element={<SearchScreen />} />
          <Route path="/signin" element={<SigninScreen />} />
          <Route path="/signup" element={<SignupScreen />} />
          <Route path="/forget-password" element={<ForgetPasswordScreen />} />
          <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />
          <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><MapScreen /></ProtectedRoute>} />
          <Route path="/placeorder" element={<PlaceOrderScreen />} />
          <Route path="/order/:id" element={<ProtectedRoute><OrderScreen /></ProtectedRoute>} />
          <Route path="/orderhistory" element={<ProtectedRoute><OrderHistoryScreen /></ProtectedRoute>} />
          <Route path="/shipping" element={<ShippingAddressScreen />} />
          <Route path="/payment" element={<PaymentMethodScreen />} />
          <Route path="/admin/dashboard" element={<AdminRoute><DashboardScreen /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><OrderListScreen /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UserListScreen /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><ProductListScreen /></AdminRoute>} />
          <Route path="/admin/product/:id" element={<AdminRoute><ProductEditScreen /></AdminRoute>} />
          <Route path="/admin/user/:id" element={<AdminRoute><UserEditScreen /></AdminRoute>} />
          <Route path="/" element={<HomeScreen />} />
        </Routes></Container></main>
        <footer><div className="footer-inner"><strong><span className="brand-mark">ϟ</span> TIENDA DE TENIS</strong><span>Tu estilo. Tu ritmo. Tu par.</span></div></footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
