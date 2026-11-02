export type VehicleCategory = 'car' | 'special_truck' | 'machinery' | 'equipment';

export type FuelType = 
  | 'ดีเซล' 
  | 'เบนซิน 95' 
  | 'แก๊สโซฮอล์ 95' 
  | 'แก๊สโซฮอล์ 91' 
  | 'เบนซินผสม 2T';

export type FuelCategory = 'ดีเซล' | 'เบนซิน';

export type Department = 
  | 'สำนักปลัด' 
  | 'กองช่าง' 
  | 'กองสาธารณสุขและสิ่งแวดล้อม' 
  | 'กองการศึกษา' 
  | 'กองคลัง' 
  | 'งานป้องกันและบรรเทาสาธารณภัย';

export type VehicleStatus = 'พร้อมใช้งาน' | 'รอซ่อม' | 'อยู่ระหว่างซ่อม' | 'ปลดระวาง/จำหน่าย';

export type OdometerUnit = 'กม.' | 'ชั่วโมง';

export interface FileAttachment {
  name: string;
  type: string; // 'application/pdf' | 'image/jpeg' | etc.
  size: number;
  dataUrl: string; // base64 representation for offline storage
  uploadedAt: string;
}

export interface Vehicle {
  id: string;
  assetCode: string; // เลขครุภัณฑ์ เช่น 416-65-0001
  plateNumber: string; // ทะเบียน เช่น กข 1234 นครพนม หรือ "-"
  name: string; // ชื่อเรียก เช่น รถกระบะ 4 ประตู สำนักปลัด
  category: VehicleCategory;
  brandModel: string; // เช่น Toyota Hilux Revo 2.4 Entry
  chassisNumber: string; // เลขตัวถัง
  engineNumber: string; // เลขเครื่องยนต์
  department: Department;
  fuelType: FuelType;
  driverName: string; // พนักงานขับรถ / ผู้รับผิดชอบประจำ
  purchaseYear: number; // ปี พ.ศ. ที่ได้มา เช่น 2563
  purchaseDate: string; // YYYY-MM-DD
  status: VehicleStatus;
  currentOdometer: number; // เลขไมล์หรือชั่วโมงล่าสุด
  odometerUnit: OdometerUnit;
  registrationFile?: FileAttachment; // แนบไฟล์เล่มทะเบียน / คู่มือจดทะเบียน PDF / รูป
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleName: string;
  department: Department;
  date: string; // YYYY-MM-DD
  fiscalYear: number; // ปีงบประมาณ พ.ศ. (เช่น 2568)
  month: string; // เช่น 2568-01
  fuelType: FuelType;
  fuelCategory: FuelCategory; // 'ดีเซล' หรือ 'เบนซิน'
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  startOdometer: number;
  endOdometer: number;
  distanceOrHours: number; // end - start
  kmPerLiter?: number; // distance / liters
  invoiceNumber: string; // เลขที่ใบสั่งจ่าย / ใบเสร็จ
  station: string; // ปั๊มน้ำมัน เช่น หจก.พระซองปิโตรเลียม
  driverName: string; // ผู้เบิก/พนักงานขับ
  purpose: string; // ภารกิจ เช่น ตรวจพื้นที่น้ำท่วม, ตัดหญ้าสายทางรอบอ่าง
  createdAt: string;
}

export interface RepairItem {
  id: string;
  name: string; // เช่น เปลี่ยนน้ำมันเครื่องสังเคราะห์ 10W-30, ไส้กรองน้ำมันเครื่อง, ค่าแรงช่าง
  quantity: number;
  unit: string; // เช่น ลิตร, ลูก, ชุด, ชิ้น, รายการ
  unitPrice: number;
  totalPrice: number;
}

export interface RepairRecord {
  id: string;
  formNumber: string; // เลขที่ใบเสนอขอซ่อม/แบบ 6 เช่น บซ.012/2568
  vehicleId: string;
  vehiclePlate: string;
  vehicleName: string;
  department: Department;
  date: string; // วันที่ส่งซ่อม / ขออนุมัติ (YYYY-MM-DD)
  fiscalYear: number; // ปีงบประมาณ พ.ศ.
  odometer: number; // เลขไมล์ / ชม. ขณะซ่อม
  damageSymptoms: string; // อาการชำรุดและความจำเป็น
  workshopName: string; // อู่/ร้านค้า/ผู้รับจ้าง
  items: RepairItem[]; // รายการอะไหล่และค่าแรง
  totalCost: number; // ยอดรวมเงิน
  status: 'ขออนุมัติ' | 'อนุมัติแล้ว' | 'กำลังดำเนินการ' | 'ซ่อมเสร็จสิ้น';
  requestedBy: string; // ผู้ขอรับการซ่อม
  technicianOpinion: string; // ความเห็นช่างตรวจสภาพ
  procurementOfficer: string; // เจ้าหน้าที่พัสดุ
  approver: string; // ผู้อนุมัติ (นายกเทศมนตรี / ปลัด)
  completionDate?: string;
  notes?: string;
  createdAt: string;
}

export interface SystemSettings {
  municipalityName: string; // เทศบาลตำบลพระซอง
  province: string; // จังหวัดนครพนม (หรือ อปท. อื่นๆ)
  mayorName: string; // นายกเทศมนตรีตำบลพระซอง
  clerkName: string; // ปลัดเทศบาลตำบลพระซอง
  procurementHead: string; // หัวหน้าเจ้าหน้าที่พัสดุ
  mechanicName: string; // ช่างตรวจสภาพ
  fiscalYear: number; // ปีงบประมาณปัจจุบัน (2568)
}
