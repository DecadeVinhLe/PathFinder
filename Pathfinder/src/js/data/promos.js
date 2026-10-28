/* Partner promo art, vouchers and ads */
const CAN_FUZE = `<svg class="promo-can" viewBox="0 0 56 74" aria-hidden="true">
  <path d="M20 6h16v9H20z" fill="#fff" opacity=".92"/>
  <path d="M14 15h28l-3 53a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4z" fill="#fff" opacity=".95"/>
  <path d="M16 30h24l-2 38a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z" fill="#f59e0b"/>
  <path d="M16 30h24v9H16z" fill="#fbbf24"/>
  <text x="28" y="60" font-size="9" font-weight="800" fill="#fff" text-anchor="middle" font-family="sans-serif">FUZE</text>
</svg>`;
const CAN_STING = `<svg class="promo-can" viewBox="0 0 56 74" aria-hidden="true">
  <path d="M20 6h16v9H20z" fill="#fde047" opacity=".95"/>
  <path d="M14 15h28l-3 53a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4z" fill="#fde047"/>
  <path d="M16 34h24l-2 34a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z" fill="#dc2626"/>
  <path d="M27 40l-4 12h5l-3 12 9-15h-6z" fill="#fde047"/>
</svg>`;
const CAN_WATER = `<svg class="promo-can" viewBox="0 0 56 74" aria-hidden="true">
  <path d="M20 6h16v9H20z" fill="#e0f2fe"/>
  <path d="M14 15h28l-3 53a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4z" fill="#e0f2fe"/>
  <path d="M16 32h24l-2 36a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z" fill="#0ea5e9"/>
  <path d="M16 32h24v8H16z" fill="#38bdf8"/>
</svg>`;
const CAN_KATINAT = `<svg class="promo-can" viewBox="0 0 56 74" aria-hidden="true">
  <path d="M18 8h20v8H18z" fill="#fef3c7"/>
  <path d="M14 16h28l-2 50a5 5 0 0 1-5 5H21a5 5 0 0 1-5-5z" fill="#fef3c7"/>
  <path d="M16 28h24l-1.5 36a4 4 0 0 1-4 4H21.5a4 4 0 0 1-4-4z" fill="#78350f"/>
  <path d="M16 28h24v10H16z" fill="#92400e"/>
  <circle cx="28" cy="52" r="8" fill="#fbbf24" opacity=".9"/>
  <text x="28" y="55" font-size="7" font-weight="800" fill="#78350f" text-anchor="middle" font-family="sans-serif">☕</text>
</svg>`;
const CAN_PHUCLONG = `<svg class="promo-can" viewBox="0 0 56 74" aria-hidden="true">
  <path d="M18 8h20v8H18z" fill="#dcfce7"/>
  <path d="M14 16h28l-2 50a5 5 0 0 1-5 5H21a5 5 0 0 1-5-5z" fill="#dcfce7"/>
  <path d="M16 28h24l-1.5 36a4 4 0 0 1-4 4H21.5a4 4 0 0 1-4-4z" fill="#166534"/>
  <path d="M16 28h24v10H16z" fill="#15803d"/>
  <ellipse cx="28" cy="50" rx="10" ry="7" fill="#86efac" opacity=".85"/>
  <text x="28" y="53" font-size="8" font-weight="800" fill="#14532d" text-anchor="middle" font-family="sans-serif">PL</text>
</svg>`;

/* Voucher catalog — a mix: local fashion, snacks and drinks (demo offers) */
const tile=(c1,c2,em)=>`<svg class="promo-can" viewBox="0 0 56 74" aria-hidden="true"><path d="M19 22v-6a9 9 0 0 1 18 0v6" fill="none" stroke="${c2}" stroke-width="3.5" stroke-linecap="round"/><rect x="8" y="22" width="40" height="46" rx="6" fill="${c1}"/><rect x="8" y="22" width="40" height="10" rx="6" fill="${c2}"/><text x="28" y="57" font-size="20" text-anchor="middle">${em}</text></svg>`;
const snack=(c1,c2,em)=>`<svg class="promo-can" viewBox="0 0 56 74" aria-hidden="true"><path d="M11 40 1 29v22zM45 40l10-11v22z" fill="${c2}"/><ellipse cx="28" cy="40" rx="19" ry="16" fill="${c1}"/><path d="M12 33q16-9 32 0" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/><text x="28" y="47" font-size="20" text-anchor="middle">${em}</text></svg>`;
const cup=(c1,c2,em)=>`<svg class="promo-can" viewBox="0 0 56 74" aria-hidden="true"><path d="M16 8h24v8H16z" fill="${c2}"/><path d="M12 16h32l-4 50a5 5 0 0 1-5 5H21a5 5 0 0 1-5-5z" fill="#fff"/><path d="M14 28h28l-3 38a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4z" fill="${c1}"/><text x="28" y="56" font-size="16" text-anchor="middle">${em}</text></svg>`;
const bottle=(c1,c2,em)=>`<svg class="promo-can" viewBox="0 0 56 74" aria-hidden="true"><rect x="22" y="2" width="12" height="8" rx="2" fill="${c2}"/><path d="M23 10h10v8c0 4 11 6 11 15v32a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V33c0-9 11-11 11-15z" fill="${c1}"/><rect x="13" y="38" width="30" height="20" rx="3" fill="#fff" fill-opacity=".92"/><text x="28" y="53" font-size="14" text-anchor="middle">${em}</text></svg>`;
const VOUCHERS = [
 { id:'routine',brand:'Routine',type:'fashion',badge:'Thời trang',can:tile('#1e293b','#475569','👕'),rid:'',offer:'Giảm <strong>15%</strong> cho áo thun và quần basic khi mua từ 2 món tại Routine.',en:'<strong>15% off</strong> tees and basics when you buy 2 or more at Routine.',codePrefix:'ROUT',validHours:72 },
 { id:'kinhdo',brand:'Kinh Đô',type:'snack',badge:'Bánh snack',can:snack('#a16207','#eab308','🍪'),rid:'',offer:'Mua 2 gói bánh quy / cracker, <strong>tặng thêm 1 gói</strong> tại cửa hàng tiện lợi gần trạm xe.',en:'Buy 2 packs of biscuits or crackers, <strong>get 1 free</strong> at convenience stores near stops.',codePrefix:'KDO',validHours:48 },
 { id:'katinat',brand:'Katinat',type:'coffee',badge:'Cà phê',can:CAN_KATINAT,rid:'',offer:'Giảm <strong>20%</strong> cho 1 ly Cà phê sữa đá hoặc Bạc xỉu size M tại Katinat (xuất trình mã tại quầy).',en:'<strong>20% off</strong> an iced milk coffee or Bạc xỉu (size M) at Katinat — show the code at the counter.',codePrefix:'KATI',validHours:48 },
 { id:'coolmate',brand:'Coolmate',type:'fashion',badge:'Thời trang nam',can:tile('#0f766e','#14b8a6','🧢'),rid:'',offer:'Giảm <strong>10%</strong> đơn từ 299.000đ — đồ thoáng mát cho nắng nóng Sài Gòn.',en:'<strong>10% off</strong> orders over 299,000đ — light gear for Saigon heat.',codePrefix:'COOL',validHours:72 },
 { id:'bibica',brand:'Bibica',type:'snack',badge:'Bánh kẹo Việt',can:snack('#7c2d12','#c2410c','🍫'),rid:'',offer:'Giảm <strong>10.000đ</strong> cho gói bánh hoặc kẹo Bibica từ 40.000đ.',en:'Save <strong>10,000đ</strong> on Bibica biscuits or candy from 40,000đ.',codePrefix:'BIBI',validHours:48 },
 { id:'phuclong',brand:'Phúc Long',type:'tea',badge:'Trà & cà phê',can:CAN_PHUCLONG,rid:'',offer:'Tặng <strong>1 trà đào cam sả size M</strong> khi mua bất kỳ đồ uống nào từ 45.000đ tại Phúc Long.',en:'Get <strong>a free peach-lemongrass tea (M)</strong> with any drink from 45,000đ at Phúc Long.',codePrefix:'PLONG',validHours:48 },
 { id:'biti',brand:'Biti’s Hunter',type:'fashion',badge:'Giày Việt',can:tile('#b91c1c','#ef4444','👟'),rid:'',offer:'Giảm <strong>100.000đ</strong> cho đôi Hunter từ 700.000đ, đi bộ thoải mái cả ngày.',en:'Save <strong>100,000đ</strong> on Hunter sneakers from 700,000đ, built for all-day walking.',codePrefix:'BITI',validHours:96 },
 { id:'fuze',brand:'Fuze Tea',type:'drink',badge:'Trà trái cây',can:bottle('#f59e0b','#15803d','🍑'),rid:'',offer:'Giảm <strong>15.000đ</strong> cho 1 chai Fuze Tea Đào / Chanh / Việt Quất tại cửa hàng tiện lợi gần bến xe công cộng.',en:'Save <strong>15,000đ</strong> on a bottle of Fuze Tea Peach / Lemon / Blueberry at convenience stores near bus stops.',codePrefix:'FUZE',validHours:24 },
 { id:'tantan',brand:'Tân Tân',type:'snack',badge:'Snack & hạt',can:snack('#15803d','#22c55e','🥜'),rid:'',offer:'Giảm <strong>15%</strong> cho snack và hạt Tân Tân — gọn nhẹ cho đường dài.',en:'<strong>15% off</strong> Tân Tân snacks and nuts — easy to carry on long trips.',codePrefix:'TTAN',validHours:48 },
 { id:'highlands',brand:'Highlands Coffee',type:'coffee',badge:'Cà phê',can:cup('#9f1239','#be123c','☕'),rid:'',offer:'Giảm <strong>25.000đ</strong> cho 1 ly Freeze hoặc Phindi size M tại Highlands Coffee.',en:'Save <strong>25,000đ</strong> on a Freeze or Phindi (size M) at Highlands Coffee.',codePrefix:'HIGH',validHours:48 },
 { id:'sting',brand:'Sting',type:'drink',badge:'Năng lượng',can:bottle('#dc2626','#facc15','⚡'),rid:'',offer:'Mua 1 tặng 1 chai Sting Vàng / Đỏ tại cửa hàng tiện lợi gần trạm xe công cộng (áp dụng 1 lần/ngày).',en:'Buy 1, get 1 free bottle of Sting Gold / Red at convenience stores near stops (once per day).',codePrefix:'STING',validHours:12 },
 { id:'canifa',brand:'Canifa',type:'fashion',badge:'Thời trang',can:tile('#1d4ed8','#3b82f6','🧥'),rid:'',offer:'Giảm <strong>15%</strong> cho đơn từ 500.000đ tại cửa hàng Canifa.',en:'<strong>15% off</strong> orders over 500,000đ at Canifa stores.',codePrefix:'CANI',validHours:72 },
 { id:'haiha',brand:'Hải Hà',type:'snack',badge:'Bánh kẹo Việt',can:snack('#be123c','#f43f5e','🍬'),rid:'',offer:'Tặng <strong>1 gói kẹo</strong> khi mua bánh quy Hải Hà từ 50.000đ.',en:'Get <strong>a free candy pack</strong> with Hải Hà biscuits from 50,000đ.',codePrefix:'HAIHA',validHours:48 },
 { id:'tch',brand:'The Coffee House',type:'coffee',badge:'Cà phê & trà',can:cup('#c2410c','#ea580c','🥐'),rid:'',offer:'Tặng <strong>1 bánh mì que</strong> khi mua 1 ly trà hoặc cà phê bất kỳ tại The Coffee House.',en:'Get <strong>a free bread stick</strong> with any tea or coffee at The Coffee House.',codePrefix:'TCH',validHours:48 }
];

/* Chỉ giữ vài quảng cáo — tách biệt hoàn toàn với trang Đổi voucher */
const ADS = [{ rid:"promo-sting", emoji:"⚡", name:"Sting", line:"Nước tăng lực · Tỉnh táo trước giờ lên lớp.", en:"Energy drink · Stay sharp before class." },
  { rid:"promo-water", emoji:"💧", name:"Aquafina", line:"Nước uống · Mang theo nước, hành trình dài vẫn khoẻ.", en:"Bottled water · Carry water for longer trips." },
  { rid:"promo-routine", emoji:"👕", name:"Routine", line:"Thời trang trẻ · Áo thun, quần basic cho ngày di chuyển nhiều.", en:"Young fashion · Everyday basics for busy commutes." },
  { rid:"promo-coolmate", emoji:"🧢", name:"Coolmate", line:"Thời trang nam · Đồ thoáng mát, hợp nắng nóng Sài Gòn.", en:"Menswear · Light, breathable gear for Saigon heat." },
  { rid:"promo-biti", emoji:"👟", name:"Biti’s Hunter", line:"Giày Việt · Sneaker nhẹ, bền cho những chuyến đi bộ.", en:"Local sneakers · Light, durable pairs for walking trips." },
  { rid:"promo-degrey", emoji:"🎒", name:"Degrey", line:"Local brand · Streetwear và phụ kiện cho giới trẻ thành phố.", en:"Local brand · Streetwear and accessories for city youth." },
  { rid:"promo-highlands", emoji:"☕", name:"Highlands Coffee", line:"Cà phê Việt · Phin sữa đá cho ngày bận rộn.", en:"Vietnamese coffee · Phin milk coffee for a busy day." },
  { rid:"promo-trung", emoji:"☕", name:"Trung Nguyên Legend", line:"Cà phê Việt · Hương vị cà phê Buôn Ma Thuột.", en:"Vietnamese coffee · The taste of Buôn Ma Thuột beans." },
  { rid:"promo-coffeehouse", emoji:"🥤", name:"The Coffee House", line:"Quán cà phê · Chỗ ngồi yên tĩnh để đợi giờ xe.", en:"Coffee shop · A quiet seat while you wait for your ride." },
  { rid:"promo-cong", emoji:"🥥", name:"Cộng Cà Phê", line:"Cà phê Việt · Cà phê cốt dừa mát lạnh giữa trưa nắng.", en:"Vietnamese coffee · Coconut coffee on a hot afternoon." },
  { rid:"promo-phela", emoji:"🍵", name:"Phê La", line:"Trà & cà phê · Trà nhài, ô long đậm vị cho buổi chiều.", en:"Tea & coffee · Jasmine and oolong for the afternoon." },
  { rid:"promo-toco", emoji:"🧋", name:"Tocotoco", line:"Trà sữa Việt · Trà sữa trân châu mang đi, tiện đường.", en:"Local milk tea · Pearl milk tea to take away." },
  { rid:"promo-kinhdo", emoji:"🍪", name:"Kinh Đô", line:"Bánh snack · Ăn nhẹ gọn trong túi cho chặng đường dài.", en:"Snacks · A light bite for the long way." },
  { rid:"promo-bibica", emoji:"🍫", name:"Bibica", line:"Bánh kẹo Việt · Món ngọt nhỏ khi chờ xe buýt.", en:"Vietnamese sweets · A small treat while you wait for the bus." }
];
