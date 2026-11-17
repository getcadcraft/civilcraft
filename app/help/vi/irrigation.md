---
title: Thiết kế tưới tiêu
summary: Công cụ tính toán, không phải bản thiết kế có dấu: đầu tưới, ống nhánh, ống chính, van và đường tưới nhỏ giọt trên khu đất; khu tưới tìm từ các ống; tổn thất áp suất theo Hazen–Williams, đầu tưới bất lợi nhất, lưu lượng và áp suất so với nguồn cấp, cường độ tưới, thời gian tưới, vùng phủ và bảng vật tư.
keywords: tưới tiêu, vòi phun, phun mưa, vòi xoay, vòi phun xoay, vòi sủi, nhỏ giọt, đường nhỏ giọt, đầu nhỏ giọt, van, khu tưới, trạm, bộ điều khiển, ống chính, ống nhánh, điểm đấu nối, nguồn nước, áp suất, psi, kpa, lưu lượng, gpm, tổn thất ma sát, hazen williams, cường độ tưới, thời gian tưới, vùng phủ, đầu nối đầu, bảng vật tư
from: 7d6342c1
---

:::warning
Đây là công cụ tính toán, không phải bản thiết kế có dấu: một kỹ sư thiết kế tưới tiêu phải kiểm tra mọi kết quả trước khi thi công.
:::

## Bố trí hệ thống

1. Trong phần **Tưới tiêu** ở bên trái, chọn **Đầu tưới**, **Cung** của nó và nơi cung bắt đầu, cùng cỡ ống cho ống nhánh và ống chính.
2. {{ui:Tưới tiêu}} › {{ui:Điểm đấu nối}}: nhấp nơi nguồn nước nối vào. Đặt **áp suất**, **lưu lượng sẵn có** và tổn thất đồng hồ cùng chống chảy ngược trong Thuộc tính.
3. {{ui:Tưới tiêu}} › {{ui:Van}}: nhấp nơi đặt van của mỗi khu. Một van bắt đầu một khu.
4. {{ui:Tưới tiêu}} › {{ui:Đầu tưới}}: nhấp để đặt đầu tưới; mỗi lần nhấp đặt một đầu.
5. {{ui:Tưới tiêu}} › {{ui:Ống nhánh}}: nhấp từ một van, đi qua các đầu tưới của nó, và nhấn {{key:Enter}}. {{ui:Ống chính}}: từ điểm đấu nối đến mỗi van.

Đầu ống bắt vào đầu tưới, van, nguồn nước và các đầu ống khác, nên mạng được nối liền. Một khu là mọi thứ đạt được từ van của nó dọc theo các ống nhánh; ống chính chỉ mang một khu tại một thời điểm.

## Tưới nhỏ giọt

{{ui:Tưới tiêu}} › {{ui:Đường tưới nhỏ giọt}}: nhấp dọc theo đường, bắt đầu từ nơi nó được cấp nước (đầu ống nhánh hoặc một van). Đặt **lưu lượng đầu nhỏ giọt** và **khoảng cách** trong Thuộc tính; lưu lượng của nó là tổng các đầu nhỏ giọt dọc theo.

## Kiểm tra

{{ui:Tưới tiêu}} › {{ui:Kiểm tra hệ thống…}} liệt kê mọi khu:

| Cột | Cách tính |
|---|---|
| Lưu lượng | Cộng lưu lượng của các đầu tưới (và của các đường nhỏ giọt) |
| Tại van | Áp suất làm việc của đầu tưới bất lợi nhất cộng tổn thất ống đến nó (Hazen–Williams, đường kính trong của ống, chênh lệch cao độ) và tổn thất qua van |
| Tại nguồn | Tương tự cộng tổn thất ống chính mang khu đó, và tổn thất đồng hồ cùng chống chảy ngược |
| Cường độ tưới | Lưu lượng của các đầu tưới chia cho diện tích chúng tưới với khoảng cách đầu-đầu |
| Phút mỗi tuần | Để áp dụng cài đặt **Tưới mỗi tuần** |
| Vấn đề | Lưu tốc vượt giới hạn, đầu tưới nằm ngoài dải áp suất, vòi phun và vòi xoay trên cùng một van, áp suất hoặc lưu lượng không đủ tại nguồn, đầu tưới không thuộc khu nào, vòng kín |

Chọn một van để xem số liệu của khu và đầu tưới bất lợi nhất của nó được khoanh trên mặt bằng. Bảng vật tư đếm đầu tưới theo loại và cung, ống theo cỡ, van, đường nhỏ giọt và đầu nhỏ giọt, cùng các trạm của bộ điều khiển. **Lưu dạng CSV** giữ cả hai.

Các cài đặt trong phần Tưới tiêu: **Hazen–Williams C** (150 cho ống nhựa mới), **lưu tốc nhanh nhất** trong ống (1.5 m/s), **tổn thất qua van**, và **Tưới mỗi tuần**. Chúng là mặc định có nhãn.

## Vùng phủ

{{ui:Tưới tiêu}} › {{ui:Hiện vùng phủ}} cho biết phần diện tích nào bị các đầu tưới bỏ khô, phần nào hai đầu tưới trở lên cùng tưới, và đầu nào không với tới đầu láng giềng (khoảng cách đầu-đầu).

## Đầu tưới

Các đầu được liệt kê là các **loại chung** do CadCraft viết từ cường độ tưới thiết kế (vòi phun cố định, vòi xoay phun, vòi xoay bánh răng, vòi sủi, vòi phun vi mô, đầu nhỏ giọt), không phải sản phẩm của bất kỳ nhà sản xuất nào. **Thêm đầu tưới từ tệp…** đọc các đầu của riêng bạn (một danh sách JSON với tầm phun, lưu lượng hoặc cường độ tưới, và dải áp suất của từng đầu); chúng được lưu cùng dự án. Dữ liệu công bố của một nhà sản xuất chỉ được đưa vào khi nhà sản xuất đó có sự cho phép được ghi nhận.

Bên dưới các đầu chung, danh sách có **đầu tưới điển hình** (tên của chúng kết thúc bằng "giá trị điển hình"): kích thước vòi của vòi phun cố định, vòi xoay phun và vòi xoay bánh răng, vòi phun vi mô, vòi sủi và đầu nhỏ giọt, với bán kính, lưu lượng và dải áp suất. CadCraft tính chúng từ các công thức công bố (phương trình lỗ phun cho lưu lượng, tỷ lệ tầm phun của tia nước cho bán kính) và các lớp lưu lượng danh định, chỉ từ các nguồn mở; không sao chép bảng của nhà sản xuất nào. Chọn một loại và bộ chọn sẽ hiện cơ sở và giấy phép của nó. Dự án dùng loại nào sẽ giữ đầu đó và nguồn của nó trong tệp dự án. Chúng dành cho lập kế hoạch: hãy kiểm tra dữ liệu riêng của đầu thực trước khi thi công.
