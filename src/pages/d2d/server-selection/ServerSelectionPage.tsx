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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              D2D Dashboard
            </h1>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              {userInfo && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-2 hover:bg-accent rounded-lg p-2 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center text-sm font-medium">
                      {getInitials(userInfo.firstName, userInfo.lastName)}
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">
                        {userInfo.firstName} {userInfo.lastName}
                      </div>
                      <div className="text-muted-foreground">{userInfo.role}</div>
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
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">აირჩიეთ სერვისი</h2>
          <p className="text-xl text-muted-foreground">რომელ სერვისთან გსურთ მუშაობა?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Server Management */}
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-blue-500">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                <Server className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">აქციების მართვა</CardTitle>
              <CardDescription>აქციების მართვა, deploy-ები და კონფიგურაცია</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleSelection("server")}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                გადასვლა
              </Button>
            </CardContent>
          </Card>

          {/* Campaigns */}
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-green-500">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">კამპანიები</CardTitle>
              <CardDescription>აქციის მიმდინარეობები, სტატისტიკა და ანალიტიკა</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleSelection("campaigns")}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                გადასვლა
              </Button>
            </CardContent>
          </Card>

          {/* Headers */}
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-purple-500">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                <Megaphone className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">ჰედერები</CardTitle>
              <CardDescription>ჰედერების მართვა, კონტენტი და დიზაინი</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleSelection("headers")}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
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
