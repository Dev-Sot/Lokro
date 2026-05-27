import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `avatars/${userId}.${ext}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })

  if (error) throw error
  return getPublicUrl('avatars', path)
}

export async function uploadPortfolioImage(
  providerId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${providerId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('portfolios')
    .upload(path, file)

  if (error) throw error
  return getPublicUrl('portfolios', path)
}

export async function deletePortfolioImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from('portfolios').remove([path])
  if (error) throw error
}

export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
