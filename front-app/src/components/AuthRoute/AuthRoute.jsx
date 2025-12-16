/*
    * -> Navigate: This component is used to programmatically navigate the user to a different route.
* -> useLocation: This hook provides access to the current location object, which contains information about the current URL.



*/
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../AuthContext/AuthContext";
import AuthCheckingComponent from "../Alert/AuthCheckingComponent";

//  It receives a children prop, which represents the components that should be rendered if the user is authenticated.
const AuthRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, isError } = useAuth();
  if (isLoading) {
    return <AuthCheckingComponent />;
  }
//    This conditional statement checks if either isError is true (meaning there was an error during authentication check) or isAuthenticated is false (meaning the user is not authenticated). If either of these conditions is met, it renders the <Navigate> component
// This passes a state object to the /login route. The from: location part stores the current location (the protected route the user was trying to access) in the navigation state. This is often used on the login page to redirect the user back to the originally requested page after they successfully log in.
  if (isError || isAuthenticated === false) {
    // * -> replace: This prop tells the <Navigate> component to replace the current entry in the browser's history stack instead of adding a new one. This prevents the user from being able to navigate back to the protected route using the browser's back button without authenticating.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

export default AuthRoute;