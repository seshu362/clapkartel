import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './components/Login/index';
import Signup from './components/Signup';
import HomePage from './components/HomePage';
import LoginPassword from './components/LoginPassword';
import OTPVerification from './components/OTPVerification';
import CraftPage from './components/CraftsPage';
import OtherSection from './components/OtherSection';
import ChoreographyPage from './components/ChoreographyPage';
import DetailChoreographyPage from './components/DetailChoreographyPage';
import Header from './components/Header';
import NavBar from './components/Navbar';
import Carousel from './components/Carousel';
import WishlistPage from './components/WishlistPage';
import NotificationsPage from './components/NotificationsPage';
import Footer from './components/Footer';
import Profile from './components/Profile';
import ProfileUpdate from './components/ProfileUpdate';
import Gallery from './components/Gallery';
import ProtectedRoute from './components/ProtectedRoute';
import SubCategoryUsersPage from './components/SubCategoryUsersPage';
import OtherSectionContentPage from './components/OtherSectionContentPage';
import UsersPage from './components/UsersPage';
import ActorsPage from './components/ActorsPage';
import ActressPage from './components/ActressPage';
import CastingPage from './components/CastingPage';
import UsersProfile from './components/UsersProfile';
import DirectorPage from './components/DirectorPage';
import CraftDetailPage from './components/CraftDetailPage';




function App() {
  const location = useLocation();

  // Pages where Header, NavBar, Carousel, and Footer should NOT appear
  const authPages = ['/login', '/login-password', '/signup', '/verify-otp'];

  // Pages that have embedded Header/NavBar (don't show global Header/NavBar)
  const embeddedHeaderPages = ['/users'];

  const showHeaderNavCarousel = !authPages.includes(location.pathname) && !embeddedHeaderPages.includes(location.pathname);

  // Pages where Carousel should NOT appear (but Header and NavBar should)
  const noCarouselPages = ['/detailchoreographypage', '/notification', '/wishlist', '/users', '/followers', '/profile', '/profileupate', '/gallery', '/actors', '/actress', '/casting', '/user-profile', '/director', '/craft-detail', '/subcategory-users', '/other-section-content'];


  const showCarousel = showHeaderNavCarousel && !noCarouselPages.includes(location.pathname);

  return (
    <div className="App">
      {showHeaderNavCarousel && (
        <>
          <Header />
          <NavBar />
          {showCarousel && <Carousel />}
        </>
      )}
      <Routes>
        {/* Public Routes - No Authentication Required */}
        <Route path="/login" element={<Login />} />
        <Route path="/login-password" element={<LoginPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<OTPVerification />} />

        {/* Protected Routes - Authentication Required */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/craft" element={<ProtectedRoute><CraftPage /></ProtectedRoute>} />
        <Route path="/craft-detail" element={<ProtectedRoute><CraftDetailPage /></ProtectedRoute>} />
        <Route path="/other-section" element={<ProtectedRoute><OtherSection /></ProtectedRoute>} />
        <Route path='/choreography' element={<ProtectedRoute><ChoreographyPage /></ProtectedRoute>} />
        <Route path='/detailchoreographypage' element={<ProtectedRoute><DetailChoreographyPage /></ProtectedRoute>} />
        <Route path='/followers' element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path='/users' element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path='/actors' element={<ProtectedRoute><ActorsPage /></ProtectedRoute>} />
        <Route path='/actress' element={<ProtectedRoute><ActressPage /></ProtectedRoute>} />
        <Route path='/casting' element={<ProtectedRoute><CastingPage /></ProtectedRoute>} />
        <Route path='/director' element={<ProtectedRoute><DirectorPage /></ProtectedRoute>} />
        <Route path='/notification' element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

        <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path='/profileupate' element={<ProtectedRoute><ProfileUpdate /></ProtectedRoute>} />
        <Route path='/gallery' element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
        <Route path='/subcategory-users' element={<ProtectedRoute><SubCategoryUsersPage /></ProtectedRoute>} />
        <Route path='/other-section-content' element={<ProtectedRoute><OtherSectionContentPage /></ProtectedRoute>} />

        <Route path='/user-profile' element={<ProtectedRoute><UsersProfile /></ProtectedRoute>} />

      </Routes>
      {(showHeaderNavCarousel || embeddedHeaderPages.includes(location.pathname)) && <Footer />}
    </div>
  );
}

export default App;