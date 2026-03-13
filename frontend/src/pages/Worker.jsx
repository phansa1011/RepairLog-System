import { useState, useEffect } from "react";
import { Plus, Search, RotateCcw } from "lucide-react";
import PageHeader from "../components/shared/PageHeader";
import DataTable from "../components/shared/DataTable";
import Modal from "../components/shared/Modal";
import FormField, { Input, Select } from "../components/shared/FormField";
import ActionButtons from "../components/shared/ActionButtons";
import StatusBadge from "../components/shared/StatusBadge";
import {
    getAllWorkers,
    createWorker,
    updateWorker,
    deleteWorker,
    restoreWorker
} from "../api/workerApi";

const empty = { staff_id: "", name: "", lastname: "", is_active: 1 };

export default function Workers() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const data = await getAllWorkers();
            setWorkers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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
        setEditId(row.worker_id);
        setError("");
        setModal(true);
    };

    const thaiRegex = /^[ก-๙]+$/;
    const engRegex = /^[A-Za-z]+$/;

    const handleSave = async () => {
        try {
            setError("");

            const name = form.name.trim();
            const lastname = form.lastname.trim();

            const isThaiName = thaiRegex.test(name);
            const isEngName = engRegex.test(name);

            const isThaiLast = thaiRegex.test(lastname);
            const isEngLast = engRegex.test(lastname);

            const staffRegex = /^[A-Za-z0-9]+$/;

            if (!staffRegex.test(form.staff_id)) {
                setError("รหัสพนักงานใช้ได้เฉพาะ A-Z และ 0-9");
                return;
            }

            //ต้องเป็นตัวอักษรเท่านั้น
            if (!isThaiName && !isEngName) {
                setError("ชื่อใช้ได้เฉพาะตัวอักษรเท่านั้น");
                return;
            }
            if (!isThaiLast && !isEngLast) {
                setError("นามสกุลใช้ได้เฉพาะตัวอักษรเท่านั้น");
                return;
            }

            //ต้องเป็นภาษาเดียวกัน
            if ((isThaiName && isEngLast) || (isEngName && isThaiLast)) {
                setError("ชื่อและนามสกุลต้องเป็นภาษาเดียวกัน");
                return;
            }
            if (editId) {
                await updateWorker(editId, form);
            } else {
                await createWorker(form);
            }
            await fetchWorkers();
            setModal(false);
        } catch (err) {
            console.error(err);
            setError(
                err.message || "เกิดข้อผิดพลาด"
            );
        }
    };

    const handleDelete = async (row) => {
        if (confirm(`ต้องการลบ "${row.name || row.lastname}" ใช่หรือไม่?`)) {
            try {
                await deleteWorker(row.worker_id);
                await fetchWorkers();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleRestore = async (row) => {
        if (confirm(`ต้องการกู้คืน "${row.name}" ใช่หรือไม่?`)) {
            try {
                await restoreWorker(row.worker_id);
                await fetchWorkers();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const filteredWorkers = workers.filter(w =>
        w.staff_id?.toLowerCase().includes(search.toLowerCase()) ||
        w.name?.toLowerCase().includes(search.toLowerCase()) ||
        w.lastname?.toLowerCase().includes(search.toLowerCase())
    );

    const f = (k) => (e) => {
        const value = k === "is_active" ? Number(e.target.value) : e.target.value;
        setForm(p => ({ ...p, [k]: value }));
    };

    const columns = [
        { key: "staff_id", label: "รหัสพนักงาน" },
        { key: "name", label: "ชื่อ-สกุล", render: (_, row) => `${row.name} ${row.lastname}` },
        { key: "is_active", label: "สถานะ", render: v => <StatusBadge value={v === 1 ? "active" : "inactive"} /> },
        {
            key: "active",
            label: "",
            width: "120px",
            render: (_, row) =>
                row.is_active === 1 ? (
                    <ActionButtons
                        onEdit={() => openEdit(row)}
                        onDelete={() => handleDelete(row)}
                    />
                ) : (
                    <button
                        onClick={() => handleRestore(row)}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-green-700 bg-green-100 rounded-lg hover:bg-green-200"
                    >
                        <RotateCcw className="w-4 h-4" />
                        กู้คืน
                    </button>
                )
        }
    ];

    return (
        <div className="min-w-0">
            <PageHeader
                title="พนักงาน"
                action={
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-800 shadow-sm hover:shadow-md transition-all"
                        style={{ background: "#F5E87C" }}
                    >
                        <Plus className="w-4 h-4" /> เพิ่มพนักงาน
                    </button>
                }
            />
            <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                    className="pl-9"
                    placeholder="ค้นหาพนักงาน..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <DataTable columns={columns} data={filteredWorkers} emptyMessage="ไม่มีข้อมูลพนักงาน" />

            <Modal open={modal} onClose={() => setModal(false)} title={editId ? "แก้ไขพนักงาน" : "เพิ่มพนักงาน"}>
                <div className="space-y-4">
                    {error && (
                        <div className="p-2 text-sm text-red-600 bg-red-50 rounded-lg">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-4">
                        <FormField label="รหัสพนักงาน">
                            <Input
                                value={form.staff_id || ""}
                                onChange={(e) =>
                                    setForm(p => ({
                                        ...p,
                                        staff_id: e.target.value.replace(/[^A-Za-z0-9]/g, "")
                                    }))
                                }
                                placeholder="A1234"
                            />
                        </FormField>
                        <FormField label="ชื่อ">
                            <Input
                                value={form.name || ""}
                                onChange={(e) =>
                                    setForm(p => ({
                                        ...p,
                                        name: e.target.value.replace(/\s/g, "")
                                    }))
                                } placeholder="สมชาย" />
                        </FormField>
                        <FormField label="นามสกุล">
                            <Input
                                value={form.lastname || ""}
                                onChange={(e) =>
                                    setForm(p => ({
                                        ...p,
                                        lastname: e.target.value.replace(/\s/g, "")
                                    }))
                                } placeholder="กล้าหาญ" />
                        </FormField>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setModal(false)} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors">ยกเลิก</button>
                        <button onClick={handleSave} className="px-5 py-2 rounded-xl text-sm text-gray-800 transition-all hover:shadow-md" style={{ background: "#F5E87C" }}>
                            {editId ? "บันทึกการแก้ไข" : "เพิ่มพนักงาน"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}