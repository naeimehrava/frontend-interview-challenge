export interface PricingPlan {
  id: string
  name: string
  price: string
  period: string
  description: string
  featured?: boolean
}

export const PRICING_PLANS: readonly PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$19',
    period: '/mo',
    description: 'Perfect for freelancers and side projects needing essential features.',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    period: '/mo',
    description: 'Ideal for growing teams requiring advanced analytics and priority support.',
    featured: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99',
    period: '/mo',
    description: 'Custom solutions with dedicated support and unlimited scale.',
  },
]
