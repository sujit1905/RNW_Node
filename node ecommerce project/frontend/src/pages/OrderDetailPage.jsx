import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest, getAuthHeaders } from '../lib/api';
import Loader from '../components/Loader';
import {
  FiArrowLeft, FiMapPin, FiPackage, FiCreditCard,
  FiTruck, FiCheckCircle, FiClock, FiXCircle, FiChevronRight,
} from 'react-icons/fi';

const STATUS_STYLES = {
  delivered:  { bg: '#d1fae5', color: '#065f46', label: 'Delivered',  Icon: FiCheckCircle },
  shipped:    { bg: '#eff6ff', color: '#1e40af', label: 'Shipped',    Icon: FiTruck },
  processing: { bg: '#fef9c3', color: '#854d0e', label: 'Processing', Icon: FiClock },
  cancelled:  { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled',  Icon: FiXCircle },
  pending:    { bg: '#f3e8ff', color: '#6b21a8', label: 'Pending',    Icon: FiClock },
};

function StatusPill({ status }) {
  const s = STATUS_STYLES[status?.toLowerCase()] || STATUS_STYLES.pending;
  const { Icon } = s;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: s.bg, color: s.color, padding: '6px 12px',
      borderRadius: 999, fontSize: 12, fontWeight: 600,
      textTransform: 'capitalize', letterSpacing: '0.02em',
    }}>
      <Icon size={13} /> {s.label}
    </span>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white border border-velura-100 rounded-3xl p-5 sm:p-6 mb-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-velura-50">
        {Icon && <Icon size={16} className="text-gold-500" />}
        <h3 className="font-bold text-ink-900 text-sm sm:text-base" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex justify-between items-center py-2 text-sm text-ink-700">
      <span className={strong ? 'font-bold text-ink-900' : 'text-velura-400'}>{label}</span>
      <span className={strong ? 'font-bold text-ink-900 text-base' : 'font-medium text-ink-800'}>{value}</span>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    (async () => {
      try {
        const data = await apiRequest(`/orders/${id}`, { headers: getAuthHeaders() });
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isLoggedIn]);

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-velura-50">
      <div className="container-main py-8 sm:py-12 lg:py-16">
        
        {/* Back Link */}
        <div className="mb-6 flex items-center gap-2 text-xs text-velura-400">
          <Link to="/" className="hover:text-ink-900 transition-colors">Home</Link>
          <FiChevronRight size={11} />
          <Link to="/dashboard" className="hover:text-ink-900 transition-colors">My Account</Link>
          <FiChevronRight size={11} />
          <span className="text-ink-600 font-medium">Order Detail</span>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader size="md" text="Loading order..." />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-danger">{error}</div>
        ) : !order ? (
          <div className="p-6 text-center text-velura-500">Order not found.</div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-velura-100 shadow-sm">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-ink-900" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
                  Order #{order._id.slice(-6).toUpperCase()}
                </h1>
                <p className="text-xs text-velura-400 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
              <div className="sm:self-center">
                <StatusPill status={order.status} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* LEFT Column */}
              <div className="lg:col-span-2 space-y-4">
                <Section title={`Items (${order.items?.length || 0})`} icon={FiPackage}>
                  <div className="divide-y divide-velura-100">
                    {order.items?.map((it, i) => (
                      <div key={i} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center">
                        {it.image && (
                          <div className="w-16 h-20 rounded-xl overflow-hidden shrink-0 border border-velura-100 bg-white">
                            <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-ink-900 text-sm truncate">{it.name}</p>
                          <p className="text-velura-400 text-xs mt-1">
                            Qty: {it.quantity} {it.size ? `• Size: ${it.size}` : ''}
                          </p>
                        </div>
                        <div className="price-current text-sm shrink-0">
                          ₹{Number(it.price * it.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                {order.shippingAddress && (
                  <Section title="Shipping Address" icon={FiMapPin}>
                    <div className="text-sm text-ink-800 leading-relaxed space-y-1">
                      {order.shippingAddress.name && <p className="font-bold text-ink-900">{order.shippingAddress.name}</p>}
                      <p className="text-velura-500">{order.shippingAddress.address}</p>
                      <p className="text-velura-500">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                      {order.shippingAddress.phone && <p className="text-velura-500 font-medium mt-2">📞 {order.shippingAddress.phone}</p>}
                    </div>
                  </Section>
                )}
              </div>

              {/* RIGHT Column */}
              <div className="space-y-4">
                <Section title="Payment Summary" icon={FiCreditCard}>
                  <div className="space-y-1">
                    <Row label="Subtotal" value={`₹${Number(order.itemsPrice || 0).toLocaleString('en-IN')}`} />
                    <Row label="Shipping" value={`₹${Number(order.shippingPrice || 0).toLocaleString('en-IN')}`} />
                    <Row label="Tax" value={`₹${Number(order.taxPrice || 0).toLocaleString('en-IN')}`} />
                    <div className="border-t border-dashed border-velura-200 my-3" />
                    <Row label="Total" value={`₹${Number(order.totalPrice).toLocaleString('en-IN')}`} strong />
                  </div>
                  <div className="mt-4 pt-3 border-t border-velura-100 text-xs text-velura-500 space-y-1">
                    <div>Payment Method: <span className="font-bold text-ink-900 uppercase">{order.paymentMethod || 'COD'}</span></div>
                    <div>Payment Status: <span className={`font-bold capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-gold-600'}`}>{order.paymentStatus || 'Pending'}</span></div>
                  </div>
                </Section>

                <Section title="Need Help?">
                  <p className="text-xs text-velura-500 leading-relaxed">
                    Have questions about your order? Reach our support desk at{' '}
                    <a href="mailto:hello@velura.in" className="text-gold-600 hover:underline font-semibold">
                      hello@velura.in
                    </a>
                  </p>
                </Section>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
