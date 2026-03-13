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
    const [error, setError] = useState("");

    const [confirmModal, setConfirmModal] = useState(false);
    const [confirmType, setConfirmType] = useState("");
    const [selectedLocation, setSelectedLocation] = useState(null);

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

    const openAdd = () => {
        setForm(empty);
        setEditId(null);
        setError("");
        setModal(true);
    };
    const openEdit = (row) => {
        setForm({ ...row });
        setEditId(row.location_id);
        setError("");
        setModal(true);
    };

    const thaiRegex = /^[\u0E00-\u0E7F.]+$/;
    const engRegex = /^[A-Za-z.]+$/;

    const normalize = (text) => {
        return text.replace(/\s+/g, "").trim();
    };

    const handleSave = async () => {
        try {
            setError("");
            let name = normalize(form.location_name);

            if (!name) {
                setError("กรุณากรอกชื่อสถานที่");
                return;
            }

            const isThai = thaiRegex.test(name);
            const isEng = engRegex.test(name);

            // ต้องเป็นตัวอักษรเท่านั้น
            if (!isThai && !isEng) {
                setError("ชื่อสถานที่ใช้ได้เฉพาะตัวอักษรเท่านั้น");
                return;
            }
            // ห้ามปนภาษา
            if (isThai && isEng) {
                setError("ชื่อสถานที่ต้องเป็นภาษาเดียวกัน");
                return;
            }
            const payload = {
                ...form,
                location_name: name
            };
            if (editId) {
                await updateLocation(editId, payload);
            } else {
                await createLocation(payload);
            }
            await loadLocations();
            setModal(false);
            setForm(empty);
            setEditId(null);
        } catch (err) {
            console.error(err);
            setError(err.message || "เกิดข้อผิดพลาด");
        }
    };

    const handleDelete = (row, e) => {
        e.stopPropagation();
        setSelectedLocation(row);
        setConfirmType("delete");
        setConfirmModal(true);
    };

    const handleRestore = (row, e) => {
        e.stopPropagation();
        setSelectedLocation(row);
        setConfirmType("restore");
        setConfirmModal(true);
    };

    const handleConfirm = async () => {
        try {
            if (confirmType === "delete") {
                await deleteLocation(selectedLocation.location_id);
            }
            if (confirmType === "restore") {
                await restoreLocation(selectedLocation.location_id);
            }
            await loadLocations();
            setConfirmModal(false);
        } catch (err) {
            console.error(err);
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
                    {error && (
                        <div className="p-2 text-sm text-red-600 bg-red-50 rounded-lg">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="ชื่อสถานที่" required>
                            <Input
                                value={form.location_name}
                                onChange={(e) =>
                                    setForm(p => ({
                                        ...p,
                                        location_name: e.target.value.replace(/\s/g, "")
                                    }))
                                }
                                placeholder="เช่น โรงเรียน" />
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
            <Modal
                open={confirmModal}
                onClose={() => setConfirmModal(false)}
                title="ยืนยันการทำรายการ"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        {confirmType === "delete" &&
                            `ต้องการลบ "${selectedLocation?.location_name}" ใช่หรือไม่?`
                        }
                        {confirmType === "restore" &&
                            `ต้องการกู้คืน "${selectedLocation?.location_name}" ใช่หรือไม่?`
                        }
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setConfirmModal(false)}
                            className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100"
                        >
                            ยกเลิก
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-4 py-2 rounded-xl text-sm text-white bg-red-500 hover:bg-red-600"
                        >
                            ยืนยัน
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}