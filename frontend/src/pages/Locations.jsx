import { useState, useEffect } from "react";
import { Plus, Search, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils/index";
import PageHeader from "../components/shared/PageHeader";
import DataTable from "../components/shared/DataTable";
import Modal from "../components/shared/Modal";
import FormField, { Input, Select } from "../components/shared/FormField";
import ActionButtons from "../components/shared/ActionButtons";
import StatusBadge from "../components/shared/StatusBadge";
import {
    getAllLocation,
    createLocation,
    updateLocation,
    deleteLocation,
    restoreLocation
} from "../api/locationApi";

const empty = { location_name: "", is_active: 1 };

export default function Locations() {
    const [locations, setLocations] = useState([]);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadLocations();
    }, []);

    const loadLocations = async () => {
        try {
            const data = await getAllLocation();
            setLocations(data);
        } catch (err) {
            console.error(err);
        }
    };

    const openAdd = () => { setForm(empty); setEditId(null); setModal(true); };
    const openEdit = (row) => {
        setForm({ ...row });
        setEditId(row.location_id);
        setModal(true);
    };

    const handleSave = async () => {
        try {
            if (editId) {
                await updateLocation(editId, form);
            } else {
                await createLocation(form);
            }

            await loadLocations();
            setModal(false);
            setForm(empty);
            setEditId(null);

        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (row, e) => {
        e.stopPropagation();

        if (confirm(`ต้องการลบ "${row.location_name}" ใช่หรือไม่?`)) {
            try {
                await deleteLocation(row.location_id);
                await loadLocations();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleRestore = async (row, e) => {
        e.stopPropagation();
        if (confirm(`ต้องการกู้คืน "${row.location_name}" ใช่หรือไม่?`)) {
            try {
                await restoreLocation(row.location_id);
                await loadLocations();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const filteredLocations = locations.filter(loc =>
        loc.location_name.toLowerCase().includes(search.toLowerCase())
    );

    const f = (k) => (e) => {
        const value = k === "is_active" ? Number(e.target.value) : e.target.value;
        setForm(p => ({ ...p, [k]: value }));
    };

    const columns = [
        { key: "location_name", label: "ชื่อสถานที่", render: (v) => <span className="font-medium text-gray-800">{v}</span> },
        { key: "is_active", label: "สถานะ", render: v => <StatusBadge value={v === 1 ? "active" : "inactive"} /> },
        {
            key: "active",
            label: "",
            width: "120px",
            render: (_, row) =>
                row.is_active === 1 ? (
                    <ActionButtons
                        onEdit={() => openEdit(row)}
                        onDelete={(e) => handleDelete(row, e)}
                    />
                ) : (
                    <button
                        onClick={(e) => handleRestore(row, e)}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-green-700 bg-green-100 rounded-lg hover:bg-green-200"
                    >
                        <RotateCcw className="w-4 h-4" />
                        กู้คืน
                    </button>
                )
        }
    ];

    return (
        <div>
            <PageHeader
                title="สถานที่"
                action={
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-800 shadow-sm hover:shadow-md transition-all"
                        style={{ background: "#F5E87C" }}
                    >
                        <Plus className="w-4 h-4" /> เพิ่มสถานที่
                    </button>
                }
            />
            <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                    className="pl-9"
                    placeholder="ค้นหาสถานที่..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <DataTable
                columns={columns}
                data={filteredLocations}
                onRowClick={(row) => navigate(`/LocationDetail?id=${row.location_id}`)}
                emptyMessage="ไม่มีข้อมูลสถานที่"
            />

            <Modal open={modal} onClose={() => setModal(false)} title={editId ? "แก้ไขสถานที่" : "เพิ่มสถานที่"}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="ชื่อสถานที่" required>
                            <Input value={form.location_name} onChange={f("location_name")} placeholder="เช่น โรงเรียน" />
                        </FormField>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setModal(false)} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors">ยกเลิก</button>
                        <button onClick={handleSave} className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-800 transition-all hover:shadow-md" style={{ background: "#F5E87C" }}>
                            {editId ? "บันทึกการแก้ไข" : "เพิ่มสถานที่"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
