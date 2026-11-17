---
title: Đường đặc trưng
summary: Vẽ các đường 3D bạn tạo độ dốc theo từng đỉnh, tạo các độ lệch bậc của chúng, và dùng làm đường ngắt của mặt đất hoặc làm nền dốc trong thiết kế.
keywords: cung, đường cong, bán kính, cung 3d, đường xoắn ốc, bó vỉa, lớp phủ độ dốc, lớp phủ cao độ, mũi tên độ dốc, đường đặc trưng, độ dốc, cao độ, độ lệch bậc, độ lệch, đường ngắt, mương, gờ đất, nền dốc, giao mặt đất, san nền, đa tuyến 3d
from: d55b25fb
---

Đường đặc trưng là một đường có cao độ tại mọi đỉnh: một bó vỉa, một đường dòng chảy mương, đỉnh của gờ đất (berm), hoặc mép của nền dốc. Bạn đặt cao độ của nó bằng số hoặc theo độ dốc, sao chép nó sang bên với một bước lên hoặc xuống, và chọn bề mặt sẽ làm gì với nó.

## Vẽ một đường

1. Chọn **Bề mặt** › {{ui:Thêm}} › {{ui:Đường đặc trưng}}, hoặc nhấn {{key:L}}.
2. Nhấp các đỉnh của nó trên mặt bằng. Nhấp vào một điểm đo sẽ lấy vị trí và cao độ của điểm đó; ở bất kỳ nơi nào khác, đỉnh lấy cao độ mặt đất tự nhiên tại đó.
3. Nhấn {{key:Enter}} để kết thúc một đường hở, hoặc nhấp lại đỉnh đầu tiên để đóng nó.

Đường mới được chọn và bắt đầu như một đường ngắt của mặt đất tự nhiên, nằm trên mặt đất.

## Cung tròn

Một đoạn có thể là cung tròn trên mặt bằng mà hai đầu nằm ở các cao độ khác nhau: một góc vỉa cong, một mương cong, một đoạn dốc rẽ. Độ dốc của nó chạy đều dọc theo cung, và chiều dài được đo dọc theo đường cong.

- **Khi đang vẽ:** nhấn {{key:C}} (trên màn hình cảm ứng, {{ui:Cung}} trên thanh phía trên mặt bằng) để bật cung tròn. Sau một đỉnh, nhấp một điểm trên đường cong, rồi nhấp nơi cung kết thúc. Nhấn {{key:C}} lần nữa để trở về các đoạn thẳng. {{key:Backspace}} bỏ điểm trên đường cong trước.
- **Sau đó:** trong **Thuộc tính**, gõ bán kính và hướng rẽ vào ô **Cung** của đỉnh, ví dụ `50 L` hoặc `50 R` (trái hoặc phải khi bạn đi dọc đường), rồi nhấn {{key:Enter}}. Xóa trống ô để đoạn trở lại thẳng. Bán kính nhỏ hơn một nửa đoạn sẽ bị từ chối.

Đường được chọn hiển thị bán kính của mỗi cung cạnh độ dốc của nó. **Chiều dài** là dọc theo các cung trên mặt bằng; **Chiều dài 3D** còn tính cả phần lên và xuống. Các độ lệch bậc giữ nguyên cung: cung ở phía ngoài khúc cua sẽ dài ra, cung ở phía trong sẽ ngắn lại, và độ lệch vượt qua tâm cung sẽ bị từ chối.

Các bề mặt, khung nhìn 3D và DXF và DWG lấy mỗi cung thành các đoạn thẳng ngắn nằm trong sai số 0.01 so với đường cong. LandXML giữ chúng là cung (xem **Cung trong các tệp khác** bên dưới).

## Đặt cao độ và độ dốc

**Thuộc tính** liệt kê các đỉnh với khoảng cách dọc theo đường, **Cao độ** và **Độ dốc đến tiếp theo** (theo phần trăm). Gõ một trong hai rồi nhấn {{key:Enter}}:

- Một cao độ chỉ dời đỉnh đó.
- Một độ dốc đặt cao độ ở đầu xa của đoạn; các đỉnh sau nó giữ nguyên vị trí, nên độ dốc của đoạn kế tiếp sẽ thay đổi.

Cũng trong **Thuộc tính**:

| Thao tác | Tác dụng |
|---|---|
| **Nâng hoặc hạ tất cả đi** | Cộng chiều cao bạn gõ vào mọi đỉnh. |
| {{ui:Cao độ từ mặt đất}} | Đặt lại mọi đỉnh lên mặt đất tự nhiên (các đỉnh nằm ngoài bề mặt giữ cao độ của chúng và được liệt kê). |
| {{ui:Một độ dốc, từ đầu đến cuối}} | Giữ cao độ đầu và cuối, và đặt các đỉnh ở giữa theo một độ dốc đều. |

Đường được chọn hiển thị cao độ tại các đỉnh và độ dốc dọc theo các đoạn trên mặt bằng. Kéo một đỉnh bằng {{ui:Chọn}} để dời nó; cao độ của nó giữ nguyên.

## Độ lệch bậc

Trong **Độ lệch bậc**, gõ một **Khoảng cách** (dương sang phải theo hướng của đường, âm sang trái), rồi một chiều cao (lên hoặc xuống bao nhiêu) hoặc một độ dốc theo phần trăm, và nhấp {{ui:Tạo đường dời}}. Bản sao là một đường đặc trưng mới: ví dụ mặt sau của một bó vỉa cách 0.5 ft sang bên và cao hơn 0.5 ft, hoặc mép mương cách ra 6 ft ở độ dốc 2 %. Khoảng cách làm bản sao chồng lên chính nó tại một khúc cua gấp sẽ bị từ chối.

## Độ dốc và cao độ trên màn hình

Nhấn {{key:E}}, hoặc chọn **Độ dốc và cao độ trên đường đặc trưng** trong **Hiển thị**, để xem độ dốc của mọi đường đặc trưng dọc theo từng đoạn (kèm một mũi tên nhỏ chỉ xuống dốc) và cao độ tại các đỉnh. Chúng chỉ hiển thị trên màn hình: không có gì được thêm vào bản vẽ, và PDF, DXF và DWG giữ nguyên. Các đoạn ngắn và các đỉnh dày đặc sẽ không có nhãn cho đến khi bạn phóng to. Đường được chọn luôn hiển thị độ dốc và cao độ của chính nó.

## Trong khung nhìn trắc dọc

Đường đặc trưng cắt qua một tuyến sẽ hiển thị trong khung nhìn trắc dọc của tuyến đó, cùng tên và cao độ tại điểm cắt; các đường chạy bên cạnh cũng có thể được hiển thị. Xem [Thiết kế trắc dọc](topic:profile).

## Bề mặt làm gì với đường này

Chọn **Sử dụng**:

| Sử dụng | Điều gì xảy ra |
|---|---|
| Đường ngắt của mặt đất tự nhiên | Mặt đất tự nhiên đi qua đường tại các cao độ của nó, giống như một đường ngắt đã vẽ. |
| San vào thiết kế | Một đường **khép kín** trở thành nền dốc: bề mặt thiết kế bên trong nó được san đến mép của nó. Bật **Đường giao với mặt đất** để chạy mái đào và mái đắp (nằm ngang so với 1 đứng) từ mép của nó xuống mặt đất, như một nền làm; mỗi mái bắt đầu từ chính cao độ của mép tại đó. |
| Chỉ vẽ | Nó vẫn nằm trên mặt bằng và được xuất ra DXF, DWG và PDF (lớp C-GRAD-FEAT, đa tuyến 3D), nhưng các bề mặt bỏ qua nó. |

Khối lượng, mặt cắt và khung nhìn 3D bao gồm các đường đặc trưng được san vào thiết kế, như các nền. Mỗi thay đổi là một bước: {{key:Mod+Z}} hoàn tác nó.

## Chia sẻ đường với nhóm

Trong một bản vẽ mở từ tệp đám mây của bạn trong CadCraft Studio, với gói nhóm, phần **Thuộc tính** của dự án (khi không chọn gì) có mục **Nhóm** với {{ui:Đường của nhóm…}}: các đường mà nhóm bạn đã chia sẻ, mỗi đường kèm bản sửa đổi của nó, mà không cần chọn trước một đường đặc trưng. Chọn một đường để chia sẻ nó, đẩy một bản sửa đổi mới, kéo bản của nhóm về, hoặc ngừng chia sẻ. Ngoài cài đặt đó, mục này nói rõ những gì nó cần.

## Cung trong các tệp khác

| Tệp | Điều gì xảy ra với đường đặc trưng có cung |
|---|---|
| Tệp dự án CivilCraft | Giữ nguyên hoàn toàn. |
| LandXML | Được ghi như một đối tượng mặt bằng gồm đường và cung với cao độ của chúng, và đọc lại cùng các cung. Một đường đặc trưng từ chương trình khác được nhập vào dưới dạng **Chỉ vẽ**: chọn **Sử dụng** của nó để đưa vào bề mặt. |
| DWG và DXF | Đa tuyến 3D không thể chứa cung, nên đường được ghi thành các đoạn ngắn trong sai số 0.01 so với mỗi cung. CivilCraft cũng ghi chú trong bản vẽ những đoạn nào là cung: khi bạn mở bản vẽ dưới dạng đường nét, {{ui:Đường đặc trưng}} sẽ đưa các đường trở lại thành đường đặc trưng cùng các cung của chúng. Các chương trình khác thấy một đa tuyến 3D thông thường. |
