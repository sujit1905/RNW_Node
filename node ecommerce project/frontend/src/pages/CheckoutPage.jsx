import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { apiRequest, getAuthHeaders } from "../lib/api";
import {
  FiMapPin, FiCreditCard, FiSmartphone, FiCheck,
  FiLock, FiShield, FiTruck, FiArrowLeft, FiTrash2, FiChevronRight
} from "react-icons/fi";
import { FaIndianRupeeSign } from "react-icons/fa6";

const emptyAddress = () => ({
  name: "", phone: "", address: "", city: "", state: "", pincode: "",
});

export default function CheckoutPage() {
  const { cart, selectedItems, cartTotal, removeSelectedFromCart, toggleSelection, updateQuantity, removeFromCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  const [step, setStep] = useState(() => Number(sessionStorage.getItem("checkout_step")) || 1);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");
  const [address, setAddress] = useState(() => {
    const saved = sessionStorage.getItem("checkout_address");
    return saved ? JSON.parse(saved) : emptyAddress();
  });

  useEffect(() => { sessionStorage.setItem("checkout_step", String(step)); }, [step]);
  useEffect(() => {
    if (orderPlaced) {
      sessionStorage.removeItem("checkout_step");
      sessionStorage.removeItem("checkout_address");
    }
  }, [orderPlaced]);

  const handleAddressChange = (key, value) => {
    setAddress((prev) => {
      const updated = { ...prev, [key]: value };
      sessionStorage.setItem("checkout_address", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (!user) return;
    const saved = sessionStorage.getItem("checkout_address");
    const s = user.shippingAddress;
    const forcedName = (user.name || "").trim();
    const forcedPhone = (user.phone || "").trim();
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.name !== forcedName || parsed.phone !== forcedPhone) {
        const updated = { ...parsed, name: forcedName, phone: forcedPhone };
        setAddress(updated);
        sessionStorage.setItem("checkout_address", JSON.stringify(updated));
      }
    } else {
      const initial = {
        name: forcedName, phone: forcedPhone,
        address: (s?.address || "").trim(),
        city: (s?.city || "").trim(),
        state: (s?.state || "").trim(),
        pincode: (s?.pincode || "").trim(),
      };
      setAddress(initial);
      sessionStorage.setItem("checkout_address", JSON.stringify(initial));
    }
  }, [user]);

  if (!isLoggedIn) return <Navigate to="/login" />;

  const loadRazorpay = () => new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePlaceOrder = async () => {
    try {
      setIsPlacingOrder(true); setError("");
      const orderPayload = {
        items: selectedItems.map((item) => ({
          productId: item.id, name: item.name, image: item.image,
          size: item.size, color: item.selectedColor || "",
          quantity: item.quantity, price: item.price,
        })),
        shippingAddress: address, paymentMethod,
      };
      const order = await apiRequest("/orders", {
        method: "POST", headers: getAuthHeaders(),
        body: JSON.stringify(orderPayload),
      });

      if (paymentMethod === "upi") {
        const res = await loadRazorpay();
        if (!res) { setError("Razorpay SDK failed to load."); setIsPlacingOrder(false); return; }
        const intent = await apiRequest("/payments/create-intent", {
          method: "POST", headers: getAuthHeaders(),
          body: JSON.stringify({ amount: order.totalPrice }),
        });
        if (intent.isMock) {
          alert("Razorpay Keys missing. Simulating payment.");
          await apiRequest(`/orders/${order._id}/pay`, { method: "PUT", headers: getAuthHeaders(), body: JSON.stringify({}) });
          setOrderId(order._id); setOrderPlaced(true); removeSelectedFromCart(); setIsPlacingOrder(false);
          return;
        }
        let isPaymentSuccessful = false;
        const options = {
          key: intent.keyId, amount: intent.amount, currency: intent.currency,
          name: "VELURA", description: "Order Payment",
          order_id: intent.paymentIntentId,
          handler: async function (response) {
            isPaymentSuccessful = true;
            try {
              await apiRequest(`/orders/${order._id}/pay`, {
                method: "PUT", headers: getAuthHeaders(),
                body: JSON.stringify({
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });
              setOrderId(order._id); setOrderPlaced(true); removeSelectedFromCart();
            } catch { setError("Payment verification failed. Contact support."); }
          },
          modal: {
            ondismiss: async function () {
              if (isPaymentSuccessful) return;
              try { await apiRequest(`/orders/${order._id}`, { method: "DELETE", headers: getAuthHeaders() }); }
              catch (err) { console.error(err); }
            },
          },
          prefill: { name: address.name, contact: address.phone },
          theme: { color: "#c9a84c" },
        };
        const paymentObject = new window.Razorpay(options);
        paymentObject.on("payment.failed", (r) => setError(r.error.description || "Payment failed"));
        paymentObject.open();
        setIsPlacingOrder(false);
        return;
      }
      setOrderId(order._id); setOrderPlaced(true); removeSelectedFromCart();
    } catch (err) { setError(err.message); }
    finally { setIsPlacingOrder(false); }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-velura-50 flex items-center justify-center px-4 py-8">
        <div className="text-center max-w-md animate-fade-up bg-white p-8 sm:p-12 rounded-3xl border border-velura-200 shadow-sm">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-100 text-green-600 shadow-lg shadow-green-100">
            <FiCheck size={36} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 mb-2" style={{ fontFamily: "var(--font-display)" }}>Order Placed!</h1>
          <p className="text-velura-500 text-sm mb-1 leading-relaxed">Thank you for shopping with VELURA.</p>
          <p className="text-xs text-velura-400 mb-6">Your order has been placed successfully.</p>
          <div className="bg-velura-50 rounded-2xl py-3 px-4 inline-block mb-8 border border-velura-100">
            <span className="text-xs uppercase tracking-wider text-velura-500 font-semibold">Order ID</span>
            <p className="text-gold-600 font-bold text-sm mt-0.5">#{orderId.slice(-8).toUpperCase()}</p>
          </div>
          <div>
            <Link to="/" className="btn-primary w-full py-4 text-xs">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-velura-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h2 className="text-headline text-ink-900 mb-4">Your cart is empty</h2>
          <Link to="/" className="btn-primary text-xs px-6 py-3">← Back to Shop</Link>
        </div>
      </div>
    );
  }

  const deliveryCharge = cartTotal >= 999 ? 0 : 49;
  const grandTotal = cartTotal + deliveryCharge;
  const progress = step === 1 ? 0 : 100;

  return (
    <div className="min-h-screen bg-velura-50">
      <div className="container-main py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            to="/cart"
            className="w-10 h-10 rounded-full border border-velura-200 bg-white flex items-center justify-center text-velura-600 hover:bg-ink-900 hover:text-white hover:border-ink-900 transition-all"
          >
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink-900" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
              Checkout
            </h1>
            <p className="text-xs text-velura-400 mt-0.5">Secure payment & checkout process</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-10 max-w-md mx-auto relative">
          <div className="absolute top-4.5 left-10 right-10 height-[2px] bg-velura-200 h-0.5">
            <div
              className="h-full bg-gold-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between relative z-10">
            {[{ n: 1, label: "Address" }, { n: 2, label: "Pay" }].map((s) => (
              <div key={s.n} className="text-center bg-velura-50 px-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step >= s.n
                      ? "bg-ink-900 text-white shadow-lg"
                      : "bg-white text-velura-400 border border-velura-200"
                  }`}
                >
                  {step > s.n ? <FiCheck size={14} /> : s.n}
                </div>
                <span
                  className={`text-xs mt-1.5 block font-semibold ${
                    step >= s.n ? "text-ink-900" : "text-velura-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-velura-100 p-6 sm:p-8">
              {step === 1 && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center text-gold-600">
                      <FiMapPin size={18} />
                    </div>
                    <h2 className="font-bold text-ink-900 text-lg sm:text-xl" style={{ fontFamily: "var(--font-display)" }}>
                      Shipping Details
                    </h2>
                  </div>

                  {!user?.phone && (
                    <div className="bg-warning-light border border-warning rounded-2xl p-4 mb-6">
                      <p className="font-bold text-warning text-sm mb-1">⚠️ Phone Number Required</p>
                      <p className="text-velura-600 text-xs mb-3">Please add a 10-digit mobile number to your account to place orders.</p>
                      <Link to="/dashboard" className="text-gold-600 font-bold text-xs hover:underline">Update Profile →</Link>
                    </div>
                  )}

                  {selectedItems.length === 0 && (
                    <div className="bg-warning-light border border-warning rounded-2xl p-4 mb-6">
                      <p className="font-bold text-warning text-sm mb-1">⚠️ No Items Selected</p>
                      <p className="text-velura-600 text-xs">Please check/select at least one item on the right sidebar to checkout.</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: "name", label: "Full Name", type: "text", placeholder: "Name", full: true },
                      { key: "phone", label: "Mobile Phone", type: "tel", placeholder: "10-digit number" },
                      { key: "pincode", label: "PIN Code", type: "text", placeholder: "6-digit PIN" },
                      { key: "address", label: "Shipping Address", type: "text", placeholder: "Flat/House no., street, area", full: true },
                      { key: "city", label: "City", type: "text", placeholder: "City" },
                      { key: "state", label: "State", type: "text", placeholder: "State" },
                    ].map((field) => {
                      const locked = field.key === "name" || field.key === "phone";
                      return (
                        <div key={field.key} className={field.full ? "col-span-2" : "col-span-1"}>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-velura-400 mb-1.5">{field.label}</label>
                          <input
                            type={field.type}
                            value={address[field.key]}
                            disabled={locked}
                            placeholder={field.placeholder}
                            onChange={(e) => handleAddressChange(field.key, e.target.value)}
                            className="input-velura"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={selectedItems.length === 0 || !user?.phone || !address.name || !address.phone || !address.address || !address.city || !address.state || !address.pincode}
                    className="btn-primary w-full mt-8 py-4 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Proceed to Payment
                  </button>
                  {error && <p className="text-xs text-danger mt-3">{error}</p>}
                </>
              )}

              {step === 2 && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center text-gold-600">
                      <FiCreditCard size={18} />
                    </div>
                    <h2 className="font-bold text-ink-900 text-lg sm:text-xl" style={{ fontFamily: "var(--font-display)" }}>
                      Payment Method
                    </h2>
                  </div>

                  {selectedItems.length === 0 && (
                    <div className="bg-warning-light border border-warning rounded-2xl p-4 mb-6">
                      <p className="font-bold text-warning text-sm mb-1">⚠️ No Items Selected</p>
                      <p className="text-velura-600 text-xs">Select items in the sidebar to perform payment.</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {[
                      { id: "upi", icon: FiSmartphone, label: "Pay securely via UPI", desc: "PhonePe, Google Pay, PayTM", badge: "Instant" },
                      { id: "cod", icon: FaIndianRupeeSign, label: "Cash on Delivery", desc: "Pay at your door", badge: null },
                    ].map((method) => {
                      const active = paymentMethod === method.id;
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                            active
                              ? "border-ink-900 bg-velura-100"
                              : "border-velura-200 bg-white hover:border-velura-300"
                          }`}
                        >
                          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center border border-velura-100 shrink-0 text-gold-600">
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-ink-900 text-sm">{method.label}</p>
                              {method.badge && (
                                <span className="bg-green-100 text-green-700 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">{method.badge}</span>
                              )}
                            </div>
                            <p className="text-velura-400 text-xs mt-0.5">{method.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            active ? "bg-ink-900 border-ink-900" : "border-velura-300"
                          }`}>
                            {active && <FiCheck size={11} className="text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() => setStep(1)}
                      className="btn-outline px-6 py-3.5 text-xs text-ink-900 border-velura-300 hover:bg-velura-100"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder || selectedItems.length === 0}
                      className="btn-primary flex-1 py-3.5 text-xs disabled:opacity-50"
                    >
                      {isPlacingOrder ? "Processing…" : `Place Order · ₹${grandTotal.toLocaleString()}`}
                    </button>
                  </div>
                  {error && <p className="text-xs text-danger mt-3">{error}</p>}
                </>
              )}
            </div>
          </div>

          {/* Sidebar Summary */}
          <div>
            <div className="bg-white rounded-3xl border border-velura-100 p-6 space-y-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gold-600">Review Items</h3>

              <div className="space-y-3 max-h-80 overflow-y-auto scroll-hide pr-1">
                {cart.map((item, index) => {
                  const key = `${item.id}-${item.size}-${item.selectedColor || ""}`;
                  const selected = selectedItems.some((it) => it.id === item.id && it.size === item.size && (it.selectedColor || "") === (item.selectedColor || ""));
                  return (
                    <div key={key} className="flex gap-3 p-2.5 rounded-xl border border-velura-200 bg-velura-50/50">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleSelection(index)}
                        className="w-4 h-4 rounded text-ink-900 border-velura-300 accent-ink-900 cursor-pointer self-center"
                      />
                      <div className="w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-white border border-velura-200">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <p className="text-ink-900 font-semibold text-xs truncate">{item.name}</p>
                        <p className="text-velura-400 text-[10px] mt-0.5">Size: {item.size}</p>
                        <p className="price-current text-xs mt-1">₹{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center self-center rounded-lg border border-velura-200 bg-white h-7 overflow-hidden">
                        <button onClick={() => item.quantity > 1 ? updateQuantity(index, item.quantity - 1) : removeFromCart(index)}
                          className="px-2 hover:bg-velura-100 text-xs font-bold h-full">−</button>
                        <span className="px-2 text-xs font-bold text-ink-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="px-2 hover:bg-velura-100 text-xs font-bold h-full">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-velura-100 pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-velura-500">
                  <span>Items ({selectedItems.length})</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-velura-500">
                  <span>Shipping</span>
                  <span className={deliveryCharge === 0 ? "text-green-600 font-semibold" : ""}>
                    {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-ink-900 text-base pt-3 border-t border-velura-100">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between pt-2 text-[10px] text-velura-400 border-t border-velura-100">
                <span className="flex items-center gap-1"><FiLock /> SSL SECURE</span>
                <span className="flex items-center gap-1"><FiShield /> VERIFIED PAY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
