---
title: In mặt bằng ra PDF
summary: In toàn bộ hoặc khung nhìn hiện tại ra PDF vector trên khổ giấy tiêu chuẩn ở tỷ lệ kỹ thuật hoặc mét, theo màu lớp hoặc màu đen.
keywords: in, pdf, khổ giấy, tỷ lệ, kích thước giấy, bản vẽ mặt bằng, xuất bản, khung tên, mũi tên bắc, thanh tỷ lệ
from: 9af396ca
---

{{ui:PDF}} in mặt bằng ra PDF vector trên một tờ, với khung tên, mũi tên bắc và thanh tỷ lệ. PDF được tạo trong trình duyệt và tải xuống; nó không đi qua hộp thoại in của trình duyệt.

## In

1. Thiết lập mặt bằng trong **Hiển thị**: bề mặt được hiện, khoảng cách đường đồng mức và những gì được bật. Bản in theo các thiết lập này.
2. Nếu bạn chỉ muốn một phần của khu đất, thu phóng và di chuyển mặt bằng đến phần đó.
3. Nhấn {{ui:PDF}} trong nhóm **Xuất**, hoặc nhấn {{key:Mod+P}}.
   Hộp thoại **In mặt bằng ra PDF** mở ra.
4. Chọn **Khu vực**: {{ui:Everything}} hoặc {{ui:What is on screen}}.
5. Chọn **Khổ giấy**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 hoặc A1. Dự án theo feet bắt đầu với Tabloid, dự án theo mét bắt đầu với A3. Các tờ luôn nằm ngang.
6. Chọn **Tỷ lệ**. Danh sách đánh dấu tỷ lệ lớn nhất vừa khít bằng "(vừa khít)" và chọn nó.
   - Feet: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Mét: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Chọn **Mực**: {{ui:Layer colors}} hoặc {{ui:Black}}.
8. Đọc dòng bên dưới các lựa chọn. Dòng này cho biết kích thước khu vực trên giấy và kích thước tờ, ví dụ "Khu vực có kích thước 297 × 222 mm ở tỷ lệ 1" = 40' trên tờ 432 × 279 mm (ngang)."
9. Nhấn {{ui:Download PDF}}.
   Trình duyệt tải xuống `<name>.pdf`. Thanh trạng thái ghi "Đã in <name>.pdf ở tỷ lệ 1" = 40'."

Nếu khu vực lớn hơn tờ ở tỷ lệ bạn chọn, bản in được căn giữa và các mép bị cắt. Hãy chọn tỷ lệ được đánh dấu "(vừa khít)" hoặc một khổ giấy lớn hơn.

## Nội dung trên tờ

- Mặt bằng, căn giữa trong vùng vẽ, dưới dạng vector thực: đường đồng mức, nhãn, tuyến có đánh số cọc, hành lang, nền và đường giao với mặt đất, ống, điểm.
- Độ dày nét theo lớp: tuyến, nền và ống đậm hơn; tam giác và đường đồng mức phụ mảnh.
- Một khung tên ở dưới cùng với **Tên** dự án, tỷ lệ, ghi chú khoảng cách đường đồng mức và bề mặt nào (hiện trạng hay đã san nền), và ngày cùng phiên bản ở bên phải.
- Mũi tên bắc ở góc trên bên phải (bắc mặt bằng hướng lên) và thanh tỷ lệ trong khung tên.
- Các lớp bản đồ hiển thị dưới mặt bằng (một ảnh, ô bản đồ hoặc dịch vụ bản đồ), khi **Lớp bản đồ dưới mặt bằng** được đánh dấu: chúng được vẽ thành một ảnh của toàn bộ vùng vẽ ở 150 điểm trên inch, nằm dưới nét vẽ, và phần ghi công của bản đồ được đưa vào khung tên. CivilCraft chờ tối đa 8 giây cho các ảnh bản đồ còn đang đến; nếu vẫn thiếu một số, thanh trạng thái sẽ thông báo.

Chữ dùng phông Helvetica có sẵn của PDF. Ký tự ngoài bộ Tây Âu (Windows-1252) sẽ in thành "?", và thông báo trạng thái sẽ đếm số lượng các ký tự đó.

## Không được in

- Dải cao độ.
- Khung nhìn trắc dọc. Việc in trắc dọc chưa có sẵn.
- Nhiều hơn một tờ (với tuyến, dùng [tờ mặt bằng và trắc dọc](topic:plan-profile-sheets)), khung nhìn, khung tên tùy chỉnh hoặc tờ đứng.

:::note
Hộp thoại cho biết mũi tên độ dốc chỉ hiển thị trên màn hình. Trong bản dựng này, mũi tên độ dốc được bật trong **Hiển thị** vẫn được in (và xuất ra DXF). Hãy tắt chúng trước khi in nếu bạn không muốn.
:::

## In trên giấy

Mở tệp PDF đã tải bằng bất kỳ trình xem PDF nào và in ở 100% (kích thước thực) để tỷ lệ được giữ đúng. "Vừa trang" sẽ thay đổi tỷ lệ.
