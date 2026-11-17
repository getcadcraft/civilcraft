---
title: San nền cảnh quan
summary: Nền, bờ đất, mương cỏ và san nền tự do với cao độ điểm và đường đồng mức bạn kéo, đào và đắp tức thời, phân tích độ dốc, mũi tên dòng chảy và đọng nước — tất cả trong bề mặt đề xuất của CivilCraft.
keywords: tường chắn, các tường chắn, cạnh đứng, tường thay mái dốc, độ dốc theo từng cạnh, taluy, san nền, san nền cảnh quan, nền, sân thượng, bờ đất, gò đất, mương cỏ, cao độ điểm, mốc cao độ, đường đồng mức, sửa đường đồng mức, đào và đắp, khối lượng đất, phân tích độ dốc, khả năng tiếp cận, dốc đứng, mũi tên dòng chảy, thoát nước, đọng nước, vũng nước
from: e1559eb9
---

Mọi thứ ở đây được san thành **bề mặt đề xuất** với cùng cách san như nền và hành lang. **Mặt đất tự nhiên** không bao giờ bị thay đổi, và Khối lượng đất tính toàn bộ phần đó. Menu San nền nằm trong nhóm Cảnh quan.

## Nền

{{ui:San nền}} › {{ui:Nền}}, rồi nhấp các góc và nhấn {{key:Enter}}. Nền bắt đầu ở cao độ trung bình của mặt đất bên dưới; nhập một **Cao độ** để đặt nó, hoặc để trống để nó bám theo mặt đất trở lại. **Độ dốc** theo % và **Hướng dốc** theo độ (0 = đông, 90 = bắc) làm nó nghiêng. Các cạnh của nó được san ra mặt đất theo **Mái đào** và **Mái đắp** (ngang trên 1).

## Mái dốc theo từng cạnh và tường chắn

Trong **Các cạnh và tường chắn** thuộc Thuộc tính của một nền, một nền bờ hoặc một bờ đất, mỗi cạnh có thể được san theo cách riêng. Cạnh 1 chạy từ góc đầu tiên bạn nhấp đến góc thứ hai, cạnh 2 từ góc thứ hai đến góc thứ ba, và cứ thế.

- **Mọi cạnh**: **Mái dốc** dùng mái đào và mái đắp ở trên cho mọi cạnh; **Thẳng đứng: tường chắn** đặt một tường ở mọi cạnh.
- Theo từng cạnh: **Mái dốc trên**, **Mái dốc riêng** (nhập mái đào và mái đắp cho cạnh đó) hoặc **Thẳng đứng (tường chắn)**.
- Nhập một độ dốc dưới dạng `3` hoặc `3:1` (ngang trên 1 đứng), `33%` hoặc `18.4°`; nó hiện dưới dạng H:1. **Mái đào** và **Mái đắp** của chính nền nhận cùng cách nhập.
- Cạnh thẳng đứng không có taluy: một tường chắn chạy dọc mép, từ nền xuống mặt đất tự nhiên (khi đắp) hoặc từ mặt đất xuống nền (khi đào). **Độ dày tường** (0.3 m hoặc 1 ft để bắt đầu) là khoảng cách mặt đất bậc từ mép nền đến mặt đất tự nhiên. Khối lượng đào và đắp bỏ qua phần taluy mà cạnh đó không còn có.
- Tại nơi tường gặp một cạnh dốc, mái dốc quấn quanh đầu tường; hai tường gặp nhau bằng một mối vát góc.
- Dưới các trường: chiều dài tường, diện tích mặt lộ ra (cao × dài), chiều cao lớn nhất và trung bình.

Mặt bằng vẽ mặt ngoài của mỗi tường bằng các vạch ngắn trên nó và chiều cao ở cả hai đầu và tại điểm cao nhất (trên lớp tường chắn, lớp này cũng đi vào DXF và DWG). Khung nhìn 3D hiện các tường dưới dạng khối đặc ({{ui:Hiện}} › Tường chắn), và các xuất GLB, OBJ và USD có chứa chúng. Các mặt cắt qua mép cho thấy bậc.

**Cảnh báo** (trong Thuộc tính, và trong bảng Vấn đề): một tường cao hơn **Cảnh báo khi chiều cao tường vượt** (1.0 m hoặc 3.3 ft để bắt đầu) "có thể cần tường kỹ thuật hoặc giấy phép; kiểm tra quy định địa phương", và, khi bạn nhập **Độ dốc tối đa đất giữ được**, mọi cạnh có mái đào hoặc mái đắp dốc hơn mức đó. Chúng chỉ là cảnh báo: việc san vẫn được dựng. Mỗi thay đổi là một bước cho {{key:Mod+Z}}.

## Bờ đất

{{ui:San nền}} › {{ui:Bờ đất}}: một gò đất có đỉnh cao **Chiều cao** trên mặt đất trung bình bên dưới, với các cạnh được san ra.

## Mương cỏ

{{ui:San nền}} › {{ui:Mương cỏ (swale)}}, rồi nhấp dọc theo mương **theo hướng nước chảy** và nhấn {{key:Enter}}. Đặt **Độ sâu**, **Bề rộng đáy** (0 cho hình chữ V) và **Mái dốc bên**. Không có **Độ dốc**, đáy của nó bám theo mặt đất, sâu hơn mặt đất một độ sâu, và không bao giờ chạy ngược dốc; nhập một độ dốc để nó có độ dốc đều từ điểm bắt đầu.

## Cao độ điểm và đường đồng mức

1. {{ui:San nền}} › {{ui:Vùng san nền}}: nhấp đường viền của khu vực bạn muốn tạo hình.
2. {{ui:San nền}} › {{ui:Cao độ điểm}}: nhấp bên trong khu vực. Nhập cao độ của nó trong Thuộc tính, hoặc dùng các nút ▲ ▼.
3. {{ui:San nền}} › {{ui:Sửa đường đồng mức}}: nhấp một đường đồng mức bên trong khu vực để lấy nó như một đường có thể định hình lại.

Chọn một điểm hoặc một đường đồng mức và **kéo** nó (hoặc các điểm của nó) trên mặt bằng: bề mặt theo sau khi bạn thả ra, một bước hoàn tác. Bên trong khu vực, mặt đất được dựng lại từ mép của nó (nơi nó gặp mặt đất tự nhiên), các cao độ điểm và các đường đồng mức đã sửa.

## Đào và đắp, tức thời

Thuộc tính của mọi đối tượng san hiển thị **Đào** và **Đắp** của nó và của cả công trường, theo phương pháp lưới mà Khối lượng đất dùng, khi bạn thay đổi nó. Các vấn đề (nằm ngoài bề mặt, một đường viền tự cắt nhau) được liệt kê ở đó.

## Kiểm tra san nền

Trong phần **Kiểm tra san nền** ở bên trái:

- **Phân tích độ dốc** tô màu bề mặt theo độ dốc: đến giới hạn thoải, ở giữa, và dốc hơn giới hạn dốc đứng (5 % và 33.3 % để bắt đầu: thường là 1:20 cho các lối tiếp cận và 1:3 cho việc cắt cỏ). Chú giải cho biết bao nhiêu diện tích rơi vào mỗi loại. Các vùng dốc đứng cũng được in trên bản vẽ.
- **Mũi tên dòng chảy và đọng nước** vẽ hướng nước chảy và khoanh mọi chỗ nước sẽ đọng, kèm độ sâu; phần này cho biết có bao nhiêu chỗ, chỗ sâu nhất và lượng nước chúng giữ.

Các kiểm tra đọc bề mặt đề xuất khi có bất kỳ thứ gì được san, nếu không thì đọc mặt đất tự nhiên.
