import { createClient } from '@/lib/supabase/client'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Solo se permiten imágenes JPG, PNG o WebP')
  }
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  validateImageFile(file)
  const supabase = createClient()
  const ext = MIME_TO_EXT[file.type]
  const path = `avatars/${userId}.${ext}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) throw error
  return getPublicUrl('avatars', path)
}

export async function uploadPortfolioImage(
  providerId: string,
  file: File
): Promise<string> {
  validateImageFile(file)
  const supabase = createClient()
  const ext = MIME_TO_EXT[file.type]
  const path = `${providerId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('portfolios')
    .upload(path, file, { contentType: file.type })

  if (error) throw error
  return getPublicUrl('portfolios', path)
}

export async function deletePortfolioImage(path: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.storage.from('portfolios').remove([path])
  if (error) throw error
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
