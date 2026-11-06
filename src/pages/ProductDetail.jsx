import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { trackEvent } from '../analytics/track'
import PieVisual from '../components/PieVisual'
import { crusts, formatPrice, getPieBySlug, sizes } from '../data/pies'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { slug } = useParams()
  const pie = getPieBySlug(slug)
  const { addItem } = useCart()
  const [size, setSize] = useState('classic')
  const [crust, setCrust] = useState('flaky')
  const [quantity, setQuantity] = useState(1)
  const [gallery, setGallery] = useState('hero')
  const [added, setAdded] = useState(false)

  const unitPrice = useMemo(() => {
    if (!pie) return 0
    const sizeMeta = sizes.find((s) => s.id === size)
    return Math.round(pie.price * (sizeMeta?.multiplier || 1) * 100) / 100
  }, [pie, size])

  if (!pie) {
    return (
      <div className="page empty-state">
        <h1>That pie escaped the oven</h1>
        <p>We couldn’t find this flavor.</p>
        <Link to="/shop" className="btn btn--primary">
          Back to shop
        </Link>
      </div>
    )
  }

  const handleAdd = () => {
    addItem(
      { ...pie, price: unitPrice },
      { size, crust, quantity },
    )
    // Which pie and variant was added, with the computed unit price
    trackEvent('item_added_to_cart', {
      productId: pie.id,
      slug: pie.slug,
      category: pie.category,
      size,
      crust,
      quantity,
      unitPrice,
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2200)
  }

  return (
    <div className="page product-detail">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/shop">Shop</Link>
        <span>/</span>
        <span>{pie.name}</span>
      </nav>

      <div className="product-detail__layout">
        <div className="product-detail__gallery">
          <div className="product-detail__stage">
            <PieVisual colors={pie.colors} view={gallery} className="product-detail__pie" />
          </div>
          <div className="product-detail__thumbs" role="tablist" aria-label="Gallery views">
            {pie.gallery.map((view) => (
              <button
                key={view}
                type="button"
                role="tab"
                aria-selected={gallery === view}
                className={gallery === view ? 'is-active' : ''}
                onClick={() => setGallery(view)}
              >
                <PieVisual colors={pie.colors} view={view} />
                <span>{view}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="product-detail__info">
          <p className="eyebrow">{pie.category} · ★ {pie.rating}</p>
          <h1>{pie.name}</h1>
          <p className="product-detail__tagline">{pie.tagline}</p>
          <p className="product-detail__price">{formatPrice(unitPrice)}</p>
          <p>{pie.description}</p>

          <div className="variant-block">
            <p className="variant-block__label">Size</p>
            <div className="chip-row">
              {sizes.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`chip ${size === option.id ? 'is-active' : ''}`}
                  onClick={() => setSize(option.id)}
                >
                  {option.label}
                  <small>{option.inches}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="variant-block">
            <p className="variant-block__label">Crust</p>
            <div className="chip-row">
              {crusts.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`chip ${crust === option.id ? 'is-active' : ''}`}
                  onClick={() => setCrust(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="product-detail__buy">
            <label className="qty">
              <span>Qty</span>
              <input
                type="number"
                min="1"
                max="12"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
            </label>
            <button type="button" className="btn btn--primary" onClick={handleAdd}>
              {added ? 'Added to cart!' : 'Add to cart'}
            </button>
          </div>

          <ul className="product-detail__facts">
            <li>
              <strong>Serve</strong> {pie.heat}
            </li>
            <li>
              <strong>Ingredients</strong> {pie.ingredients.join(', ')}
            </li>
            <li>
              <Link to="/warning" className="text-link">
                Read allergen warning
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
