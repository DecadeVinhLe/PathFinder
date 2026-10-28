/* Bus routes, headways and jam segments */
const ROUTES = [
  { id:'05', color:'#c2410c', type:'Local',   headway:15, first:'05:30', last:'22:00',
    stops:[['hub',0],['riverside',7],['techpark',14],['village',22]],
    jamSegments:[{ at:1, sev:'heavy', add:6, note:'Cầu Thủ Thiêm — ùn ứ giờ cao điểm' }] },

  { id:'12', color:'#0ea5e9', type:'Local',   headway:20, first:'05:45', last:'21:45',
    stops:[['hub',0],['market',5],['hospital',9],['village',24]],
    jamSegments:[{ at:2, sev:'medium', add:4, note:'Đường 3 Tháng 2 — đông xe tải' }] },

  { id:'21', color:'#0f766e', type:'Local',   headway:12, first:'06:00', last:'22:12',
    stops:[['hub',0],['museum',6],['stadium',12],['techpark',19],['village',26]],
    jamSegments:[{ at:3, sev:'medium', add:5, note:'Xa lộ Hà Nội — kẹt dài' },
                 { at:1, sev:'light',  add:2, note:'Trung tâm Quận 1 — đông nhẹ' }] },

  { id:'07', color:'#be185d', type:'Local',   headway:25, first:'06:10', last:'21:40',
    stops:[['hub',0],['lakeview',9],['airport',18]], jamSegments:[] },

  { id:'01', color:'#1d4ed8', type:'Express', headway:10, first:'06:00', last:'21:00',
    stops:[['hub',0],['riverside',5],['village',16]],
    jamSegments:[{ at:1, sev:'light', add:2, note:'Hầm Thủ Thiêm — hơi chậm' }] },

  { id:'33', color:'#0891b2', type:'Local',   headway:30, first:'06:20', last:'21:20',
    stops:[['hub',0],['market',6],['museum',11],['lakeview',18],['airport',25]],
    jamSegments:[{ at:3, sev:'heavy', add:7, note:'Ngã tư Hàng Xanh — kẹt nặng' }] },

  /* ============ TUYẾN MỚI — QUA LÊ QUANG ĐỊNH ============ */

  /* 18: Bến Thành – Chợ Hiệp Thành, qua Lê Quang Định (Nơ Trang Long / Nguyễn Văn Nghi) */
  { id:'18', color:'#e11d48', type:'Local',   headway:14, first:'05:15', last:'21:30',
    stops:[['market',0],['dienBienPhu',11],['noTrangLong',19],['leQuangDinh',25],
           ['phanVanTri',31],['nguyenVanNghi',36],['chohiepthanh',52]],
    jamSegments:[
      { at:2, sev:'medium', add:4, note:'Nơ Trang Long — kẹt quanh bệnh viện' },
      { at:5, sev:'heavy',  add:7, note:'Nguyễn Văn Nghi — giao Lê Quang Định giờ cao điểm' }
    ] },

  /* 24: Bến xe Miền Đông – Hóc Môn, qua Lê Quang Định phía Bình Thạnh/Gò Vấp */
  { id:'24', color:'#16a34a', type:'Local',   headway:22, first:'05:30', last:'21:10',
    stops:[['bxMienDong',0],['dienBienPhu',9],['noTrangLong',15],['leQuangDinh',20],
           ['phanVanTri',26],['nguyenVanNghi',31],['tanThoiHiep',43],['hocMon',60]],
    jamSegments:[
      { at:3, sev:'medium', add:5, note:'Lê Quang Định — đoạn qua chợ, đông xe máy' },
      { at:7, sev:'light',  add:3, note:'QL22 vào Hóc Môn — hơi chậm buổi chiều' }
    ] },

  /* 146: Bến xe Miền Đông – Chợ Hiệp Thành, lộ trình qua Lê Quang Định */
  { id:'146',color:'#f59e0b', type:'Local',   headway:18, first:'05:20', last:'21:20',
    stops:[['bxMienDong',0],['dienBienPhu',8],['leQuangDinh',17],['phanVanTri',23],
           ['nguyenVanNghi',28],['chohiepthanh',44]],
    jamSegments:[
      { at:2, sev:'heavy',  add:6, note:'Lê Quang Định — trục Bình Thạnh đông kéo dài' },
      { at:4, sev:'medium', add:4, note:'Nguyễn Văn Nghi — đèn giao thông lâu' }
    ] }
];
