import { createContext, useReducer } from 'react';

export const Store = createContext();

const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,

  fullBox: false,

  cart: {
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],

    shippingAddress: localStorage.getItem('shippingAddress')
      ? JSON.parse(localStorage.getItem('shippingAddress'))
      : {
          fullName: '',
          address: '',
          city: '',
          postalCode: '',
          country: '',
          location: null,
        },

    paymentMethod: localStorage.getItem('paymentMethod')
      ? localStorage.getItem('paymentMethod')
      : '',
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'USER_SIGNIN':
      return {
        ...state,
        userInfo: action.payload,
      };

    case 'USER_SIGNOUT':
      localStorage.removeItem('userInfo');

      return {
        ...state,
        userInfo: null,
      };

    case 'CART_ADD_ITEM': {
      const item = action.payload;

      const existItem = state.cart.cartItems.find(
        (x) => x._id === item._id
      );

      const cartItems = existItem
        ? state.cart.cartItems.map((x) =>
            x._id === item._id ? item : x
          )
        : [...state.cart.cartItems, item];

      localStorage.setItem('cartItems', JSON.stringify(cartItems));

      return {
        ...state,
        cart: {
          ...state.cart,
          cartItems,
        },
      };
    }

    case 'CART_REMOVE_ITEM': {
      const cartItemsAfterRemove = state.cart.cartItems.filter(
        (x) => x._id !== action.payload._id
      );

      localStorage.setItem(
        'cartItems',
        JSON.stringify(cartItemsAfterRemove)
      );

      return {
        ...state,
        cart: {
          ...state.cart,
          cartItems: cartItemsAfterRemove,
        },
      };
    }

    case 'CART_CLEAR':
      localStorage.removeItem('cartItems');

      return {
        ...state,
        cart: {
          ...state.cart,
          cartItems: [],
        },
      };

    case 'SAVE_SHIPPING_ADDRESS':
      localStorage.setItem(
        'shippingAddress',
        JSON.stringify(action.payload)
      );

      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: action.payload,
        },
      };

    case 'SAVE_SHIPPING_ADDRESS_MAP_LOCATION': {
      const shippingAddress = {
        ...state.cart.shippingAddress,
        location: action.payload,
      };

      localStorage.setItem(
        'shippingAddress',
        JSON.stringify(shippingAddress)
      );

      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress,
        },
      };
    }

    case 'SAVE_PAYMENT_METHOD':
      localStorage.setItem('paymentMethod', action.payload);

      return {
        ...state,
        cart: {
          ...state.cart,
          paymentMethod: action.payload,
        },
      };

    case 'SET_FULLBOX_ON':
      return {
        ...state,
        fullBox: true,
      };

    case 'SET_FULLBOX_OFF':
      return {
        ...state,
        fullBox: false,
      };

    default:
      return state;
  }
}

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = { state, dispatch };

  return (
    <Store.Provider value={value}>
      {props.children}
    </Store.Provider>
  );
}