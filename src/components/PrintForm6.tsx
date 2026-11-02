import React from 'react';
import { RepairRecord, SystemSettings } from '../types';
import { formatThaiDate, thaiBahtText, formatCurrency } from '../utils/thaiDate';
import { MunicipalSeal } from './MunicipalSeal';
import { Printer, ArrowLeft } from 'lucide-react';

interface PrintForm6Props {
  repair: RepairRecord;
  settings: SystemSettings;
  onBack: () => void;
}

export const PrintForm6: React.FC<PrintForm6Props> = ({ repair, settings, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action Bar (hidden when printing) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้ารายการซ่อม</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            เอกสารพร้อมพิมพ์ A4 ตามระเบียบงานสารบรรณและพัสดุ อปท.
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์ "แบบ 6" (A4)</span>
          </button>
        </div>
      </div>

      {/* Official Thai Government "แบบ 6" Printable Document */}
      <div className="printable-document bg-white p-8 sm:p-12 max-w-[210mm] mx-auto border border-slate-300 shadow-lg text-black font-sarabun text-[14pt] leading-normal print:p-0 print:border-none print:shadow-none print:max-w-none">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-4">
          <div className="flex items-center gap-3">
            <MunicipalSeal size={65} className="shrink-0" />
            <div>
              <div className="text-[18pt] font-bold tracking-tight">
                {settings.municipalityName}
              </div>
              <div className="text-[13pt] text-slate-700 print:text-black">
                {settings.province}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[18pt] font-extrabold border-2 border-black px-4 py-1 inline-block">
              แบบ 6
            </div>
            <div className="text-[12pt] font-semibold mt-1">
              เลขที่เอกสาร: <span className="font-mono">{repair.formNumber}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center font-bold text-[16pt] my-2 underline">
          รายงานขอจ้างซ่อมแซมครุภัณฑ์ยานพาหนะและขนส่ง / เครื่องจักรกล
        </div>

        {/* Header Metadata */}
        <div className="space-y-1.5 my-3 text-[13.5pt]">
          <div className="flex justify-between">
            <div>
              <strong>ส่วนราชการ:</strong> {repair.department} {settings.municipalityName}
            </div>
            <div>
              <strong>วันที่:</strong> {formatThaiDate(repair.date, 'official')}
            </div>
          </div>

          <div className="flex justify-between">
            <div>
              <strong>เรื่อง:</strong> ขออนุมัติจัดจ้างซ่อมแซมและจัดซื้ออะไหล่ยานพาหนะ/เครื่องจักรกล
            </div>
            <div>
              <strong>ปีงบประมาณ:</strong> พ.ศ. {repair.fiscalYear}
            </div>
          </div>

          <div>
            <strong>เรียน:</strong> นายกเทศมนตรีตำบลพระซอง (ผ่านหัวหน้าเจ้าหน้าที่พัสดุ)
          </div>
        </div>

        {/* Body Paragraph */}
        <div className="my-3 text-[13.5pt] indent-10 text-justify">
          ด้วย <strong>{repair.vehicleName}</strong> หมายเลขทะเบียน/รหัสครุภัณฑ์{' '}
          <strong>{repair.vehiclePlate !== '-' ? repair.vehiclePlate : '-'}</strong> สังกัด{' '}
          <strong>{repair.department}</strong> โดยมี <strong>{repair.requestedBy}</strong> เป็นผู้ควบคุม/พนักงานขับ
          ได้เกิดการชำรุดเสียหายจากการปฏิบัติหน้าที่ราชการ ณ เลขไมล์/ชั่วโมงการทำงาน{' '}
          <strong>{repair.odometer ? repair.odometer.toLocaleString('th-TH') : '-'}</strong> มีอาการชำรุด ดังนี้:
        </div>

        <div className="bg-slate-50 print:bg-transparent p-2.5 my-2 border border-black/30 rounded text-[13pt]">
          <strong>อาการชำรุดและความจำเป็น:</strong> {repair.damageSymptoms}
        </div>

        <div className="my-2 text-[13.5pt] indent-10">
          เพื่อให้ยานพาหนะ/เครื่องจักรกลดังกล่าว สามารถใช้งานในราชการบริการประชาชนได้อย่างมีประสิทธิภาพและปลอดภัย
          จึงขออนุมัติจัดจ้างซ่อมแซม ณ <strong>{repair.workshopName}</strong> โดยมีรายการและประมาณการค่าใช้จ่ายดังนี้
        </div>

        {/* Itemized Table Breakdown (แยกทุกรายการและราคา) */}
        <div className="my-4 overflow-hidden border border-black">
          <table className="w-full text-left text-[12.5pt] border-collapse">
            <thead>
              <tr className="border-b border-black bg-slate-100 print:bg-transparent font-bold text-center">
                <th className="py-1 px-2 border-r border-black w-12">ลำดับ</th>
                <th className="py-1 px-3 border-r border-black">รายการซ่อม / อะไหล่ / ค่าแรง</th>
                <th className="py-1 px-2 border-r border-black w-20">จำนวน</th>
                <th className="py-1 px-2 border-r border-black w-24">หน่วยนับ</th>
                <th className="py-1 px-3 border-r border-black w-28 text-right">ราคา/หน่วย (บาท)</th>
                <th className="py-1 px-3 text-right w-32">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody>
              {repair.items.map((item, index) => (
                <tr key={item.id} className="border-b border-black/30">
                  <td className="py-1 px-2 border-r border-black text-center">{index + 1}</td>
                  <td className="py-1 px-3 border-r border-black font-medium">{item.name}</td>
                  <td className="py-1 px-2 border-r border-black text-center">{item.quantity}</td>
                  <td className="py-1 px-2 border-r border-black text-center">{item.unit}</td>
                  <td className="py-1 px-3 border-r border-black text-right font-mono">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-1 px-3 text-right font-mono font-bold">
                    {formatCurrency(item.totalPrice)}
                  </td>
                </tr>
              ))}

              {/* Empty rows filler for formal appearance if less than 5 items */}
              {Array.from({ length: Math.max(0, 5 - repair.items.length) }).map((_, idx) => (
                <tr key={`fill-${idx}`} className="border-b border-black/20">
                  <td className="py-1 px-2 border-r border-black text-center text-transparent">-</td>
                  <td className="py-1 px-3 border-r border-black text-transparent">-</td>
                  <td className="py-1 px-2 border-r border-black text-transparent">-</td>
                  <td className="py-1 px-2 border-r border-black text-transparent">-</td>
                  <td className="py-1 px-3 border-r border-black text-transparent">-</td>
                  <td className="py-1 px-3 text-transparent">-</td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="border-t-2 border-black font-bold">
                <td colSpan={4} className="py-1.5 px-3 border-r border-black text-center bg-slate-50 print:bg-transparent">
                  (ตัวอักษร) : {thaiBahtText(repair.totalCost)}
                </td>
                <td className="py-1.5 px-3 border-r border-black text-right">
                  รวมเป็นเงินทั้งสิ้น
                </td>
                <td className="py-1.5 px-3 text-right font-mono text-[14pt]">
                  {formatCurrency(repair.totalCost)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Technician Opinion */}
        <div className="my-3 text-[13pt] p-2 border border-black/40 rounded">
          <strong>ความเห็นของช่างผู้ตรวจสภาพ:</strong> {repair.technicianOpinion || 'ได้ตรวจสอบสภาพความชำรุดเสียหายแล้ว เห็นควรดำเนินการซ่อมแซมตามรายการที่เสนอข้างต้น'}
        </div>

        {/* 4 Official Signature Blocks */}
        <div className="grid grid-cols-2 gap-6 mt-6 pt-2 text-[12.5pt]">
          {/* Sign 1: Requester */}
          <div className="text-center space-y-1">
            <div>(ลงชื่อ)...........................................................ผู้ขออนุมัติ</div>
            <div>({repair.requestedBy || '...........................................................'})</div>
            <div className="text-slate-600 print:text-black text-[11.5pt]">ตำแหน่ง พนักงานขับรถ / ผู้ดูแลรักษา</div>
            <div className="text-[11.5pt]">วันที่ {formatThaiDate(repair.date, 'short')}</div>
          </div>

          {/* Sign 2: Mechanic */}
          <div className="text-center space-y-1">
            <div>(ลงชื่อ)...........................................................ผู้ตรวจสภาพ</div>
            <div>({settings.mechanicName || '...........................................................'})</div>
            <div className="text-slate-600 print:text-black text-[11.5pt]">ตำแหน่ง นายช่างเครื่องกล / ผู้ตรวจสภาพ</div>
            <div className="text-[11.5pt]">วันที่ {formatThaiDate(repair.date, 'short')}</div>
          </div>

          {/* Sign 3: Procurement Officer */}
          <div className="text-center space-y-1 mt-6">
            <div>(ลงชื่อ)...........................................................เจ้าหน้าที่พัสดุ</div>
            <div>({settings.procurementHead || '...........................................................'})</div>
            <div className="text-slate-600 print:text-black text-[11.5pt]">ตำแหน่ง หัวหน้าเจ้าหน้าที่พัสดุ</div>
            <div className="text-[11.5pt]">วันที่ {formatThaiDate(repair.date, 'short')}</div>
          </div>

          {/* Sign 4: Mayor Approval */}
          <div className="text-center space-y-1 mt-6 border border-black p-2 rounded">
            <div className="font-bold underline mb-1">คำสั่ง / การอนุมัติ</div>
            <div className="flex justify-center gap-4 text-[12pt] mb-1">
              <span>[ ✓ ] อนุมัติ</span>
              <span>[ &nbsp; ] ไม่อนุมัติ</span>
            </div>
            <div>(ลงชื่อ)...........................................................ผู้อนุมัติ</div>
            <div>({settings.mayorName || '...........................................................'})</div>
            <div className="font-semibold text-[12pt]">นายกเทศมนตรีตำบลพระซอง</div>
            <div className="text-[11.5pt]">วันที่ {formatThaiDate(repair.date, 'short')}</div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-2 border-t border-slate-300 text-[10pt] text-slate-500 print:text-slate-600 flex justify-between">
          <span>ระบบคุมรถยนต์ เทศบาลตำบลพระซอง (อปท.)</span>
          <span>เอกสารตามระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างฯ พ.ศ. 2560</span>
        </div>
      </div>
    </div>
  );
};
