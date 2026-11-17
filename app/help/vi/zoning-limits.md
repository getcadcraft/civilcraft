---
title: Kiểm tra khối theo các giới hạn quy hoạch bạn nhập
summary: Nhập các khoảng lùi của lô đất theo từng dòng, giới hạn chiều cao, mặt phẳng phơi sáng bầu trời, hệ số sử dụng đất và mật độ xây dựng; xem vùng được phép xây dựng trên mặt bằng và đọc khối nào vi phạm giới hạn nào.
keywords: quy hoạch, lùi đường, lùi, trước, bên, sau, đường bao, vùng xây dựng, giới hạn chiều cao, mặt phẳng phơi sáng bầu trời, hệ số sử dụng đất, FAR, mật độ xây dựng, lô đất, thửa đất, quy định, kiểm tra quy chuẩn
from: 3e267b31
---

**CivilCraft không có quy chuẩn quy hoạch nào trong đó.** Nó không biết quy định của bất kỳ thành phố nào và không kèm thư viện các quy định đó. Mọi con số trên trang này do bạn nhập, lấy từ quy định địa phương của bạn, và mọi kết quả đều ghi rõ là được đo theo các giới hạn bạn đã nhập. Đây là cách để xem các giới hạn của lô đất định hình công trình như thế nào, không phải là phán quyết về việc thiết kế có được phép hay không.

## Nhập các giới hạn

Trong **Thuộc tính**, dưới **Khối công trình**, chọn một **Thửa đất** (hoặc chọn một khối: các giới hạn của thửa đất của nó hiển thị bên dưới). Sau đó điền những gì áp dụng; để trống một ô nghĩa là "không có giới hạn":

- **Đường phố**: đường ranh giới lô đất tiếp giáp đường phố. **Lùi trước** áp dụng cho nó, **Lùi sau** áp dụng cho đường đối diện nhất với nó, và **Lùi bên** áp dụng cho các đường còn lại.
- **Giới hạn chiều cao**.
- **Mặt phẳng phơi sáng**: nó bắt đầu ở một độ cao tại đường ranh giới lô đất và tăng thêm lượng bạn nhập cho mỗi 1 đơn vị đi vào trong, đo từ đường phố hoặc từ mọi đường ranh giới lô đất (2 nghĩa là 2 trên 1). Chiều cao cho phép tại một điểm là thấp nhất trong mặt phẳng và giới hạn chiều cao.
- **Hệ số sử dụng đất** (tổng diện tích sàn của các khối trên lô đất chia cho diện tích lô đất) và **Mật độ xây dựng** (diện tích chiếm đất của chúng chia cho diện tích lô đất, nhập bằng phần trăm).

## Đường bao

Đánh dấu **Hiển thị đường bao trên mặt bằng** để vẽ nó trên lớp `A-MASS-ENVL`. Đường bao là lô đất được thu vào từ mỗi đường ranh giới lô đất theo khoảng lùi riêng của đường đó, các đường bù gặp nhau tại góc vát chéo. Một đường ranh giới lô đất gồm cung tròn được xấp xỉ bằng các dây cung ngắn trong sai số 0,01 so với cung. Lô đất lồi và lõm đều hoạt động. Nếu các khoảng lùi tự cắt nhau (khoảng lùi sâu trên lô đất hẹp hoặc lõm nhiều) thì không có đường bao, và Thuộc tính sẽ thông báo điều đó; hãy thử khoảng cách nhỏ hơn.

## Kết quả

Dưới các ô nhập, mỗi khối và mỗi giới hạn có một dòng, kèm dấu tick hoặc dấu chéo:

- **khoảng lùi**: diện tích của khối nằm ngoài đường bao;
- **chiều cao**: chiều cao của khối so với mức cao nhất được phép trên diện tích chiếm đất của nó (khối lăng trụ có một chiều cao bị giới hạn bởi mức thấp nhất được phép tại bất kỳ góc nào của nó);
- **hệ số sử dụng đất** và **mật độ xây dựng**: cộng dồn tất cả các khối trên thửa đất.
