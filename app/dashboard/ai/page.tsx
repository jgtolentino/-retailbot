import { RetailBotChat } from '@/components/RetailBotChat'

export default function AIAnalyticsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Analytics</h2>
          <p className="text-muted-foreground">
            Ask questions about your data in natural language
          </p>
        </div>
      </div>
      
      <RetailBotChat />
    </div>
  )
}