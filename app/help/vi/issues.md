---
title: Vấn đề và BCF
summary: Ghim một vấn đề lên mặt bằng, một cọc của tuyến, một điểm bề mặt hoặc một ống, đặt trạng thái và bình luận, rồi trao đổi các vấn đề dưới dạng tệp BCF 2.1 cùng với tệp LandXML.
keywords: vấn đề, issue, bcf, bình luận, đánh dấu, khiếm khuyết, lỗi, công trường, ghim, trạng thái, mở, đã giải quyết, đã đóng, bim collaboration format, landxml, problems
from: e44153b1
---

Vấn đề là một ghi chú được ghim vào một vị trí trong bản vẽ CivilCraft của bạn, có tiêu đề, trạng thái và bình luận. Dùng để báo cho nhân sự công trường hoặc một chương trình khác biết cần xem xét điều gì, và đọc lại phản hồi của họ.

## Thêm vấn đề

1. Mở **Bề mặt, Thêm, Vấn đề (BCF)...**
2. Nhập tiêu đề và nội dung sai sót.
3. Chọn vị trí ghim: tâm của khung nhìn mặt bằng, điểm bề mặt ở tâm, một cọc của tuyến đang chọn (nhập cọc và độ lệch, bên phải là dương), hoặc ống, công trình hay đường đặc trưng đang chọn.
4. Nhấn **Thêm vấn đề**. Ghim hiện trên mặt bằng dưới dạng một hình thoi nhỏ có số.

Nhấn vào tiêu đề của một vấn đề để thu phóng đến nó, đổi trạng thái trong danh sách (Mở, Đang xử lý, Đã giải quyết, Đã đóng) và thêm bình luận. Mỗi thay đổi là một bước hoàn tác, và các vấn đề được lưu trong tệp dự án.

## Trao đổi dưới dạng BCF

- **Xuất BCF** ghi một tệp BCF 2.1 với một chủ đề cho mỗi vấn đề: tiêu đề, trạng thái, bình luận, và một điểm nhìn với camera mặt bằng vuông góc và ghim.
- **Nhập BCF** đọc một tệp BCF (tệp 2.0 và 3.0 được đọc trong phạm vi tương thích với 2.1). Một chủ đề có guid đã tồn tại sẽ cập nhật vấn đề đó (trạng thái, bình luận mới) thay vì thêm một vấn đề thứ hai.
- **Từ Problems** tạo một vấn đề từ mỗi mục đang mở trong bảng Problems có ghi vị trí.

BCF mang tọa độ mét của dự án này, không dịch chuyển. Chương trình khác phải dùng cùng hệ tọa độ với tệp LandXML của bạn để ghim nằm đúng vị trí. Phần tử mà ghim trỏ tới (tuyến, cọc, độ lệch, ống) được truyền dưới dạng nhãn bắt đầu bằng "cc:", và CivilCraft đọc lại các nhãn này.

## Những gì chưa được kiểm tra

Ghim và điểm nhìn chỉ được kiểm tra bằng cách ghi một tệp rồi đọc lại trong CivilCraft. Chưa có chương trình BIM nào khác mở chúng, và việc BCF "view to world scale" là toàn bộ hay nửa chiều cao của khung nhìn khác nhau giữa các chương trình: CivilCraft ghi toàn bộ chiều cao.
