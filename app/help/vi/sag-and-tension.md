---
title: Độ võng và lực căng
summary: Các trường hợp tải (nhiệt độ, gió, băng) và giới hạn lực căng của bạn, cách CivilCraft tính lực căng của mỗi đoạn, và các bảng căng dây.
keywords: độ võng, lực căng, trường hợp tải, nhiệt độ, gió, băng, băng không đối xứng, khoảng vượt chuẩn, khoảng vượt tương đương, thay đổi trạng thái, đường xích, phương trình trạng thái, bảng căng dây, cường độ đứt, ứng suất thường ngày
from: f8876c35
---

## Trường hợp tải và giới hạn

{{ui:More}} › {{ui:Load cases and limits…}} chỉnh sửa các quy tắc mà mọi đường dây trong dự án tuân theo.

- **Trường hợp tải**: một nhiệt độ, một áp lực gió lên dây dẫn (Pa), và băng hướng tâm (mm, kèm khối lượng riêng). Trường hợp đầu tiên là trường hợp chuẩn.
- **Giới hạn lực căng**: một tỷ lệ của cường độ đứt của dây dẫn, áp dụng cho lực căng ngang hoặc lực căng lớn nhất tại một trụ, trong một trường hợp tải. Hoặc bạn tự nhập lực căng ngang.
- **Khoảng cách an toàn**: khoảng cách mà dây dẫn giữ phía trên mặt đất, đường, công trình và các thứ khác. Thêm, đổi tên và xóa chúng: chúng là của bạn. Bên dưới, chọn các quy tắc cho **Cây trồng cảnh quan dưới đường dây**, **Tường cảnh quan dưới đường dây** và **Giao cắt ngầm**.
- **Trường hợp các phép kiểm tra dùng**: trường hợp nào cho độ võng lớn nhất (nóng), độ lệch chuỗi cách điện (gió), băng, và băng ở một bên của trụ.
- **Hệ số**: hệ số khoảng cách pha k, độ lệch chuỗi cách điện lớn nhất, một hệ số cho tải trên trụ và phụ kiện, các góc rẽ tạo thành trụ góc và trụ néo, khoảng che tối thiểu của cáp chôn, và độ sụt áp lớn nhất.

## Gói: quy tắc và thư viện cho một quốc gia

CivilCraft không tích hợp sẵn quy tắc của quốc gia nào. Một **gói** giữ một bộ quy tắc và một thư viện cùng trong một tệp (`.cclinepack.json`), cho một quốc gia, một nhà vận hành mạng lưới hoặc một công ty:

- **Lưu thành gói…** trong {{ui:Load cases and limits…}} ghi bộ quy tắc đang hiển thị và thư viện của bạn (hoặc, khi thư viện chưa có gì, các mục mà dự án này dùng). Nhập **Quốc gia hoặc khu vực** trước.
- **Mở bộ quy tắc hoặc gói…** đọc một gói, một tệp quy tắc hoặc một tệp thư viện. Quy tắc của gói được hiển thị trong hộp thoại (nhấn **Áp dụng** để dùng), và các mục của nó được đưa vào thư viện của bạn.
- Các gói người khác chia sẻ được liệt kê trên trang tiện ích bổ sung, dưới **Gói đường dây điện**. Hai gói ví dụ minh họa định dạng; chúng không phải quy tắc của bất kỳ quốc gia nào.

Mọi gói đều được kiểm tra khi mở, như mọi tệp khác. Hãy kiểm tra mọi giá trị theo tiêu chuẩn áp dụng trước khi xây dựng bất cứ thứ gì.

Hai bộ quy tắc ví dụ có sẵn để bắt đầu: **Ví dụ: khí hậu lạnh** và **Ví dụ: khí hậu ôn hòa**. Các con số của chúng không lấy từ tiêu chuẩn nào: hãy đặt các giá trị mà tiêu chuẩn của bạn đưa ra. {{ui:Save rules}} và {{ui:Open rules…}} chia sẻ một bộ quy tắc dưới dạng tệp.

## Cách tính lực căng

Với mỗi đoạn giữa hai trụ néo:

1. **Khoảng vượt chuẩn** là √(ΣL³ ÷ ΣL) của các khoảng của nó.
2. Mỗi giới hạn được đổi thành một lực căng ngang ở trường hợp chuẩn qua **phương trình thay đổi trạng thái** trên khoảng vượt chuẩn: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Giới hạn khắt khe nhất sẽ quyết định lực căng.
3. Lực căng của mọi trường hợp tải đều suy ra từ giá trị đó, và hình dạng của mỗi khoảng là **đường xích** chính xác đi qua hai điểm treo của nó (kể cả các khoảng trên dốc): độ võng từ dây cung, chiều dài, và lực căng tại mỗi đầu.

Tải trọng trên mỗi mét trong một trường hợp: trọng lượng cộng băng (diện tích băng × khối lượng riêng × g) theo phương đứng; áp lực gió × đường kính đã phủ băng theo phương ngang.

## Bảng căng dây

{{ui:More}} › {{ui:Stringing tables…}} liệt kê, cho mỗi đoạn, lực căng ngang và độ võng của mọi khoảng ở từng nhiệt độ của bộ quy tắc (ban đầu từ −5 °C đến 40 °C, mỗi bước 5 °C), trong không khí lặng. Lưu chúng, cùng bảng trụ, dưới dạng CSV.

Không tính: sự từ biến của dây dẫn theo năm tháng, và độ giãn của dây dẫn mới. Hãy thêm chúng qua các nhiệt độ bạn căng dây.
