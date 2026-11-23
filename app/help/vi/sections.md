---
title: Đường lấy mẫu và mặt cắt ngang
summary: Cắt mặt cắt vuông góc với tuyến, xem mặt đất, thiết kế và đào đắp tại mỗi cọc, rồi lấy khối lượng theo phương pháp diện tích đầu trung bình.
keywords: vận chuyển khối lượng, biểu đồ khối lượng, điểm cân bằng, co ngót, trương nở, cự ly vận chuyển, đất mượn, đất thải, tờ mặt cắt, tờ mặt cắt ngang, pdf mặt cắt, mặt cắt, mặt cắt ngang, đường lấy mẫu, khung mặt cắt, đào, đắp, diện tích, diện tích đầu trung bình, khối lượng theo diện tích đầu, khối lượng đất, cọc, độ lệch, csv
from: 09639ce2
---

Một mặt cắt ngang thể hiện con đường theo cách nó sẽ được xây: ngang qua tuyến tại một cọc, mặt đất hiện có, thiết kế (hành lang hoặc nền được san vào) và đào, đắp giữa chúng.

## Thêm đường lấy mẫu

1. Chọn một tuyến. Trong **Thuộc tính**, dưới **Đường lấy mẫu**, nhấp {{ui:Thêm đường lấy mẫu}}.
2. Đặt **Mỗi** (khoảng cách: 50 ft hoặc 20 m để bắt đầu), **Chiều rộng trái** và **Chiều rộng phải** (mỗi mặt cắt vươn xa bao nhiêu tính từ tim tuyến).
3. Để cắt một mặt cắt tại một cọc cụ thể, nhập cọc đó vào **Thêm cọc** (ví dụ `2+35`) và nhấn {{key:Enter}}.

Các mặt cắt được cắt tại mọi bội nguyên của khoảng cách, tại hai đầu tuyến, tại điểm đầu và điểm cuối của mỗi đường cong (PC và PT), và tại các cọc bạn thêm. Các đường lấy mẫu hiện trên mặt bằng như các đường xám ngang tuyến; chúng cũng được xuất sang DXF, DWG và PDF trên lớp C-ROAD-SCTN. Mỗi thay đổi là một bước: {{key:Mod+Z}} hoàn tác.

## Khung mặt cắt

Mở nó bằng {{ui:Khung mặt cắt}} trong **Thuộc tính** của tuyến, {{ui:Mặt cắt}} dưới **Bề mặt** › {{ui:Thêm}}, hoặc {{key:X}}. Nó thay thế khung trắc dọc dưới mặt bằng.

- Duyệt qua các mặt cắt bằng các mũi tên trên thanh của nó, danh sách cọc, hoặc {{key:Left}} và {{key:Right}} khi khung mặt cắt có tiêu điểm ({{key:Home}} và {{key:End}} cho mặt cắt đầu và cuối).
- Đường xám là mặt đất hiện có, đường đỏ là thiết kế. Phần đào tô màu cam, phần đắp màu xanh lá. Các điểm hành lang được đánh dấu: CL (tim tuyến), EOP (mép mặt đường), SH (lề đường) và DL (đường giao với mặt đất).
- Tiêu đề cho biết cọc, diện tích đào và đắp của mặt cắt này và hệ số phóng đại đứng. **Vừa khung** lấp đầy bảng; chọn 1× để xem mặt cắt đúng tỷ lệ.
- Đường đậm trên mặt bằng cho biết mặt cắt nào đang hiện trên màn hình.
- **Thu phóng và di chuyển:** con lăn thu phóng quanh con trỏ, và kéo sẽ di chuyển khung nhìn. {{ui:Vừa}} (hoặc {{key:F}}, hoặc nhấp đúp) đưa toàn bộ mặt cắt vừa khung lại.

## Đo trong mặt cắt

1. Nhấp {{ui:Đo}} trên thanh mặt cắt, hoặc nhấn {{key:M}}. Gợi ý ghi "Nhấp điểm thứ nhất, rồi điểm thứ hai."
2. Nhấp hai điểm. Mỗi điểm bắt vào cuối một đường hoặc một điểm hành lang (CL, EOP, SH, DL); giữ {{key:Alt}} để có điểm tự do.
3. Phần đọc cho biết khoảng cách ngang (ΔH), khoảng cách đứng (ΔV), độ dốc theo phần trăm cùng tỷ số của nó, và chiều dài thẳng, theo đơn vị của dự án.

Nhấp lại để bắt đầu một phép đo mới. {{key:Esc}} xóa nó, và {{key:M}} tắt Đo.

## Tờ mặt cắt

{{ui:Tờ mặt cắt (PDF)}} dưới **Đường lấy mẫu** đặt mọi mặt cắt lên các trang PDF, theo hàng từ trái sang phải và từ trên xuống dưới theo thứ tự cọc. Chọn **Giấy**, **Tỷ lệ mặt bằng** (tỷ lệ ngang của các mặt cắt) và **Phóng đại trắc dọc** (1×, 2×, 5× hoặc 10×); hộp thoại cho biết có bao nhiêu mặt cắt vừa trên một trang và tạo ra bao nhiêu trang.

Mỗi mặt cắt hiện một lưới với độ lệch và cao độ, mặt đất (nét đứt), thiết kế, phần đào và đắp được tô bóng (cam và xanh lá), các điểm hành lang, và bên dưới là cọc cùng diện tích đào và đắp của nó. Mọi mặt cắt trên các tờ được vẽ cùng kích thước, đủ cao cho mặt cắt lớn nhất; khi điều đó không vừa trang với hệ số phóng đại của bạn, CivilCraft dùng mặt cắt lớn nhất vừa được và thông báo điều đó. Dải tiêu đề ghi tên tuyến, các cọc trên trang đó, các tỷ lệ và "Tờ 1 trên 3".

## Đào và đắp được đo đến đâu

Một hành lang có thể có các lớp dưới mặt đường: các lớp kết cấu mặt đường, các thành phần của mẫu, đường ray. Chọn **Khối lượng đo đến** trong thanh mặt cắt để quyết định phần đào và đắp chạy đến đâu:

- **Bề mặt đáy** (mặc định): đến đáy của các thành phần đó, nên phần đào bao gồm độ sâu của lớp cấu tạo mặt đường.
- **Bề mặt đỉnh**: chỉ đến đỉnh của thiết kế, như trước khi các thành phần được tính.

Các diện tích trong tiêu đề, các khối lượng bên dưới, CSV và vận chuyển khối lượng đều theo lựa chọn này, và nó được lưu cùng dự án.

## Khối lượng theo diện tích đầu trung bình

Giữa hai mặt cắt liền kề, khối lượng bằng trung bình của hai diện tích nhân với khoảng cách giữa các cọc của chúng. Thanh hiện tổng cho tuyến, và {{ui:CSV}} tải về diện tích và khối lượng của mọi mặt cắt kèm tổng cộng dồn (cubic yard cho dự án theo ft, mét khối cho dự án hệ mét).

**Thuộc tính** hiện các tổng tương tự bên cạnh các khối lượng theo phương pháp lưới từ [Khối lượng đất](topic:volumes). Hai cách là các phép xấp xỉ khác nhau: mặt cắt gần nhau làm chúng gần nhau hơn, và trên đường thẳng trên nền bằng phẳng thì chúng giống nhau.

:::note
Đào và đắp chỉ được tính bên trong các vùng đã san (các đường giao với mặt đất của một hành lang hoặc một nền), như phương pháp lưới. Không có hành lang hoặc nền thì thiết kế chính là mặt đất, nên mặt cắt không hiện đào hay đắp.
:::

## Vận chuyển khối lượng

**Vận chuyển khối lượng** dưới **Đường lấy mẫu** vẽ biểu đồ vận chuyển khối lượng từ cùng các khối lượng diện tích đầu: dọc theo các cọc, tổng cộng dồn của đào trừ đắp.

- **Co ngót (−) hoặc trương nở (+) của phần đào** cho biết một cubic yard đào tạo ra bao nhiêu khi đã đặt làm đắp: −10 % (giá trị ban đầu, chỉ là giá trị tạm) nghĩa là nó co còn 0.9; đá trương nở có thể là +5 %. Dùng số liệu trong báo cáo địa kỹ thuật của bạn.
- Nơi đường đi lên, con đường nằm trong phần đào; nơi nó đi xuống, nằm trong phần đắp. Phía trên không (tô cam) đất di chuyển lên cọc; phía dưới không (xanh lá), xuống cọc.
- **Điểm cân bằng** là nơi đường cắt mức không: giữa hai điểm như vậy, đào và đắp cân bằng. Bảng liệt kê mỗi đoạn cân bằng, khối lượng được vận chuyển (điểm cao nhất hoặc thấp nhất của nó) và cự ly vận chuyển trung bình (diện tích được tô chia cho khối lượng đó).
- Nơi đường kết thúc khác không, phần còn lại là **đất thải** (phía trên) hoặc **đất mượn** (phía dưới). Trong đoạn cuối đó, chỉ phần đất vượt quá mức nó kết thúc mới được tính là được vận chuyển.

**CSV** lưu tung độ khối lượng tại mọi mặt cắt, các đoạn và hệ số.
