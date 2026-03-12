const configs = {
  active: "bg-green-50 text-green-600",
  inactive: "bg-gray-100 text-gray-400",
  pending: "bg-yellow-50 text-yellow-600",
  in_progress: "bg-blue-50 text-blue-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-400",
  available: "bg-green-50 text-green-600",
  out_of_stock: "bg-orange-50 text-orange-500",
  discontinued: "bg-gray-100 text-gray-400",
  low: "bg-gray-100 text-gray-500",
  medium: "bg-yellow-50 text-yellow-600",
  high: "bg-orange-50 text-orange-500",
  critical: "bg-red-50 text-red-500",
  admin: "bg-purple-50 text-purple-600",
  technician: "bg-blue-50 text-blue-600",
  user: "bg-gray-100 text-gray-500",
};

const labelMap = {
  active: "ใช้งาน",
  inactive: "ไม่ใช้งาน",
};

export default function StatusBadge({ value }) {
  const key = (value || "").toLowerCase().replace(/ /g, "_");
  const cls = configs[key] || "bg-gray-100 text-gray-500";
  const label =
    labelMap[key] ||
    (value || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}