import React, { useState } from 'react';
import CollegeLogo from './CollegeLogo';
import collegeLogoImg from '../assets/college-logo.png';

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

export interface StudentIDData {
  id: number;
  student_id: string;
  full_name: string;
  first_name?: string;
  father_name?: string;
  grandfather_name?: string;
  email: string;
  phone: string;
  gender?: string;
  date_of_birth?: string;
  nationality?: string;
  region?: string;
  zone?: string;
  woreda?: string;
  kebele?: string;
  house_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  department: string;
  department_code?: string;
  occupation: string;
  occupation_code?: string;
  qualification_level: string;
  academic_year: string;
  enrollment_date?: string | null;
  issue_date?: string;
  expiry_date?: string;
  photo_url?: string | null;
  status?: string;
}

interface StudentIDCardModalProps {
  student: StudentIDData;
  onClose: () => void;
}

export const StudentIDCardModal: React.FC<StudentIDCardModalProps> = ({ student, onClose }) => {
  const [activeSide, setActiveSide] = useState<'front' | 'back' | 'both'>('front');
  const [cardTheme, setCardTheme] = useState<'green' | 'pvc'>('green');
  const [imgError, setImgError] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const isImageFile = (url?: string | null) => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return (
      cleanUrl.endsWith('.jpg') ||
      cleanUrl.endsWith('.jpeg') ||
      cleanUrl.endsWith('.png') ||
      cleanUrl.endsWith('.webp') ||
      cleanUrl.includes('image')
    );
  };

  // Trainee Initials for avatar fallback
  const initials = student.full_name
    ? student.full_name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : 'ST';

  // Compute Year Boundary (Validity cycle e.g. 2026 — 2029)
  const rawStartYear = parseInt(
    student.academic_year?.split('/')[0] || String(new Date().getFullYear()),
    10
  );
  const startYear = isNaN(rawStartYear) ? 2026 : rawStartYear;
  const endYear = startYear + 3;
  const yearBoundary = `${startYear} — ${endYear}`;

  // =========================================================================
  // DOWNLOAD ID CARD AS HIGH-RESOLUTION PNG IMAGE (OFFLINE CANVAS GENERATOR)
  // =========================================================================
  const handleDownloadPNG = async (targetSide: 'front' | 'back') => {
    try {
      setDownloading(true);

      // Preload official college logo image
      let loadedLogo: HTMLImageElement | null = null;
      try {
        loadedLogo = await loadImage(collegeLogoImg);
      } catch {
        loadedLogo = null;
      }

      // Preload student photo if available
      let loadedStudentPhoto: HTMLImageElement | null = null;
      if (student.photo_url && isImageFile(student.photo_url) && !imgError) {
        try {
          loadedStudentPhoto = await loadImage(student.photo_url);
        } catch {
          loadedStudentPhoto = null;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = 1040;
      canvas.height = 700;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setDownloading(false);
        return;
      }

      const isGreen = cardTheme === 'green';
      const bgFill = isGreen ? '#043324' : '#ffffff';
      const borderStroke = isGreen ? '#facc15' : '#059669';

      // 1. Draw Card Base (Rounded Rectangle)
      const r = 32;
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(1040 - r, 0);
      ctx.quadraticCurveTo(1040, 0, 1040, r);
      ctx.lineTo(1040, 700 - r);
      ctx.quadraticCurveTo(1040, 700, 1040 - r, 700);
      ctx.lineTo(r, 700);
      ctx.quadraticCurveTo(0, 700, 0, 700 - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.fillStyle = bgFill;
      ctx.fill();

      // Card Border
      ctx.lineWidth = 6;
      ctx.strokeStyle = borderStroke;
      ctx.stroke();

      if (targetSide === 'front') {
        // --- HEADER ---
        ctx.fillStyle = isGreen ? '#032e22' : '#065f46';
        ctx.fillRect(4, 4, 1032, 115);
        ctx.beginPath();
        ctx.moveTo(4, 119);
        ctx.lineTo(1036, 119);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#facc15';
        ctx.stroke();

        // Official College Logo (Clipped Circular Emblem)
        if (loadedLogo) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(65, 62, 44, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(loadedLogo, 21, 18, 88, 88);
          ctx.restore();

          // Golden border ring around logo
          ctx.beginPath();
          ctx.arc(65, 62, 44, 0, 2 * Math.PI);
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#facc15';
          ctx.stroke();
        } else {
          // Fallback Emblem Disc
          ctx.beginPath();
          ctx.arc(65, 62, 44, 0, 2 * Math.PI);
          ctx.fillStyle = '#7f1d1d';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#facc15';
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(65, 62, 38, 0, 2 * Math.PI);
          ctx.fillStyle = '#14532d';
          ctx.fill();

          ctx.font = 'bold 22px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText('HTC', 65, 70);
        }

        // Header Texts
        ctx.textAlign = 'left';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#6ee7b7';
        ctx.fillText('OROMIA REGIONAL STATE · TVET BUREAU', 130, 40);

        ctx.font = '900 26px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('HAWA GELAN TVET COLLEGE', 130, 72);

        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#facc15';
        ctx.fillText('KOOLLEJJI LEENJII TEKINIKAA FI OGUMMAA HAWWAA GALAAN', 130, 98);

        // Accreditation Pill
        ctx.fillStyle = '#facc15';
        ctx.fillRect(840, 25, 175, 26);
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = '#021f15';
        ctx.textAlign = 'center';
        ctx.fillText('MoLS ACCREDITED', 927, 43);

        // --- GOLDEN RIBBON ---
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(4, 120, 1032, 32);
        ctx.font = '900 15px sans-serif';
        ctx.fillStyle = '#021f15';
        ctx.textAlign = 'left';
        ctx.fillText('STUDENT IDENTITY CARD', 30, 142);
        ctx.textAlign = 'right';
        ctx.fillText('KAARDII EENYUMMAA BARATAA', 1010, 142);

        // --- PHOTO BOX (LEFT) ---
        ctx.fillStyle = isGreen ? '#021f15' : '#f1f5f9';
        ctx.fillRect(35, 175, 240, 260);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#facc15';
        ctx.strokeRect(35, 175, 240, 260);

        if (loadedStudentPhoto) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(37, 177, 236, 222);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(loadedStudentPhoto, 37, 177, 236, 222);
          ctx.restore();
        } else {
          // Avatar circle
          ctx.beginPath();
          ctx.arc(155, 280, 55, 0, 2 * Math.PI);
          ctx.fillStyle = '#059669';
          ctx.fill();
          ctx.font = '900 40px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(initials, 155, 295);
        }

        // Verified ribbon below photo
        ctx.fillStyle = 'rgba(2, 33, 23, 0.95)';
        ctx.fillRect(37, 400, 236, 33);
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#6ee7b7';
        ctx.textAlign = 'center';
        ctx.fillText('✓ VERIFIED TRAINEE', 155, 423);

        // ID Box below photo
        ctx.fillStyle = isGreen ? '#021f15' : '#ecfdf5';
        ctx.fillRect(35, 450, 240, 75);
        ctx.lineWidth = 3;
        ctx.strokeStyle = isGreen ? '#facc15' : '#10b981';
        ctx.strokeRect(35, 450, 240, 75);

        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = isGreen ? '#fde047' : '#047857';
        ctx.fillText('STUDENT ID NO:', 155, 475);
        ctx.font = '900 24px monospace';
        ctx.fillStyle = isGreen ? '#ffffff' : '#064e3b';
        ctx.fillText(student.student_id, 155, 508);

        // Validity Boundary Box
        ctx.fillStyle = isGreen ? '#064e3b' : '#f0fdf4';
        ctx.fillRect(35, 535, 240, 55);
        ctx.lineWidth = 2;
        ctx.strokeStyle = isGreen ? '#34d399' : '#a7f3d0';
        ctx.strokeRect(35, 535, 240, 55);

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = isGreen ? '#6ee7b7' : '#059669';
        ctx.fillText('VALIDITY BOUNDARY:', 155, 555);
        ctx.font = '900 18px monospace';
        ctx.fillStyle = isGreen ? '#facc15' : '#b45309';
        ctx.fillText(yearBoundary, 155, 578);

        // --- RIGHT COLUMN: FULL STUDENT DETAILS ---
        ctx.textAlign = 'left';

        // Full Name
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = isGreen ? '#6ee7b7' : '#047857';
        ctx.fillText('FULL LEGAL NAME / MAQAA GUUTUU:', 310, 195);

        ctx.font = '900 30px sans-serif';
        ctx.fillStyle = isGreen ? '#ffffff' : '#0f172a';
        ctx.fillText(student.full_name || 'STUDENT NAME', 310, 230);

        // Department
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = isGreen ? '#6ee7b7' : '#047857';
        ctx.fillText('DEPARTMENT / DAMEE:', 310, 268);

        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = isGreen ? '#ffffff' : '#1e293b';
        ctx.fillText(student.department || 'Agricultural Technology', 310, 298);

        // Occupation / Trade
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = isGreen ? '#fde047' : '#b45309';
        ctx.fillText('OCCUPATION (TRADE) / OGUMMAA:', 310, 335);

        ctx.font = '900 26px sans-serif';
        ctx.fillStyle = isGreen ? '#facc15' : '#047857';
        ctx.fillText(student.occupation || 'Animal Production', 310, 368);

        // Highlights Card: Level + Academic Year + Validity Boundary
        ctx.fillStyle = isGreen ? 'rgba(0, 0, 0, 0.45)' : '#f8fafc';
        ctx.fillRect(310, 395, 690, 85);
        ctx.lineWidth = 3;
        ctx.strokeStyle = isGreen ? '#facc15' : '#cbd5e1';
        ctx.strokeRect(310, 395, 690, 85);

        // Level
        ctx.textAlign = 'center';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = isGreen ? '#6ee7b7' : '#047857';
        ctx.fillText('TVET LEVEL:', 410, 422);

        ctx.fillStyle = isGreen ? '#064e3b' : '#dcfce7';
        ctx.fillRect(345, 435, 130, 34);
        ctx.lineWidth = 2;
        ctx.strokeStyle = isGreen ? '#34d399' : '#86efac';
        ctx.strokeRect(345, 435, 130, 34);

        ctx.font = '900 18px sans-serif';
        ctx.fillStyle = isGreen ? '#ffffff' : '#065f46';
        ctx.fillText(student.qualification_level || 'Level I', 410, 458);

        // Academic Year
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = isGreen ? '#6ee7b7' : '#047857';
        ctx.fillText('ACADEMIC YEAR:', 640, 422);

        ctx.font = '900 20px monospace';
        ctx.fillStyle = isGreen ? '#ffffff' : '#0f172a';
        ctx.fillText(student.academic_year || '2026/2027', 640, 458);

        // Validity Boundary
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = isGreen ? '#fde047' : '#b45309';
        ctx.fillText('VALIDITY BOUNDARY:', 880, 422);

        ctx.font = '900 20px monospace';
        ctx.fillStyle = isGreen ? '#facc15' : '#b45309';
        ctx.fillText(yearBoundary, 880, 458);

        // Demographics row
        ctx.textAlign = 'left';
        ctx.font = '15px sans-serif';
        ctx.fillStyle = isGreen ? '#6ee7b7' : '#64748b';
        ctx.fillText('Gender: ', 310, 520);
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = isGreen ? '#ffffff' : '#0f172a';
        ctx.fillText(student.gender || 'Male', 370, 520);

        ctx.font = '15px sans-serif';
        ctx.fillStyle = isGreen ? '#6ee7b7' : '#64748b';
        ctx.fillText('DOB: ', 500, 520);
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = isGreen ? '#ffffff' : '#0f172a';
        ctx.fillText(student.date_of_birth || '01/01/2000', 550, 520);

        ctx.font = '15px sans-serif';
        ctx.fillStyle = isGreen ? '#6ee7b7' : '#64748b';
        ctx.fillText('Phone: ', 720, 520);
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = isGreen ? '#ffffff' : '#0f172a';
        ctx.fillText(student.phone || '0911000000', 780, 520);

        ctx.font = '15px sans-serif';
        ctx.fillStyle = isGreen ? '#6ee7b7' : '#64748b';
        ctx.fillText('Campus: ', 310, 560);
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = isGreen ? '#ffffff' : '#0f172a';
        ctx.fillText('Hawagalan Main Campus, Machara', 380, 560);

        // --- FOOTER BAR ---
        ctx.fillStyle = isGreen ? '#021f15' : '#f8fafc';
        ctx.fillRect(4, 610, 1032, 86);
        ctx.beginPath();
        ctx.moveTo(4, 610);
        ctx.lineTo(1036, 610);
        ctx.lineWidth = 3;
        ctx.strokeStyle = isGreen ? 'rgba(52, 211, 153, 0.4)' : '#cbd5e1';
        ctx.stroke();

        // Barcode
        ctx.font = '900 24px monospace';
        ctx.fillStyle = isGreen ? '#e2e8f0' : '#334155';
        ctx.fillText('||||| ||| |||| || |||||| | |||', 35, 645);
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = isGreen ? '#facc15' : '#047857';
        ctx.fillText(`*${student.student_id}*`, 35, 672);

        // Center validity
        ctx.textAlign = 'center';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = isGreen ? '#6ee7b7' : '#64748b';
        ctx.fillText('VALIDITY PERIOD:', 520, 642);
        ctx.font = '900 18px monospace';
        ctx.fillStyle = isGreen ? '#facc15' : '#b45309';
        ctx.fillText(`${yearBoundary} G.C.`, 520, 668);

        // Registrar Sign & Stamp
        ctx.textAlign = 'right';
        ctx.font = 'italic bold 20px serif';
        ctx.fillStyle = isGreen ? '#facc15' : '#065f46';
        ctx.fillText('Inst. Yosef Itafa', 1005, 645);
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = isGreen ? '#6ee7b7' : '#64748b';
        ctx.fillText('Dean / Registrar Signature & Stamp', 1005, 668);
      } else {
        // --- BACK SIDE DRAWING ---
        ctx.fillStyle = isGreen ? '#032e22' : '#065f46';
        ctx.fillRect(4, 4, 1032, 90);
        ctx.beginPath();
        ctx.moveTo(4, 94);
        ctx.lineTo(1036, 94);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#facc15';
        ctx.stroke();

        if (loadedLogo) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(60, 48, 30, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(loadedLogo, 30, 18, 60, 60);
          ctx.restore();

          ctx.beginPath();
          ctx.arc(60, 48, 30, 0, 2 * Math.PI);
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#facc15';
          ctx.stroke();

          ctx.textAlign = 'left';
          ctx.font = '900 24px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('HAWA GELAN TVET COLLEGE', 105, 42);

          ctx.font = 'bold 14px sans-serif';
          ctx.fillStyle = '#facc15';
          ctx.fillText('OFFICIAL TRAINEE DOSSIER & EMERGENCY RECORD', 105, 70);
        } else {
          ctx.textAlign = 'left';
          ctx.font = '900 26px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('HAWA GELAN TVET COLLEGE', 35, 45);

          ctx.font = 'bold 15px sans-serif';
          ctx.fillStyle = '#facc15';
          ctx.fillText('OFFICIAL TRAINEE DOSSIER & EMERGENCY RECORD', 35, 75);
        }

        ctx.textAlign = 'right';
        ctx.font = '900 20px monospace';
        ctx.fillStyle = '#facc15';
        ctx.fillText(student.student_id, 1005, 60);

        // Trainee Origin Box
        ctx.fillStyle = isGreen ? 'rgba(0, 0, 0, 0.45)' : '#f8fafc';
        ctx.fillRect(35, 120, 970, 200);
        ctx.lineWidth = 3;
        ctx.strokeStyle = isGreen ? '#34d399' : '#cbd5e1';
        ctx.strokeRect(35, 120, 970, 200);

        ctx.textAlign = 'left';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#fde047';
        ctx.fillText('Nationality:', 60, 160);
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(student.nationality || 'Ethiopian', 60, 190);

        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#fde047';
        ctx.fillText('Permanent Origin:', 360, 160);
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${student.region || 'Oromia'}, ${student.zone || 'Kelem Wollega'}`, 360, 190);

        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#fde047';
        ctx.fillText('Woreda & Kebele:', 700, 160);
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${student.woreda || 'Hawagalan'}, Kebele ${student.kebele || '01'}`, 700, 190);

        ctx.beginPath();
        ctx.moveTo(60, 220);
        ctx.lineTo(975, 220);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();

        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#fde047';
        ctx.fillText('Emergency Contact:', 60, 255);
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(
          `${student.emergency_contact_name || 'Family Contact'} (${student.emergency_contact_relationship || 'Parent'})`,
          60,
          285
        );

        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#fde047';
        ctx.fillText('Emergency Phone:', 600, 255);
        ctx.font = '900 20px monospace';
        ctx.fillStyle = '#facc15';
        ctx.fillText(`☎ ${student.emergency_contact_phone || '0912000000'}`, 600, 285);

        // Rules Box
        ctx.fillStyle = isGreen ? 'rgba(2, 33, 23, 0.6)' : '#ffffff';
        ctx.fillRect(35, 345, 970, 240);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.3)';
        ctx.strokeRect(35, 345, 970, 240);

        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#fde047';
        ctx.fillText('TERMS & INSTITUTIONAL CONDITIONS:', 60, 380);

        ctx.font = '15px sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('1. This identity card is the official property of Hawa Gelan TVET College and is non-transferable.', 60, 420);
        ctx.fillText(`2. The cardholder is an authorized TVET trainee entitled to access campus facilities during ${yearBoundary}.`, 60, 460);
        ctx.fillText('3. Any loss, theft, or damage must be reported immediately to the Office of the Registrar.', 60, 500);
        ctx.fillText('4. If Found, Please Return To: Office of the Registrar, Hawa Gelan TVET College, Machara, Oromia, Ethiopia.', 60, 540);

        // Bottom Bar
        ctx.fillStyle = isGreen ? '#021f15' : '#f8fafc';
        ctx.fillRect(4, 610, 1032, 86);
        ctx.beginPath();
        ctx.moveTo(4, 610);
        ctx.lineTo(1036, 610);
        ctx.lineWidth = 3;
        ctx.strokeStyle = isGreen ? 'rgba(52, 211, 153, 0.4)' : '#cbd5e1';
        ctx.stroke();

        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#facc15';
        ctx.fillText(`hawagalan.edu.et/verify/${student.student_id}`, 35, 655);

        ctx.textAlign = 'right';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#facc15';
        ctx.fillText('ACCREDITED BY MINISTRY OF LABOR & SKILLS (MoLS)', 1005, 645);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('Federal Democratic Republic of Ethiopia', 1005, 668);
      }

      // Convert Canvas to PNG and trigger instant download
      canvas.toBlob((blob) => {
        setDownloading(false);
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${student.student_id || 'Student'}_ID_${targetSide.toUpperCase()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (e) {
      console.error('Failed to export ID Card PNG:', e);
      setDownloading(false);
    }
  };

  // =========================================================================
  // RENDER FRONT OF ID CARD (REACT DOM WITH EXACT PRINT COLOR ADJUSTMENT)
  // =========================================================================
  const renderFrontCard = () => {
    const isGreen = cardTheme === 'green';

    return (
      <div
        className={`w-[520px] max-w-full rounded-2xl overflow-hidden shadow-2xl relative select-none border-2 flex flex-col justify-between id-badge-card transition ${
          isGreen ? 'border-amber-400' : 'border-emerald-600 shadow-slate-900/20'
        }`}
        style={{
          minHeight: '350px',
          backgroundColor: isGreen ? '#043324' : '#ffffff',
          backgroundImage: isGreen
            ? 'linear-gradient(to bottom, #064e3b, #043324, #022117)'
            : 'none',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        {/* Subtle decorative security background patterns */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />

        {/* 1. TOP INSTITUTIONAL HEADER */}
        <div
          className="px-4 py-2.5 flex items-center space-x-3 border-b"
          style={{
            backgroundColor: isGreen ? '#032e22' : '#065f46',
            borderColor: '#facc15',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        >
          <CollegeLogo size={46} className="shrink-0 drop-shadow" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span
                className="text-[8px] font-bold tracking-widest uppercase"
                style={{ color: '#6ee7b7' }}
              >
                OROMIA REGIONAL STATE · TVET BUREAU
              </span>
              <span
                className="text-[7.5px] font-mono px-1.5 py-0.2 rounded font-black tracking-wider uppercase"
                style={{
                  backgroundColor: '#facc15',
                  color: '#021f15',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                MoLS ACCREDITED
              </span>
            </div>
            <h4
              className="text-xs sm:text-[14px] font-black uppercase tracking-wide leading-tight truncate drop-shadow-sm"
              style={{ color: '#ffffff' }}
            >
              Hawa Gelan TVET College
            </h4>
            <p
              className="text-[8.5px] font-semibold tracking-tight uppercase truncate"
              style={{ color: '#facc15' }}
            >
              Koollejji Leenjii Tekinikaa Fi Ogummaa Hawwaa Galaan
            </p>
          </div>
        </div>

        {/* 2. GOLDEN IDENTITY RIBBON */}
        <div
          className="px-4 py-0.5 flex items-center justify-between font-black text-[8.5px] tracking-wider uppercase shadow-sm"
          style={{
            backgroundColor: '#f59e0b',
            backgroundImage: 'linear-gradient(to right, #f59e0b, #facc15, #f59e0b)',
            color: '#021f15',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        >
          <span>Student Identity Card</span>
          <span>Kaardii Eenyummaa Barataa</span>
        </div>

        {/* 3. CARD BODY (PHOTO + FULL STUDENT DETAILS) */}
        <div className="p-3.5 flex items-start space-x-3.5 flex-1">
          {/* Left Column: Photo, Prominent ID Box, Year Boundary */}
          <div className="w-[125px] shrink-0 flex flex-col items-center">
            {/* Photo Frame */}
            <div
              className="w-[120px] h-[130px] rounded-xl overflow-hidden relative border-2 shadow-md flex flex-col items-center justify-center"
              style={{
                backgroundColor: isGreen ? '#021f15' : '#f1f5f9',
                borderColor: isGreen ? '#facc15' : '#059669',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              {student.photo_url && isImageFile(student.photo_url) && !imgError ? (
                <img
                  src={student.photo_url}
                  alt={student.full_name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-black text-base shadow-md"
                    style={{
                      background: 'linear-gradient(135deg, #059669 0%, #d97706 100%)',
                      color: '#ffffff',
                    }}
                  >
                    {initials}
                  </div>
                  <span
                    className="text-[8.5px] font-black mt-1 uppercase tracking-tight"
                    style={{ color: '#facc15' }}
                  >
                    Trainee
                  </span>
                  <span className="text-[7.5px]" style={{ color: isGreen ? '#e2e8f0' : '#475569' }}>
                    OFFICIAL ID
                  </span>
                </div>
              )}

              {/* Watermark Tag */}
              <div
                className="absolute bottom-0 inset-x-0 py-0.5 text-center border-t border-amber-400/40"
                style={{
                  backgroundColor: 'rgba(2, 33, 23, 0.95)',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                <span className="text-[7.5px] font-bold tracking-wider" style={{ color: '#6ee7b7' }}>
                  ✓ VERIFIED TRAINEE
                </span>
              </div>
            </div>

            {/* Prominent Student ID Number Box */}
            <div
              className="w-full mt-2 p-1.5 rounded-xl text-center border shadow-inner"
              style={{
                backgroundColor: isGreen ? '#021f15' : '#ecfdf5',
                borderColor: isGreen ? '#facc15' : '#10b981',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <span
                className="text-[7.5px] font-bold uppercase tracking-widest block"
                style={{ color: isGreen ? '#fde047' : '#047857' }}
              >
                Student ID No:
              </span>
              <span
                className="text-xs sm:text-[13px] font-mono font-black tracking-wider block mt-0.5"
                style={{ color: isGreen ? '#ffffff' : '#064e3b' }}
              >
                {student.student_id}
              </span>
            </div>

            {/* Year Boundary & Validity Range */}
            <div
              className="w-full mt-1.5 py-1 px-1.5 rounded-lg text-center border"
              style={{
                backgroundColor: isGreen ? '#064e3b' : '#f0fdf4',
                borderColor: isGreen ? '#34d399' : '#a7f3d0',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <span
                className="text-[7px] font-bold uppercase tracking-wider block"
                style={{ color: isGreen ? '#6ee7b7' : '#059669' }}
              >
                Validity Boundary:
              </span>
              <span
                className="text-[11px] font-mono font-black block"
                style={{ color: isGreen ? '#facc15' : '#b45309' }}
              >
                {yearBoundary}
              </span>
            </div>
          </div>

          {/* Right Column: Full Student Information with 100% High-Contrast Colors */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Full Legal Name */}
            <div>
              <span
                className="text-[8px] font-bold uppercase tracking-wider block"
                style={{ color: isGreen ? '#6ee7b7' : '#047857' }}
              >
                Full Legal Name / Maqaa Guutuu:
              </span>
              <span
                className="text-base sm:text-[17px] font-black uppercase tracking-wide leading-tight block truncate drop-shadow"
                style={{ color: isGreen ? '#ffffff' : '#0f172a' }}
              >
                {student.full_name || 'STUDENT NAME'}
              </span>
            </div>

            {/* Department */}
            <div>
              <span
                className="text-[8px] font-bold uppercase tracking-wider block"
                style={{ color: isGreen ? '#6ee7b7' : '#047857' }}
              >
                Department / Damee:
              </span>
              <span
                className="text-xs sm:text-sm font-bold leading-tight block truncate drop-shadow"
                style={{ color: isGreen ? '#ffffff' : '#1e293b' }}
              >
                {student.department || 'Technical Vocational'}
              </span>
            </div>

            {/* Trade / Occupation */}
            <div>
              <span
                className="text-[8px] font-bold uppercase tracking-wider block"
                style={{ color: isGreen ? '#fde047' : '#b45309' }}
              >
                Occupation (Trade) / Ogummaa:
              </span>
              <span
                className="text-xs sm:text-sm font-black leading-tight block truncate drop-shadow"
                style={{ color: isGreen ? '#facc15' : '#047857' }}
              >
                {student.occupation || 'Animal Production'}
              </span>
            </div>

            {/* Key Training Highlights Row: Qualification Level, Academic Year & Validity Boundary */}
            <div
              className="p-2 rounded-xl border grid grid-cols-3 gap-2 text-center"
              style={{
                backgroundColor: isGreen ? '#021f15' : '#f8fafc',
                borderColor: isGreen ? '#facc15' : '#cbd5e1',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <div>
                <span
                  className="text-[7.5px] uppercase font-bold block"
                  style={{ color: isGreen ? '#6ee7b7' : '#047857' }}
                >
                  TVET Level:
                </span>
                <span
                  className="text-[11px] font-black px-1.5 py-0.5 rounded border inline-block mt-0.5"
                  style={{
                    backgroundColor: isGreen ? '#064e3b' : '#dcfce7',
                    borderColor: isGreen ? '#34d399' : '#86efac',
                    color: isGreen ? '#ffffff' : '#065f46',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}
                >
                  {student.qualification_level || 'Level I'}
                </span>
              </div>

              <div>
                <span
                  className="text-[7.5px] uppercase font-bold block"
                  style={{ color: isGreen ? '#6ee7b7' : '#047857' }}
                >
                  Academic Year:
                </span>
                <span
                  className="text-[11px] font-mono font-bold block mt-0.5"
                  style={{ color: isGreen ? '#ffffff' : '#0f172a' }}
                >
                  {student.academic_year || '2026/2027'}
                </span>
              </div>

              <div>
                <span
                  className="text-[7.5px] uppercase font-bold block"
                  style={{ color: isGreen ? '#fde047' : '#b45309' }}
                >
                  Validity:
                </span>
                <span
                  className="text-[11px] font-mono font-black block mt-0.5"
                  style={{ color: isGreen ? '#facc15' : '#b45309' }}
                >
                  {yearBoundary}
                </span>
              </div>
            </div>

            {/* Trainee Demographics Grid */}
            <div
              className="grid grid-cols-2 gap-x-2.5 gap-y-1 pt-1.5 border-t text-[8.5px]"
              style={{
                borderColor: isGreen ? 'rgba(52, 211, 153, 0.4)' : '#e2e8f0',
              }}
            >
              <div>
                <span
                  className="text-[7.5px] uppercase font-semibold"
                  style={{ color: isGreen ? '#6ee7b7' : '#64748b' }}
                >
                  Gender / Saala:{' '}
                </span>
                <span
                  className="font-bold capitalize"
                  style={{ color: isGreen ? '#ffffff' : '#0f172a' }}
                >
                  {student.gender || 'Male'}
                </span>
              </div>

              <div>
                <span
                  className="text-[7.5px] uppercase font-semibold"
                  style={{ color: isGreen ? '#6ee7b7' : '#64748b' }}
                >
                  DOB / G.DH:{' '}
                </span>
                <span
                  className="font-bold"
                  style={{ color: isGreen ? '#ffffff' : '#0f172a' }}
                >
                  {student.date_of_birth || '01/01/2000'}
                </span>
              </div>

              <div>
                <span
                  className="text-[7.5px] uppercase font-semibold"
                  style={{ color: isGreen ? '#6ee7b7' : '#64748b' }}
                >
                  Phone / Bilbila:{' '}
                </span>
                <span
                  className="font-mono font-bold truncate inline-block max-w-[110px]"
                  style={{ color: isGreen ? '#ffffff' : '#0f172a' }}
                >
                  {student.phone || '0911000000'}
                </span>
              </div>

              <div>
                <span
                  className="text-[7.5px] uppercase font-semibold"
                  style={{ color: isGreen ? '#6ee7b7' : '#64748b' }}
                >
                  Campus:{' '}
                </span>
                <span
                  className="font-bold truncate inline-block max-w-[100px]"
                  style={{ color: isGreen ? '#ffffff' : '#0f172a' }}
                >
                  Hawagalan Main
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. CARD FOOTER: BARCODE, VALIDITY & REGISTRAR SIGNATURE */}
        <div
          className="px-4 py-2 border-t flex items-center justify-between text-[8px]"
          style={{
            backgroundColor: isGreen ? '#021f15' : '#f8fafc',
            borderColor: isGreen ? '#34d399' : '#cbd5e1',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        >
          {/* Simulated Barcode */}
          <div className="flex flex-col">
            <div
              className="font-mono text-sm tracking-[0.25em] font-black select-none"
              style={{ color: isGreen ? '#e2e8f0' : '#334155' }}
            >
              ||||| ||| |||| || |||||| | |||
            </div>
            <span
              className="text-[7.5px] font-mono font-bold tracking-widest"
              style={{ color: isGreen ? '#facc15' : '#047857' }}
            >
              *{student.student_id}*
            </span>
          </div>

          {/* Central Validity Period Marker */}
          <div className="text-center px-2">
            <span
              className="text-[7px] uppercase font-bold block"
              style={{ color: isGreen ? '#6ee7b7' : '#64748b' }}
            >
              Valid Period:
            </span>
            <span
              className="text-[9px] font-mono font-black"
              style={{ color: isGreen ? '#facc15' : '#b45309' }}
            >
              {yearBoundary}
            </span>
          </div>

          {/* Registrar Seal & Signature */}
          <div className="text-right">
            <div className="flex items-center space-x-1.5 justify-end">
              <span
                className="font-serif italic text-xs font-bold"
                style={{ color: isGreen ? '#facc15' : '#065f46' }}
              >
                Inst. Yosef Itafa
              </span>
              <span
                className="w-5 h-5 rounded-full border flex items-center justify-center text-[7px] font-bold"
                style={{
                  borderColor: isGreen ? '#facc15' : '#10b981',
                  backgroundColor: isGreen ? 'rgba(245, 158, 11, 0.2)' : '#dcfce7',
                  color: isGreen ? '#fde047' : '#047857',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                SEAL
              </span>
            </div>
            <span
              className="text-[7px] font-bold uppercase tracking-wider block"
              style={{ color: isGreen ? '#6ee7b7' : '#64748b' }}
            >
              Dean / Registrar Signature & Stamp
            </span>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // RENDER BACK OF ID CARD
  // =========================================================================
  const renderBackCard = () => {
    const isGreen = cardTheme === 'green';

    return (
      <div
        className={`w-[520px] max-w-full rounded-2xl overflow-hidden shadow-2xl relative select-none border-2 flex flex-col justify-between id-badge-card transition ${
          isGreen ? 'border-amber-400' : 'border-emerald-600 shadow-slate-900/20'
        }`}
        style={{
          minHeight: '350px',
          backgroundColor: isGreen ? '#043324' : '#ffffff',
          backgroundImage: isGreen
            ? 'linear-gradient(to bottom, #064e3b, #043324, #022117)'
            : 'none',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        {/* Subtle decorative security pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />

        {/* 1. Back Header */}
        <div
          className="px-4 py-2 border-b flex items-center justify-between"
          style={{
            backgroundColor: isGreen ? '#032e22' : '#065f46',
            borderColor: '#facc15',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        >
          <div className="flex items-center space-x-2">
            <CollegeLogo size={28} className="shrink-0 drop-shadow" />
            <div>
              <h5
                className="text-[12px] font-black uppercase tracking-wide leading-tight"
                style={{ color: '#ffffff' }}
              >
                Hawa Gelan TVET College
              </h5>
              <p
                className="text-[7.5px] font-bold uppercase"
                style={{ color: '#facc15' }}
              >
                Official Trainee Dossier & Emergency Record
              </p>
            </div>
          </div>
          <span
            className="text-[9px] font-mono px-2 py-0.5 rounded font-black border"
            style={{
              backgroundColor: isGreen ? '#021f15' : '#ecfdf5',
              color: isGreen ? '#facc15' : '#047857',
              borderColor: isGreen ? '#facc15' : '#10b981',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            {student.student_id}
          </span>
        </div>

        {/* 2. Back Content Body */}
        <div className="p-3.5 space-y-2.5 flex-1">
          {/* Trainee Origin & Demographics */}
          <div
            className="p-2.5 rounded-xl border text-[8px] space-y-1.5"
            style={{
              backgroundColor: isGreen ? '#021f15' : '#f8fafc',
              borderColor: isGreen ? '#34d399' : '#cbd5e1',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              <div>
                <span
                  className="text-[7px] uppercase font-bold block"
                  style={{ color: isGreen ? '#fde047' : '#047857' }}
                >
                  Nationality:
                </span>
                <span
                  className="font-bold"
                  style={{ color: isGreen ? '#ffffff' : '#0f172a' }}
                >
                  {student.nationality || 'Ethiopian'}
                </span>
              </div>

              <div>
                <span
                  className="text-[7px] uppercase font-bold block"
                  style={{ color: isGreen ? '#fde047' : '#047857' }}
                >
                  Permanent Origin:
                </span>
                <span
                  className="font-bold truncate block"
                  style={{ color: isGreen ? '#ffffff' : '#0f172a' }}
                >
                  {student.region || 'Oromia'}, {student.zone || 'Kelem Wollega'}
                </span>
              </div>

              <div>
                <span
                  className="text-[7px] uppercase font-bold block"
                  style={{ color: isGreen ? '#fde047' : '#047857' }}
                >
                  Woreda & Kebele:
                </span>
                <span
                  className="font-bold"
                  style={{ color: isGreen ? '#ffffff' : '#0f172a' }}
                >
                  {student.woreda || 'Hawagalan'}, Kebele {student.kebele || '01'}
                </span>
              </div>

              <div>
                <span
                  className="text-[7px] uppercase font-bold block"
                  style={{ color: isGreen ? '#fde047' : '#047857' }}
                >
                  Validity Boundary:
                </span>
                <span
                  className="font-mono font-black"
                  style={{ color: isGreen ? '#facc15' : '#b45309' }}
                >
                  {yearBoundary} ({student.academic_year || '2026/2027'})
                </span>
              </div>
            </div>

            <div
              className="pt-1.5 border-t flex items-center justify-between"
              style={{
                borderColor: isGreen ? 'rgba(255, 255, 255, 0.15)' : '#e2e8f0',
              }}
            >
              <div>
                <span
                  className="text-[7px] uppercase font-bold"
                  style={{ color: isGreen ? '#fde047' : '#047857' }}
                >
                  Emergency Contact:{' '}
                </span>
                <span
                  className="font-bold"
                  style={{ color: isGreen ? '#ffffff' : '#0f172a' }}
                >
                  {student.emergency_contact_name || 'Family Contact'} (
                  {student.emergency_contact_relationship || 'Parent'})
                </span>
              </div>
              <div
                className="font-mono font-black"
                style={{ color: isGreen ? '#facc15' : '#047857' }}
              >
                ☎ {student.emergency_contact_phone || '0912000000'}
              </div>
            </div>
          </div>

          {/* Legal Institutional Rules & Regulations */}
          <div
            className="p-2.5 rounded-xl border text-[7.5px] leading-relaxed space-y-1"
            style={{
              backgroundColor: isGreen ? '#032e22' : '#ffffff',
              borderColor: isGreen ? 'rgba(52, 211, 153, 0.4)' : '#e2e8f0',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            <p
              className="font-bold uppercase text-[7px] tracking-wider"
              style={{ color: isGreen ? '#fde047' : '#b45309' }}
            >
              Terms & Institutional Conditions:
            </p>
            <ol
              className="list-decimal pl-3 space-y-0.5"
              style={{ color: isGreen ? '#e2e8f0' : '#475569' }}
            >
              <li>
                This identity card is the official property of{' '}
                <strong style={{ color: isGreen ? '#ffffff' : '#0f172a' }}>
                  Hawa Gelan TVET College
                </strong>{' '}
                and is non-transferable.
              </li>
              <li>
                The cardholder is an authorized TVET trainee entitled to access designated campus workshops, tools, and technical facilities during{' '}
                <strong style={{ color: isGreen ? '#facc15' : '#047857' }}>
                  {yearBoundary}
                </strong>.
              </li>
              <li>
                Any loss, theft, or damage must be reported immediately to the Office of the Registrar.
              </li>
              <li>
                <strong>If Found, Please Return To:</strong> Office of the Registrar, Hawa Gelan TVET College, Machara, Kelem Wollega, Oromia, Ethiopia. Tel: +251 57 555 0122.
              </li>
            </ol>
          </div>
        </div>

        {/* 3. Back Bottom: QR Code Verification & College Stamp */}
        <div
          className="px-4 py-2 border-t flex items-center justify-between text-[7.5px]"
          style={{
            backgroundColor: isGreen ? '#021f15' : '#f8fafc',
            borderColor: isGreen ? '#34d399' : '#cbd5e1',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        >
          {/* Simulated QR Code */}
          <div className="flex items-center space-x-2">
            <div
              className="w-9 h-9 p-0.5 rounded border shadow-sm flex items-center justify-center"
              style={{
                backgroundColor: '#ffffff',
                borderColor: '#facc15',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <svg viewBox="0 0 24 24" className="w-full h-full text-slate-950 fill-current">
                <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v2h-4v-2zm-4-2h2v4h-2v-4zm6 6h2v2h-2v-2zm-4-2h2v4h-2v-4zm2-2h2v2h-2v-2z" />
              </svg>
            </div>
            <div>
              <span
                className="font-bold block"
                style={{ color: isGreen ? '#ffffff' : '#0f172a' }}
              >
                SCAN TO VERIFY
              </span>
              <span
                className="font-mono text-[6.5px] block"
                style={{ color: isGreen ? '#facc15' : '#047857' }}
              >
                hawagalan.edu.et/verify/{student.student_id}
              </span>
            </div>
          </div>

          {/* Official Verification Sign-off */}
          <div className="text-right">
            <span
              className="text-[7.5px] font-black block uppercase"
              style={{ color: isGreen ? '#facc15' : '#b45309' }}
            >
              ACCREDITED TVET INSTITUTION
            </span>
            <span
              className="text-[7px] block"
              style={{ color: isGreen ? '#e2e8f0' : '#64748b' }}
            >
              Federal Democratic Republic of Ethiopia
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Background click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-2xl vision-card rounded-3xl p-6 border border-white/20 shadow-2xl bg-[#0f1735] space-y-5 my-8">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 no-print">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">🪪</span>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Official Student ID Badge
              </h3>
              <p className="text-xs text-slate-400">
                Institutional Credential for <strong>{student.full_name}</strong> ({student.student_id})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* View Controls & Theme Toggle (Screen Only) */}
        <div className="flex flex-wrap items-center justify-between gap-3 no-print">
          {/* View Mode Tabs */}
          <div className="inline-flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveSide('front')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeSide === 'front'
                  ? 'bg-[#0075ff] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Front Side
            </button>
            <button
              type="button"
              onClick={() => setActiveSide('back')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeSide === 'back'
                  ? 'bg-[#0075ff] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Back Side
            </button>
            <button
              type="button"
              onClick={() => setActiveSide('both')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeSide === 'both'
                  ? 'bg-[#0075ff] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Both Sides (Sheet)
            </button>
          </div>

          {/* Theme Selector */}
          <div className="inline-flex items-center space-x-2 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold">Card Theme:</span>
            <button
              type="button"
              onClick={() => setCardTheme('green')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                cardTheme === 'green'
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-400'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              Institutional Green
            </button>
            <button
              type="button"
              onClick={() => setCardTheme('pvc')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                cardTheme === 'pvc'
                  ? 'bg-white text-slate-950 border-amber-400 font-bold'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              PVC White
            </button>
          </div>
        </div>

        {/* Printable Root Container */}
        <div id="printable-id-card" className="print-id-card-root py-4 flex flex-col items-center justify-center gap-6">
          {(activeSide === 'front' || activeSide === 'both') && renderFrontCard()}
          {(activeSide === 'back' || activeSide === 'both') && renderBackCard()}
        </div>

        {/* Modal Bottom Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Accredited TVET ID · Download as Image or Print</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
            >
              Close
            </button>

            {/* Direct PNG Image Download */}
            <button
              type="button"
              disabled={downloading}
              onClick={() => handleDownloadPNG(activeSide === 'back' ? 'back' : 'front')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              title="Download crystal-clear PNG image file"
            >
              <span>⬇️</span>
              <span>{downloading ? 'Exporting...' : 'Download Image (PNG)'}</span>
            </button>

            {/* Print / Save as PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition flex items-center space-x-1.5 cursor-pointer transform hover:-translate-y-0.5"
              title="Print or Save as PDF"
            >
              <span>🖨️</span>
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scoped Dedicated Stylesheet for Screen & Print */}
      <style>{`
        #printable-id-card .id-badge-card {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          .print-id-card-root,
          .print-id-card-root * {
            visibility: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-id-card-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: transparent !important;
            padding: 10px !important;
            margin: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 24px !important;
            z-index: 999999 !important;
          }

          .id-badge-card {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-shadow: none !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentIDCardModal;
