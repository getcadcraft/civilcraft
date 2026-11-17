---
title: Trao đổi LandXML
summary: Mở LandXML từ phần mềm dân dụng khác như một dự án mới, xuất điểm, bề mặt, tuyến, trắc dọc và mạng ống dưới dạng LandXML 1.2, và biết những gì không đi theo được.
keywords: landxml, xml, nhập, xuất, trao đổi, tin, bề mặt, tuyến, trắc dọc, mạng ống, khả năng tương tác, trao đổi dữ liệu
from: 870d5ece
---

LandXML là định dạng trao đổi mở mà hầu hết phần mềm dân dụng đọc và ghi. CivilCraft đọc và ghi LandXML 1.2. Nếu bạn đã dùng Civil 3D, các hộp thoại nhập và xuất LandXML của nó là thứ gần nhất; ở đây không có lựa chọn nào phải làm, và các ghi chú cho bạn biết những gì đã bị bỏ.

## Mở một tệp LandXML

1. Nhấp {{ui:Open}} (hoặc nhấn {{key:Mod+O}}) và chọn tệp `.xml` hoặc `.landxml`, hoặc thả nó lên mặt bằng.
2. Nếu dự án hiện tại có thay đổi chưa lưu, CivilCraft sẽ hỏi trước. Chọn {{ui:Save a copy}}, {{ui:Don’t save}} hoặc {{ui:Cancel}}.
3. Một **dự án mới** được tạo. Thanh trạng thái cho biết những gì đã đọc, ví dụ "Đã mở site.xml: 412 điểm, 2 bề mặt, 3 tuyến."
4. Xem hộp dưới các thông tin của **Bề mặt**. Nó liệt kê mọi thứ đã bị bỏ qua hoặc thay đổi, ví dụ:
   - "Chỉ mở bề mặt đầu tiên ("EG"); tệp có thêm 1."
   - "Tuyến "Ramp A" có phần tử CivilCraft chưa vẽ được (không phải đường thẳng, cung hay đường xoắn clothoid); tuyến đã bị bỏ qua."
   - "Quy tắc mạng ống không có trong tệp; đang dùng giá trị giữ chỗ — hãy đặt của bạn trong Dự án."

Đưa vào:

| Trong tệp | Trong CivilCraft |
|---|---|
| Đơn vị (Imperial hoặc Metric) | **Đơn vị** của dự án (feet hoặc mét) |
| Tên dự án | **Tên** của dự án |
| CgPoints | Các điểm của dự án; mô tả (hoặc code) cho biết nhóm |
| Bề mặt TIN đầu tiên | Mặt đất hiện trạng, dùng nguyên vẹn ("Bề mặt (từ LandXML)") |
| Mọi tuyến gồm đường thẳng, cung và đường xoắn clothoid | Một tuyến với PI, bán kính và chiều dài đường xoắn được dựng lại từ các đường cong |
| Trắc dọc thiết kế đầu tiên của mỗi tuyến | Trắc dọc thiết kế của tuyến, với đường cong đứng parabol |
| Mạng ống đầu tiên | Mạng ống, với miệng, hố thu và đáy trong |
| Đường đặc trưng của đường thẳng và cung | Đường đặc trưng, giữ các cung; từ phần mềm khác chúng bắt đầu ở trạng thái **Chỉ vẽ** |

Danh sách đầy đủ các phần tử và thuộc tính nằm trong [LandXML: những gì được đọc và ghi](topic:landxml-reference).

:::note
Bề mặt đọc từ LandXML không được dựng lại khi bạn thay đổi nhóm điểm hoặc vẽ đường ngắt. Nhấp {{ui:Rebuild the surface from the points}} trong mục **Bề mặt** để dựng nó từ các điểm thay thế ({{key:Mod+Z}} đưa bề mặt LandXML trở lại).
:::

## Xuất LandXML

1. Nhấp {{ui:LandXML}} trong nhóm **Xuất**.
2. Trình duyệt tải xuống `<name>.xml`. Thanh trạng thái cho biết những gì đã được đưa vào, ví dụ "Đã xuất LandXML 1.2: 276 điểm, 2 bề mặt, 1 tuyến, mạng ống. Nền không nằm trong LandXML ở đây; bề mặt đã san thì có."

Tệp chứa:

- **Units**: feet khảo sát Hoa Kỳ hoặc mét.
- **CgPoints**: mọi điểm, với số của nó làm tên, mô tả và nhóm làm code.
- **Surfaces**: mặt đất hiện trạng dạng TIN, với đường ngắt và ranh giới ngoài làm dữ liệu nguồn; và, khi nền hoặc hành lang được san, một bề mặt TIN thứ hai đặt tên "Proposed".
- **Alignments**: đường thẳng, cung và đường xoắn clothoid với cọc của chúng, mỗi tuyến có một trắc dọc chứa mặt đất hiện trạng được lấy mẫu dọc theo nó và trắc dọc thiết kế (PVI và đường cong parabol) khi có ít nhất hai PVI.
- **PipeNetworks**: công trình với miệng, hố thu và đáy trong cho mỗi ống, và các ống với đường kính, chiều dài và độ dốc.
- **PlanFeatures**: mọi đường đặc trưng dưới dạng đường thẳng và cung, với cao độ ở mỗi đầu, và nó dùng để làm gì.

## Những gì không đi theo được

- Nền và hành lang như đối tượng. Kết quả của chúng nằm trong bề mặt "Proposed".
- Tuyến có lỗi (ví dụ các đường cong chồng lên nhau): bị bỏ, và được đếm trong thông báo trạng thái.
- Ống thiếu cả hai đáy trong, và mạng có ít hơn hai công trình.
- Miệng lấy từ bề mặt được ghi thành miệng cố định. Khi mở lại, công trình giữ số đó ngay cả khi bề mặt thay đổi.
- Quy tắc mạng (độ dốc nhỏ nhất, độ che phủ, độ chênh rơi): LandXML không có chỗ cho chúng.
- Cài đặt hiển thị và lựa chọn bề mặt của nhóm điểm: hãy lưu một dự án CivilCraft cho những thứ đó.

Khi mở, CivilCraft không đọc đường xoắn khác clothoid, lưới bề mặt, điểm chỉ tham chiếu đến điểm khác, thửa đất, đường xoắn trong đường đặc trưng, tuyến đường hay dữ liệu khảo sát. Mỗi thứ đều được nêu trong ghi chú, không bao giờ được đoán.

## Vòng đi về

Để giao công việc cho người dùng phần mềm dân dụng khác rồi nhận lại, hãy xuất LandXML, để họ chỉnh sửa, và mở LandXML của họ như một dự án mới. Giữ lại tệp `.civilcraft.json` của bạn: đó là tệp duy nhất giữ mọi thứ CivilCraft biết.
