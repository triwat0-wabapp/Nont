import React, { useState, useMemo } from 'react';
import { RepairRecord, RepairItem, Vehicle, Department, SystemSettings } from '../types';
import { formatCurrency, formatNumber, formatThaiDate, getFiscalYear, thaiBahtText } from '../utils/thaiDate';
import { Wrench, Plus, Printer, Search, Trash2, Edit2, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface RepairManagementProps {
  repairs: RepairRecord[];
  vehicles: Vehicle[];
  settings: SystemSettings;
  onAddRepair: (repair: Omit<RepairRecord, 'id' | 'createdAt'>) => void;
  onUpdateRepair: (repair: RepairRecord) => void;
  onDeleteRepair: (id: string) => void;
  onOpenForm6: (repair: RepairRecord) => void;
  openCreateModalDirectly?: boolean;
  onCloseCreateModalDirectly?: () => void;
}

export const RepairManagement: React.FC<RepairManagementProps> = ({
  repairs,
  vehicles,
  settings,
  onAddRepair,
  onUpdateRepair,
  onDeleteRepair,
  onOpenForm6,
  openCreateModalDirectly = false,
  onCloseCreateModalDirectly,
}) => {
  // Available fiscal years
  const availableYears = useMemo(() => {
    const years = new Set<number>([2568, 2567]);
    repairs.forEach(r => years.add(r.fiscalYear));
    return Array.from(years).sort((a, b) => b - a);
  }, [repairs]);

  // Filters
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(availableYears[0] || 2568);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(openCreateModalDirectly);
  const [editingRepair, setEditingRepair] = useState<RepairRecord | null>(null);

  // Form State
  const [formState, setFormState] = useState<{
    formNumber: string;
    vehicleId: string;
    date: string;
    odometer: number;
    damageSymptoms: string;
    workshopName: string;
    requestedBy: string;
    technicianOpinion: string;
    status: 'ขออนุมัติ' | 'อนุมัติแล้ว' | 'กำลังดำเนินการ' | 'ซ่อมเสร็จสิ้น';
    items: Omit<RepairItem, 'id'>[];
  }>({
    formNumber: '',
    vehicleId: vehicles[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    odometer: 0,
    damageSymptoms: '',
    workshopName: '',
    requestedBy: '',
    technicianOpinion: 'ได้ตรวจสอบสภาพความชำรุดเสียหายแล้ว เห็นควรดำเนินการซ่อมแซมตามรายการที่เสนอ',
    status: 'ซ่อมเสร็จสิ้น',
    items: [
      { name: '', quantity: 1, unit: 'รายการ', unitPrice: 0, totalPrice: 0 }
    ],
  });

  React.useEffect(() => {
    if (openCreateModalDirectly) {
      handleOpenCreate();
    }
  }, [openCreateModalDirectly]);

  const handleOpenCreate = () => {
    setEditingRepair(null);
    const firstVeh = vehicles[0];
    const curYear = (new Date().getFullYear() + 543);
    const nextSeq = String(repairs.length + 1).padStart(3, '0');

    setFormState({
      formNumber: `บซ.${nextSeq}/${curYear}`,
      vehicleId: firstVeh?.id || '',
      date: new Date().toISOString().split('T')[0],
      odometer: firstVeh?.currentOdometer || 0,
      damageSymptoms: '',
      workshopName: 'อู่ช่างเล็กการช่าง อ.นาแก',
      requestedBy: firstVeh?.driverName || '',
      technicianOpinion: 'ได้ตรวจสอบสภาพความชำรุดเสียหายแล้ว เห็นควรดำเนินการซ่อมแซมตามรายการที่เสนอ',
      status: 'ซ่อมเสร็จสิ้น',
      items: [
        { name: 'เปลี่ยนถ่ายน้ำมันเครื่องกึ่งสังเคราะห์', quantity: 1, unit: 'แกลลอน', unitPrice: 1400, totalPrice: 1400 },
        { name: 'ไส้กรองน้ำมันเครื่อง', quantity: 1, unit: 'ลูก', unitPrice: 280, totalPrice: 280 },
        { name: 'ค่าแรงบริการ', quantity: 1, unit: 'งาน', unitPrice: 300, totalPrice: 300 },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record: RepairRecord) => {
    setEditingRepair(record);
    setFormState({
      formNumber: record.formNumber,
      vehicleId: record.vehicleId,
      date: record.date,
      odometer: record.odometer,
      damageSymptoms: record.damageSymptoms,
      workshopName: record.workshopName,
      requestedBy: record.requestedBy,
      technicianOpinion: record.technicianOpinion,
      status: record.status,
      items: record.items.map(it => ({
        name: it.name,
        quantity: it.quantity,
        unit: it.unit,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
      })),
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRepair(null);
    if (onCloseCreateModalDirectly) {
      onCloseCreateModalDirectly();
    }
  };

  // Add Item Row
  const handleAddItemRow = () => {
    setFormState(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, unit: 'ชิ้น', unitPrice: 0, totalPrice: 0 }]
    }));
  };

  // Remove Item Row
  const handleRemoveItemRow = (index: number) => {
    if (formState.items.length <= 1) {
      alert('ต้องมีรายการอะไหล่หรือค่าแรงอย่างน้อย 1 รายการ');
      return;
    }
    setFormState(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index)
    }));
  };

  // Update Item Row
  const handleItemChange = (index: number, field: string, value: any) => {
    setFormState(prev => {
      const nextItems = [...prev.items];
      const curItem = { ...nextItems[index], [field]: value };

      if (field === 'quantity' || field === 'unitPrice') {
        const qty = field === 'quantity' ? Number(value) : curItem.quantity;
        const price = field === 'unitPrice' ? Number(value) : curItem.unitPrice;
        curItem.totalPrice = Math.round(qty * price * 100) / 100;
      }

      nextItems[index] = curItem;
      return { ...prev, items: nextItems };
    });
  };

  // Total Cost of form items
  const formTotalCost = useMemo(() => {
    return formState.items.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  }, [formState.items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const veh = vehicles.find(v => v.id === formState.vehicleId);
    if (!veh) {
      alert('กรุณาเลือกยานพาหนะ');
      return;
    }

    if (formState.items.some(i => !i.name.trim())) {
      alert('กรุณากรอกชื่อรายการอะไหล่หรือค่าแรงให้ครบถ้วน');
      return;
    }

    const fiscalYear = getFiscalYear(formState.date);
    const finalItems: RepairItem[] = formState.items.map((it, idx) => ({
      id: `it-${Date.now()}-${idx}`,
      name: it.name,
      quantity: Number(it.quantity),
      unit: it.unit,
      unitPrice: Number(it.unitPrice),
      totalPrice: Number(it.totalPrice),
    }));

    if (editingRepair) {
      onUpdateRepair({
        ...editingRepair,
        formNumber: formState.formNumber,
        vehicleId: veh.id,
        vehiclePlate: veh.plateNumber,
        vehicleName: veh.name,
        department: veh.department,
        date: formState.date,
        fiscalYear,
        odometer: Number(formState.odometer),
        damageSymptoms: formState.damageSymptoms,
        workshopName: formState.workshopName,
        items: finalItems,
        totalCost: formTotalCost,
        status: formState.status,
        requestedBy: formState.requestedBy,
        technicianOpinion: formState.technicianOpinion,
        procurementOfficer: settings.procurementHead,
        approver: settings.mayorName,
      });
    } else {
      onAddRepair({
        formNumber: formState.formNumber,
        vehicleId: veh.id,
        vehiclePlate: veh.plateNumber,
        vehicleName: veh.name,
        department: veh.department,
        date: formState.date,
        fiscalYear,
        odometer: Number(formState.odometer),
        damageSymptoms: formState.damageSymptoms,
        workshopName: formState.workshopName,
        items: finalItems,
        totalCost: formTotalCost,
        status: formState.status,
        requestedBy: formState.requestedBy,
        technicianOpinion: formState.technicianOpinion,
        procurementOfficer: settings.procurementHead,
        approver: settings.mayorName,
      });
    }

    handleCloseModal();
  };

  // Filtered repairs
  const filteredRepairs = useMemo(() => {
    return repairs.filter(r => {
      const matchYear = r.fiscalYear === selectedFiscalYear;
      const matchDept = selectedDepartment === 'all' || r.department === selectedDepartment;
      const matchVeh = selectedVehicleId === 'all' || r.vehicleId === selectedVehicleId;

      const matchSearch =
        r.formNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.damageSymptoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.workshopName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchYear && matchDept && matchVeh && matchSearch;
    });
  }, [repairs, selectedFiscalYear, selectedDepartment, selectedVehicleId, searchQuery]);

  const totalFilteredCost = filteredRepairs.reduce((acc, curr) => acc + curr.totalCost, 0);

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            บันทึกประวัติการซ่อมบำรุงและเอกสาร "แบบ 6"
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            แยกทุกรายการอะไหล่และราคา จัดทำแบบ 6 ตามระเบียบพัสดุราชการ อปท. พิมพ์ได้ทันที
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ บันทึกขอซ่อม / ออกแบบ 6 ใหม่</span>
        </button>
      </div>

      {/* KPI Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            จำนวนครั้งที่ขอซ่อม (ปีงบ {selectedFiscalYear})
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {formatNumber(filteredRepairs.length)} <span className="text-sm font-normal text-slate-500">ครั้ง</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            ยอดรวมค่าซ่อมแซมทั้งสิ้น
          </span>
          <div className="text-2xl font-bold text-blue-900 mt-1 tabular-nums">
            ฿{formatCurrency(totalFilteredCost)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            ค่าซ่อมเฉลี่ยต่อครั้ง
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            ฿{formatCurrency(filteredRepairs.length > 0 ? totalFilteredCost / filteredRepairs.length : 0)}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่แบบ 6, ทะเบียนรถ, อาการเสีย, อู่ซ่อม..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Year */}
          <select
            value={selectedFiscalYear}
            onChange={(e) => setSelectedFiscalYear(Number(e.target.value))}
            className="text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>ปีงบ {y}</option>
            ))}
          </select>

          {/* Department */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="all">ทุกกอง / ทุกสังกัด</option>
            <option value="สำนักปลัด">สำนักปลัด</option>
            <option value="กองช่าง">กองช่าง</option>
            <option value="กองสาธารณสุขและสิ่งแวดล้อม">กองสาธารณสุขและสิ่งแวดล้อม</option>
            <option value="งานป้องกันและบรรเทาสาธารณภัย">งานป้องกันและบรรเทาสาธารณภัย</option>
            <option value="กองการศึกษา">กองการศึกษา</option>
            <option value="กองคลัง">กองคลัง</option>
          </select>

          {/* Vehicle */}
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white text-slate-700 max-w-[200px]"
          >
            <option value="all">ทุกยานพาหนะ</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.name} ({v.plateNumber !== '-' ? v.plateNumber : v.assetCode})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Repairs List Cards */}
      <div className="space-y-4">
        {filteredRepairs.map((rep) => {
          return (
            <div
              key={rep.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-blue-400 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left Section: Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                      แบบ 6 เลขที่ {rep.formNumber}
                    </span>
                    <span className="text-xs text-slate-500">
                      วันที่: {formatThaiDate(rep.date)} (ปีงบ {rep.fiscalYear})
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-medium text-slate-700">
                      {rep.department}
                    </span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        rep.status === 'ซ่อมเสร็จสิ้น'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {rep.vehicleName}
                    </h3>
                    <span className="text-xs font-mono text-slate-500">
                      ({rep.vehiclePlate !== '-' ? rep.vehiclePlate : 'เครื่องมือ'})
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <strong>อาการชำรุด:</strong> {rep.damageSymptoms}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span>อู่/ร้านค้า: <strong className="text-slate-800">{rep.workshopName}</strong></span>
                    <span>ผู้ขอซ่อม: <strong className="text-slate-800">{rep.requestedBy}</strong></span>
                    {rep.odometer > 0 && (
                      <span>เลขไมล์: <strong className="font-mono text-slate-800">{formatNumber(rep.odometer)}</strong></span>
                    )}
                  </div>

                  {/* Itemized preview */}
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-semibold text-slate-500 mb-1">
                      รายการอะไหล่และค่าแรง ({rep.items.length} รายการ):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {rep.items.map(it => (
                        <span key={it.id} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {it.name} ({it.quantity} {it.unit} · ฿{formatCurrency(it.totalPrice)})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Section: Total & Print Button */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">ยอดรวมทั้งสิ้น</span>
                    <span className="text-xl font-bold text-blue-900 tabular-nums">
                      ฿{formatCurrency(rep.totalCost)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenForm6(rep)}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>พิมพ์ "แบบ 6"</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(rep)}
                      className="p-2 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="แก้ไขข้อมูล"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`ยืนยันการลบประวัติซ่อม ${rep.formNumber}?`)) {
                          onDeleteRepair(rep.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredRepairs.length === 0 && (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700 mb-1">ไม่พบประวัติการซ่อมบำรุง</h3>
            <p className="text-xs text-slate-400 mb-4">ยังไม่มีรายการขอซ่อมหรือไม่มีข้อมูลตามตัวกรองที่เลือก</p>
            <button
              onClick={handleOpenCreate}
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              + บันทึกขอซ่อมรายการใหม่
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Repair Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingRepair ? 'แก้ไขประวัติการซ่อม / เอกสารแบบ 6' : 'บันทึกประวัติการซ่อมแซมและพิมพ์แบบ 6'}
                </h3>
                <p className="text-xs text-slate-500">
                  เทศบาลตำบลพระซอง อำเภอนาแก จังหวัดนครพนม
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Form number & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เลขที่เอกสารแบบ 6 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น บซ.008/2568"
                    value={formState.formNumber}
                    onChange={(e) => setFormState(prev => ({ ...prev, formNumber: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันที่ขออนุมัติ / ส่งซ่อม *
                  </label>
                  <input
                    type="date"
                    required
                    value={formState.date}
                    onChange={(e) => setFormState(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สถานะการซ่อม
                  </label>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="ขออนุมัติ">ขออนุมัติ</option>
                    <option value="อนุมัติแล้ว">อนุมัติแล้ว</option>
                    <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                    <option value="ซ่อมเสร็จสิ้น">ซ่อมเสร็จสิ้น</option>
                  </select>
                </div>
              </div>

              {/* Vehicle & Odometer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เลือกยานพาหนะ / เครื่องจักร *
                  </label>
                  <select
                    required
                    value={formState.vehicleId}
                    onChange={(e) => {
                      const veh = vehicles.find(v => v.id === e.target.value);
                      setFormState(prev => ({
                        ...prev,
                        vehicleId: e.target.value,
                        odometer: veh?.currentOdometer || prev.odometer,
                        requestedBy: veh?.driverName || prev.requestedBy,
                      }));
                    }}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- กรุณาเลือก --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.plateNumber !== '-' ? v.plateNumber : v.assetCode}) - {v.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เลขไมล์ / ชม. ขณะขอซ่อม
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formState.odometer}
                    onChange={(e) => setFormState(prev => ({ ...prev, odometer: Number(e.target.value) }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none tabular-nums"
                  />
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อาการชำรุดและความจำเป็นในการซ่อม *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="เช่น เบรกมีเสียงดังผิดปกติและจมลึก, เปลี่ยนถ่ายน้ำมันเครื่องตามระยะ 40,000 กม."
                  value={formState.damageSymptoms}
                  onChange={(e) => setFormState(prev => ({ ...prev, damageSymptoms: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Workshop & Requester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    อู่ / ร้านค้า / ผู้รับจ้างที่เสนอราคา
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น อู่ช่างเล็กการช่าง อ.นาแก"
                    value={formState.workshopName}
                    onChange={(e) => setFormState(prev => ({ ...prev, workshopName: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ผู้ขอรับการซ่อม (พนักงานขับรถ)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น นายศักดา ประชากุล"
                    value={formState.requestedBy}
                    onChange={(e) => setFormState(prev => ({ ...prev, requestedBy: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Itemized Table Breakdown */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      ตารางรายการอะไหล่และค่าแรง (แบบ 6)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      แยกรายการอะไหล่และราคาตามที่ระบุในใบเสนอราคา
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 rounded-md shadow-2xs transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> เพิ่มแถวรายการ
                  </button>
                </div>

                <div className="space-y-2">
                  {formState.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-lg">
                      <span className="text-xs font-bold text-slate-400 w-5 text-center">
                        {idx + 1}
                      </span>

                      {/* Name */}
                      <input
                        type="text"
                        required
                        placeholder="รายการ เช่น ผ้าดิสเบรกหน้า, ค่าแรง"
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        className="flex-1 text-xs p-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                      />

                      {/* Qty */}
                      <input
                        type="number"
                        min="1"
                        placeholder="จำนวน"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-16 text-xs p-1.5 border border-slate-300 rounded text-center focus:ring-1 focus:ring-blue-500 outline-none tabular-nums"
                      />

                      {/* Unit */}
                      <input
                        type="text"
                        placeholder="หน่วย"
                        value={item.unit}
                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                        className="w-20 text-xs p-1.5 border border-slate-300 rounded text-center focus:ring-1 focus:ring-blue-500 outline-none"
                      />

                      {/* Unit Price */}
                      <div className="relative w-28">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="ราคา/หน่วย"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full text-xs p-1.5 pr-2 border border-slate-300 rounded text-right focus:ring-1 focus:ring-blue-500 outline-none tabular-nums"
                        />
                      </div>

                      {/* Total Price */}
                      <div className="w-28 text-right font-bold text-xs text-slate-900 tabular-nums pr-1">
                        ฿{formatCurrency(item.totalPrice)}
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="ลบแถว"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Total Summary */}
                <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="text-slate-600 font-sarabun text-sm">
                    ตัวอักษร: <strong className="text-slate-900">{thaiBahtText(formTotalCost)}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 mr-2">รวมเป็นเงินทั้งสิ้น:</span>
                    <strong className="text-base text-blue-900 tabular-nums">
                      ฿{formatCurrency(formTotalCost)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Technician opinion */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ความเห็นของช่างตรวจสภาพ
                </label>
                <input
                  type="text"
                  value={formState.technicianOpinion}
                  onChange={(e) => setFormState(prev => ({ ...prev, technicianOpinion: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
                >
                  {editingRepair ? 'บันทึกการแก้ไข' : 'บันทึกแบบ 6'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
