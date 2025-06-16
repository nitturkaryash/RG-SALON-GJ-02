import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import type { ServiceItem } from '../models/serviceTypes'
import { supabase } from '../utils/supabase/supabaseClient.js'

export function useSubCollectionServices(collectionId?: string, subCollectionId?: string) {
  const queryClient = useQueryClient()

  const { data: services, isLoading, refetch } = useQuery({
    queryKey: ['services', { collectionId, subCollectionId }],
    queryFn: async () => {
      let query = supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true })

      if (subCollectionId) {
        query = query.eq('subcollection_id', subCollectionId)
      } else if (collectionId) {
        query = query.eq('collection_id', collectionId)
      }

      const { data, error } = await query
      if (error) throw error

      return (data || []).map(service => ({
        id: service.id,
        collection_id: service.collection_id,
        subcollection_id: service.subcollection_id,
        name: service.name || 'Unnamed Service',
        description: service.description || '',
        price: typeof service.price === 'number' ? service.price : 0,
        duration: typeof service.duration === 'number' ? service.duration : 30,
        active: service.active === true,
        gender: service.gender || null,
        created_at: service.created_at || new Date().toISOString(),
      })) as ServiceItem[]
    },
    enabled: !!(collectionId && subCollectionId),
  })

  const createService = useMutation({
    mutationFn: async (newService: Omit<ServiceItem, 'id' | 'created_at'>) => {
      const serviceId = uuidv4()
      const timestamp = new Date().toISOString()
      const serviceToInsert = {
        id: serviceId,
        collection_id: newService.collection_id,
        subcollection_id: newService.subcollection_id,
        name: newService.name || 'Unnamed Service',
        description: newService.description || '',
        price: typeof newService.price === 'number' ? newService.price : 0,
        duration: typeof newService.duration === 'number' ? newService.duration : 30,
        active: newService.active === true,
        gender: newService.gender || null,
        created_at: timestamp,
        updated_at: timestamp,
      }
      const { data, error } = await supabase
        .from('services')
        .insert(serviceToInsert)
        .select()

      if (error) throw error
      return data?.[0] as ServiceItem
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['services', { collectionId, subCollectionId }] })
      toast.success('Service added successfully')
    },
    onError: (error) => {
      console.error('Error adding service:', error)
      toast.error('Failed to add service')
    },
  })

  const updateService = useMutation({
    mutationFn: async (updates: Partial<ServiceItem> & { id: string }) => {
      const { id, ...serviceUpdates } = updates
      serviceUpdates.updated_at = new Date().toISOString()
      const { data, error } = await supabase
        .from('services')
        .update(serviceUpdates)
        .eq('id', id)
        .select()

      if (error) throw error
      return data?.[0] as ServiceItem
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['services', { collectionId, subCollectionId }] })
      toast.success('Service updated successfully')
    },
    onError: (error) => {
      console.error('Error updating service:', error)
      toast.error('Failed to update service')
    },
  })

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      // Completely delete the service from the database
      const { data, error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
        .select('name')
      if (error) throw error
      // Return deleted service name for toast
      return data?.[0]?.name
    },
    onSuccess: (name) => {
      queryClient.invalidateQueries({ queryKey: ['services', { collectionId, subCollectionId }] })
      toast.success(`Service '${name}' deleted successfully`)
    },
    onError: (error) => {
      console.error('Error deleting service:', error)
      toast.error('Failed to delete service')
    },
  })

  return {
    services: services || [],
    isLoading,
    refetch,
    createService: createService.mutate,
    updateService: updateService.mutate,
    deleteService: deleteService.mutate,
  }
} 