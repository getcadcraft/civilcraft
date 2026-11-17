---
title: San nền công trình
summary: Vẽ một nền phẳng, đặt cao độ và độ dốc đào, đắp, để CivilCraft làm nó giao với mặt đất tự nhiên và thêm vào bề mặt dự kiến.
keywords: tường chắn, các tường chắn, cạnh thẳng đứng, tường thay vì mái dốc, độ dốc theo từng cạnh, đê đắp, san nền, nền, nền công trình, đường giao với mặt đất, đường đặc trưng, nhóm san nền, mái đào, mái đắp, cao độ hoàn thiện, bề mặt dự kiến, san nền công trình
from: 482319a6
---

Nền là một khu vực phẳng ở một cao độ. Từ cạnh của nó, CivilCraft san ra ngoài theo độ dốc đào của bạn ở nơi mặt đất cao hơn nền, và độ dốc đắp ở nơi mặt đất thấp hơn, cho đến khi mái dốc gặp mặt đất tự nhiên. Đường gặp nhau đó là đường giao với mặt đất. Nền và các mái dốc của nó thay thế mặt đất tự nhiên bên trong đường giao để tạo thành bề mặt dự kiến.

## Vẽ nền

Bạn cần có bề mặt mặt đất tự nhiên trước.

1. Nhấn {{key:G}}, hoặc nhấn {{ui:Nền}} trong nhóm **Thiết kế**.
   Gợi ý ghi "Nền: nhấp các góc của nó. Enter hoặc nhấp đúp để kết thúc, Backspace bỏ góc cuối, Esc hủy."
2. Nhấp các góc của nền theo thứ tự, theo chiều nào cũng được. Một đường viền xanh đi theo con trỏ.
3. Nhấn {{key:Enter}} sau góc cuối (ít nhất ba góc).
   Nền được vẽ và chọn. Nó bắt đầu ở cao độ mặt đất tại giữa nền, làm tròn đến 0.1, với độ dốc đào 2 : 1 và độ dốc đắp 3 : 1. Thanh trạng thái hiển thị, ví dụ, "Nền 1 ở cao độ 254.3 (mặt đất tại giữa nền), đào 2:1, đắp 3:1. Thay đổi trong Thuộc tính."

:::warning
Kết thúc bằng {{key:Enter}}. Nhấp đúp cũng kết thúc, nhưng trong bản dựng này nó bỏ góc bạn vừa nhấp đúp. Nhấp góc cuối một lần, rồi nhấn {{key:Enter}}.
:::

Đường viền nền không được tự cắt ("Đường viền nền cắt chính nó.").

## Đặt cao độ và độ dốc

Khi nền được chọn, bảng bên phải hiển thị **Nền**:

1. **Tên**.
2. **Cao độ**: cao độ phẳng của nền.
3. **Độ dốc đào** và **Độ dốc đắp**, dạng H:V (2 nghĩa là 2 : 1). Cả hai phải lớn hơn 0.
4. **Diện tích nền** và **Số góc** được hiển thị để tham khảo.

Nhấn {{key:Enter}} sau mỗi giá trị. Đường giao với mặt đất, bề mặt dự kiến và khối lượng cập nhật ngay.

Dưới các trường, một dòng hiển thị, ví dụ, "Đường giao với mặt đất: 48 đường dốc (20 phần đào, 28 phần đắp), xa nhất 31.20 ft." Mặt bằng hiển thị đường giao với mặt đất và các đường dốc bằng màu đỏ tươi (magenta).

## Cách tìm đường giao

- Các đường dốc xuất phát từ mỗi cạnh vuông góc với nó, khoảng mỗi hai mươi phần kích thước của nền.
- Ở góc ngoài, chúng xòe ra mỗi 10°, để mái dốc uốn quanh góc.
- Ở góc trong, một đường chạy theo đường phân giác, nơi các mái dốc từ hai cạnh gặp nhau.
- Mỗi đường đi lên theo độ dốc đào hoặc đi xuống theo độ dốc đắp cho đến khi chạm mặt đất.

## Độ dốc theo cạnh và tường chắn

Dưới **Các cạnh và tường chắn** trong Thuộc tính của một nền, sân nền hoặc gờ đất, mỗi cạnh có thể được san theo cách riêng. Cạnh 1 chạy từ góc đầu tiên bạn nhấp đến góc thứ hai, cạnh 2 từ góc thứ hai đến góc thứ ba, và cứ thế.

- **Tất cả các cạnh**: **Có dốc** dùng độ dốc đào và đắp ở trên cho mọi cạnh; **Thẳng đứng: tường chắn** đặt một tường trên mọi cạnh.
- Theo từng cạnh: **Theo độ dốc chung**, **Độ dốc riêng** (gõ một độ dốc đào và đắp cho cạnh đó) hoặc **Thẳng đứng (tường chắn)**.
- Gõ độ dốc dạng `3` hoặc `3:1` (ngang trên 1 đứng), `33%` hoặc `18.4°`; nó được hiển thị dạng H:1. **Độ dốc đào** và **Độ dốc đắp** của nền nhận cùng định dạng.
- Cạnh thẳng đứng không có phần đắp: một tường chắn chạy dọc theo cạnh, từ nền xuống mặt đất tự nhiên (khi đắp) hoặc từ mặt đất xuống nền (khi đào). **Bề dày tường** (ban đầu 0.3 m hoặc 1 ft) là khoảng mặt đất bậc ra từ cạnh nền đến mặt đất tự nhiên. Khối lượng đào và đắp bỏ qua phần đắp mà cạnh đó không còn.
- Chỗ tường gặp một cạnh có mái dốc, mái uốn quanh đầu tường; hai tường gặp nhau theo một góc vát.
- Dưới các trường: chiều dài tường, mặt lộ (cao × dài), chiều cao lớn nhất và trung bình.

Mặt bằng vẽ mặt ngoài của mỗi tường bằng các vạch ngắn, cùng chiều cao của nó ở hai đầu và ở chỗ cao nhất (trên lớp tường chắn, lớp này cũng đi vào DXF và DWG). Chế độ xem 3D hiển thị tường như khối đặc (**Hiển thị** › Tường chắn), và các tệp xuất GLB, OBJ và USD có chứa chúng. Mặt cắt qua cạnh cho thấy bậc.

**Cảnh báo** (trong Thuộc tính và trong bảng Vấn đề): một tường cao hơn **Cảnh báo khi chiều cao tường vượt** (ban đầu 1.0 m hoặc 3.3 ft) "có thể cần tường có thiết kế kỹ thuật hoặc giấy phép; kiểm tra quy định địa phương", và khi bạn gõ **Độ dốc lớn nhất đất chịu được**, bất kỳ cạnh nào có độ dốc đào hoặc đắp dốc hơn mức đó. Đây chỉ là cảnh báo: việc san vẫn được thực hiện. Mỗi thay đổi là một bước cho {{key:Mod+Z}}.

## Di chuyển góc

Chọn nền, rồi kéo một nút grip hình vuông tại góc. Mỗi lần kéo là một bước hoàn tác. Thêm hoặc bỏ một góc chưa có sẵn: hãy xóa nền và vẽ lại.

## Khi không san được

Một khung đỏ dưới **Khối lượng đào đắp** nêu tên nền và vấn đề:

| Thông báo | Cần làm gì |
|---|---|
| "3 đường dốc chạy ra khỏi bề mặt trước khi gặp nó: nền quá gần mép bề mặt hoặc quá cao/thấp." | Dời nền vào trong khỏi mép bề mặt, hoặc đưa cao độ của nó gần mặt đất hơn. |
| "Đường giao với mặt đất cắt chính nó (các mái dốc từ các cạnh khác nhau của nền đâm vào nhau). Định hình lại nền hoặc đổi độ dốc." | Thường gặp với nền hẹp hoặc hình chữ L khi đào sâu hoặc đắp cao. Mở rộng nền, giảm chênh lệch, hoặc làm dốc hơn các mái. |
| "Đường viền nền cắt chính nó." | Vẽ lại các góc theo thứ tự quanh nền. |

Nền có vấn đề bị loại khỏi bề mặt dự kiến và khối lượng cho đến khi được sửa.

## Xem kết quả

1. Dưới **Hiển thị**, đặt **Bề mặt** thành {{ui:Dự kiến (đã san)}}.
   Các đường đồng mức giờ chạy phẳng qua nền và theo các mái dốc ra đến đường giao với mặt đất.
2. Di chuyển con trỏ qua nền: thanh trạng thái hiển thị cao độ **Mặt đất** và **Đã san**.
3. Đọc khối lượng đào và đắp dưới **Khối lượng đào đắp**; xem [Khối lượng đất đào đắp](topic:volumes).

Nền được san sau các hành lang, theo thứ tự chúng được vẽ. Nền vẽ sau sẽ thay thế mọi thứ trước đó bên trong đường giao của chính nó.

## Xóa nền

Chọn nó rồi nhấn {{key:Delete}} (trên Mac, Fn và Delete), hoặc nhấn {{ui:Xóa}}.

## Chưa xây dựng

Nền hiện là phẳng: nền dốc, đường đặc trưng có độ dốc thay đổi, bậc thang, và san đến một khoảng cách hoặc cao độ mục tiêu chưa có sẵn. Xem [Chưa xây dựng](topic:not-built-yet).
