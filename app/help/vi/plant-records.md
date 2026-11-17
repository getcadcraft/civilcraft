---
title: Bản ghi cây, giống và kích thước cung cấp
summary: Danh sách cây riêng của dự án dưới dạng bảng: giống, kích thước cung cấp (chậu, bầu rễ, chu vi thân, thân trống), mật độ, ghi chú quy cách, CSV vào và ra; mỗi cây được đặt nêu kích thước; ký hiệu cây theo tỷ lệ và ký hiệu cùng mô hình 3D riêng.
keywords: bảng cây, cơ sở dữ liệu cây, giống, biến chủng, kích thước cung cấp, chậu, bầu rễ, rễ trần, chu vi thân, thân trống, mật độ, số cây trên mét vuông, quy cách, ghi chú quy cách, ký hiệu cây, khối, ký hiệu riêng, cây 3d, mức chi tiết, tỷ lệ
from: 12251beb
---

Mở {{ui:Plant table}} từ menu {{ui:More}} của nhóm Cảnh quan, hoặc từ mục Cây trồng. Mỗi hàng là một bản ghi cây trong danh sách riêng của dự án này (bản ghi từ danh sách cây được sao chép vào khi bạn thêm). Mọi chỉnh sửa đều được kiểm tra như một tệp nhập vào, và là một bước hoàn tác.

## Các cột

- **Tên khoa học**, **Tên thông thường**, **Loại**, **Chiều cao** và **Bề rộng tán** khi trưởng thành (mét).
- **Khoảng cách** (từ tâm đến tâm) hoặc **Mật độ** (số cây trên m²). Luống của một bản ghi có mật độ và không có khoảng cách sẽ được lấp đầy theo mật độ đó, theo mẫu riêng của nó (tam giác hoặc vuông).
- **Kích thước cung cấp**: một mục cho mỗi kích thước, các mục cách nhau bằng `;`. Mỗi mục gồm một mã, một loại (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) và sau đó là bất kỳ mục nào sau đây: thể tích `10L`, chiều cao `h0.6`, bề rộng `s0.4`, chu vi thân `g14-16` (cm), thân trống `st1.8`. Ví dụ: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Giống**: tên cách nhau bằng `;`. Một giống giữ kích thước và ghi chú riêng khi tệp bạn nhập có chúng.
- **Ghi chú quy cách**.

{{ui:Duplicate}} sao chép một hàng dưới khóa mới; {{ui:Save as CSV}} và {{ui:Save as a plants file}} ghi danh sách ra (các hàng CSV của giống nằm dưới loài tương ứng, với `cultivar_of`). Nhập một tệp CSV hoặc tệp cây sẽ gộp nó vào.

## Danh sách cây trong Thư viện của bạn

Đăng nhập vào tài khoản CadCraft (Cài đặt, Tiện ích bổ sung của bạn, Đăng nhập) và bảng cây có thể dùng danh sách bạn giữ trong Thư viện:

- {{ui:From my Library list}} lấy các mục cây của riêng bạn (kể cả những mục còn đang chờ duyệt). Một cây bạn đã có ở đây sẽ được cập nhật từ Thư viện; các giống, kích thước cung cấp, mật độ và quy cách bạn đã thêm ở đây được giữ lại.
- {{ui:Save as a plant list}} lưu mọi hàng thành mục cây riêng trong Thư viện, mỗi loài một mục: cây mới là một mục mới, cây đã thay đổi là một phiên bản mới, cây không đổi thì không làm gì. Chọn ô đánh dấu trước: khi lưu, các cây sẽ được công bố công khai theo CC0. Lần tải lên công khai đầu tiên của người chưa được tin cậy sẽ được một người kiểm tra trước khi hiển thị, như mọi lần tải lên khác.

Thư viện giữ bản ghi cây cơ bản. Giống, kích thước cung cấp, mật độ và ghi chú quy cách vẫn nằm trong dự án và trong tệp cây ({{ui:Save as a plants file}}); hộp thoại cho biết mỗi lần lưu ảnh hưởng đến bao nhiêu hàng.

## Cây được đặt có nêu kích thước

Chọn một cây, một hàng rào, hoặc một dòng hỗn hợp của luống hay khu vực trồng: khi bản ghi có giống hoặc kích thước cung cấp, {{ui:Cultivar and size}} sẽ chọn một mục. Bảng thống kê cây khi đó đếm theo loài, giống và kích thước, và nhãn có thể hiển thị chúng: `{botanical} '{cultivar}' {size}` hoặc `{full}`.

## Ký hiệu cây theo tỷ lệ

{{ui:Plant graphics}} (Cảnh quan › Thêm) thiết lập cách cây được vẽ trên mặt bằng: **tự động** (thô hơn 1:500 là một vòng tròn theo bề rộng tán, giữa 1:200 và 1:500 là đường viền có tâm, mịn hơn là ký hiệu chi tiết; có thể đổi cả hai tỷ lệ) hoặc một mức cho mọi tỷ lệ. Hộp thoại Tờ có **Mức chi tiết cây trên mặt bằng** riêng cho bộ đó.

Trên một bản ghi trong mục Cây trồng, {{ui:Own symbol…}} đọc một tệp SVG, hoặc một khối của bản vẽ DXF/DWG, và vẽ nó theo bề rộng tán của cây ở mức chi tiết. {{ui:Own 3D model…}} đọc tệp OBJ, STL hoặc GLB; trong Đồ họa cây, chọn **Mô hình riêng của từng bản ghi** để xem trong 3D. Các tệp bị giới hạn kích thước (512 KB SVG, 2000 hình, 50 000 tam giác) và được giữ trong dự án. Phép biến đổi SVG không được áp dụng (bạn sẽ được thông báo khi tệp có chúng). Xem [Đồ họa cây, ký hiệu riêng và cây 3D](topic:plant-graphics) để biết các mức, giới hạn và những gì một tệp GLB có thể chứa.
