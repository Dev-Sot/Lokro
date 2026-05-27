export const PLATFORM_FEE_PERCENT = 0.1

export const DEFAULT_MAP_CENTER = {
  lng: -74.0721,
  lat: 4.7110,
  zoom: 13,
}

export const PROVIDER_LOCATION_UPDATE_INTERVAL = 5000

export const MAX_PORTFOLIO_IMAGES = 10

export const CATEGORIES = [
  { id: 'plumbing', name: 'Plomería', icon: '🔧', color: '#3B82F6' },
  { id: 'electrical', name: 'Electricidad', icon: '⚡', color: '#F59E0B' },
  { id: 'cleaning', name: 'Limpieza', icon: '🧹', color: '#10B981' },
  { id: 'tutoring', name: 'Tutoría', icon: '📚', color: '#8B5CF6' },
  { id: 'design', name: 'Diseño', icon: '🎨', color: '#EC4899' },
  { id: 'tech', name: 'Técnico', icon: '💻', color: '#6366F1' },
  { id: 'carpentry', name: 'Carpintería', icon: '🪚', color: '#92400E' },
  { id: 'painting', name: 'Pintura', icon: '🖌️', color: '#EF4444' },
  { id: 'gardening', name: 'Jardinería', icon: '🌿', color: '#059669' },
  { id: 'moving', name: 'Mudanza', icon: '📦', color: '#64748B' },
]

export const SERVICE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptado',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
}

export const SERVICE_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export const NOTIFICATION_LABELS: Record<string, string> = {
  NEW_REQUEST: 'Nueva solicitud',
  REQUEST_ACCEPTED: 'Solicitud aceptada',
  PROVIDER_EN_ROUTE: 'Prestador en camino',
  SERVICE_COMPLETED: 'Servicio completado',
  NEW_REVIEW: 'Nueva reseña',
  PAYMENT_RECEIVED: 'Pago recibido',
}

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  userHome: '/home',
  explore: '/explore',
  chat: '/chat',
  notifications: '/notifications',
  userProfile: '/profile',
  providerDashboard: '/provider/dashboard',
  providerRequests: '/provider/requests',
  providerSchedule: '/provider/schedule',
  providerEarnings: '/provider/earnings',
  providerProfile: '/provider/profile',
  adminPanel: '/admin/panel',
} as const
