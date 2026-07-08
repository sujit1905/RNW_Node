import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest, getAuthHeaders } from '../lib/api';
import Loader from '../components/Loader';
import { FiEdit2, FiMapPin, FiHeart, FiLock, FiPackage, FiChevronRight } from 'react-icons/fi';

const STATUS_STYLES = {
  delivered:  { bg: '#d1fae5', color: '#065f46', label: 'Delivered' },
  shipped:    { bg: '#eff6ff', color: '#1e40af', label: 'Shipped' },
  processing: { bg: '#fef9c3', color: '#854d0e', label: 'Processing' },
  cancelled:  { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
  pending:    { bg: '#f3e8ff', color: '#6b21a8', label: 'Pending' },
};

function StatusPill({ status }) {
  const s = STATUS_STYLES[status?.toLowerCase()] || STATUS_STYLES.pending;
  return (
    <span style={{
      background: s.bg, color: s.color, padding: '4px 10px',
      borderRadius: 999, fontSize: 11, fontWeight: 600,
      textTransform: 'capitalize', letterSpacing: '0.02em',
    }}>
      {s.label}
    </span>
  );
}

export default function UserDashboardPage() {
  const { user, isLoggedIn } = useAuth();
  const [orders, setOrders] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    (async () => {
      try {
        const data = await apiRequest('/orders/my', { headers: getAuthHeaders() });
        setOrders(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();

    (async () => {
      try {
        const w = await apiRequest('/wishlist', { headers: getAuthHeaders() });
        setWishlistCount(Array.isArray(w) ? w.length : (w?.items?.length || 0));
      } catch { /* silent */ }
    })();
  }, [isLoggedIn]);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  const initial = (user?.name || '?').trim().charAt(0).toUpperCase();
  const recentOrders = orders.slice(0, 4);
  const addr = user?.shippingAddress || {};
  const hasAddress = addr.address || addr.city;

  return (
    <div className="min-h-screen bg-velura-50">
      <div className="container-main py-8 sm:py-12 lg:py-16">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-velura-400 mb-6">
          <Link to="/" className="hover:text-ink-900 transition-colors">Home</Link>
          <FiChevronRight size={11} />
          <span className="text-ink-600 font-medium">My Account</span>
        </div>

        {/* ── Profile Header Card ── */}
        <div className="bg-white rounded-3xl border border-velura-100 p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-2xl"
                style={{
                  background: "linear-gradient(135deg, var(--color-gold-400), var(--color-gold-600))",
                  boxShadow: "0 4px 14px rgba(201,168,76,0.3)"
                }}>
                {user?.profileImage && user.profileImage !== 'none'
                  ? <img src={user.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                  : initial}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-ink-900 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                  {user?.name}
                </h1>
                <p className="text-sm text-velura-400 mt-1 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 sm:self-center">
              <Link to="/profile/edit" className="btn-primary text-xs py-3 px-5 flex items-center gap-1.5 shadow-sm">
                <FiEdit2 size={13} /> Edit Profile
              </Link>
              <Link to="/profile/address" className="btn-outline text-xs py-3 px-5 border-velura-200 text-ink-900 hover:bg-velura-100 transition-all flex items-center gap-1.5">
                <FiMapPin size={13} /> Manage Address
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Recent Orders List */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-velura-100 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-velura-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiPackage className="text-gold-500" size={16} />
                <h3 className="font-bold text-ink-900 text-base" style={{ fontFamily: "var(--font-display)" }}>Recent Orders</h3>
              </div>
              {orders.length > 0 && (
                <Link to="/dashboard" className="text-xs font-semibold uppercase tracking-wider text-gold-600 hover:text-gold-700 flex items-center gap-1">
                  All Orders <FiChevronRight size={13} />
                </Link>
              )}
            </div>

            {loading ? (
              <div className="p-8 flex justify-center">
                <Loader size="md" text="Loading dashboard data..." />
              </div>
            ) : error ? (
              <div className="p-6 text-xs text-danger">{error}</div>
            ) : recentOrders.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-velura-50 mx-auto mb-4 text-velura-400">
                  <FiPackage size={24} />
                </div>
                <p className="text-velura-500 text-sm mb-5">No orders yet.</p>
                <Link to="/category" className="btn-primary text-xs px-6 py-3">Start Shopping</Link>
              </div>
            ) : (
              <div className="divide-y divide-velura-100">
                {recentOrders.map((order) => (
                  <Link
                    key={order._id}
                    to={`/orders/${order._id}`}
                    className="flex items-center justify-between p-5 hover:bg-velura-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-ink-900 text-sm">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </div>
                      <div className="mt-2">
                        <StatusPill status={order.status} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="price-current text-sm">
                        ₹{Number(order.totalPrice).toLocaleString('en-IN')}
                      </span>
                      <FiChevronRight size={16} className="text-velura-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            {/* Wishlist Box */}
            <Link to="/wishlist" className="flex items-center justify-between p-5 bg-white rounded-3xl border border-velura-100 hover:border-velura-300 transition-colors shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <FiHeart size={18} />
                </div>
                <div>
                  <p className="font-bold text-ink-900 text-sm" style={{ fontFamily: "var(--font-display)" }}>Wishlist</p>
                  <p className="text-xs text-velura-400 mt-0.5">{wishlistCount} item{wishlistCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <FiChevronRight size={16} className="text-velura-400" />
            </Link>

            {/* Address Box */}
            <Link to="/profile/address" className="flex items-center justify-between p-5 bg-white rounded-3xl border border-velura-100 hover:border-velura-300 transition-colors shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gold-50 text-gold-500 flex items-center justify-center shrink-0">
                  <FiMapPin size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-ink-900 text-sm" style={{ fontFamily: "var(--font-display)" }}>Saved Address</p>
                  <p className="text-xs text-velura-400 mt-0.5 truncate">
                    {hasAddress ? `${addr.city || ''}${addr.state ? ', ' + addr.state : ''}` : 'No address saved'}
                  </p>
                </div>
              </div>
              <FiChevronRight size={16} className="text-velura-400" />
            </Link>

            {/* Settings Box */}
            <Link to="/profile/edit" className="flex items-center justify-between p-5 bg-white rounded-3xl border border-velura-100 hover:border-velura-300 transition-colors shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-velura-50 text-ink-900 flex items-center justify-center">
                  <FiLock size={18} />
                </div>
                <div>
                  <p className="font-bold text-ink-900 text-sm" style={{ fontFamily: "var(--font-display)" }}>Settings</p>
                  <p className="text-xs text-velura-400 mt-0.5">Password & Profile Details</p>
                </div>
              </div>
              <FiChevronRight size={16} className="text-velura-400" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
