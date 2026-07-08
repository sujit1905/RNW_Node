import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { FiShoppingBag, FiUser, FiHeart, FiHome, FiGrid, FiSearch, FiX, FiMenu, FiPackage, FiLogOut } from "react-icons/fi";
import { API_BASE_URL } from "../lib/api";
import { productMatchesSearch } from "../lib/searchUtils";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { allCartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isLoggedIn, logout } = useAuth();
  const navAvatar = user?.profileImage === "none" ? null : user?.profileImage || user?.avatar;
  const hasAvatar =
    navAvatar &&
    typeof navAvatar === "string" &&
    navAvatar.trim() !== "" &&
    navAvatar !== "null" &&
    navAvatar !== "undefined" &&
    navAvatar !== "none";

  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Fetch products once for live search
  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then((r) => r.json())
      .then((data) => setAllProducts(data.map((p) => ({ ...p, id: p._id }))))
      .catch(() => {});
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Search suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const norm = searchQuery.trim().toLowerCase();
    const results = allProducts
      .filter((p) => productMatchesSearch(p, norm))
      .slice(0, 6);
    setSuggestions(results);
  }, [searchQuery, allProducts]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
    setSuggestions([]);
    setSearchQuery("");
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/category?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSuggestions([]);
    setSearchQuery("");
  };

  const handleSuggestionClick = (product) => {
    navigate(`/product/${product.id}`);
    setSearchOpen(false);
    setSuggestions([]);
    setSearchQuery("");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/category", label: "Shop" },
  ];

  const popularSearches = ["Sarees", "Kurtis", "Lehengas", "Western Wear"];

  return (
    <>
      {/* ─── Main Navbar ─── */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "glass-dark shadow-xl"
            : "bg-[#0d0d0d]"
        }`}
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="container-main">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">

            {/* ── Logo ── */}
            <Link to="/" className="shrink-0 group" id="logo-link" aria-label="VELURA Home">
              <div className="flex flex-col items-start">
                <span
                  className="logo-velura text-white"
                  style={{ fontSize: "1.375rem", letterSpacing: "0.18em" }}
                >
                  VELURA
                </span>
                <span
                  className="text-gold block"
                  style={{ fontSize: "0.5rem", letterSpacing: "0.25em", marginTop: "-2px" }}
                >
                  WEAR THE MOMENT
                </span>
              </div>
            </Link>

            {/* ── Center Nav Links (desktop) ── */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive =
                  link.to === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative text-sm font-medium tracking-wide transition-colors duration-300 ${
                      isActive ? "text-white" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span
                        className="absolute -bottom-1 left-0 h-px rounded-full"
                        style={{
                          width: "100%",
                          background: "var(--color-gold-400)",
                          animation: "drawLine 0.3s ease forwards",
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="relative rounded-full p-2.5 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                aria-label="Search"
                id="search-btn"
              >
                <FiSearch size={19} />
              </button>

              {/* Wishlist */}
              <Link
                to={isLoggedIn ? "/wishlist" : "/login?redirect=%2Fwishlist"}
                className="relative rounded-full p-2.5 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                id="wishlist-link"
                aria-label="Wishlist"
              >
                <FiHeart size={19} />
                {wishlistCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white shadow-sm animate-scale-in"
                    style={{ background: "var(--color-gold-500)" }}>
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative rounded-full p-2.5 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                id="cart-link"
                aria-label="Cart"
              >
                <FiShoppingBag size={19} />
                {allCartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white shadow-sm animate-scale-in"
                    style={{ background: "var(--color-gold-500)" }}>
                    {allCartCount}
                  </span>
                )}
              </Link>

              {/* Auth Area — Desktop */}
              {isLoggedIn ? (
                <div className="hidden sm:block relative ml-1" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-white/20"
                    id="user-menu-btn"
                  >
                    {hasAvatar ? (
                      <img src={navAvatar} alt="" className="h-6 w-6 rounded-full object-cover ring-2 ring-white/20 shrink-0" />
                    ) : (
                      <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                        style={{ background: "var(--color-gold-500)", color: "#fff" }}>
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    <span className="max-w-[90px] truncate">{user?.name?.split(" ")[0] || "Account"}</span>
                  </button>

                  {/* User Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white shadow-2xl border border-velura-100 overflow-hidden animate-scale-in origin-top-right z-50">
                      <div className="px-4 py-3 border-b border-velura-100">
                        <p className="text-xs font-semibold text-ink-900 truncate">{user?.name}</p>
                        <p className="text-xs text-velura-400 truncate mt-0.5">{user?.email}</p>
                      </div>
                      <div className="py-1.5">
                        {user?.role === "admin" && (
                          <Link to="/admin" id="admin-link"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 hover:bg-velura-50 hover:text-ink-900 transition-colors">
                            <FiGrid size={15} />
                            Admin Panel
                          </Link>
                        )}
                        <Link to="/dashboard" id="dashboard-link"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 hover:bg-velura-50 hover:text-ink-900 transition-colors">
                          <FiUser size={15} />
                          My Account
                        </Link>
                        <Link to="/dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 hover:bg-velura-50 hover:text-ink-900 transition-colors">
                          <FiPackage size={15} />
                          My Orders
                        </Link>
                        <Link to="/wishlist"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 hover:bg-velura-50 hover:text-ink-900 transition-colors">
                          <FiHeart size={15} />
                          Wishlist
                        </Link>
                      </div>
                      <div className="border-t border-velura-100 py-1.5">
                        <button onClick={logout} id="logout-btn"
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger-light transition-colors">
                          <FiLogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" id="login-link"
                  className="hidden sm:inline-flex items-center gap-2 ml-1 btn-gold text-xs py-2.5 px-5">
                  <FiUser size={15} />
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden rounded-full p-2.5 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Dropdown Menu ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden glass-dark border-t border-white/5 animate-fade-in">
            <div className="container-main py-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === link.to
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}>
                  {link.label}
                </Link>
              ))}
              {isLoggedIn ? (
                <>
                  <Link to="/dashboard"
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all">
                    My Account
                  </Link>
                  <button onClick={logout}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger-light/10 transition-all">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login"
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-gold hover:bg-white/5 transition-all">
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ─── Full-screen Search Overlay ─── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] flex flex-col"
          style={{ background: "rgba(10,10,10,0.96)", backdropFilter: "blur(20px)" }}
        >
          <div className="container-main pt-6 pb-4" ref={searchRef}>
            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="flex-1 relative">
                <FiSearch
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search for products, categories..."
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-white/30 text-lg focus:outline-none focus:border-white/30 transition-colors"
                  id="search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    <FiX size={18} />
                  </button>
                )}
              </form>
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSuggestions([]);
                  setSearchQuery("");
                }}
                className="text-white/60 hover:text-white p-2 transition-colors"
                aria-label="Close search"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Search Results */}
            {suggestions.length > 0 && (
              <div className="mt-4 space-y-1 animate-fade-in">
                <p className="text-xs text-white/30 font-semibold uppercase tracking-widest px-2 mb-3">
                  Results
                </p>
                {suggestions.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="w-12 h-14 rounded-xl overflow-hidden shrink-0 bg-white/10">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm line-clamp-1">{product.name}</p>
                      <p className="text-white/40 text-xs mt-0.5">{product.category}</p>
                    </div>
                    <div className="ml-auto shrink-0">
                      <span className="text-white font-semibold text-sm">₹{product.price?.toLocaleString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {searchQuery.trim() && suggestions.length === 0 && (
              <div className="mt-8 text-center animate-fade-in">
                <p className="text-white/40 text-sm">No results for <span className="text-white/70">"{searchQuery}"</span></p>
                <p className="text-white/30 text-xs mt-1">Try a different keyword or browse categories</p>
              </div>
            )}

            {/* Popular Searches */}
            {!searchQuery && (
              <div className="mt-8 animate-fade-in">
                <p className="text-xs text-white/30 font-semibold uppercase tracking-widest px-2 mb-4">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        navigate(`/category?search=${encodeURIComponent(term)}`);
                        setSearchOpen(false);
                        setSuggestions([]);
                        setSearchQuery("");
                      }}
                      className="px-4 py-2 rounded-full text-sm font-medium text-white/60 hover:text-white border border-white/10 hover:border-white/30 transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Mobile Bottom Nav ─── */}
      {isLoggedIn && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
          style={{
            background: "rgba(8, 8, 8, 0.95)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 -4px 30px rgba(0,0,0,0.5)",
          }}
        >
          <div className="flex items-stretch" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
            {[
              { icon: FiHome, label: "Home", path: "/" },
              { icon: FiGrid, label: "Shop", path: "/category" },
              {
                icon: FiHeart,
                label: "Saved",
                path: "/wishlist",
                badge: wishlistCount,
              },
              {
                icon: FiShoppingBag,
                label: "Cart",
                path: "/cart",
                badge: allCartCount,
              },
              {
                icon: FiUser,
                label: user?.role === "admin" ? "Admin" : "Account",
                path: user?.role === "admin" ? "/admin" : "/dashboard",
              },
            ].map((item) => {
              const checkPath = item.path;
              const isActive =
                (checkPath === "/" && location.pathname === "/") ||
                (checkPath !== "/" && location.pathname.startsWith(checkPath));

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  style={{ flex: 1 }}
                  className="flex flex-col items-center justify-center pt-3 pb-2.5 gap-1 relative"
                >
                  {isActive && (
                    <span
                      className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                      style={{ background: "var(--color-gold-500)" }}
                    />
                  )}
                  <item.icon
                    size={20}
                    style={{
                      color: isActive ? "var(--color-gold-400)" : "rgba(255,255,255,0.45)",
                      transition: "color 0.2s",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "var(--color-gold-400)" : "rgba(255,255,255,0.45)",
                      letterSpacing: "0.04em",
                      lineHeight: 1,
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {item.label}
                  </span>
                  {item.badge > 0 && (
                    <span
                      className="absolute top-2 text-white font-bold"
                      style={{
                        right: "calc(50% - 18px)",
                        background: "var(--color-gold-500)",
                        borderRadius: 99,
                        minWidth: 14,
                        height: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 8,
                        padding: "0 3px",
                        lineHeight: 1,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
