import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } })

export const calculateEconomics = (params) =>
  api.post('/calculate', params).then((r) => r.data)

export const saveScenario = (data, token) =>
  api.post('/scenarios', data, authHeader(token)).then((r) => r.data)

export const getScenarios = (page = 1, limit = 12) =>
  api.get('/scenarios', { params: { page, limit } }).then((r) => r.data)

export const getScenario = (id) =>
  api.get(`/scenarios/${id}`).then((r) => r.data)

export const updateScenario = (id, data, token) =>
  api.put(`/scenarios/${id}`, data, authHeader(token)).then((r) => r.data)

export const deleteScenario = (id, token) =>
  api.delete(`/scenarios/${id}`, authHeader(token)).then((r) => r.data)

export const getScenarioBySlug = (slug) =>
  api.get(`/scenarios/share/${slug}`).then((r) => r.data)

export const register = (data) =>
  api.post('/users/register', data).then((r) => r.data)

export const login = (data) =>
  api.post('/users/login', data).then((r) => r.data)

export const getMe = (token) =>
  api.get('/users/me', authHeader(token)).then((r) => r.data)
