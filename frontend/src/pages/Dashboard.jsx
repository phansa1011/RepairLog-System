import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils/index";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Wrench, Monitor, MapPin, Users, TrendingUp, Clock } from "lucide-react";
import PageHeader from "../components/shared/PageHeader";
import { getAllWorkers } from "../api/workerApi";
import { getAllLocation } from "../api/locationApi";
import { getAllDevice } from "../api/deviceApi";
import { getAllRepairs } from "../api/repairApi";

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-3xl font-semibold text-gray-900 mt-0.5">{value}</p>
            </div>
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="text-sm font-semibold text-gray-900">{payload[0].value} repairs</p>
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
        }
    }, []);

    const [workers, setWorkers] = useState([]);
    const [locations, setLocations] = useState([]);
    const [devices, setDevices] = useState([]);
    const [repairs, setRepairs] = useState([]);

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const data = await getAllWorkers();
                const activeWorkers = data.filter(w => w.is_active === 1);
                setWorkers(activeWorkers);
            } catch (err) {
                console.error("Error fetching workers:", err);
            }
        };

        fetchWorkers();
    }, []);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const data = await getAllLocation();
                const activeLocations = data.filter(l => l.is_active === 1);
                setLocations(activeLocations);
            } catch (err) {
                console.error("Error fetching locations:", err);
            }
        };

        fetchLocations();
    }, []);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const data = await getAllDevice();
                const activeDevices = data.filter(d => d.is_active === 1);
                setDevices(activeDevices);
            } catch (err) {
                console.error("Error fetching devices:", err);
            }
        };

        fetchDevices();
    }, []);

    useEffect(() => {
        const fetchRepairs = async () => {
            try {
                const data = await getAllRepairs();
                console.log(data);
                setRepairs(data);
            } catch (err) {
                console.error("Error fetching repairs:", err);
            }
        };

        fetchRepairs();
    }, []);

    const recentRepairs = [...repairs]
        .sort((a, b) => new Date(b.repair_date) - new Date(a.repair_date))
        .slice(0, 8);

    const deviceRepairCounts = repairs.reduce((acc, r) => {
        const name = r.device_name || "Unknown";
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});
    const chartData = Object.entries(deviceRepairCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count }));

    const partTypeCounts = repairs.reduce((acc, r) => {
        const type = r.part_type || "Unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const partChartData = Object.entries(partTypeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count }));

    return (
        <div>
            <PageHeader title="Dashboard" />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={Wrench} label="การซ่อม" value={repairs.length} color="bg-[#F5E87C] text-gray-700" />
                <StatCard icon={Monitor} label="อุปกรณ์" value={devices.length} color="bg-blue-50 text-blue-500" />
                <StatCard icon={MapPin} label="สถานที่" value={locations.length} color="bg-green-50 text-green-500" />
                <StatCard icon={Users} label="พนักงาน" value={workers.length} color="bg-purple-50 text-purple-500" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full min-w-0 items-start">
                {/* Recent Repairs */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <h2 className="text-sm font-semibold text-gray-800">การซ่อมล่าสุด</h2>
                        </div>
                        <Link to={createPageUrl("Repairs")} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">View all →</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm table-fixed">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/50">
                                    {["วันที่ซ่อม", "อุปกรณ์", "ชิ้นส่วน", "ประเภทชิ้นส่วน", "พนักงาน"].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {false ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i}>
                                            {Array(5).fill(0).map((_, j) => (
                                                <td key={j} className="px-5 py-4">
                                                    <div className="h-3.5 bg-gray-100 rounded animate-pulse w-20" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : recentRepairs.length === 0 ? (
                                    <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-300 text-sm">ไม่มีรายการซ่อม</td></tr>
                                ) : recentRepairs.map(r => (
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

                {/* Bar Chart */}
                <div className="xl:col-span-1 flex flex-col gap-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            <h2 className="text-sm font-semibold text-gray-800">อุปกรณ์ที่รับการซ่อมมากที่สุด</h2>
                        </div>
                        {chartData.length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-gray-300 text-sm">ไม่มีข้อมูล</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={240}>
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
                    <div className="mt-10">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            <h2 className="text-sm font-semibold text-gray-800">
                                ประเภทชิ้นส่วนที่รับการซ่อมมากที่สุด
                            </h2>
                        </div>

                        {partChartData.length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-gray-300 text-sm">
                                ไม่มีข้อมูล
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={partChartData} layout="vertical" barCategoryGap={8}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={90} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" fill="#C7F0D8" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}