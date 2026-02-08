import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@d2d-ui/ui/dialog"
import { Button } from "@d2d-ui/ui/button"
import { Alert, AlertDescription } from "@d2d-ui/ui/alert"
import { Loader2, Trash2, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { DOMAIN_URL } from "../../../../shared/services/api"

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  promotion: {
    promotionId: number
    title: string
    jira: string
    url: string
  }
  onSuccess: () => void
}

export function DeleteModal({ isOpen, onClose, promotion, onSuccess }: DeleteModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${DOMAIN_URL}/promotion/delete/${promotion.promotionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      if (data.status) {
        onSuccess()
      } else {
        setError("წაშლის შეცდომა")
      }
    } catch (error) {
      setError("სერვერთან კავშირის შეცდომა")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="dialog-content max-w-md" onPointerDownOutside={(e) => loading && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-red-500" />
            წაშლის დადასტურება
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/15 rounded-lg border border-red-200/40 dark:border-red-800/20">
            <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-0.5">
              <p className="text-[13px] font-medium text-red-800 dark:text-red-200">ნამდვილად გსურთ წაშლა?</p>
              <p className="text-[12px] text-red-600/70 dark:text-red-300/70">{promotion.title}</p>
            </div>
          </div>

          <div className="space-y-1.5 text-[12px] text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border/30">
            <div>
              <strong>JIRA:</strong> {promotion.jira}
            </div>
            <div>
              <strong>URL:</strong> {promotion.url}
            </div>
            <div>
              <strong>ID:</strong> {promotion.promotionId}
            </div>
          </div>

          {error && (
            <Alert className="border-red-200/50 bg-red-50 dark:border-red-800/30 dark:bg-red-950/20">
              <AlertDescription className="text-red-700 dark:text-red-300 text-[13px]">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border/40">
            <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
              დახურვა
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              variant="destructive"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  იშლება...
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  დიახ, წაშლა
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
