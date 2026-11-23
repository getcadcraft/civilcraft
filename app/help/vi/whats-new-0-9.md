---
title: Có gì mới trong 0.9 (bản trước)
summary: Mẫu hành lang và mẫu địa hình, bắt điểm và nút Chọn khi vẽ, phân tích GIS với bảng thuộc tính, nghiên cứu bóng, sản lượng năng lượng mặt trời, độ thoải mái và gió cho một khu đất, chế độ Kết xuất 3D, và các tiện ích Đám điểm và WaterCraft.
keywords: có gì mới 0.9, bản phát hành trước, có gì mới, 0.9, ghi chú phát hành, mẫu hành lang, mẫu địa hình, trình chỉnh sửa mẫu, mặt cắt điển hình, nhiều hành lang, bắt điểm, chọn, di chuyển, sao chép, xoay, tiếp tuyến, kết xuất, kết xuất 3d, phân tích gis, đệm, chồng lớp, nối không gian, bảng thuộc tính, tô màu theo thuộc tính, nghiên cứu bóng, sản lượng năng lượng mặt trời, utci, độ thoải mái ngoài trời, nghiên cứu gió, openfoam, đám điểm, las, laz, watercraft, lưu lượng chữa cháy, trụ cứu hỏa, tuổi nước, clo, nhu cầu, gợi ý, bố cục, nhật ký thay đổi, thay đổi, 0.8, 0.8.1, phiên bản, tính năng mới, mưa, nước đọng, tràn, khối lượng đất, cân bằng, đào đắp, vận chuyển, tuyến tốt nhất, đường ít chi phí nhất, tuyến, ao điều tiết, cửa xả, hạ mực nước, chiều cao an toàn, tiến độ, khảo sát, máy bay không người lái, bãi chứa, địa chỉ đến công trường, thửa đất, đất, lũ lụt, ổn định mái dốc, bishop, lún, nút giao, kẻ vạch, biển báo, tầm nhìn, bình sai, bình phương tối thiểu, đường chuyền, mỏ lộ thiên, mô hình khối, liên kết vô tuyến, fresnel, ghi, đường ghi, ngôn ngữ, sự cố, trực tiếp, dwg
from: 4664522c
---

Đây là những thay đổi trong CivilCraft 0.9, so với 0.8.1. CivilCraft 0.9 là một phần của CadCraft Studio 0.9 và tám ứng dụng của nó. Các phần lớn là mẫu hành lang và mẫu địa hình, bắt điểm khi vẽ, phân tích GIS, các nghiên cứu về nắng, sản lượng năng lượng mặt trời, độ thoải mái và gió của một khu đất, và hai tiện ích: Đám điểm và WaterCraft.

## Mới

### Mẫu hành lang và mẫu địa hình

- **Mẫu hành lang.** Mở {{ui:Bề mặt}} › {{ui:Thêm}} › {{ui:Mẫu hành lang…}} (hoặc gõ {{cmd:TEMPLATES}}). Một mẫu là một mặt cắt ngang nhỏ với các thành phần, độ lệch, độ dốc, vật liệu và mã điểm. Giữ chúng trong dự án, trong {{ui:Thư viện của tôi}} hoặc dưới dạng tệp `.cctemplates.json`. Trình chỉnh sửa mẫu hiện bản vẽ đúng tỷ lệ thật và liệt kê các vấn đề khi bạn gõ.
- **Dựng từ mẫu theo cọc.** Chọn một tuyến và bật {{ui:Dựng từ mẫu theo cọc}} trong Thuộc tính của nó. Mỗi bên của mỗi vùng có danh sách mặt đường và điều kiện kết thúc riêng. {{ui:Thêm hành lang}} dưới {{ui:Các hành lang trên tuyến này}} đặt nhiều hành lang lên một tuyến.
- **Mẫu địa hình.** {{ui:Bề mặt}} › {{ui:Thêm}} › {{ui:Mẫu địa hình…}} (hoặc gõ {{cmd:TERRAINTEMPLATES}}) phủ các vật liệu nhiều lớp như đất mặt, mặt đường và lớp nền lên một địa hình, với diện tích và khối lượng cho mỗi lớp. Xem [Mẫu hành lang và mẫu địa hình](topic:corridor-templates).

### Vẽ

- **Bắt điểm.** Các công cụ Tuyến, Nền, Thửa đất, Khối, Đường đặc trưng, Đo, Ranh giới và Lưu vực bắt vào điểm khảo sát, PI, góc, đỉnh và công trình, với một nhãn bên cạnh dấu. Giữ {{key:Alt}} để có điểm tự do.
- **Nút Chọn, tiếp tuyến và di chuyển, sao chép, xoay.** Các góc của nền, thửa đất và đường đặc trưng có ô nhập Đông và Bắc cùng nút Chọn hình dấu thập. Thuộc tính cũng có {{ui:Tiếp tuyến từ hai điểm}} cho tuyến và {{ui:Di chuyển, sao chép và xoay}} cho tuyến, nền, thửa đất và đường đặc trưng. Xem [Vẽ với bắt điểm, góc đã chọn và di chuyển, sao chép, xoay](topic:draft-with-snaps).
- **Kết xuất trong 3D.** Nút {{ui:Kết xuất}} trên thanh 3D vẽ đất với màu tự nhiên, bầu trời, sương mờ và bóng mềm. Nó không thay đổi mô hình. Menu {{ui:Mặt trời}} giờ có các nút {{ui:Áp dụng}} và {{ui:Đóng}}. Xem [Xem khu đất trong 3D](topic:site-3d).
- **Các mục mở từng cái một.** Bảng bên trái và bảng Thuộc tính mở một mục và đóng các mục khác, và các ô dải lệnh Cảnh quan chứa nhiều công cụ là nút tách.

### Phân tích GIS

- **Phân tích.** {{ui:Bề mặt}} › {{ui:Thêm}} › {{ui:Phân tích}} cung cấp đệm, chồng lớp, nối không gian, chọn theo thuộc tính hoặc hình dạng, và đo. Mỗi công cụ tạo một lớp mới trong một bước hoàn tác.
- **Bảng thuộc tính.** Menu ba chấm của một lớp có {{ui:Bảng thuộc tính…}} và {{ui:Tô màu theo thuộc tính…}}. Xem [Phân tích lớp GIS](topic:gis-analysis) và [Làm việc với bảng thuộc tính của lớp](topic:gis-table).

### Khu đất: nắng, năng lượng mặt trời, độ thoải mái và gió

- **Mục Môi trường.** Chọn một khối: mục {{ui:Môi trường}} nằm dưới {{ui:Giờ nắng}} trong Thuộc tính của nó. Nó có một nghiên cứu bóng (bản đồ, bảng, hoạt hình, CSV), sản lượng năng lượng mặt trời từ tệp thời tiết năm điển hình (.epw) và độ thoải mái ngoài trời (UTCI).
- **Gió, chỉ để sàng lọc.** {{ui:Chạy nghiên cứu gió}} tô màu mặt đất từ ngồi được đến khó chịu cho mỗi hướng gió trong tệp thời tiết. Nó chưa được kiểm định và bảng nói rõ điều đó.
- **Tiện ích gió đi bộ (OpenFOAM).** Tắt cho đến khi bạn bật nó trong {{ui:Cài đặt}} › {{ui:Tiện ích bổ sung}}. OpenFOAM là phần mềm bạn tự cài đặt. Xem [Bóng, sản lượng năng lượng mặt trời và độ thoải mái ngoài trời](topic:environment).

### Đám điểm (tiện ích)

- Bật {{ui:Đám điểm}} trong {{ui:Cài đặt}} › {{ui:Tiện ích bổ sung}}; một thẻ Đám điểm xuất hiện trong bảng bên phải. Mở một tệp LAS hoặc LAZ, làm sạch, phân loại thành mặt đất, thảm thực vật và công trình, dựng mặt đất, đường đồng mức và khối lượng, rồi xuất LAS hoặc LAZ. Xem [Đám điểm từ máy bay không người lái hoặc máy quét](topic:point-clouds).

### WaterCraft (tiện ích)

- Bật {{ui:WaterCraft (phân phối nước)}} trong {{ui:Cài đặt}} › {{ui:Tiện ích bổ sung}}; một thẻ WaterCraft xuất hiện. Nó có nhu cầu từ khách hàng, lưu lượng chữa cháy tại mọi trụ cứu hỏa, sự cố đường ống nào quan trọng nhất, và tuổi nước cùng clo, mỗi thứ được lưu dưới dạng CSV. Xem [WaterCraft: nhu cầu, lưu lượng chữa cháy, sự cố và tuổi nước](topic:watercraft).

### Làm việc cùng nhau

- Trong một phiên Live, bạn thấy con trỏ và tên của nhau trên mặt bằng. Cây trong thư viện: Cảnh quan CivilCraft bắt đầu từ bộ sưu tập Thư viện mặc định, {{ui:Cảnh quan CivilCraft}}.

## Trong mọi ứng dụng

- Gợi ý hiện dưới dạng chú thích công cụ Bootstrap, và thẻ mẹo khởi động có thể đóng lại.
- Dải thẻ của một bảng không vừa sẽ cuộn thay vì bị cắt.
- Tiêu đề thẻ trình duyệt có dạng `<document> - CivilCraft | CadCraft`.
- {{ui:Cài đặt}} có mục Bố cục, nơi các bố cục là danh sách thả xuống gồm các lựa chọn hai dòng.
- Đơn vị trọng lượng và nhiệt độ nằm trong {{ui:Cài đặt}} › {{ui:Chung toàn cục}} › {{ui:Đơn vị}}.
- Danh sách ngôn ngữ hiện các ngôn ngữ mà bản dựng có tệp. Các ngôn ngữ khác tiếng Anh là bản dịch máy.

## Đã sửa

- Các tiện ích tra cứu địa chỉ và kiểm tra EnergyPlus không bật được; giờ đã bật được.
- Trợ giúp nay ghi rằng tiện ích Đám điểm ghi một đám đã làm sạch thành LAS 1.4 hoặc LAZ.
- Nhấp vào núm của chính đối tượng đang chọn không còn bắt đầu kéo núm làm dừng một lần Chọn đang chờ.

## Giới hạn thực tế

- Các mẫu hành lang ví dụ là giá trị tạm không dựa trên tiêu chuẩn nào; một kỹ sư phải kiểm tra chúng. Mẫu địa hình không thêm bề mặt và không được vẽ trong 3D hay trong khung mặt cắt. Hành lang thứ hai trên một tuyến không có trong xuất IFC. Không có đoạn chuyển giữa hai mẫu theo cọc.
- Đám điểm được thử trên tệp giả, không phải một khảo sát máy bay không người lái thực. Chỉ đọc LAS và LAZ.
- Phân tích GIS được thử trên các lớp giả.
- Bóng, năng lượng mặt trời và độ thoải mái là ước tính quy hoạch; gió là sàng lọc chưa kiểm định. Không cái nào là giá trị thiết kế.
- WaterCraft là công cụ tính toán được kiểm tra trên các mạng giả. Một kỹ sư cấp nước quyết định các số đó có giá trị gì.
- Các ngôn ngữ ngoài tiếng Anh là bản dịch máy.
- Trình cài đặt Windows chưa được ký mã, và ảnh đĩa macOS chưa được công chứng.

## Trước đó: 0.8 và 0.8.1

Đây là những thay đổi trong CivilCraft 0.8 (2026-11-01) và 0.8.1 (2026-11-02), so với 0.7. Các phần mới lớn là các công cụ kiểm tra cao độ và khu đất của bạn (mưa, khối lượng đất, tuyến đường, ao, tiến độ) và sáu cửa sổ tính toán cho mặt đất, đường, khảo sát, mỏ, liên kết và đường sắt.

### Mới

**Kiểm tra cao độ**

- **Làm mưa.** {{ui:Làm mưa…}} (dưới {{ui:Bề mặt}}) thả một trận mưa lớn xuống mặt đất đã san. Bạn xem nước chảy ra khỏi các nền, đọng trong các góc thấp và tràn qua các ao quá nhỏ. Lần chạy được hoạt hóa và cho khối lượng, lưu lượng đỉnh và CSV của mọi ao. Ô mặc định thô để xem nhanh ban đầu; ô mịn hơn thì chậm hơn. Các ao bị tràn cũng hiện trong bảng Vấn đề.
- **Cân bằng đất.** {{ui:Cân bằng đất…}} nâng hoặc hạ một nền cho đến khi đào bằng đắp, và hiện bảng vận chuyển giữa chúng.
- **Tuyến tốt nhất.** {{ui:Tuyến tốt nhất…}}: chọn điểm đầu và điểm cuối, và CivilCraft tìm đường rẻ nhất qua địa hình đi theo giới hạn độ dốc và độ cong của bạn, rồi tạo một tuyến từ nó.
- **Ao điều tiết.** {{ui:Ao điều tiết…}} tính cấp và dung tích từ mặt đất của bạn, nhận các thiết bị xả (lỗ, đập tràn, khe chữ V, tràn), cho một trận mưa chạy qua ao và kiểm tra lưu lượng đỉnh được giữ lại, thời gian rút nước và chiều cao an toàn.
- **Tiến độ từ khảo sát.** {{ui:Tiến độ từ các đợt khảo sát…}} so sánh bề mặt máy bay không người lái hoặc quét ở các ngày khác nhau với mặt đất khi đó và với thiết kế: phần trăm hoàn thành theo khối lượng, các vùng đào quá và đắp quá, các bãi chứa, và khi nào công việc kết thúc với tốc độ này (được ghi là ước tính).

**Biết khu đất**

- **Từ địa chỉ đến công trường.** {{ui:Từ địa chỉ đến công trường…}} xếp chồng dữ liệu thửa đất, công trình, quy hoạch, đất, lũ và địa hình mở trên một khu đất. Bạn có thể giữ khu đất trong tệp dự án: địa chỉ đã gõ, từng nguồn cùng ngày bạn lấy và giấy phép của nó, và những gì trả về. Mở lại hoặc chia sẻ dự án thì khu đất vẫn còn, không tải lại gì. Bạn cũng có thể lưu nó thành tệp khu đất hoặc gửi sang BimCraft. Xem [Từ địa chỉ đến công trường](topic:address-to-site).

**Mặt đất, đường, khảo sát, mỏ, liên kết và đường sắt**

- **Đất và mái dốc.** {{ui:Đất và mái dốc…}} vẽ mặt cắt đất giữa các lỗ khoan bạn nhập. Phương pháp Bishop sau đó tìm vòng tròn nguy hiểm nhất trên mặt đất của bạn, với mực nước ngầm, tải trọng phụ và hệ số động đất; lún của móng có cố kết, lún tức thời và thời gian.
- **Nút giao và kẻ vạch.** {{ui:Nút giao và sơn vạch…}} ghép các nhánh với bo góc bó vỉa (một bán kính cho mỗi nhánh, hoặc bo ba tâm), tầm nhìn cho tốc độ thiết kế, kiểm tra tam giác tầm nhìn, vạch sang đường, vạch dừng, vạch kẻ và biển báo cùng bảng biển. Chúng được vẽ trên mặt bằng và lưu thành .dxf với các lớp đặt tên.
- **Bình sai đo đạc.** {{ui:Bình sai đo đạc…}} chạy bình sai bình phương tối thiểu cho một đường chuyền hoặc mạng: tọa độ đã bình sai, elip sai số, kiểm định chi-bình phương và đánh dấu trên phép đo không khớp. Có mạng tự do, khép đường chuyền bằng quy tắc la bàn và RW5, các tệp thực địa GSI, JobXML hoặc CSV; các điểm đã bình sai lưu dưới dạng CSV.
- **Mỏ lộ thiên.** {{ui:Mỏ lộ thiên…}} biến mẫu khoan thành mô hình khối và hố tối hậu trong góc dốc của bạn, với tỷ số đất đá trên quặng, bảng theo bậc và đường cấp độ–tấn. Các hố lồng nhau theo hệ số doanh thu và lịch sản xuất có dòng tiền chiết khấu cũng có.
- **Tuyến vô tuyến.** {{ui:Tuyến vô tuyến…}} kiểm tra tầm nhìn thẳng qua mặt đất của bạn với độ cong của trái đất, vùng Fresnel thứ nhất, ngân sách đường truyền, dự trữ pha-đinh và mất tín hiệu đa đường, và cho chiều cao cột cần để vượt qua đường truyền. Nó cũng làm ngân sách suy hao cáp quang, khối lượng tuyến và gió lên cột.
- **Ghi đường sắt.** {{ui:Ghi đường sắt…}} tạo ghi từ số hiệu tim ghi của nó, các đường chéo giữa các đường song song, và khổ kiến trúc nghiêng theo siêu cao và mở rộng trên đường cong. Một ghi có thể đặt tại một cọc của tuyến.

Xem [Đất, nút giao, bình sai, mỏ lộ thiên, tuyến vô tuyến và ghi đường sắt](topic:soils-roads-survey-mines-links).

### Trong mọi ứng dụng

- **Ngôn ngữ.** 54 ngôn ngữ, trong đó mười ngôn ngữ mới. Các ngôn ngữ ngoài tiếng Anh là bản dịch máy cho đến khi người bản ngữ đọc chúng. Các chủ đề trợ giúp vẫn chủ yếu bằng tiếng Anh.
- **Hàng thanh công cụ.** {{ui:Cài đặt}} › {{ui:Chung}} › {{ui:Số hàng thanh công cụ}}: Ngắt dòng (như trước), 2 hàng hoặc 1 hàng. Dải lệnh của CivilCraft hiện công cụ dùng nhiều nhất lớn, các công cụ tiếp theo nhỏ, và phần còn lại nằm sau mũi tên của tên nhóm.
- **Thiết bị nhập.** Bàn di chuột, bút, chuột 3D, tay cầm và MIDI đều có thể điều khiển các ứng dụng.
- **Vấn đề.** Bảng Vấn đề cảnh báo trong mọi ứng dụng, với các kiểm tra đọc các bộ quy định.
- **Live.** Một khung cho biết ai ở đâu trong một phiên Live.
- **Tiện ích bổ sung.** Danh sách tiện ích bổ sung, có các tiện ích chiếu sáng.
- **Kết nối AI của bạn.** Bất kỳ trợ lý nào bạn kết nối đều có thể điều khiển các công cụ của CivilCraft. Nó đi kèm ghi chú rằng kết nối một chạm trong CadCraft Studio và trình kết nối lưu trữ chưa sẵn sàng. Xem [Để trợ lý AI làm việc với khu đất của bạn](topic:assistants).

### Đã sửa trong 0.8.1

- **Phần lớp DWG.** Nó được đọc sai kiểu (GitHub cadcraft#5). Đã sửa trong CivilCraft cùng với CadCraft, BimCraft, ModelCraft và TakeoffCraft.
- **Đổi ngôn ngữ khi đang chạy.** CadCraft Studio và các bản đóng gói có thể đổi ngôn ngữ khi đang chạy. Trước đây chỉ có tiếng Anh. Chưa thử trên mọi nền tảng: hãy cho chúng tôi biết nếu ngôn ngữ không đổi.

### Chưa có trong phiên bản này

- **Đây là các công cụ tính toán.** Mọi kết quả trong cửa sổ mới đều cần kỹ sư kiểm tra. Cường độ đất bắt đầu từ giá trị điển hình của nhóm đất, và cửa sổ nói điều đó.
- **Làm mưa.** Một lần chạy trên khu mẫu có thể mất hơn hai phút trên trình duyệt ở ô mịn. Nó đã được kiểm tra với các trường hợp tính tay và một lưu vực hình chữ V, chưa thử trên một khu đã san thực.
- **Từ địa chỉ đến công trường.** Nó đọc các tệp dữ liệu mở bạn mang đến, và chỉ được thử trên tệp của chúng tôi. Cây không phải là nguồn. Việc tự lấy nguồn cho bạn đang chờ điều khoản về quyền riêng tư.
- **Tiến độ từ khảo sát.** Chỉ thử trên khảo sát giả. Tiến độ trên bản vẽ và đánh dấu (MarkupCraft) và quét so với mô hình (BimCraft) chưa được xây dựng.
- **Đất và mái dốc.** Chỉ mặt tròn: không có tìm kiếm hình nêm hay khối và không có vết nứt do kéo.
- **Nút giao.** Một bán kính cho mỗi nhánh, không có vết quét xe tải, và chưa đi vào hành lang.
- **Tệp thực địa.** Bộ đọc được viết từ mô tả định dạng công khai và thử trên tệp chúng tôi tạo. Cần tệp thiết bị thực.
- **Liên kết và đường sắt.** Tuyến vô tuyến: chỉ suy hao không gian tự do và đa đường (không có pha-đinh mưa hay mẫu anten), và không có tiêu chuẩn đường sắt: mọi giới hạn đường sắt là giá trị tạm, với các số nháp mà không kỹ sư đường sắt nào kiểm tra.
- **Windows và macOS.** 0.8 chưa được ký mã. Windows có thể cảnh báo, và macOS yêu cầu nhấp chuột phải rồi Mở.

Mọi thứ khác có trong [Chưa xây dựng](topic:not-built-yet). Về bản phát hành trước, xem [Có gì mới trong 0.7](topic:whats-new-0-7).
