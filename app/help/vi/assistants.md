---
title: Cho trợ lý AI làm việc với công trường của bạn
summary: Bật trợ lý trong Cài đặt để trợ lý AI trên máy tính của bạn đọc công trường đang mở (điểm, bề mặt, khối lượng, trắc dọc, thửa đất), thêm điểm khảo sát, lưu và xuất LandXML hoặc DWG, qua CadCraft Studio. Tắt cho đến khi bạn bật.
keywords: ai, trợ lý, mcp, kịch bản, tự động hóa, studio, điểm, cao độ, cọc, độ lệch, tuyến, khối lượng, đào, đắp, trắc dọc, thửa đất, landxml, dwg, usd, thư mục, quyền, ngắt kết nối, hoạt động
from: d0356582
---

## Bạn sẽ học được gì

Cách cho một trợ lý AI (bất kỳ trợ lý nào nói MCP) làm việc với công trường bạn đang mở, nó làm được và không làm được gì, và cách dừng nó.

## Trợ lý có thể làm gì trong CivilCraft

| Nó yêu cầu | Nó nhận được | Cần quyền |
|---|---|---|
| Công trường | Tên, đơn vị, hệ tọa độ, nhóm điểm, tuyến, bề mặt, nền, thửa đất và ống | Đọc |
| Điểm khảo sát | Số hiệu, đông, bắc, cao độ và mô tả, theo nhóm, theo mô tả hoặc trong một hộp | Đọc |
| Cao độ bề mặt | Mặt đất hiện trạng (hoặc bề mặt đã san) tại bất kỳ điểm nào nó nêu | Đọc |
| Cọc và độ lệch | Cọc và độ lệch của các điểm dọc theo tuyến, hoặc tọa độ và cao độ mặt đất của các cọc | Đọc |
| Một trắc dọc | Cao độ mặt đất, trắc dọc thiết kế và bề mặt đã san dọc theo tuyến, cứ mỗi bao nhiêu feet hoặc mét | Đọc |
| Đào và đắp | Khối lượng giữa mặt đất hiện trạng và bề mặt đã san (mỗi nền và hành lang cũng vậy), hoặc giữa mặt đất và một cao độ bằng | Đọc |
| Thửa đất | Các góc, diện tích (theo acre hoặc hécta), chu vi và mô tả pháp lý | Đọc |
| Một vùng chọn | Các điểm nó nêu được chọn trên mặt bằng, như thể bạn đã chọn chúng | Chỉnh sửa |
| Điểm khảo sát mới | Điểm được thêm với số hiệu nó đưa ra, hoặc các số hiệu trống tiếp theo. Mỗi lệnh gọi là một bước bạn có thể hoàn tác | Chỉnh sửa |
| Lưu | {{ui:Save}} của chính CivilCraft | Lưu |
| LandXML hoặc DWG | Cùng các tệp như nút {{ui:LandXML}} và {{ui:DWG}} | Xuất |
| Công trường 3D | OpenUSD (.usdz, .usda hoặc .usdc) của mặt đất, bề mặt đã san, nền và ống, như chế độ xem 3D xuất ra | Xuất |
| Cây trồng và bảng cây trồng | Cây tìm thấy trong danh sách cây theo bất kỳ tên nào, và số lượng trong bảng cây trồng | Đọc |
| Trồng và san | Cây, luống hoặc hàng rào được đặt, hoặc sân nền, gờ đất, rãnh thoát nước hoặc khu vực san được thêm, mỗi thứ là một bước bạn có thể hoàn tác, cùng đào và đắp của nó | Chỉnh sửa |
| Kiểm tra tưới | Lưu lượng của mỗi vùng, áp lực cần tại van và tại nguồn cấp, cột áp trường hợp xấu nhất, thời gian chạy, các vấn đề và bảng vật tư, như một công cụ hỗ trợ tính toán mà người thiết kế tưới kiểm tra | Đọc |

Nó làm việc với công trường đang mở. Trong Studio, nó cũng có thể lưu và xuất vào các thư mục bạn chọn (bên dưới); không có thư mục, các tệp của nó được tải xuống như các nút vẫn làm.

## Bật

Trợ lý kết nối với CivilCraft qua CadCraft Studio trên máy tính của bạn; trình duyệt thông thường không có cách nào để vào.

1. Mở {{ui:Settings}} và chọn thẻ **CivilCraft**.
2. Dưới **Trợ lý**, đánh dấu **Cho phép trợ lý AI và kịch bản sử dụng CivilCraft**.
3. **Đọc** đã được đánh dấu sẵn. Chỉ đánh dấu **Chỉnh sửa**, **Lưu** hoặc **Xuất** khi trợ lý cần chúng.
4. Để cho phép nó lưu và xuất vào một thư mục, chọn {{ui:Add a folder…}} dưới **Thư mục được phép dùng** và chọn thư mục trong hộp thoại của Studio. {{ui:Remove}} thu hồi ngay; mọi đường dẫn khác đều bị từ chối.
5. Kết nối trợ lý trong Studio (Studio hiển thị địa chỉ và các cài đặt để dán vào trợ lý).

## Khi trợ lý đang kết nối

Một ghi chú ở đầu bảng bên phải cho biết trợ lý nào đang kết nối và nó làm được gì. Nhấp {{ui:Disconnect}} để kết thúc phiên của nó ngay; nó phải kết nối lại để tiếp tục.

**Hoạt động**, dưới **Trợ lý** trong Cài đặt, liệt kê mọi lệnh gọi mà trợ lý đã thực hiện, mới nhất trước, kèm việc nó có thành công hay không.

:::tip
Hỏi bằng lời thường, ví dụ "cao độ mặt đất mỗi 50 feet dọc theo Main Street là bao nhiêu?", "các nền cần đào và đắp bao nhiêu?" hoặc "thêm một điểm khống chế tại các tọa độ này". Trợ lý đọc công trường và trả lời, hoặc thực hiện thay đổi như một bước bạn có thể hoàn tác.
:::

## Không mở CivilCraft

Máy chủ tệp CadCraft dành cho trợ lý (`npx @getcadcraft/mcp`) và dòng lệnh `cadcraft` mở các dự án CivilCraft đã lưu (`.civilcraft.json`) và tệp điểm bằng chính mã của CivilCraft, không có cửa sổ: cùng các công cụ đọc, thêm điểm, lưu dự án, LandXML và công trường 3D dạng OpenUSD. `cadcraft convert site.civilcraft.json site.xml` ghi LandXML từ dòng lệnh. Mở LandXML, xuất DWG và các công cụ của không gian làm việc Landscape vẫn cần cửa sổ CivilCraft.

## Tắt

Bỏ đánh dấu **Cho phép trợ lý AI và kịch bản sử dụng CivilCraft**. Mọi trợ lý được ngắt kết nối ngay, và cài đặt được giữ cho lần sau.

## Xem thêm

- [Công thức cho trợ lý AI](common:assistants-recipes): các ví dụ mẫu, mỗi ví dụ kèm các công cụ nó gọi.
- [Bố trí tuyến nằm ngang](topic:alignment)
- [Dựng và tinh chỉnh bề mặt](topic:build-surface)
- [Chọn, sao chép và dán điểm khảo sát](topic:copy-paste-points)
- [Cài đặt CivilCraft](topic:settings)
