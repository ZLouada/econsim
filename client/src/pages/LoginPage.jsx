import React from 'react'
import { Link } from 'react-router-dom'
import LoginForm from '../components/Auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Sign In</h2>
        <p className="auth-sub">Welcome back to EconSim</p>
        <LoginForm />
        <div className="form-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  )
}
