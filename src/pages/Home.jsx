import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import PieVisual from '../components/PieVisual'
import { pies } from '../data/pies'

export default function Home() {
  const featured = pies.filter((p) => p.featured).slice(0, 4)
  const heroPie = pies[0]

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__atmosphere" aria-hidden="true" />
        <div className="hero__content">
          <p className="hero__brand">Pie Riot</p>
          <h1 className="hero__headline">Flavor without manners.</h1>
          <p className="hero__shipping-note">Shipping information: pies arrive chilled overnight.</p>
          <p className="hero__sub">
            Twelve wild pies. Flaky crusts. Overnight chilled shipping to your door.
          </p>
          <div className="hero__actions">
            <Link to="/shop" className="btn btn--primary">
              Shop the riot
            </Link>
            <Link to="/pie/cherry-jubilee" className="btn btn--secondary">
              Meet Cherry Jubilee
            </Link>
          </div>
        </div>
        <div className="hero__visual" aria-hidden="true">
          <div className="hero__glow" />
          <PieVisual colors={heroPie.colors} view="hero" className="hero__pie" />
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>Fan favorites mid-chaos</h2>
          <p>Our most ordered pies — rated, debated, and frequently reordered.</p>
        </div>
        <div className="product-grid">
          {featured.map((pie) => (
            <ProductCard key={pie.id} pie={pie} />
          ))}
        </div>
        <div className="section__cta">
          <Link to="/shop" className="btn btn--primary">
            Browse every pie
          </Link>
        </div>
      </section>

      <section className="section manifesto">
        <div className="manifesto__panel">
          <h2>We bake like we mean it</h2>
          <p>
            Butter gets browned. Fruit gets peppered. Crusts get laminated until they shatter.
            Pie Riot is a flavor-first bakery for people who think dessert should be an event.
          </p>
          <Link to="/about" className="text-link">
            Read the bakery story →
          </Link>
        </div>
      </section>
    </div>
  )
}
