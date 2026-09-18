import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Cookies from "js-cookie";
import {
  FaArrowRight,
  FaBookOpen,
  FaCheckCircle,
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaPlay,
  FaSearch,
  FaSpinner,
  FaUser,
  FaUtensils,
} from "react-icons/fa";
import "./index.css";

/* ------------------------------------------------------------------ *
 * Session constants - identical to the previous implementation so the
 * protected routes keep accepting the same cookie.
 * ------------------------------------------------------------------ */
const SESSION_COOKIE = "jwt_token";
const SESSION_VALUE = "recipefinder123";
const SESSION_DAYS = 7;

/**
 * The account lives in localStorage, so the submit resolves instantly.
 * This short delay only exists so the button's loading state is actually
 * perceivable before the redirect happens - it does not change any of the
 * authentication rules below.
 */
const SUBMIT_FEEDBACK_MS = 650;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A corrupted "user" entry used to make JSON.parse throw and break the page.
 * Treating it as "no account yet" keeps the previous behaviour for every
 * valid entry and degrades gracefully otherwise.
 */
const readStoredUser = () => {
  try {
    const raw = window.localStorage.getItem("user");
    const parsed = raw ? JSON.parse(raw) : null;

    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const highlights = [
  {
    icon: <FaSearch />,
    text: "Search thousands of recipes from every cuisine",
  },
  {
    icon: <FaBookOpen />,
    text: "Save your favourites into a personal cookbook",
  },
  {
    icon: <FaPlay />,
    text: "Follow step-by-step instructions and video guides",
  },
];

const LoginForm = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [invalidFields, setInvalidFields] = useState({
    username: false,
    password: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get(SESSION_COOKIE);

    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const handleUserNameChange = (event) => {
    setUserName(event.target.value);
    setError("");
    setInvalidFields((fields) => ({ ...fields, username: false }));
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    setError("");
    setInvalidFields((fields) => ({ ...fields, password: false }));
  };

  const switchTab = (signup) => {
    if (isSubmitting) {
      return;
    }

    setIsSignup(signup);
    setError("");
    setInvalidFields({ username: false, password: false });

    // The success notice belongs to the log-in view only.
    if (signup) {
      setSuccessMessage("");
    }
  };

  const submitSignup = async () => {
    if (!userName || !password) {
      setError("Please fill all fields");
      setInvalidFields({ username: !userName, password: !password });
      return;
    }

    await sleep(SUBMIT_FEEDBACK_MS);

    const user = {
      username: userName,
      password: password,
    };

    window.localStorage.setItem("user", JSON.stringify(user));

    setUserName("");
    setPassword("");
    setIsSignup(false);
    setSuccessMessage("Signup Successful");
  };

  const submitSignin = async () => {
    const storedUser = readStoredUser();

    if (!storedUser) {
      setError("Please signup first");
      return false;
    }

    if (userName === storedUser.username && password === storedUser.password) {
      await sleep(SUBMIT_FEEDBACK_MS);

      Cookies.set(SESSION_COOKIE, SESSION_VALUE, {
        expires: SESSION_DAYS,
      });

      navigate("/home");
      return true;
    }

    await sleep(SUBMIT_FEEDBACK_MS);

    setError("Invalid Credentials");
    setInvalidFields({ username: true, password: true });
    return false;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setInvalidFields({ username: false, password: false });
    setIsSubmitting(true);

    let redirecting = false;

    try {
      if (isSignup) {
        await submitSignup();
      } else {
        redirecting = await submitSignin();
      }
    } finally {
      // On a successful login we navigate away, so the button stays disabled
      // until the new page renders.
      if (!redirecting) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="auth-page">
      <aside className="auth-visual">
        <div className="auth-visual-inner">
          <div className="auth-brand">
            <span className="auth-brand-mark">
              <FaUtensils />
            </span>

            <span className="auth-brand-text">
              <strong>RecipeFinder</strong>
              <small>Cook with Passion</small>
            </span>
          </div>

          <div className="auth-visual-copy">
            <h2>
              Cook something
              <span> amazing</span> today.
            </h2>

            <p>
              Discover recipes from around the world, keep your favourites in
              one place and cook with confidence.
            </p>

            <ul className="auth-highlights">
              {highlights.map((item) => (
                <li key={item.text}>
                  <span className="auth-highlight-icon">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <main className="auth-panel">
        <div className="auth-card">
          <div className="auth-card-head">
            <span className="auth-card-eyebrow">
              {isSignup ? "Get started" : "Welcome back"}
            </span>

            <h1>
              {isSignup ? "Create your account" : "Sign in to RecipeFinder"}
            </h1>

            <p>
              {isSignup
                ? "Create an account to start saving your favourite recipes."
                : "Log in to keep exploring recipes and your cookbook."}
            </p>
          </div>

          <div className="auth-tabs">
            <span
              className={`auth-tab-slider ${isSignup ? "is-right" : ""}`}
              aria-hidden="true"
            />

            <button
              type="button"
              className={`auth-tab ${isSignup ? "" : "is-active"}`}
              aria-pressed={!isSignup}
              onClick={() => switchTab(false)}
            >
              Log In
            </button>

            <button
              type="button"
              className={`auth-tab ${isSignup ? "is-active" : ""}`}
              aria-pressed={isSignup}
              onClick={() => switchTab(true)}
            >
              Sign Up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error ? (
              <p className="auth-alert auth-alert-error" role="alert">
                <FaExclamationCircle />
                <span>{error}</span>
              </p>
            ) : null}

            {successMessage ? (
              <p className="auth-alert auth-alert-success" role="status">
                <FaCheckCircle />
                <span>
                  <strong>{successMessage}</strong>
                  Your account is ready. Log in to continue.
                </span>
              </p>
            ) : null}

            <div className="auth-field">
              <label htmlFor="auth-username">Username</label>

              <div
                className={`auth-input ${
                  invalidFields.username ? "is-invalid" : ""
                }`}
              >
                <FaUser className="auth-input-icon" aria-hidden="true" />

                <input
                  id="auth-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder={
                    isSignup ? "Create a username" : "Enter your username"
                  }
                  value={userName}
                  onChange={handleUserNameChange}
                  aria-invalid={invalidFields.username}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="auth-password">Password</label>

              <div
                className={`auth-input ${
                  invalidFields.password ? "is-invalid" : ""
                }`}
              >
                <FaLock className="auth-input-icon" aria-hidden="true" />

                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  placeholder={
                    isSignup ? "Create a password" : "Enter your password"
                  }
                  value={password}
                  onChange={handlePasswordChange}
                  aria-invalid={invalidFields.password}
                />

                <button
                  type="button"
                  className="auth-input-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="auth-spinner" aria-hidden="true" />
                  {isSignup ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                <>
                  {isSignup ? "Create Account" : "Login to your account"}
                  <FaArrowRight aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            {isSignup ? "Already have an account?" : "New to RecipeFinder?"}

            <button type="button" onClick={() => switchTab(!isSignup)}>
              {isSignup ? "Log in" : "Create an account"}
            </button>
          </p>
        </div>

        <p className="auth-footnote">
          Your account is stored on this device only. Nothing is sent to a
          server.
        </p>
      </main>
    </div>
  );
};

export default LoginForm;