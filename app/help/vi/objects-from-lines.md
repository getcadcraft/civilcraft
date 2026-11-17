---
title: Đối tượng từ đường nét, giữ liên kết
summary: Tạo lát nền, khu vực trồng cây, luống, hàng rào, lối đi, tường, bó vỉa, bậc thang, dốc, bệ, rãnh thoát nước hoặc đường đặc trưng từ một đường; đối tượng theo đường khi đường di chuyển, cho đến khi bạn ngắt liên kết.
keywords: từ một đường, đường nét, DWG, DXF, liên kết, đã liên kết, theo dõi, tạo lại, ngắt liên kết, đường đặc trưng, đường đặc trưng từ đường nét, lớp đã nhập, đường viền, supercad studio, đường vẽ
from: eb67a0c6
---

{{ui:Từ một đường}} (Cảnh quan › {{ui:Thêm}}): nhấn một đường đặc trưng, hoặc một đường hay đường viền của lớp DWG/DXF đã nhập. Một đường khép kín có thể tạo lát nền, bãi cỏ, luống trồng, đồng cỏ, cây phủ đất, luống hoặc bệ; một đường hở tạo lối đi, tường, bó vỉa, bậc thang (điểm đầu và điểm cuối), dốc, hàng rào hoặc rãnh thoát nước. Cả hai loại đều có thể tạo một **đường đặc trưng**, trừ chính đường đặc trưng.

## Đường đặc trưng từ một đường

Đường đặc trưng tạo từ một đường nhận các điểm của nó, khép kín nếu đường đã khép kín. Cao độ của nó được đặt trên mặt đất hiện trạng (0 nếu chưa có), và công dụng của nó là **Tắt**: nó không tạo mặt đất nào cho đến khi bạn chọn công dụng và đặt cao độ trong Thuộc tính. Khi đường di chuyển, đường đặc trưng có cùng số điểm sẽ giữ mỗi cao độ bạn đã đặt; khi đường thêm hoặc bớt điểm, các cao độ được đặt lại trên mặt đất. Xem [Đường đặc trưng](topic:feature-lines).

Đối tượng mới giữ một **liên kết** tới đường của nó. Khi đường di chuyển (bạn kéo các điểm của nó, hoặc bản vẽ được di chuyển hoặc đọc lại), đối tượng nhận hình dạng mới trong cùng một bước hoàn tác, và qua các bộ điều chỉnh mặt đất, mặt đất đề xuất cũng theo. Thuộc tính cho biết nó liên kết với gì; {{ui:Ngắt liên kết}} làm nó tự do.

Đường được kiểm tra trước: một đường cần ít nhất 2 điểm (3 cho đường viền) và tối đa 5000, các tọa độ là số thực; đường viền phải khép kín và không được tự cắt. Đường không đạt sẽ không được dùng: đối tượng giữ nguyên và bảng Vấn đề nêu lý do. Nếu đường bị xóa, đối tượng vẫn còn và bảng Vấn đề ghi nhận điều đó.

## Trong SuperCad Studio

Mở công trường và bản vẽ 2D trong cùng một dự án. Chọn một đường hoặc polyline trong bản vẽ 2D, nhấn Ctrl+K và chạy {{ui:Đối tượng cảnh quan từ đường bản vẽ đã chọn}}: CivilCraft hỏi bạn muốn tạo gì, như trên, và đối tượng giữ liên kết với đường đó trong bản vẽ. Sau khi bạn thay đổi các đường trong bản vẽ, Ctrl+K {{ui:Cập nhật cảnh quan từ bản vẽ}} làm các đối tượng theo sau, mỗi đường một bước hoàn tác. Tệp liên kết của dự án ghi đối tượng nào theo đường nào. Trợ giúp của SuperCad Studio có chủ đề Cảnh quan.
