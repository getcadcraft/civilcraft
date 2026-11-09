---
title: Có gì mới trong 0.8 và 0.8.1
summary: CivilCraft 0.8 thêm Cho mưa rơi (chạy một trận mưa trên nền đã san), cân bằng đất, tìm tuyến tốt nhất, ao điều tiết, tiến độ từ các đợt khảo sát, bộ nhập địa chỉ đến công trường giữ công trường trong dự án, và các cửa sổ cho đất và mái dốc, nút giao và sơn vạch, bình sai đo đạc, mỏ lộ thiên, tuyến vô tuyến và ghi đường sắt. 0.8.1 sửa cách đọc tệp DWG.
keywords: có gì mới, what's new, ghi chú phát hành, nhật ký thay đổi, thay đổi, 0.8, 0.8.1, phiên bản, tính năng mới, mưa, bão, ngập úng, tràn, đào và đắp, cân bằng khối lượng, vận chuyển, tuyến tốt nhất, chi phí thấp nhất, tuyến, ao điều tiết, cửa xả, hạ mực nước, cao trình an toàn, tiến độ, khảo sát, máy bay không người lái, đống vật liệu, từ địa chỉ đến công trường, thửa đất, đất, lũ lụt, ổn định mái dốc, Bishop, lún, nút giao, sơn vạch, biển báo, tầm nhìn, bình sai, bình phương nhỏ nhất, đường chuyền, mỏ lộ thiên, mô hình khối, liên kết vô tuyến, Fresnel, ghi, ghi chéo, ngôn ngữ, sự cố, Live, DWG
from: b0932cf0
---

Đây là những thay đổi trong CivilCraft 0.8 (2026-11-01) và 0.8.1 (2026-11-02), so với 0.7. Phần mới lớn gồm các công cụ kiểm tra nền san và công trường (mưa, đất, tuyến, ao, tiến độ) và sáu cửa sổ tính toán cho nền, đường, khảo sát, mỏ, liên kết và đường sắt.

## Mới

### Kiểm tra nền san

- **Make it rain.** {{ui:Make it rain…}} (trong {{ui:Surface}}) thả một trận mưa lớn xuống nền đã san. Bạn xem nước chảy khỏi các nền, đọng lại ở các góc thấp và làm tràn các ao quá nhỏ. Quá trình chạy có hoạt ảnh và cho ra thể tích, lưu lượng xả đỉnh và tệp CSV của mọi ao. Ô lưới mặc định thô để xem nhanh lần đầu; ô mịn hơn thì chậm hơn. Các ao bị tràn cũng xuất hiện trong bảng Vấn đề.
- **Earthwork balancer.** {{ui:Earthwork balancer…}} nâng hoặc hạ một nền cho đến khi đào bằng đắp, và hiển thị bảng vận chuyển giữa chúng.
- **Best route.** {{ui:Best route…}}: chọn điểm đầu và điểm cuối, CivilCraft tìm đường rẻ nhất qua địa hình, giữ trong giới hạn độ dốc và bán kính cong của bạn, rồi tạo tuyến từ đó.
- **Detention ponds.** {{ui:Detention ponds…}} tính cao độ và dung tích từ nền của bạn, nhận các thiết bị xả (lỗ, đập tràn, khe chữ V, tràn xả lũ), cho một trận mưa chạy qua ao, và kiểm tra lưu lượng đỉnh được giữ lại, thời gian rút cạn và cao trình an toàn.
- **Progress from surveys.** {{ui:Progress from surveys…}} so sánh các bề mặt máy bay không người lái hoặc quét từ các ngày khác nhau với nền như trước và với thiết kế: phần trăm hoàn thành theo khối lượng, vùng đào quá và đắp quá, đống vật liệu, và thời điểm công việc hoàn tất với tiến độ này (được ghi là ước tính).

### Hiểu công trường

- **Address to site.** {{ui:Address to site…}} gom dữ liệu thửa đất, công trình, quy hoạch, đất, lũ lụt và địa hình mở trên cùng một công trường. Bạn có thể giữ công trường trong tệp dự án: địa chỉ đã gõ, từng nguồn cùng ngày bạn lấy và giấy phép của nguồn, và kết quả trả về. Mở lại hoặc chia sẻ dự án thì công trường vẫn còn, không lấy lại dữ liệu nào. Bạn cũng có thể lưu thành tệp công trường hoặc gửi sang BimCraft. Xem [Từ địa chỉ đến công trường](topic:address-to-site).

### Nền, đường, khảo sát, mỏ, liên kết và đường sắt

- **Soils and slopes.** {{ui:Soils and slopes…}} vẽ mặt cắt đất giữa các lỗ khoan bạn nhập. Sau đó phương pháp Bishop tìm cung trượt nguy hiểm nhất trên nền của bạn, với mực nước ngầm, tải trọng phụ thêm và hệ số động đất; lún móng có cố kết, lún tức thời và lún theo thời gian.
- **Junctions and striping.** {{ui:Junctions and striping…}} ghép các nhánh với bo góc vỉa hè (một bán kính cho mỗi nhánh, hoặc bo góc ba tâm), tầm nhìn theo tốc độ thiết kế, kiểm tra tam giác tầm nhìn, vạch sang đường, vạch dừng, vạch sơn và biển báo cùng bảng thống kê biển báo. Chúng được vẽ trên mặt bằng và lưu thành tệp .dxf với các lớp đặt tên.
- **Survey adjustment.** {{ui:Survey adjustment…}} chạy bình sai bình phương nhỏ nhất cho một đường chuyền hoặc lưới: tọa độ sau bình sai, elip sai số, kiểm định chi bình phương và cờ đánh dấu phép đo không khớp. Có lưới tự do, khép đường chuyền theo quy tắc la bàn, và các tệp đo ngoại nghiệp RW5, GSI, JobXML hoặc CSV; các điểm sau bình sai được lưu thành CSV.
- **Open pits.** {{ui:Open pits…}} biến mẫu khoan thành mô hình khối và hố cuối cùng trong góc dốc của bạn, với tỷ số bóc, bảng theo bậc khai thác và đường cong hàm lượng–tấn. Cũng có các hố lồng nhau theo hệ số doanh thu và kế hoạch sản xuất với dòng tiền chiết khấu.
- **Radio links.** {{ui:Radio links…}} kiểm tra tầm nhìn thẳng trên nền của bạn với độ cong Trái Đất, vùng Fresnel thứ nhất, ngân sách đường truyền, biên suy hao và gián đoạn đa đường, rồi cho chiều cao cột anten cần để vượt qua đường truyền. Nó cũng tính ngân sách suy hao cáp quang, khối lượng tuyến và tải gió trên tháp.
- **Rail turnouts.** {{ui:Rail turnouts…}} tạo ghi từ số hiệu ghi (frog), ghi chéo giữa các đường song song và khổ giới hạn nghiêng theo siêu cao, mở rộng trên đường cong. Ghi có thể đặt tại một cọc của tuyến.

Xem [Đất và mái dốc, nút giao, bình sai, mỏ, liên kết vô tuyến và ghi](topic:soils-roads-survey-mines-links).

## Trong mọi ứng dụng

- **Languages.** 54 ngôn ngữ, trong đó 10 ngôn ngữ mới. Các ngôn ngữ khác tiếng Anh là bản dịch máy (bản nháp) cho đến khi người bản ngữ đọc lại. Phần lớn chủ đề trợ giúp vẫn bằng tiếng Anh.
- **Toolbar rows.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Tự xuống dòng (như trước), 2 hàng hoặc 1 hàng. Dải lệnh của CivilCraft hiển thị công cụ dùng nhiều nhất ở kích thước lớn, các công cụ kế tiếp ở kích thước nhỏ, và phần còn lại nằm sau mũi tên của tên nhóm.
- **Input devices.** Bàn di chuột, bút, chuột 3D, bộ điều khiển và MIDI đều có thể điều khiển các ứng dụng.
- **Problems.** Bảng Vấn đề cảnh báo trong mọi ứng dụng, với các kiểm tra đọc từ bộ quy định.
- **Live.** Chế độ xem vị trí của từng người trong phiên Live.
- **Add-ons.** Danh sách tiện ích bổ sung, gồm tiện ích chiếu sáng.
- **Connect your AI.** Bất kỳ trợ lý nào bạn kết nối đều có thể điều khiển các công cụ của CivilCraft. Kèm theo ghi chú rằng kết nối một chạm trong CadCraft Studio và bộ kết nối được lưu trữ chưa sẵn sàng. Xem [Để trợ lý AI làm việc với công trường của bạn](topic:assistants).

## Đã sửa trong 0.8.1

- **DWG classes section.** Phần này bị đọc sai kiểu (GitHub cadcraft#5). Đã sửa trong CivilCraft cùng với CadCraft, BimCraft, ModelCraft và TakeoffCraft.
- **Switching language while running.** CadCraft Studio và các bản đóng gói có thể đổi ngôn ngữ khi đang chạy. Trước đây chỉ có tiếng Anh. Chưa kiểm tra trên mọi nền tảng: cho chúng tôi biết nếu ngôn ngữ không đổi.

## Chưa có trong phiên bản này

- **These are calculation aids.** Mọi kết quả trong các cửa sổ mới đều cần kỹ sư kiểm tra. Cường độ đất bắt đầu từ giá trị điển hình của nhóm đất, và cửa sổ có ghi điều đó.
- **Make it rain.** Một lần chạy trên công trường mẫu có thể mất hơn hai phút trong trình duyệt ở ô lưới mịn. Đã kiểm tra với các trường hợp tính tay và một lưu vực hình chữ V, chưa kiểm tra trên công trường san nền thực tế.
- **Address to site.** Công cụ đọc các tệp dữ liệu mở do bạn cung cấp, và chỉ được thử nghiệm trên tệp của chúng tôi. Cây cối không phải là nguồn dữ liệu. Việc tự động lấy dữ liệu từ các nguồn đang chờ nội dung về quyền riêng tư.
- **Progress from surveys.** Chỉ thử nghiệm trên các khảo sát giả lập. Tiến độ trên bản vẽ tờ và đánh dấu (MarkupCraft), cũng như quét so với mô hình (BimCraft), chưa xây dựng.
- **Soils and slopes.** Chỉ có mặt trượt tròn: chưa có tìm kiếm mặt trượt phẳng hoặc khối, và chưa có khe nứt do kéo.
- **Junctions.** Mỗi nhánh một bán kính, chưa có đường quét của xe tải, và chưa đưa vào hành lang tuyến.
- **Field files.** Các bộ đọc được viết từ mô tả định dạng công khai và thử với tệp chúng tôi tạo. Cần các tệp đo thực từ máy đo.
- **Links and rail.** Liên kết vô tuyến: chỉ có suy hao không gian tự do và đa đường (không có suy hao do mưa hay mẫu anten), và không có tiêu chuẩn đường sắt: mọi giới hạn đường sắt là giá trị tạm, với các số liệu nháp mà chưa kỹ sư đường sắt nào kiểm tra.
- **Windows and macOS.** 0.8 chưa được ký mã. Windows có thể cảnh báo, và macOS yêu cầu nhấn chuột phải rồi chọn Open.

Mọi nội dung khác nằm trong [Chưa xây dựng](topic:not-built-yet). Về bản phát hành trước, xem [Có gì mới trong 0.7](topic:whats-new-0-7).
