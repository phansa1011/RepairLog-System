import { useState, useEffect } from "react";
import { Plus, Pencil, Search, RotateCcw } from "lucide-react";
import PageHeader from "../components/shared/PageHeader";
import DataTable from "../components/shared/DataTable";
import Modal from "../components/shared/Modal";
import FormField, { Input, Select } from "../components/shared/FormField";
import ActionButtons from "../components/shared/ActionButtons";
import StatusBadge from "../components/shared/StatusBadge";
import { getAllPart, createPart, updatePart, deletePart, restorePart } from "../api/partApi";
import { getAllTypes, createType, updateType } from "../api/typeApi";

const empty = { part_name: "", type_id: "", is_active: 1 };

export default function Parts() {
    const [parts, setParts] = useState([]);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    const [confirmModal, setConfirmModal] = useState(false);
    const [confirmType, setConfirmType] = useState("");
    const [selectedPart, setSelectedPart] = useState(null);

    const [typeModal, setTypeModal] = useState(false);
    const [typeFormModal, setTypeFormModal] = useState(false);
    const [types, setTypes] = useState([]);
    const [typeForm, setTypeForm] = useState({ name: "" });
    const [editTypeId, setEditTypeId] = useState(null);
    const [typeError, setTypeError] = useState("");

    const load = async () => {
        try {
            const data = await getAllPart();
            setParts(data);
        } catch (err) {
            console.error("Load parts error:", err);
        }
    };
    const loadTypes = async () => {
        try {
            const data = await getAllTypes();
            setTypes(data);
        } catch (err) {
            console.error("Load types error:", err);
        }
    };

    useEffect(() => {
        load();
        loadTypes();
    }, []);

    const openAdd = () => {
        setForm(empty);
        setEditId(null);
        setError("");
        setModal(true);
    };

    const openEdit = (row) => {
        setForm({ ...row });
        setEditId(row.part_id);
        setError("");
        setModal(true);
    };

    const handleSave = async () => {
        try {
            setError("");
            const name = form.part_name?.trim();
            const type = form.type_id;
            const regex = /^[A-Za-zก-๙0-9\s\-_.\/()+&]+$/;
            if (!name) {
                setError("กรุณากรอกชื่ออะไหล่");
                return;
            }
            if (!regex.test(name)) {
                setError("ชื่ออะไหล่ห้ามมีอักขระพิเศษ");
                return;
            }
            if (!type) {
                setError("กรุณากรอกประเภทอะไหล่");
                return;
            }

            const normalize = (str) =>
                str.toLowerCase().replace(/\s+/g, "");

            const duplicate = parts.find(
                p =>
                    normalize(p.part_name) === normalize(name) &&
                    p.part_id !== editId
            );

            if (duplicate) {
                setError("มีอะไหล่นี้อยู่แล้ว");
                return;
            }

            if (editId) {
                await updatePart(editId, {
                    part_name: name,
                    type_id: type
                });
            } else {
                await createPart({
                    part_name: name,
                    type_id: type
                });
            }
            setModal(false);
            load();
        } catch (err) {
            console.error(err);
            setError(err.message || "เกิดข้อผิดพลาด");
        }
    };

    const handleDelete = (row) => {
        setSelectedPart(row);
        setConfirmType("delete");
        setConfirmModal(true);
    };

    const handleRestore = (row) => {
        setSelectedPart(row);
        setConfirmType("restore");
        setConfirmModal(true);
    };

    const handleConfirm = async () => {
        try {
            if (confirmType === "delete") {
                await deletePart(selectedPart.part_id);
            }
            if (confirmType === "restore") {
                await restorePart(selectedPart.part_id);
            }
            load();
            setConfirmModal(false);
        } catch (err) {
            console.error(err);
            setError(err.message || "เกิดข้อผิดพลาด");
        }
    };

    const openAddType = () => {
        setTypeForm({ name: "" });
        setEditTypeId(null);
        setTypeError("");
        setTypeFormModal(true);
    };

    const openEditType = (type) => {
        setTypeForm({ name: type.name });
        setEditTypeId(type.type_id);
        setTypeError("");
        setTypeFormModal(true);
    };

    const saveType = async () => {

        const name = typeForm.name.trim();

        if (!name) {
            setTypeError("กรุณากรอกชื่อประเภท");
            return;
        }

        const regex = /^[A-Za-zก-๙0-9\s]+$/;

        if (!regex.test(name)) {
            setTypeError("ชื่อประเภทห้ามมีอักขระพิเศษ");
            return;
        }

        try {

            if (editTypeId) {
                await updateType(editTypeId, {
                    type_name: name
                });
            } else {
                await createType({
                    type_name: name
                });
            }

            setTypeFormModal(false);
            setTypeError("");
            loadTypes();

        } catch (err) {

            const msg = err.message || "";

            if (msg.includes("UNIQUE") || msg.includes("already exists")) {
                setTypeError("มีประเภทนี้อยู่แล้ว");
            } else {
                setTypeError("เกิดข้อผิดพลาด");
            }

        }
    };

    const filteredParts = parts.filter(p =>
        p.part_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.type_name?.toLowerCase().includes(search.toLowerCase())
    );

    const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

    const columns = [
        { key: "part_name", label: "ชื่ออะไหล่", render: v => <span className="font-medium text-gray-800">{v}</span> },
        { key: "type_name", label: "ประเภทอะไหล่" },
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
                title="อะไหล่"
                action={
                    <div className="flex gap-2">

                        <button
                            onClick={() => setTypeModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-white text-gray-700 border hover:bg-gray-50"
                        >
                            ประเภท
                        </button>

                        <button
                            onClick={openAdd}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-800 shadow-sm hover:shadow-md transition-all"
                            style={{ background: "#F5E87C" }}
                        >
                            <Plus className="w-4 h-4" /> เพิ่มอะไหล่
                        </button>
                    </div>
                }
            />
            <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                    className="pl-9"
                    placeholder="ค้นหาอะไหล่..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <DataTable columns={columns} data={filteredParts} emptyMessage="ไม่พบข้อมูลอะไหล่" />

            <Modal
                open={typeModal}
                onClose={() => setTypeModal(false)}
                title="ประเภทอะไหล่"
            >
                <div className="space-y-4">

                    <div className="flex justify-end">
                        <button
                            onClick={openAddType}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-800 shadow-sm hover:shadow-md"
                            style={{ background: "#F5E87C" }}
                        >
                            <Plus className="w-3.5 h-3.5" />
                            เพิ่มประเภท
                        </button>
                    </div>

                    {types.length === 0 ? (
                        <p className="text-sm text-gray-400 italic text-center py-4">
                            ยังไม่มีรายการประเภทอะไหล่
                        </p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-gray-400 uppercase">
                                    <th className="text-left py-2">ชื่อประเภท</th>
                                    <th className="text-right py-2"></th>
                                </tr>
                            </thead>

                            <tbody>
                                {types.map(type => (
                                    <tr key={type.type_id} className="border-t">

                                        <td className="py-2 font-medium">
                                            {type.type_name}
                                        </td>

                                        <td className="py-2 text-right">
                                            <button
                                                onClick={() => openEditType(type)}
                                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Modal>

            <Modal
                open={typeFormModal}
                onClose={() => setTypeFormModal(false)}
                title={editTypeId ? "แก้ไขประเภท" : "เพิ่มประเภท"}
            >
                <div className="space-y-4">

                    {typeError && (
                        <div className="p-2 text-sm text-red-600 bg-red-50 rounded-lg">
                            {typeError}
                        </div>
                    )}

                    <FormField label="ชื่อประเภท" required>
                        <Input
                            value={typeForm.name}
                            onChange={(e) =>
                                setTypeForm({ name: e.target.value })
                            }
                            placeholder="เช่น สายไฟ"
                        />
                    </FormField>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setTypeFormModal(false)}
                            className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100"
                        >
                            ยกเลิก
                        </button>

                        <button
                            onClick={saveType}
                            className="px-5 py-2 rounded-xl text-sm text-gray-800 hover:shadow-md"
                            style={{ background: "#F5E87C" }}
                        >
                            บันทึก
                        </button>
                    </div>

                </div>
            </Modal>

            <Modal open={modal} onClose={() => setModal(false)} title={editId ? "แก้ไขอะไหล่" : "เพิ่มอะไหล่"}>
                <div className="space-y-4">
                    {error && (
                        <div className="p-2 text-sm text-red-600 bg-red-50 rounded-lg">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="ชื่ออะไหล่" required>
                            <Input
                                value={form.part_name}
                                onChange={(e) =>
                                    setForm(p => ({
                                        ...p,
                                        part_name: e.target.value.trimStart()
                                    }))
                                }
                                placeholder="เช่น สายไฟ" />
                        </FormField>
                        <FormField label="ประเภทอะไหร่" required>
                            <Select
                                value={form.type_id}
                                onChange={f("type_id")}
                            >
                                <option value="">เลือกประเภท</option>
                                {types.map(type => (
                                    <option key={type.type_id} value={type.type_id}>
                                        {type.type_name}
                                    </option>
                                ))}
                            </Select>
                        </FormField>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setModal(false)} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors">ยกเลิก</button>
                        <button onClick={handleSave} className="px-5 py-2 rounded-xl text-sm text-gray-800 transition-all hover:shadow-md" style={{ background: "#F5E87C" }}>
                            {editId ? "บันทึกการแก้ไข" : "เพิ่มอะไหล่"}
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
                            `ต้องการลบ "${selectedPart?.part_name}" ใช่หรือไม่?`
                        }
                        {confirmType === "restore" &&
                            `ต้องการกู้คืน "${selectedPart?.part_name}" ใช่หรือไม่?`
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
                            className={`px-4 py-2 rounded-xl text-sm text-white ${confirmType === "delete"
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-green-500 hover:bg-green-600"
                                }`}
                        >
                            ยืนยัน
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}