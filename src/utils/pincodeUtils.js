// Utility functions for pincode-based region detection

// Delhi-NCR pincode ranges
const DELHI_NCR_PINCODE_RANGES = [
  // Delhi
  { start: 110001, end: 110097 },
  // Gurgaon/Gurugram (Haryana)
  { start: 122001, end: 122505 },
  // Noida (Uttar Pradesh)
  { start: 201301, end: 201318 },
  // Ghaziabad (Uttar Pradesh)
  { start: 201001, end: 201017 },
  // Faridabad (Haryana)
  { start: 121001, end: 121010 },
  // Greater Noida (Uttar Pradesh)
  { start: 201306, end: 201310 }
]

/**
 * Check if a pincode belongs to Delhi-NCR region
 * @param {string|number} pincode - The pincode to check
 * @returns {boolean} - True if pincode is in Delhi-NCR, false otherwise
 */
export const isDelhiNCR = (pincode) => {
  if (!pincode) return false

  // Convert to number and ensure it's a 6-digit pincode
  const pincodeNum = parseInt(pincode.toString().trim())
  if (isNaN(pincodeNum) || pincode.toString().length !== 6) return false

  // Check if pincode falls within any Delhi-NCR range
  return DELHI_NCR_PINCODE_RANGES.some(
    range => pincodeNum >= range.start && pincodeNum <= range.end
  )
}

/**
 * Get region name based on pincode
 * @param {string|number} pincode - The pincode to check
 * @returns {string} - 'delhi-ncr' or 'rest-of-india'
 */
export const getRegionFromPincode = (pincode) => {
  return isDelhiNCR(pincode) ? 'delhi-ncr' : 'rest-of-india'
}

/**
 * Get shipping price based on pincode and order amount
 * @param {string|number} pincode - The pincode to check
 * @param {number} orderAmount - The discounted order amount
 * @returns {number} - Shipping price (0, 90, or 150)
 */
export const getShippingPrice = (pincode, orderAmount) => {
  // Free shipping for orders above Rs.4999
  if (orderAmount > 4999) return 0

  // Otherwise, determine based on region
  return isDelhiNCR(pincode) ? 90 : 150
}
