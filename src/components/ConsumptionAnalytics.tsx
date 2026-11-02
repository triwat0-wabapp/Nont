import React, { useState, useMemo } from 'react';
import { Vehicle, FuelLog, Department, VehicleCategory } from '../types';
import { formatCurrency, formatNumber } from '../utils/thaiDate';
import { Gauge, AlertTriangle, CheckCircle, TrendingUp, Info, HelpCircle } from 'lucide-react';

interface ConsumptionAnalyticsProps {
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export const ConsumptionAnalytics: React.FC<ConsumptionAnalyticsProps> = ({
  vehicles,
  fuelLogs,
  onSelectVehicle,
}) => {
  // Available fiscal years
  const availableYears = useMemo(() => {
    const years = new Set<number>([2568, 2567]);
    fuelLogs.forEach(f => years.add(f.fiscalYear));
    return Array.from(years).sort((a, b) => b - a);
  }, [fuelLogs]);

  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(availableYears[0] || 2568);
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory | 'all'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Filter logs by fiscal year
  const yearLogs = useMemo(() => {
    return fuelLogs.filter(f => f.fiscalYear === selectedFiscalYear);
  }, [fuelLogs, selectedFiscalYear]);

  // Compute consumption data per vehicle
  const vehicleStats = useMemo(() => {
    return vehicles
      .filter(v => {
        const matchCat = selectedCategory === 'all' || v.category === selectedCategory;
        const matchDept = selectedDepartment === 'all' || v.department === selectedDepartment;
        return matchCat && matchDept;
      })
      .map(v => {
        const logsForVehicle = yearLogs.filter(f => f.vehicleId === v.id);
        const totalLiters = logsForVehicle.reduce((acc, curr) => acc + curr.liters, 0);
        const totalCost = logsForVehicle.reduce((acc, curr) => acc + curr.totalCost, 0);
        const totalDistanceOrHours = logsForVehicle.reduce((acc, curr) => acc + curr.distanceOrHours, 0);

        const kmPerLiter = totalLiters > 0 ? totalDistanceOrHours / totalLiters : 0;
        const costPerUnit = totalDistanceOrHours > 0 ? totalCost / totalDistanceOrHours : 0;

        // Normal benchmark criteria based on category
        let standardMin = 8;
        let standardMax = 14;
        let unitText = 'กม./ลิตร';

        if (v.category === 'special_truck') {
          standardMin = 2.5;
          standardMax = 5.5;
        } else if (v.category === 'machinery') {
          standardMin = 0.8;
          standardMax = 2.0;
          unitText = 'ชม./ลิตร';
        } else if (v.category === 'equipment') {
          standardMin = 1.0;
          standardMax = 2.5;
          unitText = 'ชม./ลิตร';
        }

        let status: 'normal' | 'efficient' | 'high_consumption' | 'no_data' = 'normal';
        let statusText = 'ปกติ';

        if (totalLiters === 0) {
          status = 'no_data';
          statusText = 'ยังไม่มีข้อมูลเบิกน้ำมัน';
        } else if (kmPerLiter < standardMin) {
          status = 'high_consumption';
          statusText = 'สิ้นเปลืองสูงกว่าเกณฑ์';
        } else if (kmPerLiter > standardMax) {
          status = 'efficient';
          statusText = 'ประหยัดน้ำมันดี';
        } else {
          status = 'normal';
          statusText = 'อยู่ในเกณฑ์มาตรฐาน';
        }

        return {
          vehicle: v,
          logsCount: logsForVehicle.length,
          totalLiters,
          totalCost,
          totalDistanceOrHours,
          kmPerLiter,
          costPerUnit,
          unitText,
          standardMin,
          standardMax,
          status,
          statusText,
        };
      })
      .sort((a, b) => b.totalLiters - a.totalLiters);
  }, [vehicles, yearLogs, selectedCategory, selectedDepartment]);

  // Overview metrics
  const totalFleetLiters = vehicleStats.reduce((sum, v) => sum + v.totalLiters, 0);
  const totalFleetDistance = vehicleStats.reduce((sum, v) => sum + v.totalDistanceOrHours, 0);
  const totalFleetCost = vehicleStats.reduce((sum, v) => sum + v.totalCost, 0);
  const averageFleetKmPerL = totalFleetLiters > 0 ? (totalFleetDistance / totalFleetLiters).toFixed(2) : '0';
  const alertCount = vehicleStats.filter(v => v.status === 'high_consumption').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            คำนวณอัตราสิ้นเปลืองน้ำมันเชื้อเพลิง (กม./ลิตร)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            วิเคราะห์ประสิทธิภาพการใช้เชื้อเพลิงรายคัน ต่อปีงบประมาณ เทศบาลตำบลพระซอง
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">ปีงบประมาณ:</span>
          <select
            value={selectedFiscalYear}
            onChange={(e) => setSelectedFiscalYear(Number(e.target.value))}
            className="text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white font-bold text-blue-700 outline-none"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>พ.ศ. {y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            ระยะทาง/ชม. สะสมทั้งปีงบ
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {formatNumber(totalFleetDistance)} <span className="text-sm font-normal text-slate-500">กม./ชม.</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            ใช้น้ำมันรวม {formatNumber(Math.round(totalFleetLiters))} ลิตร
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            อัตราสิ้นเปลืองเฉลี่ยทั้งฝูง
          </span>
          <div className="text-2xl font-bold text-blue-900 mt-1 tabular-nums font-mono">
            {averageFleetKmPerL} <span className="text-sm font-normal text-slate-500 font-sans">กม./ลิตร</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            คำนวณจากทุกคันที่มีบันทึกเลขไมล์
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            ต้นทุนเชื้อเพลิงเฉลี่ย
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            ฿{totalFleetDistance > 0 ? (totalFleetCost / totalFleetDistance).toFixed(2) : '0'} <span className="text-sm font-normal text-slate-500">/กม.</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            งบประมาณรวม ฿{formatCurrency(totalFleetCost)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            แจ้งเตือนความผิดปกติ
          </span>
          <div className={`text-2xl font-bold mt-1 tabular-nums ${alertCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {alertCount} <span className="text-sm font-normal text-slate-500">คัน/เครื่อง</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {alertCount > 0 ? 'สิ้นเปลืองสูงกว่าเกณฑ์มาตรฐาน' : 'ทุกคันอยู่ในเกณฑ์ปกติ'}
          </div>
        </div>
      </div>

      {/* Filter and benchmark info */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="text-xs py-2 px-3 border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="all">ทุกประเภทพัสดุ</option>
            <option value="car">รถยนต์ส่วนกลาง / ตู้ / กระบะ</option>
            <option value="special_truck">รถเฉพาะกิจ (น้ำ/ขยะ/ดับเพลิง)</option>
            <option value="machinery">เครื่องจักรกลหนัก</option>
            <option value="equipment">เครื่องมือ (ตัดหญ้า/พ่นยุง/สูบน้ำ)</option>
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
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5 bg-blue-50/70 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-100">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>เกณฑ์มาตรฐานราชการ: รถยนต์ 8-14 กม./ลิตร | รถบรรทุกหนัก 3-5 กม./ลิตร</span>
        </div>
      </div>

      {/* Table of Vehicle Fuel Consumption */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">ยานพาหนะ / ทะเบียน</th>
                <th className="py-3 px-4">กอง / สำนัก</th>
                <th className="py-3 px-4">เชื้อเพลิง</th>
                <th className="py-3 px-4 text-right">จำนวนครั้งที่เติม</th>
                <th className="py-3 px-4 text-right">รวมน้ำมัน (ลิตร)</th>
                <th className="py-3 px-4 text-right">ระยะทาง/ชม. สะสม</th>
                <th className="py-3 px-4 text-center">อัตราสิ้นเปลือง</th>
                <th className="py-3 px-4 text-right">ต้นทุน/หน่วย</th>
                <th className="py-3 px-4 text-center">สถานะการประเมิน</th>
                <th className="py-3 px-4 text-center">ประวัติ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicleStats.map((item) => {
                const { vehicle, totalLiters, totalDistanceOrHours, kmPerLiter, costPerUnit, unitText, status, statusText } = item;
                return (
                  <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{vehicle.name}</div>
                      <div className="text-slate-500 font-mono">
                        {vehicle.plateNumber !== '-' ? vehicle.plateNumber : `ครุภัณฑ์ ${vehicle.assetCode}`}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{vehicle.department}</td>
                    <td className="py-3 px-4 text-slate-700">{vehicle.fuelType}</td>
                    <td className="py-3 px-4 text-right font-medium tabular-nums">{item.logsCount} ครั้ง</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                      {formatNumber(Math.round(totalLiters * 100) / 100)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900 tabular-nums">
                      {formatNumber(totalDistanceOrHours)} {vehicle.odometerUnit}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {totalLiters > 0 ? (
                        <span className="font-mono text-sm font-bold text-blue-800">
                          {kmPerLiter.toFixed(2)} <span className="text-[10px] font-normal text-slate-500">{unitText}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700 tabular-nums">
                      {totalDistanceOrHours > 0 ? `฿${costPerUnit.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          status === 'normal'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : status === 'efficient'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : status === 'high_consumption'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {status === 'normal' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                        {status === 'high_consumption' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {statusText}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onSelectVehicle(vehicle)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 rounded transition-colors"
                      >
                        ดูข้อมูล
                      </button>
                    </td>
                  </tr>
                );
              })}

              {vehicleStats.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    ไม่พบข้อมูลตามตัวกรองที่เลือก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guidelines Note */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs text-slate-600">
        <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          คำแนะนำการคำนวณและเกณฑ์การตรวจรับพัสดุ (อปท.)
        </h4>
        <ul className="list-disc list-inside space-y-1 text-slate-600">
          <li><strong>สูตรการคำนวณ:</strong> อัตราสิ้นเปลือง (กม./ลิตร) = ระยะทางที่วิ่งได้ในรอบเติม (กิโลเมตร) ÷ ปริมาณน้ำมันที่เติม (ลิตร)</li>
          <li><strong>เครื่องตัดหญ้าและเครื่องจักรกล:</strong> ใช้การคำนวณเป็น ชั่วโมงการทำงานต่อลิตร (ชม./ลิตร)</li>
          <li><strong>การแจ้งเตือนสิ้นเปลืองสูง:</strong> หากพบอัตราสิ้นเปลืองต่ำกว่าเกณฑ์มาตรฐานเป็นประจำ ให้ช่างผู้ตรวจสภาพตรวจสอบระบบหัวฉีด กรองอากาศ ไส้กรองน้ำมัน หรือการรั่วไหลของเชื้อเพลิง</li>
        </ul>
      </div>
    </div>
  );
};
