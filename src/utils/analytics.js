import ReactGA from 'react-ga4';

// Initialize Google Analytics
export const initGA = (measurementId) => {
  if (!measurementId) {
    console.warn('Google Analytics Measurement ID not provided');
    return;
  }

  ReactGA.initialize(measurementId, {
    gaOptions: {
      anonymizeIp: true, // Anonymize IP addresses for privacy
    },
  });
};

// Track page views
export const trackPageView = (path) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

// Track custom events
export const trackEvent = (category, action, label = '', value = 0) => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

// Track specific e-commerce events
export const trackAddToCart = (productId, productName, price) => {
  ReactGA.event({
    category: 'E-commerce',
    action: 'Add to Cart',
    label: productName,
    value: price,
  });
};

export const trackRemoveFromCart = (productId, productName) => {
  ReactGA.event({
    category: 'E-commerce',
    action: 'Remove from Cart',
    label: productName,
  });
};

export const trackPurchase = (orderId, totalAmount, items) => {
  ReactGA.event({
    category: 'E-commerce',
    action: 'Purchase',
    label: orderId,
    value: totalAmount,
  });
};

export const trackAddToWishlist = (productId, productName) => {
  ReactGA.event({
    category: 'E-commerce',
    action: 'Add to Wishlist',
    label: productName,
  });
};

export const trackProductView = (productId, productName) => {
  ReactGA.event({
    category: 'E-commerce',
    action: 'View Product',
    label: productName,
  });
};

export const trackCheckoutStart = (cartValue) => {
  ReactGA.event({
    category: 'E-commerce',
    action: 'Checkout Started',
    value: cartValue,
  });
};
