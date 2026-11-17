---
title: Bố trí bãi đậu xe
summary: Bố trí ô đỗ, lối đi, chỗ dành cho người khuyết tật và xe van, cùng đảo bên trong một đường bao; san nền bãi với độ dốc về các cống thoát nước so với mặt đất hiện có, rồi lát và trồng cây. Cũng có sẵn cho trợ lý.
keywords: bãi đậu xe, bãi, ô đỗ, lối đi, người khuyết tật, ada, xe van, đảo, cống thoát nước, độ dốc, san nền, đào, đắp, lát nền, gạch lát, trồng cây, địa hình, đám điểm, mcp, trợ lý
from: 06c14da9
---

Đặt một bãi đậu xe vào trong một thửa đất, một nền hoặc một đường đặc trưng khép kín, và nhận số lượng, san nền và lát nền trong một bước.

## Bố trí

1. Chọn một thửa đất, một nền hoặc một đường đặc trưng khép kín trên mặt bằng.
2. Mở **Bề mặt, Thêm, Parking lot...**
3. Chọn các quy tắc, góc ô đỗ (90, 75, 60, 45, 30 độ hoặc song song) và lối đi một chiều hoặc hai chiều. Kích thước ô đỗ, lối đi và đảo bắt đầu từ bảng, và mọi giá trị đều có thể gõ đè.
4. Chọn **Lay out**.

Các hàng ô đỗ chạy dọc theo cạnh của đường bao tạo được nhiều ô nhất (hoặc theo góc bạn nhập). Một ô chỉ được tính nếu nằm trọn trong đường bao. Khi còn chỗ cho một hàng và một lối đi, một dải một hàng được thêm vào. Cửa sổ liệt kê các chỗ đỗ, chỗ dành cho người khuyết tật và xe van, đảo, cống thoát nước và diện tích trên mỗi chỗ; mặt bằng thể hiện ô đỗ, chỗ dành cho người khuyết tật với lối tiếp cận có gạch chéo, đảo, đường tim lối đi và cống thoát nước trên các lớp riêng (C-PARK-...), để chúng đi vào PDF, DXF và DWG.

## Chỗ dành cho người khuyết tật

Với quy tắc của Hoa Kỳ, số lượng theo bảng 208.2 của Tiêu chuẩn ADA 2010 cho các chỗ được cung cấp (một trên sáu, làm tròn lên, là một chỗ cho xe van), đặt gần góc đầu tiên của đường bao (lối vào), mỗi chỗ có một lối tiếp cận; hai chỗ dùng chung một lối. Ô đỗ hẹp hơn chiều rộng dành cho người khuyết tật, hoặc độ dốc đứng hơn 1:48 tại các chỗ dành cho người khuyết tật, sẽ hiện như một vấn đề. **Các con số này được gõ từ tiêu chuẩn theo trí nhớ và chưa được đối chiếu với bản tiêu chuẩn in.** Kích thước ô đỗ và lối đi thông thường lấy từ các hướng dẫn thiết kế bãi đậu xe và cũng chưa được kiểm tra. Hãy kiểm tra cả hai, và quy chuẩn địa phương của bạn, trước khi dựa vào chúng. Chọn **Custom** để nhập số lượng chỗ dành cho người khuyết tật của riêng bạn.

## Độ dốc về cống thoát nước, đào và đắp

Trừ khi bạn tắt, bãi trở thành một khu vực san nền trong không gian làm việc Landscape. Cống thoát nước được đặt trên các đường tim lối đi khoảng mỗi 100 ft (30 m); mặt bằng dâng lên từ mỗi cống theo độ dốc bạn nhập (1.5 phần trăm để bắt đầu), nên mỗi điểm đều dốc về cống gần nhất. Cao độ được chọn để khối lượng đào và đắp của bãi cân bằng trên mặt đất hiện có. Mặt đất hiện có là bề mặt hiện có của dự án, có thể đến từ điểm đo, LandXML, đám điểm lidar hoặc quét được chuyển thành bề mặt, hoặc đường đồng mức. Cửa sổ hiển thị ước tính đào và đắp; khối lượng của chính dự án cho con số chính xác sau đó. Khu vực san nền giữ mép của nó trên mặt đất hiện có, nên nếu mặt mới khác với mặt đất tại mép, bạn sẽ có một bậc, và cửa sổ cho biết nó lớn bao nhiêu.

## Lát nền và trồng cây

Toàn bộ đường bao được lát bằng một lớp lát gạch (kiểu xếp dài bạn có thể đổi trong Landscape, Hardscape), và mỗi đảo có một luống cây bụi và, khi đủ rộng, một cây, lấy từ danh sách cây. Sau đó mọi thứ đều là đối tượng Landscape thông thường: chỉnh sửa, hoặc chọn **Lay out again** để thay thế những gì bãi đã tạo. Xóa bãi sẽ xóa những gì nó đã tạo.

## Từ trợ lý

Cùng một bãi có thể được yêu cầu qua MCP: `parking_layout` xem trước, `parking_build` ghi, `parking_remove` xóa bãi. Yêu cầu theo tên thửa đất hoặc gửi đường bao.

## Những gì chưa làm

Việc các lối đi có nối tới đường phố hay không chưa được kiểm tra. Lớp lát phủ toàn bộ đường bao, nên diện tích bao gồm cả đảo. Các lựa chọn vật liệu lát từ Thư viện và một kiểu Thư viện cho ô đỗ chưa được xây dựng; kiểu lát là kiểu của Hardscape. Quy tắc của các quốc gia khác chưa được xây dựng.
