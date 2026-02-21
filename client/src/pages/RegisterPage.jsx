import React from 'react'
import { Link } from 'react-router-dom'
import RegisterForm from '../components/Auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-sub">Join EconSim to save and share your scenarios</p>
        <RegisterForm />
        <div className="form-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
