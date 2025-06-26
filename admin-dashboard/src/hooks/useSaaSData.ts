import { useQuery } from '@tanstack/react-query'
import { fetchEnhancedClientsData } from '../services/saasApi'

export const useSaaSData = () => {
  return useQuery({
    queryKey: ['saas-data'],
    queryFn: fetchEnhancedClientsData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  })
} 