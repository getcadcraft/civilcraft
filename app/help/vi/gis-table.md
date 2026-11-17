---
title: Làm việc với bảng thuộc tính của lớp
summary: Xem mọi đối tượng của lớp GIS dưới dạng bảng, sắp xếp và lọc, chọn hàng và đối tượng cùng lúc, sửa giá trị, thêm trường, tính giá trị mới và lưu bảng dưới dạng CSV.
keywords: bảng thuộc tính, bảng, trường, cột, hàng, sắp xếp, lọc, biểu thức, chọn, sửa, bộ tính trường, tính toán, thêm trường, đổi tên trường, gỡ trường, csv, xuất, gis, shapefile, geopackage, ký hiệu
from: fd9d6c11
---

Mở bảng của một lớp từ menu **ba chấm** trong danh sách Lớp GIS ({{ui:Bảng thuộc tính…}}), từ Bề mặt › Thêm › {{ui:Bảng thuộc tính}}, hoặc bằng cách gõ `ATTRIBUTES`, `ATTTABLE` hoặc `TABLE`. Bảng mở cạnh mặt bằng và vẫn mở khi bạn làm việc. Chỉ những hàng bạn thấy mới được vẽ, nên một lớp có hàng nghìn đối tượng vẫn mở và cuộn nhanh.

## Sắp xếp, lọc và chọn

- **Sắp xếp:** nhấn tiêu đề cột. Nhấn lần thứ hai để đảo ngược, lần thứ ba đưa lại thứ tự của tệp. Giá trị trống luôn nằm ở dưới cùng. Sắp xếp chỉ thay đổi những gì bạn thấy, không bao giờ thay đổi lớp.
- **Lọc:** gõ vào ô lọc. Một biểu thức như `AREA > 500 and USE = 'Res'` giữ các hàng mà nó đúng (cùng các từ như thẻ Chọn của [Phân tích lớp GIS](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Thứ không phải biểu thức, như `oak maple`, sẽ tìm các từ đó trong mọi cột.
- **Chọn hàng:** nhấp một hàng. Ctrl+nhấp thêm hoặc bỏ một hàng, Shift+nhấp chọn một dãy liên tiếp, và {{ui:Chọn các hàng đang hiển thị}} lấy mọi hàng qua bộ lọc. Các đối tượng được chọn được vẽ trên mặt bằng, và nhấp một đối tượng trên mặt bằng sẽ chọn hàng của nó ở đây.
- Khi có hàng được chọn, bạn có thể {{ui:Thu phóng}} đến chúng, tạo một lớp từ vùng chọn, và đọc tổng diện tích hoặc chiều dài trên dòng trạng thái.

## Sửa giá trị

Nhấp đúp một ô (hoặc di chuyển đến đó bằng phím mũi tên rồi nhấn Enter), gõ giá trị mới và nhấn Enter. Escape giữ nguyên như cũ. Giá trị phải phù hợp với cột: số là số, ngày theo `YYYY-MM-DD`, có/không là yes, no, true hoặc false. Giá trị không phù hợp bị từ chối kèm một câu, và không có gì thay đổi. Ô trống làm giá trị trống. Mỗi lần sửa là một bước hoàn tác: {{ui:Hoàn tác}} và {{ui:Làm lại}} nằm ở cuối bảng, và Ctrl+Z hoạt động trên mặt bằng.

## Trường

Dưới **Trường**, bạn có thể thêm một trường (văn bản, số, ngày hoặc có/không), đổi tên, hoặc gỡ bỏ một trường. Trường mới bắt đầu trống. Đổi tên được cập nhật khắp nơi: trường nhãn và [kiểu theo thuộc tính](topic:gis-symbology) của lớp chuyển sang tên mới, còn gỡ một trường sẽ bỏ nhãn và kiểu đã dùng nó. Mỗi thao tác là một bước hoàn tác để khôi phục mọi thứ.

## Bộ tính trường

Ghi một giá trị vào mọi hàng (hoặc chỉ các hàng được chọn) từ các trường khác của hàng, hình học của nó và một số hàm. Chọn một trường có sẵn hoặc **Trường mới…** và đặt tên cùng kiểu. Không có gì được chạy như mã: biểu thức được đọc bởi một bộ phân tích nhỏ với danh sách hàm cố định.

| Nhóm | Từ |
|---|---|
| Số | `+ - * /`, dấu ngoặc, `abs round(x, digits) floor ceil sqrt pow min max` |
| Văn bản | `upper lower trim len substr(text, from, count) left right replace concat` (văn bản đặt trong 'dấu nháy đơn'; tên trường có khoảng trắng đặt trong "dấu nháy kép" hoặc [ngoặc vuông]) |
| Lựa chọn | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Ngày | `year month day` của giá trị `YYYY-MM-DD` |
| Hình học | `$area $perimeter $length $x $y $vertices`, theo đơn vị của dự án |

Kết quả không thể lưu theo kiểu của trường (văn bản trong trường số) sẽ bị để trống và được đếm trong thông báo. Chia cho không cho giá trị trống. Ví dụ `round($area / 43560, 2)` ghi số acre từ feet vuông.

## Xuất

{{ui:Xuất CSV}} lưu các hàng bạn thấy (sau khi lọc và sắp xếp) thành tệp CSV UTF-8 với tên trường ở dòng đầu. Văn bản bắt đầu bằng `=`, `+`, `-` hoặc `@` được thêm dấu nháy đơn ở đầu để bảng tính không chạy nó như công thức. Để lưu chính lớp, dùng [Xuất dữ liệu hoàn công cho GIS](topic:gis-export).

## Giới hạn

Bảng chỉ hiển thị lớp theo một thứ tự sắp xếp và một bộ lọc mỗi lần. Không thể thêm hoặc xóa hàng ở đây (hãy tạo lớp mới từ một vùng chọn), hình học không được sửa, và kiểu của trường không thể thay đổi sau khi đã tạo.
