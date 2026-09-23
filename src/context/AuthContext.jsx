import { createContext, useMemo, useState } from 'react'
import { loginRequest } from '../api/authApi'
import {
  getToken,
  getUser,
  isAuthenticated,
  logout as clearAuthStorage,
  setToken,
  setUser,
} from '../utils/auth'

const AuthContext = createContext(null)

function pickUserFromLogin(data) {
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    image: data.image,
  }
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => getUser())
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated())

  async function login(username, password) {
    const { data } = await loginRequest({ username, password })
    const accessToken = data.accessToken || data.token

    if (!accessToken) {
      throw new Error('Login succeeded but no token was returned.')
    }

    const nextUser = pickUserFromLogin(data)

    setToken(accessToken)
    setUser(nextUser)
    setUserState(nextUser)
    setAuthenticated(true)
  }

  function logout() {
    clearAuthStorage()
    setUserState(null)
    setAuthenticated(false)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: authenticated,
      token: getToken(),
      login,
      logout,
    }),
    [user, authenticated],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
