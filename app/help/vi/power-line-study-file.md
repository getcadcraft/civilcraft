---
title: Tệp nghiên cứu cho chương trình đường dây khác (.DON)
summary: Lưu một đường dây trên không thành tệp nghiên cứu .DON, hoặc đọc các trụ của một tệp như vậy vào một đường dây mới. Chưa được kiểm thử với chương trình đọc chúng.
keywords: don, .don, tệp nghiên cứu, xml, xuất, nhập, chương trình đường dây trên không, căng dây, canton
from: 1abc4d07
---

Một số chương trình đường dây trên không lưu một nghiên cứu trong tệp `.DON` (văn bản XML). CivilCraft có thể ghi một đường dây thành tệp như vậy và đọc các trụ của một tệp.

:::warning
**Chưa kiểm thử.** Chúng tôi xây dựng việc này từ một danh sách tên trường của định dạng do một người dùng chia sẻ, chứ không phải từ một tệp thật, và chúng tôi chưa mở các tệp của mình trong chương trình đọc chúng. Hãy mở tệp trong chương trình đó và kiểm tra từng giá trị trước khi dựa vào nó. Nếu bạn có thể chia sẻ một tệp `.DON` (đã xóa thông tin khách hàng), điều đó giúp chúng tôi làm đúng việc này.
:::

## Lưu tệp nghiên cứu

1. Gán cho đường dây một dây dẫn và đảm bảo nó có kết quả (không có "chưa tính" trong Thuộc tính của nó).
2. {{ui:Thêm}} › {{ui:Lưu tệp nghiên cứu (.DON)…}}, chọn đường dây, thêm mô tả và số công việc.
3. {{ui:Lưu tệp nghiên cứu}}.

Tệp chứa các trụ của đường dây (tọa độ, mặt đất, chiều cao, vai trò, xà ngang, trụ được giữ hay được gợi ý, tải theo từng trường hợp tải, móng), một đoạn cho mỗi quãng giữa các neo cuối (dây dẫn, điện áp, nhịp chuẩn, các nhịp, lực căng và tham số catenary, lực căng lớn nhất theo từng trường hợp tải) và các bảng căng dây. Chiều dài tính bằng mét và lực tính bằng daN; văn bản được ghi bằng Latin-1, nên ký tự nằm ngoài bảng này sẽ thành `?`.

## Đọc tệp nghiên cứu

{{ui:Thêm}} › {{ui:Mở tệp nghiên cứu (.DON)…}} đọc các trụ vào một đường dây mới. Dây dẫn, trụ và xà ngang được khớp với thư viện của bạn theo tên; những gì không tìm thấy sẽ được để bạn chọn trong Thuộc tính.
