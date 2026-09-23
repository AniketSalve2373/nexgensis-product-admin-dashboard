import api from './axios'

export function loginRequest({ username, password }) {
  return api.post('/auth/login', { username, password })
}
