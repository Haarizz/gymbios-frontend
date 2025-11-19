export default function SearchBar() {
  return (
    <div className="relative my-4">
      <input
        type="text"
        placeholder="Search by member name, email or id, or use navigation..."
        className="w-full border border-gray-300 rounded-lg pl-4 py-2 text-sm focus:outline-none focus:border-teal-500"
      />
    </div>
  );
}