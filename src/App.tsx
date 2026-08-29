import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MyOrdersPage } from './pages/MyOrdersPage'
import { OAuthCompletePage } from './pages/OAuthCompletePage'
import { OAuthErrorPage } from './pages/OAuthErrorPage'
import { OrderCompletePage } from './pages/OrderCompletePage'
import { OrderDetailPage } from './pages/OrderDetailPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ProductListPage } from './pages/ProductListPage'
import { SecuritySettingsPage } from './pages/SecuritySettingsPage'
import { SignupPage } from './pages/SignupPage'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/complete" element={<OrderCompletePage />} />
        <Route path="/orders" element={<MyOrdersPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/oauth/complete" element={<OAuthCompletePage />} />
        <Route path="/oauth/error" element={<OAuthErrorPage />} />
        <Route path="/account/security" element={<SecuritySettingsPage />} />
      </Route>
    </Routes>
  )
}
