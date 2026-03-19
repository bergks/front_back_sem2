// components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ isAuth, requiredRole, user, children }) => {
  if (!isAuth) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/products" />;
  }
  
  return children;
};

export default PrivateRoute;