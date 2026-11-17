---
title: Bố trí tuyến nằm ngang
summary: Vẽ tuyến theo các giao điểm PI, đặt bán kính đường cong và cọc đầu, di chuyển PI, rồi đọc số liệu đường cong, cọc và độ lệch.
keywords: tuyến, không có lời giải, đường cong không vừa, bán kính lớn nhất, bán kính nhỏ nhất, bán kính tối thiểu, tốc độ thiết kế, chồng lấn, tim tuyến, pi, đường cong nằm ngang, bán kính, đánh cọc, tiếp tuyến, tạo tuyến, bố cục tuyến, pc, pt, cọc độ lệch
from: 8c5df4aa
---

Tuyến trong CivilCraft là một chuỗi tiếp tuyến đi qua các giao điểm (PI), với một đường cong tròn tại mọi PI bên trong có bán kính. Tuyến được đánh cọc từ cọc đầu bạn chọn. Một dự án có thể chứa nhiều tuyến.

## Vẽ tuyến

1. Nhấn {{key:A}}, hoặc nhấp {{ui:Alignment}} trong nhóm **Thiết kế**.
   Gợi ý ghi "Tuyến: nhấp các PI theo thứ tự. Enter hoặc nhấp đúp để kết thúc, Backspace bỏ PI cuối, Esc hủy."
2. Nhấp PI đầu tiên (điểm đầu của tuyến).
3. Nhấp từng PI tiếp theo theo thứ tự. Một đường đỏ bám theo con trỏ và hiển thị chiều dài cùng phương vị của tiếp tuyến bạn đang vẽ, ví dụ "212.40 ft  N 63°12'05" E".
4. Nhấp PI cuối cùng (điểm cuối của tuyến).
5. Nhấn {{key:Enter}}.
   Tuyến được vẽ kèm cọc và được chọn. Thanh trạng thái ghi, ví dụ, "Tuyến 1: 386.36 ft, đường cong bán kính 100 ft ở nơi vừa. Sửa bán kính trong Thuộc tính; Trắc dọc (R) để thiết kế độ dốc của tuyến."

Khi đang vẽ: {{key:Backspace}} xóa PI cuối, {{key:Esc}} hủy, và kéo trên khoảng trống sẽ di chuyển khung nhìn mà không thêm PI.

:::warning
Kết thúc bằng {{key:Enter}}. Nhấp đúp cũng kết thúc, nhưng trong bản dựng này nó bỏ PI bạn vừa nhấp đúp. Nhấp PI cuối một lần, rồi nhấn {{key:Enter}}.
:::

Mỗi PI bên trong được gắn đường cong 100 ft (30 m trong dự án đơn vị mét), hoặc bán kính nguyên lớn nhất vừa với nửa mỗi tiếp tuyến nếu 100 ft không vừa. PI quá gấp hoặc thẳng xuyên qua sẽ không có đường cong.

## Đặt bán kính và tọa độ

Khi tuyến được chọn, bảng bên phải hiển thị **Tuyến**:

1. **Tên** và **Cọc đầu**. Nhập cọc dạng `10+00` (feet) hoặc `0+500` (mét), hoặc một số thường. Xem [Đơn vị, cọc và định dạng số](topic:units-and-stations).
2. **Chiều dài** và **Cọc cuối** được tự động tính cho bạn.
3. Bảng **PI** liệt kê **Đông** và **Bắc** của mỗi PI, cùng **Bán kính** cho mỗi PI bên trong. Nhập giá trị mới rồi nhấn {{key:Enter}}.
   - Bán kính 0 tạo điểm góc không có đường cong.
   - PI đầu và PI cuối không bao giờ có bán kính.
   - Dấu x nhỏ ở cuối hàng sẽ xóa PI đó (một tuyến luôn giữ ít nhất hai PI).
4. Đọc danh sách **Đường cong**: với mỗi đường cong, cọc PC và PT, bán kính R, góc lệch Δ và hướng (trái hoặc phải), chiều dài L, tiếp tuyến T, khoảng cách ngoài E và dây cung.
5. Dòng dưới các đường cong cho phương vị của tiếp tuyến đầu tiên.

## Khi đường cong không vừa

Nếu các đường cong cần nhiều tiếp tuyến hơn khoảng cách giữa các PI, tuyến không có lời giải: nó không được vẽ đúng cho đến khi bạn sửa, và bị loại khỏi tệp xuất LandXML. Một hộp đỏ nêu lý do bằng số và đưa ra những gì sẽ vừa:

- "Các đường cong tại PI 2 và PI 3 cần 240.00 ft tiếp tuyến giữa chúng (130.00 + 110.00), nhưng các PI cách nhau 180.00 ft." — hoặc, khi chỉ một trong hai có đường cong, "Đường cong tại PI 2 cần 240.00 ft tiếp tuyến về phía PI 1 …".
- Mỗi PI có một nút đặt **bán kính lớn nhất vừa** tại đó, giữ nguyên đường cong kia (bán kính cũng phải vừa với tiếp tuyến còn lại của PI). Khi cả hai PI đều có đường cong, **Cả hai** thu nhỏ hai bán kính theo tỷ lệ để chúng vừa chạm nhau.
- Khi chỉ một đường cong đã dài hơn tiếp tuyến, hộp cho biết không đường cong nào tại PI kia có thể vừa khi nó lớn như vậy.
- Một PI quay ngược lại hoàn toàn không thể có đường cong; hộp đưa ra **Không có đường cong tại PI n**.

Mỗi nút là một bước: {{key:Mod+Z}} khôi phục các bán kính. Bán kính được đề xuất được làm tròn xuống 0.01 để luôn vừa.

### Bán kính thiết kế tối thiểu

Nhập **Bán kính thiết kế tối thiểu** (ví dụ theo tốc độ thiết kế) để mọi đường cong được kiểm tra theo nó; để trống nếu không cần. Đường cong nhỏ hơn mức này được liệt kê kèm nút **bán kính nhỏ nhất đáp ứng mức tối thiểu**, khi bán kính đó vừa. Khi không vừa, hộp nói rõ và đưa ra bán kính lớn nhất mà các tiếp tuyến cho phép, để bạn biết cần di chuyển PI hoặc giảm mức tối thiểu.

## Di chuyển PI trên mặt bằng

1. Khi {{ui:Select}} đang bật, nhấp tuyến để chọn. Các điểm nắm vuông hiện tại các PI của nó.
2. Kéo một điểm nắm. Tuyến, cọc, trắc dọc và hành lang theo sau.
3. Thả chuột. Việc di chuyển là một bước hoàn tác.

Hiện chưa thể thêm PI giữa hai PI có sẵn: xóa tuyến và vẽ lại, hoặc nhập tọa độ mới cho các PI bạn có.

## Đọc cọc và độ lệch

Di con trỏ qua mặt bằng. Thanh trạng thái hiển thị tuyến gần nhất (hoặc tuyến đang chọn) cùng cọc và độ lệch, với **L** hoặc **R** khi nhìn theo chiều tăng cọc, ví dụ "Tuyến 1: Cọc 2+15.30, lệch 18.42 R". Khi vượt ra ngoài một đầu, thêm "(vượt quá đầu)".

## Những gì được vẽ

Trên mặt bằng, trong DXF và PDF: tim tuyến (tiếp tuyến là đường thẳng, đường cong là cung tròn thật), một vạch mỗi 50 ft (20 m) với vạch dài hơn và nhãn cọc mỗi 100 đơn vị, và các vạch PC và PT được ghi nhãn bằng cọc của chúng.

## Xóa tuyến

Chọn tuyến rồi nhấn {{key:Delete}}, hoặc nhấp {{ui:Delete}} trên thanh công cụ hoặc ở cuối bảng bên phải. Trắc dọc và hành lang của nó cũng bị xóa theo. {{key:Mod+Z}} sẽ khôi phục lại.

:::mac
Trên bàn phím Mac, phím có nhãn **delete** là {{key:Backspace}} đối với trình duyệt và không xóa vùng chọn. Nhấn {{key:Delete}} (Fn và delete), hoặc dùng nút {{ui:Delete}}.
:::

## Tiếp theo

- [Thiết kế trắc dọc](topic:profile).
## Tốc độ thiết kế và cấp

Trong Thuộc tính của tuyến, **Tốc độ thiết kế** (km/h hoặc mph) và **Cấp thiết kế** được giữ cùng tuyến, được lưu trong dự án và ghi vào IFC (Pset_RoadDesignCriteriaCommon). CivilCraft không có bảng nào liên kết tốc độ với bán kính tối thiểu, nên không có gì được kiểm tra từ chúng: hãy đặt **Bán kính tối thiểu** theo tiêu chuẩn thiết kế của riêng bạn.

## Đường xoắn (spiral)

Một đường cong có thể có đường xoắn clothoid ở một trong hai đầu: tiếp tuyến, đường xoắn, đường cong, đường xoắn, tiếp tuyến. Trong bảng PI, nhập chiều dài tại **Đường xoắn vào** và **Đường xoắn ra** cho một PI có bán kính. PI vẫn ở nguyên vị trí; đường cong dịch vào để nhường chỗ, nên khoảng cách tiếp tuyến tăng thêm độ lệch của đường xoắn. Hai chiều dài có thể khác nhau, và một PI chỉ có một chiều dài sẽ chỉ có đường xoắn ở đầu đó.

Danh sách đường cong khi đó hiển thị TS, SC, CS và ST (tiếp tuyến sang đường xoắn, đường xoắn sang đường cong, đường cong sang đường xoắn, đường xoắn sang tiếp tuyến) cùng góc đường xoắn θs, các khoảng cách tiếp tuyến và khoảng cách ngoài. Cọc chạy dọc theo đường xoắn như ở mọi nơi khác. Các đường xoắn cùng nhau quay nhiều hơn đường cong sẽ bị từ chối và nêu tên PI; đường xoắn dài hơn mức tiếp tuyến cho phép là chồng lấn, như với mọi đường cong. Siêu cao dùng đường xoắn làm đoạn chuyển (xem [Hành lang](topic:corridor)).
