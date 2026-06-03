import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from '@/components/RootLayout'
import { publicRoutes } from '@/routes/publicRoutes'
import { protectedRoutes } from '@/routes/protectedRoutes'

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
  return <RouterProvider router={router} />
}

export default App
