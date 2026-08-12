import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from '@/components/RootLayout'
import { publicRoutes } from '@/routes/publicRoutes'
import { protectedRoutes } from '@/routes/protectedRoutes'
import { TabManagementProvider } from '@/context/TabManagementContext'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      ...publicRoutes,
      ...protectedRoutes,
    ],
  },
])

export function App() {
  return (
    <TabManagementProvider>
      <RouterProvider router={router} />
    </TabManagementProvider>
  )
}

export default App
