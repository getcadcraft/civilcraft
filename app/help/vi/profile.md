---
title: Thiết kế trắc dọc
summary: Mở khung trắc dọc, bắt đầu trắc dọc thiết kế từ mặt đất, thêm và kéo PVI, đặt chiều dài đường cong đứng, và đọc độ dốc, giá trị K cùng điểm cao và điểm thấp.
keywords: trắc dọc, tuyến đứng, pvi, đường cong đứng, độ dốc, giá trị k, đỉnh, lõm, bvc, evc, khung trắc dọc, cốt hoàn thiện, fg, trắc dọc mặt đất hiện trạng, đường đặc trưng trong trắc dọc, giao cắt, chiếu, bó vỉa, rãnh, nhãn
from: e9182bfa
---

Mỗi tuyến có một trắc dọc thiết kế: một danh sách các PVI (cọc và cao độ) được nối bằng các đoạn dốc thẳng, với một đường cong đứng parabol đối xứng tại mỗi PVI bên trong có chiều dài. Trắc dọc mặt đất hiện trạng được lấy mẫu từ bề mặt cho bạn.

## Mở khung trắc dọc

1. Chọn tuyến (nhấn vào nó bằng {{ui:Chọn}}).
2. Nhấn {{key:R}}, hoặc nhấn {{ui:Trắc dọc}} trên thanh công cụ, hoặc {{ui:Khung trắc dọc}} ở cuối bảng bên phải.
   Khung trắc dọc mở bên dưới mặt bằng, với mặt đất hiện trạng dọc theo tuyến. Khi có hai tuyến trở lên, chọn một tuyến trong danh sách ở bên trái thanh trắc dọc.

Khung luôn hiển thị toàn bộ tuyến và kéo giãn cao độ để lấp đầy bảng; hệ số phóng đại được in ở góc dưới bên trái, ví dụ "Phóng đại theo chiều đứng 10×". Khung không thu phóng hay di chuyển.

Di chuyển con trỏ dọc theo trắc dọc: thanh hiển thị cọc, cao độ mặt đất và cao độ thiết kế, độ dốc và phần đào hoặc đắp tại đó, và một chấm bám theo tuyến trên mặt bằng.

## Bắt đầu trắc dọc thiết kế

1. Trong bảng bên phải, dưới **Trắc dọc thiết kế**, nhấn {{ui:Bắt đầu từ mặt đất}}.
   Hai PVI được đặt trên mặt đất ở hai đầu tuyến, nối với nhau bằng một đoạn dốc thẳng. Thanh trạng thái ghi "Đã bắt đầu trắc dọc thiết kế tại mặt đất ở cả hai đầu. Bật Thêm PVI và nhấn để thêm điểm đổi dốc; đặt chiều dài đường cong trong bảng."

Nếu tuyến không cắt mặt đất, bạn sẽ thấy "Tuyến này không có mặt đất bên dưới để bắt đầu." Khi đó, hãy thêm PVI bằng cách nhấn (mục tiếp theo).

## Thêm PVI

1. Nhấn {{key:I}}, hoặc nhấn {{ui:Thêm PVI}} trên thanh trắc dọc. Nút sẽ giữ trạng thái đã nhấn.
2. Nhấn trong trắc dọc tại nơi bạn muốn một điểm đổi dốc. Một PVI được thêm tại cọc và cao độ đó, làm tròn đến 0.01, và được chọn.
3. Thêm bao nhiêu tùy ý, rồi nhấn {{key:I}} lần nữa để dừng thêm.

Nhấn tại nơi đã có PVI sẽ bị từ chối ("Đã có PVI tại …"). Các PVI luôn được giữ theo thứ tự cọc.

## Chỉnh PVI

- **Kéo** một PVI trong trắc dọc để di chuyển nó. Nó không thể vượt qua các PVI lân cận. Mỗi lần di chuyển là một bước hoàn tác.
- **Gõ** giá trị chính xác trong bảng PVI bên phải: **Cọc**, **Cao độ** và **Curve L** (chiều dài đường cong đứng). Nhấn {{key:Enter}} sau mỗi giá trị.
- **Xóa** một PVI bằng dấu x ở cuối hàng của nó, hoặc chọn nó (nhấn vào) rồi nhấn {{key:Delete}}. Khi khung trắc dọc có tiêu điểm, {{key:Backspace}} cũng xóa được.

PVI đầu tiên và PVI cuối cùng không bao giờ có đường cong.

## Đường cong đứng

1. Gõ một chiều dài trong **Curve L** cho một PVI bên trong, ví dụ 200.
2. Đường cong được vẽ đối xứng quanh PVI. Trắc dọc và bảng bên phải hiển thị loại của nó (đỉnh hoặc lõm), L và K, các cọc và cao độ BVC và EVC, cùng điểm cao hoặc điểm thấp của nó khi có một điểm nằm trong đường cong.

K được tính từ L (K = L chia cho hiệu đại số của các độ dốc, tính bằng phần trăm). Bạn gõ L; việc gõ trực tiếp K hiện chưa có.

Nếu một đường cong đứng không vừa, một khung đỏ sẽ nói lý do: nó chạy lùi vào PVI hoặc đường cong trước đó, hoặc vượt qua PVI tiếp theo, và cho biết còn bao nhiêu chỗ ở phía đó (một đường cong cần một nửa chiều dài ở mỗi bên PVI của nó). Nút của khung đặt **đường cong dài nhất vừa được**, cùng K của nó, thành một bước ({{key:Mod+Z}} hoàn tác). Hoặc bạn có thể đưa các PVI ra xa nhau.

## Đọc các số liệu

Bên dưới bảng PVI, một danh sách cho biết từng độ dốc theo phần trăm ("Độ dốc 1: +1.25%") và từng đường cong, ví dụ "Đỉnh tại 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", rồi "Điểm cao 1+62.40, 254.12".

Nếu các PVI không đạt tới cả hai đầu tuyến, một ghi chú sẽ nói điều đó. Hành lang chỉ được dựng ở những nơi trắc dọc và tuyến chồng lên nhau.

## Đường đặc trưng trong trắc dọc

Đường đặc trưng cũng hiển thị trong khung trắc dọc, để bạn thấy một bó vỉa, một rãnh hay đỉnh tường so với trắc dọc của đường.

- Nơi một đường đặc trưng **giao cắt** với tuyến, trắc dọc hiển thị một hình thoi nhỏ tại cọc và cao độ đó, có nhãn là tên đường và cao độ của nó tại đó (cao độ của chính đường, tính dọc theo đoạn giao cắt).
- Nhập một khoảng cách vào {{ui:Song song trong phạm vi}} để cũng vẽ các đường đặc trưng **chạy song song** với tuyến trong khoảng cách đó, dưới dạng đường nét đứt ở cao độ riêng của chúng. Để trống hoặc 0 thì chỉ hiển thị các điểm giao cắt.
- Các dấu và nhãn theo dõi mọi thay đổi: di chuyển một đỉnh, gõ một độ dốc hoặc nâng đường, và trắc dọc hiển thị cao độ mới ngay lập tức.
- Nhấn vào hình thoi của một điểm giao cắt để chọn đường đặc trưng đó; đường được chọn được vẽ bằng màu tô sáng.
- {{ui:Đường đặc trưng}} trên thanh trắc dọc ẩn hoặc hiện tất cả chúng. Cả hai thiết lập đều được lưu cùng dự án.

Xem [Đường đặc trưng](topic:feature-lines).

## Tiếp theo

- [Quét một hành lang đường](topic:corridor) dọc theo tuyến và trắc dọc này.
- Trắc dọc được ghi vào LandXML cùng với tuyến; xem [Trao đổi LandXML](topic:landxml).
