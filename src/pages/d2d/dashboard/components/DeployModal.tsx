import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@d2d-ui/ui/dialog"
import { Button } from "@d2d-ui/ui/button"
import { Alert, AlertDescription } from "@d2d-ui/ui/alert"
import { Loader2, Rocket, AlertTriangle, RefreshCw } from "lucide-react"
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
    let interval: ReturnType<typeof setInterval>
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
        <DialogContent className="dialog-content max-w-md" onPointerDownOutside={(e) => (loading || cacheLoading) && e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-blue-500" />
              Deploy დადასტურება
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5 text-[12px] text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/40">
              <p className="font-medium text-[13px] text-foreground">{promotion.title}</p>
              <div className="grid grid-cols-2 gap-1">
                <span><strong>Branch:</strong> {promotion.branch}</span>
                <span><strong>ID:</strong> {promotion.promotionId}</span>
              </div>
            </div>

            {error && (
                <Alert className="border-red-200/50 bg-red-50 dark:border-red-800/30 dark:bg-red-950/20">
                  <AlertDescription className="text-red-700 dark:text-red-300 text-[13px]">{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2.5">
              {loading && (
                  <div className="flex items-center gap-2 p-2.5 bg-blue-50 dark:bg-blue-950/15 rounded-lg border border-blue-200/40 dark:border-blue-800/25 animate-pulse">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                    <span className="text-[13px] font-medium text-blue-700 dark:text-blue-300">Deploy მიმდინარეობს... ({timer}წმ)</span>
                  </div>
              )}

              {cacheLoading && (
                  <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/15 rounded-lg border border-emerald-200/40 dark:border-emerald-800/25">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                    <span className="text-[13px] font-medium text-emerald-700 dark:text-emerald-300">მიმდინარეობს ქეშის გასუფთავება...</span>
                  </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border/40">
                <Button variant="outline" size="sm" onClick={handleClose} disabled={loading || cacheLoading}>
                  არა
                </Button>
                <Button
                    size="sm"
                    onClick={handleDeploy}
                    disabled={loading || cacheLoading}
                >
                  {loading || cacheLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        პროცესშია...
                      </>
                  ) : (
                      <>
                        <Rocket className="h-3.5 w-3.5 mr-1.5" />
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
