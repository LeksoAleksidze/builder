import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@d2d-ui/ui/button"
import { ThemeToggle } from "@d2d-ui/theme-toggle"
import { Card, CardContent, CardHeader, CardTitle } from "@d2d-ui/ui/card"
import { Home, Calendar, ImageIcon, ExternalLink, LogOut, Check } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@d2d-ui/ui/select"
import { Input } from "@d2d-ui/ui/input"
import { ProfileModal } from "../dashboard/components/ProfileModal"
import { DOMAIN_URL } from "../../../shared/services/api"

interface UserInfo {
  userId: number
  firstName: string
  lastName: string
  email: string
  role: string
  stack: string
  createdAt: string
}

interface Promotion {
  _id: string
  description: string
  enabled: boolean
  endDate: string
  environment?: string
  widgets: any[]
}

export function HeadersPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [upcomingPromotions, setUpcomingPromotions] = useState<Promotion[]>([])
  const [pastPromotions, setPastPromotions] = useState<Promotion[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dayRange, setDayRange] = useState<number>(7)
  const [environmentFilter, setEnvironmentFilter] = useState<string>("all")
  const [showProfileModal, setShowProfileModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      navigate("/login")
    } else {
      fetchUserInfo(token)
      fetchPromotions()
    }
  }, [])

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch(`${DOMAIN_URL}/auth/information`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      if (data.status && data.body) {
        setUserInfo(data.body)
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const fetchPromotions = async () => {
    try {
      const tokenResponse = await fetch("https://internal-cms-back.crocobet.com/auth/refresh-token", {
        method: "POST",
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: "e3871bb7e2119ee0f9ad8779a51912ad2b7a9ffc605f0bacf2a4883550ed35fa",
          "content-type": "application/json",
          origin: "https://internal-d2dreports.crocobet.com",
        },
        body: JSON.stringify({}),
      })

      const tokenData = await tokenResponse.json()

      if (!tokenData.data?.token) {
        throw new Error("Failed to get token")
      }

      const promotionsResponse = await fetch(
        "https://internal-cms-back.crocobet.com/api/internal/marketing/promotions?page=0&size=1000&sort=%5B%22endDate%22,-1%5D&filter%7B%22enabled%22:%22true%22%7D&fields=%5B%5D&relations=%5B%5D",
        {
          headers: {
            accept: "application/json, text/plain, */*",
            authorization: tokenData.data.token,
            "content-type": "application/json",
            origin: "https://internal-d2dreports.crocobet.com",
          },
        },
      )

      const promotionsData = await promotionsResponse.json()

      let promotionsArray: Promotion[] = []

      if (promotionsData.data) {
        if (Array.isArray(promotionsData.data)) {
          promotionsArray = promotionsData.data
        } else if (promotionsData.data.items && Array.isArray(promotionsData.data.items)) {
          promotionsArray = promotionsData.data.items
        } else if (promotionsData.data.content && Array.isArray(promotionsData.data.content)) {
          promotionsArray = promotionsData.data.content
        } else {
          console.warn("Unexpected data structure:", promotionsData.data)
          promotionsArray = []
        }
      } else if (Array.isArray(promotionsData)) {
        promotionsArray = promotionsData
      } else {
        promotionsArray = []
      }

      setPromotions(promotionsArray)
      filterPromotions(promotionsArray)
    } catch (error) {
      setPromotions([])
      setUpcomingPromotions([])
      setPastPromotions([])
    }
  }

  const filterPromotions = (promotions: Promotion[]) => {
    if (!Array.isArray(promotions)) {
      console.warn("filterPromotions received non-array:", promotions)
      setUpcomingPromotions([])
      setPastPromotions([])
      return
    }

    const now = new Date()
    const daysFromNow = new Date(now.getTime() + dayRange * 24 * 60 * 60 * 1000)
    const daysAgo = new Date(now.getTime() - dayRange * 24 * 60 * 60 * 1000)

    let filteredPromotions = promotions

    if (searchTerm) {
      filteredPromotions = filteredPromotions.filter((promo) =>
        promo.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filteredPromotions = filteredPromotions.filter((promo) =>
        statusFilter === "enabled" ? promo.enabled : !promo.enabled,
      )
    }

    if (environmentFilter !== "all") {
      filteredPromotions = filteredPromotions.filter((promo) => promo.environment === environmentFilter)
    }

    const upcoming = filteredPromotions
      .filter((promo) => {
        if (!promo.endDate) return false
        const endDate = new Date(promo.endDate)
        return endDate >= now && endDate <= daysFromNow
      })
      .sort((a, b) => {
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      })

    const past = filteredPromotions
      .filter((promo) => {
        if (!promo.endDate) return false
        const endDate = new Date(promo.endDate)
        return endDate >= daysAgo && endDate < now
      })
      .sort((a, b) => {
        return new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
      })

    setUpcomingPromotions(upcoming)
    setPastPromotions(past)
  }

  useEffect(() => {
    if (promotions.length > 0) {
      filterPromotions(promotions)
    }
  }, [searchTerm, statusFilter, dayRange, environmentFilter, promotions])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    navigate("/login")
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleString("ka-GE", {
      timeZone: "Asia/Tbilisi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

  const handleEdit = (promotionId: string) => {
    window.open(`https://internal-cmsadmin.crocobet.com/#/crm/marketing-promotions/${promotionId}`, "_blank")
  }

  const isWithin24Hours = (dateString: string, isPast = false) => {
    if (!dateString) return false
    const date = new Date(dateString)
    const now = new Date()

    if (isPast) {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)
      return date >= yesterday && date < now
    } else {
      const endOfToday = new Date(now)
      endOfToday.setHours(23, 59, 59, 999)
      return date >= now && date <= endOfToday
    }
  }

  const isWeekend = (dateString: string) => {
    if (!dateString) return false
    const date = new Date(dateString)
    const day = date.getDay()
    return day === 5 || day === 6 || day === 0
  }

  const getImageUrl = (promotion: Promotion) => {
    if (promotion.widgets && Array.isArray(promotion.widgets) && promotion.widgets.length > 0) {
      const firstWidget = promotion.widgets[0]
      if (firstWidget?.baseImage?.ka) {
        const url = firstWidget.baseImage.ka
        try {
          new URL(url)
          return url
        } catch {
          console.warn("Invalid image URL:", url)
          return null
        }
      }
    }
    return null
  }

  // PromotionCard inner component
  const PromotionCard = ({ promotion, isPast = false }: { promotion: Promotion; isPast?: boolean }) => {
    const within24Hours = isWithin24Hours(promotion.endDate, isPast)
    const isWeekendCheck = isWeekend(promotion.endDate)
    const imageUrl = getImageUrl(promotion)

    const getCardClassName = () => {
      let baseClass = "mb-3 hover:shadow-md transition-shadow"

      if (within24Hours) {
        if (isPast) {
          baseClass += " border-red-300 bg-red-100 dark:border-red-700 dark:bg-red-950/30"
        } else {
          baseClass += " border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20"
        }
      }

      return baseClass
    }

    return (
      <Card className={getCardClassName()}>
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <div className="w-40 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={promotion.description}
                  className="w-full h-full object-cover-special"
                  onError={(e) => {
                    console.warn("Failed to load image:", imageUrl)
                    e.currentTarget.style.display = "none"
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                    if (nextElement) {
                      nextElement.style.display = "flex"
                    }
                  }}
                  onLoad={(e) => {
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                    if (nextElement) {
                      nextElement.style.display = "none"
                    }
                  }}
                />
              ) : null}
              <ImageIcon className="h-8 w-8 text-muted-foreground" style={{ display: imageUrl ? "none" : "flex" }} />
            </div>

            <div className="flex-1 space-y-1">
              <h3 className="font-medium text-foreground line-clamp-2 text-sm uppercase">{promotion.description}</h3>

              <div className="flex items-center gap-2 flex-wrap">
                {promotion.enabled ? (
                  <div className="h-3 w-3 rounded-sm bg-green-500 flex items-center justify-center">
                    <Check className="h-2 w-2 text-white" />
                  </div>
                ) : (
                  <div className="h-3 w-3 rounded-sm border border-gray-300 bg-gray-100"></div>
                )}
                <span className="text-xs text-muted-foreground">{promotion.enabled ? "ჩართული" : "გამორთული"}</span>

                {isWeekendCheck && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded text-xs font-medium">
                    Weekend
                  </span>
                )}

                {within24Hours && (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      isPast
                        ? "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {isPast ? "გასული 24 საათი" : "მომდევნო 24 საათი"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(promotion.endDate)}</span>
              </div>
              {promotion.environment && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs">
                    {promotion.environment}
                  </span>
                </div>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={() => handleEdit(promotion._id)} className="h-8 w-8 p-0">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <header className="border-b border-border bg-card/85 backdrop-blur-xl sticky top-0 z-10" style={{ boxShadow: 'var(--shadow-xs)' }}>
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/server-selection")}>
                <Home className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">მთავარი</span>
              </Button>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">
                ჰედერები
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              {userInfo && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-2 hover:bg-accent rounded-lg p-2 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center text-xs font-semibold">
                      {getInitials(userInfo.firstName, userInfo.lastName)}
                    </div>
                    <div className="text-sm hidden sm:block">
                      <div className="font-medium text-foreground">
                        {userInfo.firstName} {userInfo.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">{userInfo.role} / {userInfo.stack}</div>
                    </div>
                  </button>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 p-4 sm:p-5 bg-card rounded-lg border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="text-base font-semibold mb-4 text-foreground">ფილტრები</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <label className="block text-sm font-medium mb-2">დღის რეინჯი</label>
              <Input
                type="number"
                min="1"
                max="30"
                value={dayRange}
                onChange={(e) => setDayRange(Number(e.target.value) || 7)}
                placeholder="7"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ძებნა სახელით</label>
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="აქციის სახელი..."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">სტატუსი</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიეთ სტატუსი" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ყველა</SelectItem>
                  <SelectItem value="enabled">ჩართული</SelectItem>
                  <SelectItem value="disabled">გათიშული</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">გარემო</label>
              <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიეთ გარემო" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ყველა</SelectItem>
                  <SelectItem value="PRODUCTION">PRODUCTION</SelectItem>
                  <SelectItem value="TEST">TEST</SelectItem>
                  <SelectItem value="STAGE">STAGE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-green-700 dark:text-green-400">
                  მომდევნო {dayRange} დღის აქციები ({upcomingPromotions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[70vh] overflow-y-auto">
                {upcomingPromotions.length > 0 ? (
                  upcomingPromotions.map((promotion) => (
                    <PromotionCard key={promotion._id} promotion={promotion} isPast={false} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    მომდევნო {dayRange} დღეში არ არის აქციები
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card
              className={
                pastPromotions.some((promo) => isWithin24Hours(promo.endDate, true))
                  ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/20"
                  : ""
              }
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                  გასული {dayRange} დღის აქციები ({pastPromotions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[70vh] overflow-y-auto">
                {pastPromotions.length > 0 ? (
                  pastPromotions.map((promotion) => (
                    <PromotionCard key={promotion._id} promotion={promotion} isPast={true} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">გასული {dayRange} დღეში არ იყო აქციები</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {userInfo && (
          <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} userInfo={userInfo} />
        )}
      </main>
    </div>
  )
}
