---
title: Thiết kế một khu vườn, từ đầu đến cuối
summary: Mười bước của kiến trúc sư cảnh quan, từ khảo sát đến bộ xuất bản đã phát hành, với những gì Không gian làm việc Cảnh quan làm được cho mỗi bước hiện nay và những gì nó chưa làm.
keywords: hướng dẫn, chỉ dẫn từng bước, cách làm, thiết kế cảnh quan, thiết kế vườn, bắt đầu, ví dụ, mẫu, từng bước, khảo sát, đường nét, địa hình, trồng cây, bảng thống kê, tờ, xuất bản, một dự án
from: 87900bf5
---

Một thiết kế cảnh quan đi vòng tròn: khảo sát, phác thảo, đường nét, mặt đất, khu vực, cao độ, trồng cây, bảng thống kê, tờ, rồi quay lại. Đây là mười bước, với những gì có sẵn cho mỗi bước. Khi một bước còn thiếu, nó được ghi tên trong **Chưa xây dựng** ở cuối, chứ không bị giấu trong bước đó.

Bạn có thể làm theo trên công trường mẫu, hoặc trên bản vẽ khảo sát của riêng bạn. Với bản vẽ của riêng bạn, hãy bắt đầu từ bước 1.

## 1. Đưa khảo sát vào

{{ui:Surface}} › {{ui:Linework from a drawing…}}, chọn bản vẽ khảo sát (DWG 2000–2018 hoặc DXF). Kiểm tra đơn vị, lấy các đường đồng mức, polyline 3D và ranh giới cho bề mặt, và các khối điểm làm điểm khảo sát. Mục **Cao độ khảo sát và kiểm tra** đọc cao độ viết dạng văn bản hoặc thuộc tính và liệt kê những gì có vẻ sai (đơn vị, hệ tọa độ, khoảng cách từ gốc, đường đồng mức phẳng, cao độ bất thường, điểm bị lặp) trước khi bạn thêm bất cứ thứ gì. Xem [Kiểm tra bản vẽ khảo sát khi nhập](topic:survey-check) và [Mở DWG hoặc DXF làm đường nét](topic:open-dwg-dxf). Đặt hệ tọa độ bằng {{ui:Coordinate system…}}.

## 2. Phác thảo tay

Một tờ trên giấy, như khảo sát cũ hoặc bản in có đánh dấu, được đưa vào bằng {{ui:Scan…}} (Bắt đầu từ bản quét): nó được đặt theo tỷ lệ hoặc theo tọa độ đã biết dưới mặt bằng, và có thể được vẽ lại thành đường nét. ModelCraft đọc ảnh chụp bản phác thảo tay (Tệp › Nhập ảnh phác thảo…). Bản thân CivilCraft không có công cụ cho phác thảo tay: hãy đặt tờ dưới mặt bằng và vẽ lên trên nó.

## 3. Từ phác thảo đến đường nét

Vẽ đường đặc trưng và đường viền lên khảo sát trong CivilCraft, hoặc vẽ chúng trong bản vẽ 2D. Cảnh quan › Thêm › {{ui:From a line}} biến một đường thành lát nền, khu trồng cây, tường, bậc thang, đường đặc trưng và nhiều thứ khác, được giữ liên kết: di chuyển đường thì đối tượng đi theo. Xem [Đối tượng từ đường nét](topic:objects-from-lines). Trong SuperCad Studio, mở công trường, bản vẽ và mô hình công trình trong một dự án: không gian làm việc **Cảnh quan** có công cụ của tất cả, và một đường được chọn trong bản vẽ 2D có thể trở thành đối tượng cảnh quan đi theo nó (Ctrl+K, Đối tượng cảnh quan từ đường bản vẽ đã chọn).

## 4. Mặt đất đề xuất

Mở {{ui:Surface}} › {{ui:More}} › {{ui:Landscape workspace}}. Dựng mặt đất đề xuất bằng {{ui:Platform}}, {{ui:Berm}}, {{ui:Swale}} và các khu san nền với cao độ điểm và đường đồng mức; lát nền, lối đi, tường, dốc và bậc thang bạn thêm sẽ san vào cùng bề mặt đề xuất. Mặt đất hiện trạng không bao giờ thay đổi. {{ui:Levels}} › {{ui:Ground modifiers…}} liệt kê mọi thứ tạo hình mặt đất theo một thứ tự, với đào và đắp cho từng thứ. Xem [San nền](topic:landscape-grading) và [Yếu tố tạo mặt đất và cao độ trực tiếp](topic:ground-modifiers).

## 5. Lát nền và khu trồng cây

{{ui:Hardscape}} › {{ui:Paving}}, {{ui:Path}}, {{ui:Wall}}, {{ui:Kerb}}, {{ui:Ramp}} và {{ui:Steps}}. {{ui:Areas}} vẽ một bãi cỏ, luống, đồng cỏ hoặc lớp phủ mặt đất với cấu tạo lớp của nó; nó tự cắt xén quanh lát nền, tường và bậc thang. {{ui:Bed}} lấp đầy một khu vực theo khoảng cách của cây, từ một hỗn hợp cây. Xem [Cảnh quan cứng](topic:hardscape), [Khu trồng cây](topic:planted-areas) và [Trồng cây](topic:planting).

## 6. Cao độ, độ dốc và giao điểm

Dưới **Kiểm tra san nền**, đánh dấu **Phân tích độ dốc** và **Mũi tên dòng chảy và đọng nước**. Nếu nước đọng sát một sân thượng, hãy thêm {{ui:Swale}} quanh nó. Thuộc tính cho bạn biết bậc thang cần bao nhiêu alzơ và chúng có vừa không, và nơi lối đi dốc hơn giới hạn của nó. Bảng Vấn đề liệt kê nơi các đối tượng gặp nhau không ổn: tường cao quá, luống cao hơn lát nền, bậc thang không khớp với chiếu nghỉ. {{ui:Spot level}} và {{ui:Gradient arrow}} ghi nhãn mặt đất và tự cập nhật.

## 7. Trồng cây

Trong **Cây**, tìm trong danh sách cây (vài trăm loài, hoặc danh sách của riêng bạn), chọn một loài, rồi {{ui:Plant}}, {{ui:Bed}} hoặc {{ui:Hedge}}. Đặt kích thước và nhãn của cây từ Thêm. Thêm › {{ui:Plant table}} sửa các bản ghi của riêng bạn: giống, kích thước cung cấp, mật độ, ghi chú quy cách. Mỗi bản ghi có thể mang ký hiệu và mô hình 3D của riêng bạn (OBJ, STL hoặc GLB), và Thêm › {{ui:Plant graphics}} vẽ cây đơn giản hơn ở tỷ lệ thô hơn. Xem [Danh sách cây](topic:plant-list), [Bản ghi cây](topic:plant-records) và [Đồ họa cây](topic:plant-graphics).

## 8. Khối lượng và bảng thống kê

Thêm › {{ui:Worksheets}}: bảng thống kê cây và cảnh quan cứng, cùng bảng của riêng bạn, vẫn liên kết với các đối tượng; lưu chúng dưới dạng CSV hoặc XLSX, hoặc đặt lên các tờ (xem [Bảng thống kê](topic:worksheets)). Thêm › {{ui:Plant schedule…}} gửi số lượng sang TakeoffCraft. Khối lượng cảnh quan cứng nằm trong Thuộc tính của lát nền, tường và bậc thang. Hệ tưới tiêu có danh mục vật tư riêng: {{ui:Irrigation}} › **Kiểm tra hệ thống…**. Xem [Tưới tiêu](topic:irrigation).

## 9. Bản vẽ và tờ

Thêm › {{ui:Landscape sheets…}}: mặt bằng trồng cây, san nền và tưới tiêu, cùng chi tiết. {{ui:Levels}} › {{ui:Section line}} vẽ mặt cắt qua đất, tường, cấu tạo lớp, bậc thang và cây. Xem [Tờ cảnh quan](topic:landscape-sheets) và [Mặt cắt và bộ xuất bản](topic:landscape-sections).

## 10. Xuất bản

{{ui:Publish set (.zip)}} trong hộp thoại Tờ tạo một PDF với danh sách tờ và một DWG cho mỗi tờ. Thêm › {{ui:Export landscape IFC}} đưa cây và cảnh quan cứng sang BimCraft. Lưu dự án: mọi thứ nằm trong một tệp.

## Thay đổi một thứ: cầu thang

Điểm của việc giữ mọi thứ trong một dự án là thay đổi được lan truyền. Hãy thử với một dãy bậc giữa hai sân thượng:

1. Vẽ đường của dãy bậc như một đường đặc trưng (hoặc một đường trong bản vẽ), rồi Cảnh quan › Thêm › {{ui:From a line}} › {{ui:Steps}}. Trong Thuộc tính của bậc, đánh dấu **Tạo hình mặt đất**, và đặt cao độ đáy và đỉnh là hai sân thượng.
2. Vẽ một luống trồng cây bên cạnh và dưới dãy bậc bằng {{ui:Areas}}, và lát nền trên các sân thượng. Luống tự cắt xén quanh bậc và lát nền, và bảng thống kê cây chỉ đếm những gì được trồng.
3. Nâng cao độ đỉnh của dãy bậc trong Thuộc tính. Mặt đất đề xuất, cao độ điểm, mũi tên độ dốc và đào đắp thay đổi ngay. Nếu dãy bậc không còn gặp sân thượng trên, Bảng Vấn đề cho biết lệch bao nhiêu.
4. Di chuyển đường của dãy bậc. Bậc đi theo đường của nó trong cùng một bước hoàn tác; luống được cắt xén lại và đếm lại, và bảng thống kê cùng các bảng tính hiển thị số mới.
5. Nhấn Ctrl+Z một lần: đường, bậc, mặt đất và luống quay về cùng lúc.

Xem [Yếu tố tạo mặt đất và cao độ trực tiếp](topic:ground-modifiers), [Khu trồng cây](topic:planted-areas) và [Bảng thống kê](topic:worksheets).

## Chưa xây dựng

Đây là những thứ được yêu cầu nhưng chưa có trong bản dựng này:

- Tường tạo hình mặt đất (chúng báo nơi chúng gặp mặt đất, và đỉnh của chúng có thể theo mặt đất đó).
- Chỉnh sửa danh sách cây Thư viện của riêng bạn trong ứng dụng (sửa danh sách của dự án và lưu nó thành một tệp cây).
- Kết cấu và màu sắc của mô hình cây GLB riêng của bạn (hình dạng được đọc; màu của cây được dùng).

Xem [Không gian làm việc Cảnh quan](topic:landscape) để biết mọi công cụ.
