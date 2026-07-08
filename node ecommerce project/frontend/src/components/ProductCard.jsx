import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiHeart, FiShoppingBag, FiCheck, FiStar } from "react-icons/fi";
import { useState } from "react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

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
};

function getCardColorStyle(name = "") {
  const key = name.toString().trim().toLowerCase();
  const val = COLOR_HEX[key];
  if (!val) return { backgroundColor: "#d1d5db" };
  return { backgroundColor: val };
}

function defaultSizeForQuickAdd(product) {
  return product.sizes?.[0] ?? "Free Size";
}

export default function ProductCard({ product }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [quickAdded, setQuickAdded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const productId = product._id || product.id;
  const liked = isWishlisted(productId);
  const hasDiscount = product.discount > 0;

  const colorList = (() => {
    if (Array.isArray(product.colors) && product.colors.length) return product.colors;
    if (typeof product.color === "string" && product.color.trim()) {
      return product.color.split(",").map((c) => c.trim()).filter(Boolean);
    }
    return [];
  })();

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
      navigate(`/login?redirect=${redirect}`);
      return;
    }
    addToCart({ ...product, id: productId }, defaultSizeForQuickAdd(product));
    setQuickAdded(true);
    window.setTimeout(() => setQuickAdded(false), 1800);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({ ...product, id: productId });
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden product-card border border-velura-100">
      {/* ── Image ── */}
      <Link to={`/product/${product.id}`} className="relative block aspect-product overflow-hidden bg-velura-100">
        {/* Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}

        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`product-image h-full w-full object-cover ${
            imageLoaded ? "opacity-100" : "opacity-0"
          } ${product.inStock === false ? "grayscale-[40%]" : ""}`}
        />

        {/* Out of Stock overlay */}
        {product.inStock === false && (
          <div className="absolute inset-0 flex items-center justify-center z-10"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}>
            <span className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white rounded-full"
              style={{ background: "rgba(220,38,38,0.9)" }}>
              Out of Stock
            </span>
          </div>
        )}

        {/* Top overlay row */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3 z-20">
          {/* Discount Badge */}
          {hasDiscount ? (
            <span className="badge-dark text-[10px] shadow-lg">
              −{product.discount}%
            </span>
          ) : (
            <span />
          )}

          {/* Wishlist */}
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
            className={`grid h-9 w-9 place-items-center rounded-full shadow-md transition-all duration-300 ${
              liked
                ? "bg-rose-500 text-white scale-110"
                : "bg-white/90 text-velura-600 hover:bg-white hover:text-rose-500 hover:scale-110"
            }`}
            style={{ backdropFilter: "blur(8px)" }}
          >
            <FiHeart size={14} className={liked ? "fill-white" : ""} />
          </button>
        </div>

        {/* Quick Add — desktop hover */}
        {product.inStock !== false && (
          <>
            <div className="absolute inset-x-3 bottom-3 hidden sm:block z-20">
              <button
                type="button"
                onClick={handleQuickAdd}
                className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-lg transition-all duration-400 ${
                  quickAdded
                    ? "bg-green-500 text-white translate-y-0 opacity-100"
                    : "bg-white text-ink-900 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-ink-900 hover:text-white"
                }`}
              >
                {quickAdded ? <><FiCheck size={14} /> Added!</> : <><FiShoppingBag size={14} /> Quick Add</>}
              </button>
            </div>

            {/* Mobile quick add */}
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label="Quick add to bag"
              className={`absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full shadow-md transition-all duration-200 sm:hidden z-20 ${
                quickAdded ? "bg-green-500 text-white" : "bg-white/90 text-ink-900"
              }`}
            >
              {quickAdded ? <FiCheck size={14} /> : <FiShoppingBag size={14} />}
            </button>
          </>
        )}
      </Link>

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <Link to={`/product/${product.id}`} className="block min-w-0">
          <p className="text-overline text-velura-400 mb-1 truncate">{product.category}</p>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-ink-900 group-hover:text-velura-700 transition-colors"
            style={{ minHeight: "2.5em" }}>
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="price-current text-base">₹{product.price?.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="price-original text-xs">₹{product.originalPrice?.toLocaleString()}</span>
          )}
          {hasDiscount && (
            <span className="price-discount text-xs">{product.discount}% off</span>
          )}
        </div>

        {/* Color Swatches + Rating Row */}
        <div className="mt-2.5 flex items-center justify-between">
          {colorList.length >= 1 ? (
            <div className="flex items-center gap-1">
              {colorList.slice(0, 4).map((color, i) => (
                <span
                  key={i}
                  title={color}
                  className="w-3 h-3 rounded-full ring-1 ring-inset ring-black/10 shrink-0"
                  style={getCardColorStyle(color)}
                />
              ))}
              {colorList.length > 4 && (
                <span className="text-[10px] text-velura-400 font-medium">+{colorList.length - 4}</span>
              )}
            </div>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1">
            <FiStar size={10} className="text-gold-500 fill-gold-500" style={{ fill: "var(--color-gold-500)" }} />
            <span className="text-[10px] text-velura-500 font-medium">4.5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
