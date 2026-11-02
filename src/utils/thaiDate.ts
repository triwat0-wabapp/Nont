// Thai Date and Currency utilities for Local Government (อปท.)

export const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

/**
 * Calculates Thai Fiscal Year (ปีงบประมาณ) from a date.
 * Fiscal year runs from October 1 to September 30.
 * Example: 2024-10-15 -> Thai year 2567 + 1 = 2568
 */
export function getFiscalYear(dateStr: string | Date): number {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return new Date().getFullYear() + 543;
  
  const month = d.getMonth(); // 0-indexed, 9 = October
  const gregorianYear = d.getFullYear();
  const thaiYear = gregorianYear + 543;
  
  return month >= 9 ? thaiYear + 1 : thaiYear;
}

/**
 * Formats a date into Thai format (e.g., "15 ตุลาคม 2567")
 */
export function formatThaiDate(dateStr: string | Date, format: 'full' | 'short' | 'official' = 'full'): string {
  if (!dateStr) return '-';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return String(dateStr);

  const day = d.getDate();
  const monthIndex = d.getMonth();
  const thaiYear = d.getFullYear() + 543;

  if (format === 'short') {
    return `${day} ${THAI_MONTHS_SHORT[monthIndex]} ${thaiYear.toString().slice(-2)}`;
  }

  if (format === 'official') {
    return `${day} เดือน ${THAI_MONTHS_FULL[monthIndex]} พ.ศ. ${thaiYear}`;
  }

  return `${day} ${THAI_MONTHS_FULL[monthIndex]} ${thaiYear}`;
}

/**
 * Converts a number to Thai Baht text (e.g. 1250.50 -> "หนึ่งพันสองร้อยห้าสิบบาทห้าสิบสตางค์")
 * Essential for Thai official procurement & repair Form 6 (แบบ 6)
 */
export function thaiBahtText(num: number): string {
  if (num === 0) return 'ศูนย์บาทถ้วน';
  if (isNaN(num)) return '-';

  const numbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  function convertInteger(n: number): string {
    let str = Math.floor(n).toString();
    let result = '';
    const len = str.length;

    for (let i = 0; i < len; i++) {
      const digit = parseInt(str[i], 10);
      const position = len - i - 1;

      if (digit !== 0) {
        if (position === 0 && digit === 1 && len > 1 && parseInt(str[i - 1], 10) !== 0) {
          result += 'เอ็ด';
        } else if (position === 1 && digit === 2) {
          result += 'ยี่';
        } else if (position === 1 && digit === 1) {
          result += '';
        } else {
          result += numbers[digit];
        }
        result += units[position % 6];
      }

      if (position === 6 && len > 7) {
        result += 'ล้าน';
      }
    }
    return result;
  }

  const rounded = Math.round(num * 100) / 100;
  const parts = rounded.toFixed(2).split('.');
  const intPart = parseInt(parts[0], 10);
  const decPart = parseInt(parts[1], 10);

  let output = '';
  if (intPart > 0) {
    output += convertInteger(intPart) + 'บาท';
  }

  if (decPart > 0) {
    output += convertInteger(decPart) + 'สตางค์';
  } else {
    output += 'ถ้วน';
  }

  return output;
}

/**
 * Formats currency / numbers with 2 decimals and commas
 */
export function formatCurrency(amount: number): string {
  return (amount || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Formats numbers with commas (no decimals)
 */
export function formatNumber(amount: number): string {
  return (amount || 0).toLocaleString('th-TH');
}
