import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from '@/components/RootLayout'
import { publicRoutes } from '@/routes/publicRoutes'
import { protectedRoutes } from '@/routes/protectedRoutes'
import { TabManagementProvider } from '@/context/TabManagementContext'
import { useEffect } from 'react'
import { playClickSound } from '@/lib/sound'

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
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Do not play sound when interacting with text inputs
      if (target.closest('input, textarea')) {
        return;
      }

      // Only play sound on interactive elements
      if (target.closest('button, a, [role="button"], .cursor-pointer')) {
        playClickSound();
      }
    };

    document.addEventListener('pointerdown', handleGlobalClick, true);
    return () => document.removeEventListener('pointerdown', handleGlobalClick, true);
  }, []);

  return (
    <TabManagementProvider>
      <RouterProvider router={router} />
    </TabManagementProvider>
  )
}

export default App
