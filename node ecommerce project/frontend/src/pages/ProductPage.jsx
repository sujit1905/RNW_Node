import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";
import { API_BASE_URL } from "../lib/api";
import {
  FiHeart, FiShoppingCart, FiTruck, FiShield, FiRefreshCw,
  FiChevronRight, FiMinus, FiPlus, FiShare2, FiCheck,
  FiZoomIn,
} from "react-icons/fi";

/* ── Color map (shared) ── */
const COLOR_HEX = {
  red: "#ef4444", maroon: "#7f1d1d", pink: "#ec4899", rose: "#f43f5e",
  orange: "#f97316", peach: "#fcd5b5", yellow: "#facc15", gold: "#d4af37",
  mustard: "#d4a017", green: "#22c55e", olive: "#808000", teal: "#14b8a6",
  mint: "#a7f3d0", blue: "#3b82f6", navy: "#1e3a8a", skyblue: "#38bdf8",
  "sky blue": "#38bdf8", royalblue: "#1d4ed8", "royal blue": "#1d4ed8",
  purple: "#a855f7", violet: "#8b5cf6", lavender: "#c4b5fd",
  brown: "#92400e", beige: "#e8dcc4", cream: "#fffdd0", ivory: "#fffff0",
  white: "#ffffff", offwhite: "#faf9f6", "off white": "#faf9f6",
  black: "#0a0a0a", grey: "#6b7280", gray: "#6b7280", silver: "#c0c0c0",
  multicolor: "linear-gradient(135deg,#ef4444,#facc15,#22c55e,#3b82f6,#a855f7)",
};

const getColorStyle = (name = "") => {
  const key = name.toString().trim().toLowerCase();
  const val = COLOR_HEX[key];
  if (!val) return { background: "#d1d5db" };
  if (val.startsWith("linear-gradient")) return { backgroundImage: val };
  return { backgroundColor: val };
};

const LIGHT_COLORS = ["white", "ivory", "cream", "offwhite", "off white", "beige", "peach", "mint", "lavender"];

export default function ProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { isLoggedIn } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [actionError, setActionError] = useState("");
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });

  const imgRef = useRef(null);

  const availableColors = (() => {
    if (!product) return [];
    if (Array.isArray(product.colors) && product.colors.length) return product.colors;
    if (typeof product.color === "string" && product.color.trim()) {
      return product.color.split(",").map((c) => c.trim()).filter(Boolean);
    }
    return [];
  })();

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct({ ...data, id: data._id });

        const allRes = await fetch(`${API_BASE_URL}/products`);
        const allData = await allRes.json();
        const related = allData
          .filter((p) => p.category === data.category && p._id !== data._id)
          .slice(0, 4)
          .map((p) => ({ ...p, id: p._id }));
        setRelatedProducts(related);
        setSelectedImage(0);
        setSelectedSize("");

        const colors =
          Array.isArray(data.colors) && data.colors.length
            ? data.colors
            : typeof data.color === "string"
              ? data.color.split(",").map((c) => c.trim()).filter(Boolean)
              : [];
        setSelectedColor(colors[0] || "");

        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndRelated();
  }, [id]);

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      setActionError("Please login first to add items to cart.");
      navigate("/login");
      return false;
    }
    if (product.inStock === false) {
      setActionError("This product is currently out of stock.");
      return false;
    }
    if (!selectedSize && product.sizes[0] !== "Free Size") {
      setActionError("Please select a size.");
      return false;
    }
    if (availableColors.length > 1 && !selectedColor) {
      setActionError("Please select a color.");
      return false;
    }
    setActionError("");
    addToCart(
      { ...product, selectedColor: selectedColor || availableColors[0] || product.color },
      selectedSize || product.sizes[0]
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
    return true;
  };

  const handleBuyNow = () => {
    if (handleAddToCart()) navigate("/checkout");
  };

  const handleMouseMove = (e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ active: true, x, y });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: product.name, url: window.location.href });
      else await navigator.clipboard.writeText(window.location.href);
    } catch {}
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-velura-50">
        <div className="container-main py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
            <div className="space-y-4">
              <div className="shimmer rounded-2xl" style={{ aspectRatio: "3/4" }} />
              <div className="flex gap-3">
                {[...Array(4)].map((_, i) => <div key={i} className="shimmer rounded-xl w-16 h-20 sm:w-20 sm:h-24" />)}
              </div>
            </div>
            <div className="space-y-5 pt-4">
              <div className="shimmer h-5 rounded w-24" />
              <div className="shimmer h-10 rounded w-3/4" />
              <div className="shimmer h-6 rounded w-1/4" />
              <div className="shimmer h-24 rounded w-full" />
              <div className="flex gap-3">
                {[...Array(5)].map((_, i) => <div key={i} className="shimmer h-10 rounded-xl w-14" />)}
              </div>
              <div className="shimmer h-14 rounded-2xl w-full" />
              <div className="shimmer h-14 rounded-2xl w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-velura-50 px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-velura-100">
            <span className="text-3xl">🔍</span>
          </div>
          <h2 className="text-headline text-ink-900 mb-3">{error || "Product Not Found"}</h2>
          <p className="text-velura-500 text-sm mb-8">We couldn't find what you're looking for.</p>
          <Link to="/" className="btn-primary text-sm px-8 py-3.5">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const liked = isWishlisted(product.id);
  const savings = product.originalPrice - product.price;

  return (
    <div className="min-h-screen bg-velura-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-velura-100">
        <div className="container-main py-3">
          <div className="flex items-center gap-2 text-xs text-velura-400">
            <Link to="/" className="hover:text-ink-900 transition-colors">Home</Link>
            <FiChevronRight size={11} />
            <Link to="/category" className="hover:text-ink-900 transition-colors">{product.category}</Link>
            <FiChevronRight size={11} />
            <span className="text-ink-600 font-medium truncate max-w-[160px] sm:max-w-none">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container-main py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

          {/* ── Image Gallery ── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
              {/* Thumbnails */}
              <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible scroll-hide sm:max-h-[620px]">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden shrink-0 transition-all duration-300 ${
                      selectedImage === i
                        ? "ring-2 ring-ink-900 ring-offset-2"
                        : "ring-1 ring-velura-200 hover:ring-velura-400 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1 relative group">
                <div
                  ref={imgRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setZoom({ active: false, x: 50, y: 50 })}
                  className="relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-zoom-in bg-white shadow-sm"
                  style={{ aspectRatio: "3/4" }}
                >
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out"
                    style={{
                      transform: zoom.active ? "scale(1.8)" : "scale(1)",
                      transformOrigin: `${zoom.x}% ${zoom.y}%`,
                    }}
                  />

                  {/* Discount badge */}
                  {product.discount > 0 && (
                    <div className="absolute top-4 left-4">
                      <span className="badge-dark shadow-lg">{product.discount}% OFF</span>
                    </div>
                  )}

                  {/* Share button */}
                  <button
                    onClick={handleShare}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                  >
                    <FiShare2 size={14} className="text-ink-700" />
                  </button>

                  {/* Zoom hint */}
                  <div className="absolute bottom-4 right-4 hidden group-hover:flex items-center gap-1 px-2 py-1 bg-black/60 text-white text-[10px] rounded-full">
                    <FiZoomIn size={10} /> Hover to zoom
                  </div>

                  {/* Image counter */}
                  <div className="absolute bottom-4 left-4 px-2.5 py-1 bg-black/60 text-white text-xs rounded-full">
                    {selectedImage + 1} / {product.images.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Product Info ── */}
          <div className="space-y-6 sm:space-y-7">
            {/* Head */}
            <div>
              <span className="badge-gold mb-3">{product.category}</span>
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink-900 mt-3 mb-3 leading-tight"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
              >
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: "var(--color-gold-500)", fontSize: 14 }}>★</span>
                  ))}
                </div>
                <span className="text-xs text-velura-400">(4.8 · 124 reviews)</span>
                <span className={`text-xs font-semibold ${product.inStock !== false ? "text-green-600" : "text-red-500"}`}>
                  {product.inStock !== false ? "● In Stock" : "● Out of Stock"}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="rounded-2xl p-5 sm:p-6 border border-velura-200 bg-white">
              <div className="flex items-baseline gap-3 flex-wrap mb-2">
                <span className="price-current text-3xl sm:text-4xl">₹{product.price.toLocaleString()}</span>
                <span className="price-original text-lg">₹{product.originalPrice.toLocaleString()}</span>
                {savings > 0 && (
                  <span className="badge-success">Save ₹{savings.toLocaleString()}</span>
                )}
              </div>
              <p className="text-xs text-velura-400">Inclusive of all taxes · Free shipping</p>
            </div>

            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-ink-900 text-sm">
                    Color: <span className="font-normal text-velura-500 capitalize">{selectedColor}</span>
                  </h3>
                  <span className="text-xs text-velura-400">{availableColors.length} option{availableColors.length > 1 ? "s" : ""}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {availableColors.map((color) => {
                    const isSelected = selectedColor === color;
                    const isLight = LIGHT_COLORS.includes(color.toLowerCase());
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        aria-label={`Select color ${color}`}
                        className={`relative w-10 h-10 rounded-full transition-all duration-200 ${
                          isSelected
                            ? "ring-2 ring-offset-2 ring-ink-900 scale-110"
                            : "ring-1 ring-velura-200 hover:scale-110 hover:ring-velura-400"
                        }`}
                      >
                        <span
                          className={`block w-full h-full rounded-full ${isLight ? "border border-velura-200" : ""}`}
                          style={getColorStyle(color)}
                        />
                        {isSelected && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <FiCheck size={14} className={isLight ? "text-ink-900" : "text-white drop-shadow"} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-ink-900 text-sm">Select Size</h3>
                <button className="text-xs text-gold-600 font-medium hover:underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {["XS", "S", "M", "L", "XL", "XXL", "Free Size"].map((size) => {
                  const isAvailable = product.sizes.includes(size);
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      disabled={!isAvailable}
                      onClick={() => isAvailable && setSelectedSize(size)}
                      className={`relative min-w-[46px] h-11 px-3.5 rounded-xl text-xs font-semibold transition-all duration-200 overflow-hidden ${
                        !isAvailable
                          ? "bg-velura-50 text-velura-300 cursor-not-allowed border border-velura-100"
                          : isSelected
                            ? "bg-ink-900 text-white border-2 border-ink-900 shadow-lg"
                            : "bg-white border-2 border-velura-200 text-ink-700 hover:border-ink-900 hover:scale-105"
                      }`}
                    >
                      {size}
                      {!isAvailable && (
                        <svg className="absolute inset-0 w-full h-full text-velura-200" preserveAspectRatio="none" viewBox="0 0 100 100">
                          <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-semibold text-ink-900 text-sm mb-3">Quantity</h3>
              <div className="inline-flex items-center bg-white border-2 border-velura-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-velura-50 transition-colors disabled:opacity-30"
                  disabled={quantity <= 1}
                >
                  <FiMinus size={14} />
                </button>
                <span className="w-12 h-11 flex items-center justify-center font-bold text-sm text-ink-900 border-x-2 border-velura-200">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-11 h-11 flex items-center justify-center hover:bg-velura-50 transition-colors"
                >
                  <FiPlus size={14} />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              {product.inStock === false ? (
                <div className="rounded-2xl p-5 text-center border border-danger-light bg-danger-light">
                  <p className="font-bold text-danger text-sm">⚠️ Out of Stock</p>
                  <p className="text-velura-500 text-xs mt-1">Check back soon — this item is temporarily unavailable.</p>
                </div>
              ) : (
                <div className="flex gap-3">
                  {/* Wishlist */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`shrink-0 w-13 h-13 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${
                      liked
                        ? "border-rose-400 bg-rose-50 text-rose-500 scale-105"
                        : "border-velura-200 bg-white text-velura-500 hover:border-rose-300 hover:text-rose-500 hover:scale-105"
                    }`}
                    style={{ width: "52px", height: "52px" }}
                    aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <FiHeart size={18} className={liked ? "fill-rose-500" : ""} />
                  </button>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 border-2 ${
                      isAdded
                        ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-100"
                        : "bg-white text-ink-900 border-ink-900 hover:bg-ink-900 hover:text-white"
                    }`}
                    style={{ height: "52px" }}
                  >
                    {isAdded ? <><FiCheck size={16} /> Added!</> : <><FiShoppingCart size={16} /> Add to Cart</>}
                  </button>

                  {/* Buy Now */}
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-95"
                    style={{
                      height: "52px",
                      background: "linear-gradient(135deg, var(--color-gold-400), var(--color-gold-700))",
                      color: "#fff",
                      boxShadow: "0 8px 24px rgba(201,168,76,0.4)",
                    }}
                  >
                    Buy Now <FiChevronRight size={16} />
                  </button>
                </div>
              )}

              {actionError && (
                <p className="text-xs text-danger px-1 animate-fade-up">{actionError}</p>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { icon: FiTruck, title: "Free Delivery", sub: "3-5 days" },
                { icon: FiRefreshCw, title: "Easy Returns", sub: "7 days" },
                { icon: FiShield, title: "100% Authentic", sub: "Guaranteed" },
              ].map((item, i) => (
                <div key={i} className="group text-center p-3 bg-white border border-velura-100 rounded-2xl hover:border-gold-200 hover:shadow-sm transition-all duration-300">
                  <item.icon className="mx-auto mb-2 text-gold-500 group-hover:scale-110 transition-transform" size={18} />
                  <p className="text-[11px] text-ink-900 font-semibold leading-tight">{item.title}</p>
                  <p className="text-[10px] text-velura-400 mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="pt-6 border-t border-velura-100">
              <h3 className="font-bold text-ink-900 text-base mb-3" style={{ fontFamily: "var(--font-display)" }}>
                Product Details
              </h3>
              <p className="text-sm text-velura-600 leading-relaxed mb-4">{product.description}</p>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-velura-50 rounded-xl border border-velura-100">
                  <p className="text-[10px] uppercase tracking-wider text-velura-400 font-semibold mb-1">Fabric</p>
                  <p className="font-semibold text-ink-900 text-sm">{product.fabric}</p>
                </div>
                <div className="p-3 bg-velura-50 rounded-xl border border-velura-100">
                  <p className="text-[10px] uppercase tracking-wider text-velura-400 font-semibold mb-1">Color</p>
                  <p className="font-semibold text-ink-900 text-sm capitalize">{selectedColor || product.color}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 sm:mt-20">
            <div className="flex items-end justify-between mb-8 sm:mb-10">
              <div>
                <p className="section-label mb-1">Curated For You</p>
                <h2 className="section-title text-2xl sm:text-3xl">You May Also Like</h2>
              </div>
              <Link to="/category"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-velura-600 hover:text-ink-900 transition-colors">
                View All <FiChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
