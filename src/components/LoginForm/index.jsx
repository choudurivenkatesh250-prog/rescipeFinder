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
    <div className="container">
      <div className="toggle-buttons">
        <button
          className="toggle-btn"
          onClick={() => setShowForm(false)}
        >
          Signup
        </button>

        <button
          className="toggle-btn"
          onClick={() => setShowForm(true)}
        >
          Signin
        </button>
      </div>

      <div className="form-card">
        <h2 className="form-title">
          {showForm ? "Sign In" : "Sign Up"}
        </h2>

        <input
          className="input-field"
          type="text"
          placeholder={
            showForm
              ? "Enter Username"
              : "Create Username"
          }
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />

        <input
          className="input-field"
          type="password"
          placeholder={
            showForm
              ? "Enter Password"
              : "Create Password"
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {showForm ? (
          <button
            className="submit-btn"
            onClick={handleSignin}
          >
            Login
          </button>
        ) : (
          <button
            className="submit-btn"
            onClick={handleSignup}
          >
            Register
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginForm;