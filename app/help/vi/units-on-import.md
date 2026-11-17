---
title: Đơn vị khi nhập: tệp tự khai báo đơn vị, hoặc bạn được hỏi trước
summary: Khi bản vẽ hoặc lưới bạn đưa vào dự án có khai báo đơn vị, CivilCraft sẽ chuyển đổi và cho biết. Khi không khai báo, CivilCraft hỏi trước khi đọc vào và ghi nhớ câu trả lời cho tệp đó.
keywords: đơn vị, nhập, DWG, DXF, STL, OBJ, khảo sát, feet, US survey feet, mét, milimét, tỷ lệ, sai kích thước, quá lớn, quá nhỏ, hỏi, được ghi nhớ, INSUNITS, đơn vị bản vẽ
from: 60921963
---

## Bạn sẽ làm gì

Đưa một tệp vào dự án và bảo đảm nó vào đúng kích thước.

## Các bước

1. Mở tệp như thường lệ: {{ui:Mở}}, kéo thả lên mặt bằng, hoặc dùng lệnh vẽ CAD.
2. Nếu tệp khai báo đơn vị, sẽ không có câu hỏi nào: hộp thoại nhập hiển thị chúng là **Theo bản vẽ**.
3. Nếu không, một hộp thoại hỏi **Đơn vị của** tệp trước khi hộp thoại nhập mở ra. Chọn một đơn vị trong tệp là gì và nhấp {{ui:Dùng các đơn vị này}}.
4. {{ui:Hủy}} (hoặc {{key:Esc}}) bỏ qua tệp. Không có nội dung nào của tệp được đọc vào dự án.

## Tệp nào khai báo đơn vị

- **DWG và DXF**: đơn vị chèn của bản vẽ (`$INSUNITS`). Tệp không có thông tin này sẽ được hỏi. Danh sách **Đơn vị bản vẽ** trong hộp thoại nhập bắt đầu bằng câu trả lời của bạn và vẫn có thể thay đổi.
- **STL và OBJ** (hình dạng tự do của địa hình): không bao giờ khai báo đơn vị. Bạn sẽ được hỏi.
- **Danh sách điểm** (CSV, TXT) và danh sách đo đạc theo tiến độ: danh sách khai báo đơn vị trong các dòng đầu sẽ được chuyển đổi và dòng trạng thái cho biết điều đó. Danh sách không khai báo sẽ được hỏi khi bạn nhấn {{ui:Nhập}}, trước khi các điểm được đưa vào. Các cột vĩ độ và kinh độ thay vào đó đi qua hệ tọa độ.
- **Tiện ích bổ sung Đám điểm**: hỏi khi bạn tạo đám điểm có tệp không khai báo đơn vị, và ghi nhãn các con số của đám điểm theo đơn vị mà nó mang.
- **IFC và LandXML**: khai báo đơn vị của chúng; được chuyển đổi sang đơn vị của dự án.
- **LAS, LAZ và ảnh raster cao độ**: được đặt theo hệ tọa độ của chúng; hộp thoại địa hình hỏi đơn vị cao độ khi tệp không khai báo.

## Điều nên biết

- Câu trả lời được ghi nhớ cho tệp đó trên máy tính này, trong mọi ứng dụng CadCraft. Lần nhập tiếp theo bạn sẽ không bị hỏi.
- Để được hỏi lại: bảng lệnh ({{key:Mod+K}}) › **Hỏi lại đơn vị của các tệp đã nhập**.
- Đơn vị do danh sách khai báo được đọc từ tám dòng đầu: một dòng như `units: ft`, hoặc tiêu đề cột đều mang cùng một đơn vị trong ngoặc, chẳng hạn `Elevation (m)`.
