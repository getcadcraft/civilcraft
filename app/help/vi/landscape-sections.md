---
title: Mặt cắt cảnh quan và bộ xuất bản
summary: Đường cắt mặt cắt đi qua mặt đất hiện trạng và mặt đất thiết kế, tường với móng, cấu tạo lớp lát nền và khu trồng cây, bậc thang và cây ở kích thước trưởng thành, trên các tờ riêng; một bộ xuất bản với danh sách tờ, một PDF và một DWG cho mỗi tờ.
keywords: mặt cắt, mặt cắt ngang, cao độ, ký hiệu mặt cắt, đường cắt mặt cắt, xuất bản, bộ tờ, danh sách tờ, danh mục bản vẽ, bộ pdf, dwg theo tờ
from: 7271ac50
---

{{ui:Levels}} › {{ui:Section line}}: chọn điểm đầu và điểm cuối. Các mặt cắt được đặt tên A, B, C… (đổi tên trong Thuộc tính). Một mặt cắt vẽ dọc theo đường của nó:

- mặt đất hiện trạng (nét đứt) và mặt đất thiết kế;
- tường với móng của chúng, tại nơi đường cắt đi qua;
- cấu tạo lớp lát nền và lối đi, cùng lớp phủ và đất mặt của khu trồng cây (sau khi cắt xén), treo bên dưới bề mặt hoàn thiện;
- bậc thang theo mặt cắt dọc;
- cây nằm trong khoảng cách đã đặt từ đường cắt, dạng hình bóng ở kích thước trưởng thành.

Thuộc tính đặt khoảng cách đó và độ phóng đại theo chiều đứng. Trong hộp thoại Tờ, **Mặt cắt** đưa chúng lên các tờ riêng, tối đa bốn mặt cắt trên một tờ, mỗi mặt cắt ở một tỷ lệ chuẩn vừa khít.

## Bộ xuất bản

{{ui:Publish set (.zip)}} trong hộp thoại Tờ tạo, trong một tệp .zip:

- một PDF mở đầu bằng **danh sách tờ**, rồi đến mọi tờ cảnh quan, đánh số L-1, L-2… (trồng cây, san nền, tưới tiêu, chi tiết, mặt cắt, bảng thống kê);
- một DWG cho mỗi tờ mặt bằng, với các lớp của tờ đó (giữ nguyên tên `L-*`) và một DWG cho mỗi bản vẽ mặt cắt.

Mỗi đường cắt mặt cắt trên mặt bằng ghi tờ mà nó nằm trên (`A / L-5`); số này được tính lại từ bộ mỗi lần, nên thêm, xóa hoặc đổi tên mặt cắt sẽ đánh số lại.
