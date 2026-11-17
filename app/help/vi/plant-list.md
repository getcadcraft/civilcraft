---
title: Danh sách cây
summary: Khoảng 420 cây ôn đới và Địa Trung Hải phổ biến, kèm kích thước, khả năng chịu lạnh, ánh sáng và nước, có thể tìm kiếm bằng mọi ngôn ngữ, cùng danh sách cây riêng của bạn được lưu với dự án.
keywords: danh sách cây, cơ sở dữ liệu cây, loài, tên khoa học, tên thông thường, bảng màu cây, danh mục vườn ươm, vùng chịu lạnh, csv, nhập cây, xuất cây, cây của tôi, danh sách cây thân gỗ, danh sách cây bụi, plantas, thư viện cây
from: 7ed09e7e
---

Mục **Cây trồng** trong bảng bên trái liệt kê mọi cây bạn có thể đặt. Nhấn một cây để xem kích thước và chọn nó làm cây mà **Cây**, **Luống** và **Hàng rào cây** sử dụng.

## Tìm kiếm và lọc

Nhập vào ô **Tìm kiếm**: bất kỳ từ nào trong tên cây bằng mọi ngôn ngữ (tiếng Anh, tiếng Tây Ban Nha, tiếng Bồ Đào Nha), tên khoa học, loại cây hoặc một từ trong ghi chú của cây. Mọi từ bạn nhập đều phải khớp, nên `quercus evergreen` tìm được các loài sồi thường xanh. Dấu không ảnh hưởng đến kết quả.

Thu hẹp danh sách bằng **Loại**, **Ánh sáng**, **Nước** và **Vùng chịu lạnh** (vùng USDA nơi khu đất của bạn nằm: cây được liệt kê khi vùng nằm trong phạm vi của nó).

## Thông tin của một cây

| Trường | Ý nghĩa |
|---|---|
| Loại | Cây thân gỗ, cây bụi, hàng rào, cỏ (kể cả bãi cỏ), cây lâu năm, cây phủ đất hoặc cây leo |
| Khi trưởng thành | Chiều cao và bề rộng tán của cây khi lớn trong vườn hoặc trên đường phố, tính bằng mét |
| Khi trồng | Kích thước cây được đưa vào trồng, và chậu hoặc bầu của nó |
| Khoảng cách | Từ tâm đến tâm trong luống hoặc dọc theo hàng rào |
| Vùng chịu lạnh | Các vùng USDA mà cây thường chịu được |
| Ánh sáng, nước, đất | Điều kiện cây cần |
| Ghi chú | Công dụng và lưu ý, chẳng hạn bộ phận độc hoặc cây lan rộng |

:::note
Danh sách có sẵn được viết cho CadCraft dựa trên kiến thức làm vườn chung: kích thước điển hình, đã làm tròn. Đây không phải danh mục của vườn ươm nào. Hãy kiểm tra kích thước và khả năng chịu lạnh với vườn ươm địa phương. Các loài xâm lấn nổi tiếng nhất của Iberia và phần lớn thế giới ôn đới đã được cố ý bỏ qua, và một số loài xâm lấn ở nơi khác có ghi chú.
:::

## Cây riêng của bạn

- **Thêm vào danh sách của dự án này** sao chép một cây vào danh sách riêng của dự án, nơi nó được lưu cùng dự án. Cây trong danh sách của bạn thay thế cây có sẵn cùng khóa, nên bạn có thể đổi kích thước cho khu vực của mình.
- **Nhập danh sách cây…** đọc một tệp CSV (hoặc tệp cây). Tệp CSV cần một cột tên khoa học và, tốt nhất, có loại, chiều cao và bề rộng tán; tên cột theo cách bạn đặt cũng được (Latin, Common name, Height, Spread, Width, Zone). Dấu phẩy, dấu chấm phẩy, tab và dấu phẩy thập phân đều được đọc. Kích thước trồng, khoảng cách và chậu để trống sẽ lấy giá trị mặc định hợp lý theo loại cây.
- **Xuất dưới dạng CSV** lưu danh sách của bạn (hoặc, khi chưa có, các cây mà tìm kiếm đang hiển thị) để mở bằng bảng tính.

Danh sách cây được đọc như mọi tệp từ bên ngoài: phần nào không dùng được sẽ bị bỏ qua và được đếm.

## Cây trong các ứng dụng khác

Danh sách cây là một thư viện chung cho mọi ứng dụng CadCraft: BimCraft và ModelCraft dùng cùng danh sách, nhưng lệnh Đặt từ thư viện riêng của chúng chưa cung cấp cây. Hiện tại cây đi vào mô hình BIM thông qua tệp IFC cảnh quan của CivilCraft (mỗi cây là một `IfcGeographicElement`). Xem [Trồng cây](topic:planting#ifc).
