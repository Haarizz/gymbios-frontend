// api/sidebarMenu.js
// This file defines the structure and icons for the sidebar menu.

export const sidebarMenu = [
  {
    section: "Dashboard",
    icon: "HiOutlineViewGrid", // Icon for the main section
    path: "/dashboard",
    collapsible: false, // This item is a direct link, not a dropdown
    items: [] // No sub-items
  },
  {
    section: "Community",
    icon: "HiOutlineHeart",
    collapsible: true, // This item opens a dropdown
    items: [
      { label: "Members", icon: "HiOutlineUsers", path: "/members" },
      { label: "Billing", icon: "HiOutlineCurrencyDollar", path: "/billing" },
      { label: "Manage Plans", icon: "HiOutlineCog", path: "/plans" },
      { label: "Attendance", icon: "HiOutlineCalendar", path: "/attendance" },
      { label: "Check In", icon: "HiOutlineLogin", path: "/checkin" },
      { label: "Training Streams", icon: "HiOutlineVideoCamera", path: "/training-streams" },
      { label: "Reports", icon: "HiOutlineChartBar", path: "/community-reports" },
      { label: "Analytics", icon: "HiOutlineChartPie", path: "/community-analytics" },
    ],
  },
  {
    section: "Member Connect",
    icon: "HiOutlineUserAdd",
    collapsible: true,
    items: [
        { label: "Promotions & Campaign", icon: "HiOutlineSpeakerphone", path: "/promotions" },
        { label: "Referrals", icon: "HiOutlineShare", path: "/referrals" },
        { label: "Leads", icon: "HiOutlineAtSymbol", path: "/leads" },
        { label: "Follow-ups", icon: "HiOutlinePhoneOutgoing", path: "/follow-ups" },
        { label: "Messaging", icon: "HiOutlineChatAlt2", path: "/messaging" },
        { label: "Automations", icon: "HiOutlineLightningBolt", path: "/automations" },
        { label: "Member Experience Tracker", icon: "HiOutlineEmojiHappy", path: "/experience-tracker" },
        { label: "Service Portfolio", icon: "HiOutlineBookOpen", path: "/service-portfolio" },
        { label: "Reports", icon: "HiOutlineChartBar", path: "/member-connect-reports" },
        { label: "Analytics", icon: "HiOutlineChartPie", path: "/member-connect-analytics" },
    ]
  },
  {
    section: "Sales & Purchases",
    icon: "HiOutlineShoppingCart",
    collapsible: true,
    items: [
      { label: "Point of Sale", icon: "HiOutlineCreditCard", path: "/pos" },
      { label: "Products", icon: "HiOutlineCube", path: "/products" },
      { label: "Category", icon: "HiOutlineTag", path: "/categories" },
      { label: "Purchase Order", icon: "HiOutlineClipboardList", path: "/purchase-orders" },
      { label: "Purchase", icon: "HiOutlineShoppingBag", path: "/purchases" },
      { label: "Wastage / Returns", icon: "HiOutlineRefresh", path: "/wastage-return" },
      { label: "Production / Recipe", icon: "HiOutlineCake", path: "/production" },
      { label: "Reports", icon: "HiOutlineChartBar", path: "/sales-reports" },
      { label: "Analytics", icon: "HiOutlineChartPie", path: "/sales-analytics" },
    ],
  },
  {
    section: "Financials",
    icon: "HiOutlineCalculator",
    collapsible: true,
    items: [
      { label: "Ledgers", icon: "HiOutlineBookOpen", path: "/ledgers" },
      { label: "Receipt Voucher", icon: "HiOutlineReceiptTax", path: "/receipt-voucher" },
      { label: "Journal Voucher", icon: "HiOutlineDocumentText", path: "/journal-voucher" },
      { label: "Payment Voucher", icon: "HiOutlineCash", path: "/payment-voucher" },
      { label: "Bank Reconciliations", icon: "HiOutlineLibrary", path: "/bank-reconciliation" },
      { label: "Expenses", icon: "HiOutlineTrendingDown", path: "/expenses" },
      { label: "Budgeting", icon: "HiOutlineScale", path: "/budgeting" },
      { label: "Tax Compliance", icon: "HiOutlineClipboardCheck", path: "/tax-compliance" },
      { label: "Reports", icon: "HiOutlineChartBar", path: "/financial-reports" },
      { label: "Analytics", icon: "HiOutlineChartPie", path: "/financial-analytics" },
    ],
  },
  {
    section: "Payroll & Employees",
    icon: "HiOutlineUserGroup",
    collapsible: true,
    items: [
      { label: "Staffs & Trainers", icon: "HiOutlineUsers", path: "/staff" },
      { label: "Trainings & Classes", icon: "HiOutlineAcademicCap", path: "/classes" },
      { label: "Bookings", icon: "HiOutlineCalendar", path: "/bookings" },
      { label: "Payroll", icon: "HiOutlineCurrencyDollar", path: "/payroll" },
      { label: "Salary Payments", icon: "HiOutlineCash", path: "/salary-payments" },
      { label: "Salary Advances", icon: "HiOutlineTrendingUp", path: "/salary-advances" },
      { label: "Recruitment", icon: "HiOutlineBriefcase", path: "/recruitment" },
      { label: "Reports", icon: "HiOutlineChartBar", path: "/payroll-reports" },
      { label: "Analytics", icon: "HiOutlineChartPie", path: "/payroll-analytics" },
      { label: "Settings", icon: "HiOutlineCog", path: "/payroll-settings" },
    ],
  },
  {
    section: "Assets",
    icon: "HiOutlineOfficeBuilding",
    collapsible: true,
    items: [
        { label: "Manage Assets", icon: "HiOutlineCube", path: "/manage-assets" },
        { label: "Transactions", icon: "HiOutlineRefresh", path: "/asset-transactions" },
        { label: "Reports", icon: "HiOutlineChartBar", path: "/asset-reports" },
        { label: "Analytics", icon: "HiOutlineChartPie", path: "/asset-analytics" },
        { label: "Settings", icon: "HiOutlineCog", path: "/asset-settings" },
    ]
  },
  // Direct links at the bottom
  { section: "GymOS", icon: "HiOutlineCog", path: "/gymos", collapsible: false, items: [] },
  { section: "BiOS", icon: "HiOutlineChip", path: "/bios", collapsible: false, items: [] },
  { section: "Member Hub", icon: "HiOutlineUserCircle", path: "/member-hub", collapsible: false, items: [] },
  { section: "GymBios Pricing", icon: "HiOutlineCreditCard", path: "/pricing", collapsible: false, items: [] },
  { section: "My Profile", icon: "HiOutlineUser", path: "/profile", collapsible: false, items: [], isProfileLink: true }, // Added a flag for styling
];