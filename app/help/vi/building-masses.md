---
title: Vẽ khối tích công trình trên công trường
summary: Vẽ một khối tích công trình trên thửa đất, cho nó số tầng và chiều cao tầng, xem tổng diện tích sàn, chọn cách nó đặt trên nền dốc, đẩy và kéo chiều cao trong 3D, rồi gửi cho BimCraft hoặc lưu thành tệp IFC.
keywords: khối tích, khối công trình, khối tích công trình, thể tích, dấu chân, số tầng, chiều cao tầng, tổng diện tích sàn, GFA, độ dốc, bệ, đào và đắp, đẩy kéo, 3D, nghiên cứu mặt bằng, thiết kế sơ bộ, IFC, phát triển, BimCraft, A-MASS
from: e5a67c16
---

Khối tích công trình là một dấu chân, một số tầng và một chiều cao tầng: câu hỏi ban đầu "có thể xây bao nhiêu công trình ở đây, và nó tác động thế nào đến mặt đất". Các khối nằm trên mặt bằng cùng tên, số tầng và tổng diện tích sàn, đi vào bản in PDF và các tệp xuất DWG, DXF trên các lớp `A-MASS` và `A-MASS-TEXT`, và được lưu trong tệp dự án.

## Vẽ một khối

1. Trong **Thuộc tính**, dưới **Khối tích công trình**, nhấp **Vẽ khối**. (Nó cũng có trong menu **Thêm** trên thanh công cụ, cạnh **Bề mặt**.)
2. Nhấp các góc của dấu chân. Một lần nhấp gần góc thửa đất hoặc điểm khảo sát sẽ lấy đúng vị trí của điểm đó.
3. Nhấp lại góc đầu tiên, hoặc nhấn {{key:Enter}}, để kết thúc. {{key:Backspace}} bỏ góc cuối; {{key:Esc}} dừng.

Một khối mới có ba tầng và chiều cao tầng 12 ft (3.6 m), và thuộc về thửa đất mà phần giữa của nó rơi vào.

## Số tầng, chiều cao và diện tích

Nhấp một khối để đổi **Tên**, **Công năng**, **Số tầng**, **Chiều cao tầng** và **Thửa đất**. **Chiều cao** bằng số tầng nhân chiều cao tầng: nhập một chiều cao và số tầng trở thành số nguyên gần nhất (không bao giờ dưới một). **Dấu chân** và **Tổng diện tích sàn** (dấu chân nhân số tầng) được tự động tính cho bạn.

## Trên nền dốc

Mặt đất dưới khối được đọc từ bề mặt: mặt đất hiện trạng, hoặc mặt đất đã san nơi bạn chọn **Mặt đất đề xuất (đã san)**. **Trên nền dốc** cho biết tầng trệt đặt ở đâu:

- **Bậc thang**: ở cao độ trung bình của mặt đất dưới dấu chân. Phía thấp được đắp lên đến đó và phía cao được đào, và hai bên gần cân bằng.
- **Bệ**: ở mặt đất cao nhất. Một đế đặc lấp đầy phía thấp.
- **Đào**: ở mặt đất thấp nhất. Phía cao bị đào bỏ vào sườn đồi.

Thuộc tính hiển thị khoảng mặt đất dưới khối, **Cao độ tầng trệt**, và khối lượng đắp và đào giữa mặt đất và cao độ đó. Một vị trí của dấu chân nằm ngoài bề mặt sẽ bị bỏ qua, và Thuộc tính cho biết có bao nhiêu vị trí.

## Trong chế độ xem 3D

Các khối được vẽ trong chế độ xem công trường 3D, với một đường quanh mỗi tầng và tên của chúng phía trên mái. **Hiển thị** có một ô đánh dấu cho **Khối tích công trình**. Nhấp một khối để chọn nó. Khi một khối được chọn:

- kéo mái của nó lên hoặc xuống để đẩy hoặc kéo từng tầng một, hoặc nhấn {{key:PageUp}} và {{key:PageDown}};
- toàn bộ thao tác di chuyển là một bước hoàn tác.

Chế độ xem đường phố của Drive cũng thấy các khối, và Sun đổ bóng của chúng xuống mặt đất.

## Gửi đi

- **Khối dạng IFC** lưu mọi khối thành một tệp IFC4: một công trường, một công trình với các tầng của nó, và khối như một cấu kiện công trình với các số liệu trong bộ thuộc tính `CadCraft_SiteMass`. Khi dự án có hệ tọa độ, tệp được đặt lên bản đồ và mang vĩ độ và kinh độ của công trường; không có hệ tọa độ thì nó không nói gì về vị trí.
- **Phát triển trong BimCraft** mở BimCraft trong một thẻ mới với các khối. Ở đó, chọn một khối sẽ hiện các số liệu của nó và **Phát triển khối này**, nút này dựng tường trên mọi cốt và một sàn dưới công trình từ dấu chân, trong một bước hoàn tác. Không có gì được tải lên: tệp chuyển giữa hai thẻ của trình duyệt này.

Xem thêm **Giới hạn quy hoạch** và **Số giờ nắng**.
