import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { FiHeart, FiShoppingBag, FiArrowRight, FiLock, FiTrash2 } from 'react-icons/fi';

export default function WishlistPage() {
  const { wishlist, wishlistCount, clearWishlist } = useWishlist();
  const { isLoggedIn, loading: authLoading } = useAuth();

  if (!authLoading && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-velura-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm animate-fade-up">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-velura-100">
            <FiLock size={28} className="text-velura-400" />
          </div>
          <h2 className="text-headline text-ink-900 mb-3">Sign in required</h2>
          <p className="text-velura-500 text-sm mb-8">
            Your wishlist is saved to your account so you can view it on any device.
          </p>
          <Link
            to="/login?redirect=%2Fwishlist"
            className="btn-primary text-sm px-8 py-3.5 inline-flex items-center gap-2"
          >
            Sign In <FiArrowRight size={14} />
          </Link>
          <Link to="/category" className="mt-4 block text-sm font-medium text-gold-600 hover:text-gold-700">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-velura-50 flex items-center justify-center">
        <div className="animate-pulse flex space-x-2">
          <div className="loading-dot text-ink-900"></div>
          <div className="loading-dot text-ink-900"></div>
          <div className="loading-dot text-ink-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-velura-50">
      <div className="container-main py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between border-b border-velura-200 pb-5">
          <div>
            <span className="text-overline text-gold-500 mb-1 block">Your Favorites</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink-900" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
              Liked Products
            </h1>
            <p className="text-xs text-velura-400 mt-1 uppercase tracking-wider">
              {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          {wishlistCount > 0 && (
            <button
              onClick={clearWishlist}
              className="flex items-center gap-2 rounded-xl border border-velura-200 bg-white px-4 py-2.5 text-xs font-semibold text-velura-600 hover:bg-danger-light hover:text-danger hover:border-danger-light transition-all"
            >
              <FiTrash2 size={13} />
              Clear All
            </button>
          )}
        </div>

        {wishlistCount === 0 ? (
          <div className="rounded-3xl border border-velura-200 bg-white px-4 py-16 text-center shadow-sm sm:py-20 animate-fade-up max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-velura-100">
              <FiHeart size={32} className="text-velura-400" />
            </div>
            <h2 className="text-headline text-ink-900 mb-3">No liked products yet</h2>
            <p className="text-velura-500 text-sm mb-8 leading-relaxed">
              Tap the heart icon on any product to save it to your wishlist.
            </p>
            <Link
              to="/category"
              className="btn-primary text-sm px-8 py-3.5 inline-flex items-center gap-2"
            >
              Browse Products <FiArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {wishlist.map((product, i) => (
              <div
                key={product._id || product.id}
                className="opacity-0-init animate-fade-up"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: "forwards" }}
              >
                <ProductCard
                  product={{ ...product, id: product.id || product._id }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
