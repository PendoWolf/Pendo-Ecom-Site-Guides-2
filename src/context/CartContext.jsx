import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { roundMoney, trackEvent } from '../utils/pendo'

const CartContext = createContext(null)
const STORAGE_KEY = 'pieriot-cart'

// eslint-disable-next-line react/prop-types
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Latest items for analytics lookups in handlers without changing their identity.
  const itemsRef = useRef(items)

  useEffect(() => {
    itemsRef.current = items
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product, { size, crust, quantity = 1 }) => {
    const lineId = `${product.id}-${size}-${crust}`
    setItems((prev) => {
      const existing = prev.find((item) => item.lineId === lineId)
      if (existing) {
        return prev.map((item) =>
          item.lineId === lineId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }
      return [
        ...prev,
        {
          lineId,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          colors: product.colors,
          size,
          crust,
          quantity,
        },
      ]
    })
  }

  const updateQuantity = (lineId, quantity) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.lineId === lineId ? { ...item, quantity: Math.max(0, quantity) } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (lineId) => {
    const currentItems = itemsRef.current
    const removed = currentItems.find((item) => item.lineId === lineId)
    if (removed) {
      // Identifies which pie/variant was dropped from the cart.
      trackEvent('cart_item_removed', {
        productId: removed.productId,
        slug: removed.slug,
        size: removed.size,
        crust: removed.crust,
        quantity: removed.quantity,
        line_value: roundMoney(removed.price * removed.quantity),
        remaining_cart_count: currentItems
          .filter((item) => item.lineId !== lineId)
          .reduce((sum, item) => sum + item.quantity, 0),
      })
    }
    setItems((prev) => prev.filter((item) => item.lineId !== lineId))
  }

  const clearCart = () => setItems([])

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return {
      items,
      count,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
