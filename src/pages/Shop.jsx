import { useEffect, useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard'
import { categories, pies } from '../data/pies'
import { trackEvent } from '../utils/pendo'

// Matches the initial maxPrice state below; used to skip the untouched default view.
const DEFAULT_MAX_PRICE = 40
const SEARCH_TRACK_DEBOUNCE_MS = 800

export default function Shop() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('featured')
  const [maxPrice, setMaxPrice] = useState(40)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = pies.filter((pie) => {
      const matchesQuery =
        !q ||
        pie.name.toLowerCase().includes(q) ||
        pie.tagline.toLowerCase().includes(q) ||
        pie.category.toLowerCase().includes(q)
      const matchesCategory = category === 'All' || pie.category === category
      const matchesPrice = pie.price <= maxPrice
      return matchesQuery && matchesCategory && matchesPrice
    })

    list = [...list].sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      if (sort === 'rating') return b.rating - a.rating
      if (sort === 'name') return a.name.localeCompare(b.name)
      return Number(b.featured) - Number(a.featured)
    })

    return list
  }, [query, category, sort, maxPrice])

  // Debounced so typing a query reports one search once the user pauses,
  // rather than one event per keystroke. The untouched default view is not a search.
  const resultsCount = filtered.length
  useEffect(() => {
    const trimmedQuery = query.trim()
    const isDefaultView =
      !trimmedQuery &&
      category === 'All' &&
      sort === 'featured' &&
      maxPrice === DEFAULT_MAX_PRICE
    if (isDefaultView) return undefined

    const timer = window.setTimeout(() => {
      trackEvent('shop_search_performed', {
        query: trimmedQuery.slice(0, 100),
        category,
        sort,
        maxPrice,
        resultsCount,
        totalCount: pies.length,
      })
    }, SEARCH_TRACK_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [query, category, sort, maxPrice, resultsCount])

  return (
    <div className="page shop">
      <header className="page-header">
        <h1>The Pie Menu</h1>
        <p>Search, filter, and find the flavor that starts the argument at your table.</p>
      </header>

      <div className="shop__toolbar">
        <label className="field shop__search">
          <span>Search</span>
          <input
            type="search"
            placeholder="Cherry, lemon, savory..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="All">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="rating">Highest rated</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>

        <label className="field">
          <span>Max price: ${maxPrice}</span>
          <input
            type="range"
            min="20"
            max="40"
            step="1"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
        </label>
      </div>

      <p className="shop__count">
        Showing {filtered.length} of {pies.length} pies
      </p>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h2>No pies matched that filter</h2>
          <p>Try clearing search or bumping up the price ceiling.</p>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              setQuery('')
              setCategory('All')
              setMaxPrice(40)
            }}
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((pie) => (
            <ProductCard key={pie.id} pie={pie} />
          ))}
        </div>
      )}
    </div>
  )
}
