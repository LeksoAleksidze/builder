import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@d2d-ui/ui/select"
import {
  LogOut,
  Search,
  Plus,
  Calendar,
  User,
  ExternalLink,
  Copy,
  Rocket,
  Check,
  Edit,
  GitBranch,
  Timer,
  Trash2,
  Home,
  ChevronDown,
  X,
  Donut
} from "lucide-react"
import { AddPromotionModal } from "./components/AddPromotionModal"
import { ProfileModal } from "./components/ProfileModal"
import { ThemeToggle } from "@d2d-ui/theme-toggle"
import { DeployModal } from "./components/DeployModal"
import { DeleteModal } from "./components/DeleteModal"
import { Button } from "@d2d-ui/ui/button"
import { handleUnauthorized, handleUnauthorizedData, DOMAIN_URL } from "../../../shared/services/api"
import { FileModalGallery } from "./components/FileModalGallery"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@d2d-ui/ui/tooltip"
import type { Promotion, UserInfo, UserFilterInfo } from "../../../shared/types/d2d.types"

const CATEGORIES = ["SLOT", "FAST", "P2P", "CRM", "SPORT", "CASINO", "POKER", "VERIFICATION"]
const TYPES = ["VISIBLE", "HIDDEN"]
const STACKS = ["ANGULAR", "REACT"]

export function D2DDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStack, setSelectedStack] = useState<string>("all")
  const [users, setUsers] = useState<UserFilterInfo[]>([])
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null)

  const navigate = useNavigate()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFilesModal, setShowFilesModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | any>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [deployingId, setDeployingId] = useState<number | null>(null)
  const [deployTimer, setDeployTimer] = useState<number>(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingPromotion, setDeletingPromotion] = useState<Promotion | null>(null)
  const [collapsedCards, setCollapsedCards] = useState<Set<number>>(new Set())

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      navigate("/login")
    } else {
      setIsAuthenticated(true)
      fetchPromotions(token)
      fetchUserInfo(token)
      fetchUsers(token)
    }
  }, [navigate])

  // Deploy timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (deployTimer > 0) {
      interval = setInterval(() => {
        setDeployTimer((prev) => {
          if (prev <= 1) {
            setDeployingId(null)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [deployTimer])

  // Initialize all cards as collapsed when promotions load
  useEffect(() => {
    if (promotions.length > 0) {
      setCollapsedCards(new Set(promotions.map((p) => p.promotionId)))
    }
  }, [promotions])

  const fetchPromotions = async (token: string) => {
    try {
      const response = await fetch(`${DOMAIN_URL}/promotion/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (handleUnauthorized(response)) return

      const data = await response.json()
      if (handleUnauthorizedData(data)) return

      if (data.status && data.body) {
        setPromotions(data.body)
      }
    } catch (error) {
      console.error("Error fetching promotions:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async (token: string) => {
    try {
      const response = await fetch(`${DOMAIN_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (handleUnauthorized(response)) return

      const data = await response.json()
      if (handleUnauthorizedData(data)) return

      if (data.status && data.body) {
        setUsers(data.body)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch(`${DOMAIN_URL}/auth/information`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (handleUnauthorized(response)) return

      const data = await response.json()
      if (handleUnauthorizedData(data)) return

      if (data.status && data.body) {
        setUserInfo(data.body)
      }
    } catch (error) {
      console.error("Error fetching user info:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    navigate("/login")
  }

  const filterPromotions = (promotions: Promotion[]) => {
    return promotions.filter((promo) => {
      const matchesSearch =
          promo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          promo.jira.toLowerCase().includes(searchTerm.toLowerCase()) ||
          promo.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
          promo.design.toLowerCase().includes(searchTerm.toLowerCase()) ||
          promo.branch.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "all" || promo.category === selectedCategory
      const matchesType = selectedType === "all" || promo.segment === selectedType
      const matchesStack = selectedStack === "all" || promo.stack === selectedStack

      const matchesAuthor = selectedAuthorId === null || promo.author.userId === selectedAuthorId

      return matchesSearch && matchesCategory && matchesType && matchesAuthor && matchesStack
    })
  }

  const getPromotionsByPlace = (place: string) => {
    const filtered = filterPromotions(promotions)
    return filtered.filter((promo) => promo.place === place)
  }

  const formatDate = (dateString: string) => {
    const dt = dateString.split('T')

    return dt[0] + ' ' + dt[1].replace('.000+0400', '')
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const copyPromotionUrl = async (promotion: Promotion, place: string) => {
    let baseUrl = ""

    switch (place) {
      case "crc":
        baseUrl = "https://crocobet.com/landings/crc/"
        break
      case "private":
        baseUrl = "https://crocobet.com/landings/crc/private/"
        break
      case "archived":
        baseUrl = "https://crocobet.com/landings/crc/archived/"
        break
      default:
        baseUrl = "https://crocobet.com/landings/crc/private/"
    }

    const fullUrl = place === "crc" ? baseUrl + promotion.url : baseUrl + promotion.url

    try {
      await copyClipboard$(fullUrl);

      setCopiedId(promotion.promotionId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error("Copy failed:", error)
    }
  }

  const handleDeployClick = (promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setShowDeployModal(true)
  }

  const handleDeploySuccess = () => {
    setShowDeployModal(false)
    setSelectedPromotion(null)

    const token = localStorage.getItem("authToken")
    if (token) fetchPromotions(token)
  }

  const handleEditClick = (promotion: Promotion) => {
    setEditingPromotion(promotion)
    setShowEditModal(true)
  }

  const handleDeleteClick = (promotion: Promotion) => {
    setDeletingPromotion(promotion)
    setShowDeleteModal(true)
  }

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false)
    setDeletingPromotion(null)

    const token = localStorage.getItem("authToken")
    if (token) fetchPromotions(token)
  }

  const toggleCardCollapse = (promotionId: number) => {
    setCollapsedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(promotionId)) {
        newSet.delete(promotionId)
      } else {
        newSet.add(promotionId)
      }
      return newSet
    })
  }

  const copyClipboard$ = (value: string | number): Promise<void> => {
    if (typeof value === 'number') {
      return copyClipboard$(String(value));
    }

    return new Promise<void>((resolve, reject) => {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand('copy');
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  };

  const handleAuthorSelect = (userId: number) => {
    if (selectedAuthorId === userId) {
      setSelectedAuthorId(null)
    } else {
      setSelectedAuthorId(userId)
    }
  }

  const PromotionCard = ({ promotion, place }: { promotion: Promotion; place: string }) => {
    const isDeploying = deployingId === promotion.promotionId
    const isCollapsed = collapsedCards.has(promotion.promotionId)
    const isFinished = promotion.status === 'FINISHED'
    const isActive = promotion.status === 'ACTIVE'
    const isPending = promotion.status === 'PENDING'


    const [showCopyModal, setShowCopyModal] = useState(false)
    const [copiedLink, setCopiedLink] = useState<string | null>(null)

    const links = [
      `https://crocobet.com/landings/${place === 'crc' ? place : 'crc/'+place }/${promotion.url}`,
      `http://10.0.69.128/${place === 'crc' ? place : 'crc/'+place }/${promotion.url}`,
      `http://10.4.24.103/${place === 'crc' ? place : 'crc/'+place }/${promotion.url}`,
      `http://10.4.24.104/${place === 'crc' ? place : 'crc/'+place }/${promotion.url}`,
    ]

    const handleCopyLink = async (link: string) => {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(link)
          setCopiedLink(link)
          setTimeout(() => setCopiedLink(null), 1500)
        } catch (err) {
          console.error("Clipboard copy failed:", err)
        }
      } else {
        // fallback: create temporary input and copy manually
        const textarea = document.createElement("textarea")
        textarea.value = link
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
        setCopiedLink(link)
        setTimeout(() => setCopiedLink(null), 1500)
      }
    }


    return (
        <div
            className={`promotion-card relative ${isDeploying ? "promotion-card--deploying" : ""} ${isActive ? "promotion-card--active" : ""} ${isFinished ? "promotion-card--finished" : ""} ${isPending ? "promotion-card--pending" : ""}`}
        >
          <div className="promotion-card__header">
            <div className="promotion-card__header-content">
              <h3 className="promotion-card__header-title">{promotion.title}</h3>
              <div className="promotion-card__header-badges">
            <span className={`badge ${promotion.type === "VISIBLE" ? "badge--visible" : "badge--hidden"}`}>
              {promotion.type}
            </span>
                <span className="badge badge--outline">{promotion.category}</span>
                {promotion.approves && promotion.approves.length > 0 && (
                    <span className="badge badge--approval">✓ {promotion.approves.length}</span>
                )}
                <button
                    onClick={() => toggleCardCollapse(promotion.promotionId)}
                    className="ml-1 p-1 hover:bg-accent rounded transition-colors"
                    disabled={isDeploying}
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsed ? "-rotate-90" : "rotate-0"}`} />
                </button>
              </div>
            </div>
          </div>

          {!isCollapsed && (
              <div className="promotion-card__content">
                {/* --- Details --- */}
                <div className="promotion-card__content-details">
                  <div className="promotion-card__content-details-item">
                    <ExternalLink />
                    <span>Jira: </span>
                    {promotion.jira && promotion.jira !== '404' ? (
                        <a
                            href={`https://crocobet.atlassian.net/jira/software/projects/DPT/boards/202?selectedIssue=${promotion.jira}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                          {promotion.jira}
                        </a>
                    ) : (
                        'NOT FOUND'
                    )}
                  </div>
                  <div className="promotion-card__content-details-item">
                    <ExternalLink />
                    <span>Design: </span>
                    {promotion.design && promotion.design !== '404' ? (
                        <a href={promotion.design} target="_blank" rel="noopener noreferrer">
                          Zeplin
                        </a>
                    ) : (
                        'NOT FOUND'
                    )}
                  </div>
                  <div className="promotion-card__content-details-item">
                    <Calendar />
                    <span>Create: {formatDate(promotion.createdAt)}</span>
                  </div>

                  {promotion.origin && (
                      <div className="promotion-card__content-details-item promotion-card__content-details-item--branch origin">
                        <GitBranch />
                        <span className="label">Origin:</span>
                        <span className="value">{promotion.origin}</span>
                      </div>
                  )}
                  {promotion.branch && (
                      <div className="promotion-card__content-details-item promotion-card__content-details-item--branch">
                        <GitBranch />
                        <span className="label">Branch:</span>
                        <span className="value">{promotion.branch}</span>
                      </div>
                  )}
                  {promotion.author && (
                      <div className="promotion-card__content-details-item">
                        <User />
                        <span>
                  Author: {promotion.author.firstName} {promotion.author.lastName}
                </span>
                      </div>
                  )}

                  {promotion.author && (
                      <div className="promotion-card__content-details-item">
                        <Donut />
                        <span>
                  Stack: {promotion.stack}
                </span>
                      </div>
                  )}
                  {promotion.lastDeployTime && (
                      <div className="promotion-card__content-details-item promotion-card__content-details-item--deploy-time">
                        <Timer />
                        Deploy: {formatDate(promotion.lastDeployTime)}
                      </div>
                  )}
                </div>

                {/* --- Actions --- */}
                <div
                    className="promotion-card__content-actions relative"
                    style={{
                      gridTemplateColumns: place === "crc" || place === "archived" ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
                    }}
                >
                  <button
                      onClick={() => setShowCopyModal((prev) => !prev)}
                      className="btn relative"
                      disabled={isDeploying}
                  >
                    <Copy />
                    კოპირება
                  </button>

                  {/* --- Copy Modal --- */}
                  {showCopyModal && (
                      <div className="copy-modal">
                        <div className="copy-modal__header">
                          <span className="copy-modal__header-title">აირჩიე ლინკი</span>
                          <button onClick={() => setShowCopyModal(false)} className="copy-modal__header-close">
                            <X />
                          </button>
                        </div>
                        <div className="copy-modal__list">
                          {links.map((link, i) => (
                              <button
                                  key={i}
                                  onClick={() => handleCopyLink(link)}
                                  className={`copy-modal__item ${copiedLink === link ? "copy-modal__item--copied" : ""}`}
                              >
                                <span className="copy-modal__item-url">{link}</span>
                                {copiedLink === link ? <Check /> : <Copy />}
                              </button>
                          ))}
                        </div>
                      </div>
                  )}

                  {userInfo?.role === 'EDITOR' && (
                      <button onClick={() => handleEditClick(promotion)} className="btn" disabled={isDeploying}>
                        <Edit />
                        რედაქტირება
                      </button>
                  )}

                  {(place === "crc" || place === "archived") && userInfo?.role === 'EDITOR' && (
                      <button
                          onClick={() => {
                            const clonedPromotion = {
                              ...promotion,
                              promotionId: 0,
                              title: `${promotion.title}`,
                              url: `${promotion.url}`,
                              place: "private",
                              origin: promotion.branch,
                              lastDeployTime: null,
                              approves: [],
                              isCloned: true,
                            }
                            setEditingPromotion(clonedPromotion)
                            setShowAddModal(true)
                          }}
                          className="btn"
                          disabled={isDeploying}
                          title="აქციის კლონირება TESTING გარემოში"
                      >
                        <Copy />
                        კლონირება
                      </button>
                  )}

                  {place === "private" && userInfo?.role === "EDITOR" && (
                      <button onClick={() => handleDeleteClick(promotion)} className="btn btn--delete" disabled={isDeploying}>
                        <Trash2 />
                        წაშლა
                      </button>
                  )}
                  {place === "private" && userInfo?.role === "EDITOR" && promotion.branch !== '404' && promotion.branch !== 'redirect' && (
                      <button onClick={() => handleDeployClick(promotion)} className="btn btn--deploy" disabled={isDeploying}>
                        <Rocket />
                        Deploy
                      </button>
                  )}
                </div>

                {isDeploying && (
                    <div className="promotion-card__content-timer">
                      <div className="promotion-card__content-timer-content">
                        <Timer />
                        <span className="text">Deploy მიმდინარეობს...</span>
                        <span className="time">{deployTimer}წმ</span>
                      </div>
                    </div>
                )}
              </div>
          )}
        </div>
    )
  }

  if (!isAuthenticated) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    )
  }

  const colorClasses = [
    "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500",
    "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-lime-500"
  ];

  const getUserColor = (userId: number) => {
    const index = userId % colorClasses.length;
    return colorClasses[index];
  };

  return (
      <div className="dashboard page-bg">
        <header className="page-header">
          <div className="page-header__container">
            <div className="page-header__left">
              <Button variant="ghost" size="sm" onClick={() => navigate("/server-selection")}>
                <Home className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">მთავარი</span>
              </Button>
              <h1 className="page-header__title page-header__title--blue">აქციების მართვა</h1>
            </div>

            <div className="page-header__right">
              <ThemeToggle />
              {userInfo && (
                  <>
                    <button
                        onClick={() => setShowProfileModal(true)}
                        className="page-header__user-btn"
                    >
                      <div className="page-header__avatar page-header__avatar--blue">
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
          <div className="dashboard__filters">
            <div className="dashboard__filters-search">
              <Search/>
              <input
                  placeholder="ძებნა (სათაური, JIRA, ბრენჩი...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="კატეგორია"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ყველა კატეგორია</SelectItem>
                {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="ტიპი"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ყველა ტიპი</SelectItem>
                {TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {userInfo?.role === 'VIEWER' && (
                <Select value={selectedStack} onValueChange={setSelectedStack}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="სტეკი"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ყველა სტეკი</SelectItem>
                    {STACKS.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            )}


            {userInfo?.role === "EDITOR" && (
                <button onClick={() => setShowAddModal(true)} className="dashboard__filters-add-btn">
                  <Plus/>
                  New
                </button>
            )}

            {
              userInfo?.stack === 'ANGULAR' && (
                    <button
                        onClick={() => setShowFilesModal(true)}
                        className="dashboard__filters-add-btn dashboard__filters-add-btn-blue"
                    >
                      Sequence
                    </button>
                )
            }

          </div>

          <div className="author-bar">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                      onClick={() => setSelectedAuthorId(null)}
                      className={`author-bar__btn author-bar__btn--all ${selectedAuthorId === null ? "active" : ""}`}
                  >
                    ALL
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>ყველა ავტორი</p>
                </TooltipContent>
              </Tooltip>

              {users.map((user) => (
                  <Tooltip key={user.userId}>
                    <TooltipTrigger asChild>
                      <button
                          onClick={() => handleAuthorSelect(user.userId)}
                          className={`author-bar__btn author-bar__btn--user ${getUserColor(user.userId)} ${selectedAuthorId === user.userId ? "active" : ""}`}
                      >
                        {user.initials}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{user.firstName} {user.lastName}</p>
                    </TooltipContent>
                  </Tooltip>
              ))}
            </TooltipProvider>
          </div>


          {loading ? (
              <div className="dashboard__loading">
                <div className="dashboard__loading-spinner"></div>
              </div>
          ) : (
              <div className="dashboard__columns">

                <div className="dashboard__column">
                  <div className="dashboard__column-header dashboard__column-header--testing">
                    <div className="dashboard__column-header-content">
                      <h2>TESTING</h2>
                      <span className="badge">{getPromotionsByPlace("private").length}</span>
                    </div>
                  </div>
                  <div className="dashboard__column-content">
                    {getPromotionsByPlace("private").map((promotion) => (
                        <PromotionCard key={promotion.promotionId} promotion={promotion} place="private"/>
                    ))}
                    {getPromotionsByPlace("private").length === 0 && (
                        <div className="dashboard__column-empty">ჯერ არ არის მონაცემები</div>
                    )}
                  </div>
                </div>

                <div className="dashboard__column">
                  <div className="dashboard__column-header dashboard__column-header--production">
                    <div className="dashboard__column-header-content">
                      <h2>PRODUCTION</h2>
                      <span className="badge">{getPromotionsByPlace("crc").length}</span>
                    </div>
                  </div>
                  <div className="dashboard__column-content">
                    {getPromotionsByPlace("crc").map((promotion) => (
                        <PromotionCard key={promotion.promotionId} promotion={promotion} place="crc"/>
                    ))}
                    {getPromotionsByPlace("crc").length === 0 && (
                        <div className="dashboard__column-empty">ჯერ არ არის მონაცემები</div>
                    )}
                  </div>
                </div>

                <div className="dashboard__column">
                  <div className="dashboard__column-header dashboard__column-header--finished">
                    <div className="dashboard__column-header-content">
                      <h2>FINISHED</h2>
                      <span className="badge">{getPromotionsByPlace("archived").length}</span>
                    </div>
                  </div>
                  <div className="dashboard__column-content">
                    {getPromotionsByPlace("archived").map((promotion) => (
                        <PromotionCard key={promotion.promotionId} promotion={promotion} place="archived"/>
                    ))}
                    {getPromotionsByPlace("archived").length === 0 && (
                        <div className="dashboard__column-empty">ჯერ არ არის მონაცემები</div>
                    )}
                  </div>
                </div>
              </div>
          )}

          <FileModalGallery
              isOpen={showFilesModal}
              onClose={() => setShowFilesModal(false)}
          />

          <AddPromotionModal
              isOpen={showAddModal}
              onClose={() => {
                setShowAddModal(false)
                setEditingPromotion(null)
              }}
              onSuccess={() => {
                setShowAddModal(false)
                setEditingPromotion(null)
                const token = localStorage.getItem("authToken")
                if (token) fetchPromotions(token)
              }}
              editPromotion={editingPromotion}
              userRole={userInfo?.role}
              userStack={userInfo?.stack}
          />

          <AddPromotionModal
              isOpen={showEditModal}
              onClose={() => {
                setShowEditModal(false)
                setEditingPromotion(null)
              }}
              onSuccess={() => {
                setShowEditModal(false)
                setEditingPromotion(null)
                const token = localStorage.getItem("authToken")
                if (token) fetchPromotions(token)
              }}
              editPromotion={editingPromotion}
              currentUserId={userInfo?.userId}
              userRole={userInfo?.role}
              userStack={userInfo?.stack}
          />

          {userInfo && (
              <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} userInfo={userInfo} />
          )}

          {selectedPromotion && (
              <DeployModal
                  isOpen={showDeployModal}
                  onClose={() => {
                    setShowDeployModal(false)
                    setSelectedPromotion(null)
                  }}
                  promotion={selectedPromotion}
                  onSuccess={() => handleDeploySuccess()}
              />
          )}

          {deletingPromotion && (
              <DeleteModal
                  isOpen={showDeleteModal}
                  onClose={() => {
                    setShowDeleteModal(false)
                    setDeletingPromotion(null)
                  }}
                  promotion={deletingPromotion}
                  onSuccess={handleDeleteSuccess}
              />
          )}
        </main>
      </div>
  )
}
