import {
  HiOutlineHome,
  HiUserGroup,
  HiUsers,
  HiShoppingCart,
  HiChartPie,
  HiCog,
  HiTemplate,
  HiCalendar,
  HiCollection,
} from "react-icons/hi";

export const sidebarMenu = [
  {
    section: "Dashboard",
    collapsible: false,
    items: [{ label: "Dashboard", icon: HiOutlineHome, path: "/dashboard" }],
  },
  {
    section: "Community",
    collapsible: true,
    items: [
      { label: "Members", icon: HiUserGroup, path: "/members" },
      { label: "Billing", icon: HiShoppingCart, path: "/billing" },
      { label: "Manage Plans", icon: HiTemplate, path: "/plans" },
      { label: "Attendance", icon: HiCalendar, path: "/attendance" },
      { label: "Check In", icon: HiCalendar, path: "/checkin" },
      {
        label: "Training Streams",
        icon: HiCollection,
        path: "/training-streams",
      },
      { label: "Reports", icon: HiChartPie, path: "/reports" },
      { label: "Analytics", icon: HiChartPie, path: "/analytics" },
    ],
  },
    {
  section: "Sales & Purchases",
  collapsible: true,
  items: [
    { label: "Point of Sale", icon: HiShoppingCart, path: "/pos" },
    { label: "Products", icon: HiCollection, path: "/products" },
    { label: "Category", icon: HiTemplate, path: "/categories" },
    { label: "Purchase Order", icon: HiShoppingCart, path: "/purchase-orders" },
    { label: "Purchase", icon: HiShoppingCart, path: "/purchases" },
    { label: "Wastage / Returns", icon: HiChartPie, path: "/wastage-return" },
    { label: "Production / Recipe", icon: HiCollection, path: "/production" },
  ],
},

  {
    section: "Financials",
    collapsible: true,
    items: [
      { label: "Invoices", icon: HiShoppingCart, path: "/invoices" },
      { label: "Expenses", icon: HiChartPie, path: "/expenses" },
    ],
  },
  {
    section: "Payroll & Employees",
    collapsible: true,
    items: [
      { label: "Staffs & Trainers", icon: HiUsers, path: "/staff" },
      { label: "Trainings & Classes", icon: HiCalendar, path: "/classes" },
      { label: "Bookings", icon: HiTemplate, path: "/bookings" },
      {
        label: "Salary Payments",
        icon: HiCollection,
        path: "/salary-payments",
      },
      {
        label: "Salary Advances",
        icon: HiCollection,
        path: "/salary-advances",
      },
    ],
  },
];
