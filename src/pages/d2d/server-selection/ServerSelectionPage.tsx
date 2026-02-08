import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@d2d-ui/ui/card"
import { Button } from "@d2d-ui/ui/button"
import { ThemeToggle } from "@d2d-ui/theme-toggle"
import { Server, Calendar, Megaphone, LogOut } from "lucide-react"
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

export function ServerSelectionPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [showProfileModal, setShowProfileModal] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      navigate("/login")
    } else {
      fetchUserInfo(token)
    }
  }, [navigate])

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

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    navigate("/login")
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const handleSelection = (type: string) => {
    switch (type) {
      case "server":
        navigate("/d2d-dashboard")
        break
      case "campaigns":
        navigate("/campaigns")
        break
      case "headers":
        navigate("/headers")
        break
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/85 backdrop-blur-xl sticky top-0 z-10" style={{ boxShadow: 'var(--shadow-xs)' }}>
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              D2D Dashboard
            </h1>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              {userInfo && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-2 hover:bg-accent rounded-lg p-2 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs font-semibold">
                      {getInitials(userInfo.firstName, userInfo.lastName)}
                    </div>
                    <div className="text-sm hidden sm:block">
                      <div className="font-medium text-foreground">
                        {userInfo.firstName} {userInfo.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">{userInfo.role}</div>
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

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">აირჩიეთ სერვისი</h2>
          <p className="text-base text-muted-foreground">რომელ სერვისთან გსურთ მუშაობა?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {/* Server Management */}
          <Card className="group cursor-pointer transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-600" style={{ boxShadow: 'var(--shadow-card)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}>
            <CardHeader className="text-center pb-3">
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105" style={{ boxShadow: '0 4px 12px rgb(59 130 246 / 0.25)' }}>
                <Server className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-lg text-foreground">აქციების მართვა</CardTitle>
              <CardDescription className="text-sm">აქციების მართვა, deploy-ები და კონფიგურაცია</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleSelection("server")}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium"
              >
                გადასვლა
              </Button>
            </CardContent>
          </Card>

          {/* Campaigns */}
          <Card className="group cursor-pointer transition-all duration-200 hover:border-green-400 dark:hover:border-green-600" style={{ boxShadow: 'var(--shadow-card)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}>
            <CardHeader className="text-center pb-3">
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105" style={{ boxShadow: '0 4px 12px rgb(34 197 94 / 0.25)' }}>
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-lg text-foreground">კამპანიები</CardTitle>
              <CardDescription className="text-sm">აქციის მიმდინარეობები, სტატისტიკა და ანალიტიკა</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleSelection("campaigns")}
                className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-medium"
              >
                გადასვლა
              </Button>
            </CardContent>
          </Card>

          {/* Headers */}
          <Card className="group cursor-pointer transition-all duration-200 hover:border-purple-400 dark:hover:border-purple-600 sm:col-span-2 lg:col-span-1" style={{ boxShadow: 'var(--shadow-card)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}>
            <CardHeader className="text-center pb-3">
              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105" style={{ boxShadow: '0 4px 12px rgb(147 51 234 / 0.25)' }}>
                <Megaphone className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-lg text-foreground">ჰედერები</CardTitle>
              <CardDescription className="text-sm">ჰედერების მართვა, კონტენტი და დიზაინი</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleSelection("headers")}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-medium"
              >
                გადასვლა
              </Button>
            </CardContent>
          </Card>
        </div>
        {/* Profile Modal */}
        {userInfo && (
          <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} userInfo={userInfo} />
        )}
      </main>
    </div>
  )
}
