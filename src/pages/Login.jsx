import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Swal from "sweetalert2";
import { useApi } from "../hooks/useApi";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { request } = useApi();

  if (user) navigate("/");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await request({
        method: "post",
        url: "/login",
        data: form,
      });
      login(res.data.user, res.data.token);
      navigate("/");
    } catch {
      Swal.fire({
        text: `Credenciales incorrectas!`,
        icon: "error",
        customClass: {
          confirmButton:
            "bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700",
        },
        buttonsStyling: false,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-white to-pink-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm z-0" />
      <form
        onSubmit={handleSubmit}
        className="z-10 relative bg-white/40 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl p-10 w-full max-w-md space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 tracking-wide">
          Bienvenido de nuevo
        </h2>
        <p className="text-center text-sm text-gray-500 font-light">
          Inicia sesión para continuar
        </p>

        {error && (
          <div className="text-center text-red-500 text-sm">{error}</div>
        )}

        <div className="space-y-2">
          <label className="block text-sm text-gray-600">Correo electrónico</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="ejemplo@email.com"
            className="w-full px-4 py-3 rounded-lg bg-white/70 text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-gray-600">Contraseña</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-lg bg-white/70 text-gray-800 placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-md"
        >
          Entrar
        </button>
      </form>

      <div className="absolute top-[-5rem] right-[-5rem] w-80 h-80 bg-pink-300 opacity-20 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-[-4rem] left-[-4rem] w-60 h-60 bg-indigo-300 opacity-20 rounded-full blur-2xl z-0" />
    </div>
  );
};

export default Login;
