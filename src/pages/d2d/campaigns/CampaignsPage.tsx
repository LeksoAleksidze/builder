import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@d2d-ui/ui/button"
import { Input } from "@d2d-ui/ui/input"
import { ThemeToggle } from "@d2d-ui/theme-toggle"
import { Home, Calendar, ExternalLink, LogOut, Search, Eye, EyeOff } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@d2d-ui/ui/dialog"
import { DOMAIN_URL } from "../../../shared/services/api"

interface UserInfo {
  userId: number
  firstName: string
  lastName: string
  email: string
  role: string
  createdAt: string
}

interface Campaign {
  id: string
  uid: string
  type: string
  name: string
  enabled: boolean
  startDate: string
  endDate: string
  releaseStage: string
  version: string
  downForMaintenance: boolean
}

interface ColumnVisibility {
  endingSoon: boolean
  scheduled: boolean
  ended: boolean
}

export function CampaignsPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [endingSoonCampaigns, setEndingSoonCampaigns] = useState<Campaign[]>([])
  const [scheduledCampaigns, setScheduledCampaigns] = useState<Campaign[]>([])
  const [endedCampaigns, setEndedCampaigns] = useState<Campaign[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dayRange, setDayRange] = useState<number>(7)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    endingSoon: true,
    scheduled: true,
    ended: true,
  })
  const navigate = useNavigate()

  const [showGroupingModal, setShowGroupingModal] = useState(false)
  const [groupedCampaigns, setGroupedCampaigns] = useState<{ [key: string]: Campaign[] }>({})
  const [isGroupingEnabled, setIsGroupingEnabled] = useState(false)

  const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false)
  const [selectedGroupName, setSelectedGroupName] = useState<string>("")
  const [selectedGroupCampaigns, setSelectedGroupCampaigns] = useState<Campaign[]>([])

  // Load column visibility from localStorage
  useEffect(() => {
    const savedVisibility = localStorage.getItem("campaignsColumnVisibility")
    if (savedVisibility) {
      try {
        setColumnVisibility(JSON.parse(savedVisibility))
      } catch (error) {
        console.error("Error parsing saved column visibility:", error)
      }
    }
  }, [])

  // Save column visibility to localStorage
  const toggleColumnVisibility = (column: keyof ColumnVisibility) => {
    const newVisibility = {
      ...columnVisibility,
      [column]: !columnVisibility[column],
    }
    setColumnVisibility(newVisibility)
    localStorage.setItem("campaignsColumnVisibility", JSON.stringify(newVisibility))
  }

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      navigate("/login")
    } else {
      fetchUserInfo(token)
      fetchCampaigns()
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
      console.error("Error fetching user info:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAuthToken = async () => {
    try {
      const response = await fetch("https://internal-cms-back.crocobet.com/auth/refresh-token", {
        method: "POST",
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: "e3871bb7e2119ee0f9ad8779a51912ad2b7a9ffc605f0bacf2a4883550ed35fa",
          "content-type": "application/json",
          origin: "https://internal-d2dreports.crocobet.com",
        },
        body: JSON.stringify({}),
      })

      const data = await response.json()
      if (data.data?.token) {
        return data.data.token
      }
      throw new Error("Failed to get auth token")
    } catch (error) {
      console.error("Error getting auth token:", error)
      return null
    }
  }

  const fetchCampaigns = async () => {
    try {
      const authToken = await getAuthToken()
      if (!authToken) {
        console.error("Failed to get auth token")
        return
      }

      const headers = {
        accept: "application/json, text/plain, */*",
        authorization: authToken,
        "content-type": "application/json",
        origin: "https://internal-d2dreports.crocobet.com",
      }

      // Fetch scheduled campaigns
      const scheduledResponse = await fetch(
        "https://internal-cms-back.crocobet.com/api/internal/campaigns?page=0&size=1000&sort=%5B%22startDate%22,1%5D&filter=%7B%22status%22:%22scheduled%22%7D&fields=%5B%22id%22,%22uid%22,%22type%22,%22name%22,%22enabled%22,%22startDate%22,%22endDate%22,%22releaseStage%22,%22version%22,%22downForMaintenance%22%5D&relations=%5B%5D&search=null",
        { headers },
      )

      // Fetch active campaigns (ending soon)
      const activeResponse = await fetch(
        "https://internal-cms-back.crocobet.com/api/internal/campaigns?page=0&size=1000&sort=%5B%22endDate%22,1%5D&filter=%7B%22status%22:%22active%22%7D&fields=%5B%22id%22,%22uid%22,%22type%22,%22name%22,%22enabled%22,%22startDate%22,%22endDate%22,%22releaseStage%22,%22version%22,%22downForMaintenance%22%5D&relations=%5B%5D&search=null",
        { headers },
      )

      // Fetch ended campaigns
      const endedResponse = await fetch(
        "https://internal-cms-back.crocobet.com/api/internal/campaigns?page=0&size=100&sort=%5B%22endDate%22,-1%5D&filter=%7B%22status%22:%22ended%22%7D&fields=%5B%22id%22,%22uid%22,%22type%22,%22name%22,%22enabled%22,%22startDate%22,%22endDate%22,%22releaseStage%22,%22version%22,%22downForMaintenance%22%5D&relations=%5B%5D&search=null",
        { headers },
      )

      const [scheduledData, activeData, endedData] = await Promise.all([
        scheduledResponse.json(),
        activeResponse.json(),
        endedResponse.json(),
      ])

      // Process scheduled campaigns and filter by start date
      if (scheduledData.data?.items) {
        const now = new Date()
        const upcomingScheduled = scheduledData.data.items.filter((campaign: Campaign) => {
          if (!campaign.startDate) return false
          const startDate = new Date(campaign.startDate)
          const daysUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          return daysUntilStart <= dayRange && daysUntilStart >= 0
        })
        setScheduledCampaigns(upcomingScheduled)
      }

      // Process active campaigns and filter for ending soon
      if (activeData.data?.items) {
        const now = new Date()
        const endingSoon = activeData.data.items.filter((campaign: Campaign) => {
          if (!campaign.endDate) return false
          const endDate = new Date(campaign.endDate)
          const daysUntilEnd = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          return daysUntilEnd <= dayRange && daysUntilEnd >= 0
        })
        setEndingSoonCampaigns(endingSoon)
      }

      // Process ended campaigns
      if (endedData.data?.items) {
        const now = new Date()
        const recentlyEnded = endedData.data.items.filter((campaign: Campaign) => {
          if (!campaign.endDate) return false
          const endDate = new Date(campaign.endDate)
          const daysSinceEnd = (now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)
          return daysSinceEnd <= dayRange
        })
        setEndedCampaigns(recentlyEnded)
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error)
    }
  }

  // Re-fetch when day range changes
  useEffect(() => {
    if (dayRange > 0) {
      fetchCampaigns()
    }
  }, [dayRange])

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

  const filterCampaigns = (campaigns: Campaign[]) => {
    if (!searchTerm) return campaigns
    return campaigns.filter((campaign) => campaign.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  const handleEdit = (campaignId: string) => {
    window.open(`https://internal-cmsadmin.crocobet.com/#/campaigns/${campaignId}`, "_blank")
  }

  const isWithin24Hours = (dateString: string, isPast = false) => {
    if (!dateString) return false
    const date = new Date(dateString)
    const now = new Date()

    if (isPast) {
      // For past campaigns: ended within last 24 hours (since yesterday 00:00:00)
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)
      return date >= yesterday && date < now
    } else {
      // For upcoming campaigns: ending/starting within next 24 hours (until end of today)
      const endOfToday = new Date(now)
      endOfToday.setHours(23, 59, 59, 999)
      return date >= now && date <= endOfToday
    }
  }

  const isWeekend = (dateString: string) => {
    if (!dateString) return false
    const date = new Date(dateString)
    const day = date.getDay()
    return day === 5 || day === 6 || day === 0 // Friday, Saturday, Sunday
  }

  const CampaignCard = ({
    campaign,
    showStartDate = false,
    cardType = "default",
  }: {
    campaign: Campaign
    showStartDate?: boolean
    cardType?: "endingSoon" | "scheduled" | "ended" | "default"
  }) => {
    const isWithin24HoursCheck =
      cardType === "endingSoon"
        ? isWithin24Hours(campaign.endDate, false)
        : cardType === "scheduled"
          ? isWithin24Hours(campaign.startDate, false)
          : cardType === "ended"
            ? isWithin24Hours(campaign.endDate, true)
            : false

    const isWeekendCheck = isWeekend(showStartDate ? campaign.startDate : campaign.endDate)

    const getCardClassName = () => {
      let baseClass = "campaign-item"
      if (isWithin24HoursCheck) {
        if (cardType === "endingSoon") baseClass += " campaign-item--warning"
        else if (cardType === "scheduled") baseClass += " campaign-item--info"
        else if (cardType === "ended") baseClass += " campaign-item--danger"
      }
      return baseClass
    }

    return (
      <div className={getCardClassName()}>
        <div className="campaign-item__header">
          <div style={{ flex: 1 }}>
            <h3 className="campaign-item__title">{campaign.name}</h3>
            <div className="campaign-item__badges">
              <span className="campaign-item__id">ID: {campaign.id}</span>
              {campaign.enabled ? (
                <span className="campaign-item__badge campaign-item__badge--enabled">ჩართული</span>
              ) : (
                <span className="campaign-item__badge campaign-item__badge--disabled">გამორთული</span>
              )}
              {isWeekendCheck && (
                <span className="campaign-item__badge campaign-item__badge--weekend">Weekend</span>
              )}
              {isWithin24HoursCheck && (
                <span className={`campaign-item__badge ${
                  cardType === "endingSoon" ? "campaign-item__badge--24h-warning"
                    : cardType === "scheduled" ? "campaign-item__badge--24h-info"
                    : "campaign-item__badge--24h-danger"
                }`}>
                  {cardType === "scheduled" ? "მომდევნო 24 საათი" : cardType === "ended" ? "გასული 24 საათი" : "24 საათი"}
                </span>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleEdit(campaign.id)} className="h-8 w-8 p-0">
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>

        <div className="campaign-item__meta">
          <Calendar />
          <span>
            {showStartDate
              ? `დაწყება: ${formatDate(campaign.startDate)}`
              : `დასრულება: ${formatDate(campaign.endDate)}`}
          </span>
        </div>

        {campaign.type && (
          <div className="campaign-item__badges" style={{ marginTop: '0.375rem' }}>
            <span className="campaign-item__badge campaign-item__badge--type">{campaign.type}</span>
          </div>
        )}
      </div>
    )
  }

  const groupCampaignsByName = (campaigns: Campaign[]) => {
    const groups: { [key: string]: Campaign[] } = {}

    campaigns.forEach((campaign) => {
      const campaignName = campaign.name.trim()

      if (!groups[campaignName]) {
        groups[campaignName] = []
      }
      groups[campaignName].push(campaign)
    })

    // Filter out groups with only one campaign
    const filteredGroups: { [key: string]: Campaign[] } = {}
    Object.entries(groups).forEach(([groupName, campaigns]) => {
      if (campaigns.length > 1) {
        filteredGroups[groupName] = campaigns
      }
    })

    return filteredGroups
  }

  const handleGroupingToggle = () => {
    if (!isGroupingEnabled) {
      // Collect all campaigns from all columns
      const allCampaigns = [
        ...filterCampaigns(endingSoonCampaigns),
        ...filterCampaigns(scheduledCampaigns),
        ...filterCampaigns(endedCampaigns),
      ]

      const grouped = groupCampaignsByName(allCampaigns)
      setGroupedCampaigns(grouped)
      setShowGroupingModal(true)
      setIsGroupingEnabled(true)
    } else {
      setIsGroupingEnabled(false)
      setShowGroupingModal(false)
    }
  }

  const GroupedCampaignCard = ({
    groupName,
    campaigns,
    cardType,
  }: {
    groupName: string
    campaigns: Campaign[]
    cardType: "endingSoon" | "scheduled" | "ended"
  }) => {
    const handleGroupClick = () => {
      setSelectedGroupName(groupName)
      setSelectedGroupCampaigns(campaigns)
      setShowGroupDetailsModal(true)
    }

    return (
      <div
        className="campaign-item"
        style={{ cursor: 'pointer', borderLeft: '3px solid hsl(271 91% 55%)' }}
        onClick={handleGroupClick}
      >
        <div className="campaign-item__header">
          <h4 className="campaign-item__title">{groupName}</h4>
          <span className="campaign-item__badge campaign-item__badge--weekend">{campaigns.length}</span>
        </div>

        <div className="campaign-item__meta">
          UIDs: {campaigns.slice(0, 2).map((c) => c.uid).join(", ")}
          {campaigns.length > 2 && ` +${campaigns.length - 2} მეტი`}
        </div>

        <div className="campaign-item__badges" style={{ marginTop: '0.375rem' }}>
          {campaigns.slice(0, 3).map((campaign) => (
            <span
              key={campaign.id}
              className={`campaign-item__badge ${campaign.enabled ? "campaign-item__badge--enabled" : "campaign-item__badge--disabled"}`}
            >
              {campaign.enabled ? "✓" : "✗"}
            </span>
          ))}
        </div>
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
            <h1 className="page-header__title page-header__title--green">კამპანიები</h1>
          </div>

          <div className="page-header__right">
            <ThemeToggle />
            {userInfo && (
              <>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="page-header__user-btn"
                >
                  <div className="page-header__avatar page-header__avatar--green">
                    {getInitials(userInfo.firstName, userInfo.lastName)}
                  </div>
                  <div className="page-header__user-info">
                    <div className="page-header__user-name">
                      {userInfo.firstName} {userInfo.lastName}
                    </div>
                    <div className="page-header__user-role">{userInfo.role}</div>
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
          <h3 className="filter-card__title">ფილტრები და პარამეტრები</h3>

          <div className="filter-card__grid">
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
              <label className="filter-card__field-label">ძებნა კამპანიის სახელით</label>
              <div className="dashboard__filters-search">
                <Search />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="კამპანიის სახელი..."
                />
              </div>
            </div>
          </div>

          <div className="filter-card__controls">
            <div>
              <label className="filter-card__controls-label">სვეტების ხილვადობა</label>
              <div className="filter-card__controls-row">
                <Button
                  variant={columnVisibility.endingSoon ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleColumnVisibility("endingSoon")}
                  className="flex items-center gap-2"
                >
                  {columnVisibility.endingSoon ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  მალე დასრულდება
                </Button>
                <Button
                  variant={columnVisibility.scheduled ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleColumnVisibility("scheduled")}
                  className="flex items-center gap-2"
                >
                  {columnVisibility.scheduled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  დაგეგმილი
                </Button>
                <Button
                  variant={columnVisibility.ended ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleColumnVisibility("ended")}
                  className="flex items-center gap-2"
                >
                  {columnVisibility.ended ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  დასრულებული
                </Button>
              </div>
            </div>

            <div>
              <label className="filter-card__controls-label">დაჯგუფება</label>
              <Button
                variant={isGroupingEnabled ? "default" : "outline"}
                size="sm"
                onClick={handleGroupingToggle}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-none"
              >
                <Search className="h-4 w-4" />
                {isGroupingEnabled ? "დაჯგუფება ჩართული" : "კამპანიების დაჯგუფება"}
              </Button>
            </div>
          </div>
        </div>

        <div className="columns-grid columns-grid--3">
          {columnVisibility.endingSoon && (
            <div className="column-card">
              <div className="column-card__header">
                <h2 className="column-card__title column-card__title--red">
                  მალე დასრულდება - {dayRange} დღე ({filterCampaigns(endingSoonCampaigns).length})
                </h2>
              </div>
              <div className="column-card__body">
                {filterCampaigns(endingSoonCampaigns).length > 0 ? (
                  filterCampaigns(endingSoonCampaigns).map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} cardType="endingSoon" />
                  ))
                ) : (
                  <div className="column-card__empty">მომდევნო {dayRange} დღეში არ სრულდება კამპანიები</div>
                )}
              </div>
            </div>
          )}

          {columnVisibility.scheduled && (
            <div className="column-card">
              <div className="column-card__header">
                <h2 className="column-card__title column-card__title--blue">
                  დაგეგმილი - {dayRange} დღე ({filterCampaigns(scheduledCampaigns).length})
                </h2>
              </div>
              <div className="column-card__body">
                {filterCampaigns(scheduledCampaigns).length > 0 ? (
                  filterCampaigns(scheduledCampaigns).map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} showStartDate={true} cardType="scheduled" />
                  ))
                ) : (
                  <div className="column-card__empty">მომდევნო {dayRange} დღეში არ იწყება კამპანიები</div>
                )}
              </div>
            </div>
          )}

          {columnVisibility.ended && (
            <div className="column-card">
              <div className="column-card__header">
                <h2 className="column-card__title column-card__title--gray">
                  დასრულებული - {dayRange} დღე ({filterCampaigns(endedCampaigns).length})
                </h2>
              </div>
              <div className="column-card__body">
                {filterCampaigns(endedCampaigns).length > 0 ? (
                  filterCampaigns(endedCampaigns).map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} cardType="ended" />
                  ))
                ) : (
                  <div className="column-card__empty">გასული {dayRange} დღეში არ დასრულებულა კამპანიები</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Grouping Modal */}
        <Dialog
          open={showGroupingModal}
          onOpenChange={(open) => {
            setShowGroupingModal(open)
            if (!open) {
              setIsGroupingEnabled(false)
            }
          }}
        >
          <DialogContent className="dialog-content max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">დაჯგუფებული კამპანიები</DialogTitle>
            </DialogHeader>

            {Object.keys(groupedCampaigns).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="dashboard__filters-search">
                  <Search />
                  <input type="text" placeholder="ძებნა დაჯგუფებულ კამპანიებში..." />
                </div>

                <div className="columns-grid columns-grid--3">
                  <div className="column-card">
                    <div className="column-card__header">
                      <h2 className="column-card__title column-card__title--red">მალე დასრულდება</h2>
                    </div>
                    <div className="column-card__body">
                      {Object.entries(groupedCampaigns)
                        .filter(([_, campaigns]) =>
                          campaigns.some((c) => endingSoonCampaigns.some((ec) => ec.id === c.id)),
                        )
                        .map(([groupName, campaigns]) => (
                          <GroupedCampaignCard key={groupName} groupName={groupName} campaigns={campaigns} cardType="endingSoon" />
                        ))}
                    </div>
                  </div>

                  <div className="column-card">
                    <div className="column-card__header">
                      <h2 className="column-card__title column-card__title--blue">დაგეგმილი</h2>
                    </div>
                    <div className="column-card__body">
                      {Object.entries(groupedCampaigns)
                        .filter(([_, campaigns]) =>
                          campaigns.some((c) => scheduledCampaigns.some((sc) => sc.id === c.id)),
                        )
                        .map(([groupName, campaigns]) => (
                          <GroupedCampaignCard key={groupName} groupName={groupName} campaigns={campaigns} cardType="scheduled" />
                        ))}
                    </div>
                  </div>

                  <div className="column-card">
                    <div className="column-card__header">
                      <h2 className="column-card__title column-card__title--gray">დასრულებული</h2>
                    </div>
                    <div className="column-card__body">
                      {Object.entries(groupedCampaigns)
                        .filter(([_, campaigns]) =>
                          campaigns.some((c) => endedCampaigns.some((ec) => ec.id === c.id)),
                        )
                        .map(([groupName, campaigns]) => (
                          <GroupedCampaignCard key={groupName} groupName={groupName} campaigns={campaigns} cardType="ended" />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="column-card__empty">დაჯგუფებული კამპანიები არ მოიძებნა</div>
            )}
          </DialogContent>
        </Dialog>

        {/* Group Details Modal */}
        <Dialog open={showGroupDetailsModal} onOpenChange={setShowGroupDetailsModal}>
          <DialogContent className="dialog-content max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">
                {selectedGroupName} - დეტალები ({selectedGroupCampaigns.length} კამპანია)
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Group URL */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">Landing URL:</label>
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-mono">
                      https://crocobet.com/landings/{selectedGroupName?.toLowerCase().replace(/\s+/g, "")}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = `https://crocobet.com/landings/${selectedGroupName?.toLowerCase().replace(/\s+/g, "")}`
                      window.open(url, "_blank")
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Campaign Details */}
              <div className="space-y-3">
                {selectedGroupCampaigns.map((campaign) => (
                  <div key={campaign.id} className="campaign-item" style={{ borderLeft: '4px solid var(--color-blue-500, #3b82f6)' }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-foreground">ID: </span>
                            <span className="text-sm text-muted-foreground font-mono">{campaign.id}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-foreground">UID: </span>
                            <span className="text-sm text-muted-foreground font-mono">{campaign.uid}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-foreground">ტიპი: </span>
                            <span className="campaign-item__badge campaign-item__badge--type">
                              {campaign.type}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-foreground">სტატუსი: </span>
                            <span className={`campaign-item__badge ${campaign.enabled ? 'campaign-item__badge--enabled' : 'campaign-item__badge--disabled'}`}>
                              {campaign.enabled ? "ჩართული" : "გამორთული"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-foreground">დაწყება: </span>
                            <span className="text-sm text-muted-foreground">{formatDate(campaign.startDate)}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-foreground">დასრულება: </span>
                            <span className="text-sm text-muted-foreground">{formatDate(campaign.endDate)}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-foreground">ვერსია: </span>
                            <span className="text-sm text-muted-foreground">{campaign.version}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(campaign.id)} className="h-8">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              რედაქტირება
                            </Button>
                          </div>
                        </div>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
