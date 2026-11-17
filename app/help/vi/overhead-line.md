---
title: Vẽ đường dây trên không
summary: Đặt trụ trên mặt bằng, để CivilCraft xác định vai trò của từng trụ và các mặt cắt giữa các trụ néo, rồi di chuyển trụ trên mặt bằng hoặc trên trắc dọc đường dây.
keywords: đường dây trên không, trụ, cột, khoảng cột, mặt cắt, néo, góc, treo, trắc dọc, chiều cao, xà, dây néo, neo
from: b8e5e272
---

## Vẽ đường dây

1. Phải có bề mặt: mặt đất dưới đường dây lấy từ đó ([Dựng bề mặt](topic:build-surface)). Trụ không có mặt đất bên dưới được liệt kê trong **Kiểm tra**; hãy nhập **Cao độ mặt đất** của nó trong Thuộc tính.
2. Nhấn {{ui:Đường dây}} trong nhóm Đường dây điện rồi nhấn từng trụ trên mặt bằng.
3. Nhấp đúp vào trụ cuối cùng, hoặc nhấn {{key:Enter}}.

Đường dây nhận dây dẫn, trụ và thiết bị bạn đã dùng gần nhất trên máy tính này (lần đầu: ví dụ từ thư viện). Hãy thay đổi chúng trong Thuộc tính.

## Đường dây trong Thuộc tính

Chọn đường dây (nhấn vào một khoảng cột) để đặt **Dây dẫn**, **Dây dẫn trên mỗi mạch**, **Mạch**, **Điện áp**, **Quy tắc khoảng hở** mà nó phải giữ trên mặt đất, và thiết bị **Trên mọi trụ** (xà, sứ cách điện, phụ kiện). Bảng liệt kê các **mặt cắt** của nó cùng khoảng cột quy chiếu, lực căng thường ngày và trường hợp tải chi phối từng mặt cắt.

## Trụ

Nhấn một trụ để chọn nó. Trong Thuộc tính:

- **Trụ**: mục thư viện của nó. Khi trụ quá yếu, {{ui:Dùng …}} đặt trụ nhỏ nhất cùng vật liệu trong thư viện của bạn mà vẫn chịu được tải.
- **Vai trò**: Tự động, Treo, Góc hoặc Néo. Tự động có nghĩa là: trụ đầu và trụ cuối là trụ néo; một góc rẽ vượt góc của bộ quy tắc thì tạo trụ góc; góc rẽ lớn hơn thì là trụ néo.
- **Chiều cao trên mặt đất**: để trống thì lấy từ mục thư viện (chiều dài trừ phần chôn trong đất).
- **Trên trụ này cũng có**: thiết bị bổ sung, như một **dây néo** (dây chằng). Trụ có dây néo sẽ chuyển lực kéo của đường dây sang dây néo.
- **Trụ hiện có**: được kiểm tra như các trụ khác nhưng không tính vào khối lượng.

{{ui:Trụ đỡ}} thêm một trụ vào khoảng cột gần điểm bạn nhấn nhất. Kéo trụ trên mặt bằng để di chuyển nó. {{key:Delete}} xóa trụ (một đường dây luôn giữ ít nhất hai trụ).

Mặt cắt chạy giữa các trụ néo: trong một mặt cắt, dây dẫn chạy tự do qua các kẹp treo, nên một lực căng giữ cho cả mặt cắt.

## Trắc dọc đường dây

Nhấn {{ui:Trắc dọc}} (hoặc **Trắc dọc** trong Thuộc tính của đường dây). Bảng dưới mặt bằng hiển thị mặt đất dọc theo đường dây, từng trụ từ mặt đất đến đỉnh, pha thấp nhất của dây dẫn tại **Trường hợp tải** bạn chọn, và khoảng hở đường dây phải giữ dưới dạng đường đứt nét. Khoảng cột nào không đạt sẽ có màu đỏ; con số dưới mỗi khoảng là khoảng hở thấp nhất của nó.

- **Đường dây** chọn đường dây trên không cần hiển thị. Chọn đường dây khác, hoặc một trụ của nó, trên mặt bằng sẽ chuyển trắc dọc sang đường đó.
- Di chuyển con trỏ qua trắc dọc: một đường dẫn đi theo nó, và nhãn đọc khoảng cách dọc theo đường dây, mặt đất, dây dẫn và khoảng hở tại đó (và cho biết khi khoảng hở nhỏ hơn quy tắc của đường dây).
- {{ui:Đo}} trên thanh của trắc dọc: nhấn hai điểm để có khoảng cách ngang, chênh lệch độ cao, khoảng cách thẳng và độ dốc giữa chúng. Nhấn gần mặt đất, dây dẫn hoặc đỉnh trụ sẽ bắt vào điểm đó. Nhấn {{ui:Đo}} lần nữa để dừng.
- Vật cản mà đường dây cắt qua đứng lên từ mặt đất: vật vẽ là các thanh, cây cảnh quan là tán cây, tường là các thanh (xem [Kiểm tra đường dây điện](topic:power-line-checks#clearances)). Tuyến cáp và ống mà đường dây cắt qua được đánh dấu dưới mặt đất ở đỉnh của chúng, kèm tên.

- Kéo một trụ sang ngang để di chuyển nó dọc theo đường dây.
- Kéo đỉnh của nó lên hoặc xuống để đặt chiều cao trên mặt đất.
