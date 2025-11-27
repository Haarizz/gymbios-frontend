import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";

// Members
import MemberPage from "./components/MemberPage";
import MembersListPage from "./components/MembersListPage";
import EditMemberPage from "./components/EditMemberPage";

// Staff
import StaffListPage from "./components/StaffListPage";
import StaffPage from "./components/StaffPage";
import EditStaffPage from "./components/EditStaffPage";

// Plans
import ManagePlansPage from "./components/ManagePlansPage";
import CreatePlanPage from "./components/CreatePlanPage";
import EditPlanPage from "./components/EditPlanPage";

// Products
import ProductsPage from "./components/ProductsPage";
import AddProductPage from "./components/AddProductPage";
import EditProductPage from "./components/EditProductPage";

// Categories
import CategoriesPage from "./components/CategoriesPage";
import AddCategoryPage from "./components/AddCategoryPage";
import EditCategoryPage from "./components/EditCategoryPage";

// Purchase Orders
import POList from "./components/POList";
import CreateOrEditPO from "./components/CreateOrEditPO";

// Purchases
import PurchaseList from "./components/PurchaseList";
import CreatePurchase from "./components/CreatePurchase";

// Wastage Return
import WastageReturnList from "./components/WastageReturnList";
import CreateWastageReturn from "./components/CreateWastageReturn";

// Classes
import TrainingClassList from "./components/TrainingClassList";
import CreateTrainingClass from "./components/CreateTrainingClass";

// Bookings
import BookingsList from "./components/BookingsList";
import CreateOrEditBooking from "./components/CreateOrEditBooking";

// Profile
import MyProfile from "./components/MyProfile";

// Shared
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route path="/login" element={<LoginPage />} />

        {/* PROTECTED ROUTES (ONE PrivateRoute + ONE Layout) */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Members */}
          <Route path="/addmembers" element={<MemberPage />} />
          <Route path="/members" element={<MembersListPage />} />
          <Route path="/edit-member/:id" element={<EditMemberPage />} />

          {/* Staff */}
          <Route path="/staff" element={<StaffListPage />} />
          <Route path="/add-staff" element={<StaffPage />} />
          <Route path="/edit-staff/:id" element={<EditStaffPage />} />

          {/* Plans */}
          <Route path="/plans" element={<ManagePlansPage />} />
          <Route path="/create-plan" element={<CreatePlanPage />} />
          <Route path="/edit-plan/:planId" element={<EditPlanPage />} />

          {/* Profile */}
          <Route path="/profile" element={<MyProfile />} />

          {/* Products */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<AddProductPage />} />
          <Route path="/products/:id/edit" element={<EditProductPage />} />

          {/* Categories */}
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/new" element={<AddCategoryPage />} />
          <Route path="/categories/:id/edit" element={<EditCategoryPage />} />

          {/* Purchase Orders */}
          <Route path="/purchase-orders" element={<POList />} />
          <Route path="/purchase-orders/add" element={<CreateOrEditPO />} />
          <Route path="/purchase-orders/edit/:id" element={<CreateOrEditPO />} />

          {/* Purchases */}
          <Route path="/purchases" element={<PurchaseList />} />
          <Route path="/purchases/add" element={<CreatePurchase />} />
          <Route path="/purchases/edit/:id" element={<CreatePurchase />} />

          {/* Wastage Return */}
          <Route path="/wastage-return" element={<WastageReturnList />} />
          <Route path="/create-wastage-return" element={<CreateWastageReturn />} />
          <Route path="/edit-wastage-return/:id" element={<CreateWastageReturn />} />

          {/* Classes */}
          <Route path="/classes" element={<TrainingClassList />} />
          <Route path="/classes/new" element={<CreateTrainingClass />} />

          {/* Bookings */}
          <Route path="/bookings" element={<BookingsList />} />
          <Route path="/bookings/new" element={<CreateOrEditBooking />} />
          <Route path="/bookings/:id/edit" element={<CreateOrEditBooking />} />

        </Route>

        {/* DEFAULT REDIRECT */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}
