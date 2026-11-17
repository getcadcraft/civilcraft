---
title: Bố trí dãy pin mặt trời trên mặt đất
summary: Đặt các bàn pin mặt trời lắp trên mặt đất trong một thửa đất hoặc nền, với các hàng cách nhau theo nền đất mà mỗi hàng thực sự đứng trên, bỏ trống phần đất dốc, tính sản lượng điện trong năm và hiển thị các bàn pin trên mặt bằng và trong 3D.
keywords: mặt trời, pv, quang điện, dãy, lắp đặt trên đất, bàn pin, hàng, khoảng cách hàng, bóng che, địa hình, độ dốc, cọc móng, sản lượng, kWp, năng lượng, đường chân trời
from: 95593fd6
---

## Nội dung bài này

Cách bố trí một khu bàn pin mặt trời trên công trường không bằng phẳng, và ý nghĩa của các con số. Mở từ Bề mặt › Thêm › Dãy pin mặt trời.

## Bố trí các bàn pin

1. Chọn **Vị trí**: một thửa đất hoặc một nền của dự án, hoặc nhập các góc của một khu vực. Đánh dấu mọi nền hoặc thửa đất phải để **trống** (một công trình, một ao hồ).
2. Nhập **vĩ độ và kinh độ** của công trường. Mặt trời phụ thuộc vào chúng; không có gì được phỏng đoán. Nếu dự án có hệ tọa độ, **Lấy từ hệ tọa độ** sẽ điền chúng vào.
3. Đặt độ nghiêng, hướng (để trống là hướng về xích đạo), số tấm trong một bàn, công suất và kích thước của tấm pin. Các số liệu tấm pin ban đầu là giá trị chung và được ghi nhãn như vậy; hãy nhập số liệu của riêng bạn.
4. Nhấn **Bố trí bàn**. Cửa sổ cho biết số bàn và số tấm, kích thước tính bằng kWp và khoảng cách từ hàng đến hàng.

Mỗi bàn là một cột trong khu vực, được đặt từ phía trước và lùi dần về sau. Một bàn chỉ được đặt ở nơi nền bên dưới nó nằm trong giới hạn độ dốc, trong khu vực và khoảng lùi, và nơi các cọc móng cần thiết không cao hơn giới hạn bạn đặt. Các vị trí không đạt sẽ để trống, và cửa sổ cho biết có bao nhiêu vị trí và vì sao.

## Các hàng được bố trí theo nền đất

Trên nền phẳng, các hàng cách nhau theo quy tắc không che bóng thông thường: bóng của một hàng lúc giữa trưa ngày đông chí không được chạm tới mép dưới của hàng phía sau. Trên dốc, CivilCraft áp dụng cùng quy tắc cho nền mà hàng kế tiếp thực sự đứng trên. Nơi đất nâng lên phía sau một bàn, các hàng có thể đứng gần nhau hơn; nơi đất thoải xuống, chúng đứng xa hơn. Cửa sổ hiển thị khoảng cách gần nhất, xa nhất và trung bình bên cạnh khoảng cách trên nền phẳng, để bạn thấy địa hình đã tác động thế nào.

Mặt phẳng của một bàn được nâng trên cọc móng cho đến khi mọi điểm mẫu bên dưới nó cách nền một khoảng hở bạn đã đặt. Cọc cao nhất sẽ hiện trong kết quả.

## Sản lượng trong năm

**Sản lượng năm** tính ánh sáng trên mặt nghiêng cho một ngày điển hình của mỗi tháng, nhiệt độ tế bào, các hao hụt đã nhập, việc các bàn che bóng lẫn nhau, và các ngọn đồi ở đường chân trời lấy đi phần ánh nắng mà chúng che khuất. Bầu trời được tính là trời quang, nên kết quả là giới hạn trên; thời tiết thực tế sẽ cho kết quả thấp hơn. Đây là ước tính thiết kế sơ bộ, không phải báo cáo sản lượng.

## Giữ lại

**Lưu vào dự án** giữ các đầu vào và các con số trong tệp dự án; các bàn được tính lại từ nền khi tệp mở, nên một bề mặt thay đổi sẽ làm chúng dịch chuyển. Chúng hiển thị trên mặt bằng và trong 3D (Hiển thị › Dãy pin mặt trời). Danh sách bàn tải xuống dạng CSV. Một bước hoàn tác sẽ xóa hoặc khôi phục một dãy.

## Chưa xây dựng

Dữ liệu thời tiết thay cho trời quang, các bàn đi theo nền theo hướng đông–tây, bộ theo dõi mặt trời, và thiết kế điện (chuỗi, dây dẫn, biến tần) trong CivilCraft. Ngăn Solar PV của BimCraft có chuỗi và sơ đồ một sợi cho mái nhà.
