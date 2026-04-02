




// // lib/stores/subscriber/store.ts

// import { create } from "zustand"
// import { persist } from "zustand/middleware"
// import { toast } from "sonner"
// import { useWorkspaceStore } from "../workspace"
// import {
//   CreateSubscriberData,
//   Subscriber,
//   SubscriberFilters,
//   SubscriberStats,
//   UpdateSubscriberData,
// } from "./type"

// const apiFetch = async (url: string, options: RequestInit = {}) => {
//   const response = await fetch(url, {
//     ...options,
//     credentials: "include",
//     headers: {
//       "Content-Type": "application/json",
//       ...options.headers,
//     },
//   })

//   const data = await response.json().catch(() => ({}))

//   if (!response.ok) {
//     if (response.status === 401) {
//       throw new Error("unauthorized")
//     }

//     throw new Error(data.message || data.error || "Request failed")
//   }

//   return data
// }

// interface SubscriberState {
//   subscribers: Subscriber[]
//   subscriberCount: number
//   currentSubscriber: Subscriber | null
//   stats: SubscriberStats | null

//   isLoading: boolean
//   error: string | null
 
//   totalCount: number
//   currentPage: number
//   pageSize: number

//   fetchSubscriberCount: () => Promise<number>
//   getAllSubscribers: (
//     status?: string
//   ) => Promise<{ subscribers: Subscriber[]; count: number }>

//   fetchSubscribers: (filters?: SubscriberFilters) => Promise<void>
//   fetchSubscriber: (id: string) => Promise<Subscriber | null>

//   createSubscriber: (data: CreateSubscriberData) => Promise<Subscriber | null>
//   updateSubscriber: (
//     id: string,
//     data: UpdateSubscriberData
//   ) => Promise<Subscriber | null>

//   deleteSubscriber: (id: string) => Promise<void>
//   bulkDeleteSubscribers: (ids: string[]) => Promise<void>

//   subscribe: (
//     email: string,
//     name?: string,
//     source?: string
//   ) => Promise<Subscriber | null>

//   unsubscribe: (email: string) => Promise<void>
//   confirmSubscription: (email: string) => Promise<void>

//   fetchStats: () => Promise<void>

//   clearError: () => void
//   setCurrentSubscriber: (subscriber: Subscriber | null) => void
//   clearSubscribers: () => void
// }

// export const useSubscriberStore = create<SubscriberState>()(
//   persist(
//     (set, get) => ({
//       subscribers: [],
//       subscriberCount: 0,
//       currentSubscriber: null,
//       stats: null,

//       isLoading: false,
//       error: null,

//       totalCount: 0,
//       currentPage: 1,
//       pageSize: 20,

//       // =================================
//       // COUNT API
//       // =================================

//       fetchSubscriberCount: async () => {
//         const { currentWorkspace } = useWorkspaceStore.getState()

//         if (!currentWorkspace?.id) {
//           set({ error: "No workspace selected" })
//           return 0
//         }

//         try {
//           const data = await apiFetch(
//             `/api/workspace/${currentWorkspace.id}/subscribers/count`
//           )

//           if (data.success) {
//             const count = data.data?.count || 0

//             set({
//               subscriberCount: count,
//             })

//             return count
//           }

//           return 0
//         } catch (error) {
//           console.error("Fetch subscriber count error:", error)
//           return 0
//         }
//       },

//       // =================================
//       // GET ALL (used for email sending)
//       // =================================

//       getAllSubscribers: async (status = "ACTIVE") => {
//         const { currentWorkspace } = useWorkspaceStore.getState()

//         if (!currentWorkspace?.id) {
//           set({ error: "No workspace selected" })
//           return { subscribers: [], count: 0 }
//         }

//         set({ isLoading: true })

//         try {
//           const queryParams = new URLSearchParams({
//             page: "1",
//             limit: "1000",
//             status,
//           })

//           const data = await apiFetch(
//             `/api/workspace/${currentWorkspace.id}/subscribers?${queryParams}`
//           )

//           if (data.success) {
//             const subscribers = data.data?.data || []
//             const count =
//               data.data?.pagination?.totalCount || subscribers.length

//             set({
//               subscribers,
//               totalCount: count,
//             })

//             return { subscribers, count }
//           }

//           return { subscribers: [], count: 0 }
//         } catch (error) {
//           console.error("Get subscribers error:", error)
//           return { subscribers: [], count: 0 }
//         } finally {
//           set({ isLoading: false })
//         }
//       },

//       // =================================
//       // PAGINATED FETCH
//       // =================================

//       fetchSubscribers: async (filters = {}) => {
//         const { currentWorkspace } = useWorkspaceStore.getState()

//         if (!currentWorkspace?.id) {
//           set({ error: "No workspace selected" })
//           return
//         }

//         const { pageSize, currentPage } = get()

//         set({ isLoading: true, error: null })

//         try {
//           const params: Record<string, string> = {
//             page: (filters.page || currentPage).toString(),
//             limit: (filters.limit || pageSize).toString(),
//           }

//           if (filters.status) params.status = filters.status
//           if (filters.search) params.search = filters.search

//           const queryParams = new URLSearchParams(params)

//           const data = await apiFetch(
//             `/api/workspace/${currentWorkspace.id}/subscribers?${queryParams}`
//           )

//           if (data.success) {
//             const subscribers = data.data?.data || []
//             const pagination = data.data?.pagination || {}

//             set({
//               subscribers,
//               totalCount: pagination.totalCount || 0,
//               currentPage: pagination.page || currentPage,
//             })
//           }
//         } catch (error) {
//           console.error("Fetch subscribers error:", error)
//           set({ error: (error as Error).message })
//           toast.error("Failed to fetch subscribers")
//         } finally {
//           set({ isLoading: false })
//         }
//       },

//       // =================================
//       // SINGLE SUBSCRIBER
//       // =================================

//       fetchSubscriber: async (id: string) => {
//         const { currentWorkspace } = useWorkspaceStore.getState()

//         if (!currentWorkspace?.id) return null

//         set({ isLoading: true })

//         try {
//           const data = await apiFetch(
//             `/api/workspace/${currentWorkspace.id}/subscribers/${id}`
//           )

//           const subscriber = data.data?.subscriber || data.data

//           if (subscriber) {
//             set({ currentSubscriber: subscriber })
//             return subscriber
//           }

//           return null
//         } catch (error) {
//           console.error("Fetch subscriber error:", error)
//           toast.error("Failed to fetch subscriber")
//           return null
//         } finally {
//           set({ isLoading: false })
//         }
//       },

//       // =================================
//       // CREATE
//       // =================================

//       createSubscriber: async (data) => {
//         const { currentWorkspace } = useWorkspaceStore.getState()

//         if (!currentWorkspace?.id) {
//           toast.error("No workspace selected")
//           return null
//         }

//         set({ isLoading: true })

//         try {
//           const res = await apiFetch(
//             `/api/workspace/${currentWorkspace.id}/subscribers`,
//             {
//               method: "POST",
//               body: JSON.stringify(data),
//             }
//           )

//           if (res.success) {
//             const subscriber = res.data

//             set((state) => ({
//               subscribers: [subscriber, ...state.subscribers],
//             }))

//             toast.success("Subscriber created")
//             return subscriber
//           }

//           return null
//         } catch (error) {
//           toast.error((error as Error).message)
//           return null
//         } finally {
//           set({ isLoading: false })
//         }
//       },

//       // =================================
//       // UPDATE
//       // =================================

//       updateSubscriber: async (id, data) => {
//         const { currentWorkspace } = useWorkspaceStore.getState()

//         if (!currentWorkspace?.id) return null

//         set({ isLoading: true })

//         try {
//           const res = await apiFetch(
//             `/api/workspace/${currentWorkspace.id}/subscribers/${id}`,
//             {
//               method: "PATCH",
//               body: JSON.stringify(data),
//             }
//           )

//           if (res.success) {
//             const updated = res.data

//             set((state) => ({
//               subscribers: state.subscribers.map((s) =>
//                 s.id === id ? updated : s
//               ),
//             }))

//             toast.success("Subscriber updated")
//             return updated
//           }

//           return null
//         } finally {
//           set({ isLoading: false })
//         }
//       },

//       // =================================
//       // DELETE
//       // =================================

//       deleteSubscriber: async (id) => {
//         const { currentWorkspace } = useWorkspaceStore.getState()

//         if (!currentWorkspace?.id) return

//         try {
//           await apiFetch(
//             `/api/workspace/${currentWorkspace.id}/subscribers/${id}`,
//             { method: "DELETE" }
//           )

//           set((state) => ({
//             subscribers: state.subscribers.filter((s) => s.id !== id),
//           }))

//           toast.success("Subscriber deleted")
//         } catch (error) {
//           toast.error("Failed to delete subscriber")
//         }
//       },

//       bulkDeleteSubscribers: async (ids) => {
//         const { currentWorkspace } = useWorkspaceStore.getState()

//         if (!currentWorkspace?.id) return

//         try {
//           await apiFetch(
//             `/api/workspace/${currentWorkspace.id}/subscribers/bulk-delete`,
//             {
//               method: "POST",
//               body: JSON.stringify({ ids }),
//             }
//           )

//           set((state) => ({
//             subscribers: state.subscribers.filter(
//               (s) => !ids.includes(s.id)
//             ),
//           }))

//           toast.success("Subscribers deleted")
//         } catch (error) {
//           toast.error("Failed to delete subscribers")
//         }
//       },

//       // =================================
//       // PUBLIC SUBSCRIBE
//       // ================================= 

//       subscribe: async (email, name, source = "website") => {
//         const { currentWorkspace } = useWorkspaceStore.getState()

//         if (!currentWorkspace?.id) return null

//         try {
//           const res = await apiFetch(
//             `/api/workspace/${currentWorkspace.id}/subscribe`,
//             {
//               method: "POST",
//               body: JSON.stringify({ email, name, source }),
//             }
//           )

//           if (res.success) {
//             toast.success("Subscribed successfully")
//             return res.data
//           }

//           return null
//         } catch (error) {
//           toast.error((error as Error).message)
//           return null
//         }
//       },

//       unsubscribe: async (email) => {
//         const { currentWorkspace } = useWorkspaceStore.getState()

//         if (!currentWorkspace?.id) return

//         try {
//           await apiFetch(
//             `/api/workspace/${currentWorkspace.id}/unsubscribe`,
//             {
//               method: "POST",
//               body: JSON.stringify({ email }),
//             }
//           )

//           toast.success("Unsubscribed successfully")
//         } catch {
//           toast.error("Failed to unsubscribe")
//         }
//       },

//       confirmSubscription: async (email) => {
//         const { currentWorkspace } = useWorkspaceStore.getState()

//         if (!currentWorkspace?.id) return

//         try {
//           await apiFetch(
//             `/api/workspace/${currentWorkspace.id}/confirm`,
//             {
//               method: "POST",
//               body: JSON.stringify({ email }),
//             }
//           )

//           toast.success("Subscription confirmed")

//           await get().fetchSubscribers()
//           await get().fetchStats()
//         } catch {
//           toast.error("Failed to confirm subscription")
//         }
//       },

//       // =================================
//       // STATS
//       // =================================

//         fetchStats: async () => {
//           const { currentWorkspace } = useWorkspaceStore.getState();

//           if (!currentWorkspace?.id) {
//             console.warn("No workspace selected for stats");
//             return;
//           }

//           set({ isLoading: true, error: null });

//           try {
//             const data = await apiFetch(
//               `/api/workspace/${currentWorkspace.id}/subscribers/stats`
//             );

//             console.log("Stats API response:", data);

//             // The API returns { success: true, data: { total, active, ... } }
//             if (data.success && data.data) {
//               // Store the data directly, not wrapped in another object
//               set({ stats: data.data });
//               console.log("Stats set to:", data.data);
//             } else if (data.total !== undefined) {
//               // Handle case where data is the stats object directly
//               set({ stats: data });
//               console.log("Stats set directly to:", data);
//             } else {
//               console.error("Stats API returned unexpected format:", data);
//               set({ stats: { total: 0, active: 0, unsubscribed: 0, bounced: 0 } });
//             }
//           } catch (error) {
//             console.error("Stats error:", error);
//             set({ 
//               stats: { total: 0, active: 0, unsubscribed: 0, bounced: 0 },
//               error: (error as Error).message 
//             });
//             toast.error("Failed to fetch stats");
//           } finally {
//             set({ isLoading: false });
//           }
//         },

//       clearError: () => set({ error: null }),

//       setCurrentSubscriber: (subscriber) =>
//         set({ currentSubscriber: subscriber }),

//       clearSubscribers: () =>
//         set({
//           subscribers: [],
//           currentSubscriber: null,
//           totalCount: 0,
//           currentPage: 1,
//         }),
//     }),
//     {
//       name: "subscriber-storage",
//       partialize: (state) => ({
//         stats: state.stats,
//       }),
//     }
//   )
// )











// lib/stores/subscriber/store.ts

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "sonner"
import { useWorkspaceStore } from "../workspace"
import {
  CreateSubscriberData,
  Subscriber,
  SubscriberFilters,
  SubscriberStats,
  UpdateSubscriberData,
} from "./type"

const apiFetch = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("unauthorized")
    }
    throw new Error(data.message || data.error || "Request failed")
  }

  return data
}

interface SubscriberState {
  subscribers: Subscriber[]
  subscriberCount: number
  currentSubscriber: Subscriber | null
  stats: SubscriberStats | null
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number

  // Actions
  fetchSubscriberCount: () => Promise<number>
  getAllSubscribers: (status?: string) => Promise<{ subscribers: Subscriber[]; count: number }>
  fetchSubscribers: (filters?: SubscriberFilters) => Promise<void>
  fetchSubscriber: (id: string) => Promise<Subscriber | null>
  createSubscriber: (data: CreateSubscriberData) => Promise<Subscriber | null>
  updateSubscriber: (id: string, data: UpdateSubscriberData) => Promise<Subscriber | null>
  deleteSubscriber: (id: string) => Promise<void>
  bulkDeleteSubscribers: (ids: string[]) => Promise<void>
  subscribe: (email: string, name?: string, source?: string) => Promise<Subscriber | null>
  unsubscribe: (email: string) => Promise<void>
  confirmSubscription: (email: string) => Promise<void>
  fetchStats: () => Promise<void>
  clearError: () => void
  setCurrentSubscriber: (subscriber: Subscriber | null) => void
  clearSubscribers: () => void
}

export const useSubscriberStore = create<SubscriberState>()(
  persist(
    (set, get) => ({
      subscribers: [],
      subscriberCount: 0,
      currentSubscriber: null,
      stats: null,
      isLoading: false,
      error: null,
      totalCount: 0,
      currentPage: 1,
      pageSize: 20,

      fetchSubscriberCount: async () => {
        const { currentWorkspace } = useWorkspaceStore.getState()
        if (!currentWorkspace?.id) {
          set({ error: "No workspace selected" })
          return 0
        }

        try {
          const data = await apiFetch(`/api/workspace/${currentWorkspace.id}/subscribers/count`)
          if (data.success) {
            const count = data.data?.count || 0
            set({ subscriberCount: count })
            return count
          }
          return 0
        } catch (error) {
          console.error("Fetch subscriber count error:", error)
          return 0
        }
      },

      getAllSubscribers: async (status = "ACTIVE") => {
        const { currentWorkspace } = useWorkspaceStore.getState()
        if (!currentWorkspace?.id) {
          set({ error: "No workspace selected" })
          return { subscribers: [], count: 0 }
        }

        set({ isLoading: true })
        try {
          const queryParams = new URLSearchParams({ page: "1", limit: "1000", status })
          const data = await apiFetch(`/api/workspace/${currentWorkspace.id}/subscribers?${queryParams}`)

          if (data.success) {
            const subscribers = data.data?.data || []
            const count = data.data?.pagination?.totalCount || subscribers.length
            set({ subscribers, totalCount: count })
            return { subscribers, count }
          }
          return { subscribers: [], count: 0 }
        } catch (error) {
          console.error("Get subscribers error:", error)
          return { subscribers: [], count: 0 }
        } finally {
          set({ isLoading: false })
        }
      },

      fetchSubscribers: async (filters = {}) => {
        const { currentWorkspace } = useWorkspaceStore.getState()
        if (!currentWorkspace?.id) {
          set({ error: "No workspace selected" })
          return
        }

        const { pageSize, currentPage } = get()
        set({ isLoading: true, error: null })

        try {
          const params: Record<string, string> = {
            page: (filters.page || currentPage).toString(),
            limit: (filters.limit || pageSize).toString(),
          }
          if (filters.status) params.status = filters.status
          if (filters.search) params.search = filters.search

          const data = await apiFetch(`/api/workspace/${currentWorkspace.id}/subscribers?${new URLSearchParams(params)}`)

          if (data.success) {
            const subscribers = data.data?.data || []
            const pagination = data.data?.pagination || {}
            set({
              subscribers,
              totalCount: pagination.totalCount || 0,
              currentPage: pagination.page || currentPage,
            })
          }
        } catch (error) {
          console.error("Fetch subscribers error:", error)
          set({ error: (error as Error).message })
          toast.error("Failed to fetch subscribers")
        } finally {
          set({ isLoading: false })
        }
      },

      fetchSubscriber: async (id: string) => {
        const { currentWorkspace } = useWorkspaceStore.getState()
        if (!currentWorkspace?.id) return null

        set({ isLoading: true })
        try {
          const data = await apiFetch(`/api/workspace/${currentWorkspace.id}/subscribers/${id}`)
          const subscriber = data.data?.subscriber || data.data
          if (subscriber) {
            set({ currentSubscriber: subscriber })
            return subscriber
          }
          return null
        } catch (error) {
          console.error("Fetch subscriber error:", error)
          toast.error("Failed to fetch subscriber")
          return null
        } finally {
          set({ isLoading: false })
        }
      },

      createSubscriber: async (data) => {
        const { currentWorkspace } = useWorkspaceStore.getState()
        if (!currentWorkspace?.id) {
          toast.error("No workspace selected")
          return null
        }

        set({ isLoading: true })
        try {
          const res = await apiFetch(`/api/workspace/${currentWorkspace.id}/subscribers`, {
            method: "POST",
            body: JSON.stringify(data),
          })

          if (res.success) {
            const subscriber = res.data
            set((state) => ({ subscribers: [subscriber, ...state.subscribers] }))
            toast.success("Subscriber created")
            return subscriber
          }
          return null
        } catch (error) {
          toast.error((error as Error).message)
          return null
        } finally {
          set({ isLoading: false })
        }
      },

      updateSubscriber: async (id, data) => {
        const { currentWorkspace } = useWorkspaceStore.getState()
        if (!currentWorkspace?.id) return null

        set({ isLoading: true })
        try {
          const res = await apiFetch(`/api/workspace/${currentWorkspace.id}/subscribers/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
          })

          if (res.success) {
            const updated = res.data
            set((state) => ({
              subscribers: state.subscribers.map((s) => (s.id === id ? updated : s)),
            }))
            toast.success("Subscriber updated")
            return updated
          }
          return null
        } finally {
          set({ isLoading: false })
        }
      },

      deleteSubscriber: async (id) => {
        const { currentWorkspace } = useWorkspaceStore.getState()
        if (!currentWorkspace?.id) return

        try {
          await apiFetch(`/api/workspace/${currentWorkspace.id}/subscribers/${id}`, { method: "DELETE" })
          set((state) => ({ subscribers: state.subscribers.filter((s) => s.id !== id) }))
          toast.success("Subscriber deleted")
        } catch (error) {
          toast.error("Failed to delete subscriber")
        }
      },

      bulkDeleteSubscribers: async (ids) => {
        const { currentWorkspace } = useWorkspaceStore.getState()
        if (!currentWorkspace?.id) return

        try {
          await apiFetch(`/api/workspace/${currentWorkspace.id}/subscribers/bulk-delete`, {
            method: "POST",
            body: JSON.stringify({ ids }),
          })
          set((state) => ({ subscribers: state.subscribers.filter((s) => !ids.includes(s.id)) }))
          toast.success("Subscribers deleted")
        } catch (error) {
          toast.error("Failed to delete subscribers")
        }
      },

      subscribe: async (email, name, source = "website") => {
        const { currentWorkspace } = useWorkspaceStore.getState()
        if (!currentWorkspace?.id) return null

        try {
          const res = await apiFetch(`/api/workspace/${currentWorkspace.id}/subscribe`, {
            method: "POST",
            body: JSON.stringify({ email, name, source }),
          })
          if (res.success) {
            toast.success("Subscribed successfully")
            return res.data
          }
          return null
        } catch (error) {
          toast.error((error as Error).message)
          return null
        }
      },

      unsubscribe: async (email) => {
        const { currentWorkspace } = useWorkspaceStore.getState()
        if (!currentWorkspace?.id) return

        try {
          await apiFetch(`/api/workspace/${currentWorkspace.id}/unsubscribe`, {
            method: "POST",
            body: JSON.stringify({ email }),
          })
          toast.success("Unsubscribed successfully")
        } catch {
          toast.error("Failed to unsubscribe")
        }
      },

      confirmSubscription: async (email) => {
        const { currentWorkspace } = useWorkspaceStore.getState()
        if (!currentWorkspace?.id) return

        try {
          await apiFetch(`/api/workspace/${currentWorkspace.id}/confirm`, {
            method: "POST",
            body: JSON.stringify({ email }),
          })
          toast.success("Subscription confirmed")
          await get().fetchSubscribers()
          await get().fetchStats()
        } catch {
          toast.error("Failed to confirm subscription")
        }
      },

      // =================================
      // STATS - FIXED VERSION
      // =================================

      fetchStats: async () => {
        const { currentWorkspace } = useWorkspaceStore.getState()
        if (!currentWorkspace?.id) {
          console.warn("No workspace selected for stats")
          return
        }

        set({ isLoading: true, error: null })

        try {
          const data = await apiFetch(`/api/workspace/${currentWorkspace.id}/subscribers/stats`)
          
          console.log("Stats API response:", data)

          // The API returns { success: true, data: { total, active, ... } }
          if (data.success && data.data) {
            // Store the data directly - no wrapping
            set({ stats: data.data })
            console.log("Stats set to:", data.data)
          } else if (data.total !== undefined) {
            set({ stats: data })
            console.log("Stats set directly to:", data)
          } else {
            console.error("Stats API returned unexpected format:", data)
            set({ stats: { total: 0, active: 0, unsubscribed: 0, bounced: 0 } })
          }
        } catch (error) {
          console.error("Stats error:", error)
          set({
            stats: { total: 0, active: 0, unsubscribed: 0, bounced: 0 },
            error: (error as Error).message,
          })
          toast.error("Failed to fetch stats")
        } finally {
          set({ isLoading: false })
        }
      },

      clearError: () => set({ error: null }),

      setCurrentSubscriber: (subscriber) => set({ currentSubscriber: subscriber }),

      clearSubscribers: () =>
        set({
          subscribers: [],
          currentSubscriber: null,
          totalCount: 0,
          currentPage: 1,
        }),
    }),
    {
      name: "subscriber-storage",
      partialize: (state) => ({
        // Only persist what's needed - DON'T wrap stats again
        stats: state.stats,
      }),
    }
  )
)