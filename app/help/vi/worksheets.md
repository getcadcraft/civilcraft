---
title: Bảng thống kê: bảng liên kết với các đối tượng
summary: Các bảng thống kê đã lưu với hàng lấy từ cây, diện tích trồng, lát, tường, bậc thang, công cụ điều chỉnh mặt đất hoặc toàn bộ khối lượng; cột và công thức riêng, nhóm và tổng; CSV, XLSX và bảng trên các tờ, luôn được cập nhật.
keywords: bảng thống kê, lịch, bảng cây, bảng cảnh quan cứng, khối lượng, cột, công thức, tổng, tổng cộng, đếm, nhóm, lọc, csv, xlsx, bảng tính, bảng trên tờ
from: 11bc1bac
---

{{ui:Bảng thống kê}} (Cảnh quan › Thêm) mở các bảng thống kê của dự án này. Lần đầu tiên, **bảng thống kê cây** và **bảng thống kê cảnh quan cứng và diện tích** được tạo sẵn cho bạn. Một bảng thống kê được tính từ các đối tượng mỗi lần nó được hiển thị, ghi ra hoặc đặt lên một tờ: thay đổi một luống thì số lượng của nó thay đổi ở mọi nơi.

- **Hàng lấy từ**: cây (mỗi dòng một loài, giống và kích thước), diện tích trồng, lát, tường, bậc thang, công cụ điều chỉnh mặt đất (đào và đắp) hoặc toàn bộ khối lượng.
- **Cột**: một trường (`qty`, `area`, `botanical`, hoặc một tên trong ngoặc vuông như `[Net area]`) hoặc một công thức: `+ - * / ^ %`, `&` để nối văn bản, `= <> < <= > >=`, và `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Công thức không tính được sẽ hiển thị `#ERR` (hoặc `#DIV/0`) trong ô của nó. Công thức do bộ phân tích riêng của CadCraft đọc; không có gì trong đó được chạy như mã.
- **Tổng** cho mỗi cột (tổng, đếm, trung bình, nhỏ nhất, lớn nhất), **Nhóm theo** (tổng phụ cho mỗi nhóm) và **Chỉ các hàng khi**.
- {{ui:Lưu dạng CSV}}, {{ui:Lưu dạng XLSX}}, và **Đặt bảng thống kê này lên các tờ** (Tờ › Bảng thống kê vẽ nó thành một bảng, trải trên bao nhiêu tờ tùy cần).

Nhãn trên cây và diện tích dùng cùng tên trường (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
