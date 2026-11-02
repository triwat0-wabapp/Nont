import React, { useState, useMemo } from 'react';
import { Vehicle, FuelLog, RepairRecord, Department } from '../types';
import { formatCurrency, formatNumber } from '../utils/thaiDate';
import { Truck, Fuel, Wrench, Banknote, Calendar, ChevronRight, AlertCircle, ArrowUpRight } from 'lucide-react';
import { MunicipalSeal } from './MunicipalSeal';

interface DashboardProps {
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  repairs: RepairRecord[];
  onNavigateTab: (tab: 'vehicles' | 'fuel' | 'repairs' | 'analytics' | 'backup') => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onOpenRepairForm6: (repair: RepairRecord) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  vehicles,
  fuelLogs,
  repairs,
  onNavigateTab,
  onSelectVehicle,
  onOpenRepairForm6,
}) => {
  // Available fiscal years from data
  const availableYears = useMemo(() => {
    const years = new Set<number>([2568, 2567]);
    fuelLogs.forEach(f => years.add(f.fiscalYear));
    repairs.forEach(r => years.add(r.fiscalYear));
    return Array.from(years).sort((a, b) => b - a);
  }, [fuelLogs, repairs]);

  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(availableYears[0] || 2568);

  // Filtered by fiscal year
  const yearFuelLogs = useMemo(() => {
    return fuelLogs.filter(f => f.fiscalYear === selectedFiscalYear);
  }, [fuelLogs, selectedFiscalYear]);

  const yearRepairs = useMemo(() => {
    return repairs.filter(r => r.fiscalYear === selectedFiscalYear);
  }, [repairs, selectedFiscalYear]);

  // Aggregate metrics
  const totalFuelCost = useMemo(() => {
    return yearFuelLogs.reduce((sum, item) => sum + item.totalCost, 0);
  }, [yearFuelLogs]);

  const totalFuelLiters = useMemo(() => {
    return yearFuelLogs.reduce((sum, item) => sum + item.liters, 0);
  }, [yearFuelLogs]);

  const dieselCost = useMemo(() => {
    return yearFuelLogs
      .filter(item => item.fuelCategory === 'ดีเซล')
      .reduce((sum, item) => sum + item.totalCost, 0);
  }, [yearFuelLogs]);

  const dieselLiters = useMemo(() => {
    return yearFuelLogs
      .filter(item => item.fuelCategory === 'ดีเซล')
      .reduce((sum, item) => sum + item.liters, 0);
  }, [yearFuelLogs]);

  const petrolCost = useMemo(() => {
    return yearFuelLogs
      .filter(item => item.fuelCategory === 'เบนซิน')
      .reduce((sum, item) => sum + item.totalCost, 0);
  }, [yearFuelLogs]);

  const petrolLiters = useMemo(() => {
    return yearFuelLogs
      .filter(item => item.fuelCategory === 'เบนซิน')
      .reduce((sum, item) => sum + item.liters, 0);
  }, [yearFuelLogs]);

  const totalRepairCost = useMemo(() => {
    return yearRepairs.reduce((sum, item) => sum + item.totalCost, 0);
  }, [yearRepairs]);

  const totalOperationalCost = totalFuelCost + totalRepairCost;

  // Breakdown by Department
  const departmentBreakdown = useMemo(() => {
    const depts: Record<Department, { fuel: number; repair: number; total: number; vehicleCount: number }> = {
      'สำนักปลัด': { fuel: 0, repair: 0, total: 0, vehicleCount: 0 },
      'กองช่าง': { fuel: 0, repair: 0, total: 0, vehicleCount: 0 },
      'กองสาธารณสุขและสิ่งแวดล้อม': { fuel: 0, repair: 0, total: 0, vehicleCount: 0 },
      'กองการศึกษา': { fuel: 0, repair: 0, total: 0, vehicleCount: 0 },
      'กองคลัง': { fuel: 0, repair: 0, total: 0, vehicleCount: 0 },
      'งานป้องกันและบรรเทาสาธารณภัย': { fuel: 0, repair: 0, total: 0, vehicleCount: 0 },
    };

    vehicles.forEach(v => {
      if (depts[v.department]) {
        depts[v.department].vehicleCount += 1;
      }
    });

    yearFuelLogs.forEach(f => {
      if (depts[f.department]) {
        depts[f.department].fuel += f.totalCost;
        depts[f.department].total += f.totalCost;
      }
    });

    yearRepairs.forEach(r => {
      if (depts[r.department]) {
        depts[r.department].repair += r.totalCost;
        depts[r.department].total += r.totalCost;
      }
    });

    return Object.entries(depts)
      .map(([name, data]) => ({ name: name as Department, ...data }))
      .filter(d => d.vehicleCount > 0 || d.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [vehicles, yearFuelLogs, yearRepairs]);

  // Top costly vehicles
  const topCostVehicles = useMemo(() => {
    const map = new Map<string, { vehicle: Vehicle; fuel: number; repair: number; total: number; liters: number; distance: number }>();

    vehicles.forEach(v => {
      map.set(v.id, { vehicle: v, fuel: 0, repair: 0, total: 0, liters: 0, distance: 0 });
    });

    yearFuelLogs.forEach(f => {
      const entry = map.get(f.vehicleId);
      if (entry) {
        entry.fuel += f.totalCost;
        entry.liters += f.liters;
        entry.distance += f.distanceOrHours;
        entry.total += f.totalCost;
      }
    });

    yearRepairs.forEach(r => {
      const entry = map.get(r.vehicleId);
      if (entry) {
        entry.repair += r.totalCost;
        entry.total += r.totalCost;
      }
    });

    return Array.from(map.values())
      .filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [vehicles, yearFuelLogs, yearRepairs]);

  // Monthly distribution for fiscal year (Oct - Sep)
  const monthlyData = useMemo(() => {
    const months = [
      { key: '10', name: 'ต.ค.' },
      { key: '11', name: 'พ.ย.' },
      { key: '12', name: 'ธ.ค.' },
      { key: '01', name: 'ม.ค.' },
      { key: '02', name: 'ก.พ.' },
      { key: '03', name: 'มี.ค.' },
      { key: '04', name: 'เม.ย.' },
      { key: '05', name: 'พ.ค.' },
      { key: '06', name: 'มิ.ย.' },
      { key: '07', name: 'ก.ค.' },
      { key: '08', name: 'ส.ค.' },
      { key: '09', name: 'ก.ย.' },
    ];

    const result = months.map(m => {
      let fuel = 0;
      let repair = 0;

      yearFuelLogs.forEach(f => {
        const monthNum = f.date.split('-')[1];
        if (monthNum === m.key) {
          fuel += f.totalCost;
        }
      });

      yearRepairs.forEach(r => {
        const monthNum = r.date.split('-')[1];
        if (monthNum === m.key) {
          repair += r.totalCost;
        }
      });

      return {
        ...m,
        fuel,
        repair,
        total: fuel + repair,
      };
    });

    const maxMonth = Math.max(...result.map(r => r.total), 1);
    return { data: result, max: maxMonth };
  }, [yearFuelLogs, yearRepairs]);

  return (
    <div className="space-y-6">
      {/* Top Header & Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3.5">
          <MunicipalSeal size={52} className="shadow-xs" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              แดชบอร์ดสรุปค่าใช้จ่ายยานพาหนะและเครื่องจักร
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              เทศบาลตำบลพระซอง อำเภอนาแก จังหวัดนครพนม
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-300 rounded-lg shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-600">ปีงบประมาณ พ.ศ.:</span>
            <select
              value={selectedFiscalYear}
              onChange={(e) => setSelectedFiscalYear(Number(e.target.value))}
              className="text-sm font-bold text-blue-700 bg-transparent outline-none cursor-pointer"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 Main Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Fleet */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">ยานพาหนะ/เครื่องมือ</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 tabular-nums">
            {formatNumber(vehicles.length)} <span className="text-sm font-normal text-slate-500">คัน/เครื่อง</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>พร้อมใช้งาน: {vehicles.filter(v => v.status === 'พร้อมใช้งาน').length}</span>
            <button
              onClick={() => onNavigateTab('vehicles')}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5"
            >
              ดูทะเบียน <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Total Fuel Cost */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">ค่าน้ำมันเชื้อเพลิง</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Fuel className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 tabular-nums">
            ฿{formatCurrency(totalFuelCost)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>รวม {formatNumber(Math.round(totalFuelLiters))} ลิตร</span>
            <button
              onClick={() => onNavigateTab('fuel')}
              className="text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-0.5"
            >
              ดูเบิกจ่าย <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: Total Repair Cost */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">ค่าซ่อมบำรุง (แบบ 6)</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 tabular-nums">
            ฿{formatCurrency(totalRepairCost)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>{yearRepairs.length} รายการขอซ่อม</span>
            <button
              onClick={() => onNavigateTab('repairs')}
              className="text-amber-700 hover:text-amber-900 font-medium flex items-center gap-0.5"
            >
              ดูประวัติซ่อม <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 4: Total Operational Cost */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">รวมค่าใช้จ่ายทั้งปีงบ</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-900 tabular-nums">
            ฿{formatCurrency(totalOperationalCost)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>น้ำมัน {(totalFuelCost / (totalOperationalCost || 1) * 100).toFixed(0)}% · ซ่อม {(totalRepairCost / (totalOperationalCost || 1) * 100).toFixed(0)}%</span>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-purple-700 hover:text-purple-900 font-medium flex items-center gap-0.5"
            >
              วิเคราะห์ <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Fuel Type Comparison Bar & Alert */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              สัดส่วนการใช้น้ำมันเชื้อเพลิง ปีงบประมาณ {selectedFiscalYear}
            </h2>
            <p className="text-xs text-slate-500">
              แยกตามประเภทน้ำมันดีเซลและกลุ่มเบนซิน/แก๊สโซฮอล์
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
              <span>ดีเซล: ฿{formatCurrency(dieselCost)} ({formatNumber(Math.round(dieselLiters))} ลิตร)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>เบนซิน/แก๊สโซฮอล์: ฿{formatCurrency(petrolCost)} ({formatNumber(Math.round(petrolLiters))} ลิตร)</span>
            </div>
          </div>
        </div>

        {/* Bar */}
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
          {totalFuelCost > 0 ? (
            <>
              <div
                style={{ width: `${(dieselCost / totalFuelCost) * 100}%` }}
                className="bg-blue-600 h-full transition-all"
                title={`ดีเซล: ${(dieselCost / totalFuelCost * 100).toFixed(1)}%`}
              />
              <div
                style={{ width: `${(petrolCost / totalFuelCost) * 100}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`เบนซิน: ${(petrolCost / totalFuelCost * 100).toFixed(1)}%`}
              />
            </>
          ) : (
            <div className="w-full h-full bg-slate-200" />
          )}
        </div>
      </div>

      {/* Two Column Grid: Monthly Spending Trend & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  แนวโน้มค่าใช้จ่ายรายเดือน (ต.ค. - ก.ย.)
                </h2>
                <p className="text-xs text-slate-500">
                  ค่าใช้จ่ายน้ำมันเชื้อเพลิงและค่าซ่อมบำรุงประจำแต่ละเดือน
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs" /> น้ำมัน
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs" /> ซ่อมแซม
                </span>
              </div>
            </div>

            {/* Bar chart */}
            <div className="pt-6 pb-2">
              <div className="h-44 flex items-end gap-1.5 sm:gap-2">
                {monthlyData.data.map((m) => {
                  const fuelPercent = (m.fuel / monthlyData.max) * 100;
                  const repairPercent = (m.repair / monthlyData.max) * 100;

                  return (
                    <div key={m.key} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                      <div className="w-full flex flex-col items-center justify-end h-full">
                        {m.total > 0 ? (
                          <div className="w-full max-w-[28px] flex flex-col justify-end rounded-t overflow-hidden">
                            <div
                              style={{ height: `${repairPercent}%` }}
                              className="w-full bg-amber-500 transition-all hover:bg-amber-600"
                              title={`${m.name}: ซ่อม ฿${formatCurrency(m.repair)}`}
                            />
                            <div
                              style={{ height: `${fuelPercent}%` }}
                              className="w-full bg-emerald-500 transition-all hover:bg-emerald-600"
                              title={`${m.name}: น้ำมัน ฿${formatCurrency(m.fuel)}`}
                            />
                          </div>
                        ) : (
                          <div className="w-full max-w-[28px] h-1 bg-slate-100 rounded-full" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">{m.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>เดือนที่มีค่าใช้จ่ายสูงสุด: {monthlyData.data.reduce((prev, curr) => curr.total > prev.total ? curr : prev).name}</span>
            <span>ยอดรวม 12 เดือน: ฿{formatCurrency(totalOperationalCost)}</span>
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  ค่าใช้จ่ายแยกตามกอง / สำนัก
                </h2>
                <p className="text-xs text-slate-500">
                  ปีงบประมาณ {selectedFiscalYear} เทศบาลตำบลพระซอง
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {departmentBreakdown.map((dept) => {
                const percent = totalOperationalCost > 0 ? (dept.total / totalOperationalCost) * 100 : 0;
                return (
                  <div key={dept.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-semibold text-slate-800">
                        {dept.name} <span className="font-normal text-slate-500">({dept.vehicleCount} คัน/เครื่อง)</span>
                      </div>
                      <div className="font-bold text-slate-900 tabular-nums">
                        ฿{formatCurrency(dept.total)}{' '}
                        <span className="font-normal text-slate-500">({percent.toFixed(1)}%)</span>
                      </div>
                    </div>
                    {/* Multi-segment bar: Fuel vs Repair */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${dept.total > 0 ? (dept.fuel / dept.total) * 100 : 0}%` }}
                        className="bg-emerald-500 h-full"
                        title={`น้ำมัน: ฿${formatCurrency(dept.fuel)}`}
                      />
                      <div
                        style={{ width: `${dept.total > 0 ? (dept.repair / dept.total) * 100 : 0}%` }}
                        className="bg-amber-500 h-full"
                        title={`ซ่อมแซม: ฿${formatCurrency(dept.repair)}`}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>น้ำมัน: ฿{formatCurrency(dept.fuel)}</span>
                      <span>ซ่อม: ฿{formatCurrency(dept.repair)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => onNavigateTab('fuel')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              พิมพ์สรุปการเบิกจ่ายแยกกอง <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Top Costliest Vehicles Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              ยานพาหนะและเครื่องจักรที่มีค่าใช้จ่ายสูงสุด 5 อันดับแรก
            </h2>
            <p className="text-xs text-slate-500">
              ตรวจสอบค่าน้ำมัน ค่าซ่อมแซม และประสิทธิภาพการใช้งาน ปีงบประมาณ {selectedFiscalYear}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('analytics')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            วิเคราะห์อัตราสิ้นเปลืองทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">ยานพาหนะ / ทะเบียน</th>
                <th className="py-3 px-4">กอง / สำนัก</th>
                <th className="py-3 px-4">ผู้รับผิดชอบ</th>
                <th className="py-3 px-4 text-right">ค่าน้ำมัน (บาท)</th>
                <th className="py-3 px-4 text-right">ค่าซ่อมแซม (บาท)</th>
                <th className="py-3 px-4 text-right">รวมทั้งสิ้น (บาท)</th>
                <th className="py-3 px-4 text-center">อัตราสิ้นเปลือง</th>
                <th className="py-3 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topCostVehicles.length > 0 ? (
                topCostVehicles.map(({ vehicle, fuel, repair, total, distance, liters }) => {
                  const efficiency = liters > 0 ? (distance / liters).toFixed(2) : '-';
                  return (
                    <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{vehicle.name}</div>
                        <div className="text-slate-500 font-mono">
                          {vehicle.plateNumber !== '-' ? vehicle.plateNumber : `ครุภัณฑ์: ${vehicle.assetCode}`}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{vehicle.department}</td>
                      <td className="py-3 px-4 text-slate-700">{vehicle.driverName}</td>
                      <td className="py-3 px-4 text-right font-medium text-slate-900 tabular-nums">
                        ฿{formatCurrency(fuel)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-900 tabular-nums">
                        ฿{formatCurrency(repair)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-blue-900 tabular-nums">
                        ฿{formatCurrency(total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-medium text-slate-800">
                          {efficiency} {vehicle.odometerUnit}/ลิตร
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onSelectVehicle(vehicle)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        >
                          ดูประวัติ
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    ไม่พบข้อมูลค่าใช้จ่ายในปีงบประมาณนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Repairs with Quick Print "แบบ 6" */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              ประวัติขออนุมัติซ่อมแซมล่าสุด (เอกสารแบบ 6)
            </h2>
            <p className="text-xs text-slate-500">
              กดพิมพ์ใบเสนอขออนุมัติซ่อมพัสดุ (แบบ 6) หรือดูรายละเอียดได้ทันที
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('repairs')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {repairs.slice(0, 3).map((rep) => (
            <div
              key={rep.id}
              className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                    {rep.formNumber}
                  </span>
                  <span className="text-slate-500">{rep.date}</span>
                </div>
                <div className="font-bold text-sm text-slate-900 mb-0.5">
                  {rep.vehicleName}
                </div>
                <div className="text-xs text-slate-500 mb-2">
                  {rep.vehiclePlate !== '-' ? rep.vehiclePlate : rep.department}
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                  {rep.damageSymptoms}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">ยอดเงินรวม</span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">
                    ฿{formatCurrency(rep.totalCost)}
                  </span>
                </div>
                <button
                  onClick={() => onOpenRepairForm6(rep)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md flex items-center gap-1 shadow-2xs"
                >
                  <Wrench className="w-3.5 h-3.5" /> พิมพ์แบบ 6
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
