import React, { createContext, useContext, useEffect, useState } from 'react'

export interface TabConfig {
  id: string
  name: string
  status: boolean
}

interface TabManagementContextType {
  tabs: TabConfig[]
  loading: boolean
  isTabEnabled: (id: string) => boolean
}

const TabManagementContext = createContext<TabManagementContextType | undefined>(undefined)

export const TabManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tabs, setTabs] = useState<TabConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTabs = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || ''
        const response = await fetch(`${baseUrl}/api/tabManagement`)
        if (!response.ok) throw new Error('Failed to fetch tab management data')
        const data = await response.json()
        
        if (data.status === 'success' && Array.isArray(data.data)) {
          setTabs(data.data)
        }
      } catch (error) {
        console.error('Error fetching tab management:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTabs()
  }, [])

  const isTabEnabled = (id: string) => {
    // If loading or data not found, default to true to not break the app
    if (loading) return true
    const tab = tabs.find(t => t.id === id)
    return tab ? tab.status : true
  }

  return (
    <TabManagementContext.Provider value={{ tabs, loading, isTabEnabled }}>
      {children}
    </TabManagementContext.Provider>
  )
}

export const useTabManagement = () => {
  const context = useContext(TabManagementContext)
  if (context === undefined) {
    throw new Error('useTabManagement must be used within a TabManagementProvider')
  }
  return context
}
