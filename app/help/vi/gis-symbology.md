---
title: Tô kiểu lớp theo thuộc tính
summary: Tô màu các đối tượng của một lớp GIS theo giá trị của một trường (một màu cho mỗi giá trị, hoặc theo khoảng số), đổi kích thước điểm theo một số, tô nền đa giác và hiển thị chú giải trên mặt bằng.
keywords: ký hiệu, kiểu, màu, phân loại, phân cấp, giá trị duy nhất, khoảng bằng nhau, phân vị, ngắt tự nhiên, jenks, dải màu, mù màu, chú giải, kích thước, điểm, choropleth, lớp, gis
from: a3a69add
---

Mở menu **ba chấm** của một lớp trong danh sách Lớp GIS và chọn {{ui:Tô màu theo thuộc tính…}}.

## Ba kiểu

- **Ký hiệu đơn:** màu của lớp, như trước.
- **Phân loại:** một màu cho mỗi giá trị khác nhau của bất kỳ trường nào. Tối đa tám giá trị được nhận tám màu Okabe-Ito (được chọn để vẫn tách biệt với các dạng mù màu phổ biến); với nhiều giá trị hơn, bảy giá trị phổ biến nhất mỗi cái một màu, còn lại dùng chung một lớp **Khác** màu xám. Đối tượng không có giá trị được tô xám.
- **Phân cấp:** một trường số được chia thành 2 đến 9 khoảng, mỗi khoảng một màu từ dải màu. Giá trị nằm đúng ngưỡng sẽ thuộc khoảng thấp hơn.

## Cách cắt khoảng

| Phương pháp | Ngưỡng |
|---|---|
| Khoảng bằng nhau | Khoảng từ giá trị nhỏ nhất đến lớn nhất được chia thành các bề rộng bằng nhau. Giá trị 0 đến 30 chia thành ba khoảng: 0, 10, 20, 30. |
| Phân vị | Khoảng bằng nhau về số đối tượng trong mỗi khoảng. Các ngưỡng được đọc từ các giá trị đã sắp xếp bằng nội suy đường thẳng thông thường: với 1 đến 10 chia thành hai khoảng, ngưỡng là 5.5. |
| Ngắt tự nhiên (Jenks) | Các điểm cắt để lại độ phân tán nhỏ nhất bên trong mỗi khoảng, nên các cụm giá trị giống nhau được giữ lại cùng nhau. Với hơn 1,500 giá trị, nó làm việc trên 1,500 giá trị cách đều nhau và cho biết điều đó. |

## Màu

Viridis và Cividis chạy từ tối đến sáng với độ sáng thay đổi đều, nên thứ tự các khoảng vẫn đọc được ngay cả khi in xám hoặc khi bị mù màu. Blues đi từ sáng đến tối. Đỏ đến xanh là dải hai chiều cho các giá trị quanh một mức giữa. **Đảo ngược màu** lật bất kỳ dải nào. Hộp thoại liệt kê các khoảng và số đối tượng trong mỗi khoảng trước khi bạn áp dụng.

## Kích thước, tô và chú giải

- **Cỡ điểm theo** một trường số làm ô vuông của mỗi điểm lớn hơn khi giá trị lớn hơn, nằm giữa hai kích thước bạn đặt (một nửa cạnh, tính bằng milimét trên giấy).
- **Tô bên trong đa giác** tô mỗi đa giác bằng màu nhóm của nó (lỗ vẫn trống). Màu tô chỉ hiển thị trên màn hình; bản in và DXF/DWG hiển thị đường viền có màu.
- **Hiển thị chú giải trên mặt bằng** vẽ các nhóm, số đối tượng và phạm vi kích thước ở góc dưới bên trái của mặt bằng. Chú giải chỉ có trên màn hình; không có trong bản in.
- Để gắn nhãn đối tượng bằng một trường, dùng **Gắn nhãn theo** trong cùng menu.

Kiểu được lưu trong tệp dự án. Bản dựng không biết về kiểu sẽ mở tệp với màu của lớp. Bản in, DXF và DWG mang các nhóm như những lớp riêng, đặt tên theo lớp và nhóm, dùng màu CAD cơ bản gần nhất trong chín màu. Lớp có hơn 200,000 đối tượng được vẽ bằng một màu.
