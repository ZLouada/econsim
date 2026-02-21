import React from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Header() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutUser()
    navigate('/')
  }

  return (
    <header className="header">
      <Link to="/" className="header-brand">
        📈 <span>EconSim</span>
      </Link>
      <nav className="header-nav">
        <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Simulator
        </NavLink>
        <NavLink to="/scenarios" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Scenarios
        </NavLink>
        {user ? (
          <div className="nav-user">
            <span className="nav-username">👤 {user.username || user.email}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              Login
            </NavLink>
            <NavLink to="/register" className="btn btn-primary btn-sm">
              Register
            </NavLink>
          </>
        )}
      </nav>
    </header>
  )
}
