import React, { useState, useMemo, useRef } from 'react';
import { Vehicle, VehicleCategory, Department, FuelType, VehicleStatus, OdometerUnit, FileAttachment } from '../types';
import { Truck, Search, Plus, Filter, FileText, Download, Eye, Edit2, Trash2, X, Check, Paperclip, AlertTriangle } from 'lucide-react';
import { formatNumber } from '../utils/thaiDate';

interface VehicleRegistryProps {
  vehicles: Vehicle[];
  onAddVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
  openCreateModalDirectly?: boolean;
  onCloseCreateModalDirectly?: () => void;
}

export const VehicleRegistry: React.FC<VehicleRegistryProps> = ({
  vehicles,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onSelectVehicle,
  openCreateModalDirectly = false,
  onCloseCreateModalDirectly,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory | 'all'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(openCreateModalDirectly);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState<{ name: string; url: string; type: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    name: string;
    plateNumber: string;
    assetCode: string;
    category: VehicleCategory;
    brandModel: string;
    chassisNumber: string;
    engineNumber: string;
    department: Department;
    fuelType: FuelType;
    driverName: string;
    purchaseYear: number;
    purchaseDate: string;
    status: VehicleStatus;
    currentOdometer: number;
    odometerUnit: OdometerUnit;
    notes: string;
    registrationFile?: FileAttachment;
  }>({
    name: '',
    plateNumber: '',
    assetCode: '',
    category: 'car',
    brandModel: '',
    chassisNumber: '',
    engineNumber: '',
    department: 'สำนักปลัด',
    fuelType: 'ดีเซล',
    driverName: '',
    purchaseYear: 2568,
    purchaseDate: new Date().toISOString().split('T')[0],
    status: 'พร้อมใช้งาน',
    currentOdometer: 0,
    odometerUnit: 'กม.',
    notes: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (openCreateModalDirectly) {
      handleOpenCreate();
    }
  }, [openCreateModalDirectly]);

  const handleOpenCreate = () => {
    setEditingVehicle(null);
    setFormData({
      name: '',
      plateNumber: '',
      assetCode: '',
      category: 'car',
      brandModel: '',
      chassisNumber: '',
      engineNumber: '',
      department: 'สำนักปลัด',
      fuelType: 'ดีเซล',
      driverName: '',
      purchaseYear: 2568,
      purchaseDate: new Date().toISOString().split('T')[0],
      status: 'พร้อมใช้งาน',
      currentOdometer: 0,
      odometerUnit: 'กม.',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingVehicle(v);
    setFormData({
      name: v.name,
      plateNumber: v.plateNumber,
      assetCode: v.assetCode,
      category: v.category,
      brandModel: v.brandModel,
      chassisNumber: v.chassisNumber,
      engineNumber: v.engineNumber,
      department: v.department,
      fuelType: v.fuelType,
      driverName: v.driverName,
      purchaseYear: v.purchaseYear,
      purchaseDate: v.purchaseDate,
      status: v.status,
      currentOdometer: v.currentOdometer,
      odometerUnit: v.odometerUnit,
      notes: v.notes || '',
      registrationFile: v.registrationFile,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
    if (onCloseCreateModalDirectly) {
      onCloseCreateModalDirectly();
    }
  };

  // Handle PDF / file upload (converts to base64 Data URL for offline storage)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('ไฟล์มีขนาดเกิน 10MB กรุณาเลือกไฟล์ขนาดเล็กกว่านี้');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData(prev => ({
        ...prev,
        registrationFile: {
          name: file.name,
          type: file.type || 'application/pdf',
          size: file.size,
          dataUrl: result,
          uploadedAt: new Date().toISOString(),
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, registrationFile: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('กรุณากรอกชื่อเรียกยานพาหนะ/เครื่องมือ');
      return;
    }

    if (editingVehicle) {
      onUpdateVehicle({
        ...editingVehicle,
        ...formData,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onAddVehicle(formData);
    }
    handleCloseModal();
  };

  // Filtered list
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.brandModel.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === 'all' || v.category === selectedCategory;
      const matchDept = selectedDepartment === 'all' || v.department === selectedDepartment;
      const matchStatus = selectedStatus === 'all' || v.status === selectedStatus;

      return matchSearch && matchCategory && matchDept && matchStatus;
    });
  }, [vehicles, searchQuery, selectedCategory, selectedDepartment, selectedStatus]);

  const categories: { id: VehicleCategory | 'all'; label: string; count: number }[] = [
    { id: 'all', label: 'ทั้งหมด', count: vehicles.length },
    { id: 'car', label: 'รถยนต์ส่วนกลาง', count: vehicles.filter(v => v.category === 'car').length },
    { id: 'special_truck', label: 'รถเฉพาะกิจ (น้ำ/ขยะ/ดับเพลิง/กระเช้า)', count: vehicles.filter(v => v.category === 'special_truck').length },
    { id: 'machinery', label: 'เครื่องจักรกลหนัก (แทรกเตอร์)', count: vehicles.filter(v => v.category === 'machinery').length },
    { id: 'equipment', label: 'เครื่องมือ (ตัดหญ้า/พ่นยุง/สูบน้ำ)', count: vehicles.filter(v => v.category === 'equipment').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            ทะเบียนรถยนต์ เครื่องจักร และเครื่องมือ
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ทะเบียนพัสดุยานพาหนะ แนบไฟล์เล่มทะเบียน PDF และบันทึกประวัติการใช้งาน
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มยานพาหนะ / เครื่องมือใหม่</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
              selectedCategory === cat.id
                ? 'bg-blue-700 text-white font-semibold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                selectedCategory === cat.id ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาทะเบียน, เลขครุภัณฑ์, ยี่ห้อ/รุ่น, พนักงานขับรถ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">ทุกกอง / ทุกสังกัด</option>
            <option value="สำนักปลัด">สำนักปลัด</option>
            <option value="กองช่าง">กองช่าง</option>
            <option value="กองสาธารณสุขและสิ่งแวดล้อม">กองสาธารณสุขฯ</option>
            <option value="งานป้องกันและบรรเทาสาธารณภัย">งานป้องกันและบรรเทาสาธารณภัย</option>
            <option value="กองการศึกษา">กองการศึกษา</option>
            <option value="กองคลัง">กองคลัง</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="พร้อมใช้งาน">พร้อมใช้งาน</option>
            <option value="รอซ่อม">รอซ่อม</option>
            <option value="อยู่ระหว่างซ่อม">อยู่ระหว่างซ่อม</option>
            <option value="ปลดระวาง/จำหน่าย">ปลดระวาง/จำหน่าย</option>
          </select>
        </div>
      </div>

      {/* Grid of Vehicles & Machinery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map(vehicle => {
          const hasFile = Boolean(vehicle.registrationFile);
          return (
            <div
              key={vehicle.id}
              onClick={() => onSelectVehicle(vehicle)}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header row: Plate & Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
                    {vehicle.plateNumber !== '-' ? vehicle.plateNumber : `ครุภัณฑ์ ${vehicle.assetCode}`}
                  </span>

                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      vehicle.status === 'พร้อมใช้งาน'
                        ? 'bg-emerald-50 text-emerald-700'
                        : vehicle.status === 'รอซ่อม'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </div>

                {/* Vehicle Name */}
                <h3 className="font-bold text-base text-slate-900 mb-1 leading-snug">
                  {vehicle.name}
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  {vehicle.brandModel}
                </p>

                {/* Details Table */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">สังกัด:</span>
                    <span className="font-medium text-slate-800">{vehicle.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ผู้รับผิดชอบ:</span>
                    <span className="font-medium text-slate-800">{vehicle.driverName || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">เชื้อเพลิง:</span>
                    <span className="font-medium text-slate-800">{vehicle.fuelType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">เลขไมล์ / ชม. ล่าสุด:</span>
                    <span className="font-mono font-bold text-blue-700">
                      {formatNumber(vehicle.currentOdometer)} {vehicle.odometerUnit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions & Attached File */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {hasFile ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (vehicle.registrationFile) {
                        setViewingAttachment({
                          name: vehicle.registrationFile.name,
                          url: vehicle.registrationFile.dataUrl,
                          type: vehicle.registrationFile.type,
                        });
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[120px]">ดูเล่มทะเบียน</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> ยังไม่แนบเล่ม
                  </span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(vehicle, e)}
                    className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                    title="แก้ไขข้อมูล"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`ยืนยันการลบ ${vehicle.name} ออกจากระบบ?`)) {
                        onDeleteVehicle(vehicle.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="ลบรายการ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
          <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 mb-1">ไม่พบข้อมูลยานพาหนะตามเงื่อนไขที่เลือก</h3>
          <p className="text-xs text-slate-400 mb-4">ลองปรับตัวกรอง หรือค้นหาด้วยคำอื่น</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedDepartment('all');
              setSelectedStatus('all');
            }}
            className="text-xs font-semibold text-blue-700 hover:underline"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingVehicle ? 'แก้ไขข้อมูลยานพาหนะ / เครื่องมือ' : 'เพิ่มยานพาหนะ / เครื่องมือใหม่'}
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
              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ประเภทพัสดุ *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const cat = e.target.value as VehicleCategory;
                      setFormData(prev => ({
                        ...prev,
                        category: cat,
                        odometerUnit: cat === 'equipment' || cat === 'machinery' ? 'ชั่วโมง' : 'กม.'
                      }));
                    }}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="car">รถยนต์ส่วนกลาง / รถตู้ / รถกระบะ</option>
                    <option value="special_truck">รถเฉพาะกิจ (รถบรรทุกน้ำ/ขยะ/ดับเพลิง/กระเช้า)</option>
                    <option value="machinery">เครื่องจักรกลหนัก (รถแทรกเตอร์/รถตัก)</option>
                    <option value="equipment">เครื่องมือ (เครื่องตัดหญ้า/พ่นยุง/สูบน้ำ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สถานะการใช้งาน
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as VehicleStatus }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="พร้อมใช้งาน">พร้อมใช้งาน</option>
                    <option value="รอซ่อม">รอซ่อม</option>
                    <option value="อยู่ระหว่างซ่อม">อยู่ระหว่างซ่อม</option>
                    <option value="ปลดระวาง/จำหน่าย">ปลดระวาง/จำหน่าย</option>
                  </select>
                </div>
              </div>

              {/* Name & Plate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อเรียกยานพาหนะ / เครื่องมือ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น รถกระบะ 4 ประตู สำนักปลัด, เครื่องตัดหญ้า 1"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    หมายเลขทะเบียน (หากไม่มีใส่ -)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น กข 4590 นครพนม"
                    value={formData.plateNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, plateNumber: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Asset Code & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    หมายเลขครุภัณฑ์
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 416-65-0001"
                    value={formData.assetCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, assetCode: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    สังกัดกอง / สำนัก *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value as Department }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="สำนักปลัด">สำนักปลัด</option>
                    <option value="กองช่าง">กองช่าง</option>
                    <option value="กองสาธารณสุขและสิ่งแวดล้อม">กองสาธารณสุขและสิ่งแวดล้อม</option>
                    <option value="งานป้องกันและบรรเทาสาธารณภัย">งานป้องกันและบรรเทาสาธารณภัย</option>
                    <option value="กองการศึกษา">กองการศึกษา</option>
                    <option value="กองคลัง">กองคลัง</option>
                  </select>
                </div>
              </div>

              {/* Brand/Model & Fuel Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ยี่ห้อ / รุ่น
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น Toyota Hilux Revo 2.4, Honda GX35"
                    value={formData.brandModel}
                    onChange={(e) => setFormData(prev => ({ ...prev, brandModel: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชนิดเชื้อเพลิงหลัก *
                  </label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData(prev => ({ ...prev, fuelType: e.target.value as FuelType }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="ดีเซล">ดีเซล</option>
                    <option value="เบนซิน 95">เบนซิน 95</option>
                    <option value="แก๊สโซฮอล์ 95">แก๊สโซฮอล์ 95</option>
                    <option value="แก๊สโซฮอล์ 91">แก๊สโซฮอล์ 91</option>
                    <option value="เบนซินผสม 2T">เบนซินผสม 2T (สำหรับเครื่องยนต์ 2 จังหวะ)</option>
                  </select>
                </div>
              </div>

              {/* Driver & Odometer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    พนักงานขับรถ / ผู้ดูแลรับผิดชอบ
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น นายศักดา ประชากุล"
                    value={formData.driverName}
                    onChange={(e) => setFormData(prev => ({ ...prev, driverName: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      เลขไมล์ / ชม. ปัจจุบัน
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.currentOdometer}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentOdometer: Number(e.target.value) }))}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none tabular-nums"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      หน่วย
                    </label>
                    <select
                      value={formData.odometerUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, odometerUnit: e.target.value as OdometerUnit }))}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="กม.">กม.</option>
                      <option value="ชั่วโมง">ชั่วโมง</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Chassis & Engine */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    หมายเลขตัวถัง / แชสซี
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น MHFAB3DB601249821"
                    value={formData.chassisNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, chassisNumber: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    หมายเลขเครื่องยนต์
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 2GD-9482103"
                    value={formData.engineNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, engineNumber: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* File Attachment: PDF / Image */}
              <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  แนบไฟล์เล่มทะเบียน / คู่มือจดทะเบียน (PDF หรือ รูปภาพ)
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  รองรับไฟล์ PDF, JPG, PNG บันทึกลงในเครื่องใช้งานได้ออฟไลน์ ไม่ต้องต่อเน็ต
                </p>

                {formData.registrationFile ? (
                  <div className="flex items-center justify-between p-3 bg-white border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-800 truncate">
                          {formData.registrationFile.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {(formData.registrationFile.size / 1024).toFixed(1)} KB · {formData.registrationFile.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.registrationFile) {
                            setViewingAttachment({
                              name: formData.registrationFile.name,
                              url: formData.registrationFile.dataUrl,
                              type: formData.registrationFile.type,
                            });
                          }
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded"
                      >
                        ดูไฟล์
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                        title="ลบไฟล์"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="registration-file-input"
                    />
                    <label
                      htmlFor="registration-file-input"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                    >
                      <Paperclip className="w-4 h-4" />
                      <span>เลือกไฟล์ PDF หรือ รูปภาพเล่มทะเบียน</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หมายเหตุเพิ่มเติม
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น ภารกิจประจำ, สถานที่จอด, ประกันภัย พรบ. หมดอายุวันที่..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
                  {editingVehicle ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attachment Viewer Modal (PDF / Image Preview) */}
      {viewingAttachment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-700" />
                <span className="font-bold text-sm text-slate-800 truncate max-w-md">
                  {viewingAttachment.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={viewingAttachment.url}
                  download={viewingAttachment.name}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> ดาวน์โหลด
                </a>
                <button
                  onClick={() => setViewingAttachment(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 p-2 overflow-auto flex items-center justify-center">
              {viewingAttachment.type === 'application/pdf' || viewingAttachment.name.endsWith('.pdf') ? (
                <iframe
                  src={viewingAttachment.url}
                  title="PDF Attachment"
                  className="w-full h-full border-none rounded bg-white"
                />
              ) : (
                <img
                  src={viewingAttachment.url}
                  alt={viewingAttachment.name}
                  className="max-w-full max-h-full object-contain rounded"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
