---
title: Tính lưu lượng nước mưa, kích thước ống và đường năng lượng thủy lực
summary: Vẽ các lưu vực thoát về từng công trình, cộng lưu lượng dọc mạng lưới bằng phương pháp hợp lý, chọn kích thước ống theo phương trình Manning, và xem đường năng lượng thủy lực chảy đầy hoặc chạm tới mặt đất ở đâu.
keywords: thoát nước mưa, lưu vực, diện tích thoát nước, phương pháp hợp lý, hệ số dòng chảy, thời gian tập trung, cường độ mưa, idf, manning, chọn kích thước ống, đường năng lượng thủy lực, hgl, đường năng lượng, egl, dâng nước, ngập lụt, nước hạ lưu
from: e44872ec
---

Thoát nước mưa hoạt động trên [mạng ống](topic:pipe-network): vẽ mạng lưới trước, rồi các khu vực thoát vào nó. Mọi thứ hiện dưới **Thoát nước mưa** trong bảng bên phải khi không chọn gì.

## Vẽ một lưu vực

1. Nhấn **Vẽ một lưu vực** dưới **Thoát nước mưa**.
2. Nhấn các góc của khu vực thoát về một công trình. {{key:Enter}} hoặc nhấp đúp sẽ kết thúc; {{key:Backspace}} lấy lại góc cuối cùng, {{key:Esc}} dừng.
3. Lưu vực thoát về một công trình nằm trong nó, nếu không thì về công trình gần nhất. **Thuộc tính** của nó mở ra: đặt tên, **Hệ số dòng chảy C** (phần lượng mưa chảy đi, từ 0 đến 1), **Thời gian tập trung** tính bằng phút, và công trình nào nó **Thoát về**.

**Vẽ lưu vực khác** trong Thuộc tính của nó sẽ bắt đầu lưu vực tiếp theo. Nhấp vào bên trong một lưu vực trên mặt bằng để chọn nó; {{key:Delete}} sẽ xóa nó. Mỗi thay đổi là một bước: {{key:Mod+Z}} hoàn tác.

## Đặt trận mưa thiết kế

Cường độ mưa là i = a ÷ (tc + b) lũy thừa c, tính bằng inch mỗi giờ với dự án theo foot và bằng milimét mỗi giờ với dự án theo mét. Điều chỉnh **Cường độ a**, **b** và **c** theo đường cong cường độ–thời đoạn–tần suất (IDF) của riêng bạn cho chu kỳ lặp lại mà bạn thiết kế.

:::warning
Đường cong cường độ mưa khởi đầu, Manning n (0.013) và tổn thất tại nút (0.5) là giá trị tạm, không phải tiêu chuẩn. Hãy đặt chúng theo dữ liệu mưa và tiêu chí thiết kế của riêng bạn.
:::

- **Thời gian tập trung ngắn nhất**: không đoạn ống nào được tính với thời gian ngắn hơn (khởi đầu là 10 phút).
- **Manning n**: độ nhám của ống.
- **Tổn thất tại nút**: cột nước mất tại mỗi công trình, tính theo tỷ lệ với cột vận tốc V²/2g của ống rời khỏi nó.
- **Mực nước tại cửa xả**: nước hạ lưu, nơi ống cuối cùng xả ra. Để trống khi cửa xả thoát tự do.

## Cách các lưu lượng cộng lại

Mỗi ống mang mọi lưu vực ở phía trên nó. Q = C × i × A, trong đó C × A được cộng dọc mạng lưới và i là cường độ tại thời gian tập trung dài nhất của nước đổ về: thời gian riêng của một lưu vực, hoặc thời gian từ lưu vực phía thượng lưu cộng thời gian chảy qua các ống (chiều dài ÷ vận tốc khi chảy đầy). Q tính bằng foot khối mỗi giây (A tính bằng acre) hoặc mét khối mỗi giây (A tính bằng hecta).

## Chọn kích thước ống

Bảng dưới **Lưu lượng và đường năng lượng** cho mỗi ống hiển thị lưu lượng, khả năng chứa khi chảy đầy ở độ dốc của nó, vận tốc, đường thủy lực tại đỉnh và chân ống, và độ sâu dòng chảy.

**Chọn kích thước ống theo các lưu lượng này** gán cho mỗi ống kích thước tiêu chuẩn nhỏ nhất có thể chứa lưu lượng của nó ở độ dốc riêng (12 đến 72 in, hoặc 300 đến 1800 mm). Đây là một bước. Cao độ đáy vẫn giữ nguyên: nếu kích thước thay đổi, dùng **Đặt mọi cao độ đáy theo quy tắc** để giữ lớp đất phủ, rồi kiểm tra lại bảng.

## Đọc các đường thủy lực

Đường thủy lực (HGL) được tính từ cửa xả ngược lên thượng lưu:

- Một ống chảy một phần có HGL nằm ở mặt nước: cao độ đáy cộng độ sâu bình thường.
- Khi nước bên dưới cao hơn đỉnh ống, hoặc ống chứa nhiều hơn khả năng khi chảy đầy, ống chảy đầy (bị dâng nước) và HGL của nó tăng lên bằng độ dốc ma sát trên chiều dài của nó.
- Tại mỗi công trình, HGL là HGL ở đỉnh của ống rời đi cộng tổn thất tại nút.
- Đường năng lượng (EGL) là HGL cộng cột vận tốc.

Một ống chảy đầy sẽ được liệt kê, và cũng vậy mọi công trình có HGL cao hơn miệng hố: nước chạm mặt đất tại đó, và công trình được khoanh đỏ trên mặt bằng. Chọn một ống hoặc công trình để xem lưu lượng, độ sâu, vận tốc và cả hai đường năng lượng trong Thuộc tính của nó.

## Diễn toán trận mưa

Phương pháp hợp lý cho một đỉnh cho mỗi ống. {{ui:Diễn toán trận mưa}} (dưới kết quả, trong Thuộc tính của mạng) thay vào đó tính toàn bộ trận mưa: dòng chảy của mỗi lưu vực theo thời gian, được dẫn xuống các ống cùng thời gian chảy và khả năng trữ của chúng, rồi cộng lại chỗ chúng gặp nhau.

1. Để trống {{ui:Mưa kéo dài}} và {{ui:Cường độ mưa}} để dùng thời gian tập trung dài nhất và đường cong mưa ở trên, hoặc nhập giá trị riêng.
2. Nhấn {{ui:Diễn toán trận mưa}}. Bảng liệt kê cho mỗi ống: lưu lượng vào và ra cao nhất, đỉnh ra thấp hơn bao nhiêu, chiếm bao nhiêu khả năng chứa đầy đủ của ống, và phút xuất hiện đỉnh.
3. Mỗi cửa xả có một biểu đồ nhỏ lưu lượng theo thời gian và {{ui:Tải đường quá trình lưu lượng (CSV)}}.

Một lưu vực phát ra lượng mưa được lấy trung bình trong thời gian tập trung của nó, nên một trận mưa ngắn hơn thời gian đó sẽ có đỉnh thấp hơn C × i × A. Mỗi ống được diễn toán bằng phương pháp Muskingum–Cunge, dùng độ sâu dòng chảy mà phương pháp hợp lý đã tìm được. Hai nhánh có thời gian tập trung khác nhau sẽ không đạt đỉnh cùng lúc, nên tổng của chúng thấp hơn tổng các đỉnh.

Mô hình này không mô phỏng dâng nước, nước dềnh ngược, trữ nước trong công trình hay ngập lụt. Một ống có đỉnh diễn toán vượt khả năng chứa đầy sẽ được liệt kê, và nước của nó được chuyển tiếp như thể ống chứa được. Hãy dùng nó để xem thời điểm và sự suy giảm đỉnh lũ, không dùng để chọn kích thước ống. Đây là công cụ hỗ trợ tính toán: một kỹ sư phải kiểm tra lại.

## Lưu cùng dự án

Lưu vực và cài đặt trận mưa được lưu trong tệp dự án. Chúng chưa có trong bản in PDF, DWG hoặc DXF, hay LandXML: xem [Chưa xây dựng](topic:not-built-yet).
