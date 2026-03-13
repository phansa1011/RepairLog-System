import { useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronRight, Search } from "lucide-react";
import PageHeader from "../components/shared/PageHeader";
import DataTable from "../components/shared/DataTable";
import Modal from "../components/shared/Modal";
import FormField, { Input, Select, Textarea, SearchSelect } from "../components/shared/FormField";
import ActionButtons from "../components/shared/ActionButtons";
import { getAllRepairs, getRepairsById, createRepairs, updateRepairs, deleteRepairs } from "../api/repairApi";
import { getAllDevice } from "../api/deviceApi";
import { getAllLocation } from "../api/locationApi";
import { getAllPart } from "../api/partApi";
import { getAllWorkers } from "../api/workerApi";
import { getAllDevicePart } from "../api/devicePartApi";

const empty = {
    device_id: "",
    location_id: "",
    part_id: "",
    worker_ids: [""],
    cause: "",
    repair_date: "",
    request_channel: "",
    note: ""
};

const requestChannels = [
    "โทรศัพท์",
    "LINE",
    "ศูนย์บริการ",
    "อื่นๆ"
];

export default function Repairs() {
    const [repairs, setRepairs] = useState([]);
    const [devices, setDevices] = useState([]);
    const [locations, setLocations] = useState([]);
    const [parts, setParts] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [deviceParts, setDeviceParts] = useState([]);

    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [openSelect, setOpenSelect] = useState(null);
    const [search, setSearch] = useState("");

    const load = async () => {
        try {
            const [
                repairsData,
                deviceData,
                locationData,
                partData,
                workerData,
                devicePartData
            ] = await Promise.all([
                getAllRepairs(),
                getAllDevice(),
                getAllLocation(),
                getAllPart(),
                getAllWorkers(),
                getAllDevicePart()
            ]);
            console.log("REPAIRS:", repairsData);

            setRepairs(repairsData);
            setDevices(deviceData);
            setLocations(locationData);
            setParts(partData);
            setWorkers(workerData);
            setDeviceParts(devicePartData);
        } catch (err) {
            console.error("Load repairs error:", err);
        }
    };
    useEffect(() => {
        load();
    }, []);

    const openAdd = () => { setForm(empty); setEditId(null); setModal(true); };
    const openEdit = (row) => {
        setForm({
            ...row,
            worker_ids: row.workers?.map(w => w.worker_id) || [""]
        });
        setEditId(row.repair_id);
        setModal(true);
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...form,
                worker_ids: form.worker_ids.filter(Boolean)
            };
            console.log("FORM:", form);
            console.log("PAYLOAD:", payload);

            if (editId) {
                await updateRepairs(editId, payload);
            } else {
                await createRepairs(payload);
            }
            await load();
            setModal(false);
        } catch (err) {
            console.error("Save repair error:", err);
        }
    };

    const handleDelete = async (row) => {
        if (!confirm("Delete repair record?")) return;
        try {
            await deleteRepairs(row.repair_id);
            await load(); // reload table
        } catch (err) {
            console.error("Delete repair error:", err);
        }
    };

    const availableParts = parts.filter(p => {
        if (!form.device_id) return false;

        const linked = deviceParts.some(
            dp =>
                dp.device_id === Number(form.device_id) &&
                dp.part_id === p.part_id
        );

        return linked && p.is_active === 1;
    });

    const addWorker = () => {
        setForm(p => ({
            ...p,
            worker_ids: [...p.worker_ids, ""]
        }));
    };

    const changeWorker = (index, value) => {
        const updated = [...form.worker_ids];
        updated[index] = Number(value);
        setForm(p => ({ ...p, worker_ids: updated }));
    };

    const removeWorker = (index) => {
        const updated = form.worker_ids.filter((_, i) => i !== index);
        setForm(p => ({ ...p, worker_ids: updated.length ? updated : [""] }));
    };

    const filteredRepairs = repairs.filter(r => {
        const location = locations.find(l => l.location_id === r.location_id)?.location_name || "";
        const device = devices.find(d => d.device_id === r.device_id)?.device_name || "";
        const part = parts.find(p => p.part_id === r.part_id)?.part_name || "";

        const keyword = search.toLowerCase();

        return (
            location.toLowerCase().includes(keyword) ||
            device.toLowerCase().includes(keyword) ||
            part.toLowerCase().includes(keyword)
        );
    });
    const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

    const handleRowClick = (repair_id) => setExpandedId(prev => prev === repair_id ? null : repair_id);

    const headers = ["วันที่สร้าง", "สถานที่", "อุปกรณ์", "อะไหล่", "วันที่ซ่อม", ""];

    const columns = [
        {
            key: "expand",
            label: "",
            width: "40px",
            render: (_, row) =>
                expandedId === row.repair_id
                    ? <ChevronDown className="w-4 h-4 text-gray-400" />
                    : <ChevronRight className="w-4 h-4 text-gray-400" />
        },
        {
            key: "create_at",
            label: "วันที่สร้าง"
        },
        {
            key: "location",
            label: "สถานที่",
            render: (_, row) =>
                locations.find(l => l.location_id === row.location_id)?.location_name || "—"
        },
        {
            key: "device",
            label: "อุปกรณ์",
            render: (_, row) =>
                devices.find(d => d.device_id === row.device_id)?.device_name || "—"
        },
        {
            key: "part",
            label: "อะไหล่",
            render: (_, row) =>
                parts.find(p => p.part_id === row.part_id)?.part_name || "—"
        },
        {
            key: "repair_date",
            label: "วันที่ซ่อม"
        },
        {
            key: "action",
            label: "",
            width: "120px",
            render: (_, row) => (
                <div onClick={e => e.stopPropagation()}>
                    <ActionButtons
                        onEdit={() => openEdit(row)}
                        onDelete={() => handleDelete(row)}
                    />
                </div>
            )
        }
    ];

    return (
        <div>
            <PageHeader
                title="รายการซ่อม"
                action={
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-800 shadow-sm hover:shadow-md transition-all"
                        style={{ background: "#F5E87C" }}
                    >
                        <Plus className="w-4 h-4" /> เพิ่มรายการซ่อม
                    </button>
                }
            />
            <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                    className="pl-9"
                    placeholder="ค้นหาการซ่อม..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <DataTable
                columns={columns}
                data={repairs}
                rowKey="repair_id"
                onRowClick={(row) => handleRowClick(row.repair_id)}
                expandedRowId={expandedId}
                expandedRowRender={(row) => (
                    <div className="my-3 bg-white border border-gray-100 rounded-xl shadow-sm p-5 grid grid-cols-2 gap-x-10 gap-y-3">

                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                รายละเอียดการซ่อม
                            </p>

                            <div className="space-y-2 text-sm">
                                <div className="flex gap-2">
                                    <span className="text-gray-400 w-36 shrink-0">พนักงาน</span>
                                    <span className="text-gray-800 font-medium">
                                        {
                                            row.workers && row.workers.length > 0
                                                ? row.workers.map((w, i) => {
                                                    const worker = workers.find(x => x.worker_id === w.worker_id);

                                                    if (!worker) return "—";
                                                    return (
                                                        <div key={i}>
                                                            {worker.name} {worker.lastname}
                                                            {i < row.workers.length - 1 && ","}
                                                        </div>
                                                    );
                                                })
                                                : "—"
                                        }
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-gray-400 w-36 shrink-0">ช่องทางแจ้ง</span>
                                    <span className="text-gray-700">{row.request_channel || "—"}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-400 mb-1">สาเหตุ</p>
                                    <p className="text-gray-700">{row.cause || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 mb-1">หมายเหตุ</p>
                                    <p className="text-gray-700">{row.note || "—"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            />

            <Modal open={modal} onClose={() => setModal(false)} title={editId ? "แก้ไขรายการซ่อม" : "เพิ่มรายการซ่อม"} width="max-w-2xl">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="สถานที่" required>
                            {locations.length > 0 ? (
                                <SearchSelect
                                    options={locations.filter(l => l.is_active === 1)}
                                    value={form.location_id}
                                    placeholder="ค้นหาสถานที่..."
                                    getLabel={(l) => l.location_name}
                                    getValue={(l) => l.location_id}
                                    onChange={(val) =>
                                        setForm(p => ({ ...p, location_id: val }))
                                    }
                                    open={openSelect === "location"}
                                    setOpen={(state) => setOpenSelect(state ? "location" : null)}
                                />
                            ) : (
                                <Input value={form.location_name} onChange={f("location_name")} placeholder="Location name" />
                            )}
                        </FormField>
                        <FormField label="อุปกรณ์" required>
                            {devices.length > 0 ? (
                                <SearchSelect
                                    options={devices.filter(l => l.is_active === 1)}
                                    value={form.device_id}
                                    placeholder="ค้นหาอุปกรณ์..."
                                    getLabel={(d) => d.device_name}
                                    getValue={(d) => d.device_id}
                                    onChange={(val) =>
                                        setForm(p => ({ ...p, device_id: val }))
                                    }
                                    open={openSelect === "device"}
                                    setOpen={(state) => setOpenSelect(state ? "device" : null)}
                                />
                            ) : (
                                <Input value={form.device_name} onChange={f("device_name")} placeholder="Device name" />
                            )}
                        </FormField>
                        <FormField label="อะไหล่">
                            <SearchSelect
                                options={availableParts}
                                value={form.part_id}
                                placeholder="ค้นหาอะไหล่..."
                                getLabel={(p) => p.part_name}
                                getValue={(p) => p.part_id}
                                onChange={(val) =>
                                    setForm(p => ({
                                        ...p,
                                        part_id: val
                                    }))
                                }
                                open={openSelect === "part"}
                                setOpen={(state) => setOpenSelect(state ? "part" : null)}
                            />
                        </FormField>
                        <FormField label="ช่องทางแจ้ง">
                            <Select
                                value={form.request_channel}
                                onChange={f("request_channel")}
                            >
                                <option value="">เลือกช่องทาง</option>

                                {requestChannels.map((ch, i) => (
                                    <option key={i} value={ch}>
                                        {ch}
                                    </option>
                                ))}
                            </Select>
                        </FormField>
                        <FormField label="วันที่ซ่อม">
                            <Input
                                type="date"
                                value={form.repair_date}
                                onChange={f("repair_date")}
                                max={new Date().toISOString().split("T")[0]}
                            />
                        </FormField>
                        <FormField label="พนักงาน">
                            {form.worker_ids.map((id, i) => {
                                const usedWorkers = form.worker_ids.filter((_, idx) => idx !== i);
                                const availableWorkers = workers.filter(
                                    w => w.is_active === 1 && !usedWorkers.includes(w.worker_id)
                                );

                                return (
                                    <div key={i} className="flex gap-2 mb-2">
                                        <SearchSelect
                                            options={availableWorkers}
                                            value={id}
                                            placeholder="ค้นหาพนักงาน..."
                                            getLabel={(w) => `${w.name} ${w.lastname}`}
                                            getValue={(w) => w.worker_id}
                                            onChange={(val) => changeWorker(i, val)}

                                            open={openSelect === `worker-${i}`}
                                            setOpen={(state) => setOpenSelect(state ? `worker-${i}` : null)}
                                        />
                                        {i > 0 && (
                                            <span
                                                onClick={() => removeWorker(i)}
                                                className="text-[15px] text-red-500 cursor-pointer hover:text-red-700"
                                            >
                                                ✕
                                            </span>
                                        )}
                                    </div>
                                );
                            })}

                            <span
                                onClick={addWorker}
                                className="text-sm text-blue-500 cursor-pointer hover:underline"
                            >
                                + เพิ่มพนักงาน
                            </span>
                        </FormField>
                    </div>
                    <FormField label="สาเหตุ">
                        <Textarea value={form.cause} onChange={f("cause")} placeholder="ระบุสาเหตุ..." rows={3} />
                    </FormField>
                    <FormField label="หมายเหตุ">
                        <Textarea value={form.note} onChange={f("note")} placeholder="หมายเหตุ" rows={3} />
                    </FormField>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setModal(false)} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors">ยกเลิก</button>
                        <button onClick={handleSave} className="px-5 py-2 rounded-xl text-sm text-gray-800 transition-all hover:shadow-md" style={{ background: "#F5E87C" }}>
                            {editId ? "บันทึกการแก้ไข" : "เพิ่มรายการซ่อม"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}