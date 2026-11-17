---
title: Phân tích lớp GIS
summary: Vùng đệm, chồng lớp (giao, hợp, xóa, hòa tan), nối không gian, chọn theo thuộc tính và đo các lớp GIS trong dự án, mỗi kết quả thành một lớp mới mà bạn có thể hoàn tác.
keywords: gis, phân tích, vùng đệm, buffer, chồng lớp, giao, hợp, xóa, cắt, hòa tan, nối không gian, nối, chọn theo thuộc tính, truy vấn, where, biểu thức, thống kê, diện tích, chiều dài, chu vi, đo, thửa đất, quyền địa dịch, khoảng lùi, shapefile, geopackage, bảng thuộc tính
from: a6b2d3f9
---

Khi dự án đã có lớp GIS (xem [Nhập dữ liệu GIS](topic:gis-import)), nút **Phân tích** trong nhóm GIS (gõ `GISANALYSIS`, `ANALYZE` hoặc `BUFFER`) mở một bảng có năm thẻ. Bảng này nằm cạnh mặt bằng và vẫn mở khi bạn làm việc, nên vùng bạn chọn được vẽ ngay trên mặt bằng.

Mọi công cụ tạo ra thứ gì đó đều **thêm một lớp mới** và giữ nguyên các lớp mà nó đọc. Mỗi lần là một bước hoàn tác: {{ui:Hoàn tác}} trong bảng (hoặc Ctrl+Z) sẽ xóa lớp mới. Để xuất kết quả như mọi lớp khác, dùng [Xuất dữ liệu hoàn công cho GIS](topic:gis-export) dưới dạng shapefile, GeoJSON hoặc GeoPackage.

Bảng đầy đủ của một lớp, có sắp xếp, sửa và bộ tính trường, nằm trong [Làm việc với bảng thuộc tính của lớp](topic:gis-table); tô màu theo một trường nằm trong [Tô kiểu lớp theo thuộc tính](topic:gis-symbology).

Mọi thứ được làm trên mặt bằng, theo đơn vị của dự án (feet hoặc mét). Dự án luôn ở hệ chiếu hoặc hệ cục bộ, nên khoảng cách 50 nghĩa là 50 feet hoặc 50 mét, không bao giờ là độ. Cao độ (z) không được giữ trong kết quả.

## Vùng đệm

Vẽ một vùng cách đều một khoảng cho trước quanh mỗi đối tượng, thành một lớp đa giác mới. Điểm thành hình tròn, đường thành hành lang có đầu tròn, đa giác được mở rộng. Khoảng cách **âm** thu nhỏ đa giác (hình vuông 100 x 100 thu nhỏ 5 còn 90 x 90; thu nhỏ 60 thì không còn gì, và bảng sẽ báo). Lấy khoảng cách từ một trường số để mỗi đối tượng có khoảng cách riêng, hoặc chọn **Gộp tất cả vùng đệm thành một hình** để hòa tan chúng.

Phần bo tròn được vẽ bằng các đoạn thẳng nằm bên trong đường cong thật, nên vùng đệm nhỏ hơn hình tròn chính xác một chút: khoảng 0.6 % về diện tích ở mức thường, 0.16 % ở mức Mịn. Dùng Mịn cho mọi thứ bạn sẽ đo.

## Chồng lớp

| Công cụ | Bạn nhận được |
|---|---|
| Giao | Các phần nơi lớp đầu vào gặp các đa giác của lớp chồng, mỗi phần có các trường của cả hai lớp. Đường và điểm được cắt theo đa giác. |
| Hợp | Cả hai lớp đa giác được cắt theo cạnh của nhau: các phần chung mang trường của cả hai lớp, phần còn lại mang trường của một lớp (trường của lớp kia để trống). |
| Xóa | Các đa giác đầu vào với các đa giác lớp chồng được loại bỏ. Trường giữ theo đầu vào. Đối tượng bị xóa hết sẽ bị bỏ đi (bảng đếm số đó). |
| Hòa tan | Gộp các đa giác chạm hoặc chồng lên nhau, tất cả thành một hoặc một hình cho mỗi giá trị của một trường. Thêm `COUNT` và `AREA`. |

Tên trường mà cả hai lớp đều có được giữ cho lớp thứ nhất, còn của lớp thứ hai được ghi với `_2`. Các đối tượng trong cùng một lớp không nên chồng lên nhau: nếu có, phép Hợp sẽ đếm phần chồng ở cả hai bên.

## Nối

Nối không gian sao chép thuộc tính từ một lớp **nguồn** lên mỗi đối tượng **đích** mà nó gặp, và cho một lớp mới với hình dạng của đích. Chọn khi nào chúng gặp nhau: chạm hoặc chồng lên nhau, đích nằm trong đa giác nguồn, đích chứa đối tượng nguồn, đối tượng nguồn gần nhất (với giới hạn tùy chọn), hoặc bất kỳ đối tượng nguồn nào trong một khoảng cách.

Khi có nhiều đối tượng nguồn khớp, bạn lấy thuộc tính của đối tượng đầu tiên (gần nhất, với phép nối gần nhất và theo khoảng cách; `DISTANCE` được thêm), hoặc **đếm chúng và cộng các trường số**: `COUNT`, và `SUM_`, `MEAN_`, `MIN_`, `MAX_` cho mỗi trường số. Bỏ chọn **Giữ đối tượng đích không khớp** để loại chúng ra. Các trường được nối để trống ở nơi không khớp, và bảng đếm số không khớp.

## Chọn

Gõ một câu hỏi về thuộc tính hoặc hình dạng, nhấn **Chọn**, và các đối tượng được vẽ trên mặt bằng cùng số lượng, một bảng và tổng diện tích, chiều dài hoặc số. Sau đó bạn có thể tạo chúng thành một lớp riêng, thu phóng đến chúng hoặc xóa vùng chọn.

| Bạn có thể viết | Ví dụ |
|---|---|
| Tên trường; dùng "ngoặc kép" hoặc [ngoặc vuông] nếu tên có khoảng trắng | `VALUE`, `"Lot Number"` |
| Số, 'văn bản', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (văn bản không phân biệt hoa thường; trong `like`, `%` là chuỗi bất kỳ và `_` là một ký tự) | `Notes contains 'corner'` |
| `is null`, `is not null` (giá trị trống được tính là null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` và dấu ngoặc | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Giá trị hình dạng `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Câu hỏi chưa đầy đủ hoặc nêu một trường mà lớp không có sẽ bị từ chối, kèm một câu cho biết chỗ sai.

## Đo

Hiển thị tổng diện tích và chu vi, chiều dài hoặc số lượng của lớp, và **thêm trường** vào lớp: `AREA` và `PERIMETER` cho đa giác, `LENGTH` cho đường (chiều dài trên mặt bằng), `X` và `Y` cho điểm. Trường đã có sẵn không bao giờ bị ghi đè: trường mới được đặt tên `AREA_2`. Đây là một bước hoàn tác. **Thống kê** cho số lượng, tổng, trung bình, nhỏ nhất và lớn nhất của một trường số, tùy chọn theo từng giá trị của trường khác.

:::note
Các kiểm tra đằng sau những công cụ này được tính tay trong bài kiểm thử (`node bin/test-civilcraft-gisanalysis.mjs`): ví dụ các thửa 100 x 100 nằm dưới một vùng 100 x 80 giao nhau thành 3,000 cộng 3,000, và một đường dài 100 được vùng đệm 10 có diện tích 2,000 cộng một hình tròn.
:::
