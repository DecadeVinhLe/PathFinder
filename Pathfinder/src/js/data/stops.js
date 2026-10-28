/* Stops catalogue (HUB + STOPS) */
const HUB = 'hub';

const STOPS = {
  hub:       { name:'Cổng Chính Đại Học',  area:'Transit Hub · Quận 1', lat:10.7769, lng:106.7009 },
  market:    { name:'Chợ Bến Thành',        area:'Quận 1',           lat:10.7725, lng:106.6980 },
  hospital:  { name:'Bệnh Viện Thành Phố',  area:'Quận 3',           lat:10.7680, lng:106.6935 },
  museum:    { name:'Bảo Tàng Lịch Sử',     area:'Quận 1',           lat:10.7860, lng:106.7050 },
  riverside: { name:'Bến Bạch Đằng',        area:'Quận 1',           lat:10.7765, lng:106.7065 },
  techpark:  { name:'Khu Công Nghệ Cao',    area:'Quận 2',           lat:10.7975, lng:106.7195 },
  stadium:   { name:'Sân Vận Động',         area:'Quận 3',           lat:10.7830, lng:106.7180 },
  lakeview:  { name:'Hồ Bán Nguyệt',        area:'Quận 4',           lat:10.7930, lng:106.7000 },
  airport:   { name:'Sân Bay Tân Sơn Nhất', area:'Tân Bình',         lat:10.7600, lng:106.7180 },
  village:   { name:'Làng Đại Học',         area:'Quận 7',           lat:10.8100, lng:106.7300 },

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
