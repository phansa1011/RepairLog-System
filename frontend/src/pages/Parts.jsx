import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import PageHeader from "../components/shared/PageHeader";
import DataTable from "../components/shared/DataTable";
import Modal from "../components/shared/Modal";
import FormField, { Input, Select, Textarea } from "../components/shared/FormField";
import ActionButtons from "../components/shared/ActionButtons";
import StatusBadge from "../components/shared/StatusBadge";
import {
    getAllPart,
    createPart,
    updatePart,
    deletePart
} from "../api/partApi";

const empty = { part_name: "", part_type: "", is_active: 1 };

export default function Parts() {
    const [parts, setParts] = useState([]);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);

    const load = async () => {
        try {
            const data = await getAllPart();
            setParts(data);
        } catch (err) {
            console.error("Load parts error:", err);
        }
    };
    useEffect(load, []);

    const openAdd = () => { setForm(empty); setEditId(null); setModal(true); };
    const openEdit = (row) => { setForm({ ...row }); setEditId(row.part_id); setModal(true); };

    const handleSave = async () => {
        try {

            if (editId) {
                await updatePart(editId, {
                    part_name: form.part_name,
                    part_type: form.part_type
                });

            } else {
                await createPart({
                    part_name: form.part_name,
                    part_type: form.part_type
                });
            }

            setModal(false);
            load(); // reload table

        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (row) => {
        if (confirm(`Delete part "${row.part_name}"?`)) {
            try {
                await deletePart(row.part_id);
                load();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

    const columns = [
        { key: "part_name", label: "Part Name", render: v => <span className="font-medium text-gray-800">{v}</span> },
        { key: "part_type", label: "Part Type" },
        { key: "is_active", label: "Status", render: v => <StatusBadge value={v === 1 ? "active" : "inactive"} /> },
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
        <div>
            <PageHeader
                title="Parts"
                subtitle="Manage parts and inventory for repairs"
                action={
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-800 shadow-sm hover:shadow-md transition-all"
                        style={{ background: "#F5E87C" }}
                    >
                        <Plus className="w-4 h-4" /> Add Part
                    </button>
                }
            />
            <DataTable columns={columns} data={parts} emptyMessage="No parts found" />

            <Modal open={modal} onClose={() => setModal(false)} title={editId ? "Edit Part" : "Add Part"}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="part_Name" required>
                            <Input value={form.part_name} onChange={f("part_name")} placeholder="Battery 3600mAh" />
                        </FormField>
                        <FormField label="part_type">
                            <Input value={form.part_type} onChange={f("part_type")} placeholder="Battery, Screen, Cable..." />
                        </FormField>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setModal(false)} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
                        <button onClick={handleSave} className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-800 transition-all hover:shadow-md" style={{ background: "#F5E87C" }}>
                            {editId ? "Save Changes" : "Add Part"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}