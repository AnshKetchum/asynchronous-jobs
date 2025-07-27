import { Card, CardContent } from "@/components/ui/card"
import { Construction } from "lucide-react"

interface UnderConstructionProps {
  title: string
  description: string
}

export function UnderConstruction({ title, description }: UnderConstructionProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="text-center py-16">
          <Construction className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Under Construction</h3>
          <p className="text-gray-500">This feature is currently being developed and will be available soon!</p>
        </CardContent>
      </Card>
    </div>
  )
}
