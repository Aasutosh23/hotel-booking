import {
 BrowserRouter as Router,
 Route,
 Routes,
 Navigate,
} from "react-router-dom";
import Register from "./pages/register";
import SignIn from "./pages/signIn";
import Layout from "./layouts/layout";
import AddHotel from "./pages/AddHotel";
import { useAppContext } from "./contexts/AppContext";
import MyHotels from "./pages/MyHotels";
import EditHotel from "./pages/EditHotel";
import Search from "./pages/Search";
import Detail from "./pages/Detail";
import Booking from "./pages/Booking";

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
       <Search />
      </Layout>
     }
    />
    <Route
     path="/detail/:hotelId"
     element={
      <Layout>
       <Detail />
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
     path="/hotel/:hotelId/booking"
     element={
      <ProtectedRoute>
       <Layout>
        <Booking />
       </Layout>
      </ProtectedRoute>
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

    <Route
     path="/edit-hotel/:hotelId"
     element={
      <ProtectedRoute>
       <Layout>
        <EditHotel />
       </Layout>
      </ProtectedRoute>
     }
    />

    <Route
     path="/my-hotels"
     element={
      <ProtectedRoute>
       <Layout>
        <MyHotels />
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
