import { useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronRight, Pencil, Trash2, Search, RotateCcw } from "lucide-react";
import PageHeader from "../components/shared/PageHeader";
import DataTable from "../components/shared/DataTable";
import Modal from "../components/shared/Modal";
import FormField, { Input, Select } from "../components/shared/FormField";
import StatusBadge from "../components/shared/StatusBadge";
import { getAllDevice, createDevice, updateDevice, deleteDevice, restoreDevice } from "../api/deviceApi";
import { getAllPart } from "../api/partApi";
import { getAllDevicePart, createdevices, deletedevices, updatedevices } from "../api/devicePartApi";
import { getAllCategories, createCategory, updateCategory } from "../api/categoryApi";

const empty = { device_name: "", device_brand: "", category_id: "", is_active: 1 };

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
  const [editPartId, setEditPartId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);

  const [categoryModal, setCategoryModal] = useState(false);
  const [categoryFormModal, setCategoryFormModal] = useState(false);
  const [categories, setCategories] = useState([]);

  const [categoryForm, setCategoryForm] = useState({ name: "" });
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [categoryError, setCategoryError] = useState("");

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

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Load categories error:", err);
    }
  };

  useEffect(() => {
    load();
    loadCategories();
  }, []);

  useEffect(() => {
    if (expandedId) {
    }
  }, [expandedId]);

  const openAdd = () => {
    setForm(empty);
    setEditId(null);
    setError("");
    setModal(true);
  };
  const openEdit = (row) => {
    setForm({ ...row });
    setEditId(row.device_id);
    setError("");
    setModal(true);
  };

  const handleSave = async () => {
    try {
      setError("");

      const name = form.device_name?.trim();
      const brand = form.device_brand?.trim();

      const regex = /^[A-Za-zก-๙0-9\s]+$/;

      if (!name) {
        setError("กรุณากรอกชื่ออุปกรณ์");
        return;
      }
      if (!regex.test(name)) {
        setError("ชื่ออุปกรณ์ห้ามมีอักขระพิเศษ");
        return;
      }
      if (!brand) {
        setError("กรุณากรอกแบรนด์อุปกรณ์");
        return;
      }
      if (!regex.test(brand)) {
        setError("ชื่อแบรนด์ห้ามมีอักขระพิเศษ");
        return;
      }
      if (!form.category_id) {
        setError("กรุณาเลือกประเภทอุปกรณ์");
        return;
      }

      const normalize = (str) =>
        str.toLowerCase().replace(/\s+/g, "");

      const duplicate = devices.find(
        d =>
          normalize(d.device_name) === normalize(name) &&
          normalize(d.device_brand) === normalize(brand) &&
          d.device_id !== editId
      );

      if (duplicate) {
        setError("มีอุปกรณ์ชื่อและแบรนด์นี้อยู่แล้ว");
        return;
      }
      if (editId) {
        await updateDevice(editId, {
          device_name: name,
          device_brand: brand,
          category_id: form.category_id
        });
      } else {
        await createDevice({
          device_name: name,
          device_brand: brand,
          category_id: form.category_id
        });
      }
      setModal(false);
      load();
    } catch (err) {
      console.error(err);

      const msg = err.message || "";

      if (
        msg.includes("UNIQUE") ||
        msg.includes("already exists")
      ) {
        setError("มีอุปกรณ์ชื่อและแบรนด์นี้อยู่แล้ว");
      } else {
        setError("เกิดข้อผิดพลาด");
      }
    }
  };

  const handleDelete = (row) => {
    setSelectedRow(row);
    setConfirmType("deleteDevice");
    setConfirmModal(true);
  };

  const handleRestore = (row) => {
    setSelectedRow(row);
    setConfirmType("restoreDevice");
    setConfirmModal(true);
  };

  const handleRowClick = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getPartsForDevice = (deviceId) => {
    return repairs.filter(p => p.device_id === deviceId);
  };

  const openAddPart = (e) => {
    e.stopPropagation();
    setAddPartForm({ part_id: "" });
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
      setError(err.message)
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

  const handleDeletePart = (devicePartId, partName) => {
    setSelectedPart({ devicePartId, partName });
    setConfirmType("deletePart");
    setConfirmModal(true);
  };

  const handleConfirm = async () => {
    try {
      if (confirmType === "deleteDevice") {
        await deleteDevice(selectedRow.device_id);
      }
      if (confirmType === "restoreDevice") {
        await restoreDevice(selectedRow.device_id);
      }
      if (confirmType === "deletePart") {
        await deletedevices(selectedPart.devicePartId);
      }
      setConfirmModal(false);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const openAddCategory = () => {
    setCategoryForm({ name: "" });
    setEditCategoryId(null);
    setCategoryError("");
    setCategoryFormModal(true);
  };

  const openEditCategory = (cat) => {
    setCategoryForm({ name: cat.category_name });
    setEditCategoryId(cat.category_id);
    setCategoryError("");
    setCategoryFormModal(true);
  };

  const saveCategory = async () => {

    const name = categoryForm.name.trim();

    if (!name) {
      setCategoryError("กรุณากรอกชื่อประเภท");
      return;
    }

    const regex = /^[A-Za-zก-๙0-9\s]+$/;

    if (!regex.test(name)) {
      setCategoryError("ชื่อประเภทห้ามมีอักขระพิเศษ");
      return;
    }

    try {

      if (editCategoryId) {
        await updateCategory(editCategoryId, {
          category_name: name
        });
      } else {
        await createCategory({
          category_name: name
        });
      }

      setCategoryFormModal(false);
      setCategoryError("");
      loadCategories();

    } catch (err) {

      const msg = err.message || "";

      if (msg.includes("UNIQUE") || msg.includes("already exists")) {
        setCategoryError("มีประเภทนี้อยู่แล้ว");
      } else {
        setCategoryError("เกิดข้อผิดพลาด");
      }

    }
  };

  const filteredDevices = devices.filter(d =>
    d.device_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.device_brand?.toLowerCase().includes(search.toLowerCase()) ||
    d.category_name?.toLowerCase().includes(search.toLowerCase())
  );

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
      key: "category_name",
      label: "ประเภท",
      render: v => <span className="text-gray-700">{v}</span>
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

        if (!row.is_active) {
          return (
            <div className="flex justify-center"
              onClick={e => e.stopPropagation()}>
              <button
                onClick={() => handleRestore(row)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 bg-green-100 rounded-lg hover:bg-green-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                กู้คืน
              </button>
            </div>
          );
        }

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
          <div className="flex gap-2">
            <button
              onClick={() => setCategoryModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-white text-gray-700 border hover:bg-gray-50"
            >
              ประเภท
            </button>

            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-800 shadow-sm hover:shadow-md transition-all"
              style={{ background: "#F5E87C" }}
            >
              <Plus className="w-4 h-4" /> เพิ่มอุปกรณ์
            </button>
          </div>
        }
      />

      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          className="pl-9"
          placeholder="ค้นหาอุปกรณ์..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredDevices}
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

                {Boolean(row.is_active) && (
                  <button
                    onClick={openAddPart}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-800 shadow-sm hover:shadow-md transition-all"
                    style={{ background: "#F5E87C" }}
                  >
                    <Plus className="w-3.5 h-3.5" /> เพิ่มอะไหล่
                  </button>
                )}
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
                          {p.type_id}
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
      <Modal
        open={confirmModal}
        onClose={() => setConfirmModal(false)}
        title="ยืนยันการทำรายการ"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {confirmType === "deleteDevice" &&
              `ต้องการลบ "${selectedRow?.device_name}" ใช่หรือไม่?`}
            {confirmType === "restoreDevice" &&
              `ต้องการกู้คืน "${selectedRow?.device_name}" ใช่หรือไม่?`}
            {confirmType === "deletePart" &&
              `ต้องการลบ "${selectedPart?.partName}" ออกจากอุปกรณ์นี้หรือไม่?`}
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

      <Modal
        open={categoryModal}
        onClose={() => setCategoryModal(false)}
        title="ประเภทอุปกรณ์"
      >
        <div className="space-y-4">

          <div className="flex justify-end">
            <button
              onClick={openAddCategory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-800 shadow-sm hover:shadow-md"
              style={{ background: "#F5E87C" }}
            >
              <Plus className="w-3.5 h-3.5" />
              เพิ่มประเภท
            </button>
          </div>

          {categories.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-4">
              ยังไม่มีรายการประเภทอุปกรณ์
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
                {categories.map(cat => (
                  <tr key={cat.category_id} className="border-t">
                    <td className="py-2 font-medium">{cat.category_name}</td>

                    <td className="py-2 text-right">
                      <button
                        onClick={() => openEditCategory(cat)}
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
        open={categoryFormModal}
        onClose={() => setCategoryFormModal(false)}
        title={editCategoryId ? "แก้ไขประเภท" : "เพิ่มประเภท"}
      >
        <div className="space-y-4">

          {categoryError && (
            <div className="p-2 text-sm text-red-600 bg-red-50 rounded-lg">
              {categoryError}
            </div>
          )}

          <FormField label="ชื่อประเภท" required>
            <Input
              value={categoryForm.name}
              onChange={(e) =>
                setCategoryForm({ name: e.target.value })
              }
              placeholder="เช่น Router"
            />
          </FormField>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setCategoryFormModal(false)}
              className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100"
            >
              ยกเลิก
            </button>

            <button
              onClick={saveCategory}
              className="px-5 py-2 rounded-xl text-sm text-gray-800 hover:shadow-md"
              style={{ background: "#F5E87C" }}
            >
              บันทึก
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? "แก้ไขอุปกรณ์" : "เพิ่มอุปกรณ์"}>
        <div className="space-y-4">
          {error && (
            <div className="p-2 text-sm text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="ชื่ออุปกรณ์" required>
              <Input
                value={form.device_name}
                onChange={(e) =>
                  setForm(p => ({
                    ...p,
                    device_name: e.target.value.trimStart()
                  }))
                }
                placeholder="เช่น เราเตอร์" />
            </FormField>
            <FormField label="แบรนด์" required>
              <Input
                value={form.device_brand}
                onChange={(e) =>
                  setForm(p => ({
                    ...p,
                    device_brand: e.target.value.trimStart()
                  }))
                }
                placeholder="เช่น Ruijie-Reyee" />
            </FormField>
            <FormField label="ประเภทอุปกรณ์" required>
              <Select
                value={form.category_id}
                onChange={f("category_id")}
              >
                <option value="">เลือกประเภท</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
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