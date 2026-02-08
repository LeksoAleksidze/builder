import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@d2d-ui/ui/button"
import { ThemeToggle } from "@d2d-ui/theme-toggle"
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
      let baseClass = "header-item"
      if (within24Hours) {
        baseClass += isPast ? " header-item--danger" : " header-item--warning"
      }
      return baseClass
    }

    return (
      <div className={getCardClassName()}>
        <div className="header-item__image">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={promotion.description}
              onError={(e) => {
                e.currentTarget.style.display = "none"
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                if (nextElement) nextElement.style.display = "flex"
              }}
              onLoad={(e) => {
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                if (nextElement) nextElement.style.display = "none"
              }}
            />
          ) : null}
          <ImageIcon style={{ display: imageUrl ? "none" : "flex" }} />
        </div>

        <div className="header-item__content">
          <h3 className="header-item__title">{promotion.description}</h3>

          <div className="campaign-item__badges">
            {promotion.enabled ? (
              <span className="campaign-item__badge campaign-item__badge--enabled">ჩართული</span>
            ) : (
              <span className="campaign-item__badge campaign-item__badge--disabled">გამორთული</span>
            )}
            {isWeekendCheck && (
              <span className="campaign-item__badge campaign-item__badge--weekend">Weekend</span>
            )}
            {within24Hours && (
              <span className={`campaign-item__badge ${isPast ? "campaign-item__badge--24h-danger" : "campaign-item__badge--24h-warning"}`}>
                {isPast ? "გასული 24 საათი" : "მომდევნო 24 საათი"}
              </span>
            )}
          </div>

          <div className="campaign-item__meta">
            <Calendar />
            <span>{formatDate(promotion.endDate)}</span>
          </div>
          {promotion.environment && (
            <div className="campaign-item__badges" style={{ marginTop: '0.25rem' }}>
              <span className="campaign-item__badge campaign-item__badge--type">{promotion.environment}</span>
            </div>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={() => handleEdit(promotion._id)} className="h-8 w-8 p-0">
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
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
    <div className="page-bg">
      <header className="page-header">
        <div className="page-header__container">
          <div className="page-header__left">
            <Button variant="ghost" size="sm" onClick={() => navigate("/server-selection")}>
              <Home className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">მთავარი</span>
            </Button>
            <h1 className="page-header__title page-header__title--purple">ჰედერები</h1>
          </div>

          <div className="page-header__right">
            <ThemeToggle />
            {userInfo && (
              <>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="page-header__user-btn"
                >
                  <div className="page-header__avatar page-header__avatar--purple">
                    {getInitials(userInfo.firstName, userInfo.lastName)}
                  </div>
                  <div className="page-header__user-info">
                    <div className="page-header__user-name">
                      {userInfo.firstName} {userInfo.lastName}
                    </div>
                    <div className="page-header__user-role">{userInfo.role} / {userInfo.stack}</div>
                  </div>
                </button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="dashboard__main">
        <div className="filter-card">
          <h3 className="filter-card__title">ფილტრები</h3>
          <div className="filter-card__grid filter-card__grid--4">
            <div>
              <label className="filter-card__field-label">დღის რეინჯი</label>
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
              <label className="filter-card__field-label">ძებნა სახელით</label>
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="აქციის სახელი..."
                className="w-full"
              />
            </div>
            <div>
              <label className="filter-card__field-label">სტატუსი</label>
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
              <label className="filter-card__field-label">გარემო</label>
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

        <div className="columns-grid columns-grid--2">
          <div className="column-card">
            <div className="column-card__header">
              <h2 className="column-card__title column-card__title--green">
                მომდევნო {dayRange} დღის აქციები ({upcomingPromotions.length})
              </h2>
            </div>
            <div className="column-card__body">
              {upcomingPromotions.length > 0 ? (
                upcomingPromotions.map((promotion) => (
                  <PromotionCard key={promotion._id} promotion={promotion} isPast={false} />
                ))
              ) : (
                <div className="column-card__empty">მომდევნო {dayRange} დღეში არ არის აქციები</div>
              )}
            </div>
          </div>

          <div className="column-card">
            <div className="column-card__header">
              <h2 className="column-card__title column-card__title--red">
                გასული {dayRange} დღის აქციები ({pastPromotions.length})
              </h2>
            </div>
            <div className="column-card__body">
              {pastPromotions.length > 0 ? (
                pastPromotions.map((promotion) => (
                  <PromotionCard key={promotion._id} promotion={promotion} isPast={true} />
                ))
              ) : (
                <div className="column-card__empty">გასული {dayRange} დღეში არ იყო აქციები</div>
              )}
            </div>
          </div>
        </div>
        {userInfo && (
          <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} userInfo={userInfo} />
        )}
      </main>
    </div>
  )
}
