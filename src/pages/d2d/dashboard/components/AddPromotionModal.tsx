import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@d2d-ui/ui/dialog"
import { Button } from "@d2d-ui/ui/button"
import { Input } from "@d2d-ui/ui/input"
import { Label } from "@d2d-ui/ui/label"
import { D2DSelect } from "@d2d-ui/ui/d2d-select"
import { Checkbox } from "@d2d-ui/ui/checkbox"
import { Alert, AlertDescription } from "@d2d-ui/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@d2d-ui/ui/tooltip"
import { Loader2, Save, Calendar, Info, Settings } from "lucide-react"
import { DOMAIN_URL } from "../../../../shared/services/api"
import { Dialog as StarterDialog, DialogContent as StarterDialogContent, DialogHeader as StarterDialogHeader, DialogTitle as StarterDialogTitle } from "@d2d-ui/ui/dialog"

interface Branch {
  name: string
  url: string
}

interface Promotion {
  promotionId: number
  branch: string
  jira: string
  title: string
  startDate: string
  endDate: string
  hasMoveJob: boolean
  commitHash: string
  place: string
  url: string
  design: string
  type: "VISIBLE" | "HIDDEN"
  category: string
  createdAt: string
  origin: string
  approvesHistory: []
  lastDeployTime: string | null
  approves: Array<{
    userId: number
    firstName: string
    lastName: string
    email: string
  }>
  projectId: string
}

interface AddPromotionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editPromotion?: Promotion   | any
  currentUserId?: number
  userRole?: string
  userStack?: string
  isFromArchived?: boolean
}

const CATEGORIES = ["SLOT", "FAST", "P2P", "CRM", "SPORT", "CASINO", "POKER", "VERIFICATION"]
const SEGMENTS = ["VISIBLE", "HIDDEN"]
const TYPES = ["WHEEL", "LEADERBOARD","CASHBACK", "MANUAL", "WELCOME","RAFFLE"]

export function AddPromotionModal({
                                    isOpen,
                                    onClose,
                                    onSuccess,
                                    editPromotion,
                                    currentUserId,
                                    userRole,
                                    userStack,
                                    isFromArchived = false,
                                  }: AddPromotionModalProps) {
  const [branches, setBranches] = useState<Branch[]>([])
  const [repositoryYrl, setRepositoryUrl] = useState<{ url: string, ssh: string } | null>(null)
  const [commits, setCommits] = useState<{prod: [], all: []}>({prod: [], all:[]})
  const [loading, setLoading] = useState(false)
  const [branchesLoading, setBranchesLoading] = useState(false)
  const [error, setError] = useState("")
  const isEditMode = !!editPromotion && editPromotion.promotionId !== 0
  const isArchivedPromotion = isFromArchived && editPromotion?.place === "archived"
  const navigate = useNavigate()
  const [showOverwriteOption, setShowOverwriteOption] = useState(false)

  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [selectedComponents, setSelectedComponents] = useState<string[]>([])
  const [generalConfig, setGeneralConfig] = useState("")
  const [wheelFiles, setWheelFiles] = useState({
    frame: null as File | null,
    prizes: null as File | null,
    header: null as File | null,
    footer: null as File | null,
  })
  const [leaderboardFiles, setLeaderboardFiles] = useState({
    header: null as File | null,
    footer: null as File | null,
    background: null as File | null,
  })
  const [galleryFiles, setGalleryFiles] = useState({
    header: null as File | null,
    footer: null as File | null,
    thumbnails: null as File | null,
  })


  // Starter modal states
  const [showStarterModal, setShowStarterModal] = useState(false)

  const [starterProjectId, setStarterProjectId] = useState('')

  useEffect(() => {
    if(isOpen) {
      setShowStarterModal(!isEditMode && !editPromotion?.isCloned)
    }


  }, [isOpen, isEditMode])


  const [approvalHistory, setApprovalHistory] = useState<any[]>([])


  // Form state
  const [formData, setFormData] = useState({
    origin: "",
    category: "",
    commitHash: "",
    type: "",
    segment: "",
    title: "",
    jira: "",
    url: "",
    design: "",
    place: "private",
    startDate: "",
    endDate: "",
    createGitlab: false,
    branch: "promo/",
    hasMoveJob: false,
    redirectUrl: '',
    // New checkboxes for edit mode
    approvePromotion: false,
    overwriteFile: false,
    addToJobs: false,
    projectId: "",
  })

  // Add form validation helper
  const isFormValid = () => {
    if (!isEditMode) {
      // For add mode, check all required fields
      return (
          formData.category &&
          formData.type &&
          formData.title &&
          formData.jira &&
          formData.design &&
          formData.startDate &&
          formData.endDate &&
          formData.url &&
          (branches.length === 0 || formData.origin) && // Only require origin if branches are available
          (!formData.createGitlab || formData.branch.trim() !== "promo/")  && // Only require branch name if creating gitlab
          (formData.origin === 'redirect' ? formData.redirectUrl : true)
      )
    } else {
      // For edit mode, check required fields (excluding url and origin which are disabled)
      return (
          formData.category &&
          formData.type &&
          formData.title &&
          formData.jira &&
          formData.design &&
          formData.startDate &&
          formData.endDate
      )
    }
  }

  // Add a new state to track the original place
  const [originalPlace, setOriginalPlace] = useState("")

  // Check if current user has already approved
  const isAlreadyApproved = editPromotion?.approves.some((approve: any) => approve.userId === currentUserId) || false

  // Get available places based on current place
  const getAvailablePlaces = (currentPlace: string) => {
    switch (currentPlace) {
      case "private": // TESTING
        return [
          { value: "private", label: "TESTING" },
          { value: "crc", label: "PRODUCTION" },
        ]
      case "crc": // PRODUCTION
        return [
          { value: "crc", label: "PRODUCTION" },
          { value: "private", label: "TESTING" },
          { value: "archived", label: "FINISHED" },
        ]
      case "archived": // FINISHED
        return [
          { value: "archived", label: "FINISHED" },
          { value: "private", label: "TESTING" },
        ]
      default:
        return [
          { value: "private", label: "TESTING" },
          { value: "crc", label: "PRODUCTION" },
          { value: "archived", label: "FINISHED" },
        ]
    }
  }

  // Handle unauthorized responses
  const handleUnauthorized = (data: any) => {
    if (!data.status && data.body === "Unauthorized: Invalid token") {
      localStorage.removeItem("authToken")
      navigate("/login")
      return true
    }
    return false
  }

  // FIXED: open modal + clone projectId
  useEffect(() => {
    if (isOpen) {
      setError("")
      setShowOverwriteOption(false)

      if (editPromotion) {
        const projId = editPromotion.projectId
        setStarterProjectId(projId)
        fetchBranches(projId)
        fetchCommits(projId, editPromotion.branch)
        fetchRepository(projId)

        const startDate = editPromotion.startDate ? editPromotion.startDate.slice(0, 16) : ""
        const endDate = editPromotion.endDate ? editPromotion.endDate.slice(0, 16) : ""
        setOriginalPlace(editPromotion.place)
        setApprovalHistory(editPromotion.approvesHistory)

        const isClonedPromotion = editPromotion.promotionId === 0
        setFormData({
          origin: editPromotion.origin,
          category: editPromotion.category,
          type: editPromotion.type,
          title: editPromotion.title,
          jira: editPromotion.jira,
          url: editPromotion.url,
          design: editPromotion.design,
          place: editPromotion.place,
          startDate,
          endDate,
          createGitlab: !isClonedPromotion,
          branch: editPromotion.branch,
          hasMoveJob: editPromotion.hasMoveJob,
          approvePromotion: isAlreadyApproved,
          overwriteFile: false,
          addToJobs: editPromotion.hasMoveJob,
          commitHash: editPromotion.commitHash,
          segment: editPromotion.segment,
          redirectUrl: editPromotion.redirectUrl,
          projectId: projId,
        })
      } else {
        setFormData({
          origin: "",
          category: "",
          type: "",
          segment: "",
          title: "",
          jira: "",
          url: "",
          design: "",
          place: "private",
          startDate: "",
          endDate: "",
          createGitlab: false,
          branch: "promo/",
          hasMoveJob: false,
          approvePromotion: false,
          overwriteFile: false,
          addToJobs: false,
          commitHash: "",
          redirectUrl: "",
          projectId: "",
        })
      }

      setShowStarterModal(!isEditMode && !editPromotion?.isCloned)
    }
  }, [isOpen, editPromotion, isAlreadyApproved])

  // Auto-check createGitlab when origin is "main" in add mode
  useEffect(() => {
    if (!isEditMode) {
      if (formData.origin === "main") {
        setFormData((prev) => ({ ...prev, createGitlab: true }))
      } else if (formData.origin && formData.origin !== "main") {
        setFormData((prev) => ({ ...prev, createGitlab: false }))
      }
    }
  }, [formData.origin, isEditMode])

  // Fixed commit fetch
  const fetchCommits = async (projectId: string, branch: string) => {
    const token = localStorage.getItem("authToken")
    const res = await fetch(`${DOMAIN_URL}/gitlab/commits/${projectId}?branch=${branch}`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
    const data = await res.json()
    setCommits(data.body || { prod: [], all: [] })
  }

  const fetchBranches = async (projectId: string) => {
    setBranchesLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      const res = await fetch(`${DOMAIN_URL}/gitlab/branches/${projectId}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (handleUnauthorized(data)) return

      if (Array.isArray(data.body)) setBranches(data.body)
      else if (Array.isArray(data)) setBranches(data)
      else setBranches([])
    } catch (err) {
      console.error("Branch fetch error:", err)
      setError("ბრენჩების ჩატვირთვის შეცდომა")
    } finally {
      setBranchesLoading(false)
    }
  }

  const fetchRepository = async (projectId: string) => {
    try {
      const token = localStorage.getItem("authToken")
      const res = await fetch(`${DOMAIN_URL}/gitlab/repository/${projectId}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (handleUnauthorized(data)) return

      if (data.body) setRepositoryUrl(data.body)
      else setRepositoryUrl(null)
    } catch (err) {
      setError("რეპოზიტორის ჩატვირთვის შეცდომა")
    } finally {
    }
  }


  const formatDateForAPI = (dateString: string) => {
    if (!dateString) return ""
    const tbilisiOffset = "+0400"
    return dateString + ":00.000" + tbilisiOffset
  }

  const handleApprove = async (promotionId: number) => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${DOMAIN_URL}/promotion/approve/${promotionId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      if (handleUnauthorized(data)) return
      if (!data.status) {
        throw new Error("Approval failed")
      }
    } catch (error) {
      throw new Error("დადასტურების შეცდომა")
    }
  }

  const handleEnvironmentMove = async (promotionId: number, newPlace: string, overwrite: boolean) => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(
          `${DOMAIN_URL}/promotion/move/${promotionId}/${newPlace}?overwrite=${overwrite}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
      )

      const data = await response.json()
      if (handleUnauthorized(data)) return
      if (!data.status) {
        throw new Error(data.body.message || "Move failed")
      }
      return true
    } catch (error: any) {
      throw new Error(error.message || "გარემოს ცვლილების შეცდომა")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (
        !formData.category ||
        !formData.type ||
        !formData.title ||
        !formData.jira ||
        !formData.design ||
        !formData.startDate ||
        !formData.endDate
    ) {
      setError("ყველა ველის შევსება სავალდებულოა")
      setLoading(false)
      return
    }

    if (!isEditMode) {
      if (!formData.url) {
        setError("ყველა ველის შევსება სავალდებულოა")
        setLoading(false)
        return
      }
      if (branches.length > 0 && !formData.origin) {
        setError("ORIGIN ბრენჩის არჩევა სავალდებულოა")
        setLoading(false)
        return
      }
      if (formData.createGitlab && formData.branch.trim() === "promo/") {
        setError("ბრენჩის სახელი სავალდებულოა")
        setLoading(false)
        return
      }
    }

    try {
      const token = localStorage.getItem("authToken")

      if (isEditMode && editPromotion && originalPlace !== formData.place) {
        if (originalPlace === "private" && !editPromotion.lastDeployTime && editPromotion.branch !== '404' && editPromotion.branch !== 'redirect') {
          setError("გარემოს ცვლილებისთვის საჭიროა Deploy-ის გაკეთება")
          setLoading(false)
          return
        }

        if (formData.place === "crc" && (!editPromotion.approves || editPromotion.approves.length === 0)) {
          setError("PRODUCTION-ში გადასატანად აუცილებელია მინიმუმ ერთი დადასტურება")
          setLoading(false)
          return
        }

        try {
          await handleEnvironmentMove(editPromotion.promotionId, formData.place, formData.overwriteFile)
          onSuccess()
          return
        } catch (error: any) {
          if (error.message.includes("Destination folder already exists")) {
            setShowOverwriteOption(true)
            setError("Destination folder already exists - გთხოვთ მონიშნოთ 'სხვა ფაილზე გადაწერა' თუ გსურთ გადაწერა")
          } else {
            setError(error.message || "გარემოს ცვლილების შეცდომა")
          }
          setLoading(false)
          return
        }
      }

      const payload = {
        branch: formData.createGitlab ? formData.branch.trim() : formData.origin,
        jira: formData.jira,
        title: formData.title,
        origin: formData.origin,
        category: formData.category,
        type: formData.type,
        segment: formData.segment,
        startDate: formatDateForAPI(formData.startDate),
        endDate: formatDateForAPI(formData.endDate),
        hasMoveJob: formData.addToJobs,
        place: formData.place,
        url: formData.url,
        createGitlab: formData.createGitlab,
        design: formData.design,
        commitHash: formData.commitHash,
        redirectUrl: formData.redirectUrl,
        projectId: starterProjectId,
      }
      let response
      if (isEditMode && editPromotion) {
        response = await fetch(`${DOMAIN_URL}/promotion/one/${editPromotion.promotionId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
      } else {
        response = await fetch(`${DOMAIN_URL}/promotion/create`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
      }

      const data = await response.json()
      if (handleUnauthorized(data)) return
      if (data.status) {
        if (isEditMode && formData.approvePromotion && !isAlreadyApproved && editPromotion) {
          await handleApprove(editPromotion.promotionId)
        }
        onSuccess()
      } else {
        const errorMessage = data.body.message || (isEditMode ? "აქციის რედაქტირების შეცდომა" : "აქციის შექმნის შეცდომა")
        setError(errorMessage)
      }
    } catch (error) {
      setError("სერვერთან კავშირის შეცდომა")
    } finally {
      setLoading(false)
    }
  }

  const handleBranchChange = (value: string) => {
    const cleanValue = value.replace(/\s/g, "")
    if (!cleanValue.startsWith("promo/")) {
      setFormData({ ...formData, branch: "promo/" + cleanValue.replace("promo/", "") })
    } else {
      setFormData({ ...formData, branch: cleanValue })
    }
  }

  const getApprovalEmails = () => {
    if (!editPromotion?.approves || editPromotion.approves.length === 0) {
      return "დადასტურება არ არის"
    }
    return editPromotion.approves.map((approve: any) => approve.email).join(", ")
  }

  const availablePlaces = isEditMode
      ? getAvailablePlaces(editPromotion?.place || "private")
      : [
        { value: "private", label: "TESTING" },
        { value: "crc", label: "PRODUCTION" },
        { value: "archived", label: "FINISHED" },
      ]

  const StarterModal = (
        <StarterDialog open={showStarterModal}
                       onOpenChange={(open) => {
                         setShowStarterModal(open)
                         if (!open) onClose()
                         if (!open) setStarterProjectId('')
                       }}
        >
        <StarterDialogContent className="dialog-content max-w-md">
          <StarterDialogHeader className="text-center">
            <StarterDialogTitle>აირჩიე Project ID</StarterDialogTitle>
            <p className="text-[13px] text-muted-foreground mt-1">
              აირჩიე პროექტი ან ჩაწერე საკუთარი ID
            </p>
          </StarterDialogHeader>

          <div className="space-y-3">
            {
              userStack === 'ANGULAR' && (
                    <Button
                        variant={starterProjectId === "515" ? "default" : "outline"}
                        className={`w-full justify-center text-[15px] font-semibold py-5 rounded-lg transition ${
                            starterProjectId === "515"
                                ? ""
                                : "hover:bg-muted"
                        }`}
                        onClick={() => setStarterProjectId("515")}
                    >
                      STARTER – 515
                    </Button>
                )
            }

            {
                userStack === 'REACT' && (
                    <Button
                        variant={starterProjectId === "1221" ? "default" : "outline"}
                        className={`w-full justify-center text-[15px] font-semibold py-5 rounded-lg transition ${
                            starterProjectId === "1221"
                                ? ""
                                : "hover:bg-muted"
                        }`}
                        onClick={() => setStarterProjectId("1221")}
                    >
                      STARTER – 1221
                    </Button>
                )
            }

            <div className="space-y-1.5">
              <Label className="text-[13px]">ან ჩაწერე საკუთარი Project ID</Label>
              <Input
                  value={starterProjectId}
                  onChange={(e) => setStarterProjectId(e.target.value)}
                  placeholder="მაგ: 777"
              />
            </div>

            <div className="pt-2">
              <Button
                  className="w-full"
                  onClick={() => {
                    setStarterProjectId(starterProjectId)
                    fetchBranches(starterProjectId)
                    setShowStarterModal(false)
                  }}
              >
                გაგრძელება
              </Button>
            </div>
          </div>
        </StarterDialogContent>
      </StarterDialog>
  )

  return (
      <>
      {StarterModal}
      <Dialog open={isOpen}
              onOpenChange={(open) => {
                setShowStarterModal(open)
                if (!open) onClose()
                if (!open) setStarterProjectId('')
              }}
      >
        <DialogContent className="dialog-content dialog-scrollable max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "აქციის რედაქტირება" : "ახალი აქციის დამატება"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Edit mode action buttons */}
            {isEditMode && (
                <div className="flex flex-wrap gap-2">
                  <button
                      type="button"
                      onClick={() => setShowHistoryModal(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium bg-blue-50 dark:bg-blue-950/15 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30 rounded-md hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5"/>
                    History
                  </button>
                  {editPromotion && editPromotion.promotionId !== 0 && userStack?.includes('BUILDER') && (
                    <button
                        type="button"
                        onClick={() => {
                          window.open(
                            `/dashboard?branch=${editPromotion.branch}&url=${editPromotion.url}`,
                            '_blank'
                          );
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium bg-purple-50 dark:bg-purple-950/15 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/30 rounded-md hover:bg-purple-100 dark:hover:bg-purple-950/30 transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5"/>
                      კონფიგურაცია
                    </button>
                  )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Origin Branch - Disabled in edit mode or when no permission */}
              <div className="space-y-2">
                <Label htmlFor="origin" className=" font-normal">
                  ORIGIN ბრენჩი *
                </Label>
                <D2DSelect
                    value={formData.origin}
                    onValueChange={(value) => {
                      if (!isEditMode && value === "main" && formData.origin !== 'redirect') {
                        setFormData((prev) => ({...prev, origin: value, createGitlab: true}))
                      } else {
                        setFormData((prev) => ({...prev, origin: value}))
                      }
                      fetchCommits(starterProjectId, value).then()
                    }}
                    disabled={isEditMode || isArchivedPromotion}
                    searchable
                    searchPlaceholder="ძებნა ბრენჩებში..."
                    placeholder={
                      branchesLoading
                          ? "იტვირთება..."
                          : branches.length === 0
                              ? "ბრენჩები ჯერ არ ჩაიტვირთა"
                              : "აირჩიეთ ბრენჩი"
                    }
                    className={isEditMode ? "[&>button]:bg-muted" : ""}
                    options={branches.map((b) => ({ value: b.name, label: b.name }))}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className=" font-normal">
                  კატეგორია *
                </Label>
                <D2DSelect
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                    disabled={isArchivedPromotion}
                    placeholder="აირჩიეთ კატეგორია"
                    options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                />
              </div>

              {/* Commits */}
              <div className="space-y-2">
                <Label htmlFor="category" className=" font-normal">
                  ვერსია
                </Label>
                <D2DSelect
                    value={isEditMode ? editPromotion?.commitHash ?? "" : formData.commitHash}
                    onValueChange={(value) => setFormData({...formData, commitHash: value, createGitlab: true})}
                    disabled={isArchivedPromotion || !commits.prod.length || isEditMode}
                    placeholder="აირჩიეთ კომიტი"
                    options={commits.prod.map((commit: any) => ({ value: commit.hash, label: commit.hash }))}
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type" className=" font-normal">
                  სეგმენტი *
                </Label>
                <D2DSelect
                    value={formData.segment}
                    onValueChange={(value) => setFormData({...formData, segment: value})}
                    disabled={isArchivedPromotion}
                    placeholder="აირჩიეთ სეგმენტი"
                    options={SEGMENTS.map((s) => ({ value: s, label: s }))}
                />
              </div>

              {/* Place - Environment restrictions in edit mode */}
              <div className="space-y-2 relative">
                <Label htmlFor="place" className=" font-normal">
                  გარემო
                </Label>
                <D2DSelect
                    value={formData.place}
                    onValueChange={(value) => setFormData({...formData, place: value})}
                    disabled={editPromotion?.place === 'private' && !editPromotion?.approves?.length || !isEditMode || (isEditMode && userRole !== "EDITOR")}
                    className={!isEditMode || (isEditMode && userRole !== "EDITOR") ? "[&>button]:bg-muted" : ""}
                    options={availablePlaces.map((p) => ({ value: p.value, label: p.label }))}
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type" className=" font-normal">
                  ტიპი *
                </Label>
                <D2DSelect
                    value={formData.type}
                    onValueChange={(value) => setFormData({...formData, type: value})}
                    disabled={isArchivedPromotion}
                    placeholder="აირჩიეთ ტიპი"
                    options={TYPES.map((t) => ({ value: t, label: t }))}
                />
              </div>
            </div>


            {/* Text Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="title" className=" font-normal">
                  სათაური *
                </Label>
                <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="აქციის სათაური"
                    disabled={isArchivedPromotion }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jira" className=" font-normal">
                  ჯირას თასქი *
                </Label>
                <Input
                    id="jira"
                    value={formData.jira}
                    onChange={(e) => setFormData({...formData, jira: e.target.value})}
                    placeholder="მაგ: DPT-123"
                    disabled={isArchivedPromotion}
                />
              </div>

              {/* Server file name - Disabled in edit mode but not for cloned promotions */}
              <div className="space-y-2">
                <Label htmlFor="url" className=" font-normal">
                  სერვერზე ფაილის სახელი *
                </Label>
                <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z0-9-]/g, "")

                      setFormData({...formData, url: value})
                    }}
                    placeholder="ფაილის სახელი"
                    disabled={isEditMode && editPromotion && editPromotion.promotionId !== 0}
                    className={isEditMode && editPromotion && editPromotion.promotionId !== 0 ? "bg-muted" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="design" className=" font-normal">
                  დიზაინი *
                </Label>
                <Input
                    id="design"
                    value={formData.design}
                    onChange={(e) => setFormData({...formData, design: e.target.value})}
                    placeholder="დიზაინის URL ან აღწერა"
                    disabled={isArchivedPromotion}
                />
              </div>
            </div>

            {/* Date and Time Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="font-normal">
                  დასაწყისი *
                </Label>
                <div className="datepicker-group">
                  <div className="datepicker-group__date">
                    <Calendar />
                    <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate.split("T")[0] || ""}
                        onChange={(e) => {
                          const time = formData.startDate.split("T")[1] || "00:00"
                          setFormData({...formData, startDate: `${e.target.value}T${time}`})
                        }}
                        className="pl-10"
                        disabled={isArchivedPromotion}
                    />
                  </div>
                  <div className="datepicker-group__time">
                    <Input
                        type="text"
                        placeholder="HH:MM"
                        value={formData.startDate.split("T")[1] || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9:]/g, "")
                          const date = formData.startDate.split("T")[0] || ""
                          if (date) {
                            setFormData({...formData, startDate: `${date}T${value}`})
                          }
                        }}
                        onInput={(e) => {
                          let value = e.currentTarget.value.replace(/[^0-9]/g, "")
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + ":" + value.slice(2, 4)
                          }
                          e.currentTarget.value = value
                        }}
                        pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                        maxLength={8}
                        disabled={isArchivedPromotion}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="font-normal">
                  დასასრული *
                </Label>
                <div className="datepicker-group">
                  <div className="datepicker-group__date">
                    <Calendar />
                    <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate.split("T")[0] || ""}
                        onChange={(e) => {
                          const time = formData.endDate.split("T")[1] || "00:00"
                          setFormData({...formData, endDate: `${e.target.value}T${time}`})
                        }}
                        className="pl-10"
                        disabled={isArchivedPromotion}
                    />
                  </div>
                  <div className="datepicker-group__time">
                    <Input
                        type="text"
                        placeholder="HH:MM"
                        value={formData.endDate.split("T")[1] || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9:]/g, "")
                          const date = formData.endDate.split("T")[0] || ""
                          if (date) {
                            setFormData({...formData, endDate: `${date}T${value}`})
                          }
                        }}
                        onInput={(e) => {
                          let value = e.currentTarget.value.replace(/[^0-9]/g, "")
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + ":" + value.slice(2, 4)
                          }
                          e.currentTarget.value = value
                        }}
                        pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                        maxLength={8}
                        disabled={isArchivedPromotion}
                    />
                  </div>
                </div>
              </div>
            </div>

            {repositoryYrl && editPromotion?.branch !== 'redirect'  && editPromotion?.branch !== '404' && (
                <>
                  <div className="modal-form__repo-box">
                    <code>{repositoryYrl.ssh}</code>
                    <Button type="button" size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(repositoryYrl?.ssh)}>
                      დაკოპირება
                    </Button>
                  </div>
                  <div className="modal-form__repo-box" style={{ marginTop: '0.5rem' }}>
                    <code>{repositoryYrl.url}</code>
                    <Button type="button" size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(repositoryYrl?.url)}>
                      დაკოპირება
                    </Button>
                  </div>
                </>
            )}

            {/* GitLab Branch Creation */}
            <div className="space-y-3">
              { formData.origin !== '404' && formData.origin !== 'redirect' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                        id="createGitlab"
                        checked={formData.createGitlab}
                        onCheckedChange={(checked) => {
                          // Don't allow unchecking if origin is "main" in add mode
                          if (!isEditMode && (formData.origin === "main" || formData.commitHash?.length > 0)) {
                            return // Keep it checked
                          }
                          setFormData({...formData, createGitlab: !!checked})
                        }}
                        disabled={isEditMode || (!isEditMode && (formData.origin === "main" || formData.commitHash?.length > 0)) || isArchivedPromotion} // Disable if edit mode or if origin is main in add mode or archived
                    />
                    <Label htmlFor="createGitlab" className="text-sm font-medium  font-normal">
                      გითზე ბრენჩის
                      შექმნა {!isEditMode && (formData.origin === "main" || formData.commitHash?.length > 0)}
                    </Label>
                  </div>
              )
              }

              {formData.createGitlab && (
                  <div className="space-y-2">
                    <Label htmlFor="branch" className=" font-normal">
                      ბრენჩის სახელი *
                    </Label>
                    <Input
                        id="branch"
                        value={formData.branch}
                        onChange={(e) => handleBranchChange(e.target.value)}
                        placeholder="promo/your-branch-name"
                        className="font-mono"
                        disabled={isEditMode || isArchivedPromotion} // Disabled in edit mode or archived
                    />
                    <p className="text-xs text-muted-foreground">
                      ბრენჩის სახელი უნდა იწყებოდეს 'promo/' -ით და არ უნდა შეიცავდეს სფეისებს
                    </p>
                  </div>
              )}

              {formData.origin === 'redirect' && (
                  <div className="space-y-2">
                    <Label htmlFor="branch" className=" font-normal">
                     NEW URL
                    </Label>
                    <Input
                        id="branch"
                        value={formData.redirectUrl}
                        onChange={(e) =>
                            setFormData({...formData, redirectUrl: e.target.value})
                    }
                        placeholder="https://example.com"
                        className="font-mono"
                        disabled={isEditMode || isArchivedPromotion}
                    />
                    <p className="text-xs text-muted-foreground">
                  აუცილებელია სრული ლინკი, https://
                    </p>
                  </div>
              )}
            </div>

            {/* Edit Mode Additional Checkboxes */}
            {isEditMode && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                  <h3 className="text-[13px] font-medium text-foreground/85">დამატებითი პარამეტრები</h3>

                  { editPromotion?.place !== "archived" && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                            id="approvePromotion"
                            checked={formData.approvePromotion}
                            onCheckedChange={(checked) => {
                              // Don't allow unchecking if already approved
                              if (!isAlreadyApproved) {
                                setFormData({...formData, approvePromotion: !!checked})
                              }
                            }}
                            disabled={isAlreadyApproved || isArchivedPromotion || editPromotion?.place === "crc"} // Disable if already approved or archived
                        />
                        <Label htmlFor="approvePromotion" className="text-sm font-medium  font-normal">
                          დადასტურება {isAlreadyApproved && "(უკვე დადასტურებული)"}
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help"/>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs max-w-xs">{getApprovalEmails()}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                  )}

                  {showOverwriteOption && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                            id="overwriteFile"
                            checked={formData.overwriteFile}
                            onCheckedChange={(checked) => setFormData({...formData, overwriteFile: !!checked})}
                            disabled={isArchivedPromotion}
                        />
                        <Label htmlFor="overwriteFile" className="text-sm font-medium  font-normal">
                          სხვა ფაილზე გადაწერა
                        </Label>
                      </div>
                  )}

                  {editPromotion?.place !== "archived" && editPromotion?.approves?.length > 0  && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                            id="addToJobs"
                            checked={formData.addToJobs}
                            onCheckedChange={(checked) => setFormData({...formData, addToJobs: !!checked})}
                            disabled={isArchivedPromotion || !editPromotion?.lastDeployTime}
                        />
                        <Label htmlFor="addToJobs" className="text-sm font-medium  font-normal">
                          ავტომატური გაშვება
                        </Label>
                      </div>
                  )}
                </div>
            )}

            {error && (
                <Alert className="border-red-200/50 bg-red-50 dark:border-red-800/30 dark:bg-red-950/20">
                  <AlertDescription className="text-red-700 dark:text-red-300 text-[13px]">{error}</AlertDescription>
                </Alert>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-border/40">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
                დახურვა
              </Button>
              <Button
                  type="submit"
                  size="sm"
                  disabled={loading || !isFormValid()}
              >
                {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin"/>
                      {isEditMode && originalPlace !== formData.place
                          ? "გადატანა..."
                          : isEditMode
                              ? "რედაქტირდება..."
                              : "იქმნება..."}
                    </>
                ) : (
                    <>
                      <Save className="h-3.5 w-3.5 mr-1.5"/>
                      {isEditMode && originalPlace !== formData.place ? "გადატანა" : isEditMode ? "შენახვა" : "შექმნა"}
                    </>
                )}
              </Button>
            </div>
          </form>

          {/* Configuration Modal */}
          <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
            <DialogContent className="dialog-content dialog-scrollable max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>კონფიგურაცია</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Component Selection */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-foreground">შემავალი კომპონენტები</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "wheel", label: "ბორბალი" },
                      { id: "leaderboard", label: "ლიდერბორდი" },
                      { id: "gallery", label: "გალერეა" },
                    ].map((component) => (
                        <div key={component.id} className="flex items-center space-x-2">
                          <input
                              type="checkbox"
                              id={component.id}
                              checked={selectedComponents.includes(component.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedComponents([...selectedComponents, component.id])
                                } else {
                                  setSelectedComponents(selectedComponents.filter((c) => c !== component.id))
                                }
                              }}
                              className="rounded border-gray-300"
                          />
                          <label htmlFor={component.id} className="text-sm font-medium text-foreground">
                            {component.label}
                          </label>
                        </div>
                    ))}
                  </div>
                </div>

                {/* General Configuration JSON Editor */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-foreground">ზოგადი კონფიგურაცია</h3>
                  <textarea
                      value={generalConfig}
                      onChange={(e) => setGeneralConfig(e.target.value)}
                      placeholder='{"key": "value"}'
                      className="w-full h-32 p-3 border border-gray-300 rounded-md font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Component Sections */}
                {selectedComponents.includes("wheel") && (
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <h3 className="text-lg font-medium text-foreground">ბორბლის კონფიგურაცია</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">ატვირთეთ ბორბლის ფრეიმი</label>
                          <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setWheelFiles({ ...wheelFiles, frame: e.target.files?.[0] || null })}
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">ატვირთეთ ბორბლის პრიზები</label>
                          <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setWheelFiles({ ...wheelFiles, prizes: e.target.files?.[0] || null })}
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">ატვირთეთ ბორბლის ჰედერი</label>
                          <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setWheelFiles({ ...wheelFiles, header: e.target.files?.[0] || null })}
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">ატვირთეთ ბორბლის ფუთერი</label>
                          <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setWheelFiles({ ...wheelFiles, footer: e.target.files?.[0] || null })}
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                )}

                {selectedComponents.includes("leaderboard") && (
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <h3 className="text-lg font-medium text-foreground">ლიდერბორდის კონფიგურაცია</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            ატვირთეთ ლიდერბორდის ჰედერი
                          </label>
                          <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                  setLeaderboardFiles({ ...leaderboardFiles, header: e.target.files?.[0] || null })
                              }
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            ატვირთეთ ლიდერბორდის ფუთერი
                          </label>
                          <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                  setLeaderboardFiles({ ...leaderboardFiles, footer: e.target.files?.[0] || null })
                              }
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            ატვირთეთ ლიდერბორდის ფონი
                          </label>
                          <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                  setLeaderboardFiles({ ...leaderboardFiles, background: e.target.files?.[0] || null })
                              }
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                )}

                {selectedComponents.includes("gallery") && (
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <h3 className="text-lg font-medium text-foreground">გალერეის კონფიგურაცია</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">ატვირთეთ გალერეის ჰედერი</label>
                          <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setGalleryFiles({ ...galleryFiles, header: e.target.files?.[0] || null })}
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">ატვირთეთ გალერეის ფუთერი</label>
                          <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setGalleryFiles({ ...galleryFiles, footer: e.target.files?.[0] || null })}
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            ატვირთეთ გალერეის მინიატურები
                          </label>
                          <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => setGalleryFiles({ ...galleryFiles, thumbnails: e.target.files?.[0] || null })}
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                )}

                {/* Configuration Modal Actions */}
                <div className="flex justify-end gap-2.5 pt-4 border-t border-border/40">
                  <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowConfigModal(false)}
                  >
                    დახურვა
                  </Button>
                  <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setShowConfigModal(false)
                      }}
                  >
                    შენახვა
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* History Modal */}
          <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
            <DialogContent className="dialog-content dialog-scrollable max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>History</DialogTitle>
              </DialogHeader>

              <div className="space-y-10">
                {/* GIT COMMITS */}
                <section>
                  <h2 className="text-lg font-semibold text-muted-foreground mb-6">GIT COMMITS</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* PROD */}
                    <div className="bg-muted/50 rounded-md p-5 shadow-sm border max-h-64 overflow-y-auto">
                      <h3 className="text-base font-semibold mb-4 text-primary">PROD - V{commits.prod.length}</h3>
                      <div className="space-y-4 text-sm">
                        {commits.prod.map((item: any, i) => (
                            <div key={i} className="border-b pb-3">
                              <div><span className="font-medium">Title: </span> {item.title.split(', ')[0]}<br/>
                                {item.title.split(', ')?.[1]?.length && (
                                    <span className="pl-8">{item.title.split(', ')[1]}</span>
                                )}
                              </div>
                              <div><span className="font-medium">Hash: </span> {item.hash}</div>
                              {/*<div><span className="font-medium">Date: </span>*/}
                              {/*  {item.date.split('T')[0]} {item.date.split('T')[1].replace('.000+0400', '')}*/}
                              {/*</div>*/}
                            </div>
                        ))}
                      </div>
                    </div>

                    {/* ALL */}
                    <div className="bg-muted/50 rounded-md p-5 shadow-sm border max-h-64 overflow-y-auto">
                      <h3 className="text-base font-semibold mb-4 text-primary">ALL - V{commits.all.length}</h3>
                      <div className="space-y-4 text-sm">
                        {commits.all.map((item: any, i) => (
                            <div key={i} className="border-b pb-3">
                              <div>
                                <span className="font-medium">Title: </span> {item.title.split(', ')[0]}<br/>
                                {item.title.split(', ')?.[1]?.length && (
                                    <span className="pl-8">{item.title.split(', ')[1]}</span>
                                )}
                              </div>
                              <div><span className="font-medium">Hash: </span> {item.hash}</div>
                              <div><span className="font-medium">Date: </span>
                                {item.date.split('T')[0]} {item.date.split('T')[1].replace('.000+0400', '')}
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* APPROVAL HISTORY */}
                <section>
                  <h2 className="text-lg font-semibold text-muted-foreground mb-6">APPROVAL HISTORY</h2>
                  <div className="max-h-64 overflow-y-auto pr-3 space-y-4 text-sm bg-muted/30 p-4 rounded-md shadow-inner border">
                    {approvalHistory.map((entry, i) => (
                        <div key={i} className="border rounded-md p-4 bg-muted/50 shadow-sm space-y-1">
                          <div><span className="font-medium">FirstName: </span> {entry.firstName}</div>
                          <div><span className="font-medium">LastName: </span> {entry.lastName}</div>
                          <div><span className="font-medium">Email: </span> {entry.email}</div>
                          <div>
                            <span className="font-medium">CreatedAt: </span>{" "}
                            {entry.clearedAt.split('T')[0]} {entry.clearedAt.split('T')[1].replace('.000+0400', '')}
                          </div>
                        </div>
                    ))}
                    {!approvalHistory.length && <div>Not found</div>}
                  </div>
                </section>

                {/* Close button */}
                <div className="flex justify-end pt-4 border-t border-border/40">
                  <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHistoryModal(false)}
                  >
                    დახურვა
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

        </DialogContent>
      </Dialog>
      </>
  )
}
