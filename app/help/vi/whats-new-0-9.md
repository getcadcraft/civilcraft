---
title: Có gì mới trong 0.9
summary: Mẫu hành lang và mẫu địa hình, bắt điểm và nút chọn điểm khi vẽ, phân tích GIS với bảng thuộc tính, khảo sát bóng đổ, sản lượng năng lượng mặt trời, tiện nghi và gió cho công trường, chế độ xem Render 3D, và các tiện ích bổ sung Đám điểm và WaterCraft.
keywords: có gì mới, 0.9, ghi chú phát hành, mẫu hành lang, mẫu địa hình, trình chỉnh sửa mẫu, mặt cắt điển hình, nhiều hành lang, bắt điểm, snap, snaps, chọn điểm, pick, di chuyển, sao chép, xoay, tiếp tuyến, render, render 3d, phân tích gis, vùng đệm, lớp phủ, nối không gian, bảng thuộc tính, tô màu theo thuộc tính, khảo sát bóng đổ, sản lượng năng lượng mặt trời, utci, tiện nghi ngoài trời, khảo sát gió, openfoam, đám điểm, las, laz, watercraft, lưu lượng chữa cháy, trụ cứu hỏa, tuổi nước, clo, nhu cầu, chú giải công cụ, bố cục, có gì mới, ghi chú phát hành, nhật ký thay đổi, thay đổi, 0.8, 0.8.1, phiên bản, tính năng mới, mưa, bão, đọng nước, tràn, đào đắp, cân bằng, đất đào và đắp, vận chuyển, tuyến tốt nhất, chi phí thấp nhất, tuyến, ao điều tiết, cửa xả, hạ mực nước, cao độ an toàn, tiến độ, khảo sát, flycam, bãi chứa đất, địa chỉ đến công trường, thửa đất, đất, lũ, ổn định mái dốc, bishop, lún, nút giao, sơn vạch, biển báo, tầm nhìn, bình sai, bình phương tối thiểu, chuyền, mỏ lộ thiên, mô hình khối, tuyến vô tuyến, fresnel, ghi, giao chéo, ngôn ngữ, vấn đề, trực tiếp, dwg
from: d7ac5b14
---

Đây là những thay đổi trong CivilCraft 0.9 so với 0.8.1. CivilCraft 0.9 là một phần của CadCraft Studio 0.9 và tám ứng dụng của bộ này. Các phần chính là mẫu hành lang và mẫu địa hình, bắt điểm khi vẽ, phân tích GIS, khảo sát bóng nắng, sản lượng năng lượng mặt trời, tiện nghi và gió của công trường, và hai tiện ích bổ sung: Đám điểm và WaterCraft.

## Mới

### Mẫu hành lang và mẫu địa hình

- **Mẫu hành lang.** Mở {{ui:Surface}} › {{ui:More}} › {{ui:Corridor templates…}} (hoặc gõ {{cmd:TEMPLATES}}). Mẫu là một mặt cắt ngang nhỏ gồm các thành phần, độ dời, độ dốc, vật liệu và mã điểm. Lưu mẫu trong dự án, trong {{ui:My library}} hoặc dưới dạng tệp `.cctemplates.json`. Trình chỉnh sửa mẫu hiển thị bản vẽ đúng tỷ lệ và liệt kê các vấn đề ngay khi bạn nhập.
- **Dựng từ mẫu theo cọc.** Chọn một tuyến và bật {{ui:Build from templates by station}} trong Thuộc tính của tuyến. Mỗi bên của mỗi đoạn có danh sách mặt đường và điều kiện kết thúc riêng. {{ui:Add a corridor}} trong mục {{ui:Corridors on this alignment}} đặt nhiều hành lang trên cùng một tuyến.
- **Mẫu địa hình.** {{ui:Surface}} › {{ui:More}} › {{ui:Terrain templates…}} (hoặc gõ {{cmd:TERRAINTEMPLATES}}) trải các lớp vật liệu như đất mặt hoặc mặt đường và nền lên địa hình, với diện tích và khối lượng của từng lớp. Xem [Mẫu hành lang và mẫu địa hình](topic:corridor-templates).

### Vẽ

- **Bắt điểm.** Các công cụ Alignment, Pad, Parcel, Mass, Feature line, Measure, Boundary và Catchment bắt vào điểm khảo sát, PI, góc, đỉnh và công trình, kèm nhãn cạnh điểm đánh dấu. Giữ {{key:Alt}} để chọn điểm tự do.
- **Nút chọn điểm, tiếp tuyến và di chuyển, sao chép, xoay.** Các góc của Pad, Parcel và Feature line có ô nhập Easting và Northing cùng nút chọn điểm hình chữ thập. Thuộc tính cũng có {{ui:Tangent from two points}} cho tuyến và {{ui:Move, copy and rotate}} cho tuyến, Pad, Parcel và Feature line. Xem [Vẽ với bắt điểm, góc chọn điểm và di chuyển, sao chép, xoay](topic:draft-with-snaps).
- **Chế độ xem Render trong 3D.** Nút {{ui:Render}} trên thanh 3D vẽ địa hình với màu tự nhiên, bầu trời, sương mờ và bóng đổ mềm. Nó không thay đổi mô hình. Menu {{ui:Sun}} giờ có các nút {{ui:Apply}} và {{ui:Close}}. Xem [Xem mặt bằng công trường trong 3D](topic:site-3d).
- **Mỗi lần một mục mở ra.** Bảng bên trái và bảng Thuộc tính mỗi lần mở một mục và đóng các mục khác. Các ô trên dải lệnh Landscape chứa nhiều công cụ là nút tách.

### Phân tích GIS

- **Phân tích.** {{ui:Surface}} › {{ui:More}} › {{ui:Analyze}} có vùng đệm, lớp phủ, nối không gian, chọn theo thuộc tính hoặc hình dạng, và đo. Mỗi công cụ tạo một lớp mới trong một bước hoàn tác.
- **Bảng thuộc tính.** Menu ba chấm của một lớp có {{ui:Attribute table…}} và {{ui:Style by attribute…}}. Xem [Phân tích lớp GIS](topic:gis-analysis) và [Làm việc với bảng thuộc tính của lớp](topic:gis-table).

### Công trường: nắng, năng lượng mặt trời, tiện nghi và gió

- **Mục Môi trường.** Chọn một khối: mục {{ui:Environment}} nằm dưới {{ui:Sun hours}} trong Thuộc tính của khối. Mục này có khảo sát bóng đổ (bản đồ, bảng, hoạt hình, CSV), sản lượng năng lượng mặt trời từ tệp thời tiết một năm điển hình (.epw) và tiện nghi ngoài trời (UTCI).
- **Gió, chỉ để sàng lọc.** {{ui:Run wind study}} tô màu mặt đất từ mức ngồi được đến không thoải mái theo từng hướng gió trong tệp thời tiết. Kết quả chưa được kiểm định và bảng điều khiển có ghi rõ điều này.
- **Tiện ích gió tại người đi bộ (OpenFOAM).** Tắt cho đến khi bạn bật trong {{ui:Settings}} › {{ui:Add-ons}}. OpenFOAM là phần mềm bạn tự cài. Xem [Bóng đổ, sản lượng năng lượng mặt trời và tiện nghi ngoài trời](topic:environment).

### Đám điểm (tiện ích bổ sung)

- Bật {{ui:Point clouds}} trong {{ui:Settings}} › {{ui:Add-ons}}; một thẻ Đám điểm sẽ xuất hiện trong bảng bên phải. Mở tệp LAS hoặc LAZ, làm sạch, phân loại thành mặt đất, thực vật và công trình, dựng mặt đất, đường đồng mức và khối lượng, rồi xuất LAS hoặc LAZ. Xem [Đám điểm từ thiết bị bay không người lái hoặc máy quét](topic:point-clouds).

### WaterCraft (tiện ích bổ sung)

- Bật {{ui:WaterCraft (water distribution)}} trong {{ui:Settings}} › {{ui:Add-ons}}; một thẻ WaterCraft sẽ xuất hiện. Thẻ này có nhu cầu từ khách hàng, lưu lượng chữa cháy tại mọi trụ cứu hỏa, sự cố đường ống chính nào quan trọng nhất, và tuổi nước cùng clo, mỗi mục được lưu dưới dạng CSV. Xem [WaterCraft: nhu cầu, lưu lượng chữa cháy, sự cố và tuổi nước](topic:watercraft).

### Làm việc cùng nhau

- Trong phiên Live, bạn thấy con trỏ và tên của nhau trên mặt bằng. Về cây trồng trong thư viện: CivilCraft Landscape bắt đầu từ bộ sưu tập Thư viện mặc định, {{ui:CivilCraft landscape}}.

## Trong mọi ứng dụng

- Gợi ý hiển thị dưới dạng chú giải công cụ Bootstrap, và mẹo khởi động có thể đóng lại.
- Dải thẻ của bảng không vừa sẽ cuộn thay vì bị cắt.
- Tiêu đề thẻ trình duyệt có dạng `<document> - CivilCraft | CadCraft`.
- {{ui:Settings}} có mục Bố cục, trong đó các bố cục là danh sách thả xuống gồm các lựa chọn hai dòng.
- Đơn vị trọng lượng và nhiệt độ nằm trong {{ui:Settings}} › {{ui:Global}} › {{ui:Units}}.
- Danh sách ngôn ngữ hiển thị các ngôn ngữ mà bản dựng có tệp. Các ngôn ngữ khác tiếng Anh là bản nháp máy.

## Đã sửa

- Các tiện ích tra cứu địa chỉ và kiểm tra EnergyPlus không bật được; giờ đã bật được.
- Trợ giúp nay ghi rõ tiện ích Đám điểm ghi đám điểm đã làm sạch dưới dạng LAS 1.4 hoặc LAZ.
- Nhấp vào nút grip của chính đối tượng đang chọn không còn bắt đầu kéo grip làm dừng một lệnh Pick đang chờ.

## Giới hạn thực tế

- Các mẫu hành lang ví dụ là giá trị giữ chỗ không theo tiêu chuẩn nào; kỹ sư phải kiểm tra. Mẫu địa hình không thêm bề mặt và không được vẽ trong 3D hay trong chế độ xem mặt cắt. Hành lang thứ hai trên một tuyến không có trong xuất IFC. Không có sự thu hẹp dần giữa hai mẫu theo cọc.
- Đám điểm được thử trên tệp giả lập, không phải khảo sát bằng thiết bị bay thực tế. Chỉ đọc được LAS và LAZ.
- Phân tích GIS được thử trên các lớp giả lập.
- Bóng đổ, năng lượng mặt trời và tiện nghi là ước tính phục vụ quy hoạch; gió là sàng lọc chưa kiểm định. Không mục nào là giá trị thiết kế.
- WaterCraft là công cụ hỗ trợ tính toán, được kiểm tra trên mạng lưới giả lập. Kỹ sư cấp thoát nước quyết định các con số có giá trị đến đâu.
- Các ngôn ngữ ngoài tiếng Anh là bản nháp máy.
- Trình cài đặt Windows chưa được ký mã, và ảnh đĩa macOS chưa được công chứng.

## Trước đó: 0.8 và 0.8.1

Đây là những thay đổi trong CivilCraft 0.8 (2026-11-01) và 0.8.1 (2026-11-02) so với 0.7. Các phần mới chính là công cụ kiểm tra việc san nền và công trường (mưa, đào đắp, tuyến, ao, tiến độ) và sáu cửa sổ tính toán cho nền, đường, khảo sát, mỏ, tuyến vô tuyến và đường sắt.

### Mới

**Kiểm tra việc san nền**

- **Tạo mưa.** {{ui:Make it rain…}} (trong {{ui:Surface}}) thả một trận mưa lớn xuống mặt đất đã san. Bạn xem nước chảy khỏi các Pad, đọng ở các góc trũng và tràn qua các ao quá nhỏ. Quá trình chạy có hoạt hình và cho ra khối lượng, lưu lượng đỉnh và một CSV của mọi ao. Ô mặc định thô để xem nhanh; ô mịn hơn sẽ chậm hơn. Các ao bị tràn cũng hiện trong bảng Vấn đề.
- **Cân bằng đất.** {{ui:Earthwork balancer…}} nâng hoặc hạ một Pad cho đến khi đào bằng đắp, và hiển thị bảng vận chuyển giữa chúng.
- **Tuyến tốt nhất.** {{ui:Best route…}}: chọn điểm đầu và điểm cuối, CivilCraft sẽ tìm đường rẻ nhất qua địa hình, giữ trong giới hạn độ dốc và độ cong của bạn, rồi tạo tuyến từ đó.
- **Ao điều tiết.** {{ui:Detention ponds…}} tính cao độ và dung tích từ địa hình của bạn, nhận các thiết bị xả (lỗ, đập tràn, khe chữ V, đập xả), cho một trận mưa chảy qua ao và kiểm tra lưu lượng đỉnh được giữ lại, thời gian hạ mực nước và cao độ an toàn.
- **Tiến độ từ khảo sát.** {{ui:Progress from surveys…}} so sánh các bề mặt từ thiết bị bay không người lái hoặc máy quét ở các ngày khác nhau với mặt đất lúc đó và với thiết kế: phần trăm hoàn thành theo khối lượng, các khu vực đào quá và đắp quá, bãi chứa đất, và thời điểm công việc kết thúc với tốc độ này (được đánh dấu là ước tính).

**Hiểu công trường**

- **Từ địa chỉ đến công trường.** {{ui:Address to site…}} gom dữ liệu thửa đất, công trình, quy hoạch, đất, lũ và địa hình đang mở vào một công trường. Bạn có thể giữ công trường trong tệp dự án: địa chỉ đã nhập, từng nguồn cùng ngày lấy và giấy phép, và kết quả trả về. Mở lại hoặc chia sẻ dự án thì công trường vẫn còn, không cần lấy lại dữ liệu. Bạn cũng có thể lưu thành tệp công trường hoặc gửi sang BimCraft. Xem [Từ địa chỉ đến công trường](topic:address-to-site).

**Nền, đường, khảo sát, mỏ, tuyến và đường sắt**

- **Đất và mái dốc.** {{ui:Soils and slopes…}} vẽ mặt cắt đất giữa các lỗ khoan bạn nhập. Phương pháp Bishop sau đó tìm vòng trượt nguy hiểm nhất trên mặt đất của bạn, với mực nước ngầm, tải phụ và hệ số động đất; độ lún của móng có tính cố kết, lún tức thời và thời gian.
- **Nút giao và sơn vạch.** {{ui:Junctions and striping…}} ghép các nhánh bằng cung vát bó vỉa (một bán kính cho mỗi nhánh, hoặc cung ba tâm), tầm nhìn theo tốc độ thiết kế, kiểm tra tam giác tầm nhìn, vạch sang đường, vạch dừng, vạch kẻ và biển báo cùng bảng biển báo. Chúng được vẽ trên mặt bằng và lưu thành .dxf với các lớp đặt tên.
- **Bình sai đo đạc.** {{ui:Survey adjustment…}} chạy bình sai bình phương tối thiểu cho một đường chuyền hoặc mạng lưới: tọa độ đã bình sai, elip sai số, kiểm định chi-bình phương và đánh dấu phép đo không khớp. Có các mạng tự do, khép đường chuyền theo quy tắc la bàn và RW5, các tệp hiện trường GSI, JobXML hoặc CSV; các điểm đã bình sai được lưu thành CSV.
- **Mỏ lộ thiên.** {{ui:Open pits…}} biến mẫu khoan thành mô hình khối và hố khai thác tới hạn trong góc dốc của bạn, kèm tỷ số bóc đất, bảng theo bậc và đường cong hàm lượng–tấn lượng. Có hố lồng nhau theo hệ số doanh thu và lịch khai thác với dòng tiền chiết khấu.
- **Tuyến vô tuyến.** {{ui:Radio links…}} kiểm tra tầm nhìn thẳng qua địa hình có tính độ cong của Trái Đất, vùng Fresnel thứ nhất, ngân sách đường truyền, dự phòng suy hao và sự cố đa đường, và cho chiều cao cột cần có để vượt qua đường truyền. Nó cũng tính ngân sách suy hao cáp quang, khối lượng tuyến và gió tác động lên tháp.
- **Ghi đường sắt.** {{ui:Rail turnouts…}} tạo ghi từ số hiệu tim ghi, đường giao chéo giữa các đường song song, và khổ giới hạn nghiêng theo siêu cao và mở rộng trên đường cong. Ghi có thể đặt tại một cọc của tuyến.

Xem [Đất, nút giao, bình sai đo đạc, mỏ, tuyến vô tuyến và ghi đường](topic:soils-roads-survey-mines-links).

### Trong mọi ứng dụng

- **Ngôn ngữ.** 54 ngôn ngữ, trong đó mười ngôn ngữ mới. Các ngôn ngữ ngoài tiếng Anh là bản nháp máy cho đến khi người bản ngữ đọc lại. Các chủ đề trợ giúp vẫn chủ yếu bằng tiếng Anh.
- **Số hàng thanh công cụ.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Wrap (như trước), 2 hàng hoặc 1 hàng. Dải lệnh của CivilCraft hiển thị công cụ dùng nhiều nhất lớn, các công cụ tiếp theo nhỏ, và phần còn lại nằm sau mũi tên của tên nhóm.
- **Thiết bị nhập.** Bàn di chuột, bút, chuột 3D, bộ điều khiển và MIDI có thể điều khiển các ứng dụng.
- **Vấn đề.** Bảng Vấn đề cảnh báo trong mọi ứng dụng, với các kiểm tra đọc từ bộ quy định.
- **Live.** Chế độ xem ai đang ở đâu trong phiên Live.
- **Tiện ích bổ sung.** Danh sách tiện ích bổ sung, kèm các tiện ích chiếu sáng.
- **Kết nối AI.** Bất kỳ trợ lý nào bạn kết nối đều có thể điều khiển các công cụ của CivilCraft. Đi kèm ghi chú rằng kết nối một chạm trong CadCraft Studio và trình kết nối được lưu trữ chưa sẵn sàng. Xem [Để trợ lý AI làm việc với công trường của bạn](topic:assistants).

### Đã sửa trong 0.8.1

- **Mục lớp DWG.** Mục này bị đọc sai kiểu (GitHub cadcraft#5). Đã sửa trong CivilCraft cùng với CadCraft, BimCraft, ModelCraft và TakeoffCraft.
- **Đổi ngôn ngữ khi đang chạy.** CadCraft Studio và các bản đóng gói có thể đổi ngôn ngữ khi đang chạy. Trước đây chỉ có tiếng Anh. Chưa thử trên mọi nền tảng: hãy cho chúng tôi biết nếu ngôn ngữ không đổi.

### Chưa có trong phiên bản này

- **Đây là công cụ hỗ trợ tính toán.** Mọi kết quả trong các cửa sổ mới đều cần kỹ sư kiểm tra. Cường độ đất bắt đầu từ giá trị điển hình của nhóm đất, và cửa sổ có ghi điều này.
- **Tạo mưa.** Một lần chạy trên công trường mẫu có thể mất hơn hai phút trên trình duyệt ở ô mịn. Đã kiểm tra với các trường hợp tính tay và một lưu vực hình chữ V, nhưng chưa kiểm tra trên công trường san nền thực tế.
- **Từ địa chỉ đến công trường.** Công cụ đọc các tệp dữ liệu mở bạn cung cấp và chỉ được thử trên tệp của chúng tôi. Cây cối không phải là nguồn dữ liệu. Việc tự lấy nguồn dữ liệu đang chờ nội dung về quyền riêng tư.
- **Tiến độ từ khảo sát.** Chỉ thử trên khảo sát giả lập. Tiến độ trên bản vẽ và đánh dấu (MarkupCraft) và so sánh quét với mô hình (BimCraft) chưa được xây dựng.
- **Đất và mái dốc.** Chỉ có mặt tròn: không có tìm kiếm theo nêm hay khối và không có khe nứt do kéo.
- **Nút giao.** Một bán kính cho mỗi nhánh, không có quỹ đạo quay xe tải, và chưa đưa vào hành lang.
- **Tệp hiện trường.** Bộ đọc được viết theo mô tả định dạng công khai và thử trên tệp chúng tôi tạo. Cần tệp từ thiết bị đo thực tế.
- **Tuyến và đường sắt.** Tuyến vô tuyến: chỉ có suy hao không gian tự do và đa đường (không có suy hao do mưa hay mẫu anten), và không có tiêu chuẩn đường sắt: mọi giới hạn đường sắt là giá trị giữ chỗ, với số liệu nháp mà kỹ sư đường sắt chưa kiểm tra.
- **Windows và macOS.** 0.8 chưa được ký mã. Windows có thể cảnh báo, và macOS yêu cầu nhấp chuột phải rồi chọn Mở.

Mọi thứ khác nằm trong [Chưa xây dựng](topic:not-built-yet). Về bản phát hành trước, xem [Có gì mới trong 0.7](topic:whats-new-0-7).
