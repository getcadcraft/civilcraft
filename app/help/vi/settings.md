---
title: Cài đặt CivilCraft
summary: Chọn thứ tự cột cho các hàng điểm được sao chép và dán và để đoán cột của tệp, cách các điểm được dán được đánh số, các nhãn điểm hiển thị gì, chỉ báo góc, độ phóng đại đứng 3D, cách hiển thị vĩ độ và kinh độ, và các lớp bản đồ có lấy từ internet hay không.
keywords: cài đặt, tùy chọn, pnezd, penzd, thứ tự cột, hàng điểm, đánh số lại, số điểm, số bắt đầu, nhãn điểm, nhãn, mô tả, cao độ, khối xem, biểu tượng trục, chỉ báo góc, la bàn, phóng đại đứng, 3d, vĩ độ, kinh độ, dms, độ thập phân, lớp bản đồ, internet, quyền riêng tư
from: 64b9cb92
---

Mở {{ui:Settings}} bằng biểu tượng bánh răng trên thanh ứng dụng hoặc {{key:Mod+,}}. Thẻ đầu tiên, {{ui:CivilCraft}}, chứa các cài đặt thuộc về ứng dụng này; {{ui:General}} chứa các cài đặt mà mọi ứng dụng CadCraft dùng chung (giao diện, thanh công cụ, bảng). Cài đặt của CivilCraft chỉ tồn tại trong ứng dụng: bạn thay đổi chúng ở đây, và trình duyệt này sẽ ghi nhớ chúng. {{ui:Reset CivilCraft settings}} đặt lại mọi cài đặt về mặc định ban đầu.

## Hàng điểm

**P, N, E, Z, D** (ban đầu) hoặc **P, E, N, Z, D**: điểm, bắc, đông, cao độ, mô tả, hoặc đông trước bắc. Nó được dùng ở ba nơi:

- **Sao chép**: các hàng CivilCraft đặt lên bộ nhớ tạm của hệ thống để dán vào bảng tính.
- **Dán**: các hàng được dán từ bảng tính hoặc tệp văn bản không có hàng tiêu đề.
- **Nhập**: giá trị đoán trong hộp thoại **Nhập điểm** khi tệp không có hàng tiêu đề (tệp bốn cột được đọc là PENZ, ba cột là ENZ). Xem [Định dạng tệp điểm](topic:point-file-formats).

Hàng tiêu đề có tên cột luôn được ưu tiên, và lựa chọn trong danh sách **Cột** của hộp thoại nhập cũng vậy.

## Số cho các điểm được dán

- **Giữ số tự do** (ban đầu): một điểm được dán giữ số của nó khi không có điểm nào mang số đó; chỉ các điểm trùng sẽ nhận số mới.
- **Luôn dùng số mới**: mọi điểm được dán nhận một số mới, kể cả khi số của nó còn trống.

**Số mới bắt đầu từ**: để trống để đếm tiếp từ một số lớn hơn số cao nhất đang dùng một đơn vị. Nhập một số, ví dụ 5000, để các điểm mới nhận số từ 5000 trở lên; các số đã dùng sẽ được bỏ qua. Hai điểm không bao giờ chia sẻ cùng một số theo cả hai cách. Xem [Chọn, sao chép và dán điểm đo](topic:copy-paste-points#point-numbers-never-clash).

## Nhãn điểm

Nội dung hiển thị của nhãn điểm khi {{ui:Point labels}} được bật trong **Hiển thị**: **Số**, **Số và cao độ**, hoặc **Số, cao độ và mô tả** (ban đầu). Các bản xuất DXF, DWG và PDF hiển thị các nhãn giống như trên màn hình.

## Chỉ báo góc

Thứ nằm ở góc của bình đồ và khung nhìn 3D: **Khối xem** (ban đầu), **Biểu tượng trục** hoặc **Không có**.

- **Khối xem** (góc trên bên phải). Trên bình đồ, nó hiển thị mặt trên, với vành la bàn: N là bắc lưới (lên trên bình đồ). Nhấp vào bất kỳ mặt, cạnh hoặc góc nào khác của khối, hoặc kéo nó, và [khung nhìn 3D](topic:site-3d) mở ra nhìn từ đó. {{ui:Home}} trên khối của bình đồ làm vừa bình đồ.
- Trong khung nhìn 3D, khối xoay theo khung nhìn: nhấp một mặt, cạnh hoặc góc để nhìn từ đó, kéo khối để xoay quanh, kéo vành la bàn để xoay quanh trục đứng, nhấp một chữ cái để nhìn từ phía đó, và dùng {{ui:Home}} để có khung nhìn đẳng cự của toàn bộ công trường. Khi nhìn thẳng vào một mặt, các mũi tên nhỏ chuyển sang mặt kế tiếp và các mũi tên cong xoay khung nhìn một góc phần tư.
- **Biểu tượng trục** (góc dưới bên trái): một dấu X nhỏ (đông) và Y (bắc) trên bình đồ, X, Y và Z (lên trên) trong 3D.

## Phóng đại đứng 3D

Khung nhìn 3D kéo giãn cao độ bao nhiêu: **1×**, **2×** (ban đầu), **3×**, **5×** hoặc **10×**. Danh sách trên thanh của khung nhìn 3D là cùng một cài đặt, nên thay đổi một trong hai sẽ thay đổi cả hai. Khối lượng, trắc dọc và các bản xuất 3D giữ tỷ lệ thật.

## Vĩ độ và kinh độ

Cách thanh trạng thái hiển thị vĩ độ và kinh độ của con trỏ khi dự án có hệ tọa độ: **độ, phút và giây** (ban đầu, ví dụ `30°18′00.00″ N`) hoặc **độ thập phân** (`30.300000° N`). Xem [Đặt hệ tọa độ của dự án](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Lớp bản đồ từ internet

**Tắt** (ban đầu) hoặc **Bật**. Khi bật, CivilCraft yêu cầu các máy chủ bản đồ bạn thêm vào cung cấp hình ảnh của khu vực trên màn hình. Bản vẽ của bạn vẫn ở trên máy tính này; máy chủ thấy khu vực và địa chỉ internet của bạn. Khi tắt, không có máy chủ bản đồ nào được yêu cầu gì, ngay cả khi một dự án bạn mở có nêu một máy chủ; một ảnh có tọa độ từ tệp thì vẫn hoạt động trong cả hai trường hợp. Xem [Hiển thị lớp bản đồ dưới bình đồ](topic:map-layers).

## Trợ lý

**Cho phép trợ lý AI và tập lệnh dùng CivilCraft** (tắt từ đầu) cho phép một trợ lý trên máy tính của bạn kết nối với công trường đang mở qua CadCraft Studio: **Đọc** mô tả công trường và cung cấp điểm, cao độ mặt, cọc, trắc dọc, khối lượng và thửa đất; **Sửa** cho phép nó chọn và thêm điểm đo; **Lưu** và **Xuất** cho phép nó lưu dự án hoặc ghi LandXML hay DWG. **Thư mục được phép dùng** (trong Studio) là nơi nó được phép lưu và xuất. **Hoạt động** liệt kê các lần gọi của nó. Xem [Để trợ lý AI làm việc với công trường của bạn](topic:assistants).
