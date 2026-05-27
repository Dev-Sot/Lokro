'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        setUser(null)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error) {
        console.error('useUser: failed to fetch user record', error)
        setLoading(false)
        return
      }

      setUser(data)
      setLoading(false)
    }

    getUser().catch((err) => {
      console.error('useUser: unexpected error', err)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      getUser().catch((err) => console.error('useUser: auth change error', err))
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
