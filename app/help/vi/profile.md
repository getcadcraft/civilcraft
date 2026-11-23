---
title: Thiết kế trắc dọc
summary: Mở khung trắc dọc, bắt đầu một trắc dọc thiết kế từ mặt đất, thêm và kéo các PVI, đặt chiều dài đường cong đứng, và đọc độ dốc, giá trị K cùng điểm cao và điểm thấp.
keywords: trắc dọc, tuyến đứng, pvi, đường cong đứng, độ dốc, giá trị k, đỉnh lồi, đáy lõm, bvc, evc, khung trắc dọc, cao độ hoàn thiện, fg, trắc dọc mặt đất hiện có, đường đặc trưng trong trắc dọc, giao cắt, chiếu, bó vỉa, rãnh, nhãn
from: dbb1f32d
---

Mỗi tuyến có một trắc dọc thiết kế: một danh sách các PVI (cọc và cao độ) nối bằng các đoạn dốc thẳng, với một đường cong đứng parabol đối xứng tại mỗi PVI trung gian có chiều dài. Trắc dọc mặt đất hiện có được lấy mẫu từ bề mặt cho bạn.

## Mở khung trắc dọc

1. Chọn tuyến (nhấp vào nó bằng {{ui:Chọn}}).
2. Nhấn {{key:R}}, hoặc nhấp {{ui:Trắc dọc}} trên thanh công cụ, hoặc {{ui:Khung trắc dọc}} ở cuối bảng bên phải.
   Khung trắc dọc mở dưới mặt bằng với mặt đất hiện có dọc theo tuyến. Khi có hai tuyến trở lên, chọn một tuyến trong danh sách bên trái thanh trắc dọc.

Khung bắt đầu bằng cách hiện toàn bộ tuyến và kéo giãn các cao độ để lấp đầy bảng; hệ số phóng đại được ghi ở góc dưới bên trái, ví dụ "Phóng đại đứng 10×".

## Thu phóng và di chuyển trắc dọc

- **Thu phóng:** lăn con lăn chuột (hoặc chụm trên bàn di chuột) và khung thu phóng quanh con trỏ. Giữ {{key:Shift}} để chỉ thu phóng các cọc, hoặc {{key:Alt}} để chỉ thu phóng các cao độ (việc này làm thay đổi hệ số phóng đại). Khi khung trắc dọc đang có tiêu điểm, các phím cộng và trừ thu phóng quanh giữa khung.
- **Di chuyển:** kéo bằng nút chuột phải hoặc giữa, hoặc vuốt bằng hai ngón trên bàn di chuột.
- **Vừa khung:** nhấp đúp vào trắc dọc hoặc nhấn {{key:F}} để hiện lại toàn bộ tuyến.

Sửa một PVI giữ nguyên mức thu phóng bạn đã chọn; nó không nhảy về vừa khung.

Di con trỏ dọc theo trắc dọc: thanh hiện cọc, cao độ mặt đất và thiết kế, độ dốc và đào hay đắp tại đó, và một chấm đi theo trên tuyến trong mặt bằng.

## Bắt đầu trắc dọc thiết kế

1. Trong bảng bên phải dưới **Trắc dọc thiết kế**, nhấp {{ui:Bắt đầu từ mặt đất}}.
   Hai PVI được đặt trên mặt đất tại hai đầu tuyến, nối bằng một đoạn dốc thẳng. Thanh trạng thái ghi "Trắc dọc thiết kế đã bắt đầu tại mặt đất ở cả hai đầu. Bật Thêm PVI và nhấp để thêm các điểm đổi dốc; đặt chiều dài đường cong cho chúng trong bảng."

Nếu tuyến không cắt bề mặt, bạn sẽ thấy "Tuyến này không có mặt đất bên dưới để bắt đầu." Khi đó thêm PVI bằng cách nhấp thay thế (mục tiếp theo).

## Thêm PVI

1. Nhấn {{key:I}}, hoặc nhấp {{ui:Thêm PVI}} trong thanh trắc dọc. Nút giữ trạng thái đã nhấn.
2. Nhấp trong trắc dọc tại nơi bạn muốn một điểm đổi dốc. Một PVI được thêm tại cọc và cao độ đó, làm tròn đến 0.01, và được chọn.
3. Thêm bao nhiêu tùy ý, rồi nhấn {{key:I}} lần nữa để dừng thêm.

Một lần nhấp tại nơi đã có PVI sẽ bị từ chối ("Đã có PVI tại …"). Các PVI luôn theo thứ tự cọc.

## Bắt điểm khi thêm hoặc kéo

Nút **Bắt điểm** trên thanh trắc dọc được bật ngay từ đầu. Khi nó bật, một PVI bạn thêm hoặc kéo sẽ nằm vào PVI gần nhất, điểm mặt đất, cọc PVI hoặc đường mặt đất, và một nhãn bên cạnh dấu cho biết là điểm nào. Giữ {{key:Alt}} để đặt một điểm tự do, ở bất kỳ đâu.

## Điều chỉnh PVI

- **Kéo** một PVI trong trắc dọc để di chuyển nó. Nó không thể vượt qua các PVI láng giềng. Mỗi lần di chuyển là một bước hoàn tác.
- **Nhập** giá trị chính xác trong bảng PVI ở bảng bên phải: **Cọc**, **Cao độ**, **Độ dốc %** và **Đường cong L** (chiều dài đường cong đứng). Nhấn {{key:Enter}} sau mỗi giá trị.
- **Chọn** một giá trị từ trắc dọc: nút nhỏ cạnh cọc hoặc cao độ của PVI chờ một lần nhấp trong khung trắc dọc và điền giá trị đó vào. Lần nhấp bắt điểm như Thêm PVI; giữ {{key:Alt}} để có điểm tự do; {{key:Esc}} hủy.
- **Độ dốc %** là độ dốc của tiếp tuyến bắt đầu tại PVI đó và chạy đến PVI kế tiếp. Nhập giá trị này sẽ làm dịch cao độ của PVI **kế tiếp** (cọc của nó không bao giờ dịch). Nếu PVI kế tiếp bị khóa, thay vào đó cao độ của PVI trước sẽ dịch.
- **Khóa** một PVI bằng ổ khóa ở cuối hàng của nó. PVI bị khóa không bị kéo, và việc sửa độ dốc không làm nó dịch. Nếu cả hai đầu của một tiếp tuyến bị khóa, độ dốc của nó không thể đổi: thanh trạng thái cho biết điều đó, và bạn phải mở khóa một đầu trước. Khóa được lưu trong tệp.
- **Xóa** một PVI bằng nút x ở cuối hàng của nó, hoặc chọn nó (nhấp vào) và nhấn {{key:Delete}}. Khi khung trắc dọc đang có tiêu điểm, {{key:Backspace}} cũng xóa nó.

PVI đầu tiên và cuối cùng không bao giờ có đường cong.

## Đường cong đứng

1. Nhập một chiều dài trong **Đường cong L** cho một PVI bên trong, ví dụ 200.
2. Đường cong được vẽ căn giữa tại PVI. Trắc dọc và bảng bên phải hiện loại của nó (đỉnh lồi hoặc đáy lõm), L và K, cọc và cao độ BVC và EVC, và điểm cao hay thấp của nó khi có điểm như vậy nằm trong đường cong.

K được tính từ L (K = L chia cho hiệu đại số của các độ dốc, tính bằng phần trăm). Bạn nhập L; nhập trực tiếp K hiện chưa có.

Nếu một đường cong đứng không vừa, một hộp đỏ cho biết lý do: nó chạy lùi vào PVI hoặc đường cong trước đó, hoặc vượt qua PVI kế tiếp, và còn bao nhiêu chỗ ở phía đó (một đường cong cần một nửa chiều dài ở mỗi bên PVI của nó). Nút của nó đặt **đường cong dài nhất vừa khít**, cùng K của nó, thành một bước ({{key:Mod+Z}} hoàn tác). Hoặc dời các PVI ra xa nhau.

## Đọc các thông tin

Dưới bảng PVI, một danh sách cho biết mỗi độ dốc theo phần trăm ("Độ dốc 1: +1.25%") và mỗi đường cong, ví dụ "Đỉnh lồi tại 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", rồi "Điểm cao 1+62.40, 254.12".

Nếu các PVI không chạm tới cả hai đầu tuyến, một ghi chú sẽ nói điều đó. Hành lang chỉ được dựng ở nơi trắc dọc và tuyến trùng nhau.

## Đường đặc trưng trong trắc dọc

Các đường đặc trưng cũng hiện trong khung trắc dọc, nhờ đó bạn thấy được bó vỉa, rãnh hay đỉnh tường so với trắc dọc đường.

- Nơi một đường đặc trưng **cắt** tuyến, trắc dọc hiện một hình thoi nhỏ tại cọc và cao độ đó, được ghi nhãn bằng tên đường và cao độ của nó tại đó (cao độ riêng của đường, tính dọc theo đoạn cắt).
- Nhập một khoảng cách trong {{ui:Song song trong phạm vi}} để vẽ thêm các đường đặc trưng **chạy bên cạnh** tuyến trong khoảng cách đó, như các nét đứt tại cao độ riêng của chúng. Để trống hoặc 0 chỉ hiện các điểm cắt.
- Các dấu và nhãn theo mọi thay đổi: dời một đỉnh, nhập một độ dốc hoặc nâng đường, và trắc dọc hiện ngay các cao độ mới.
- Nhấp vào hình thoi của điểm cắt để chọn đường đặc trưng đó; đường được chọn được vẽ bằng màu nổi bật.
- {{ui:Đường đặc trưng}} trong thanh trắc dọc ẩn hoặc hiện tất cả. Cả hai cài đặt được lưu cùng dự án.

Xem [Đường đặc trưng](topic:feature-lines).

## Tiếp theo

- [Quét hành lang đường bộ](topic:corridor) dọc theo tuyến và trắc dọc này.
- Trắc dọc được ghi vào LandXML cùng với tuyến; xem [Trao đổi LandXML](topic:landxml).
