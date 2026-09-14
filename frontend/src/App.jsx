import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';
import Home from './pages/Home';
import ComingSoon from './pages/ComingSoon';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Service from './pages/Service';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/admin/AdminLogin';
import AdminForgotPassword from './pages/admin/AdminForgotPassword';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminServices from './pages/admin/AdminServices';
import AdminServiceForm from './pages/admin/AdminServiceForm';
import AdminAbout from './pages/admin/AdminAbout';
import AdminAboutForm from './pages/admin/AdminAboutForm';
import AdminContact from './pages/admin/AdminContact';
import AdminContactForm from './pages/admin/AdminContactForm';
import AdminSliders from './pages/admin/AdminSliders';
import AdminSliderForm from './pages/admin/AdminSliderForm';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        {/* Public storefront */}
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/coming-soon/:category"
          element={
            <Layout>
              <ComingSoon />
            </Layout>
          }
        />
        <Route
          path="/products"
          element={
            <Layout>
              <Products />
            </Layout>
          }
        />
        <Route
          path="/products/:slug"
          element={
            <Layout>
              <ProductDetail />
            </Layout>
          }
        />
        <Route
          path="/about"
          element={
            <Layout>
              <About />
            </Layout>
          }
        />
        <Route
          path="/service"
          element={
            <Layout>
              <Service />
            </Layout>
          }
        />
        <Route
          path="/contact"
          element={
            <Layout>
              <Contact />
            </Layout>
          }
        />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <AdminProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <ProtectedRoute>
              <AdminProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/:id/edit"
          element={
            <ProtectedRoute>
              <AdminProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute>
              <AdminServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services/new"
          element={
            <ProtectedRoute>
              <AdminServiceForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services/:id/edit"
          element={
            <ProtectedRoute>
              <AdminServiceForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/about"
          element={
            <ProtectedRoute>
              <AdminAbout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/about/new"
          element={
            <ProtectedRoute>
              <AdminAboutForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/about/:id/edit"
          element={
            <ProtectedRoute>
              <AdminAboutForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/contact"
          element={
            <ProtectedRoute>
              <AdminContact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/contact/new"
          element={
            <ProtectedRoute>
              <AdminContactForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/contact/:id/edit"
          element={
            <ProtectedRoute>
              <AdminContactForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/sliders"
          element={
            <ProtectedRoute>
              <AdminSliders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sliders/new"
          element={
            <ProtectedRoute>
              <AdminSliderForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sliders/:id/edit"
          element={
            <ProtectedRoute>
              <AdminSliderForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Layout>
              <NotFound />
            </Layout>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
