import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-6">
          <Outlet />
        </main>
      </div>
      <div className="md:hidden">
        <main className="pb-20 p-4">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  )
}
