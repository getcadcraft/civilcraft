---
title: Đường lấy mẫu và mặt cắt ngang
summary: Cắt mặt cắt vuông góc với một tuyến, xem địa hình, thiết kế và đào, đắp tại mỗi cọc, và lấy khối lượng theo phương pháp diện tích đầu trung bình.
keywords: biểu đồ khối lượng, biểu đồ vận chuyển, điểm cân bằng, co ngót, nở rời, khoảng cách vận chuyển, đất mượn, đất thải, tờ mặt cắt, tờ mặt cắt ngang, pdf mặt cắt, mặt cắt, mặt cắt ngang, đường lấy mẫu, khung mặt cắt, đào, đắp, diện tích, diện tích đầu trung bình, khối lượng đất, cọc, lệch tâm, csv
from: 5060173c
---

Mặt cắt ngang cho thấy con đường sẽ được xây dựng ra sao: cắt ngang tuyến tại một cọc, gồm địa hình hiện trạng, thiết kế (hành lang hoặc nền đã san) và phần đào và đắp giữa chúng.

## Thêm đường lấy mẫu

1. Chọn một tuyến. Trong **Thuộc tính**, dưới **Đường lấy mẫu**, nhấp {{ui:Add sample lines}}.
2. Đặt **Mỗi** (khoảng cách: ban đầu 50 ft hoặc 20 m), **Chiều rộng trái** và **Chiều rộng phải** (mỗi mặt cắt vươn ra bao xa từ đường tâm).
3. Để cắt một mặt cắt tại một cọc cụ thể, nhập nó vào **Thêm một cọc** (ví dụ `2+35`) và nhấn {{key:Enter}}.

Các mặt cắt được cắt tại mọi bội số nguyên của khoảng cách, tại cả hai đầu của tuyến, tại đầu và cuối của mọi đường cong (PC và PT), và tại các cọc bạn thêm. Các đường lấy mẫu hiển thị trên bình đồ dưới dạng đường xám ngang tuyến; chúng cũng xuất ra DXF, DWG và PDF trên lớp C-ROAD-SCTN. Mỗi thay đổi là một bước: {{key:Mod+Z}} hoàn tác nó.

## Khung mặt cắt

Mở bằng {{ui:Section view}} trong **Thuộc tính** của tuyến, {{ui:Sections}} dưới **Bề mặt** › {{ui:More}}, hoặc {{key:X}}. Nó thay thế khung trắc dọc bên dưới bình đồ.

- Di chuyển qua các mặt cắt bằng các mũi tên trên thanh của nó, danh sách cọc, hoặc {{key:Left}} và {{key:Right}} khi khung mặt cắt đang được chọn ({{key:Home}} và {{key:End}} cho mặt cắt đầu và cuối).
- Đường xám là địa hình hiện trạng, đường đỏ là thiết kế. Phần đào được tô màu cam, phần đắp màu xanh lá. Các điểm hành lang được đánh dấu: CL (đường tâm), EOP (mép mặt đường), SH (lề) và DL (đường giao với mặt đất).
- Phần đầu hiển thị cọc, diện tích đào và đắp của mặt cắt này, và độ phóng đại đứng. **Vừa khung** lấp đầy bảng; chọn 1× để xem mặt cắt đúng tỷ lệ.
- Đường đậm trên bình đồ cho biết mặt cắt nào đang trên màn hình.

## Tờ mặt cắt

{{ui:Section sheets (PDF)}} dưới **Đường lấy mẫu** đặt mọi mặt cắt lên các trang PDF, thành hàng từ trái sang phải và từ trên xuống dưới theo thứ tự cọc. Chọn **Khổ giấy**, **Tỷ lệ bình đồ** (tỷ lệ ngang của các mặt cắt) và **Độ phóng đại trắc dọc** (1×, 2×, 5× hoặc 10×); hộp thoại cho biết mỗi trang chứa được bao nhiêu mặt cắt và tạo ra bao nhiêu trang.

Mỗi mặt cắt hiển thị một lưới với độ lệch và cao độ, địa hình (nét đứt), thiết kế, phần đào và đắp được tô (cam và xanh lá), các điểm hành lang, và bên dưới là cọc cùng diện tích đào và đắp. Mọi mặt cắt trên các tờ đều được vẽ cùng kích thước, đủ cao cho mặt cắt lớn nhất; khi nó không vừa trang ở độ phóng đại của bạn, CivilCraft dùng mặt cắt lớn nhất vừa được và thông báo điều đó. Dải tiêu đề ghi tên tuyến, các cọc trên trang đó, các tỷ lệ và "Tờ 1 trên 3".

## Khối lượng theo diện tích đầu trung bình

Giữa hai mặt cắt kề nhau, khối lượng bằng trung bình hai diện tích của chúng nhân với khoảng cách giữa các cọc. Thanh hiển thị tổng cho tuyến, và {{ui:CSV}} tải xuống diện tích và khối lượng của mọi mặt cắt cùng tổng cộng dồn (yard khối cho dự án hệ Anh, mét khối cho dự án hệ mét).

**Thuộc tính** hiển thị các tổng tương tự bên cạnh khối lượng theo phương pháp lưới từ [Khối lượng đất](topic:volumes). Hai cách này là các phép xấp xỉ khác nhau: các mặt cắt gần nhau sẽ làm chúng gần nhau hơn, và trên đường thẳng trên nền bằng phẳng thì chúng giống nhau.

:::note
Đào và đắp chỉ được tính bên trong các vùng đã san (các đường giao với mặt đất của một hành lang hoặc một nền), như phương pháp lưới làm. Không có hành lang hay nền thì thiết kế chính là địa hình, nên một mặt cắt không hiển thị đào hay đắp nào.
:::

## Biểu đồ vận chuyển

**Biểu đồ vận chuyển** dưới **Đường lấy mẫu** vẽ biểu đồ vận chuyển từ cùng các khối lượng diện tích đầu trung bình: dọc theo các cọc, tổng cộng dồn của phần đào trừ phần đắp.

- **Co ngót (−) hoặc nở rời (+) của phần đào** cho biết một yard khối đào sau khi đặt thành đắp thì thành bao nhiêu: −10 % (giá trị khởi đầu, là giá trị tạm) nghĩa là co còn 0,9; đất đá nở rời có thể là +5 %. Hãy dùng con số trong báo cáo địa kỹ thuật của bạn.
- Nơi đường lên thì đường nằm trong đào; nơi đường xuống thì nằm trong đắp. Phía trên không (tô màu cam) đất di chuyển theo chiều cọc tăng; phía dưới không (xanh lá), đất di chuyển theo chiều cọc giảm.
- **Điểm cân bằng** là nơi đường cắt không: giữa hai điểm như vậy, đào và đắp cân bằng nhau. Bảng liệt kê mỗi đoạn cân bằng, khối lượng được di chuyển (tại điểm cao nhất hoặc thấp nhất của nó) và khoảng cách vận chuyển trung bình (diện tích được tô chia cho khối lượng đó).
- Nơi đường kết thúc khác không, phần còn lại là **đất thải** (phía trên) hoặc **đất mượn** (phía dưới). Trong đoạn cuối cùng đó, chỉ phần đất vượt quá mức mà nó kết thúc mới được tính là di chuyển.

**CSV** lưu tung độ khối lượng tại mọi mặt cắt, các đoạn và hệ số.
