---
title: Kiểm tra bản vẽ đo đạc khi nhập
summary: Đọc các cao độ viết dưới dạng văn bản hoặc trong thuộc tính khối như điểm đo, và kiểm tra DWG hoặc DXF xem có đơn vị sai, thiếu hệ tọa độ, gốc ở rất xa, đường đồng mức phẳng, cao độ bất thường hay điểm trùng lặp hay không, trước khi dựng mặt đất từ nó.
keywords: kiểm tra đo đạc, kiểm tra khi nhập, cao độ đo đạc, cao độ điểm, cao độ dạng văn bản, thuộc tính, đơn vị, hệ tọa độ, xa gốc, đường đồng mức bằng không, điểm ngoại lai, điểm trùng, vấn đề, kiến trúc sư cảnh quan, bản vẽ đo đạc
from: d46acd24
---

Bản vẽ đo đạc có thể trông đúng mà vẫn sai cho một mặt đất: đơn vị của nó có thể bị đoán, các đường đồng mức có thể nằm phẳng ở độ cao 0, hoặc các cao độ có thể được viết dưới dạng văn bản mà thực chất không phải hình học. Phần **Cao độ đo đạc và kiểm tra** trong hộp thoại {{ui:Đường nét}} (xem [Mở DWG hoặc DXF làm đường nét](topic:open-dwg-dxf)) đọc các cao độ đó và cho biết điều gì trông sai trước khi bất cứ thứ gì được thêm vào.

## Cao độ viết dưới dạng văn bản hoặc trong thuộc tính

Nhiều bản vẽ đo đạc ghi một cao độ điểm bằng một dòng chữ nhỏ cạnh một dấu chéo, như `104.37` hoặc `EL 104.37`, hoặc như một thuộc tính của khối điểm. Đây không phải là đường, nên trình đọc đường nét bỏ qua chúng. Phần này liệt kê số lượng đã tìm thấy và cho phép bạn lấy chúng làm **điểm đo**:

1. Đánh dấu **Lấy … cao độ làm điểm đo**. Ban đầu chúng không được đánh dấu, vì không phải số nào trong bản vẽ cũng là độ cao.
2. Văn bản được đọc khi nó là một cao độ đứng riêng: một số có phần thập phân (`104.37`, `+104,37`, `-3.50`), hoặc một số đi sau `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` hoặc `LEVEL`, với `m`, `ft` hoặc `'` tùy chọn đi sau. Một số nguyên đứng một mình (`12`) được đọc là số lô hoặc số tờ, không phải cao độ; các văn bản như `GATE 3` hoặc một ngày không bao giờ được đọc. Mã định dạng văn bản bị bỏ qua.
3. Với thuộc tính khối, chọn **Thuộc tính khối chứa cao độ**. CivilCraft tự tìm thẻ tên ELEV, Z, LEVEL, RL hoặc tương tự; chọn thẻ khác từ danh sách nếu bản vẽ dùng thẻ riêng. Lựa chọn được ghi nhớ cho tên tệp đó trên máy tính này, nên mở lại sẽ bắt đầu với cùng thẻ. Thẻ bạn chọn cũng coi số nguyên là cao độ.
4. Nhấn {{ui:Thêm}}. Các điểm được đánh số tiếp sau số cao nhất trong dự án, mỗi điểm được mô tả bằng lớp (hoặc khối) của nó, và độ cao được đổi sang đơn vị của dự án như phần còn lại của bản vẽ. Tất cả là một bước: {{key:Mod+Z}} sẽ gỡ các điểm đó đi.

Văn bản nằm tại điểm chèn riêng của nó (hoặc điểm căn chỉnh nếu có). Văn bản trong khối không được đọc, và bản vẽ không bao giờ bị thay đổi.

## Kiểm tra

Kiểm tra chạy trên những gì bạn sắp đưa vào và liệt kê những gì nó tìm thấy, mỗi loại vấn đề một dòng:

| Thông báo | Ý nghĩa |
|---|---|
| **Chưa ghi đơn vị** | Bản vẽ không cho biết đơn vị của nó, nên các số của nó được đọc theo đơn vị của dự án. Hãy kiểm tra một khoảng cách mà bạn biết. |
| **Đã đổi đơn vị** | Đơn vị của bản vẽ khác đơn vị của dự án và được quy đổi (là ghi chú, không phải lỗi). |
| **Dữ liệu trải rộng … km** hoặc **… m** | Phạm vi lớn hơn 200 km hoặc nhỏ hơn nửa mét, thường do sai đơn vị (milimét bị đọc là mét, hoặc ngược lại). |
| **Không có hệ tọa độ** | Dự án chưa có hệ nào. Đây là cảnh báo khi dữ liệu nằm rất xa điểm 0, như tọa độ hệ phẳng tiểu bang hoặc lưới quốc gia. Xem [Hệ tọa độ](topic:coordinate-systems). |
| **Xa gốc tọa độ** | Dữ liệu nằm cách điểm 0 hơn 100 km. Ở xa điểm 0, các khung nhìn 3D và bản xuất mất độ chính xác và bị rung. |
| **Lớp đường đồng mức … không có độ cao** | Một lớp được đặt tên như đường đồng mức (TOPO, CONT, CNTR, CONTOUR) chứa các đường ở độ cao 0, nên mặt đất dựng từ chúng sẽ phẳng. |
| **Cao độ đúng bằng 0** | Một số cao độ bằng 0 trong khi cao độ thông thường cách xa nó: có thể đang thiếu độ cao. |
| **Cao độ xa so với phần còn lại** | Một vài cao độ nằm xa bên ngoài các cao độ khác (được xác định so với giữa tất cả các cao độ, nên một công trường dốc có khoảng cao rộng không bị đánh dấu), hoặc trên 9,000 m hoặc dưới -11,000 m. |
| **Điểm chồng lên điểm khác** | Hai điểm ở cùng một chỗ với cùng cao độ, hoặc với cao độ khác nhau. |

Sau khi bạn nhấn {{ui:Thêm}}, các dòng tương tự được gửi đến **Vấn đề**, mỗi loại một dòng, kèm tên tệp, để bạn quay lại sau. Kiểm tra chỉ đánh giá bản vẽ; nó không thay đổi gì trong bản vẽ, và không ngăn bạn dùng bản vẽ.

:::tip
Khi kiểm tra báo đường đồng mức phẳng ở 0 và có cao độ viết dưới dạng văn bản, hãy lấy các cao độ đó làm điểm đo: chúng thường mang độ cao thực mà các đường đồng mức còn thiếu.
:::

## Những gì không được kiểm tra

Kiểm tra không so sánh bản vẽ với một khảo sát thứ hai, và không thể biết bản vẽ nằm trong hệ tọa độ nào: nó chỉ cho biết rằng chưa đặt hệ nào.
