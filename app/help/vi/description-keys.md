---
title: Khóa mô tả và mã đường
summary: Biến mã trường thành nhóm điểm có mô tả, và nối các điểm có mã thành đường (bắt đầu, kết thúc, đóng) để trở thành đường ngắt.
keywords: khóa mô tả, mã trường, mã đường, hình vẽ, đường nét, bắt đầu, kết thúc, đóng, nhóm điểm, mã, mã khảo sát, bộ thu thập dữ liệu, đường ngắt, bó vỉa, mép mặt đường
from: b3d1af8d
---

Đội khảo sát mã hóa mọi điểm đo ngoài thực địa: `EP` cho mép mặt đường, `TC` cho đỉnh bó vỉa, `BLDG` cho góc tòa nhà. Mã là từ đầu tiên của mô tả điểm. CivilCraft nhóm điểm theo nó, và biến các mã đường đi sau nó thành đường.

## Mã đường

Mã đường là từ ngay sau mã trường:

| Mô tả | Ý nghĩa |
|---|---|
| `EP B` | Bắt đầu một đường mép mặt đường mới tại điểm này |
| `EP` | Tiếp tục đường EP hiện tại |
| `EP E` | Kết thúc đường EP hiện tại tại điểm này |
| `BLDG C` | Đóng tòa nhà: nối điểm này trở lại điểm đầu tiên của đường |

Các điểm có cùng mã được nối theo thứ tự số hiệu điểm. Các mã khác nhau là các đường khác nhau ngay cả khi chung một nhóm, nên `EP1` và `EP2` cho hai cạnh cùng lúc. Một mã không bao giờ dùng mã đường thì được nối qua mọi điểm của nó, như trong các phiên bản trước.

Các đường trong một nhóm được dùng làm **Đường ngắt** trở thành đường ngắt, mỗi đường một cái, nên một bó vỉa có khe hở sẽ không bị kéo căng qua khe hở. Các đường trong nhóm khác được vẽ trên mặt bằng (lớp V-NODE-LINE) và được xuất ra trong DXF, DWG và PDF.

Các từ cho bắt đầu, kết thúc và đóng là `B`, `BEG`, `START`; `E`, `END`; và `C`, `CLO`, `CLOSE`. Hãy đổi chúng, hoặc tắt mã đường, trong hộp thoại bên dưới.

## Khóa mô tả

Khóa mô tả biến một mã thành một nhóm điểm, một cách dùng và một mô tả dài.

1. Dưới **Điểm**, nhấp {{ui:Khóa mô tả và mã đường}}.
2. Nhấp {{ui:Thêm khóa}} và điền hàng:
   - **Mã**: mã trường cần khớp. `*` đại diện cho bất kỳ ký tự nào và `?` cho một ký tự, nên `EP*` bắt EP, EP1 và EP12.
   - **Nhóm**: nhóm điểm mà các điểm này tham gia (để trống = chính mã đó). `EP*` với nhóm `EP` đặt EP1 và EP2 trong một nhóm trong khi chúng vẫn là các đường riêng.
   - **Dùng**: Điểm, Đường ngắt hoặc Bỏ qua, cho khi nhóm xuất hiện lần đầu (hoặc để cột **Điểm** quyết định).
   - **Mô tả**: tên dài, hiển thị trong **Thuộc tính** của một điểm.
3. Cột **Điểm** đếm các điểm mỗi khóa bắt được khi bạn gõ. Khóa đầu tiên khớp với một mã sẽ thắng.
4. Nhấp {{ui:Áp dụng}}. Các nhóm, bề mặt và mặt bằng theo sau trong một bước: {{key:Mod+Z}} hoàn tác.

Một nhóm giữ cách dùng bạn đặt trong bảng **Điểm**; cách dùng của khóa chỉ đặt nó cho một nhóm mới. Các khóa và mã đường được lưu trong tệp dự án.
