import { Navigation } from '@/components/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Scout Databank</h1>
              <p className="text-sm text-gray-500">Sari-Sari Store Analytics Platform</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Powered by Lyra IoT</span>
            </div>
          </div>
          <Navigation />
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}