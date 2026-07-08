  import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  FiPackage, FiShoppingCart, FiUsers, FiPlus, FiEdit2, FiTrash2,
  FiGrid, FiMenu, FiX, FiRefreshCw, FiLogOut, FiCheck,
  FiTrendingUp, FiChevronDown, FiList, FiAlertCircle, FiSearch,
  FiBell, FiSettings, FiChevronRight, FiArrowUp, FiChevronLeft,
  FiMapPin, FiMaximize2, FiDroplet,
} from 'react-icons/fi';
import { Navigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import faviconImg from '../assets/favicon.png';
import { apiRequest, getAuthHeaders } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ImageUploader, MultiImageUploader } from '../components/ImageUploader';
import Loader from '../components/Loader';

/* ───────────────────────────────────────────────────────────────
   THEME — VELURA (Ink + Gold + Off-white)
   ─────────────────────────────────────────────────────────────── */
const T = {
  bg:        '#fafaf8',
  surface:   '#ffffff',
  border:    '#e5e5e0',
  borderStrong: '#d0d0c8',
  text:      '#111110',
  textSoft:  '#5a5a52',
  textMuted: '#a8a89e',
  navy:      '#111110',
  navy2:     '#080807',
  gold:      '#c9a84c',
  goldSoft:  '#eec96b',
  goldDeep:  '#a88838',
  ring:      'rgba(201,168,76,0.25)',
  shadowSm:  '0 1px 3px rgba(0,0,0,0.04)',
  shadowMd:  '0 10px 30px rgba(0,0,0,0.06)',
};

const POLL_MS = 15000;
const ORDER_STATUSES = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_CONFIG = {
  placed:     { label: 'Pending',    bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
  processing: { label: 'Processing', bg: '#fff7e6', color: '#a25f00', dot: '#f59e0b' },
  shipped:    { label: 'Shipped',    bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
  delivered:  { label: 'Delivered',  bg: '#ecfdf5', color: '#0f7a4d', dot: '#10b981' },
  cancelled:  { label: 'Cancelled',  bg: '#fef2f2', color: '#b42318', dot: '#ef4444' },
};

const COLOR_MAP = {
  red:'#ef4444', maroon:'#7f1d1d', pink:'#ec4899', rose:'#f43f5e',
  orange:'#f97316', peach:'#fcd5b5', yellow:'#facc15', gold:'#d4af37',
  mustard:'#d4a017', green:'#22c55e', olive:'#808000', teal:'#14b8a6',
  mint:'#a7f3d0', blue:'#3b82f6', navy:'#1e3a8a', skyblue:'#38bdf8',
  royalblue:'#1d4ed8', purple:'#a855f7', violet:'#8b5cf6', lavender:'#c4b5fd',
  brown:'#92400e', beige:'#e8dcc4', cream:'#fffdd0', ivory:'#fffff0',
  white:'#ffffff', offwhite:'#faf9f6', black:'#0a0a0a', grey:'#6b7280',
  gray:'#6b7280', silver:'#c0c0c0',
};

/* ── Utils ─────────────────────────────────────────────────── */
function formatOrderShortId(id)  { return `#JC${String(id || '').slice(-8).toUpperCase()}`; }
function formatInr(n)            { return `₹${Number(n || 0).toLocaleString('en-IN')}`; }
function itemQtyTotal(items)     { return (items || []).reduce((s, r) => s + Number(r.quantity || 0), 0); }
function customerName(order) {
  const a = order.shippingAddress || {};
  return a.name?.trim() || order.user?.name?.trim() || '—';
}
function paymentBrief(order) {
  const method = ({ upi: 'UPI', card: 'Card', cod: 'COD' }[order.paymentMethod] || order.paymentMethod || '—').toUpperCase();
  const pay = order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'failed' ? 'Failed' : 'Pending';
  return { method, pay, isPaid: order.paymentStatus === 'paid', isFailed: order.paymentStatus === 'failed' };
}
function colorDot(name) {
  const k = (name || '').toLowerCase().replace(/\s+/g, '');
  return COLOR_MAP[k] || COLOR_MAP[(name || '').toLowerCase()] || '#94a3b8';
}

/* ───────────────────────────────────────────────────────────────
   Reusable bits
   ─────────────────────────────────────────────────────────────── */

function StatCard({ label, value, subtitle, icon: Icon, accent, delay = 0 }) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 18,
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      boxShadow: T.shadowSm,
      transition: 'transform .25s ease, box-shadow .25s ease, border-color .25s ease',
      animation: `fadeUp .4s ease ${delay}s both`,
      position: 'relative',
      overflow: 'hidden',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = T.shadowMd; e.currentTarget.style.borderColor = T.borderStrong; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = T.shadowSm; e.currentTarget.style.borderColor = T.border; }}
    >
      {/* corner accent */}
      <div style={{
        position: 'absolute', top: -30, right: -30, width: 90, height: 90,
        background: `radial-gradient(circle at center, ${accent}22, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `linear-gradient(135deg, ${accent}1f, ${accent}10)`,
        border: `1px solid ${accent}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={19} color={accent} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: T.text, letterSpacing: '-0.035em', lineHeight: 1.05 }}>{value}</p>
        <p style={{ margin: '6px 0 0', fontSize: 13, fontWeight: 600, color: '#334155' }}>{label}</p>
        <p style={{ margin: '3px 0 0', fontSize: 11.5, color: T.textMuted }}>{subtitle}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || { label: status, bg: '#f8fafc', color: '#64748b', dot: '#94a3b8' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: c.bg, color: c.color,
      fontSize: 11, fontWeight: 700, padding: '4px 10px',
      borderRadius: 999, whiteSpace: 'nowrap', letterSpacing: '0.02em',
      border: `1px solid ${c.dot}30`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} />
      {c.label}
    </span>
  );
}

function CustomSelect({ value, onChange, options, placeholder = 'Select…', small = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const selected = options.find(o => (typeof o === 'string' ? o : o.value) === value);
  const label = selected ? (typeof selected === 'string' ? selected : selected.label) : placeholder;
  const pad = small ? '6px 10px' : '10px 13px';
  const fs = small ? 12 : 13;
  return (
    <div ref={ref} style={{ position: 'relative', minWidth: small ? 120 : 150 }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
        width: '100%', background: T.surface,
        border: `1.5px solid ${open ? T.gold : T.borderStrong}`,
        borderRadius: 10, padding: pad, fontSize: fs,
        color: selected ? T.text : T.textMuted, cursor: 'pointer',
        fontFamily: 'inherit', fontWeight: 500,
        boxShadow: open ? `0 0 0 3px ${T.ring}` : 'none',
        transition: 'all .15s',
      }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <FiChevronDown size={13} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
          background: T.surface, border: `1px solid ${T.borderStrong}`,
          borderRadius: 12, boxShadow: '0 12px 36px rgba(11,21,48,0.14)',
          overflow: 'hidden', minWidth: '100%', maxHeight: 280, overflowY: 'auto',
        }}>
          {options.map((o, i) => {
            const val = typeof o === 'string' ? o : o.value;
            const lbl = typeof o === 'string' ? o : o.label;
            const active = val === value;
            return (
              <button key={i} type="button" onClick={() => { onChange(val); setOpen(false); }} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '10px 14px',
                background: active ? `${T.gold}14` : 'transparent',
                color: active ? T.goldDeep : '#334155',
                fontSize: fs, fontWeight: active ? 700 : 500,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background .1s',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                {lbl}
                {active && <FiCheck size={13} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</label>
      {children}
      {hint && <p style={{ margin: 0, fontSize: 11.5, color: T.textMuted }}>{hint}</p>}
    </div>
  );
}
function Input(props) {
  return (
    <input {...props} style={{
      border: `1.5px solid ${T.borderStrong}`, borderRadius: 10,
      padding: '11px 13px', fontSize: 14, color: T.text,
      background: '#fafbfc', outline: 'none', width: '100%',
      boxSizing: 'border-box', fontFamily: 'inherit',
      transition: 'border-color .15s, box-shadow .15s, background .15s',
    }}
      onFocus={e => { e.target.style.borderColor = T.gold; e.target.style.boxShadow = `0 0 0 3px ${T.ring}`; e.target.style.background = '#fff'; }}
      onBlur ={e => { e.target.style.borderColor = T.borderStrong; e.target.style.boxShadow = 'none'; e.target.style.background = '#fafbfc'; }}
    />
  );
}
function Textarea(props) {
  return (
    <textarea {...props} style={{
      border: `1.5px solid ${T.borderStrong}`, borderRadius: 10,
      padding: '11px 13px', fontSize: 14, color: T.text,
      background: '#fafbfc', outline: 'none', width: '100%',
      boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit',
      transition: 'border-color .15s, box-shadow .15s, background .15s',
    }}
      onFocus={e => { e.target.style.borderColor = T.gold; e.target.style.boxShadow = `0 0 0 3px ${T.ring}`; e.target.style.background = '#fff'; }}
      onBlur ={e => { e.target.style.borderColor = T.borderStrong; e.target.style.boxShadow = 'none'; e.target.style.background = '#fafbfc'; }}
    />
  );
}

/* ── Sidebar Nav Item ───────────────────────────────────────── */
function NavItem({ tab, active, onClick, badge, collapsed }) {
  const ICONS = { dashboard: FiGrid, products: FiPackage, categories: FiList, orders: FiShoppingCart, 'add-product': FiPlus };
  const LABELS = { dashboard: 'Dashboard', products: 'Products', categories: 'Categories', orders: 'Orders', 'add-product': 'Add Product' };
  const Icon = ICONS[tab] || FiGrid;
  return (
    <button onClick={onClick} title={collapsed ? LABELS[tab] : undefined} style={{
      display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 12,
      justifyContent: collapsed ? 'center' : 'flex-start',
      width: '100%', padding: collapsed ? '14px 0' : '11px 14px', borderRadius: 12,
      border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      background: active
        ? 'linear-gradient(90deg, rgba(202,162,74,0.18) 0%, rgba(202,162,74,0.04) 100%)'
        : 'transparent',
      color: active ? '#fff' : 'rgba(255,255,255,0.6)',
      fontSize: 13.5, fontWeight: active ? 700 : 500,
      transition: 'all .25s ease',
      position: 'relative',
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.92)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}
    >
      {active && (
        <span style={{
          position: 'absolute', left: 0, top: 8, bottom: 8, width: 3,
          background: T.gold, borderRadius: '0 4px 4px 0',
        }} />
      )}
      <Icon size={collapsed ? 20 : 17} style={{ flexShrink: 0 }} />
      {!collapsed && <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{LABELS[tab]}</span>}
      {!collapsed && badge > 0 && (
        <span style={{
          background: T.gold, color: T.navy,
          fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999, flexShrink: 0,
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}>{badge}</span>
      )}
      {collapsed && badge > 0 && (
        <span style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, background: T.gold, borderRadius: '50%' }} />
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryForm, setCategoryForm] = useState({ name: '', image: '' });
  const [categoryFormLoading, setCategoryFormLoading] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '', category: '', price: '', originalPrice: '',
    sizes: [], description: '', fabric: '', image: '', images: [],
    colors: [], inStock: true,
  });
  const [colorInput, setColorInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [editingStatusId, setEditingStatusId] = useState(null);
  const [tempStatus, setTempStatus] = useState('');
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [tempPayment, setTempPayment] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [productSearch, setProductSearch] = useState('');

  /* ── handlers ────────────────────────────────────────────── */
  const resetProductForm = () => {
    setIsEditing(false); setEditingId(null);
    setProductForm({ name:'', category:'', price:'', originalPrice:'', sizes:[], description:'', fabric:'', image:'', images:[], colors:[], inStock:true });
    setColorInput('');
  };

  const handleEditProduct = (product) => {
    const existingColors = Array.isArray(product.colors) && product.colors.length
      ? product.colors
      : typeof product.color === 'string' && product.color.trim()
        ? product.color.split(',').map(c => c.trim()).filter(Boolean)
        : [];
    setProductForm({
      name: product.name || '', category: product.category || '',
      price: product.price || '', originalPrice: product.originalPrice || '',
      sizes: product.sizes || [], description: product.description || '',
      fabric: product.fabric || '',
      image: product.image || '',
      images: Array.isArray(product.images) ? product.images : (product.images ? product.images.split(',').map(s => s.trim()).filter(Boolean) : []),
      colors: existingColors,
      inStock: product.inStock !== undefined ? product.inStock : true,
    });
    setColorInput('');
    setIsEditing(true); setEditingId(product.id || product._id);
    setActiveTab('add-product');
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.image) {
      alert('Please upload at least a main product image before saving.');
      return;
    }
    try {
      setFormLoading(true);
      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = isEditing ? `/products/${editingId}` : '/products';
      const priceNum = Number(productForm.price);
      const origNum = Number(productForm.originalPrice);
      const colorsArr = productForm.colors.filter(Boolean);
      const payload = {
        ...productForm,
        price: priceNum,
        originalPrice: origNum,
        discount: origNum > 0 ? Math.round(((origNum - priceNum) / origNum) * 100) : 0,
        images: productForm.images.length > 0 ? productForm.images : (productForm.image ? [productForm.image] : []),
        colors: colorsArr,
        color: colorsArr[0] || '',
        fabric: productForm.fabric || 'Cotton',
      };
      await apiRequest(endpoint, { method, headers: getAuthHeaders(), body: JSON.stringify(payload) });
      alert(`Product ${isEditing ? 'updated' : 'added'} successfully!`);
      resetProductForm(); setActiveTab('products');
    } catch (err) { alert(err.message || 'Failed to save product'); }
    finally { setFormLoading(false); }
  };

  const refreshOrders = useCallback(async (silent = false) => {
    if (user?.role !== 'admin') return;
    try {
      setOrdersError('');
      if (!silent) setOrdersLoading(true);
      const data = await apiRequest('/orders/admin', { headers: getAuthHeaders() });
      setOrders(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (err) { setOrdersError(err.message || 'Could not load orders'); }
    finally { if (!silent) setOrdersLoading(false); }
  }, [user?.role]);

  useEffect(() => {
    const fetchProducts = async () => {
      try { setProductsLoading(true); const d = await apiRequest('/products'); setProducts(d.map(p => ({ ...p, id: p._id }))); }
      catch (err) { setProductsError(err.message); } finally { setProductsLoading(false); }
    };
    const fetchCategories = async () => {
      try { setCategoriesLoading(true); const d = await apiRequest('/categories'); setCategories(d); }
      catch (err) { console.error(err); } finally { setCategoriesLoading(false); }
    };
    if (['products', 'dashboard', 'orders', 'categories'].includes(activeTab)) fetchProducts();
    if (['categories', 'add-product'].includes(activeTab)) fetchCategories();
  }, [activeTab]);

  useEffect(() => {
    if (authLoading || user?.role !== 'admin') return;
    if (!['dashboard', 'orders'].includes(activeTab)) return;
    refreshOrders(false);
    const id = setInterval(() => refreshOrders(true), POLL_MS);
    return () => clearInterval(id);
  }, [authLoading, user?.role, activeTab, refreshOrders]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    const onVis = () => { if (document.visibilityState === 'visible') refreshOrders(true); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [user?.role, refreshOrders]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      setCategoryFormLoading(true);
      const res = await apiRequest('/categories', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(categoryForm) });
      setCategories(p => [...p, res]); setCategoryForm({ name: '', image: '' });
      alert('Category added!');
    } catch (err) { alert(err.message || 'Failed'); } finally { setCategoryFormLoading(false); }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await apiRequest(`/categories/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      setCategories(p => p.filter(c => c._id !== id));
    } catch (err) { alert(err.message); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await apiRequest(`/products/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      setProducts(p => p.filter(x => x.id !== id));
    } catch (err) { alert(err.message); }
  };

  const handleToggleStock = async (product) => {
    const newStatus = !(product.inStock !== false);
    try {
      await apiRequest(`/products/${product.id || product._id}/stock`, {
        method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ inStock: newStatus }),
      });
      setProducts(p => p.map(x => (x.id || x._id) === (product.id || product._id) ? { ...x, inStock: newStatus } : x));
    } catch (err) { alert(err.message); }
  };

  const patchOrderStatus = async (orderId, status) => {
    try {
      setOrdersError('');
      await apiRequest(`/orders/${orderId}/status`, { method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ status }) });
      await refreshOrders(true);
    } catch (err) { setOrdersError(err.message || 'Failed'); }
  };

  const patchPaymentStatus = async (orderId, paymentStatus) => {
    try {
      setOrdersError('');
      await apiRequest(`/orders/${orderId}/payment-status`, { method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ paymentStatus }) });
      await refreshOrders(true);
    } catch (err) { setOrdersError(err.message || 'Failed'); }
  };

  const stats = useMemo(() => {
    const delivered = orders.filter(o => o.status === 'delivered');
    const revenue = delivered.reduce((s, o) => s + (Number(o.totalPrice) || 0), 0);
    const uniqueCustomers = new Set(orders.map(o => String(o.user?._id || o.user || '')).filter(Boolean));
    const pending = orders.filter(o => ['placed', 'processing'].includes(o.status)).length;
    return [
      { label: 'Total Revenue', value: formatInr(revenue), subtitle: `${delivered.length} delivered orders`, icon: FiTrendingUp, accent: '#10b981' },
      { label: 'Total Orders', value: String(orders.length), subtitle: `${pending} need attention`, icon: FiShoppingCart, accent: '#6366f1' },
      { label: 'Products', value: productsLoading ? '…' : String(products.length), subtitle: productsError ? 'Error loading' : 'In catalogue', icon: FiPackage, accent: T.gold },
      { label: 'Customers', value: String(uniqueCustomers.size), subtitle: 'Distinct buyers', icon: FiUsers, accent: '#ec4899' },
    ];
  }, [orders, products.length, productsLoading, productsError]);

  const pendingCount = orders.filter(o => ['placed', 'processing'].includes(o.status)).length;

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login?redirect=%2Fadmin" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  /* ── Orders Table ────────────────────────────────────────── */
  const renderOrdersTable = (limit, filter = 'all') => {
    let rows = orders;
    if (filter !== 'all') rows = rows.filter(o => o.status === filter);
    if (limit) rows = rows.slice(0, limit);

    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fafbfc' }}>
              {['', 'Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date'].map(h => (
                <th key={h} style={{
                  padding: '12px 18px', textAlign: 'left',
                  fontSize: 10.5, fontWeight: 700, color: T.textMuted,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  whiteSpace: 'nowrap', borderBottom: `1px solid ${T.border}`,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordersLoading && orders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 40 }}>
                  <Loader size="sm" text="Loading orders..." />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 56, textAlign: 'center', color: T.textMuted, fontSize: 13 }}>No orders found.</td></tr>
            ) : rows.map(order => {
              const pay = paymentBrief(order);
              const isExpanded = expandedOrderId === order._id;
              return (
                <React.Fragment key={order._id}>
                  <tr style={{ borderBottom: isExpanded ? 'none' : `1px solid ${T.border}`, transition: 'background .12s', cursor: 'pointer' }}
                    onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                    onMouseEnter={e => e.currentTarget.style.background = isExpanded ? '#fffbf0' : '#fafbfc'}
                    onMouseLeave={e => e.currentTarget.style.background = isExpanded ? '#fffbf0' : 'transparent'}
                  >
                    {/* Expand toggle */}
                    <td style={{ padding: '15px 10px 15px 18px', width: 28 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 22, height: 22, borderRadius: 6,
                        background: isExpanded ? T.gold : '#f1f5f9',
                        color: isExpanded ? T.navy : T.textMuted,
                        fontSize: 12, fontWeight: 800, transition: 'all .2s',
                        transform: isExpanded ? 'rotate(90deg)' : 'none',
                      }}>▶</span>
                    </td>
                    <td style={{ padding: '15px 18px', fontWeight: 700, color: T.goldDeep, whiteSpace: 'nowrap', fontFeatureSettings: '"tnum"' }}>
                      {formatOrderShortId(order._id)}
                    </td>
                    <td style={{ padding: '15px 18px', color: T.text, maxWidth: 160 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                        {customerName(order)}
                      </span>
                      {order.shippingAddress?.phone && (
                        <span style={{ display: 'block', fontSize: 11, color: T.textMuted, marginTop: 1 }}>{order.shippingAddress.phone}</span>
                      )}
                    </td>
                    <td style={{ padding: '15px 18px', color: T.textSoft, fontWeight: 500 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        background: '#f1f5f9', borderRadius: 8, padding: '3px 10px',
                        fontWeight: 700, fontSize: 12, color: T.text,
                      }}>{itemQtyTotal(order.items)} item{itemQtyTotal(order.items) !== 1 ? 's' : ''}</span>
                    </td>
                    <td style={{ padding: '15px 18px', fontWeight: 700, color: T.text, whiteSpace: 'nowrap', fontFeatureSettings: '"tnum"' }}>
                      {formatInr(order.totalPrice)}
                    </td>
                    <td style={{ padding: '15px 18px', whiteSpace: 'nowrap' }} onClick={e => e.stopPropagation()}>
                      {editingPaymentId === order._id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CustomSelect small value={tempPayment} onChange={setTempPayment}
                            options={[{ value: 'pending', label: 'Pending' }, { value: 'paid', label: 'Paid' }, { value: 'failed', label: 'Failed' }]}
                          />
                          <button onClick={async () => { await patchPaymentStatus(order._id, tempPayment); setEditingPaymentId(null); }}
                            style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <FiCheck size={13} />
                          </button>
                          <button onClick={() => setEditingPaymentId(null)}
                            style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, padding: '7px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <FiX size={13} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{pay.method}</span>
                            <span style={{
                              marginLeft: 6, fontSize: 11, fontWeight: 600,
                              color: pay.isPaid ? '#0f7a4d' : pay.isFailed ? '#b42318' : '#a25f00',
                            }}>· {pay.pay}</span>
                          </div>
                          {!pay.isPaid && (
                            <button onClick={() => { setEditingPaymentId(order._id); setTempPayment(order.paymentStatus || 'pending'); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 2, display: 'flex', alignItems: 'center' }}
                              onMouseEnter={e => e.currentTarget.style.color = T.gold}
                              onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
                            >
                              <FiEdit2 size={11} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '15px 18px' }} onClick={e => e.stopPropagation()}>
                      {editingStatusId === order._id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CustomSelect small value={tempStatus} onChange={setTempStatus}
                            options={ORDER_STATUSES.map(s => ({ value: s, label: STATUS_CONFIG[s]?.label || s }))}
                          />
                          <button onClick={async () => { await patchOrderStatus(order._id, tempStatus); setEditingStatusId(null); }}
                            style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <FiCheck size={13} />
                          </button>
                          <button onClick={() => setEditingStatusId(null)}
                            style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, padding: '7px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <FiX size={13} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <StatusBadge status={order.status} />
                          <button onClick={() => { setEditingStatusId(order._id); setTempStatus(order.status); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 2, display: 'flex', alignItems: 'center' }}
                            onMouseEnter={e => e.currentTarget.style.color = T.gold}
                            onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
                          >
                            <FiEdit2 size={11} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '15px 18px', color: T.textMuted, whiteSpace: 'nowrap', fontSize: 12 }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                    </td>
                  </tr>

                  {/* ── Expanded Product Details ── */}
                  {isExpanded && (
                    <tr key={`${order._id}-items`} style={{ background: '#fffbf0', borderBottom: `2px solid ${T.gold}30` }}>
                      <td colSpan={8} style={{ padding: '0 18px 18px 52px' }}>
                        <div style={{
                          background: '#fff',
                          border: `1px solid ${T.gold}40`,
                          borderRadius: 14,
                          overflow: 'hidden',
                          boxShadow: '0 2px 12px rgba(202,162,74,0.08)',
                        }}>
                          {/* Header */}
                          <div style={{
                            padding: '11px 18px',
                            background: `linear-gradient(90deg, ${T.gold}18 0%, transparent 100%)`,
                            borderBottom: `1px solid ${T.gold}25`,
                            display: 'flex', alignItems: 'center', gap: 8,
                          }}>
                            <span style={{ fontSize: 10.5, fontWeight: 800, color: T.goldDeep, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                              📦 Ordered Products — {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* Product Rows */}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {(order.items || []).map((item, idx) => (
                              <div key={idx} style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                padding: '13px 18px',
                                borderBottom: idx < (order.items.length - 1) ? `1px solid ${T.border}` : 'none',
                              }}>
                                {/* Product Image */}
                                <div style={{
                                  width: 58, height: 58, borderRadius: 10, flexShrink: 0,
                                  background: '#f8fafc',
                                  border: `1px solid ${T.border}`,
                                  overflow: 'hidden',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      onError={e => { e.target.style.display = 'none'; }}
                                    />
                                  ) : (
                                    <span style={{ fontSize: 20 }}>👗</span>
                                  )}
                                </div>

                                {/* Product Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.name || '—'}
                                  </p>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
                                    {/* Size Badge */}
                                    {item.size && (
                                      <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 5,
                                        background: '#eff6ff', color: '#1d4ed8',
                                        border: '1px solid #bfdbfe',
                                        borderRadius: 6, padding: '3px 10px',
                                        fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                                      }}>
                                        <FiMaximize2 size={11} style={{ flexShrink: 0 }} />
                                        Size: {item.size}
                                      </span>
                                    )}
                                    {/* Color Badge */}
                                    {(item.color || item.selectedColor) && (
                                      <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        background: '#fdf4ff', color: '#7e22ce',
                                        border: '1px solid #e9d5ff',
                                        borderRadius: 6, padding: '3px 10px',
                                        fontSize: 11, fontWeight: 700,
                                      }}>
                                        <FiDroplet size={11} style={{ flexShrink: 0 }} />
                                        {item.color || item.selectedColor}
                                      </span>
                                    )}
                                    {/* Qty */}
                                    <span style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 4,
                                      background: '#fafaf9', color: T.textSoft,
                                      border: `1px solid ${T.border}`,
                                      borderRadius: 6, padding: '3px 10px',
                                      fontSize: 11, fontWeight: 700,
                                    }}>
                                      ×{item.quantity} qty
                                    </span>
                                  </div>
                                </div>

                                {/* Price */}
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                  <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: T.text, fontFeatureSettings: '"tnum"' }}>
                                    {formatInr(item.price * item.quantity)}
                                  </p>
                                  {item.quantity > 1 && (
                                    <p style={{ margin: '2px 0 0', fontSize: 11, color: T.textMuted }}>
                                      {formatInr(item.price)} each
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Order Summary Footer */}
                          <div style={{
                            padding: '10px 18px',
                            background: '#fafbfc',
                            borderTop: `1px solid ${T.border}`,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            flexWrap: 'wrap', gap: 8,
                          }}>
                            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: T.textMuted, alignItems: 'flex-start' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                <FiMapPin size={12} style={{ color: T.gold, flexShrink: 0, marginTop: 1 }} />
                                {[order.shippingAddress?.address, order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.pincode].filter(Boolean).join(', ') || '—'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 16, fontSize: 12, fontWeight: 600, color: T.textSoft }}>
                              <span>Items: {formatInr(order.itemsPrice)}</span>
                              <span>Shipping: {order.shippingPrice === 0 ? <span style={{ color: '#10b981' }}>FREE</span> : formatInr(order.shippingPrice)}</span>
                              <span style={{ fontWeight: 800, color: T.text }}>Total: {formatInr(order.totalPrice)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const TABS = ['dashboard', 'products', 'categories', 'orders', 'add-product'];

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        @keyframes spin   { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        * { box-sizing: border-box; }
        body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d8dde6; border-radius: 8px; }
        ::-webkit-scrollbar-thumb:hover { background: #c0c7d4; }

        @media (max-width: 1024px) {
          .desktop-toggle-btn { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .admin-sidebar { transform: translateX(-100%); width: 260px !important; }
          .admin-sidebar.open { transform: translateX(0) !important; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
          .admin-main { margin-left: 0 !important; }
          .sidebar-close-btn { display: flex !important; }
        }
        @media (max-width: 720px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .admin-main-pad { padding: 18px !important; }
          .admin-header { padding: 0 16px !important; }
          .header-status-chip { display: none !important; }
        }
        @media (max-width: 480px) {
          .stat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{
        display: 'flex', minHeight: '100vh', background: T.bg,
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        color: T.text,
      }}>

        {/* ── Mobile overlay ── */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(11,21,48,0.55)', zIndex: 40,
            backdropFilter: 'blur(2px)',
          }} />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
          style={{
            width: isSidebarCollapsed ? 76 : 248, flexShrink: 0,
            background: `linear-gradient(180deg, ${T.navy} 0%, ${T.navy2} 100%)`,
            display: 'flex', flexDirection: 'column',
            position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
            transition: 'width .3s cubic-bezier(.4,0,.2,1), transform .3s ease',
            borderRight: '1px solid rgba(255,255,255,0.04)',
            overflow: 'hidden',
          }}
        >
          {/* gold top accent line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`,
          }} />

          {/* Logo */}
          <div style={{
            padding: isSidebarCollapsed ? '18px 0 14px' : '22px 18px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
            gap: 8, minHeight: isSidebarCollapsed ? 72 : 'auto',
            transition: 'all .3s ease', position: 'relative',
          }}>
            <button onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {isSidebarCollapsed ? (
                <div style={{ width: 40, height: 40, borderRadius: 8, background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: T.navy2, fontSize: 18 }}>V</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: 4 }}>
                  <span className="logo-velura" style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.15em', color: '#fff', fontFamily: 'var(--font-display)' }}>VELURA</span>
                  <span style={{ fontSize: '9px', letterSpacing: '0.2em', color: T.gold, marginTop: '-1px', fontWeight: 600 }}>ADMIN</span>
                </div>
              )}
            </button>

            {!isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="desktop-toggle-btn"
                title="Collapse sidebar"
                style={{
                  flexShrink: 0,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%', width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                  transition: 'all .2s ease', padding: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = T.gold; e.currentTarget.style.color = T.navy; e.currentTarget.style.borderColor = T.gold; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                <FiChevronLeft size={14} />
              </button>
            )}

            <button onClick={() => setSidebarOpen(false)}
              className="sidebar-close-btn"
              style={{
                display: 'none', position: 'absolute', right: 12, top: 18,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', cursor: 'pointer', borderRadius: 8, padding: 6,
              }}>
              <FiX size={16} />
            </button>
          </div>

          {/* Expand arrow (collapsed) */}
          {isSidebarCollapsed && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 2px' }}>
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="desktop-toggle-btn"
                title="Expand sidebar"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%', width: 30, height: 30,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                  transition: 'all .2s ease', padding: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = T.gold; e.currentTarget.style.color = T.navy; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              >
                <FiChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Nav */}
          <nav style={{
            flex: 1, padding: isSidebarCollapsed ? '8px 10px' : '14px 12px',
            overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3,
            transition: 'padding .3s ease',
          }}>
            {!isSidebarCollapsed && (
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '10px 14px 6px', margin: 0, fontWeight: 700 }}>
                Menu
              </p>
            )}
            {TABS.map(tab => (
              <NavItem key={tab} tab={tab} active={activeTab === tab}
                badge={tab === 'orders' ? pendingCount : 0}
                collapsed={isSidebarCollapsed}
                onClick={() => {
                  setActiveTab(tab); setSidebarOpen(false);
                  if (tab === 'add-product') resetProductForm();
                }}
              />
            ))}
          </nav>

          {/* User chip + Sign out */}
          <div style={{ padding: isSidebarCollapsed ? '10px 8px' : '12px 12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            {!isSidebarCollapsed && user && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 12,
                background: 'rgba(255,255,255,0.04)', marginBottom: 8,
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${T.gold}, ${T.goldDeep})`,
                  color: T.navy, fontWeight: 800, fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {(user.name || user.email || 'A')[0].toUpperCase()}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name || 'Admin'}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Administrator
                  </p>
                </div>
              </div>
            )}
            <button title={isSidebarCollapsed ? 'Sign Out' : undefined} onClick={logout} style={{
              display: 'flex', alignItems: 'center', gap: isSidebarCollapsed ? 0 : 10, width: '100%',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              padding: isSidebarCollapsed ? '12px 0' : '11px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'transparent', color: 'rgba(255,255,255,0.55)',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all .25s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)'; e.currentTarget.style.color = '#fca5a5'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
            >
              <FiLogOut size={isSidebarCollapsed ? 19 : 16} style={{ flexShrink: 0 }} />
              {!isSidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="admin-main" style={{
          flex: 1, marginLeft: isSidebarCollapsed ? 76 : 248,
          display: 'flex', flexDirection: 'column', minHeight: '100vh',
          transition: 'margin-left .3s cubic-bezier(.4,0,.2,1)',
        }}>

          {/* Header */}
          <header className="admin-header" style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'saturate(180%) blur(12px)',
            WebkitBackdropFilter: 'saturate(180%) blur(12px)',
            borderBottom: `1px solid ${T.border}`,
            padding: '0 26px', height: 64,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0, zIndex: 30,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button onClick={() => setSidebarOpen(true)} className="mobile-menu-btn" style={{
                display: 'none', background: '#fff', border: `1px solid ${T.borderStrong}`,
                cursor: 'pointer', padding: 8, color: T.textSoft, borderRadius: 10,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <FiMenu size={18} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: T.textMuted }}>
                <span style={{ fontWeight: 500 }}>Admin</span>
                <FiChevronRight size={13} />
                <span style={{ color: T.text, fontWeight: 700, textTransform: 'capitalize' }}>
                  {activeTab === 'add-product' ? (isEditing ? 'Edit Product' : 'Add Product') : activeTab}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {['dashboard', 'orders'].includes(activeTab) && (
                <>
                  <div className="header-status-chip" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: '#ecfdf5', color: '#0f7a4d',
                      padding: '5px 11px', borderRadius: 999, fontWeight: 700, fontSize: 11,
                      border: '1px solid #a7f3d0',
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%', background: '#10b981',
                        boxShadow: '0 0 0 3px rgba(16,185,129,0.18)',
                      }} />
                      Auto · {POLL_MS / 1000}s
                    </span>
                    {lastUpdated && (
                      <span style={{ color: T.textMuted, fontSize: 11.5 }}>
                        Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <button onClick={() => refreshOrders(false)} disabled={ordersLoading}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px',
                      border: `1px solid ${T.borderStrong}`, borderRadius: 10, background: '#fff',
                      fontSize: 12.5, fontWeight: 600, color: T.text, cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.goldDeep; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderStrong; e.currentTarget.style.color = T.text; }}
                  >
                    <FiRefreshCw size={13} style={{ animation: ordersLoading ? 'spin 1s linear infinite' : 'none' }} />
                    Refresh
                  </button>
                </>
              )}
            </div>
          </header>

          {/* Page Content */}
          <main className="admin-main-pad" style={{ flex: 1, padding: '28px', width: '100%' }}>

            {ordersError && (
              <div style={{
                marginBottom: 18, background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 12, padding: '12px 16px', color: '#b42318',
                fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <FiAlertCircle size={16} /> {ordersError}
              </div>
            )}

            {/* ── Dashboard ── */}
            {activeTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 26, animation: 'fadeUp .3s ease' }}>
                <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
                  {stats.map((s, i) => <StatCard key={i} {...s} delay={i * 0.05} />)}
                </div>

                <div style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 18, overflow: 'hidden', boxShadow: T.shadowSm,
                }}>
                  <div style={{
                    padding: '18px 22px', borderBottom: `1px solid ${T.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
                  }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: T.text, letterSpacing: '-0.01em' }}>Recent Orders</h2>
                      <p style={{ margin: '3px 0 0', fontSize: 12.5, color: T.textMuted }}>Latest 5 transactions</p>
                    </div>
                    <button onClick={() => setActiveTab('orders')} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: '#fff', border: `1px solid ${T.borderStrong}`,
                      borderRadius: 10, padding: '8px 14px',
                      fontSize: 12.5, fontWeight: 700, color: T.goldDeep, cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'all .15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.background = '#fffaf0'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderStrong; e.currentTarget.style.background = '#fff'; }}
                    >
                      View All <FiChevronRight size={13} />
                    </button>
                  </div>
                  {renderOrdersTable(5)}
                </div>
              </div>
            )}

            {/* ── Products ── */}
            {activeTab === 'products' && (
              <div style={{ animation: 'fadeUp .3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>Products</h1>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: T.textMuted }}>
                      {products.length} items in catalogue {productSearch && `· ${filteredProducts.length} matching`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                      <FiSearch size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
                      <input
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                        placeholder="Search products…"
                        style={{
                          padding: '9px 12px 9px 34px', border: `1px solid ${T.borderStrong}`,
                          borderRadius: 10, fontSize: 13, color: T.text, background: '#fff',
                          outline: 'none', fontFamily: 'inherit', width: 220,
                          transition: 'border-color .15s, box-shadow .15s',
                        }}
                        onFocus={e => { e.target.style.borderColor = T.gold; e.target.style.boxShadow = `0 0 0 3px ${T.ring}`; }}
                        onBlur ={e => { e.target.style.borderColor = T.borderStrong; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                    <button onClick={() => { resetProductForm(); setActiveTab('add-product'); }} style={{
                      display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px',
                      background: `linear-gradient(135deg, ${T.gold}, ${T.goldDeep})`,
                      color: T.navy, border: 'none', borderRadius: 10,
                      fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
                      boxShadow: '0 6px 18px -4px rgba(202,162,74,0.45)',
                      transition: 'transform .15s, box-shadow .15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 22px -4px rgba(202,162,74,0.55)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 18px -4px rgba(202,162,74,0.45)'; }}
                    >
                      <FiPlus size={15} /> Add Product
                    </button>
                  </div>
                </div>

                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden', boxShadow: T.shadowSm }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#fafbfc' }}>
                          {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: T.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {productsLoading ? (
                          <tr>
                            <td colSpan={6} style={{ padding: 40 }}>
                              <Loader size="sm" text="Loading products..." />
                            </td>
                          </tr>
                        ) : filteredProducts.length === 0 ? (
                          <tr><td colSpan={6} style={{ padding: 56, textAlign: 'center', color: T.textMuted }}>No products found.</td></tr>
                        ) : filteredProducts.map(product => (
                          <tr key={product.id} style={{ borderBottom: `1px solid ${T.border}`, transition: 'background .12s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '13px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <img src={product.image} alt="" style={{ width: 44, height: 52, borderRadius: 10, objectFit: 'cover', border: `1px solid ${T.border}`, background: '#f4f4f5' }} />
                                <div style={{ minWidth: 0 }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{product.name}</span>
                                  {Array.isArray(product.colors) && product.colors.length > 0 && (
                                    <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                                      {product.colors.slice(0, 5).map((c, i) => (
                                        <span key={i} title={c} style={{
                                          width: 10, height: 10, borderRadius: '50%',
                                          background: colorDot(c), border: '1px solid rgba(0,0,0,0.08)',
                                        }} />
                                      ))}
                                      {product.colors.length > 5 && (
                                        <span style={{ fontSize: 10, color: T.textMuted, marginLeft: 2 }}>+{product.colors.length - 5}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '13px 18px' }}>
                              <span style={{ background: '#f4f4f5', border: `1px solid ${T.border}`, borderRadius: 6, padding: '3px 9px', fontSize: 12, color: T.textSoft, fontWeight: 600 }}>
                                {product.category}
                              </span>
                            </td>
                            <td style={{ padding: '13px 18px', fontWeight: 800, color: T.text, fontFeatureSettings: '"tnum"' }}>₹{product.price}</td>
                            <td style={{ padding: '13px 18px' }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '5px 11px', borderRadius: 999,
                                fontSize: 11, fontWeight: 700,
                                background: product.inStock !== false ? '#ecfdf5' : '#fef2f2',
                                color: product.inStock !== false ? '#0f7a4d' : '#b42318',
                                border: `1px solid ${product.inStock !== false ? '#a7f3d0' : '#fecaca'}`,
                                userSelect: 'none',
                              }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: product.inStock !== false ? '#10b981' : '#ef4444', flexShrink: 0 }} />
                                {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </td>

                            <td style={{ padding: '13px 18px' }}>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => handleEditProduct(product)} title="Edit" style={{
                                  padding: 8, borderRadius: 9, border: `1px solid ${T.borderStrong}`,
                                  background: '#fff', color: T.textSoft, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', transition: 'all .15s',
                                }}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#fffaf0'; e.currentTarget.style.color = T.goldDeep; e.currentTarget.style.borderColor = T.gold; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = T.textSoft; e.currentTarget.style.borderColor = T.borderStrong; }}
                                >
                                  <FiEdit2 size={13} />
                                </button>
                                <button onClick={() => handleDeleteProduct(product.id || product._id)} title="Delete" style={{
                                  padding: 8, borderRadius: 9, border: `1px solid ${T.borderStrong}`,
                                  background: '#fff', color: T.textSoft, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', transition: 'all .15s',
                                }}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#b42318'; e.currentTarget.style.borderColor = '#fecaca'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = T.textSoft; e.currentTarget.style.borderColor = T.borderStrong; }}
                                >
                                  <FiTrash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Orders ── */}
            {activeTab === 'orders' && (
              <div style={{ animation: 'fadeUp .3s ease' }}>
                <div style={{ marginBottom: 22 }}>
                  <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>Orders</h1>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: T.textMuted }}>Auto-refreshes every {POLL_MS / 1000}s</p>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                  {['all', ...ORDER_STATUSES].map(s => {
                    const active = orderFilter === s;
                    const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
                    return (
                      <button key={s} onClick={() => setOrderFilter(s)} style={{
                        padding: '8px 14px', borderRadius: 999,
                        border: `1.5px solid ${active ? T.navy : T.borderStrong}`,
                        background: active ? T.navy : '#fff',
                        color: active ? '#fff' : T.textSoft,
                        fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: 7, transition: 'all .15s',
                      }}>
                        {s === 'all' ? 'All Orders' : STATUS_CONFIG[s]?.label || s}
                        <span style={{
                          background: active ? T.gold : '#f1f5f9',
                          color: active ? T.navy : T.textMuted,
                          fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 999,
                        }}>{count}</span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden', boxShadow: T.shadowSm }}>
                  {renderOrdersTable(null, orderFilter)}
                </div>
              </div>
            )}

            {/* ── Categories ── */}
            {activeTab === 'categories' && (
              <div style={{ animation: 'fadeUp .3s ease', display: 'flex', flexDirection: 'column', gap: 22 }}>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>Categories</h1>

                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: '22px 24px', boxShadow: T.shadowSm }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: 14.5, fontWeight: 800, color: T.text }}>Add New Category</h3>
                  <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>
                      <Field label="Category Name">
                        <Input required value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="e.g. Sarees" />
                      </Field>
                      <ImageUploader
                        label="Category Image"
                        value={categoryForm.image}
                        onUpload={url => setCategoryForm({ ...categoryForm, image: url })}
                        folder="/jyots-collection/categories"
                      />
                    </div>
                    <button type="submit" disabled={categoryFormLoading || !categoryForm.image} style={{
                      padding: '11px 22px', alignSelf: 'flex-start',
                      background: categoryFormLoading || !categoryForm.image
                        ? '#cbd5e1'
                        : `linear-gradient(135deg, ${T.gold}, ${T.goldDeep})`,
                      color: T.navy, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800,
                      cursor: categoryFormLoading || !categoryForm.image ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', whiteSpace: 'nowrap',
                      opacity: 1,
                      boxShadow: categoryFormLoading || !categoryForm.image ? 'none' : '0 6px 18px -4px rgba(202,162,74,0.45)',
                    }}>
                      {categoryFormLoading ? 'Adding…' : '+ Add Category'}
                    </button>
                  </form>
                </div>

                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, overflow: 'hidden', boxShadow: T.shadowSm }}>
                  <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.border}` }}>
                    <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 800, color: T.text }}>All Categories</h3>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#fafbfc' }}>
                          {['Image', 'Name', 'Action'].map(h => (
                            <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color: T.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: `1px solid ${T.border}` }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {categoriesLoading ? (
                          <tr>
                            <td colSpan={3} style={{ padding: 40 }}>
                              <Loader size="sm" text="Loading categories..." />
                            </td>
                          </tr>
                        ) : categories.length === 0 ? (
                          <tr><td colSpan={3} style={{ padding: 48, textAlign: 'center', color: T.textMuted }}>No categories yet.</td></tr>
                        ) : categories.map(cat => (
                          <tr key={cat._id} style={{ borderBottom: `1px solid ${T.border}`, transition: 'background .12s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '13px 18px' }}>
                              <img src={cat.image} alt={cat.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', border: `1px solid ${T.border}` }} />
                            </td>
                            <td style={{ padding: '13px 18px', fontWeight: 700, color: T.text }}>{cat.name}</td>
                            <td style={{ padding: '13px 18px' }}>
                              <button onClick={() => handleDeleteCategory(cat._id)} style={{
                                padding: 8, borderRadius: 9, border: `1px solid ${T.borderStrong}`,
                                background: '#fff', color: T.textSoft, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', transition: 'all .15s',
                              }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#b42318'; e.currentTarget.style.borderColor = '#fecaca'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = T.textSoft; e.currentTarget.style.borderColor = T.borderStrong; }}
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Add / Edit Product ── */}
            {activeTab === 'add-product' && (
              <div style={{ maxWidth: 720, animation: 'fadeUp .3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>
                      {isEditing ? 'Edit Product' : 'Add New Product'}
                    </h1>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: T.textMuted }}>
                      {isEditing ? 'Update the product details below' : 'Fill in the details to add a new item'}
                    </p>
                  </div>
                  {isEditing && (
                    <button onClick={resetProductForm} style={{
                      padding: '8px 14px', border: `1px solid ${T.borderStrong}`, borderRadius: 10,
                      background: '#fff', color: T.textSoft, fontSize: 12.5, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 18, padding: 26, boxShadow: T.shadowSm,
                  display: 'flex', flexDirection: 'column', gap: 18,
                }}>
                  <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <Field label="Product Name">
                      <Input required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder="Enter product name" />
                    </Field>

                    <Field label="Category">
                      <CustomSelect value={productForm.category} onChange={val => setProductForm({ ...productForm, category: val })}
                        options={categories.map(c => c.name)} placeholder="Select category" />
                      <input type="text" required value={productForm.category} onChange={() => { }} style={{ opacity: 0, position: 'absolute', pointerEvents: 'none', height: 0 }} />
                    </Field>

                    {/* Stock toggle */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 16px', background: '#fafbfc', borderRadius: 12, border: `1px solid ${T.border}`,
                    }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: T.text }}>Availability</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: T.textMuted }}>Is this product currently available?</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: productForm.inStock ? '#0f7a4d' : T.textSoft }}>
                          {productForm.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <button type="button" onClick={() => setProductForm({ ...productForm, inStock: !productForm.inStock })} style={{
                          width: 46, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer',
                          background: productForm.inStock ? '#10b981' : '#cbd5e1',
                          position: 'relative', transition: 'background .2s',
                        }}>
                          <span style={{
                            position: 'absolute', top: 3, width: 20, height: 20,
                            borderRadius: '50%', background: '#fff',
                            left: productForm.inStock ? 23 : 3,
                            transition: 'left .2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          }} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <Field label="Selling Price (₹)">
                        <Input type="number" required value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} placeholder="0" />
                      </Field>
                      <Field label="Original Price (₹)">
                        <Input type="number" required value={productForm.originalPrice} onChange={e => setProductForm({ ...productForm, originalPrice: e.target.value })} placeholder="0" />
                      </Field>
                    </div>

                    {productForm.price && productForm.originalPrice && Number(productForm.originalPrice) > 0 && (
                      <div style={{
                        background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10,
                        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
                      }}>
                        <span style={{ color: '#0f7a4d', fontWeight: 800 }}>
                          {Math.round(((Number(productForm.originalPrice) - Number(productForm.price)) / Number(productForm.originalPrice)) * 100)}% discount
                        </span>
                        <span style={{ color: '#10b981', fontWeight: 500 }}>will be shown to customers</span>
                      </div>
                    )}

                    {/* Main Image Upload */}
                    <ImageUploader
                      label="Main Product Image"
                      value={productForm.image}
                      folder="/jyots-collection/products"
                      onUpload={url => {
                        // Also sync to gallery if gallery is empty or update first gallery slot
                        setProductForm(f => {
                          const updatedGallery = f.images.length > 0
                            ? [url, ...f.images.filter((_, i) => i !== 0)]
                            : [url];
                          return { ...f, image: url, images: updatedGallery };
                        });
                      }}
                    />

                    {/* Gallery Images Upload */}
                    <MultiImageUploader
                      label="Gallery Images (for product slideshow)"
                      values={productForm.images}
                      folder="/jyots-collection/products"
                      onMultiUpload={urls => setProductForm(f => ({
                        ...f,
                        images: urls,
                        // Keep main image in sync with first gallery image
                        image: urls[0] || f.image,
                      }))}
                    />

                    <Field label="Available Sizes">
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map(size => {
                          const selected = productForm.sizes.includes(size);
                          return (
                            <button key={size} type="button" onClick={() => {
                              const newSizes = selected ? productForm.sizes.filter(s => s !== size) : [...productForm.sizes, size];
                              setProductForm({ ...productForm, sizes: newSizes });
                            }} style={{
                              padding: '8px 14px', borderRadius: 9,
                              border: `1.5px solid ${selected ? T.gold : T.borderStrong}`,
                              background: selected ? '#fffaf0' : '#fff',
                              color: selected ? T.goldDeep : T.textSoft,
                              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                              transition: 'all .15s',
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                            }}>
                              {selected && <FiCheck size={11} />}
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </Field>

                    {/* Available Colors */}
                    <Field label="Available Colors" hint="Type a color name and press Enter or comma to add">
                      <div style={{
                        border: `1.5px solid ${T.borderStrong}`, borderRadius: 10,
                        background: '#fafbfc', padding: '8px 10px',
                        display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
                        minHeight: 48, transition: 'border-color .15s, box-shadow .15s, background .15s',
                      }}
                        onClick={e => e.currentTarget.querySelector('input')?.focus()}
                        onFocusCapture={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.boxShadow = `0 0 0 3px ${T.ring}`; e.currentTarget.style.background = '#fff'; }}
                        onBlurCapture ={e => { e.currentTarget.style.borderColor = T.borderStrong; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#fafbfc'; }}
                      >
                        {productForm.colors.map((c, idx) => (
                          <span key={idx} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: '#fffaf0', color: T.goldDeep,
                            fontSize: 12, fontWeight: 700,
                            padding: '4px 8px 4px 7px', borderRadius: 999,
                            border: `1px solid ${T.gold}55`,
                          }}>
                            <span style={{
                              width: 11, height: 11, borderRadius: '50%', flexShrink: 0,
                              background: colorDot(c),
                              border: '1px solid rgba(0,0,0,0.12)',
                            }} />
                            {c}
                            <button type="button" onClick={() => setProductForm(f => ({ ...f, colors: f.colors.filter((_, i) => i !== idx) }))} style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: T.goldDeep, fontSize: 15, lineHeight: 1, padding: 0,
                              display: 'flex', alignItems: 'center', marginLeft: 1,
                            }}>×</button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={colorInput}
                          onChange={e => setColorInput(e.target.value)}
                          onKeyDown={e => {
                            if ((e.key === 'Enter' || e.key === ',') && colorInput.trim()) {
                              e.preventDefault();
                              const val = colorInput.trim().replace(/,$/, '');
                              if (val && !productForm.colors.includes(val)) {
                                setProductForm(f => ({ ...f, colors: [...f.colors, val] }));
                              }
                              setColorInput('');
                            } else if (e.key === 'Backspace' && !colorInput && productForm.colors.length > 0) {
                              setProductForm(f => ({ ...f, colors: f.colors.slice(0, -1) }));
                            }
                          }}
                          onBlur={() => {
                            if (colorInput.trim()) {
                              const val = colorInput.trim();
                              if (!productForm.colors.includes(val)) {
                                setProductForm(f => ({ ...f, colors: [...f.colors, val] }));
                              }
                              setColorInput('');
                            }
                          }}
                          placeholder={productForm.colors.length === 0 ? 'e.g. Red, Blue, Gold…' : ''}
                          style={{
                            border: 'none', outline: 'none', fontSize: 13,
                            background: 'transparent', color: T.text,
                            minWidth: 120, flex: 1, fontFamily: 'inherit', padding: '4px 2px',
                          }}
                        />
                      </div>
                    </Field>

                    <Field label="Fabric / Material">
                      <Input value={productForm.fabric} onChange={e => setProductForm({ ...productForm, fabric: e.target.value })} placeholder="e.g. Silk, Cotton, Georgette…" />
                    </Field>

                    <Field label="Description">
                      <Textarea rows={4} value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} placeholder="Describe the product…" />
                    </Field>

                    <button type="submit" disabled={formLoading} style={{
                      padding: '14px 26px',
                      background: formLoading
                        ? '#cbd5e1'
                        : `linear-gradient(135deg, ${T.gold}, ${T.goldDeep})`,
                      color: T.navy, border: 'none', borderRadius: 12,
                      fontSize: 14, fontWeight: 800, cursor: formLoading ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', letterSpacing: '0.02em',
                      boxShadow: formLoading ? 'none' : '0 8px 22px -6px rgba(202,162,74,0.5)',
                      transition: 'transform .15s, box-shadow .15s',
                    }}
                      onMouseEnter={e => { if (!formLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 26px -6px rgba(202,162,74,0.6)'; } }}
                      onMouseLeave={e => { if (!formLoading) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 22px -6px rgba(202,162,74,0.5)'; } }}
                    >
                      {formLoading ? 'Saving…' : isEditing ? '✓ Update Product' : '+ Add Product'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
