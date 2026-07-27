import { Link } from "react-router-dom";
import PieVisual from "../components/PieVisual";
import { formatPrice, sizes, crusts } from "../data/pies";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 8;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="page empty-state">
        <h1>Your cart is empty</h1>
        <p>The oven is hot. The pies are waiting.</p>
        <Link to="/shop" className="btn btn--primary">
          Shop pies
        </Link>
      </div>
    );
  }

  return (
    <div className="page cart">
      <header className="page-header">
        <h1>Your cart</h1>
        <p>Review sizes, crusts, and quantities before checkout.</p>
      </header>

      <div className="cart__layout">
        <ul className="cart__list">
          {items.map((item) => {
            const sizeLabel =
              sizes.find((s) => s.id === item.size)?.label || item.size;
            const crustLabel =
              crusts.find((c) => c.id === item.crust)?.label || item.crust;
            return (
              <li key={item.lineId} className="cart__item">
                <Link to={`/pie/${item.slug}`} className="cart__visual">
                  <PieVisual colors={item.colors} view="hero" />
                </Link>
                <div className="cart__details">
                  <h2>
                    <Link to={`/pie/${item.slug}`}>{item.name}</Link>
                  </h2>
                  <p>
                    {sizeLabel} · {crustLabel}
                  </p>
                  <p className="cart__line-price">{formatPrice(item.price)}</p>
                  <div className="cart__controls">
                    <label>
                      Qty
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.lineId,
                            Number(e.target.value) || 1,
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => {
                        window.pendo?.track("cart_item_removed", {
                          productName: item.name,
                          size: item.size,
                          crust: item.crust,
                          quantity: item.quantity,
                          price: item.price,
                          remainingCartItems: items.length - 1,
                        });
                        removeItem(item.lineId);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="cart__item-total">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </li>
            );
          })}
        </ul>

        <aside className="cart__summary">
          <h2>Order summary</h2>
          <div className="cart__row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="cart__row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          {shipping > 0 && (
            <p className="cart__hint">Free shipping on orders $75+</p>
          )}
          <div className="cart__row cart__row--total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Link to="/checkout" className="btn btn--primary btn--block">
            Proceed to checkout
          </Link>
          <Link to="/shop" className="btn btn--ghost btn--block">
            Keep shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
