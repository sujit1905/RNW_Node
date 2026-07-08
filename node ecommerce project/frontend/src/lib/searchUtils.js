/** Category chip vs debounced query (jewelry typo, plural stems). */
function stemWord(w) {
  return w.replace(/ies$/, 'y').replace(/es$/, '').replace(/s$/, '');
}

export function categorySearchMatch(categoryName, queryNorm) {
  if (!categoryName || queryNorm === null || queryNorm === undefined) return false;
  const q = String(queryNorm).trim().toLowerCase();
  if (!q) return false;
  const n = String(categoryName).trim().toLowerCase();
  if (q.length === 1) return n.startsWith(q);
  if (n.includes(q) || q.includes(n)) return true;
  if (n.includes('jewel') && q.startsWith('jew')) return true;
  const ns = stemWord(n);
  const qs = stemWord(q);
  return (
    qs.length >= 1 &&
    ns.length >= 2 &&
    (ns.includes(qs) || qs.includes(ns) || ns.startsWith(qs))
  );
}

/** Normalized product text search (matches Category page behavior). */
export function productMatchesSearch(product, queryNorm) {
  if (!queryNorm) return true;
  const hay = [
    product.name,
    product.category,
    product.description,
    product.fabric,
    product.color,
    product._id,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (hay.includes(queryNorm)) return true;
  const tokens = queryNorm.split(/\s+/).filter(Boolean);
  if (tokens.length <= 1) return hay.includes(queryNorm);
  return tokens.every((t) => hay.includes(t));
}
