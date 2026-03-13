import { useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../components/shared/PageHeader";
import DataTable from "../components/shared/DataTable";
import Modal from "../components/shared/Modal";
import FormField, { Input, Select, Textarea } from "../components/shared/FormField";
import StatusBadge from "../components/shared/StatusBadge";
import { getAllDevice, createDevice, updateDevice, deleteDevice } from "../api/deviceApi";
import { getAllPart } from "../api/partApi";
import { getAllDevicePart, createdevices, deletedevices, updatedevices } from "../api/devicePartApi";

const empty = {
  device_name: "",
  device_brand: "",
  device_category: "other",
  is_active: 1
};

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [parts, setParts] = useState([]);
  const [addPartModal, setAddPartModal] = useState(false);
  const [addPartForm, setAddPartForm] = useState({ part_id: "" });
  const [extraParts, setExtraParts] = useState({}); // deviceId -> [{part_name, part_type}]
  const [editPartId, setEditPartId] = useState(null);

  const load = async () => {
    try {
      const deviceData = await getAllDevice();
      const partData = await getAllPart();
      const devicePartData = await getAllDevicePart();

      setDevices(deviceData);
      setParts(partData);
      setRepairs(devicePartData);
    } catch (err) {
      console.error("Load devices error:", err);
    }
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (expandedId) {
    }
  }, [expandedId]);

  const openAdd = () => { setForm(empty); setEditId(null); setModal(true); };
  const openEdit = (row) => { setForm({ ...row }); setEditId(row.device_id); setModal(true); };

  const handleSave = async () => {
    try {
      if (editId) {
        await updateDevice(editId, {
          device_name: form.device_name,
          device_brand: form.device_brand,
          device_category: form.device_category
        });
      } else {
        await createDevice({
          device_name: form.device_name,
          device_brand: form.device_brand,
          device_category: form.device_category
        });
      }
      setModal(false);
      load();   // reload table
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (row) => {
    if (confirm(`ต้องการลบ "${row.device_name}" ใช่หรือไม่?`)) {
      try {
        await deleteDevice(row.device_id);
        load();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleRowClick = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getPartsForDevice = (deviceId) => {
    return repairs.filter(p => p.device_id === deviceId);
  };

  const openAddPart = (e) => {
    e.stopPropagation();
    setAddPartForm({ part_name: "", part_type: "other" });
    setAddPartModal(true);
  };

  const handleSaveAddPart = async () => {
    if (!addPartForm.part_id) return;
    try {
      if (editPartId) {
        await updatedevices(editPartId, {
          part_id: addPartForm.part_id
        });
      } else {
        await createdevices({
          device_id: expandedId,
          part_ids: [addPartForm.part_id]
        });
      }
      setAddPartModal(false);
      setEditPartId(null);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditPart = (devicePartId) => {
    const row = repairs.find(r => r.device_part_id === devicePartId);
    if (!row) return;
    setAddPartForm({
      part_id: row.part_id
    });
    setEditPartId(devicePartId);
    setAddPartModal(true);
  };

  const handleDeletePart = async (devicePartId, partName) => {
    if (!confirm(`ต้องการลบ "${partName}" ออกจากอุปกรณ์นี้หรือไม่?`)) return;
    try {
      await deletedevices(devicePartId);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const columns = [
    {
      key: "expand",
      label: "",
      width: "40px",
      render: (_, row) =>
        expandedId === row.device_id
          ? <ChevronDown className="w-4 h-4" />
          : <ChevronRight className="w-4 h-4" />
    },
    {
      key: "device_name",
      label: "ชื่ออุปกรณ์",
      render: v => <span className="font-medium text-gray-800">{v}</span>
    },
    { key: "device_brand", label: "แบรนด์" },
    {
      key: "device_category",
      label: "ประเภท",
      render: v => <StatusBadge value={v} />
    },

    {
      key: "is_active",
      label: "สถานะ",
      render: v => <StatusBadge value={v ? "active" : "inactive"} />
    },

    {
      key: "action",
      label: "",
      width: "120px",
      render: (_, row) => {

        if (!row.is_active) return null;

        return (
          <div
            className="flex justify-center gap-2"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => openEdit(row)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleDelete(row)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      }
    }
  ];

  const getAvailableParts = () => {
    const usedParts = getPartsForDevice(expandedId).map(p => p.part_id);
    return parts.filter(p =>
      p.is_active === 1 && !usedParts.includes(p.part_id)
    );
  };

  return (
    <div>
      <PageHeader
        title="อุปกรณ์"
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-800 shadow-sm hover:shadow-md transition-all"
            style={{ background: "#F5E87C" }}
          >
            <Plus className="w-4 h-4" /> เพิ่มอุปกรณ์
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={devices}
        rowKey="device_id"
        onRowClick={(row) => handleRowClick(row.device_id)}
        expandedRowId={expandedId}
        expandedRowRender={(row) => {
          const parts = getPartsForDevice(row.device_id);

          return (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 m-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  อะไหล่ที่ใช้ในอุปกรณ์
                </p>

                <button
                  onClick={openAddPart}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-800 shadow-sm hover:shadow-md transition-all"
                  style={{ background: "#F5E87C" }}
                >
                  <Plus className="w-3.5 h-3.5" /> เพิ่มอะไหล่
                </button>
              </div>
              {parts.length === 0 ? (
                <p className="text-sm text-gray-400 italic">
                  ยังไม่มีการบันทึกอะไหล่สำหรับอุปกรณ์นี้
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase">
                      <th className="text-left px-3 py-2">อะไหล่</th>
                      <th className="text-left px-3 py-2">ประเภท</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts.map(p => (
                      <tr key={p.device_part_id}>
                        <td className="py-2 px-3 font-medium">
                          {p.part_name}
                        </td>
                        <td className="py-2 px-3 text-gray-500">
                          {p.part_type}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPart(p.device_part_id);
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePart(p.device_part_id, p.part_name);
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        }}
      />

      <Modal open={addPartModal} onClose={() => setAddPartModal(false)} title="เพิ่มอะไหล่">
        <div className="space-y-4">
          <FormField label="อะไหล่" required>
            <Select
              value={addPartForm.part_id || ""}
              onChange={(e) =>
                setAddPartForm(p => ({ ...p, part_id: e.target.value }))
              }
            >
              <option value="">เลือกอะไหล่</option>
              {getAvailableParts().map(p => (
                <option key={p.part_id} value={p.part_id}>
                  {p.part_name}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setAddPartModal(false)} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors">ยกเลิก</button>
            <button onClick={handleSaveAddPart} className="px-5 py-2 rounded-xl text-sm text-gray-800 transition-all hover:shadow-md" style={{ background: "#F5E87C" }}>
              บันทึก
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? "Edit Device" : "Add Device"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="ชื่ออุปกรณ์" required>
              <Input value={form.device_name} onChange={f("device_name")} placeholder="เช่น เราเตอร์" />
            </FormField>
            <FormField label="แบรนด์">
              <Input value={form.device_brand} onChange={f("device_brand")} placeholder="เช่น Ruijie Reyee" />
            </FormField>
            <FormField label="ประเภทอุปกรณ์">
              <Select value={form.device_category} onChange={f("device_category")}>
                {["other"].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </Select>
            </FormField>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModal(false)} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors">ยกเลิก</button>
            <button onClick={handleSave} className="px-5 py-2 rounded-xl text-sm text-gray-800 transition-all hover:shadow-md" style={{ background: "#F5E87C" }}>
              {editId ? "บันทึกการแก้ไข" : "เพิ่มอุปกรณ์"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}