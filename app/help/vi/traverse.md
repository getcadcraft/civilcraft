---
title: Nhập đường chuyền và điều chỉnh theo quy tắc la bàn
summary: Nhập góc hoặc phương vị và khoảng cách của từng cạnh, kiểm tra sai số khép góc và sai số khép dài cùng độ chính xác, điều chỉnh theo quy tắc la bàn, rồi thêm các cọc thành điểm đo hoặc vòng kín thành thửa đất.
keywords: đường chuyền, đường chuyền khép kín, vòng kín, góc phải, ngắm sau, phương vị, khoảng cách, sai số khép, độ chính xác, quy tắc la bàn, bowditch, điều chỉnh, trắc địa
from: 56ce5a8c
---

Đường chuyền là một chuỗi các cạnh đo: tại mỗi cọc là một góc (hoặc một phương vị) và khoảng cách đến cọc kế tiếp. Nhấp **Nhập đường chuyền** dưới **Đường chuyền** trong bảng bên phải khi chưa chọn gì.

## Điểm đầu và điểm cuối

1. **Bắt đầu tại điểm đo**: số hiệu của điểm. Hoặc nhập Bắc và Đông.
2. **Các cạnh là**: **Góc phải và khoảng cách**, hoặc **Phương vị và khoảng cách**.
3. Với góc, cho biết chúng bắt đầu từ đâu: một **Điểm đo ngắm sau**, hoặc **góc phương vị của nó** (từ cọc đầu tiên về phía ngắm sau, theo chiều kim đồng hồ từ Bắc).
4. **Kết thúc**: **quay lại điểm đầu (vòng kín)**, hoặc **tại điểm đo** và số hiệu của nó (đường chuyền hở giữa các điểm đã biết).

## Nhập các cạnh

Mỗi cạnh một dòng, rồi đến khoảng cách, rồi tên của cọc mà nó tới nếu bạn muốn:

- Góc phải, quay theo chiều kim đồng hồ tại cọc mà cạnh rời đi, từ cọc phía sau đến cọc kế tiếp: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` và `270.0028` cũng được.
- Phương vị: `N 45°30'15" E 125.50 B`, hoặc góc phương vị viết thành một từ: `AZ 45-30-15 125.50 B`.
- Trên vòng kín có góc, kết thúc bằng `close` và góc tại điểm đầu một lần nữa, quay từ cọc cuối đến cọc thứ hai: `close 270°00'05"`. Đó là phần kiểm tra các góc.

Các dòng không đọc được sẽ được liệt kê kèm số dòng. "feet", dấu phẩy và các dòng chú thích `#` đều được chấp nhận.

## Đọc sai số khép

Khi bạn nhập, hộp thoại hiển thị:

- **Sai số khép góc**: các góc lệch khỏi khép kín bao nhiêu, và phần mỗi góc chiếm. Không có góc khép thì các góc không được kiểm tra, và mọi sai số trong chúng sẽ hiện ra ở sai số khép dài.
- **Sai số khép dài**: đường chuyền kết thúc lệch khỏi vị trí đáng lẽ phải kết thúc bao nhiêu, và theo hướng nào.
- **Độ chính xác**: chiều dài đường chuyền chia cho sai số khép dài: 1 : 10,000 nghĩa là 1 ft trong 10,000 ft.
- Các cọc sau khi điều chỉnh, và mỗi cọc đã dịch chuyển bao nhiêu.

## Điều chỉnh

Trước hết, sai số khép góc được chia đều cho các góc. Sau đó, sai số khép dài được chia cho các cạnh theo quy tắc la bàn (Bowditch): mỗi cọc dịch chuyển ngược với sai số khép theo tỷ lệ chiều dài đã đi để tới nó, nên đường chuyền kết thúc đúng vị trí cần có.

:::note
Quy tắc la bàn là một phép điều chỉnh tiêu chuẩn, không phải bình phương nhỏ nhất, và nó không cân đối giữa góc và khoảng cách. Độ chính xác đã đủ hay chưa là do tiêu chuẩn của bạn và quy định của địa phương bạn quyết định.
:::

## Dùng kết quả

- **Thêm làm điểm đo**: các cọc đã điều chỉnh trở thành điểm đo với tên bạn đặt (nếu không thì là số tiếp theo còn trống), mô tả `TRAV`, không có cao độ. Cọc cuối của vòng kín chính là điểm đầu nên không được thêm hai lần. Chỉ một bước: {{key:Mod+Z}} hoàn tác.
- **Thêm làm thửa đất** (vòng kín): các cọc đã điều chỉnh trở thành một [thửa đất](topic:parcels), kèm nhãn và mô tả pháp lý của nó.
- **Báo cáo (CSV)**: các dòng sai số khép, rồi đến phương vị, khoảng cách, tọa độ chưa điều chỉnh và đã điều chỉnh, và các hiệu chỉnh của từng cọc.
