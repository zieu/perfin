import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase-client'

export const useUser = () => {
  return useQuery({
    queryKey: ['supabaseUser'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw new Error('Not authenticated')
      return data.user
    },
    staleTime: Infinity,
    retry: false,
  })
}
