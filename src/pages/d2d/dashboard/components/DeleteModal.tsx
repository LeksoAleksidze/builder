import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@d2d-ui/ui/dialog"
import { Button } from "@d2d-ui/ui/button"
import { Alert, AlertDescription } from "@d2d-ui/ui/alert"
import { Loader2, Trash2, X, AlertTriangle } from "lucide-react"
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
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Trash2 className="h-5 w-5 text-red-600" />
            წაშლის დადასტურება
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">ნამდვილად გსურთ წაშლა?</p>
              <p className="text-xs text-red-700 dark:text-red-300">{promotion.title}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
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
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              დახურვა
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  იშლება...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
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
