import React from 'react';
import { Vehicle, FuelLog, RepairRecord } from '../types';
import { formatCurrency, formatNumber, formatThaiDate } from '../utils/thaiDate';
import { X, Truck, Fuel, Wrench, Paperclip, Download, Printer, Calendar, User, Gauge } from 'lucide-react';

interface VehicleDetailModalProps {
  vehicle: Vehicle;
  fuelLogs: FuelLog[];
  repairs: RepairRecord[];
  onClose: () => void;
  onOpenForm6: (repair: RepairRecord) => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  fuelLogs,
  repairs,
  onClose,
  onOpenForm6,
}) => {
  const [activeTab, setActiveTab] = React.useState<'info' | 'fuel' | 'repairs'>('info');

  // Specific logs
  const vehicleFuel = fuelLogs.filter(f => f.vehicleId === vehicle.id);
  const vehicleRepairs = repairs.filter(r => r.vehicleId === vehicle.id);

  const totalFuelCost = vehicleFuel.reduce((sum, f) => sum + f.totalCost, 0);
  const totalFuelLiters = vehicleFuel.reduce((sum, f) => sum + f.liters, 0);
  const totalRepairCost = vehicleRepairs.reduce((sum, r) => sum + r.totalCost, 0);
  const totalDistance = vehicleFuel.reduce((sum, f) => sum + f.distanceOrHours, 0);
  const avgEfficiency = totalFuelLiters > 0 ? (totalDistance / totalFuelLiters).toFixed(2) : '-';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl text-blue-300">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{vehicle.name}</h2>
                <span className="font-mono text-xs bg-blue-600/60 text-white px-2 py-0.5 rounded font-semibold">
                  {vehicle.plateNumber !== '-' ? vehicle.plateNumber : `ครุภัณฑ์ ${vehicle.assetCode}`}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {vehicle.brandModel} · {vehicle.department}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-slate-50 border-b border-slate-200 shrink-0 text-xs">
          <div>
            <span className="text-slate-400 block">เลขไมล์/ชม. ล่าสุด</span>
            <span className="font-mono text-base font-bold text-slate-900">
              {formatNumber(vehicle.currentOdometer)} {vehicle.odometerUnit}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">รวมค่าน้ำมัน ({vehicleFuel.length} ครั้ง)</span>
            <span className="text-base font-bold text-emerald-700">
              ฿{formatCurrency(totalFuelCost)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">รวมค่าซ่อม ({vehicleRepairs.length} ครั้ง)</span>
            <span className="text-base font-bold text-amber-700">
              ฿{formatCurrency(totalRepairCost)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">อัตราสิ้นเปลืองเฉลี่ย</span>
            <span className="font-mono text-base font-bold text-blue-700">
              {avgEfficiency} {vehicle.odometerUnit}/ลิตร
            </span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ข้อมูลทั่วไปและเล่มทะเบียน
          </button>
          <button
            onClick={() => setActiveTab('fuel')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'fuel'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>ประวัติเบิกน้ำมัน ({vehicleFuel.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('repairs')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'repairs'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>ประวัติการซ่อมบำรุง แบบ 6 ({vehicleRepairs.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2">
                    ข้อมูลทางทะเบียนและตัวรถ
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">หมายเลขทะเบียน:</span>
                    <strong className="text-slate-900 font-mono">{vehicle.plateNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">หมายเลขครุภัณฑ์:</span>
                    <strong className="text-slate-900 font-mono">{vehicle.assetCode}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ยี่ห้อ / รุ่น:</span>
                    <strong className="text-slate-900">{vehicle.brandModel}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">หมายเลขตัวถัง (แชสซี):</span>
                    <span className="text-slate-900 font-mono">{vehicle.chassisNumber || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">หมายเลขเครื่องยนต์:</span>
                    <span className="text-slate-900 font-mono">{vehicle.engineNumber || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ปีที่ได้มา (พ.ศ.):</span>
                    <span className="text-slate-900">{vehicle.purchaseYear}</span>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2">
                    สังกัดและการใช้งาน
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">กอง / สำนัก:</span>
                    <strong className="text-slate-900">{vehicle.department}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ผู้รับผิดชอบ / พนักงานขับ:</span>
                    <strong className="text-slate-900">{vehicle.driverName || '-'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ชนิดเชื้อเพลิงหลัก:</span>
                    <strong className="text-slate-900">{vehicle.fuelType}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">สถานะปัจจุบัน:</span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-semibold">
                      {vehicle.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">หมายเหตุ:</span>
                    <span className="text-slate-700 text-right max-w-[200px]">{vehicle.notes || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Attached Registration Book */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-2">
                  เอกสารคู่มือ / เล่มทะเบียนที่แนบไว้
                </h4>
                {vehicle.registrationFile ? (
                  <div className="flex items-center justify-between p-3 bg-white border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-2.5">
                      <Paperclip className="w-5 h-5 text-emerald-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {vehicle.registrationFile.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {(vehicle.registrationFile.size / 1024).toFixed(1)} KB · แนบเมื่อ {formatThaiDate(vehicle.registrationFile.uploadedAt)}
                        </div>
                      </div>
                    </div>

                    <a
                      href={vehicle.registrationFile.dataUrl}
                      download={vehicle.registrationFile.name}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ดาวน์โหลดไฟล์</span>
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    ยังไม่มีการแนบไฟล์เล่มทะเบียนในระบบ (สามารถแก้ไขและแนบไฟล์ PDF หรือรูปภาพได้)
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'fuel' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">วันที่</th>
                      <th className="py-2.5 px-3">เลขที่ใบสั่ง/บิล</th>
                      <th className="py-2.5 px-3 text-right">ลิตร</th>
                      <th className="py-2.5 px-3 text-right">ราคา/ลิตร</th>
                      <th className="py-2.5 px-3 text-right">จำนวนเงิน</th>
                      <th className="py-2.5 px-3 text-right">ระยะทาง (กม.)</th>
                      <th className="py-2.5 px-3 text-center">กม./ลิตร</th>
                      <th className="py-2.5 px-3">ภารกิจ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehicleFuel.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-700">{f.date}</td>
                        <td className="py-2.5 px-3 font-mono">{f.invoiceNumber}</td>
                        <td className="py-2.5 px-3 text-right font-medium tabular-nums">{f.liters.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600 tabular-nums">{f.pricePerLiter.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">฿{formatCurrency(f.totalCost)}</td>
                        <td className="py-2.5 px-3 text-right font-medium tabular-nums">{f.distanceOrHours}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-700">{f.kmPerLiter ? f.kmPerLiter.toFixed(2) : '-'}</td>
                        <td className="py-2.5 px-3 text-slate-600 truncate max-w-[160px]">{f.purpose || '-'}</td>
                      </tr>
                    ))}
                    {vehicleFuel.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          ยังไม่มีประวัติการเบิกจ่ายน้ำมันของยานพาหนะนี้
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'repairs' && (
            <div className="space-y-4">
              {vehicleRepairs.map(rep => (
                <div key={rep.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded">
                        {rep.formNumber}
                      </span>
                      <span className="text-xs text-slate-500">{formatThaiDate(rep.date)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-blue-900">
                        ฿{formatCurrency(rep.totalCost)}
                      </span>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenForm6(rep);
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md shadow-2xs"
                      >
                        <Printer className="w-3.5 h-3.5" /> พิมพ์แบบ 6
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700">
                    <strong>อาการชำรุด:</strong> {rep.damageSymptoms}
                  </p>

                  <div className="text-xs text-slate-600">
                    <span className="font-semibold block mb-1">รายการอะไหล่และค่าแรง ({rep.items.length} รายการ):</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                      {rep.items.map(it => (
                        <li key={it.id}>
                          {it.name} ({it.quantity} {it.unit} @ ฿{formatCurrency(it.unitPrice)} = ฿{formatCurrency(it.totalPrice)})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}

              {vehicleRepairs.length === 0 && (
                <p className="py-8 text-center text-xs text-slate-400">
                  ยังไม่มีประวัติการซ่อมบำรุงของยานพาหนะนี้
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
