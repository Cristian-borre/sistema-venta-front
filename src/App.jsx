import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
// import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layout/MainLayout";
import Spinner from "./components/Spinner";
import { LoadingProvider, useLoading } from "./context/LoadingContext";
import Productos from "./pages/Productos";
import Clientes from "./pages/Clientes";
import Ventas from "./pages/Ventas";
import CrearVenta from "./pages/CrearVenta";
import DetalleVenta from "./pages/DetalleVenta";

function AppRoutes() {
  const { user } = useAuth();
  const { isLoading } = useLoading();

  return (
    <>
      {isLoading && <Spinner />}
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<Productos />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="ventas/crear" element={<CrearVenta />} />
          <Route path="ventas/:id" element={<DetalleVenta />} />
        </Route>

        <Route
          path="*"
          element={!user ? <Login /> : <Navigate to="/" replace />}
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
