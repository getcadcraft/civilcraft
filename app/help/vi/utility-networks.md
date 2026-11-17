---
title: Mạng lưới tiện ích và OpenStreetMap
summary: Các đoạn ống nước, cống thoát nước, thoát nước mưa, khí đốt, điện và viễn thông với vật liệu, kích thước, lớp đất phủ và chủ sở hữu; dữ liệu OpenStreetMap từ tệp JSON Overpass; giao cắt, mặt cắt rãnh và khối lượng; các lớp dịch vụ trong DWG, DXF và PDF; đoạn ống và đoạn cáp IFC.
keywords: tiện ích, mạng lưới, mạng, osm, openstreetmap, overpass, ống, cáp, khí đốt, cống, thoát nước mưa, viễn thông, điện, nước, trụ cứu hỏa, hố ga, rãnh, giao cắt, khoảng hở, lớp đất phủ, độ sâu, dwg, ifc, định vị địa lý, lớp
from: 8a85dace
---

Vẽ các công trình tiện ích ngầm của công trường, mỗi dịch vụ là một mạng lưới riêng, kiểm tra các chỗ chúng giao cắt, rồi xuất chúng ra dưới dạng lớp bản vẽ và IFC.

## Tạo đoạn

Mở **Bề mặt, Thêm, Mạng lưới tiện ích...**

- **Tạo đoạn từ vùng chọn** biến tuyến, đường đặc trưng hoặc ống đã chọn thành một đoạn của dịch vụ bạn đã chọn. Sau đó nhập vật liệu, kích thước (mm), lớp đất phủ (độ sâu tới đỉnh ống hoặc cáp) và chủ sở hữu trong bảng.
- **Đọc dữ liệu OpenStreetMap** đọc một tệp JSON Overpass bạn đã lưu (truy vấn có `out geom;`). Dự án cần hệ tọa độ trước, vì vị trí OpenStreetMap là vĩ độ và kinh độ. Các đường ống (theo chất dẫn), cáp điện và viễn thông ngầm, trụ cứu hỏa, hố ga và cống thoát nước mưa được đọc; mọi thứ khác được tính là bị bỏ qua và được nêu trong thông báo. Đường dây trên không bị bỏ qua.
- **Thêm bản đồ OpenStreetMap** thêm bản đồ OpenStreetMap dưới mặt bằng. Bản đồ chỉ hiển thị khi các lớp bản đồ từ internet được bật trong Cài đặt.

## Kiểm tra và đầu ra

- **Giao cắt**: các đoạn của những dịch vụ khác nhau giao nhau trên mặt bằng được liệt kê cùng với khoảng cao thông thủy giữa chúng khi có bề mặt đất; giá trị tối thiểu là giá trị tạm bạn tự đặt, không phải số của tiêu chuẩn nào.
- **Rãnh**: mỗi đoạn có một rãnh (kích thước ống cộng khoảng hở mỗi bên, độ dốc mái, lớp lót đáy) kèm khối lượng. Tổng hiển thị trong cửa sổ và trong tệp CSV.
- **Bản vẽ**: các đoạn và điểm nằm trên các lớp dịch vụ (ví dụ U-WATR-RUN, U-POWR-RUN), nên được đưa sang PDF, DXF và DWG.
- **IFC**: các đoạn được đưa vào tệp xuất IFC dưới dạng đoạn ống và đoạn cáp, cùng với trụ cứu hỏa, van và buồng kỹ thuật, mỗi dịch vụ một hệ thống, trong hệ tọa độ của dự án.

## Dữ liệu OpenStreetMap

Dữ liệu OpenStreetMap thuộc bản quyền của những người đóng góp OpenStreetMap và được cấp phép theo ODbL. Phần ghi công được thêm vào bản vẽ, tệp CSV và IFC. Nếu bạn chia sẻ một tệp có chứa dữ liệu OpenStreetMap, hãy giữ phần ghi công và đọc các điều khoản chia sẻ tương tự trong giấy phép.

## Những gì chưa làm

Các đoạn chưa được vẽ từng điểm trên mặt bằng bằng một công cụ, và giao cắt chưa được vẽ trong chế độ xem mặt cắt dọc (phần tính toán đã có). Độ sâu, kích thước và khoảng hở ban đầu là giá trị tạm: hãy dùng số của tiêu chuẩn riêng của bạn.
