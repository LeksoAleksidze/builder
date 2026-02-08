import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@d2d-ui/ui/dialog"
import { Button } from "@d2d-ui/ui/button"
import { Input } from "@d2d-ui/ui/input"
import { Label } from "@d2d-ui/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@d2d-ui/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@d2d-ui/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@d2d-ui/ui/avatar"
import { Badge } from "@d2d-ui/ui/badge"
import { Alert, AlertDescription } from "@d2d-ui/ui/alert"
import { Loader2, User, Shield, Calendar, Mail, Save, Settings } from "lucide-react"
import { ThemeSelector } from "@d2d-ui/theme-selector"
import { DOMAIN_URL } from "../../../../shared/services/api"

interface UserInfo {
  userId: number
  firstName: string
  lastName: string
  email: string
  role: string
  stack: string
  createdAt: string
}

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userInfo: UserInfo
}

export function ProfileModal({ isOpen, onClose, userInfo }: ProfileModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ka-GE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24-hour format
    })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "EDITOR":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "ADMIN":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "USER":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const isPasswordFormValid = () => {
    return (
      passwordData.currentPassword.trim() !== "" &&
      passwordData.newPassword.trim() !== "" &&
      passwordData.confirmPassword.trim() !== "" &&
      passwordData.newPassword === passwordData.confirmPassword &&
      passwordData.newPassword.length >= 6
    )
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError("ყველა ველის შევსება სავალდებულოა")
      setLoading(false)
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("ახალი პაროლები არ ემთხვევა")
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError("პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო")
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${DOMAIN_URL}/auth/change-password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()
      if (data.status) {
        setSuccess("პაროლი წარმატებით შეიცვალა")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        // Display the error message from API response body
        setError(data.body || "პაროლის შეცვლის შეცდომა")
      }
    } catch (error) {
      setError("სერვერთან კავშირის შეცდომა")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dialog-content dialog-scrollable max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>პროფილი</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              პირადი ინფორმაცია
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              უსაფრთხოება
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              პარამეტრები
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl">
                      {getInitials(userInfo.firstName, userInfo.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-2xl text-foreground">
                  {userInfo.firstName} {userInfo.lastName}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  <Badge className={getRoleBadgeColor(userInfo.role)}>{userInfo.role} / {userInfo.stack}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">სახელი</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{userInfo.firstName}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">გვარი</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{userInfo.lastName}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">ელ. ფოსტა</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{userInfo.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">რეგისტრაციის თარიღი</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{formatDate(userInfo.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Shield className="h-5 w-5" />
                  პაროლის შეცვლა
                </CardTitle>
                <CardDescription>უსაფრთხოების მიზნით, რეგულარულად შეცვალეთ თქვენი პაროლი</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">მიმდინარე პაროლი *</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="შეიყვანეთ მიმდინარე პაროლი"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">ახალი პაროლი *</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="შეიყვანეთ ახალი პაროლი"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">გაიმეორეთ ახალი პაროლი *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="გაიმეორეთ ახალი პაროლი"
                    />
                  </div>

                  {error && (
                    <Alert className="border-red-200/50 bg-red-50 dark:border-red-800/30 dark:bg-red-950/20">
                      <AlertDescription className="text-red-700 dark:text-red-300 text-[13px]">{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200/50 bg-green-50 dark:border-green-800/30 dark:bg-green-950/20">
                      <AlertDescription className="text-green-700 dark:text-green-300 text-[13px]">{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" disabled={loading || !isPasswordFormValid()} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        იცვლება...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        პაროლის შეცვლა
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Settings className="h-5 w-5" />
                  გარეგნული პარამეტრები
                </CardTitle>
                <CardDescription>აირჩიეთ თქვენთვის სასურველი თემა</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-foreground">თემის არჩევა</Label>
                  <ThemeSelector />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-3 border-t border-border/40" style={{ padding: '0.75rem 1.75rem 1.25rem', margin: 0 }}>
          <Button variant="outline" size="sm" onClick={onClose}>
            დახურვა
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
