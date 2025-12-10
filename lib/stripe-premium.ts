// Premium Resources Stripe configuration
export const PREMIUM_RESOURCES_PRODUCT_ID = process.env.STRIPE_PREMIUM_PRODUCT_ID || "prod_TZglRqimBlJX3B"
export const PREMIUM_RESOURCES_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID || "price_1ScXNxBBMG3jeaJnAqITsVpg"
export const PREMIUM_RESOURCES_AMOUNT = 499 // in cents
export const PREMIUM_RESOURCES_CURRENCY = "usd"

// 7-day grace period for failed payments
export const GRACE_PERIOD_DAYS = 7

// 1-month free trial for tenants
export const TENANT_TRIAL_DAYS = 30
