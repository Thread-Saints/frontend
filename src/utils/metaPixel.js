// Meta Pixel tracking utilities

const fbq = (...args) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args)
  }
}

// Track page views (for SPA route changes)
export const trackPixelPageView = () => {
  fbq('track', 'PageView')
}

// When a user views a product
export const trackPixelViewContent = (product) => {
  fbq('track', 'ViewContent', {
    content_ids: [product._id],
    content_name: product.name,
    content_type: 'product',
    value: product.salePrice || product.price,
    currency: 'INR'
  })
}

// When a user adds to cart
export const trackPixelAddToCart = (product, quantity, size, color) => {
  fbq('track', 'AddToCart', {
    content_ids: [product._id],
    content_name: product.name,
    content_type: 'product',
    value: (product.salePrice || product.price) * quantity,
    currency: 'INR',
    contents: [{ id: product._id, quantity, item_price: product.salePrice || product.price }]
  })
}

// When a user starts checkout
export const trackPixelInitiateCheckout = (items, totalValue) => {
  fbq('track', 'InitiateCheckout', {
    content_ids: items.map(item => item.product?._id || item.productId),
    content_type: 'product',
    num_items: items.length,
    value: totalValue,
    currency: 'INR'
  })
}

// When a purchase is completed
export const trackPixelPurchase = (orderId, totalValue, items) => {
  fbq('track', 'Purchase', {
    content_ids: items.map(item => item.product || item.productId),
    content_type: 'product',
    num_items: items.length,
    value: totalValue,
    currency: 'INR',
    order_id: orderId
  })
}

// When a user adds to wishlist
export const trackPixelAddToWishlist = (product) => {
  fbq('track', 'AddToWishlist', {
    content_ids: [product._id],
    content_name: product.name,
    content_type: 'product',
    value: product.salePrice || product.price,
    currency: 'INR'
  })
}

// When a user searches
export const trackPixelSearch = (searchQuery) => {
  fbq('track', 'Search', {
    search_string: searchQuery
  })
}
