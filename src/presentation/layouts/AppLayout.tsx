import { Outlet } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white pb-20">
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
