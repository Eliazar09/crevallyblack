import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  ready: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => {
  // Bootstrap: read current session on first load
  supabase.auth.getSession().then(({ data }) => {
    set({ user: data.session?.user ?? null, ready: true })
  })

  // Listen for future auth changes
  supabase.auth.onAuthStateChange((_event, session) => {
    set({ user: session?.user ?? null, ready: true })
  })

  return {
    user: null,
    ready: false,

    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error?.message ?? null }
    },

    async signOut() {
      await supabase.auth.signOut()
      set({ user: null })
    },
  }
})
