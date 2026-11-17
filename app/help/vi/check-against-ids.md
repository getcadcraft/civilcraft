---
title: Kiểm tra tệp xuất IFC theo IDS của khách hàng
summary: Nạp tệp .ids mà chủ đầu tư hoặc cơ quan quản lý đường đã gửi cho bạn, rồi xem mọi cấu kiện đã xuất không đạt yêu cầu trong Vấn đề.
keywords: ids, đặc tả cung cấp thông tin, buildingsmart, yêu cầu, bàn giao, kiểm tra, xác nhận, qa, xuất ifc, ifc 4.3, tuyến, đường, đấu thầu
from: 183d9a0e
---

## Bạn sẽ làm gì

IDS (Information Delivery Specification, tiêu chuẩn của buildingSMART) là danh sách những gì một IFC phải chứa. Các gói mua sắm công thường gửi kèm một IDS cùng công việc. CivilCraft kiểm tra IFC mà dự án này xuất, theo phiên bản IFC bạn đã chọn khi xuất, so với IDS và liệt kê mọi cấu kiện không đạt.

## Các bước

1. Mở dự án của bạn.
2. Nhấp {{ui:IFC}} trong nhóm Xuất của thanh công cụ. Trong hộp thoại, chọn phiên bản IFC bạn sẽ bàn giao.
3. Nhấp {{ui:Check against IDS…}}.
4. Nhấp {{ui:Load an .ids file…}} và chọn tệp. Không có gì được tải lên.
5. Đọc kết quả: mỗi đặc tả kèm {{ui:Pass}} hoặc {{ui:Fail}} và số cấu kiện nó áp dụng.
6. Mở Vấn đề ({{key:Ctrl+Shift+M}}) và nhấp một mục không đạt để chọn tuyến, nền, ống, công trình thoát nước hoặc khối tích công trình mà nó xuất phát từ.

## Bạn sẽ thấy gì

- Một cảnh báo cho mỗi cấu kiện đã xuất và mỗi yêu cầu nó không đáp ứng, kèm tên đặc tả, những gì IDS yêu cầu và những gì tệp xuất có.
- Báo cáo kiểm tra (trong Vấn đề) bắt đầu bằng IDS: tiêu đề, phiên bản, tác giả và số liệu của mỗi đặc tả.

## Nên biết

- IDS được lưu trong tệp dự án, nên nó được kiểm tra lại khi bạn mở dự án. Nạp hoặc bỏ nó là một bước bạn có thể hoàn tác.
- Mỗi thay đổi được kiểm tra lại sau một lát. Bề mặt lớn mất nhiều thời gian hơn để ghi, nên việc kiểm tra khi đó chờ lâu hơn một chút giữa các lần chạy.
- Việc kiểm tra dùng cùng tệp mà xuất {{ui:IFC}} ghi ra, theo phiên bản chọn lần cuối tại đó (IFC 4.3 khi bạn chưa chọn).
- Số được so sánh theo đơn vị SI: dự án theo feet được đổi sang mét trước.

- Mẫu trong IDS được đọc như toàn bộ giá trị. Dấu `^` ở đầu và `$` ở cuối cũng được hiểu là "toàn bộ giá trị", như hầu hết tệp IDS vẫn ngầm định.

## Tiếp theo

- [Xuất IFC](topic:ifc)
