export interface Promotion {
  promotionId: number
  branch: string
  status: 'PENDING' | 'ACTIVE' | 'FINISHED'
  jira: string
  title: string
  commitHash: string
  startDate: string
  endDate: string
  hasMoveJob: boolean
  place: string
  url: string
  design: string
  type: "VISIBLE" | "HIDDEN"
  category: string
  segment: string
  stack: string
  createdAt: string
  origin: string
  lastDeployTime: string | null
  approves: Array<{
    userId: number
    firstName: string
    lastName: string
    email: string
  }>
  author: {
    userId: number
    firstName: string
    lastName: string
    email: string
  }
}

export interface UserInfo {
  userId: number
  firstName: string
  lastName: string
  email: string
  role: string
  stack: string
  createdAt: string
}

export interface UserFilterInfo {
  userId: number
  firstName: string
  lastName: string
  initials: string
}

export interface Branch {
  name: string
  url: string
}
