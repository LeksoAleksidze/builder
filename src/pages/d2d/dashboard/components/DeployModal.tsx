import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@d2d-ui/ui/dialog"
import { Button } from "@d2d-ui/ui/button"
import { Alert, AlertDescription } from "@d2d-ui/ui/alert"
import { Loader2, Rocket, X, AlertTriangle, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { DOMAIN_URL } from "../../../../shared/services/api"

interface DeployModalProps {
  isOpen: boolean
  onClose: () => void
  promotion: {
    promotionId: number
    branch: string
    url: string
    title: string
  }
  onSuccess: () => void
}

export function DeployModal({ isOpen, onClose, promotion, onSuccess }: DeployModalProps) {
  const [loading, setLoading] = useState(false)
  const [cacheLoading, setCacheLoading] = useState(false) // ქეშის სტეიტი
  const [error, setError] = useState("")
  const [timer, setTimer] = useState<number>(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => (prev <= 1 ? 0 : prev - 1))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  const handleDeploy = async () => {
    setLoading(true)
    setTimer(10)
    setError("")

    try {
      const token = localStorage.getItem("authToken")

      // 1. ძირითადი Deploy რექვესთი
      const deployResponse = await fetch(`${DOMAIN_URL}/gitlab/deploy/${promotion.promotionId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          branch: promotion.branch,
          folder: promotion.url,
          promotionId: promotion.promotionId,
        }),
      })

      const deployData = await deployResponse.json()

      if (deployData.status) {
        // 2. თუ დეპლოი წარმატებულია, ვიწყებთ ქეშის გასუფთავებას
        setLoading(false)
        setCacheLoading(true)

        const cacheResponse = await fetch(`${DOMAIN_URL}/promotion/cache-clear/${promotion.promotionId}`, {
          method: "POST", // ან POST, გააჩნია თქვენს API-ს
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const cacheData = await cacheResponse.json()

        if (cacheData.status || cacheResponse.ok) {
        setTimeout(() =>   onSuccess(), 1000)
        } else {
          setError("დეპლოი წარმატებით დასრულდა, მაგრამ ქეში ვერ გასუფთავდა")
          setCacheLoading(false)
        }
      } else {
        setError(deployData.body?.message || "Deploy-ის შეცდომა")
        setLoading(false)
      }
    } catch (error) {
      setError("სერვერთან კავშირის შეცდომა")
      setLoading(false)
      setCacheLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading && !cacheLoading) {
      onClose()
    }
  }

  return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md" onPointerDownOutside={(e) => (loading || cacheLoading) && e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Rocket className="h-5 w-5 text-blue-600" />
              Deploy დადასტურება
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* დეტალების ბლოკი */}
            <div className="space-y-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border">
              <p className="font-semibold text-foreground mb-1">Title: {promotion.title}</p>
              <div className="grid grid-cols-2 gap-1">
                <span><strong>Branch:</strong> {promotion.branch}</span>
                <span><strong>ID:</strong> {promotion.promotionId}</span>
              </div>
            </div>

            {error && (
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-3">
              {/* Deploy-ის სტატუსი */}
              {loading && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Deploy მიმდინარეობს... ({timer}წმ)</span>
                  </div>
              )}

              {/* ქეშის გასუფთავების სტატუსი */}
              {cacheLoading && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">მიმდინარეობს ქეშის გასუფთავება...</span>
                  </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={handleClose} disabled={loading || cacheLoading}>
                  <X className="h-4 w-4 mr-2" />
                  არა
                </Button>
                <Button
                    onClick={handleDeploy}
                    disabled={loading || cacheLoading}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {loading || cacheLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        პროცესშია...
                      </>
                  ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        დიახ, გაშვება
                      </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  )
}
