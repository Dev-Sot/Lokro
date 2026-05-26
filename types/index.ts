export type UserRole = 'USER' | 'PROVIDER' | 'ADMIN'

export type ServiceRequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED'

export type ReviewType = 'TO_PROVIDER' | 'TO_USER'

export type NotificationType =
  | 'NEW_REQUEST'
  | 'REQUEST_ACCEPTED'
  | 'PROVIDER_EN_ROUTE'
  | 'SERVICE_COMPLETED'
  | 'NEW_REVIEW'
  | 'PAYMENT_RECEIVED'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar_url: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
}

export interface ProviderProfile {
  id: string
  user_id: string
  bio: string | null
  hourly_rate: number
  available: boolean
  average_rating: number
  total_reviews: number
  created_at: string
  user?: User
  specialties?: ProviderSpecialty[]
  portfolio?: ProviderPortfolio[]
}

export interface ProviderSpecialty {
  id: string
  provider_id: string
  category_id: string
  category?: Category
}

export interface ProviderPortfolio {
  id: string
  provider_id: string
  image_url: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  description: string | null
}

export interface ServiceRequest {
  id: string
  user_id: string
  provider_id: string
  category_id: string
  description: string
  address: string
  latitude: number
  longitude: number
  requested_date: string
  status: ServiceRequestStatus
  estimated_price: number | null
  final_price: number | null
  created_at: string
  user?: User
  provider?: ProviderProfile & { user: User }
  category?: Category
}

export interface ServiceStatusHistory {
  id: string
  request_id: string
  status: ServiceRequestStatus
  created_by: string
  created_at: string
}

export interface ProviderLocation {
  id: string
  provider_id: string
  latitude: number
  longitude: number
  updated_at: string
}

export interface Message {
  id: string
  request_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
  sender?: User
}

export interface Review {
  id: string
  request_id: string
  author_id: string
  target_id: string
  rating: number
  comment: string | null
  type: ReviewType
  created_at: string
  author?: User
}

export interface Payment {
  id: string
  request_id: string
  amount: number
  platform_fee: number
  provider_amount: number
  stripe_payment_intent: string | null
  status: PaymentStatus
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  created_at: string
}

export interface ProviderMapMarker {
  id: string
  user_id: string
  name: string
  avatar_url: string | null
  latitude: number
  longitude: number
  available: boolean
  average_rating: number
  hourly_rate: number
  specialties: string[]
}

export interface ProviderFilters {
  category?: string
  maxDistance?: number
  maxPrice?: number
  minRating?: number
}