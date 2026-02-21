import React, { createContext, useReducer, useEffect } from 'react'

export const AuthContext = createContext(null)

const LS_TOKEN = 'econsim_token'
const LS_USER  = 'econsim_user'

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.user, token: action.token }
    case 'LOGOUT':
      return { user: null, token: null }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    user:  JSON.parse(localStorage.getItem(LS_USER)  || 'null'),
    token: localStorage.getItem(LS_TOKEN) || null,
  })

  useEffect(() => {
    if (state.token) {
      localStorage.setItem(LS_TOKEN, state.token)
      localStorage.setItem(LS_USER, JSON.stringify(state.user))
    } else {
      localStorage.removeItem(LS_TOKEN)
      localStorage.removeItem(LS_USER)
    }
  }, [state.token, state.user])

  const loginUser = (user, token) => dispatch({ type: 'LOGIN', user, token })
  const logoutUser = () => dispatch({ type: 'LOGOUT' })

  return (
    <AuthContext.Provider value={{ ...state, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  )
}
