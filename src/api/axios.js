import axios from 'axios'
import { getToken, logout } from '../utils/auth'

const api = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiMessage = error.response?.data?.message
    if (apiMessage) {
      error.message = apiMessage
    }

    const requestUrl = error.config?.url || ''
    const isLoginRequest = requestUrl.includes('/auth/login')
    const isUnauthorized = error.response?.status === 401

    // Login 401 is invalid credentials — do not wipe the session or redirect.
    if (isUnauthorized && !isLoginRequest) {
      logout()
      window.location.assign('/login')
    }

    return Promise.reject(error)
  },
)

export default api
