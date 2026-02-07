import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  const themes = [
    {
      name: "light" as const,
      label: "ღია თემა",
      description: "კლასიკური ღია ფერები",
      icon: Sun,
      preview: "bg-white border-gray-200",
    },
    {
      name: "dark" as const,
      label: "მუქი თემა",
      description: "თვალისთვის მოსახერხებელი მუქი ფერები",
      icon: Moon,
      preview: "bg-gray-900 border-gray-700",
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      {themes.map((themeOption) => {
        const Icon = themeOption.icon
        const isSelected = theme === themeOption.name

        return (
          <Card
            key={themeOption.name}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isSelected ? "ring-2 ring-primary border-primary" : ""
            }`}
            onClick={() => setTheme(themeOption.name)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-foreground" />
                    <span className="font-medium text-foreground">{themeOption.label}</span>
                  </div>
                  {isSelected && (
                    <Badge variant="default" className="text-xs">
                      აქტიური
                    </Badge>
                  )}
                </div>

                <div className={`h-16 rounded-lg border-2 ${themeOption.preview}`} />

                <p className="text-xs text-muted-foreground">{themeOption.description}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
