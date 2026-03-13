import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils/index";
import { ArrowLeft, MapPin, Phone, Mail, User } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import StatusBadge from "../components/shared/StatusBadge";
import { getLocationById } from "../api/locationApi";
import { getAllRepairs } from "../api/repairApi";
import { useSearchParams } from "react-router-dom";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="text-sm text-gray-900">{payload[0].value} ครั้ง</p>
            </div>
        );
    }
    return null;
};

export default function LocationDetail() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const [location, setLocation] = useState(null);
    const [repairs, setRepairs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const loadData = async () => {
            try {
                const loc = await getLocationById(id);
                setLocation({
                    id: loc.location_id,
                    name: loc.location_name,
                    status: Number(loc.is_active) === 1 ? "active" : "inactive"
                });
            } catch (err) {
                console.error("location error:", err);
            }
            try {
                const allRepairs = await getAllRepairs();
                const reps = allRepairs.filter(r => r.location_id == id);
                setRepairs(reps);
            } catch (err) {
                console.error("repair error:", err);
                setRepairs([]);
            }
            setLoading(false);
        };
        loadData();
    }, [id]);

    const partTypeCounts = repairs.reduce((acc, r) => {
        const type = r.part_type || "ไม่ระบุ";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});
    const chartData = Object.entries(partTypeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count }));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-6 h-6 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            {/* Back */}
            <Link to={createPageUrl("Locations")} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-6">
                <ArrowLeft className="w-3.5 h-3.5" />
                กลับไปหน้าสถานที่
            </Link>

            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-semibold text-gray-900">{location?.name || "สถานที่"}</h1>
                            {location && (
                                <StatusBadge value={location.status} />
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">จำนวนการซ่อม</p>
                        <p className="text-3xl font-semibold text-gray-900">{repairs.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Repairs Table */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-800">ประวัติการซ่อม</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/60 border-b border-gray-100">
                                    {["วันที่ซ่อม", "อุปกรณ์", "อะไหล่", "ประเภทอะไหล่", "พนักงาน"].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {repairs.length === 0 ? (
                                    <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-300 text-sm">ยังไม่มีข้อมูลการซ่อม</td></tr>
                                ) : repairs.map(r => (
                                    <tr key={r.repair_id} className="hover:bg-[#FFFBE8] transition-colors">
                                        <td className="px-5 py-4 text-gray-400">{r.repair_date || "—"}</td>
                                        <td className="px-5 py-4 font-medium text-gray-800">{r.device_name || "—"}</td>
                                        <td className="px-5 py-4 text-gray-500">{r.part_name || "—"}</td>
                                        <td className="px-5 py-4 text-gray-500">{r.part_type || "—"}</td>
                                        <td className="px-5 py-4 text-gray-500">
                                            {r.workers?.map(w => w.name).join(", ") || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-sm font-semibold text-gray-800 mb-6">ประเภทอะไหล่ที่ใช้ในการซ่อม</h2>
                    {chartData.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-300 text-sm">ยังไม่มีข้อมูล</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData} layout="vertical" barCategoryGap={8}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={90} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" fill="#F5E87C" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}