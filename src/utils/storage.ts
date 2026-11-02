import { Vehicle, FuelLog, RepairRecord, SystemSettings } from '../types';

const STORAGE_KEYS = {
  VEHICLES: 'phrasong_vehicles_v1',
  FUEL_LOGS: 'phrasong_fuel_logs_v1',
  REPAIRS: 'phrasong_repairs_v1',
  SETTINGS: 'phrasong_settings_v1',
  INITIALIZED: 'phrasong_initialized_v1',
};

export const DEFAULT_SETTINGS: SystemSettings = {
  municipalityName: 'เทศบาลตำบลพระซอง',
  province: 'อำเภอนาแก จังหวัดนครพนม',
  mayorName: 'นายประสิทธิ์ พุทธา',
  clerkName: 'นางสาววิภาดา รัตนวงค์',
  procurementHead: 'นายสิทธิชัย วรรณโชติ',
  mechanicName: 'นายสมเกียรติ สาสุข',
  fiscalYear: 2568,
};

// Realistic initial dataset for เทศบาลตำบลพระซอง
export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-001',
    assetCode: '416-65-0001',
    plateNumber: 'กข 4590 นครพนม',
    name: 'รถกระบะ 4 ประตู (สำนักปลัด)',
    category: 'car',
    brandModel: 'Toyota Hilux Revo Double Cab 2.4 Entry',
    chassisNumber: 'MHFAB3DB601249821',
    engineNumber: '2GD-9482103',
    department: 'สำนักปลัด',
    fuelType: 'ดีเซล',
    driverName: 'นายศักดา ประชากุล',
    purchaseYear: 2565,
    purchaseDate: '2565-02-14',
    status: 'พร้อมใช้งาน',
    currentOdometer: 42150,
    odometerUnit: 'กม.',
    notes: 'ใช้งานทั่วไป งานสารบรรณ และราชการผู้บริหาร',
    createdAt: '2024-10-01T08:00:00Z',
    updatedAt: '2025-01-15T09:30:00Z',
  },
  {
    id: 'veh-002',
    assetCode: '416-64-0003',
    plateNumber: 'นข 8122 นครพนม',
    name: 'รถบรรทุกน้ำดับเพลิง 6,000 ลิตร',
    category: 'special_truck',
    brandModel: 'Isuzu Forward FTR 240',
    chassisNumber: 'FTR34T-7002135',
    engineNumber: '6HK1-884129',
    department: 'งานป้องกันและบรรเทาสาธารณภัย',
    fuelType: 'ดีเซล',
    driverName: 'นายธงชัย วรรณดี',
    purchaseYear: 2564,
    purchaseDate: '2564-06-20',
    status: 'พร้อมใช้งาน',
    currentOdometer: 28400,
    odometerUnit: 'กม.',
    notes: 'ภารกิจแจกจ่ายน้ำอุปโภคบริโภคและระงับอัคคีภัย',
    createdAt: '2024-10-01T08:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z',
  },
  {
    id: 'veh-003',
    assetCode: '416-63-0005',
    plateNumber: 'บง 3345 นครพนม',
    name: 'รถบรรทุกขยะแบบอัดท้าย 10 ลบ.ม.',
    category: 'special_truck',
    brandModel: 'Hino 500 Victor FG8J',
    chassisNumber: 'FG8J-118942',
    engineNumber: 'J08E-WD2014',
    department: 'กองสาธารณสุขและสิ่งแวดล้อม',
    fuelType: 'ดีเซล',
    driverName: 'นายวิเชียร สุริยันต์',
    purchaseYear: 2563,
    purchaseDate: '2563-08-11',
    status: 'พร้อมใช้งาน',
    currentOdometer: 64200,
    odometerUnit: 'กม.',
    notes: 'เก็บขยะตามเส้นทางทุกวันจันทร์ พุธ ศุกร์',
    createdAt: '2024-10-01T08:00:00Z',
    updatedAt: '2025-01-18T14:15:00Z',
  },
  {
    id: 'veh-004',
    assetCode: '416-66-0002',
    plateNumber: 'กข 9011 นครพนม',
    name: 'รถพยาบาลกู้ชีพฉุกเฉิน (EMS)',
    category: 'car',
    brandModel: 'Toyota Commuter 2.8 D4D',
    chassisNumber: 'GDH322-0012485',
    engineNumber: '1GD-5129481',
    department: 'งานป้องกันและบรรเทาสาธารณภัย',
    fuelType: 'ดีเซล',
    driverName: 'นายอนุชา สมบูรณ์',
    purchaseYear: 2566,
    purchaseDate: '2566-03-25',
    status: 'พร้อมใช้งาน',
    currentOdometer: 31200,
    odometerUnit: 'กม.',
    notes: 'นำส่งผู้ป่วยฉุกเฉิน 24 ชั่วโมง',
    createdAt: '2024-10-01T08:00:00Z',
    updatedAt: '2025-01-22T08:20:00Z',
  },
  {
    id: 'veh-005',
    assetCode: '416-65-0008',
    plateNumber: 'ตง 1420 นครพนม',
    name: 'รถกระเช้าซ่อมไฟฟ้าและไฟส่องสว่าง',
    category: 'special_truck',
    brandModel: 'Isuzu D-Max Spark 3.0 กระเช้าไฮดรอลิก 12 ม.',
    chassisNumber: 'MP1TFR85-J90124',
    engineNumber: '4JJ1-923847',
    department: 'กองช่าง',
    fuelType: 'ดีเซล',
    driverName: 'นายประสาน คำหล้า',
    purchaseYear: 2565,
    purchaseDate: '2565-09-05',
    status: 'พร้อมใช้งาน',
    currentOdometer: 38950,
    odometerUnit: 'กม.',
    notes: 'ซ่อมไฟฟ้าสาธารณะ ตัดแต่งกิ่งไม้ใกล้สายไฟ',
    createdAt: '2024-10-01T08:00:00Z',
    updatedAt: '2025-01-10T16:00:00Z',
  },
  {
    id: 'veh-006',
    assetCode: '420-64-0001',
    plateNumber: 'ตค 5567 นครพนม',
    name: 'รถแทรกเตอร์การเกษตรและดันดิน',
    category: 'machinery',
    brandModel: 'Kubota M7040 (70 แรงม้า)',
    chassisNumber: 'M7040-54219',
    engineNumber: 'V3307-88912',
    department: 'กองช่าง',
    fuelType: 'ดีเซล',
    driverName: 'นายสายันต์ ดวงดี',
    purchaseYear: 2564,
    purchaseDate: '2564-05-18',
    status: 'พร้อมใช้งาน',
    currentOdometer: 1420,
    odometerUnit: 'ชั่วโมง',
    notes: 'ปรับเกลี่ยคันทาง ขุดลอกร่องระบายน้ำ และช่วยงานเกษตรกร',
    createdAt: '2024-10-01T08:00:00Z',
    updatedAt: '2025-01-12T11:00:00Z',
  },
  {
    id: 'veh-007',
    assetCode: '416-66-0012',
    plateNumber: '-',
    name: 'เครื่องตัดหญ้าสะพายบ่า (เครื่องที่ 1)',
    category: 'equipment',
    brandModel: 'Honda GX35 4 จังหวะ',
    chassisNumber: 'GCAMT-194821',
    engineNumber: 'GX35T-892144',
    department: 'กองสาธารณสุขและสิ่งแวดล้อม',
    fuelType: 'แก๊สโซฮอล์ 95',
    driverName: 'นายสมบัติ ศรีลาวงศ์',
    purchaseYear: 2566,
    purchaseDate: '2566-07-10',
    status: 'พร้อมใช้งาน',
    currentOdometer: 185,
    odometerUnit: 'ชั่วโมง',
    notes: 'ตัดหญ้าริมทางสาธารณะ สวนสาธารณะเทศบาล',
    createdAt: '2024-10-01T08:00:00Z',
    updatedAt: '2025-01-15T09:00:00Z',
  },
  {
    id: 'veh-008',
    assetCode: '416-66-0013',
    plateNumber: '-',
    name: 'เครื่องตัดหญ้าสะพายบ่า (เครื่องที่ 2)',
    category: 'equipment',
    brandModel: 'Honda GX35 4 จังหวะ',
    chassisNumber: 'GCAMT-194822',
    engineNumber: 'GX35T-892145',
    department: 'กองช่าง',
    fuelType: 'แก๊สโซฮอล์ 95',
    driverName: 'นายมานพ ทองสุข',
    purchaseYear: 2566,
    purchaseDate: '2566-07-10',
    status: 'พร้อมใช้งาน',
    currentOdometer: 210,
    odometerUnit: 'ชั่วโมง',
    notes: 'ตัดหญ้าแนวเสาไฟ ไหล่ทางถนนสายหลัก',
    createdAt: '2024-10-01T08:00:00Z',
    updatedAt: '2025-01-14T13:40:00Z',
  },
  {
    id: 'veh-009',
    assetCode: '420-65-0004',
    plateNumber: '-',
    name: 'เครื่องพ่นหมอกควันกำจัดยุงลาย',
    category: 'equipment',
    brandModel: 'Swingfog SN50',
    chassisNumber: 'SN50-84920',
    engineNumber: 'SF-94821',
    department: 'กองสาธารณสุขและสิ่งแวดล้อม',
    fuelType: 'เบนซิน 95',
    driverName: 'นายพิทักษ์ ชัยชนะ',
    purchaseYear: 2565,
    purchaseDate: '2565-11-04',
    status: 'พร้อมใช้งาน',
    currentOdometer: 94,
    odometerUnit: 'ชั่วโมง',
    notes: 'พ่นสารเคมีควบคุมโรคไข้เลือดออก ชุมชน ม.1 - ม.9',
    createdAt: '2024-10-01T08:00:00Z',
    updatedAt: '2025-01-08T15:00:00Z',
  },
  {
    id: 'veh-010',
    assetCode: '430-64-0002',
    plateNumber: '-',
    name: 'เครื่องสูบน้ำดับเพลิง/ระบายน้ำ 6 นิ้ว',
    category: 'equipment',
    brandModel: 'Yanmar TS230R-TH เครื่องยนต์ดีเซล 23 แรงม้า',
    chassisNumber: 'TS230-74129',
    engineNumber: 'YM-671294',
    department: 'งานป้องกันและบรรเทาสาธารณภัย',
    fuelType: 'ดีเซล',
    driverName: 'นายธงชัย วรรณดี',
    purchaseYear: 2564,
    purchaseDate: '2564-08-30',
    status: 'พร้อมใช้งาน',
    currentOdometer: 320,
    odometerUnit: 'ชั่วโมง',
    notes: 'สูบระบายน้ำท่วมขังช่วงฤดูฝนและสูบน้ำผลิตน้ำประปา',
    createdAt: '2024-10-01T08:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z',
  },
];

export const INITIAL_FUEL_LOGS: FuelLog[] = [
  // Fiscal Year 2568 Logs (Oct 2024 - Jan 2025)
  // veh-001 (Toyota Revo สำนักปลัด)
  {
    id: 'fuel-001',
    vehicleId: 'veh-001',
    vehiclePlate: 'กข 4590 นครพนม',
    vehicleName: 'รถกระบะ 4 ประตู (สำนักปลัด)',
    department: 'สำนักปลัด',
    date: '2024-10-08',
    fiscalYear: 2568,
    month: '2024-10',
    fuelType: 'ดีเซล',
    fuelCategory: 'ดีเซล',
    liters: 55.40,
    pricePerLiter: 32.94,
    totalCost: 1824.88,
    startOdometer: 40500,
    endOdometer: 41180,
    distanceOrHours: 680,
    kmPerLiter: 12.27,
    invoiceNumber: 'บจ.68/10-014',
    station: 'หจก.พระซองปิโตรเลียม',
    driverName: 'นายศักดา ประชากุล',
    purpose: 'ราชการส่งเอกสารศาลากลางจังหวัดนครพนม',
    createdAt: '2024-10-08T10:00:00Z',
  },
  {
    id: 'fuel-002',
    vehicleId: 'veh-001',
    vehiclePlate: 'กข 4590 นครพนม',
    vehicleName: 'รถกระบะ 4 ประตู (สำนักปลัด)',
    department: 'สำนักปลัด',
    date: '2024-10-24',
    fiscalYear: 2568,
    month: '2024-10',
    fuelType: 'ดีเซล',
    fuelCategory: 'ดีเซล',
    liters: 52.80,
    pricePerLiter: 32.94,
    totalCost: 1739.23,
    startOdometer: 41180,
    endOdometer: 41810,
    distanceOrHours: 630,
    kmPerLiter: 11.93,
    invoiceNumber: 'บจ.68/10-038',
    station: 'หจก.พระซองปิโตรเลียม',
    driverName: 'นายศักดา ประชากุล',
    purpose: 'ร่วมประชุมอำเภอนาแก และสำรวจงานก่อสร้างในตำบล',
    createdAt: '2024-10-24T14:30:00Z',
  },
  {
    id: 'fuel-003',
    vehicleId: 'veh-001',
    vehiclePlate: 'กข 4590 นครพนม',
    vehicleName: 'รถกระบะ 4 ประตู (สำนักปลัด)',
    department: 'สำนักปลัด',
    date: '2024-11-15',
    fiscalYear: 2568,
    month: '2024-11',
    fuelType: 'ดีเซล',
    fuelCategory: 'ดีเซล',
    liters: 54.00,
    pricePerLiter: 32.94,
    totalCost: 1778.76,
    startOdometer: 41810,
    endOdometer: 42450,
    distanceOrHours: 640,
    kmPerLiter: 11.85,
    invoiceNumber: 'บจ.68/11-022',
    station: 'หจก.พระซองปิโตรเลียม',
    driverName: 'นายศักดา ประชากุล',
    purpose: 'งานวันลอยกระทงเทศบาลตำบลพระซอง',
    createdAt: '2024-11-15T09:00:00Z',
  },
  // veh-002 (รถน้ำ ปภ.)
  {
    id: 'fuel-004',
    vehicleId: 'veh-002',
    vehiclePlate: 'นข 8122 นครพนม',
    vehicleName: 'รถบรรทุกน้ำดับเพลิง 6,000 ลิตร',
    department: 'งานป้องกันและบรรเทาสาธารณภัย',
    date: '2024-10-12',
    fiscalYear: 2568,
    month: '2024-10',
    fuelType: 'ดีเซล',
    fuelCategory: 'ดีเซล',
    liters: 120.00,
    pricePerLiter: 32.94,
    totalCost: 3952.80,
    startOdometer: 27800,
    endOdometer: 28220,
    distanceOrHours: 420,
    kmPerLiter: 3.50,
    invoiceNumber: 'บจ.68/10-019',
    station: 'หจก.พระซองปิโตรเลียม',
    driverName: 'นายธงชัย วรรณดี',
    purpose: 'แจกจ่ายน้ำช่วยเหลือประชาชนขาดแคลนน้ำอุปโภค ม.4 และ ม.7',
    createdAt: '2024-10-12T16:00:00Z',
  },
  {
    id: 'fuel-005',
    vehicleId: 'veh-002',
    vehiclePlate: 'นข 8122 นครพนม',
    vehicleName: 'รถบรรทุกน้ำดับเพลิง 6,000 ลิตร',
    department: 'งานป้องกันและบรรเทาสาธารณภัย',
    date: '2024-11-18',
    fiscalYear: 2568,
    month: '2024-11',
    fuelType: 'ดีเซล',
    fuelCategory: 'ดีเซล',
    liters: 110.00,
    pricePerLiter: 32.94,
    totalCost: 3623.40,
    startOdometer: 28220,
    endOdometer: 28590,
    distanceOrHours: 370,
    kmPerLiter: 3.36,
    invoiceNumber: 'บจ.68/11-030',
    station: 'หจก.พระซองปิโตรเลียม',
    driverName: 'นายธงชัย วรรณดี',
    purpose: 'ล้างทำความสะอาดลานอเนกประสงค์วัดพระซอง และแจกน้ำ ม.2',
    createdAt: '2024-11-18T11:20:00Z',
  },
  // veh-003 (รถขยะ กองสาธารณสุข)
  {
    id: 'fuel-006',
    vehicleId: 'veh-003',
    vehiclePlate: 'บง 3345 นครพนม',
    vehicleName: 'รถบรรทุกขยะแบบอัดท้าย 10 ลบ.ม.',
    department: 'กองสาธารณสุขและสิ่งแวดล้อม',
    date: '2024-10-15',
    fiscalYear: 2568,
    month: '2024-10',
    fuelType: 'ดีเซล',
    fuelCategory: 'ดีเซล',
    liters: 140.00,
    pricePerLiter: 32.94,
    totalCost: 4611.60,
    startOdometer: 62800,
    endOdometer: 63320,
    distanceOrHours: 520,
    kmPerLiter: 3.71,
    invoiceNumber: 'บจ.68/10-025',
    station: 'หจก.พระซองปิโตรเลียม',
    driverName: 'นายวิเชียร สุริยันต์',
    purpose: 'จัดเก็บขยะมูลฝอยประจำสัปดาห์ โซนตะวันตกและบ่อขยะเทศบาล',
    createdAt: '2024-10-15T15:00:00Z',
  },
  {
    id: 'fuel-007',
    vehicleId: 'veh-003',
    vehiclePlate: 'บง 3345 นครพนม',
    vehicleName: 'รถบรรทุกขยะแบบอัดท้าย 10 ลบ.ม.',
    department: 'กองสาธารณสุขและสิ่งแวดล้อม',
    date: '2024-11-02',
    fiscalYear: 2568,
    month: '2024-11',
    fuelType: 'ดีเซล',
    fuelCategory: 'ดีเซล',
    liters: 145.00,
    pricePerLiter: 32.94,
    totalCost: 4776.30,
    startOdometer: 63320,
    endOdometer: 63880,
    distanceOrHours: 560,
    kmPerLiter: 3.86,
    invoiceNumber: 'บจ.68/11-005',
    station: 'หจก.พระซองปิโตรเลียม',
    driverName: 'นายวิเชียร สุริยันต์',
    purpose: 'เก็บขนขยะมูลฝอยชุมชน ต.พระซอง ทุกหมู่บ้าน',
    createdAt: '2024-11-02T16:30:00Z',
  },
  // veh-004 (รถพยาบาลฉุกเฉิน กู้ชีพ)
  {
    id: 'fuel-008',
    vehicleId: 'veh-004',
    vehiclePlate: 'กข 9011 นครพนม',
    vehicleName: 'รถพยาบาลกู้ชีพฉุกเฉิน (EMS)',
    department: 'งานป้องกันและบรรเทาสาธารณภัย',
    date: '2024-10-19',
    fiscalYear: 2568,
    month: '2024-10',
    fuelType: 'ดีเซล',
    fuelCategory: 'ดีเซล',
    liters: 60.00,
    pricePerLiter: 32.94,
    totalCost: 1976.40,
    startOdometer: 30100,
    endOdometer: 30680,
    distanceOrHours: 580,
    kmPerLiter: 9.67,
    invoiceNumber: 'บจ.68/10-031',
    station: 'หจก.พระซองปิโตรเลียม',
    driverName: 'นายอนุชา สมบูรณ์',
    purpose: 'นำส่งผู้ป่วยฉุกเฉิน รพ.นาแก 3 เที่ยว และ รพ.นครพนม 1 เที่ยว',
    createdAt: '2024-10-19T20:10:00Z',
  },
  // Gasoline / Gasohol Tools (เครื่องมือ เครื่องตัดหญ้า พ่นยุง)
  {
    id: 'fuel-009',
    vehicleId: 'veh-007',
    vehiclePlate: '-',
    vehicleName: 'เครื่องตัดหญ้าสะพายบ่า (เครื่องที่ 1)',
    department: 'กองสาธารณสุขและสิ่งแวดล้อม',
    date: '2024-10-14',
    fiscalYear: 2568,
    month: '2024-10',
    fuelType: 'แก๊สโซฮอล์ 95',
    fuelCategory: 'เบนซิน',
    liters: 15.00,
    pricePerLiter: 38.50,
    totalCost: 577.50,
    startOdometer: 160,
    endOdometer: 185,
    distanceOrHours: 25,
    kmPerLiter: 1.67, // ชม. / ลิตร
    invoiceNumber: 'บจ.68/10-023',
    station: 'หจก.พระซองปิโตรเลียม',
    driverName: 'นายสมบัติ ศรีลาวงศ์',
    purpose: 'ตัดหญ้ารอบบริเวณสำนักงานเทศบาลและสนามกีฬา',
    createdAt: '2024-10-14T08:30:00Z',
  },
  {
    id: 'fuel-010',
    vehicleId: 'veh-008',
    vehiclePlate: '-',
    vehicleName: 'เครื่องตัดหญ้าสะพายบ่า (เครื่องที่ 2)',
    department: 'กองช่าง',
    date: '2024-10-22',
    fiscalYear: 2568,
    month: '2024-10',
    fuelType: 'แก๊สโซฮอล์ 95',
    fuelCategory: 'เบนซิน',
    liters: 18.00,
    pricePerLiter: 38.50,
    totalCost: 693.00,
    startOdometer: 180,
    endOdometer: 210,
    distanceOrHours: 30,
    kmPerLiter: 1.67,
    invoiceNumber: 'บจ.68/10-035',
    station: 'หจก.พระซองปิโตรเลียม',
    driverName: 'นายมานพ ทองสุข',
    purpose: 'ตัดหญ้าไหล่ทางสายหลักบ้านพระซอง-บ้านดอนโทน',
    createdAt: '2024-10-22T09:15:00Z',
  },
  {
    id: 'fuel-011',
    vehicleId: 'veh-009',
    vehiclePlate: '-',
    vehicleName: 'เครื่องพ่นหมอกควันกำจัดยุงลาย',
    department: 'กองสาธารณสุขและสิ่งแวดล้อม',
    date: '2024-10-28',
    fiscalYear: 2568,
    month: '2024-10',
    fuelType: 'เบนซิน 95',
    fuelCategory: 'เบนซิน',
    liters: 25.00,
    pricePerLiter: 42.20,
    totalCost: 1055.00,
    startOdometer: 75,
    endOdometer: 94,
    distanceOrHours: 19,
    kmPerLiter: 0.76,
    invoiceNumber: 'บจ.68/10-044',
    station: 'หจก.พระซองปิโตรเลียม',
    driverName: 'นายพิทักษ์ ชัยชนะ',
    purpose: 'พ่นสารเคมีควบคุมการระบาดโรคไข้เลือดออก หมู่ที่ 3 และ โรงเรียน',
    createdAt: '2024-10-28T16:00:00Z',
  },
  {
    id: 'fuel-012',
    vehicleId: 'veh-010',
    vehiclePlate: '-',
    vehicleName: 'เครื่องสูบน้ำดับเพลิง/ระบายน้ำ 6 นิ้ว',
    department: 'งานป้องกันและบรรเทาสาธารณภัย',
    date: '2024-10-05',
    fiscalYear: 2568,
    month: '2024-10',
    fuelType: 'ดีเซล',
    fuelCategory: 'ดีเซล',
    liters: 60.00,
    pricePerLiter: 32.94,
    totalCost: 1976.40,
    startOdometer: 280,
    endOdometer: 320,
    distanceOrHours: 40,
    kmPerLiter: 0.67,
    invoiceNumber: 'บจ.68/10-008',
    station: 'หจก.พระซองปิโตรเลียม',
    driverName: 'นายธงชัย วรรณดี',
    purpose: 'สูบน้ำช่วยเหลือพื้นที่นาข้าวแปลงลุ่มริมลำน้ำก่ำ',
    createdAt: '2024-10-05T07:45:00Z',
  },
];

export const INITIAL_REPAIRS: RepairRecord[] = [
  {
    id: 'rep-001',
    formNumber: 'บซ.008/2568',
    vehicleId: 'veh-001',
    vehiclePlate: 'กข 4590 นครพนม',
    vehicleName: 'รถกระบะ 4 ประตู (สำนักปลัด)',
    department: 'สำนักปลัด',
    date: '2024-11-20',
    fiscalYear: 2568,
    odometer: 42000,
    damageSymptoms: 'ครบระยะตรวจเช็ค 40,000 กม. เปลี่ยนถ่ายของเหลว ผ้าเบรกหน้าเริ่มบาง และสลับยางถ่วงล้อ',
    workshopName: 'อู่ช่างเล็กการช่าง อ.นาแก',
    items: [
      { id: 'item-1', name: 'น้ำมันเครื่องกึ่งสังเคราะห์ 10W-30 (6+1 ลิตร)', quantity: 1, unit: 'แกลลอน', unitPrice: 1450, totalPrice: 1450 },
      { id: 'item-2', name: 'ไส้กรองน้ำมันเครื่องแท้ศูนย์', quantity: 1, unit: 'ลูก', unitPrice: 280, totalPrice: 280 },
      { id: 'item-3', name: 'ไส้กรองอากาศและกรองแอร์ห้องโดยสาร', quantity: 1, unit: 'ชุด', unitPrice: 650, totalPrice: 650 },
      { id: 'item-4', name: 'ผ้าดิสเบรกหน้า (เกรดพรีเมียม)', quantity: 1, unit: 'ชุด', unitPrice: 1850, totalPrice: 1850 },
      { id: 'item-5', name: 'ค่าบริการสลับยาง ถ่วงล้อ 4 ล้อ', quantity: 1, unit: 'รายการ', unitPrice: 400, totalPrice: 400 },
      { id: 'item-6', name: 'ค่าแรงตรวจเช็คระบบช่วงล่างและเปลี่ยนถ่าย', quantity: 1, unit: 'งาน', unitPrice: 500, totalPrice: 500 },
    ],
    totalCost: 5130,
    status: 'ซ่อมเสร็จสิ้น',
    requestedBy: 'นายศักดา ประชากุล (พนักงานขับรถ)',
    technicianOpinion: 'ได้ตรวจสอบแล้วเห็นควรซ่อมแซมตามรายการที่เสนอ เพื่อความปลอดภัยและยืดอายุการใช้งานยานพาหนะของทางราชการ',
    procurementOfficer: 'นายสิทธิชัย วรรณโชติ (หัวหน้าเจ้าหน้าที่พัสดุ)',
    approver: 'นายประสิทธิ์ พุทธา (นายกเทศมนตรีตำบลพระซอง)',
    completionDate: '2024-11-22',
    notes: 'ตรวจรับเรียบร้อย ยานพาหนะใช้งานได้ปกติดี',
    createdAt: '2024-11-20T09:00:00Z',
  },
  {
    id: 'rep-002',
    formNumber: 'บซ.003/2568',
    vehicleId: 'veh-003',
    vehiclePlate: 'บง 3345 นครพนม',
    vehicleName: 'รถบรรทุกขยะแบบอัดท้าย 10 ลบ.ม.',
    department: 'กองสาธารณสุขและสิ่งแวดล้อม',
    date: '2024-10-18',
    fiscalYear: 2568,
    odometer: 63500,
    damageSymptoms: 'สายไฮดรอลิกชุดอัดขยะท้ายรั่วซึม ซีลกระบอกไฮดรอลิกเสื่อมสภาพ น้ำมันไฮดรอลิกหยดเลอะ',
    workshopName: 'หจก.นาแกไฮดรอลิกเซอร์วิส',
    items: [
      { id: 'item-7', name: 'สายไฮดรอลิกแรงดันสูง 2 ชั้น 3/4 นิ้ว พร้อมย้ำหัว', quantity: 2, unit: 'เส้น', unitPrice: 1600, totalPrice: 3200 },
      { id: 'item-8', name: 'ชุดซีลกระบอกไฮดรอลิกชุดอัดท้าย', quantity: 2, unit: 'ชุด', unitPrice: 1200, totalPrice: 2400 },
      { id: 'item-9', name: 'น้ำมันไฮดรอลิกเบอร์ 68', quantity: 1, unit: 'ถัง (18 ลิตร)', unitPrice: 1950, totalPrice: 1950 },
      { id: 'item-10', name: 'ค่าแรงถอดประกอบ เทสแรงดันระบบไฮดรอลิก', quantity: 1, unit: 'งาน', unitPrice: 1500, totalPrice: 1500 },
    ],
    totalCost: 9050,
    status: 'ซ่อมเสร็จสิ้น',
    requestedBy: 'นายวิเชียร สุริยันต์ (พนักงานขับรถ)',
    technicianOpinion: 'ตรวจสอบแล้วพบว่าสายไฮดรอลิกปริแตกตามอายุการใช้งาน จำเป็นต้องเปลี่ยนด่วนเพื่อป้องกันระบบอัดขยะขัดข้องระหว่างปฏิบัติงาน',
    procurementOfficer: 'นายสิทธิชัย วรรณโชติ (หัวหน้าเจ้าหน้าที่พัสดุ)',
    approver: 'นายประสิทธิ์ พุทธา (นายกเทศมนตรีตำบลพระซอง)',
    completionDate: '2024-10-21',
    notes: 'ซ่อมและทดสอบระบบอัดทำงานได้ปกติ',
    createdAt: '2024-10-18T10:15:00Z',
  },
  {
    id: 'rep-003',
    formNumber: 'บซ.014/2568',
    vehicleId: 'veh-007',
    vehiclePlate: '-',
    vehicleName: 'เครื่องตัดหญ้าสะพายบ่า (เครื่องที่ 1)',
    department: 'กองสาธารณสุขและสิ่งแวดล้อม',
    date: '2024-12-05',
    fiscalYear: 2568,
    odometer: 180,
    damageSymptoms: 'หัวเกียร์ตัดหญ้าร้อนจัด ใบมีดสั่นรุนแรง ลานสตาร์ทฝืดดึงไม่ขึ้น',
    workshopName: 'ร้านเกษตรยนต์นาแก',
    items: [
      { id: 'item-11', name: 'ชุดหัวเกียร์ตัดหญ้า 28 มม. 9 ฟัน (ตรงรุ่น GX35)', quantity: 1, unit: 'ชุด', unitPrice: 580, totalPrice: 580 },
      { id: 'item-12', name: 'ชุดลานสตาร์ทแบบดึงเบา', quantity: 1, unit: 'ชุด', unitPrice: 350, totalPrice: 350 },
      { id: 'item-13', name: 'ใบมีดตัดหญ้าตราตา 14 นิ้ว ชนิดหนาพิเศษ', quantity: 2, unit: 'ใบ', unitPrice: 150, totalPrice: 300 },
      { id: 'item-14', name: 'จารบีหล่อลื่นหัวเกียร์ทนความร้อนสูง', quantity: 1, unit: 'หลอด', unitPrice: 80, totalPrice: 80 },
      { id: 'item-15', name: 'ค่าแรงบริการเปลี่ยนและจูนเครื่อง', quantity: 1, unit: 'งาน', unitPrice: 150, totalPrice: 150 },
    ],
    totalCost: 1460,
    status: 'ซ่อมเสร็จสิ้น',
    requestedBy: 'นายสมบัติ ศรีลาวงศ์ (พนักงานตัดหญ้า)',
    technicianOpinion: 'หัวเกียร์เฟืองรูดเนื่องจากใช้งานตัดหญ้าแนวหิน สมควรเปลี่ยนชุดใหม่เพื่อความปลอดภัยของผู้ปฏิบัติงาน',
    procurementOfficer: 'นายสิทธิชัย วรรณโชติ (หัวหน้าเจ้าหน้าที่พัสดุ)',
    approver: 'นายประสิทธิ์ พุทธา (นายกเทศมนตรีตำบลพระซอง)',
    completionDate: '2024-12-06',
    notes: 'ทดสอบตัดหญ้าเรียบร้อย ใช้งานได้ปกติ',
    createdAt: '2024-12-05T09:30:00Z',
  },
];

// LocalStorage helpers
export function loadVehicles(): Vehicle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    if (!raw) {
      saveVehicles(INITIAL_VEHICLES);
      return INITIAL_VEHICLES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load vehicles from storage:', e);
    return INITIAL_VEHICLES;
  }
}

export function saveVehicles(vehicles: Vehicle[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  } catch (e) {
    console.error('Failed to save vehicles to storage:', e);
  }
}

export function loadFuelLogs(): FuelLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FUEL_LOGS);
    if (!raw) {
      saveFuelLogs(INITIAL_FUEL_LOGS);
      return INITIAL_FUEL_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load fuel logs from storage:', e);
    return INITIAL_FUEL_LOGS;
  }
}

export function saveFuelLogs(logs: FuelLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FUEL_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save fuel logs to storage:', e);
  }
}

export function loadRepairs(): RepairRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPAIRS);
    if (!raw) {
      saveRepairs(INITIAL_REPAIRS);
      return INITIAL_REPAIRS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load repairs from storage:', e);
    return INITIAL_REPAIRS;
  }
}

export function saveRepairs(repairs: RepairRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(repairs));
  } catch (e) {
    console.error('Failed to save repairs to storage:', e);
  }
}

export function loadSettings(): SystemSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SystemSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

// Backup all data to a single JSON string
export function exportBackupJSON(): string {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    municipality: 'เทศบาลตำบลพระซอง',
    vehicles: loadVehicles(),
    fuelLogs: loadFuelLogs(),
    repairs: loadRepairs(),
    settings: loadSettings(),
  };
  return JSON.stringify(data, null, 2);
}

// Restore data from a JSON string
export function importBackupJSON(jsonStr: string): { success: boolean; message: string; counts?: { vehicles: number; fuel: number; repairs: number } } {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.vehicles || !Array.isArray(data.vehicles)) {
      return { success: false, message: 'รูปแบบไฟล์ไม่ถูกต้อง: ไม่พบข้อมูลยานพาหนะ' };
    }
    
    if (data.vehicles) saveVehicles(data.vehicles);
    if (data.fuelLogs && Array.isArray(data.fuelLogs)) saveFuelLogs(data.fuelLogs);
    if (data.repairs && Array.isArray(data.repairs)) saveRepairs(data.repairs);
    if (data.settings) saveSettings(data.settings);

    return {
      success: true,
      message: 'กู้คืนข้อมูลสำเร็จเรียบร้อย',
      counts: {
        vehicles: data.vehicles?.length || 0,
        fuel: data.fuelLogs?.length || 0,
        repairs: data.repairs?.length || 0,
      }
    };
  } catch (e) {
    return { success: false, message: `เกิดข้อผิดพลาดในการอ่านไฟล์: ${String(e)}` };
  }
}

// Reset to factory sample data
export function resetToDemoData(): void {
  saveVehicles(INITIAL_VEHICLES);
  saveFuelLogs(INITIAL_FUEL_LOGS);
  saveRepairs(INITIAL_REPAIRS);
  saveSettings(DEFAULT_SETTINGS);
}

// Clear all data
export function clearAllData(): void {
  saveVehicles([]);
  saveFuelLogs([]);
  saveRepairs([]);
}
