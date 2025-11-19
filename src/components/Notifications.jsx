import { HiOutlineHome } from "react-icons/hi";

export default function Notifications() {
  return (
    <div className="bg-white rounded shadow p-4 border border-gray-100 text-sm">
      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold text-xs">Notifications</p>
        <span className="text-red-600 text-xs font-semibold px-2 py-0.5 rounded bg-red-100">New</span>
      </div>
      <div className="flex items-center space-x-2 text-red-600 text-xs">
        <HiOutlineHome />
        <span>Demo Mode active: You are currently viewing a demo data</span>
        <a href="#" className="underline ml-auto">
          Hide
        </a>
      </div>
      <button className="w-full mt-2 text-xs text-teal-600 hover:underline">View All Notifications</button>
    </div>
  );
}