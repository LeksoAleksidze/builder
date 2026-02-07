import { Navigate } from 'react-router-dom';

export function AuthRedirect() {
  const token = localStorage.getItem('authToken');

  if (token) {
    return <Navigate to="/server-selection" replace />;
  }

  return <Navigate to="/login" replace />;
}
