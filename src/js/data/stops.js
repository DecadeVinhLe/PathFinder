/* Stops catalogue (HUB + STOPS) */
const HUB = 'hub';

const STOPS = {
  /* ---- TP. Thủ Đức (project scope) ---- */
  sTien:   { name:'Ga Metro Suối Tiên',      area:'TP. Thủ Đức · Long Bình',     lat:10.8645, lng:106.8061 },
  vnuS:    { name:'ĐH Quốc gia TP.HCM',      area:'TP. Thủ Đức · Linh Xuân',     lat:10.8756, lng:106.8000 },
  nlam:    { name:'ĐH Nông Lâm',             area:'TP. Thủ Đức · Linh Trung',    lat:10.8700, lng:106.7915 },
  bxmd:    { name:'Bến Xe Miền Đông Mới',    area:'TP. Thủ Đức · Long Bình',     lat:10.8786, lng:106.8150 },
  fptu:    { name:'ĐH FPT',                  area:'TP. Thủ Đức · Long Thạnh Mỹ', lat:10.8412, lng:106.8099 },
  vgp:     { name:'Vinhomes Grand Park',     area:'TP. Thủ Đức · Long Thạnh Mỹ', lat:10.8420, lng:106.8330 },
  gaTD:    { name:'Ga Metro Thủ Đức',        area:'TP. Thủ Đức · Bình Thọ',      lat:10.8340, lng:106.7760 },
  hcmute:  { name:'ĐH Sư phạm Kỹ thuật',     area:'TP. Thủ Đức · Linh Chiểu',    lat:10.8506, lng:106.7719 },
  chotd:   { name:'Chợ Thủ Đức',             area:'TP. Thủ Đức · Linh Chiểu',    lat:10.8490, lng:106.7540 },
  gaPL:    { name:'Ga Metro Phước Long',     area:'TP. Thủ Đức · Phước Long',    lat:10.8115, lng:106.7650 },
  gaAP:    { name:'Ga Metro An Phú',         area:'TP. Thủ Đức · An Phú',        lat:10.7985, lng:106.7467 },
  giga:    { name:'Gigamall Thủ Đức',        area:'TP. Thủ Đức · Hiệp Bình Chánh', lat:10.8267, lng:106.7216 },

  /* ---- Khu vực lân cận ---- */
  hub:       { name:'Cổng Chính Đại Học',  area:'Transit Hub · Quận 1', lat:10.7769, lng:106.7009 },
  market:    { name:'Chợ Bến Thành',        area:'Quận 1',           lat:10.7725, lng:106.6980 },
  hospital:  { name:'Bệnh Viện Thành Phố',  area:'Quận 3',           lat:10.7680, lng:106.6935 },
  museum:    { name:'Bảo Tàng Lịch Sử',     area:'Quận 1',           lat:10.7860, lng:106.7050 },
  riverside: { name:'Bến Bạch Đằng',        area:'Quận 1',           lat:10.7765, lng:106.7065 },
  techpark:  { name:'Khu Công Nghệ Cao',    area:'TP. Thủ Đức · Tân Phú',   lat:10.8553, lng:106.7855 },
  stadium:   { name:'Sân Vận Động',         area:'Quận 3',           lat:10.7830, lng:106.7180 },
  lakeview:  { name:'Hồ Bán Nguyệt',        area:'Quận 4',           lat:10.7930, lng:106.7000 },
  airport:   { name:'Sân Bay Tân Sơn Nhất', area:'Tân Bình',         lat:10.7600, lng:106.7180 },
  village:   { name:'Làng Đại Học',         area:'TP. Thủ Đức · Thảo Điền', lat:10.8100, lng:106.7300 },

  /* ---- Hành lang Lê Quang Định (Bình Thạnh ↔ Gò Vấp) ---- */
  nguyenVanNghi:{ name:'Nguyễn Văn Nghi',   area:'Gò Vấp · giao Lê Quang Định', lat:10.8183, lng:106.6845 },
  phanVanTri:   { name:'Phan Văn Trị',      area:'Gò Vấp',                      lat:10.8157, lng:106.6872 },
  leQuangDinh:  { name:'Lê Quang Định (BV)',area:'Bình Thạnh · trục chính',     lat:10.8096, lng:106.6927 },
  noTrangLong:  { name:'Nơ Trang Long',     area:'Bình Thạnh · giao Lê Quang Định', lat:10.8055, lng:106.6975 },
  dienBienPhu:  { name:'Điện Biên Phủ',     area:'Bình Thạnh',                  lat:10.8010, lng:106.7020 },
  chohiepthanh: { name:'Chợ Hiệp Thành',    area:'Quận 12',                     lat:10.8280, lng:106.6430 },
  bxMienDong:   { name:'Bến Xe Miền Đông',  area:'Bình Thạnh',                  lat:10.8125, lng:106.7140 },
  hocMon:       { name:'Hóc Môn',           area:'Hóc Môn',                     lat:10.8720, lng:106.5950 },
  tanThoiHiep:  { name:'Tân Thới Hiệp',     area:'Quận 12',                     lat:10.8400, lng:106.6600 }
};
