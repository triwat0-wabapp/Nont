import React, { useState, useMemo } from 'react';
import { FuelLog, Vehicle, Department, FuelType, FuelCategory } from '../types';
import { formatCurrency, formatNumber, formatThaiDate, THAI_MONTHS_FULL, getFiscalYear } from '../utils/thaiDate';
import { Fuel, Plus, Printer, Search, Download, Filter, X, Edit2, Trash2, Calendar, FileSpreadsheet } from 'lucide-react';

interface FuelManagementProps {
  fuelLogs: FuelLog[];
  vehicles: Vehicle[];
  onAddFuelLog: (log: Omit<FuelLog, 'id' | 'createdAt'>) => void;
  onUpdateFuelLog: (log: FuelLog) => void;
  onDeleteFuelLog: (id: string) => void;
  onOpenPrintSummary: (month: string, fiscalYear: number, department: string, fuelCat: string) => void;
  openCreateModalDirectly?: boolean;
  onCloseCreateModalDirectly?: () => void;
}

export const FuelManagement: React.FC<FuelManagementProps> = ({
  fuelLogs,
  vehicles,
  onAddFuelLog,
  onUpdateFuelLog,
  onDeleteFuelLog,
  onOpenPrintSummary,
  openCreateModalDirectly = false,
  onCloseCreateModalDirectly,
}) => {
  // Available fiscal years
  const availableFiscalYears = useMemo(() => {
    const years = new Set<number>([2568, 2567]);
    fuelLogs.forEach(f => years.add(f.fiscalYear));
    return Array.from(years).sort((a, b) => b - a);
  }, [fuelLogs]);

  // Filter States
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(availableFiscalYears[0] || 2568);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedFuelCategory, setSelectedFuelCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(openCreateModalDirectly);
  const [editingLog, setEditingLog] = useState<FuelLog | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    vehicleId: string;
    date: string;
    liters: number;
    pricePerLiter: number;
    startOdometer: number;
    endOdometer: number;
    invoiceNumber: string;
    station: string;
    driverName: string;
    purpose: string;
    customFuelType?: FuelType;
  }>({
    vehicleId: vehicles[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    liters: 45,
    pricePerLiter: 32.94,
    startOdometer: 0,
    endOdometer: 0,
    invoiceNumber: '',
    station: 'หจก.พระซองปิโตรเลียม',
    driverName: '',
    purpose: '',
  });

  React.useEffect(() => {
    if (openCreateModalDirectly) {
      handleOpenCreate();
    }
  }, [openCreateModalDirectly]);

  const handleOpenCreate = () => {
    setEditingLog(null);
    const firstVeh = vehicles[0];
    setFormData({
      vehicleId: firstVeh?.id || '',
      date: new Date().toISOString().split('T')[0],
      liters: 40,
      pricePerLiter: firstVeh?.fuelType === 'ดีเซล' ? 32.94 : 38.50,
      startOdometer: firstVeh?.currentOdometer || 0,
      endOdometer: (firstVeh?.currentOdometer || 0) + 400,
      invoiceNumber: `บจ.${(new Date().getFullYear() + 543).toString().slice(-2)}/${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(fuelLogs.length + 1).padStart(3, '0')}`,
      station: 'หจก.พระซองปิโตรเลียม',
      driverName: firstVeh?.driverName || '',
      purpose: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (log: FuelLog) => {
    setEditingLog(log);
    setFormData({
      vehicleId: log.vehicleId,
      date: log.date,
      liters: log.liters,
      pricePerLiter: log.pricePerLiter,
      startOdometer: log.startOdometer,
      endOdometer: log.endOdometer,
      invoiceNumber: log.invoiceNumber,
      station: log.station,
      driverName: log.driverName,
      purpose: log.purpose,
      customFuelType: log.fuelType,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLog(null);
    if (onCloseCreateModalDirectly) {
      onCloseCreateModalDirectly();
    }
  };

  // When selected vehicle changes in form, auto-fill fuel type, current odometer, and driver name
  const handleVehicleChange = (vId: string) => {
    const veh = vehicles.find(v => v.id === vId);
    if (veh) {
      const isDiesel = veh.fuelType === 'ดีเซล';
      setFormData(prev => ({
        ...prev,
        vehicleId: vId,
        pricePerLiter: isDiesel ? 32.94 : 38.50,
        startOdometer: veh.currentOdometer,
        endOdometer: veh.category === 'equipment' ? veh.currentOdometer + 20 : veh.currentOdometer + 450,
        driverName: veh.driverName || prev.driverName,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const veh = vehicles.find(v => v.id === formData.vehicleId);
    if (!veh) {
      alert('กรุณาเลือกยานพาหนะ');
      return;
    }

    const liters = Number(formData.liters);
    const pricePerLiter = Number(formData.pricePerLiter);
    const totalCost = Math.round(liters * pricePerLiter * 100) / 100;
    const startOdo = Number(formData.startOdometer);
    const endOdo = Number(formData.endOdometer);
    const distanceOrHours = Math.max(0, endOdo - startOdo);
    const kmPerLiter = liters > 0 ? Math.round((distanceOrHours / liters) * 100) / 100 : 0;

    const fuelType = formData.customFuelType || veh.fuelType;
    const fuelCategory: FuelCategory = fuelType === 'ดีเซล' ? 'ดีเซล' : 'เบนซิน';
    const fiscalYear = getFiscalYear(formData.date);
    const month = formData.date.slice(0, 7); // YYYY-MM

    if (editingLog) {
      onUpdateFuelLog({
        ...editingLog,
        vehicleId: veh.id,
        vehiclePlate: veh.plateNumber,
        vehicleName: veh.name,
        department: veh.department,
        date: formData.date,
        fiscalYear,
        month,
        fuelType,
        fuelCategory,
        liters,
        pricePerLiter,
        totalCost,
        startOdometer: startOdo,
        endOdometer: endOdo,
        distanceOrHours,
        kmPerLiter,
        invoiceNumber: formData.invoiceNumber,
        station: formData.station,
        driverName: formData.driverName,
        purpose: formData.purpose,
      });
    } else {
      onAddFuelLog({
        vehicleId: veh.id,
        vehiclePlate: veh.plateNumber,
        vehicleName: veh.name,
        department: veh.department,
        date: formData.date,
        fiscalYear,
        month,
        fuelType,
        fuelCategory,
        liters,
        pricePerLiter,
        totalCost,
        startOdometer: startOdo,
        endOdometer: endOdo,
        distanceOrHours,
        kmPerLiter,
        invoiceNumber: formData.invoiceNumber,
        station: formData.station,
        driverName: formData.driverName,
        purpose: formData.purpose,
      });
    }

    handleCloseModal();
  };

  // Filtered Fuel Logs
  const filteredLogs = useMemo(() => {
    return fuelLogs.filter(log => {
      const matchYear = log.fiscalYear === selectedFiscalYear;
      const matchMonth = selectedMonth === 'all' || log.date.split('-')[1] === selectedMonth;
      const matchDept = selectedDepartment === 'all' || log.department === selectedDepartment;
      const matchCat = selectedFuelCategory === 'all' || log.fuelCategory === selectedFuelCategory;

      const matchSearch =
        log.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.purpose.toLowerCase().includes(searchQuery.toLowerCase());

      return matchYear && matchMonth && matchDept && matchCat && matchSearch;
    });
  }, [fuelLogs, selectedFiscalYear, selectedMonth, selectedDepartment, selectedFuelCategory, searchQuery]);

  // Aggregate metrics for filtered view
  const summary = useMemo(() => {
    const totalLiters = filteredLogs.reduce((acc, curr) => acc + curr.liters, 0);
    const totalCost = filteredLogs.reduce((acc, curr) => acc + curr.totalCost, 0);

    const diesel = filteredLogs.filter(l => l.fuelCategory === 'ดีเซล');
    const dieselLiters = diesel.reduce((acc, curr) => acc + curr.liters, 0);
    const dieselCost = diesel.reduce((acc, curr) => acc + curr.totalCost, 0);

    const petrol = filteredLogs.filter(l => l.fuelCategory === 'เบนซิน');
    const petrolLiters = petrol.reduce((acc, curr) => acc + curr.liters, 0);
    const petrolCost = petrol.reduce((acc, curr) => acc + curr.totalCost, 0);

    const totalDistance = filteredLogs.reduce((acc, curr) => acc + curr.distanceOrHours, 0);
    const avgEfficiency = totalLiters > 0 ? (totalDistance / totalLiters).toFixed(2) : '0';

    return {
      totalLiters,
      totalCost,
      dieselLiters,
      dieselCost,
      petrolLiters,
      petrolCost,
      totalDistance,
      avgEfficiency,
      count: filteredLogs.length,
    };
  }, [filteredLogs]);

  // Export to CSV for Excel
  const handleExportCSV = () => {
    const headers = [
      'ลำดับ',
      'วันที่',
      'เลขที่ใบสั่งจ่าย/ใบเสร็จ',
      'ยานพาหนะ/เครื่องมือ',
      'ทะเบียน/เลขครุภัณฑ์',
      'กอง/สำนัก',
      'ชนิดน้ำมัน',
      'กลุ่มน้ำมัน',
      'จำนวนลิตร',
      'ราคาต่อลิตร',
      'จำนวนเงินรวม (บาท)',
      'ไมล์ต้น',
      'ไมล์ปลาย',
      'ระยะทาง/ชม.',
      'กม./ลิตร',
      'ผู้เบิก/พนักงานขับ',
      'ภารกิจ/งานที่ปฏิบัติ',
      'ปั๊มน้ำมัน'
    ];

    const rows = filteredLogs.map((log, index) => [
      index + 1,
      log.date,
      `"${log.invoiceNumber}"`,
      `"${log.vehicleName}"`,
      `"${log.vehiclePlate}"`,
      `"${log.department}"`,
      log.fuelType,
      log.fuelCategory,
      log.liters.toFixed(2),
      log.pricePerLiter.toFixed(2),
      log.totalCost.toFixed(2),
      log.startOdometer,
      log.endOdometer,
      log.distanceOrHours,
      log.kmPerLiter || '',
      `"${log.driverName}"`,
      `"${log.purpose.replace(/"/g, '""')}"`,
      `"${log.station}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ทะเบียนคุมน้ำมัน_เทศบาลตำบลพระซอง_ปีงบ${selectedFiscalYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Print / Add buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            บันทึกการเบิกจ่ายน้ำมันเชื้อเพลิงรายเดือน
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            แยกดีเซล / เบนซิน แยกกอง กดพิมพ์ใบสรุปเบิกจ่ายน้ำมันส่งกองคลังได้ทันที
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>ส่งออก Excel/CSV</span>
          </button>

          <button
            onClick={() => onOpenPrintSummary(selectedMonth, selectedFiscalYear, selectedDepartment, selectedFuelCategory)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์ใบสรุปน้ำมัน</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ บันทึกเบิกน้ำมัน</span>
          </button>
        </div>
      </div>

      {/* KPI Cards for filtered data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            ยอดเงินเบิกจ่ายรวม
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            ฿{formatCurrency(summary.totalCost)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {summary.count} รายการ · รวม {formatNumber(Math.round(summary.totalLiters))} ลิตร
          </div>
        </div>

        {/* Diesel */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 block flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" /> น้ำมันดีเซล
          </span>
          <div className="text-2xl font-bold text-blue-900 mt-1 tabular-nums">
            ฿{formatCurrency(summary.dieselCost)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {formatNumber(Math.round(summary.dieselLiters))} ลิตร
          </div>
        </div>

        {/* Petrol */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 block flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> เบนซิน / แก๊สโซฮอล์
          </span>
          <div className="text-2xl font-bold text-emerald-900 mt-1 tabular-nums">
            ฿{formatCurrency(summary.petrolCost)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {formatNumber(Math.round(summary.petrolLiters))} ลิตร (เครื่องมือ/ตัดหญ้า)
          </div>
        </div>

        {/* Avg Distance / Efficiency */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            ระยะทางที่วิ่งรวม
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {formatNumber(summary.totalDistance)} <span className="text-sm font-normal text-slate-500">กม./ชม.</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            เฉลี่ย {summary.avgEfficiency} กม./ลิตร
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Year */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              ปีงบประมาณ
            </label>
            <select
              value={selectedFiscalYear}
              onChange={(e) => setSelectedFiscalYear(Number(e.target.value))}
              className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              {availableFiscalYears.map(y => (
                <option key={y} value={y}>พ.ศ. {y}</option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              เดือน
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="all">ทุกเดือน (ทั้งปีงบ)</option>
              <option value="10">ตุลาคม</option>
              <option value="11">พฤศจิกายน</option>
              <option value="12">ธันวาคม</option>
              <option value="01">มกราคม</option>
              <option value="02">กุมภาพันธ์</option>
              <option value="03">มีนาคม</option>
              <option value="04">เมษายน</option>
              <option value="05">พฤษภาคม</option>
              <option value="06">มิถุนายน</option>
              <option value="07">กรกฎาคม</option>
              <option value="08">สิงหาคม</option>
              <option value="09">กันยายน</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              สังกัดกอง / สำนัก
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="all">ทุกกอง / ทุกสังกัด</option>
              <option value="สำนักปลัด">สำนักปลัด</option>
              <option value="กองช่าง">กองช่าง</option>
              <option value="กองสาธารณสุขและสิ่งแวดล้อม">กองสาธารณสุขและสิ่งแวดล้อม</option>
              <option value="งานป้องกันและบรรเทาสาธารณภัย">งานป้องกันและบรรเทาสาธารณภัย</option>
              <option value="กองการศึกษา">กองการศึกษา</option>
              <option value="กองคลัง">กองคลัง</option>
            </select>
          </div>

          {/* Fuel Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              ประเภทน้ำมัน
            </label>
            <select
              value={selectedFuelCategory}
              onChange={(e) => setSelectedFuelCategory(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="all">ทุกประเภทน้ำมัน</option>
              <option value="ดีเซล">ดีเซล เท่านั้น</option>
              <option value="เบนซิน">เบนซิน / แก๊สโซฮอล์ เท่านั้น</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              ค้นหา
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ทะเบียน, ผู้เบิก, ภารกิจ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fuel Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-3">วันที่</th>
                <th className="py-3 px-3">เลขที่ใบเสร็จ/สั่งจ่าย</th>
                <th className="py-3 px-3">ยานพาหนะ / ทะเบียน</th>
                <th className="py-3 px-3">กอง / สำนัก</th>
                <th className="py-3 px-3">ชนิดน้ำมัน</th>
                <th className="py-3 px-3 text-right">ลิตร</th>
                <th className="py-3 px-3 text-right">ราคา/ลิตร</th>
                <th className="py-3 px-3 text-right">รวมเงิน (บาท)</th>
                <th className="py-3 px-3 text-right">ระยะทาง/ชม.</th>
                <th className="py-3 px-3 text-center">กม./ลิตร</th>
                <th className="py-3 px-3">ผู้เบิก / ภารกิจ</th>
                <th className="py-3 px-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {log.date}
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {log.invoiceNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{log.vehicleName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {log.vehiclePlate !== '-' ? log.vehiclePlate : 'เครื่องมือ'}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {log.department}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            log.fuelCategory === 'ดีเซล'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {log.fuelType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-900 tabular-nums whitespace-nowrap">
                        {log.liters.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600 tabular-nums whitespace-nowrap">
                        {log.pricePerLiter.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        ฿{formatCurrency(log.totalCost)}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700 tabular-nums whitespace-nowrap">
                        {formatNumber(log.distanceOrHours)}
                      </td>
                      <td className="py-3 px-3 text-center tabular-nums whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-blue-700">
                          {log.kmPerLiter ? log.kmPerLiter.toFixed(2) : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-[200px]">
                        <div className="font-medium text-slate-900 truncate">{log.driverName}</div>
                        <div className="text-[11px] text-slate-500 truncate" title={log.purpose}>
                          {log.purpose || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(log)}
                            className="p-1 text-slate-400 hover:text-blue-700 rounded transition-colors"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`ยืนยันการลบรายการเบิกน้ำมัน ${log.invoiceNumber}?`)) {
                                onDeleteFuelLog(log.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-slate-400">
                    ไม่พบรายการเบิกจ่ายน้ำมันตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Fuel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingLog ? 'แก้ไขรายการเบิกจ่ายน้ำมัน' : 'บันทึกการเบิกจ่ายน้ำมันเชื้อเพลิง'}
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
              {/* Vehicle selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เลือกยานพาหนะ / เครื่องมือ *
                </label>
                <select
                  required
                  value={formData.vehicleId}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- กรุณาเลือก --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.plateNumber !== '-' ? v.plateNumber : v.assetCode}) - {v.department} [{v.fuelType}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Invoice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันที่เบิกจ่าย *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เลขที่ใบสั่งจ่าย / ใบเสร็จ
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น บจ.68/01-005"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Liters & Price per liter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    จำนวนลิตร *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={formData.liters}
                    onChange={(e) => setFormData(prev => ({ ...prev, liters: Number(e.target.value) }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ราคาต่อลิตร (บาท) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={formData.pricePerLiter}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricePerLiter: Number(e.target.value) }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none tabular-nums"
                  />
                </div>
              </div>

              {/* Computed Total Cost Card */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-900">จำนวนเงินรวมทั้งสิ้น:</span>
                <span className="text-lg font-bold text-blue-900 tabular-nums">
                  ฿{formatCurrency(formData.liters * formData.pricePerLiter)}
                </span>
              </div>

              {/* Odometer Start / End */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เลขไมล์ / ชม. เริ่มต้น
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.startOdometer}
                    onChange={(e) => setFormData(prev => ({ ...prev, startOdometer: Number(e.target.value) }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เลขไมล์ / ชม. สิ้นสุด
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.endOdometer}
                    onChange={(e) => setFormData(prev => ({ ...prev, endOdometer: Number(e.target.value) }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none tabular-nums"
                  />
                </div>
              </div>

              {/* Computed Distance & Km/L */}
              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                <span>
                  ระยะทางที่วิ่ง:{' '}
                  <strong className="text-slate-900">
                    {Math.max(0, formData.endOdometer - formData.startOdometer)}
                  </strong>{' '}
                  กม./ชม.
                </span>
                <span>
                  อัตราสิ้นเปลือง:{' '}
                  <strong className="text-blue-700 font-mono">
                    {formData.liters > 0
                      ? (Math.max(0, formData.endOdometer - formData.startOdometer) / formData.liters).toFixed(2)
                      : '0'}{' '}
                    กม./ลิตร
                  </strong>
                </span>
              </div>

              {/* Driver & Station */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ผู้ขอเบิก / พนักงานขับรถ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น นายศักดา ประชากุล"
                    value={formData.driverName}
                    onChange={(e) => setFormData(prev => ({ ...prev, driverName: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ปั๊มน้ำมัน / สถานบริการ
                  </label>
                  <input
                    type="text"
                    value={formData.station}
                    onChange={(e) => setFormData(prev => ({ ...prev, station: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ภารกิจ / งานที่ปฏิบัติ
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น ออกตรวจพื้นที่น้ำท่วม ม.3, ส่งผู้ป่วยฉุกเฉิน รพ.นาแก"
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Buttons */}
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
                  {editingLog ? 'บันทึกการแก้ไข' : 'บันทึกการเบิกน้ำมัน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
