import {
 BrowserRouter as Router,
 Route,
 Routes,
 Navigate,
} from "react-router-dom";
import Register from "./pages/register";
import SignIn from "./pages/signIn";
import Layout from "./layouts/layout";
import AddHotel from "./pages/hotel";
import { useAppContext } from "./contexts/AppContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
 const { isLoggedIn, isLoading } = useAppContext();
 if (isLoading) {
  return null;
 }
 if (!isLoggedIn) {
  return <Navigate to="/sign-in" replace />;
 }
 return <>{children}</>;
};

const App = () => {
 return (
  <Router>
   <Routes>
    <Route
     path="/"
     element={
      <Layout>
       <p>Home Page</p>
      </Layout>
     }
    />
    <Route
     path="/search"
     element={
      <Layout>
       <p>Search Page</p>
      </Layout>
     }
    />
    <Route
     path="/register"
     element={
      <Layout>
       <Register />
      </Layout>
     }
    />
    <Route
     path="/sign-in"
     element={
      <Layout>
       <SignIn />
      </Layout>
     }
    />
    <Route
     path="/add-hotel"
     element={
      <ProtectedRoute>
       <Layout>
        <AddHotel />
       </Layout>
      </ProtectedRoute>
     }
    />
    <Route path="*" element={<Navigate to="/" />} />
   </Routes>
  </Router>
 );
};

export default App;
