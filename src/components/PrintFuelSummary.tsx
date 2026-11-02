import React from 'react';
import { FuelLog, SystemSettings } from '../types';
import { formatThaiDate, thaiBahtText, formatCurrency, formatNumber, THAI_MONTHS_FULL } from '../utils/thaiDate';
import { MunicipalSeal } from './MunicipalSeal';
import { Printer, ArrowLeft } from 'lucide-react';

interface PrintFuelSummaryProps {
  logs: FuelLog[];
  settings: SystemSettings;
  month: string; // '10', '11', 'all', etc.
  fiscalYear: number;
  department: string;
  fuelCategory: string;
  onBack: () => void;
}

export const PrintFuelSummary: React.FC<PrintFuelSummaryProps> = ({
  logs,
  settings,
  month,
  fiscalYear,
  department,
  fuelCategory,
  onBack,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const monthLabel = month === 'all'
    ? `ทั้งปีงบประมาณ พ.ศ. ${fiscalYear}`
    : `เดือน ${THAI_MONTHS_FULL[parseInt(month, 10) - 1]} พ.ศ. ${fiscalYear}`;

  const deptLabel = department === 'all' ? 'ทุกกอง / สำนัก' : department;
  const fuelLabel = fuelCategory === 'all' ? 'ทุกประเภทน้ำมัน (ดีเซลและเบนซิน)' : `เฉพาะกลุ่มน้ำมัน${fuelCategory}`;

  // Totals
  const totalLiters = logs.reduce((sum, l) => sum + l.liters, 0);
  const totalCost = logs.reduce((sum, l) => sum + l.totalCost, 0);

  const dieselLogs = logs.filter(l => l.fuelCategory === 'ดีเซล');
  const dieselLiters = dieselLogs.reduce((sum, l) => sum + l.liters, 0);
  const dieselCost = dieselLogs.reduce((sum, l) => sum + l.totalCost, 0);

  const petrolLogs = logs.filter(l => l.fuelCategory === 'เบนซิน');
  const petrolLiters = petrolLogs.reduce((sum, l) => sum + l.liters, 0);
  const petrolCost = petrolLogs.reduce((sum, l) => sum + l.totalCost, 0);

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้ารายการน้ำมัน</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            เอกสารสรุปเบิกจ่ายน้ำมันพร้อมพิมพ์ (A4)
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงานสรุปน้ำมัน (A4)</span>
          </button>
        </div>
      </div>

      {/* Printable Document */}
      <div className="printable-document bg-white p-8 max-w-[297mm] mx-auto border border-slate-300 shadow-lg text-black font-sarabun text-[13pt] leading-normal print:p-0 print:border-none print:shadow-none print:max-w-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-3">
          <div className="flex items-center gap-3">
            <MunicipalSeal size={56} className="shrink-0" />
            <div>
              <div className="text-[17pt] font-bold">
                {settings.municipalityName}
              </div>
              <div className="text-[12pt] text-slate-700 print:text-black">
                {settings.province}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[15pt] font-bold">
              ใบสรุปการเบิกจ่ายน้ำมันเชื้อเพลิงและหล่อลื่น
            </div>
            <div className="text-[12pt]">
              ประจำ: <strong>{monthLabel}</strong>
            </div>
          </div>
        </div>

        {/* Filter subheader info */}
        <div className="flex justify-between text-[12pt] mb-3 bg-slate-50 print:bg-transparent p-2 border border-black/20 rounded">
          <div>
            <strong>สังกัด:</strong> {deptLabel}
          </div>
          <div>
            <strong>ประเภทน้ำมัน:</strong> {fuelLabel}
          </div>
          <div>
            <strong>ปีงบประมาณ:</strong> พ.ศ. {fiscalYear}
          </div>
        </div>

        {/* Table of Fuel Logs */}
        <div className="overflow-x-auto border border-black my-3">
          <table className="w-full text-left text-[11.5pt] border-collapse">
            <thead>
              <tr className="border-b border-black bg-slate-100 print:bg-transparent font-bold text-center">
                <th className="py-1 px-1.5 border-r border-black w-10">ลำดับ</th>
                <th className="py-1 px-2 border-r border-black w-24">วันที่</th>
                <th className="py-1 px-2 border-r border-black w-28">เลขที่ใบสั่ง/บิล</th>
                <th className="py-1 px-2 border-r border-black">ยานพาหนะ / ทะเบียน</th>
                <th className="py-1 px-2 border-r border-black w-24">สังกัด</th>
                <th className="py-1 px-2 border-r border-black w-20">ชนิด</th>
                <th className="py-1 px-2 border-r border-black text-right w-16">ลิตร</th>
                <th className="py-1 px-2 border-r border-black text-right w-16">ราคา/ล.</th>
                <th className="py-1 px-2 border-r border-black text-right w-24">เงิน (บาท)</th>
                <th className="py-1 px-2 border-r border-black text-right w-16">ระยะ (กม.)</th>
                <th className="py-1 px-2 border-r border-black">ภารกิจ / งานที่ปฏิบัติ</th>
                <th className="py-1 px-2 w-28">ผู้ขอเบิก</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log.id} className="border-b border-black/30">
                  <td className="py-1 px-1.5 border-r border-black text-center">{index + 1}</td>
                  <td className="py-1 px-2 border-r border-black text-center">{formatThaiDate(log.date, 'short')}</td>
                  <td className="py-1 px-2 border-r border-black font-mono text-[10.5pt]">{log.invoiceNumber}</td>
                  <td className="py-1 px-2 border-r border-black">
                    <span className="font-semibold">{log.vehicleName}</span>{' '}
                    <span className="text-[10pt] font-mono">({log.vehiclePlate})</span>
                  </td>
                  <td className="py-1 px-2 border-r border-black text-center">{log.department}</td>
                  <td className="py-1 px-2 border-r border-black text-center text-[10.5pt]">{log.fuelType}</td>
                  <td className="py-1 px-2 border-r border-black text-right font-mono">{log.liters.toFixed(2)}</td>
                  <td className="py-1 px-2 border-r border-black text-right font-mono">{log.pricePerLiter.toFixed(2)}</td>
                  <td className="py-1 px-2 border-r border-black text-right font-mono font-bold">
                    {formatCurrency(log.totalCost)}
                  </td>
                  <td className="py-1 px-2 border-r border-black text-right font-mono">{log.distanceOrHours}</td>
                  <td className="py-1 px-2 border-r border-black text-[10.5pt] truncate max-w-[180px]" title={log.purpose}>
                    {log.purpose}
                  </td>
                  <td className="py-1 px-2 text-[10.5pt]">{log.driverName}</td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-6 text-center text-slate-500">
                    ไม่พบรายการเบิกจ่ายน้ำมันตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              )}

              {/* Subtotal Row Diesel */}
              <tr className="border-t-2 border-black bg-blue-50/40 print:bg-transparent font-semibold">
                <td colSpan={6} className="py-1 px-3 border-r border-black text-right">
                  รวมเฉพาะน้ำมันดีเซล:
                </td>
                <td className="py-1 px-2 border-r border-black text-right font-mono">
                  {dieselLiters.toFixed(2)}
                </td>
                <td className="py-1 px-2 border-r border-black"></td>
                <td className="py-1 px-2 border-r border-black text-right font-mono font-bold">
                  {formatCurrency(dieselCost)}
                </td>
                <td colSpan={3} className="py-1 px-2 text-[10.5pt] text-slate-600 print:text-black">
                  บาท ({dieselLogs.length} รายการ)
                </td>
              </tr>

              {/* Subtotal Row Petrol */}
              <tr className="border-b border-black bg-emerald-50/40 print:bg-transparent font-semibold">
                <td colSpan={6} className="py-1 px-3 border-r border-black text-right">
                  รวมเฉพาะกลุ่มเบนซิน/แก๊สโซฮอล์:
                </td>
                <td className="py-1 px-2 border-r border-black text-right font-mono">
                  {petrolLiters.toFixed(2)}
                </td>
                <td className="py-1 px-2 border-r border-black"></td>
                <td className="py-1 px-2 border-r border-black text-right font-mono font-bold">
                  {formatCurrency(petrolCost)}
                </td>
                <td colSpan={3} className="py-1 px-2 text-[10.5pt] text-slate-600 print:text-black">
                  บาท ({petrolLogs.length} รายการ)
                </td>
              </tr>

              {/* Grand Total */}
              <tr className="border-t-2 border-black bg-slate-100 print:bg-transparent font-bold text-[12.5pt]">
                <td colSpan={6} className="py-1.5 px-3 border-r border-black text-center">
                  (ตัวอักษร) : {thaiBahtText(totalCost)}
                </td>
                <td className="py-1.5 px-2 border-r border-black text-right font-mono text-[13pt]">
                  {totalLiters.toFixed(2)}
                </td>
                <td className="py-1.5 px-2 border-r border-black text-right">
                  รวมเงิน
                </td>
                <td className="py-1.5 px-2 border-r border-black text-right font-mono text-[13pt]">
                  {formatCurrency(totalCost)}
                </td>
                <td colSpan={3} className="py-1.5 px-2">
                  บาทถ้วน
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 4 Official Signature Blocks for Fuel Audit */}
        <div className="grid grid-cols-4 gap-4 mt-8 pt-4 border-t border-black/30 text-[11pt]">
          <div className="text-center space-y-1">
            <div>(ลงชื่อ)......................................................</div>
            <div>(......................................................)</div>
            <div className="font-medium">เจ้าหน้าที่ผู้รวบรวมหลักฐาน</div>
            <div>วันที่ ....../....../...........</div>
          </div>

          <div className="text-center space-y-1">
            <div>(ลงชื่อ)......................................................</div>
            <div>(......................................................)</div>
            <div className="font-medium">ผู้อำนวยการกอง / หัวหน้าหน่วยงาน</div>
            <div>วันที่ ....../....../...........</div>
          </div>

          <div className="text-center space-y-1">
            <div>(ลงชื่อ)......................................................</div>
            <div>({settings.procurementHead})</div>
            <div className="font-medium">หัวหน้าเจ้าหน้าที่พัสดุ</div>
            <div>วันที่ ....../....../...........</div>
          </div>

          <div className="text-center space-y-1">
            <div>(ลงชื่อ)......................................................</div>
            <div>({settings.mayorName})</div>
            <div className="font-medium">นายกเทศมนตรีตำบลพระซอง</div>
            <div>วันที่ ....../....../...........</div>
          </div>
        </div>

        <div className="mt-6 pt-2 text-[9.5pt] text-slate-500 print:text-black flex justify-between">
          <span>ระบบคุมรถยนต์และเครื่องจักร เทศบาลตำบลพระซอง</span>
          <span>เอกสารตรวจสอบการเบิกจ่ายงบประมาณค่าน้ำมันเชื้อเพลิง</span>
        </div>
      </div>
    </div>
  );
};
