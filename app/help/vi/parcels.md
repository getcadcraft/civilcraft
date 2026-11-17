---
title: Vẽ thửa đất và viết mô tả pháp lý
summary: Vẽ thửa đất theo các góc của nó hoặc nhập các số đo từ văn tự hay bản trích đo, kiểm tra mức khép kín của số đo, ghi phương vị và khoảng cách lên mặt bằng, biến bất kỳ cạnh nào thành đường cong, và sao chép bản nháp mô tả pháp lý.
keywords: thửa đất, lô đất, ranh giới thửa, ranh giới, văn tự, bản trích đo, số đo theo đường, phương vị, khoảng cách, sai số khép, độ chính xác, mô tả pháp lý, điểm khởi đầu, đường cong, bán kính, diện tích, acre
from: 6793d6ce
---

Thửa đất nằm trên mặt bằng, với phương vị và khoảng cách dọc theo mỗi cạnh thẳng (một đường cong hiển thị bán kính, chiều dài và góc ở tâm), cùng tên và diện tích ở giữa. Chúng được đưa vào bản in PDF và các tệp xuất DWG và DXF, trên các lớp `V-PROP` (đường) và `V-PROP-TEXT` (nhãn). Mọi thứ nằm dưới **Thửa đất** trong bảng bên phải khi không có gì được chọn.

## Vẽ một thửa đất

1. Nhấn **Vẽ thửa đất**.
2. Nhấn các góc, bắt đầu từ điểm khởi đầu. Một lần nhấn gần điểm đo sẽ lấy đúng vị trí của điểm đó.
3. Nhấn góc đầu tiên một lần nữa, hoặc nhấn {{key:Enter}}, để kết thúc. {{key:Backspace}} lấy lại góc cuối cùng; {{key:Esc}} bỏ các góc đã vẽ cho đến lúc đó; nhấn lại để thoát công cụ.

## Nhập số đo từ văn tự

1. Nhấn **Nhập số đo văn tự**.
2. Nói rõ số đo bắt đầu ở đâu: số hiệu của một điểm đo, hoặc một tọa độ bắc và đông.
3. Gõ hoặc dán các số đo, mỗi dòng một số đo:
   - một đoạn thẳng: một phương vị và một khoảng cách, như `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` và phương vị góc (`AZ 45°30'15"`) cũng dùng được, còn các từ "thence", dấu phẩy và "feet" bị bỏ qua.
   - một đường cong: `C R 300 L 52.36 right` (bán kính và chiều dài cung), hoặc `C R 300 D 10°00'00" left` (bán kính và góc ở tâm). Một đường cong nối tiếp đoạn đứng trước nó; khi không, hãy thêm phương vị dây cung của nó: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` mở đầu một dòng chú thích.
4. Khi bạn gõ, hộp thoại hiển thị tổng chiều dài của số đo, **sai số khép** (các số đo kết thúc cách điểm đầu bao xa và theo hướng nào), **độ chính xác** (chiều dài chia cho sai số khép, 1 : 10,000 và tương tự) và diện tích. Các dòng không đọc được được liệt kê kèm số dòng.
5. **Thêm thửa đất**. Khi các số đo không khép kín, thửa đất được đóng bằng một đoạn thẳng qua khe hở: hãy đối chiếu số đo với văn tự. Để phân bổ sai số của một đường chuyền thực địa cho các cạnh, hãy hiệu chỉnh nó trước.

## Đường cong

Trong **Thuộc tính** của một thửa đất, mỗi cạnh có một **Bán kính**. Nhập một giá trị để biến cạnh đó thành đường cong đi qua cùng hai góc (bán kính nhỏ hơn một nửa khoảng cách giữa các góc không thể đạt tới, nên bị từ chối), và chọn **Right** hoặc **Left** trong **Curves**: đường cong bên phải có tâm nằm bên phải hướng di chuyển, như trong văn tự. Xóa bán kính để cạnh thẳng trở lại. Mỗi thay đổi là một bước: {{key:Mod+Z}} hoàn tác.

## Mô tả pháp lý

Phần Thuộc tính của thửa đất kết thúc bằng mô tả pháp lý của nó, được viết từ bản vẽ:

- "Beginning at" **Điểm khởi đầu** bạn nhập (ví dụ "the northeast corner of Lot 4"), nếu không thì tọa độ bắc và đông của góc đầu tiên, hoặc điểm đo mà các số đo bắt đầu từ đó.
- "thence" với mỗi cạnh: một phương vị và một khoảng cách, hoặc một đường cong với bán kính, chiều dài cung, góc ở tâm, cùng phương vị và khoảng cách dây cung.
- "Containing" diện tích của nó tính bằng ft² và acre (m² và ha trong dự án đơn vị mét).

**Sao chép** đặt nó lên bộ nhớ tạm; **Tải xuống dạng văn bản** lưu thành tệp `.txt`.

:::warning
Mô tả pháp lý là bản nháp từ bản vẽ, không phải bản đo đạc. Một người khảo sát được cấp phép phải đối chiếu nó với hồ sơ và ký xác nhận trước khi ai dựa vào.
:::

Nhấn bên trong một thửa đất trên mặt bằng để chọn nó; {{key:Delete}} xóa nó. Thửa đất được lưu trong tệp dự án.
