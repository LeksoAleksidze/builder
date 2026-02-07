// export const DOMAIN_URL = 'http://localhost:3000'
export const DOMAIN_URL = 'https://internal-d2d-back.crocobet.com'

export const handleUnauthorized = (response: Response) => {
  if (response.status === 401) {
    localStorage.removeItem("authToken")
    window.location.href = "/login"
    return true
  }
  return false
}

export const handleUnauthorizedData = (data: any) => {
  if (!data.status && (data.body === "Unauthorized: Invalid token" || data.body === "Unauthorized")) {
    localStorage.removeItem("authToken")
    window.location.href = "/login"
    return true
  }
  return false
}
