/* Journey planner strings (key|English|Vietnamese). Loaded before features/journey.js */
(()=>{
const S=`n_trip|Journey|Hành trình
tr_cmp|Compare all modes|So sánh mọi phương tiện
pd_trip|Plan the whole trip door to door, then compare every mode: bus, metro, parking, last mile, with clock times, speeds and weather.|Lên kế hoạch cả hành trình từ cửa tới cửa rồi so sánh mọi phương tiện: xe buýt, metro, gửi xe, đoạn cuối, kèm giờ giấc, tốc độ và thời tiết.
tr_when|Time is|Loại giờ
tr_depart|Leave at|Khởi hành lúc
tr_arrive|Arrive by|Đến trước
tr_time|Time|Giờ
tr_veh|Travel by|Đi bằng
tr_v_none|Public transit|Phương tiện công cộng
tr_v_bike|Motorbike|Xe máy
tr_v_car|Car|Ô tô
tr_start|How I start|Cách xuất phát
tr_s_auto|Best mix|Tự chọn tốt nhất
tr_s_walk|Walk|Đi bộ
tr_s_hail|Ride-hail|Xe công nghệ
tr_alley|Destination is in a narrow alley (hẻm)|Điểm đến trong hẻm nhỏ
tr_go|Plan my journey|Lên hành trình
tr_ex|Try an example|Thử ví dụ
tr_ex1|Grand Park to District 3|Grand Park đến Quận 3
tr_ex2|Alley, no bus nearby|Hẻm, không có xe buýt
tr_ex3|Airport to Hi-Tech Park|Sân bay tới Khu Công nghệ cao
tr_need|We could not find that place. Type a full address, pick a suggestion from the list, or enter latitude,longitude.|Không tìm thấy địa điểm này. Hãy nhập địa chỉ đầy đủ, chọn gợi ý trong danh sách hoặc nhập vĩ độ,kinh độ.
tr_none|No journey fits. Try another time or another start.|Không có hành trình phù hợp. Thử giờ khác hoặc cách xuất phát khác.
tr_alts|Options|Các phương án
tr_view|Show steps|Xem từng bước
tr_dur|Total|Tổng
tr_dist|Distance|Quãng đường
tr_speed|Average speed|Tốc độ trung bình
tr_xfer|Transfers|Lần chuyển
tr_wx|Weather|Thời tiết
tr_map|Route on Google Maps|Lộ trình trên Google Maps
tl_t|Step by step|Từng bước
tg_fast|Fastest|Nhanh nhất
tg_cheap|Cheapest|Rẻ nhất
tg_dry|Least rain|Ít dính mưa nhất
tg_public|Public transport|Giao thông công cộng
tg_door|Door to door|Tận nơi
cv_t|Transit coverage|Mức phủ giao thông công cộng
cv_p|Nearest public transit stop and metro station (walking distance). Green means within 800 m.|Trạm công cộng và ga metro gần nhất (quãng đi bộ). Màu xanh là trong 800 m.
lg_walk|Walk|Đi bộ
lg_xfer|Walk to the interchange|Đi bộ sang điểm đổi tuyến
lg_alley|Walk from the alley mouth|Đi bộ từ đầu hẻm vào
lg_own_bike|Ride your motorbike|Chạy xe máy của bạn
lg_own_car|Drive your car|Lái ô tô của bạn
lg_park|Park the {v} (about {n} min)|Gửi {v} (khoảng {n} phút)
lg_pickup|Wait for your driver|Chờ tài xế
lg_wait_t|Wait for {l} at {s}, departs {t}|Chờ {l} tại {s}, chạy lúc {t}
lg_hail|Ride-hail car|Xe công nghệ (ô tô)
lg_bikehail|Ride-hail motorbike|Xe ôm công nghệ
lg_stops|{n} stops|{n} trạm
lg_delay|Includes about {n} min of traffic delay.|Đã gồm khoảng {n} phút kẹt xe.
lg_brt_n|bus|xe buýt
lg_metro_n|metro|metro
v_bike|motorbike|xe máy
v_car|car|ô tô
lm_t|Last mile from {s}|Đoạn cuối từ {s}
lm_p|Not sure how to get from the station or stop to your destination? Pick an option and the plan updates.|Chưa biết đi từ ga hoặc trạm tới nơi làm việc? Chọn một cách, hành trình sẽ cập nhật.
lm_walk|Walk|Đi bộ
lm_bikehail|Motorbike taxi|Xe ôm công nghệ
lm_hail|Ride-hail car|Xe công nghệ
lm_use|Use this|Chọn cách này
lm_best|Suggested|Gợi ý
wn_rain|About {n} min outdoors in rain. Bring a raincoat.|Khoảng {n} phút ngoài trời khi mưa. Mang áo mưa.
wn_heat|Hot: {n} min walking outdoors at {tp}°C.|Nóng: đi bộ ngoài trời {n} phút ở {tp}°C.
wn_parksample|Parking availability is sample data. Check with the operator before you go.|Chỗ gửi xe là dữ liệu mẫu. Hãy kiểm tra với đơn vị vận hành trước khi đi.
wn_parkfull|Car parks at this station often fill in the morning rush.|Bãi ô tô ở ga này thường đầy vào giờ cao điểm sáng.
wn_nobus|No {l} stop within {m} m of the destination, so the last mile is by {x}.|Không có trạm {l} trong {m} m quanh điểm đến nên đoạn cuối đi bằng {x}.
wn_alleycar|Cars cannot enter the alley: drop-off at the alley mouth, then a short walk.|Ô tô không vào được hẻm: xuống ở đầu hẻm rồi đi bộ một đoạn ngắn.
wn_peak|Rush-hour delays are included in the times.|Thời gian đã gồm độ trễ giờ cao điểm.
wn_sample|Times are estimates from sample data, not live.|Thời gian là ước tính từ dữ liệu mẫu, không phải thời gian thực.
in_t|Connect to other apps|Kết nối với ứng dụng khác
in_p|Pathfinder is a bridge: it returns one standard journey (JSON), other apps can plug in their data, and pages or apps can ask it for plans.|Pathfinder là cầu nối: trả về một hành trình chuẩn (JSON), ứng dụng khác có thể cắm dữ liệu vào, và trang hoặc ứng dụng khác có thể yêu cầu lên kế hoạch.
in_copy|Copy JSON|Sao chép JSON
in_dl|Download JSON|Tải JSON
in_ics|Add to calendar (.ics)|Thêm vào lịch (.ics)
in_link|Copy link|Sao chép liên kết
in_watch|Watch this trip|Theo dõi chuyến này
in_watching|Watching this trip for weather and traffic changes.|Đang theo dõi chuyến này về thời tiết và giao thông.
in_gm|Open in Google Maps|Mở Google Maps
in_copied|Copied|Đã sao chép
in_json|Journey JSON|JSON hành trình
in_docs|Developer guide|Hướng dẫn tích hợp
in_prov|Data sources plugged in: {p}|Nguồn dữ liệu đang dùng: {p}
f6t|Door-to-door journey|Hành trình từ cửa tới cửa
f6d|Public transit, metro, park-and-ride and last mile in one timed plan.|Phương tiện công cộng, metro, gửi xe và đoạn cuối trong một kế hoạch có giờ giấc.`;
S.split('\n').forEach(l=>{const p=l.split('|');K.en[p[0]]=p[1];K.vi[p[0]]=p[2]});
})();
