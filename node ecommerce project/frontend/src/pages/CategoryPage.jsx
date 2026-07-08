import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import {
  FiFilter, FiX, FiGrid, FiList, FiChevronDown, FiChevronUp,
  FiSearch, FiSliders,
} from "react-icons/fi";
import { productMatchesSearch } from "../lib/searchUtils";
import { API_BASE_URL } from "../lib/api";

/* ── Filter Panel Content ── */
function FilterContent({ categoryNames, selectedCategory, setSelectedCategory, onClose, sortBy, setSortBy, priceRange, setPriceRange, maxPrice }) {
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [sortOpen, setSortOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  const sortOptions = [
    { value: "default", label: "Recommended" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "discount", label: "Best Discount" },
    { value: "newest", label: "Newest First" },
  ];

  return (
    <div className="divide-y divide-velura-100">
      {/* Sort */}
      <div className="p-4">
        <button
          className="w-full flex items-center justify-between text-sm font-semibold text-ink-900 mb-3"
          onClick={() => setSortOpen(!sortOpen)}
        >
          Sort By {sortOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        </button>
        {sortOpen && (
          <div className="space-y-1">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setSortBy(opt.value); onClose?.(); }}
                className={`filter-item w-full text-left ${sortBy === opt.value ? "active" : ""}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category */}
      <div className="p-4">
        <button
          className="w-full flex items-center justify-between text-sm font-semibold text-ink-900 mb-3"
          onClick={() => setCategoryOpen(!categoryOpen)}
        >
          Category {categoryOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        </button>
        {categoryOpen && (
          <div className="space-y-1 max-h-60 overflow-y-auto scroll-hide">
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); onClose?.(); }}
                className={`filter-item w-full text-left ${selectedCategory.toLowerCase() === cat.toLowerCase() ? "active" : ""}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      {maxPrice > 0 && (
        <div className="p-4">
          <button
            className="w-full flex items-center justify-between text-sm font-semibold text-ink-900 mb-3"
            onClick={() => setPriceOpen(!priceOpen)}
          >
            Price Range {priceOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </button>
          {priceOpen && (
            <div>
              <div className="flex justify-between text-xs text-velura-500 mb-3">
                <span>₹{priceRange[0].toLocaleString()}</span>
                <span>₹{priceRange[1].toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={0}
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-ink-900"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CategoryPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 100000]);

  const rawCat = searchParams.get("cat");
  const decodedInitial = rawCat ? decodeURIComponent(rawCat) : "All";
  const [selectedCategory, setSelectedCategory] = useState(decodedInitial);

  const [products, setProducts] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products`),
          fetch(`${API_BASE_URL}/categories`),
        ]);
        if (!productsRes.ok) throw new Error("Failed to fetch products");
        if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
        const [productsData, categoriesData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
        ]);
        setProducts(productsData.map((p) => ({ ...p, id: p._id })));
        setApiCategories(categoriesData);
        // Set max price
        const max = Math.max(...productsData.map((p) => p.price || 0), 10000);
        setPriceRange([0, max]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const raw = searchParams.get("cat");
    const decoded = raw ? decodeURIComponent(raw) : "All";
    setSelectedCategory(decoded);
  }, [searchParams]);

  const searchNorm = (searchParams.get("search") || "").trim().toLowerCase();
  const maxPrice = Math.max(...products.map((p) => p.price || 0), 10000);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    const tag = searchParams.get("tag");
    if (tag) filtered = filtered.filter((p) => p.tag === tag);
    if (selectedCategory !== "All")
      filtered = filtered.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    if (searchNorm) filtered = filtered.filter((p) => productMatchesSearch(p, searchNorm));
    // Price range
    filtered = filtered.filter((p) => (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case "price-asc": filtered = [...filtered].sort((a, b) => a.price - b.price); break;
      case "price-desc": filtered = [...filtered].sort((a, b) => b.price - a.price); break;
      case "discount": filtered = [...filtered].sort((a, b) => (b.discount || 0) - (a.discount || 0)); break;
      case "newest": filtered = [...filtered].reverse(); break;
      default: break;
    }

    return filtered;
  }, [selectedCategory, searchParams, products, searchNorm, sortBy, priceRange]);

  const searchDisplay = (searchParams.get("search") || "").trim();
  const tagParam = searchParams.get("tag");

  const pageHeading =
    tagParam === "trending" ? "Trending Now 🔥" :
    tagParam === "new-arrival" ? "New Arrivals ✨" :
    tagParam === "best-seller" ? "Best Sellers ⭐" :
    searchDisplay ? `Results for "${searchDisplay}"` :
    selectedCategory !== "All" ? selectedCategory : "All Products";

  const categoryNames = ["All", ...apiCategories.map((c) => c.name)];

  return (
    <div className="min-h-screen" style={{ background: "var(--color-velura-50)" }}>
      {/* ── Page Header ── */}
      <div className="bg-ink-900 py-10 sm:py-16">
        <div className="container-main">
          <p className="section-label text-gold-500 mb-2">
            {tagParam ? "Collection" : selectedCategory !== "All" ? "Category" : "Shop"}
          </p>
          <h1
            className="text-white font-bold mb-3"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              letterSpacing: "-0.025em",
            }}
          >
            {pageHeading}
          </h1>
          {!loading && (
            <p className="text-white/40 text-sm">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
      </div>

      <div className="container-main py-6 sm:py-8 lg:py-10">
        <div className="flex gap-6 lg:gap-8">

          {/* ── Sidebar Filters (Desktop) ── */}
          <aside className="hidden lg:block w-60 xl:w-64 shrink-0">
            <div className="sticky top-24 rounded-2xl bg-white border border-velura-100 overflow-hidden">
              <div className="px-4 py-4 border-b border-velura-100">
                <div className="flex items-center gap-2">
                  <FiSliders size={16} className="text-velura-500" />
                  <h2 className="font-semibold text-sm text-ink-900">Filters</h2>
                </div>
              </div>
              <FilterContent
                categoryNames={categoryNames}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                sortBy={sortBy}
                setSortBy={setSortBy}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                maxPrice={maxPrice}
              />
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-velura-200 rounded-xl text-sm font-medium text-ink-700 hover:bg-velura-50 transition-all"
                  id="filter-toggle"
                >
                  <FiFilter size={14} />
                  Filters
                </button>

                {/* Active filters chips */}
                {selectedCategory !== "All" && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-900 text-white rounded-full text-xs font-medium">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory("All")} className="hover:text-white/60">
                      <FiX size={12} />
                    </button>
                  </span>
                )}
                {searchDisplay && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-velura-100 text-ink-700 rounded-full text-xs font-medium">
                    "{searchDisplay}"
                    <button onClick={() => navigate("/category")} className="hover:text-ink-400">
                      <FiX size={12} />
                    </button>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {/* Grid/List Toggle */}
                <div className="hidden sm:flex items-center rounded-xl border border-velura-200 overflow-hidden bg-white">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-ink-900 text-white" : "text-velura-500 hover:text-ink-900"}`}
                    aria-label="Grid view"
                  >
                    <FiGrid size={15} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-ink-900 text-white" : "text-velura-500 hover:text-ink-900"}`}
                    aria-label="List view"
                  >
                    <FiList size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid / List */}
            {loading ? (
              <div className={`grid gap-4 sm:gap-5 ${viewMode === "grid" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden bg-white">
                    <div className={`shimmer ${viewMode === "list" ? "h-40" : "aspect-product"}`} />
                    <div className="p-4 space-y-2">
                      <div className="shimmer h-3 rounded w-3/4" />
                      <div className="shimmer h-3 rounded w-1/2" />
                      <div className="shimmer h-4 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 rounded-2xl bg-white border border-velura-100">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="font-semibold text-ink-900 mb-2 text-lg" style={{ fontFamily: "var(--font-display)" }}>
                  Connection Error
                </h3>
                <p className="text-velura-500 text-sm">{error}</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredProducts.map((product, i) => (
                    <div
                      key={product.id}
                      className="opacity-0-init animate-fade-up"
                      style={{ animationDelay: `${Math.min(i, 8) * 50}ms`, animationFillMode: "forwards" }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map((product, i) => (
                    <div
                      key={product.id}
                      className="opacity-0-init animate-fade-up bg-white rounded-2xl border border-velura-100 flex gap-4 p-4 hover:shadow-md transition-shadow"
                      style={{ animationDelay: `${Math.min(i, 6) * 40}ms`, animationFillMode: "forwards" }}
                    >
                      <div className="w-24 h-28 rounded-xl overflow-hidden shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col justify-between py-0.5 min-w-0 flex-1">
                        <div>
                          <p className="text-overline text-velura-400 mb-1">{product.category}</p>
                          <h3 className="font-medium text-ink-900 text-sm line-clamp-2">{product.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="price-current text-base">₹{product.price?.toLocaleString()}</span>
                          {product.originalPrice && (
                            <span className="price-original text-xs">₹{product.originalPrice?.toLocaleString()}</span>
                          )}
                          {product.discount > 0 && (
                            <span className="price-discount text-xs">{product.discount}% off</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Empty State */
              <div className="text-center py-20 rounded-2xl bg-white border border-velura-100 animate-fade-in">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 bg-velura-100">
                  <FiSearch size={24} className="text-velura-400" />
                </div>
                <h3 className="font-semibold text-ink-900 text-lg mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  Nothing found
                </h3>
                <p className="text-velura-500 text-sm mb-6 max-w-xs mx-auto">
                  {searchDisplay
                    ? `No results for "${searchDisplay}". Try a different keyword.`
                    : "Try adjusting your filters or browse all products."}
                </p>
                <button
                  onClick={() => { setSelectedCategory("All"); navigate("/category"); }}
                  className="btn-primary text-xs px-6 py-3"
                >
                  Browse All Products
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {showFilters && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowFilters(false)}
            style={{ backdropFilter: "blur(4px)" }}
          />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-full bg-white shadow-2xl animate-slide-in overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-velura-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <FiSliders size={16} className="text-velura-500" />
                <h3 className="font-semibold text-ink-900">Filters</h3>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-xl hover:bg-velura-50 text-velura-500 hover:text-ink-900 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>
            <FilterContent
              categoryNames={categoryNames}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onClose={() => setShowFilters(false)}
              sortBy={sortBy}
              setSortBy={setSortBy}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              maxPrice={maxPrice}
            />
          </div>
        </>
      )}
    </div>
  );
}
