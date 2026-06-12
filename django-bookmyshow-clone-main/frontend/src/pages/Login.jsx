import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");

      await login(form);

      navigate(location.state?.from || "/profile");
    } catch (err) {
      setError("Invalid credentials");
    }
  }

  return (
    <section className="container auth-page">
      <form className="form-card auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">Welcome back</span>

        <h1>Login</h1>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <button
          className="btn btn-primary full-width"
          type="submit"
        >
          Login
        </button>

        <p className="muted centered">
          New to BookMySeat?{" "}
          <Link to="/signup">
            Create an account
          </Link>
        </p>
      </form>
    </section>
  );
}

export default Login;