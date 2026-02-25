import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import AdminRoute from "./components/AdminRoute";
import ScrollToTop from "./components/ScrollToTop";
import PageLoader from "./components/PageLoader";
import ConsentBanner from "./components/ConsentBanner";

// Lazy-loaded route components (code splitting)
const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Shipping = lazy(() => import("./pages/Shipping"));
const Heritage = lazy(() => import("./pages/Heritage"));
const EvolutionFezKufi = lazy(() => import("./pages/EvolutionFezKufi"));
const LocalBoKaap = lazy(() => import("./pages/LocalBoKaap"));
const LocalAthlone = lazy(() => import("./pages/LocalAthlone"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Community = lazy(() => import("./pages/Community"));
const GuidesIndex = lazy(() => import("./pages/guides/GuidesIndex"));
const KufiCare = lazy(() => import("./pages/guides/KufiCare"));
const EidHeadwearGuide = lazy(() => import("./pages/guides/EidHeadwearGuide"));
const IslamicHeadwearCapeTown = lazy(() => import("./pages/guides/IslamicHeadwearCapeTown"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Success = lazy(() => import("./pages/Success"));
const Cancel = lazy(() => import("./pages/Cancel"));
const Review = lazy(() => import("./pages/Review"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const Account = lazy(() => import("./pages/Account"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminCustomers = lazy(() => import("./pages/admin/Customers"));
const AdminReservations = lazy(() => import("./pages/admin/Reservations"));
const AdminLogistics = lazy(() => import("./pages/admin/Logistics"));
const AdminReviews = lazy(() => import("./pages/admin/Reviews"));
const AdminMajlis = lazy(() => import("./pages/admin/Majlis"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
        <ConsentBanner />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/heritage" element={<Heritage />} />
          <Route path="/culture/evolution-fez-kufi-cape" element={<EvolutionFezKufi />} />
          <Route path="/near/bo-kaap" element={<LocalBoKaap />} />
          <Route path="/near/athlone" element={<LocalAthlone />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/community" element={<Community />} />
          <Route path="/guides" element={<GuidesIndex />} />
          <Route path="/guides/kufi-care" element={<KufiCare />} />
          <Route path="/guides/eid-headwear-south-africa" element={<EidHeadwearGuide />} />
          <Route path="/guides/islamic-headwear-cape-town" element={<IslamicHeadwearCapeTown />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/review" element={<Review />} />
          <Route path="/track/:orderId" element={<OrderTracking />} />
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="logistics" element={<AdminLogistics />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="majlis" element={<AdminMajlis />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </CartProvider>
    </AuthProvider>
  );
}

export default App;
