import { useState, useEffect } from "react";
import "./index.css";
import { useNavigate } from "react-router";
import Cookies from "js-cookie";

const LoginForm = () => {
  const [showForm, setShowForm] = useState(true);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("jwt_token");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const handleSignup = () => {
    if (!userName || !password) {
      alert("Please fill all fields");
      return;
    }

    const user = {
      username: userName,
      password: password,
    };

    localStorage.setItem("user", JSON.stringify(user));
    alert("Signup Successful");

    setUserName("");
    setPassword("");
    setShowForm(true);
  };

  const handleSignin = () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      alert("Please signup first");
      return;
    }

    if (
      userName === storedUser.username &&
      password === storedUser.password
    ) {
      Cookies.set("jwt_token", "recipefinder123", {
        expires: 7,
      });
      navigate("/home");
    } else {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        
        {/* Brand Header */}
        <div className="brand-header">
          <h1>RecipeFinder</h1>
          <p>Discover & cook amazing food</p>
        </div>

        {/* Integrated Tabs */}
        <div className="tab-container">
          <button
            className={`tab-btn ${showForm ? "active" : ""}`}
            onClick={() => setShowForm(true)}
          >
            Log In
          </button>
          <button
            className={`tab-btn ${!showForm ? "active" : ""}`}
            onClick={() => setShowForm(false)}
          >
            Sign Up
          </button>
        </div>

        {/* Form Content */}
        <div className="form-content">
          <div className="input-group">
            <label>Username</label>
            <input
              className="input-field"
              type="text"
              placeholder={showForm ? "Enter your username" : "Create a username"}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              className="input-field"
              type="password"
              placeholder={showForm ? "Enter your password" : "Create a password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="primary-btn"
            onClick={showForm ? handleSignin : handleSignup}
          >
            {showForm ? "Login to your account" : "Create Account"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoginForm;