import { createContext, useContext, useEffect, useReducer } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingIndex = state.items.findIndex(
        item => item.id === action.payload.id &&
          item.size === action.payload.size &&
          (item.selectedColor || '') === (action.payload.selectedColor || '')
      );
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1,
          selected: true
        };
        return { ...state, items: newItems };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1, selected: true }] };
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter((_, index) => index !== action.payload),
      };
    case 'UPDATE_QUANTITY': {
      const newItems = [...state.items];
      newItems[action.payload.index] = {
        ...newItems[action.payload.index],
        quantity: Math.max(1, action.payload.quantity)
      };
      return { ...state, items: newItems };
    }
    case 'TOGGLE_SELECTION': {
      const newItems = [...state.items];
      newItems[action.payload] = {
        ...newItems[action.payload],
        selected: !newItems[action.payload].selected
      };
      return { ...state, items: newItems };
    }
    case 'SELECT_ALL': {
      const newItems = state.items.map(item => ({ ...item, selected: action.payload }));
      return { ...state, items: newItems };
    }
    case 'REMOVE_SELECTED':
      return {
        ...state,
        items: state.items.filter(item => !item.selected),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, () => {
    const cached = localStorage.getItem('cart_items');
    if (!cached) return { items: [] };
    try {
      const parsed = JSON.parse(cached);
      // Ensure all items have a selected property if coming from old cache
      const items = parsed.map(item => ({ ...item, selected: item.selected ?? true }));
      return { items };
    } catch {
      return { items: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product, size) => {
    dispatch({ type: 'ADD_TO_CART', payload: { ...product, size } });
  };

  const removeFromCart = (index) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: index });
  };

  const updateQuantity = (index, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity } });
  };

  const toggleSelection = (index) => {
    dispatch({ type: 'TOGGLE_SELECTION', payload: index });
  };

  const selectAll = (selected = true) => {
    dispatch({ type: 'SELECT_ALL', payload: selected });
  };

  const removeSelectedFromCart = () => {
    dispatch({ type: 'REMOVE_SELECTED' });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Totals for all items in cart
  const allCartTotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const allCartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  // Totals for SELECTED items only (for order summary)
  const selectedItems = state.items.filter(item => item.selected);
  const cartTotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart: state.items,
      selectedItems,
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      toggleSelection,
      selectAll,
      removeSelectedFromCart,
      clearCart, 
      cartTotal, 
      cartCount,
      allCartCount,
      allCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
