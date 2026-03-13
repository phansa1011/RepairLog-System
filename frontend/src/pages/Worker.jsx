import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
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
    deleteWorker
} from "../api/workerApi";

const empty = { staff_id: "", name: "", lastname: "", is_active: 1 };

export default function Workers() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);

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

    const openAdd = () => { setForm(empty); setEditId(null); setModal(true); };
    const openEdit = (row) => { setForm({ ...row }); setEditId(row.worker_id); setModal(true); };

    const handleSave = async () => {
        try {
            if (editId) {
                await updateWorker(editId, form);
            } else {
                await createWorker(form);
            }

            await fetchWorkers();
            setModal(false);
        } catch (err) {
            console.error(err);
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
                ) : null
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
            <DataTable columns={columns} data={workers} emptyMessage="ไม่มีข้อมูลพนักงาน" />

            <Modal open={modal} onClose={() => setModal(false)} title={editId ? "แก้ไขพนักงาน" : "เพิ่มพนักงาน"}>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <FormField label="รหัสพนักงาน">
                            <Input value={form.staff_id || ""} onChange={f("staff_id")} placeholder="A1234" />
                        </FormField>
                        <FormField label="ชื่อ">
                            <Input value={form.name || ""} onChange={f("name")} placeholder="สมชาย" />
                        </FormField>
                        <FormField label="นามสกุล">
                            <Input value={form.lastname || ""} onChange={f("lastname")} placeholder="กล้าหาญ" />
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