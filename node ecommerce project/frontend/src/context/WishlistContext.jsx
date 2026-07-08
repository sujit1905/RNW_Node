import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

const LEGACY_WISHLIST_KEY = 'wishlist_items';

function getProductId(product) {
  return product?._id || product?.id;
}

function storageKeyForUser(user) {
  if (!user) return null;
  const id = user._id || user.id || user.email;
  if (!id) return null;
  return `wishlist_items_v2_${String(id)}`;
}

function readStoredItems(key) {
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function wishlistReducer(state, action) {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: Array.isArray(action.payload) ? action.payload : [] };
    case 'TOGGLE_ITEM': {
      const incoming = action.payload;
      const incomingId = getProductId(incoming);
      if (!incomingId) return state;
      const exists = state.items.some((item) => getProductId(item) === incomingId);
      if (exists) {
        return {
          ...state,
          items: state.items.filter((item) => getProductId(item) !== incomingId),
        };
      }
      return { ...state, items: [incoming, ...state.items] };
    }
    case 'REMOVE_ITEM': {
      const id = action.payload;
      return {
        ...state,
        items: state.items.filter((item) => getProductId(item) !== id),
      };
    }
    case 'CLEAR_ALL':
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function WishlistProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      dispatch({ type: 'SET_ITEMS', payload: [] });
      return;
    }
    const key = storageKeyForUser(user);
    let items = readStoredItems(key);
    if (items.length === 0) {
      const legacyRaw = localStorage.getItem(LEGACY_WISHLIST_KEY);
      if (legacyRaw) {
        try {
          const parsed = JSON.parse(legacyRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            items = parsed;
            localStorage.setItem(key, legacyRaw);
            localStorage.removeItem(LEGACY_WISHLIST_KEY);
          }
        } catch {
          /* ignore */
        }
      }
    }
    dispatch({ type: 'SET_ITEMS', payload: items });
  }, [authLoading, user?._id, user?.id, user?.email]);

  useEffect(() => {
    if (authLoading || !user) return;
    const key = storageKeyForUser(user);
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(state.items));
  }, [state.items, user, authLoading]);

  const toggleWishlist = useCallback(
    (product) => {
      if (authLoading) return;
      if (!user) {
        const path = `${location.pathname}${location.search}`;
        navigate(`/login?redirect=${encodeURIComponent(path)}`);
        return;
      }
      dispatch({ type: 'TOGGLE_ITEM', payload: product });
    },
    [authLoading, user, navigate, location.pathname, location.search]
  );

  const removeFromWishlist = useCallback(
    (id) => {
      if (authLoading) return;
      if (!user) {
        const path = `${location.pathname}${location.search}`;
        navigate(`/login?redirect=${encodeURIComponent(path)}`);
        return;
      }
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    },
    [authLoading, user, navigate, location.pathname, location.search]
  );

  const clearWishlist = useCallback(() => {
    if (authLoading) return;
    if (!user) {
      const path = `${location.pathname}${location.search}`;
      navigate(`/login?redirect=${encodeURIComponent(path)}`);
      return;
    }
    dispatch({ type: 'CLEAR_ALL' });
  }, [authLoading, user, navigate, location.pathname, location.search]);

  const isWishlisted = useCallback(
    (id) => {
      if (!user || authLoading) return false;
      return state.items.some((item) => String(getProductId(item)) === String(id));
    },
    [user, authLoading, state.items]
  );

  const effectiveItems = user && !authLoading ? state.items : [];
  const wishlistCount = effectiveItems.length;

  const value = useMemo(
    () => ({
      wishlist: effectiveItems,
      wishlistCount,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
      isWishlisted,
    }),
    [
      effectiveItems,
      wishlistCount,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
      isWishlisted,
    ]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);
