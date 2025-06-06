import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    axios
      .post("http://localhost:8000/api/login", {
        email: email,
        password: password,
      })
      .then(function (response) {
        const token = response.data.token;
        localStorage.setItem("token", token);

        return axios.get("http://localhost:8000/api/user", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });
      })
      .then(function (response) {
        const role = response.data.role;

        if (role === "admin" || role === "super admin") {
          navigate("/admin");
        } else if (role === "étudiant") {
          navigate("/dashboard");
        } else if (role === "enseignant") {
          navigate("/teacher");
        } else {
          setError("Rôle non reconnu : " + role);
        }
      })
      .catch(function (error) {
        if (error.response) {
          setError(error.response.data.message || "Erreur de connexion");
        } else {
          setError("Erreur de connexion");
        }
      });
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }

  return (
    <div className="login-container">
      <div className="background-shapes">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
        <div className="shape-3"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-circle">📚</div>
          <h1 className="login-title">EduGrades</h1>
          <p className="login-subtitle">Connectez-vous à votre compte</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email :
            </label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={handleEmailChange}
                required
                placeholder="Email"
              />
              <span className="input-icon">📧</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mot de passe :
            </label>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={handlePasswordChange}
                required
                placeholder="Password"
              />
              <span className="input-icon">🔒</span>
            </div>
          </div>

          <button type="submit" className="submit-button">
            Se connecter
          </button>
        </form>

        <div className="forgot-password">
          <a href="#" className="forgot-password-link">
            Mot de passe oublié ?
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
