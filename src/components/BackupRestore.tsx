import React, { useState, useRef } from 'react';
import { SystemSettings, Vehicle, FuelLog, RepairRecord } from '../types';
import { exportBackupJSON, importBackupJSON, resetToDemoData, clearAllData } from '../utils/storage';
import { Database, Download, Upload, RefreshCw, Trash2, CheckCircle2, ShieldCheck, Laptop, ExternalLink, Settings, Save } from 'lucide-react';
import { MunicipalSeal } from './MunicipalSeal';

interface BackupRestoreProps {
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  onDataChanged: () => void;
  vehiclesCount: number;
  fuelLogsCount: number;
  repairsCount: number;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({
  settings,
  onUpdateSettings,
  onDataChanged,
  vehiclesCount,
  fuelLogsCount,
  repairsCount,
}) => {
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export JSON file
  const handleExportJSON = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `สำรองข้อมูล_ระบบคุมรถยนต์_${settings.municipalityName}_${dateStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackupJSON(content);
      if (res.success) {
        setRestoreMessage({
          type: 'success',
          text: `${res.message} (ยานพาหนะ ${res.counts?.vehicles} คัน, น้ำมัน ${res.counts?.fuel} รายการ, ประวัติซ่อม ${res.counts?.repairs} รายการ)`
        });
        onDataChanged();
      } else {
        setRestoreMessage({ type: 'error', text: res.message });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Reset to Demo
  const handleResetDemo = () => {
    if (confirm('ต้องการโหลดข้อมูลตัวอย่างเทศบาลตำบลพระซองใหม่หรือไม่? ข้อมูลปัจจุบันจะถูกเขียนทับ')) {
      resetToDemoData();
      onDataChanged();
      alert('โหลดข้อมูลตัวอย่างเรียบร้อยแล้ว');
    }
  };

  // Clear all
  const handleClearAll = () => {
    if (confirm('คำเตือน: คุณต้องการล้างข้อมูลทั้งหมดในระบบใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      clearAllData();
      onDataChanged();
      alert('ล้างข้อมูลเรียบร้อยแล้ว');
    }
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          สำรองข้อมูล ตั้งค่าระบบ และคำแนะนำการใช้งานออฟไลน์
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          ระบบทำงานแบบ Offline 100% ในเครื่องคอมพิวเตอร์ของคุณ ไม่ต้องใช้อินเทอร์เน็ต สำรองข้อมูลเก็บไว้ได้ตลอดเวลา
        </p>
      </div>

      {/* Offline Desktop Shortcut Guide Card */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-xs text-blue-200">
              <Laptop className="w-3.5 h-3.5" /> ใช้งานออฟไลน์ · ไม่ต้องลงโปรแกรม · ไม่ต้องต่อเน็ต
            </div>
            <h2 className="text-xl font-bold">
              วิธีสร้างไอคอนบนหน้าจอคอมพิวเตอร์ (Desktop Shortcut)
            </h2>
            <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
              แตกไฟล์ → กดสร้างไอคอน → ดับเบิลคลิกใช้งานได้เลย! ข้อมูลทั้งหมดจะถูกบันทึกเก็บไว้ในเครื่องคอมพิวเตอร์ของคุณอย่างปลอดภัย ไม่สูญหายแม้ปิดเครื่องหรือไม่มีอินเทอร์เน็ต
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-4 rounded-xl text-xs space-y-2 shrink-0">
            <div className="font-bold text-amber-300">ขั้นตอนสร้างไอคอน (Google Chrome / Edge):</div>
            <ol className="list-decimal list-inside space-y-1 text-slate-100">
              <li>กดปุ่มเมนู <strong>จุดสามจุด ⋮</strong> มุมขวาบนของเบราว์เซอร์</li>
              <li>เลือก <strong>"บันทึกและแชร์" (Save and share)</strong></li>
              <li>คลิก <strong>"สร้างทางลัด..." (Create shortcut)</strong></li>
              <li>ติ๊กเครื่องหมายถูกที่ <strong>"เปิดเป็นหน้าต่าง" (Open as window)</strong></li>
              <li>กด <strong>"สร้าง"</strong> จะได้ไอคอนหน้าจอ Desktop ดับเบิลคลิกใช้งานได้ทันที</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Backup and Restore Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Backup Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                1. ดาวน์โหลดไฟล์สำรองข้อมูล (Backup)
              </h3>
              <p className="text-xs text-slate-500">
                บันทึกข้อมูลทั้งหมด (ยานพาหนะ, น้ำมัน, ซ่อม) เป็นไฟล์ .json เก็บไว้ในคอมพิวเตอร์
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>ทะเบียนยานพาหนะ/เครื่องมือ:</span>
              <strong className="text-slate-900">{vehiclesCount} คัน/เครื่อง</strong>
            </div>
            <div className="flex justify-between">
              <span>บันทึกการเบิกจ่ายน้ำมัน:</span>
              <strong className="text-slate-900">{fuelLogsCount} รายการ</strong>
            </div>
            <div className="flex justify-between">
              <span>ประวัติการซ่อมบำรุง (แบบ 6):</span>
              <strong className="text-slate-900">{repairsCount} รายการ</strong>
            </div>
          </div>

          <button
            onClick={handleExportJSON}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>กดดาวน์โหลดไฟล์สำรองข้อมูล (.json)</span>
          </button>
        </div>

        {/* Restore Backup Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                2. นำเข้าและกู้คืนข้อมูล (Restore)
              </h3>
              <p className="text-xs text-slate-500">
                เลือกไฟล์สำรอง (.json) เพื่อกู้คืนข้อมูลทั้งหมดกลับมาใช้งาน
              </p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs text-emerald-800">
            <span className="font-semibold block mb-0.5">ปลอดภัยและสะดวก:</span>
            สามารถนำไฟล์สำรองที่บันทึกไว้จากเครื่องอื่นมาย้ายเครื่องหรือกู้คืนได้ทุกเวลา
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
              id="import-backup-file"
            />
            <label
              htmlFor="import-backup-file"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 border border-emerald-300 rounded-lg cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>เลือกไฟล์สำรองข้อมูล (.json) เพื่อกู้คืน</span>
            </label>
          </div>

          {restoreMessage && (
            <div
              className={`p-3 rounded-lg text-xs ${
                restoreMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {restoreMessage.text}
            </div>
          )}
        </div>
      </div>

      {/* Settings Form for Official Documents */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <MunicipalSeal size={46} className="shadow-xs" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ตั้งค่าข้อมูลหน่วยงานและผู้มีอำนาจลงนามในเอกสาร (แบบ 6 / สรุปน้ำมัน)
              </h3>
              <p className="text-xs text-slate-500">
                ข้อมูลและตราสัญลักษณ์นี้จะแสดงในหัวกระดาษและช่องลงนามของเอกสารราชการที่พิมพ์ออกจากระบบ
              </p>
            </div>
          </div>

          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4" /> บันทึกสำเร็จแล้ว
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อหน่วยงาน / องค์กรปกครองส่วนท้องถิ่น *
              </label>
              <input
                type="text"
                required
                value={localSettings.municipalityName}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, municipalityName: e.target.value }))}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                อำเภอ และ จังหวัด *
              </label>
              <input
                type="text"
                required
                value={localSettings.province}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, province: e.target.value }))}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อนายกเทศมนตรี / ผู้บริหารสูงสุด
              </label>
              <input
                type="text"
                value={localSettings.mayorName}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, mayorName: e.target.value }))}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อปลัดเทศบาล
              </label>
              <input
                type="text"
                value={localSettings.clerkName}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, clerkName: e.target.value }))}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อหัวหน้าเจ้าหน้าที่พัสดุ
              </label>
              <input
                type="text"
                value={localSettings.procurementHead}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, procurementHead: e.target.value }))}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อช่างผู้ตรวจสภาพ
              </label>
              <input
                type="text"
                value={localSettings.mechanicName}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, mechanicName: e.target.value }))}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการตั้งค่า</span>
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Reset Demo & Clear Data */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          จัดการข้อมูลและชุดข้อมูลตัวอย่าง
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>โหลดชุดข้อมูลตัวอย่าง เทศบาลตำบลพระซอง</span>
          </button>

          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ล้างข้อมูลทั้งหมดในระบบ (เริ่มระบบใหม่)</span>
          </button>
        </div>
      </div>

      {/* Community & Page Credits */}
      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">ระบบคุมรถยนต์ เทศบาลตำบลพระซอง</span>
          <span>·</span>
          <span>พัฒนาเพื่อองค์กรปกครองส่วนท้องถิ่น (อปท. / เทศบาล / อบต.)</span>
        </div>

        <a
          href="https://www.facebook.com/profile.php?id=61558331771664"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-700 hover:text-blue-900 font-semibold"
        >
          <span>เพจ "คลังระบบ อปท."</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
