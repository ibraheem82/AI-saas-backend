import { BrowserRouter, Routes, Route } from "react-router-dom";
import Registeration from "./components/Users/Register"
import './App.css'
import Login from './components/Users/Login';
import Dashboard from './components/Users/Dashboard';
import PrivateNavbar from './components/Navbar/PrivateNavbar';
import PublicNavbar from './components/Navbar/PublicNavbar';
import Home from "./components/Home/Home";
import { useAuth } from "./AuthContext/AuthContext";
import AuthRoute from "./components/AuthRoute/AuthRoute";
import ContentAIAssistant from "./components/ContentGeneration/ContentGeneration";
import Plans from "./components/Plans/Plan";
import FreePlanSignup from "./components/Payment/FreePlanSignup";
import CheckoutForm from "./components/Payment/CheckoutForm";
import PaymentSuccess from "./components/Payment/PaymentSuccess";


function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <BrowserRouter>
        {/* Navbar */}
        {isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />}
        <Routes>
          <Route path='/register' element={<Registeration />} />
          <Route path='/login' element={<Login />} />
          <Route
            path='/dashboard'
            element={
              <AuthRoute>
                <Dashboard />
              </AuthRoute>
            }
          />
          <Route
            path='/generate-content'
            element={
              <AuthRoute>
                <ContentAIAssistant />
              </AuthRoute>
            }
          />
          <Route path='/' element={<Home />} />
          <Route path='/plans' element={<Plans />} />
          <Route path='/free-plan' element={<FreePlanSignup />} />
          <Route path='/checkout/:plan' element={<CheckoutForm />} />
          <Route path="/success" element={<PaymentSuccess />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
