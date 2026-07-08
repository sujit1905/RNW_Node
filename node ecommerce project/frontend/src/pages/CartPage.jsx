import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import {
  FiMinus, FiPlus, FiTrash2, FiArrowLeft, FiShoppingBag,
  FiTag, FiCheckSquare, FiSquare, FiLock, FiArrowRight,
  FiTruck, FiShield,
} from "react-icons/fi";

export default function CartPage() {
  const {
    cart, selectedItems, removeFromCart, updateQuantity,
    toggleSelection, selectAll, cartTotal, cartCount,
  } = useCart();
  const { isLoggedIn } = useAuth();
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  /* ─── Not logged in ─── */
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-velura-50 px-4">
        <div className="text-center max-w-sm animate-fade-up">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-velura-100">
            <FiLock size={28} className="text-velura-400" />
          </div>
          <h2 className="text-headline text-ink-900 mb-3">Sign in required</h2>
          <p className="text-velura-500 text-sm mb-8">Log in to view your bag and continue to checkout.</p>
          <Link to="/login" className="btn-primary text-sm px-8 py-3.5 inline-flex items-center gap-2">
            Sign In <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  /* ─── Empty Cart ─── */
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-velura-50 px-4">
        <div className="text-center animate-fade-up max-w-sm">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-velura-100">
              <FiShoppingBag size={36} className="text-velura-300" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-velura-200 flex items-center justify-center">
              <span className="text-velura-500 font-bold text-xs">0</span>
            </div>
          </div>
          <h2 className="text-headline text-ink-900 mb-3">Your bag is empty</h2>
          <p className="text-velura-500 text-sm mb-8 leading-relaxed">
            Looks like you haven't added anything yet.<br />Let's change that!
          </p>
          <Link to="/category" className="btn-primary text-sm px-8 py-3.5 inline-flex items-center gap-2">
            Start Shopping <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const savings = selectedItems.reduce(
    (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
    0
  );
  const allSelected = cart.length > 0 && cart.every((item) => item.selected);
  const shipping = cartCount === 0 ? 0 : cartTotal >= 999 ? 0 : 49;
  const grandTotal = cartTotal === 0 ? 0 : cartTotal + shipping;

  return (
    <div className="min-h-screen bg-velura-50">
      <div className="container-main py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 sm:mb-10">
          <Link
            to="/category"
            className="w-10 h-10 rounded-full border border-velura-200 bg-white flex items-center justify-center text-velura-600 hover:bg-ink-900 hover:text-white hover:border-ink-900 transition-all"
          >
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-ink-900"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
            >
              Shopping Bag
            </h1>
            <p className="text-xs text-velura-400 mt-0.5 uppercase tracking-wider">
              {cart.length} item{cart.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* ─── Items ─── */}
          <div className="lg:col-span-2">
            {/* Select all */}
            <div className="flex items-center justify-between mb-4 py-3 px-4 bg-white rounded-2xl border border-velura-100">
              <button
                type="button"
                onClick={() => selectAll(!allSelected)}
                className="flex items-center gap-2.5 text-sm font-medium text-ink-700 hover:text-ink-900 transition-colors"
              >
                {allSelected
                  ? <FiCheckSquare size={18} className="text-ink-900" />
                  : <FiSquare size={18} className="text-velura-300" />}
                Select all ({cart.length})
              </button>
              {selectedItems.length > 0 && (
                <span className="text-xs text-velura-400 uppercase tracking-wider">
                  {selectedItems.length} selected
                </span>
              )}
            </div>

            {/* Cart Items */}
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-2xl border transition-all duration-300 ${
                    item.selected ? "border-velura-100 opacity-100" : "border-velura-50 opacity-60"
                  }`}
                >
                  <div className="flex gap-4 p-4 sm:p-5">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSelection(index); }}
                      className="self-start pt-1 text-velura-300 hover:text-ink-900 transition-colors"
                      aria-label={item.selected ? "Unselect item" : "Select item"}
                    >
                      {item.selected
                        ? <FiCheckSquare size={20} className="text-ink-900" />
                        : <FiSquare size={20} />}
                    </button>

                    {/* Image */}
                    <Link
                      to={`/product/${item.id}`}
                      className="w-20 sm:w-24 rounded-xl overflow-hidden shrink-0 bg-velura-100"
                      style={{ aspectRatio: "3/4" }}
                    >
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </Link>

                    {/* Details */}
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            to={`/product/${item.id}`}
                            className="line-clamp-2 text-sm font-medium text-ink-900 hover:text-velura-600 transition-colors leading-snug"
                          >
                            {item.name}
                          </Link>
                          <div className="flex gap-2 mt-1.5">
                            <span className="text-xs text-velura-400">Size · {item.size}</span>
                            {item.selectedColor && (
                              <span className="text-xs text-velura-400">Color · {item.selectedColor}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="shrink-0 p-1.5 rounded-lg text-velura-300 hover:text-danger hover:bg-danger-light transition-all"
                          aria-label="Remove item"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="price-current text-sm sm:text-base">₹{item.price.toLocaleString()}</span>
                        {item.originalPrice && (
                          <span className="price-original text-xs">₹{item.originalPrice.toLocaleString()}</span>
                        )}
                        {item.discount > 0 && (
                          <span className="price-discount text-xs">{item.discount}% off</span>
                        )}
                      </div>

                      {/* Qty + Line Total */}
                      <div className="flex items-center justify-between mt-1">
                        <div className="inline-flex items-center rounded-full border border-velura-200 bg-velura-50 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-velura-600 hover:text-ink-900 hover:bg-velura-100 transition-colors"
                            aria-label="Decrease"
                          >
                            <FiMinus size={11} />
                          </button>
                          <span className="w-9 text-center text-sm font-semibold text-ink-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-velura-600 hover:text-ink-900 hover:bg-velura-100 transition-colors"
                            aria-label="Increase"
                          >
                            <FiPlus size={11} />
                          </button>
                        </div>
                        <span className="price-current text-sm sm:text-base">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Summary ─── */}
          <aside>
            <div className="sticky top-24 space-y-4">
              {/* Order Summary Card */}
              <div className="bg-white rounded-2xl border border-velura-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-velura-100">
                  <h3 className="font-semibold text-ink-900 text-sm" style={{ fontFamily: "var(--font-display)" }}>
                    Order Summary
                  </h3>
                </div>

                {/* Coupon */}
                <div className="px-5 py-4 border-b border-velura-100">
                  {couponApplied ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <FiTag size={13} />
                        Coupon "VELURA10" applied
                      </div>
                      <button onClick={() => setCouponApplied(false)} className="text-xs text-velura-400 hover:text-danger">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-velura-400" size={13} />
                        <input
                          type="text"
                          placeholder="Promo code"
                          value={coupon}
                          onChange={(e) => setCoupon(e.target.value)}
                          className="w-full rounded-xl border border-velura-200 bg-velura-50 py-2.5 pl-9 pr-3 text-sm placeholder:text-velura-400 focus:border-ink-900 focus:outline-none focus:bg-white transition-all"
                          id="coupon-input"
                        />
                      </div>
                      <button
                        onClick={() => coupon.trim() && setCouponApplied(true)}
                        className="rounded-xl bg-ink-900 px-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-velura-800 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="px-5 py-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-velura-500">Subtotal ({cartCount} items)</span>
                    <span className="font-medium text-ink-900">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between">
                      <span className="text-velura-500">Discount Savings</span>
                      <span className="font-medium text-green-600">−₹{savings.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-velura-500">Shipping</span>
                    <span className="font-medium text-ink-900">
                      {shipping === 0
                        ? <span className="text-green-600">Free</span>
                        : `₹${shipping}`}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-velura-100">
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-widest text-velura-500">Total</span>
                    <span className="text-2xl font-bold text-ink-900" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.025em" }}>
                      ₹{grandTotal.toLocaleString()}
                    </span>
                  </div>

                  {savings > 0 && (
                    <p className="rounded-xl bg-green-50 px-3 py-2.5 text-center text-xs font-medium text-green-700 mb-4">
                      🎉 You're saving ₹{savings.toLocaleString()} on this order!
                    </p>
                  )}

                  {cartCount === 0 ? (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-center text-xs font-medium text-amber-700">
                      Select at least one item to checkout
                    </p>
                  ) : (
                    <Link
                      to="/checkout"
                      className="btn-primary w-full py-3.5 text-xs block text-center"
                    >
                      Proceed to Checkout
                    </Link>
                  )}

                  <Link
                    to="/category"
                    className="mt-3 block text-center text-xs font-medium text-velura-400 hover:text-ink-900 transition-colors"
                  >
                    ← Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Trust mini */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-velura-100">
                <FiTruck size={14} className="text-gold-500 shrink-0" />
                <p className="text-xs text-velura-500">Free shipping on orders above ₹999</p>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-velura-100">
                <FiShield size={14} className="text-gold-500 shrink-0" />
                <p className="text-xs text-velura-500">100% secure checkout & payment</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
