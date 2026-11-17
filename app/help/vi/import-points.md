---
title: Nhập điểm khảo sát
summary: Mở tệp điểm CSV hoặc văn bản, kiểm tra thứ tự cột trong hộp thoại Nhập điểm, sửa các hàng không đọc được, và xếp các điểm vào nhóm.
keywords: nhập điểm, csv, txt, pnezd, penzd, tệp điểm, khảo sát, điểm cogo, nhóm điểm, cột, northing easting, bắc đông
from: ad33d88a
---

Tệp điểm là một tệp văn bản với một điểm trên mỗi dòng: số hiệu điểm, Northing, Easting, cao độ và mô tả theo một thứ tự nào đó, phân cách bằng dấu phẩy, tab, dấu chấm phẩy hoặc khoảng trắng. CivilCraft đọc tệp trong trình duyệt và dựng ngay một bề mặt từ đó.

## Trước khi bắt đầu

- Biết thứ tự cột của tệp nếu có thể (PNEZD và PENZD trông giống nhau với máy tính).
- Biết đơn vị của nó. CivilCraft không quy đổi: đặt **Đơn vị** ở bảng bên trái cho khớp với tệp (xem [Đơn vị, cọc và định dạng số](topic:units-and-stations)).
- Tọa độ có thể rất lớn (Northing và Easting của hệ phẳng tiểu bang hàng triệu vẫn ổn).

## Nhập tệp

1. Nhấp {{ui:Mở}} trên thanh công cụ, hoặc nhấn {{key:Mod+O}}, rồi chọn tệp. Bạn cũng có thể kéo nó lên mặt bằng.
   Hộp thoại **Nhập điểm** mở ra, với tên tệp, danh sách **Cột** đặt là {{ui:Nhận diện}}, một dòng tóm tắt và sáu điểm đầu tiên.
2. Đọc dòng tóm tắt. Nó cho biết có bao nhiêu điểm được đọc, theo thứ tự cột nào, thứ tự đó được tìm ra bằng cách nào, và cái gì phân cách các cột. Ba cách tìm thứ tự:
   - "từ hàng tiêu đề": dòng đầu tiên nêu tên các cột (Point, Northing, Easting, Elevation, Description, hoặc X, Y, Z …). Đây là cách an toàn nhất.
   - "theo lựa chọn": bạn đã chọn một thứ tự trong **Cột**.
   - "đoán từ số cột và cài đặt dòng điểm (PNEZD) — hãy kiểm tra Northing và Easting không bị đổi chỗ": không có tiêu đề dùng được. Nếu tệp của bạn thường có Easting trước, đặt **Dòng điểm** thành P, E, N, Z, D trong [Cài đặt CivilCraft](topic:settings).
3. Kiểm tra bảng xem trước. Các cột của nó luôn là **Điểm**, **Bắc**, **Đông**, **Cao độ**, **Mô tả**, bất kể tệp dùng thứ tự nào. Northing và Easting của một công trường thực thường có độ lớn rõ rệt khác nhau: nếu chúng có vẻ bị đổi chỗ, việc đoán đã sai.
4. Nếu thứ tự sai, chọn đúng trong **Cột** (ví dụ {{ui:PENZD — điểm, đông, bắc, cao độ, mô tả}}). Dòng tóm tắt và bảng xem trước cập nhật ngay.
5. Tìm dưới bảng xem trước mục **Hàng không đọc được**. Mỗi dòng nêu số dòng trong tệp, lý do và phần đầu của hàng. Xem [Hàng không đọc được](topic:import-points#rows-that-are-not-read).
6. Nhấp {{ui:Nhập}}.
   Các điểm xuất hiện trên mặt bằng, khung nhìn phóng tới chúng và bề mặt được dựng. Thanh trạng thái hiện, chẳng hạn, "Đã nhập 276 điểm từ site.csv; bề mặt: 546 tam giác."

Nếu dự án chưa có tên, nó lấy tên của tệp.

## Kiểm tra nhóm

Mỗi điểm thuộc một nhóm có tên là **từ đầu tiên của mô tả**, viết hoa: "GRD", "FL 12" và "fl" thuộc các nhóm GRD, FL và FL. Điểm không có mô tả thì vào "(không có mô tả)".

1. Xem bảng dưới **Điểm** ở bảng bên trái: nhóm, số điểm và một lựa chọn **Bề mặt**.
2. Mỗi nhóm bắt đầu là {{ui:Điểm}}. Đổi các đường dòng chảy, mép mặt đường, đỉnh và chân mái dốc, sống và các đường được mã hóa tương tự thành {{ui:Đường ngắt}}. Đặt các nhóm không nên tạo hình mặt đất (điểm khống chế, ngọn cây, cột điện đo ở đỉnh) thành {{ui:Bỏ qua}}.
3. Nhấp một điểm trên mặt bằng (với {{ui:Chọn}}) để xem số hiệu, tọa độ, cao độ, mô tả và nhóm của nó ở bảng bên phải.

:::warning
Một nhóm đường ngắt nối **tất cả** các điểm của nó thành **một** đường, theo thứ tự số hiệu điểm. Điều đó đúng khi mỗi đường được mã hóa đo theo thứ tự với mã riêng. Hai đường dòng chảy riêng biệt cùng mã "FL" sẽ thành một đường ngoằn ngoèo giữa chúng. Nếu mã của bạn dùng chung, hãy dùng công cụ {{ui:Đường ngắt}} để nhấp các điểm của từng đường (xem [Dựng và tinh chỉnh bề mặt](topic:build-surface)).
:::

## Hàng không đọc được

| Lý do hiển thị | Ý nghĩa | Cần làm gì |
|---|---|---|
| "northing hoặc easting không phải là số" | Một cột tọa độ chứa chữ | Kiểm tra thứ tự cột, hoặc một hàng chữ lạc giữa tệp |
| "cao độ không phải là số" | Cột cao độ chứa chữ | Thứ tự cột sai, hoặc một mô tả nằm trong cột cao độ |
| "không có số hiệu điểm" | Cột điểm trống | Đánh số cho điểm, hoặc chọn thứ tự không có P (NEZD, NEZ …): khi đó các điểm được đánh số 1, 2, 3 … |
| "điểm 12 xuất hiện hai lần (giữ điểm đầu tiên)" | Hai hàng chung một số | Đánh số lại một trong hai trong tệp nếu cả hai đều là phép đo thật |
| "3 cột, cần 5 (PNEZD)" | Hàng bị thiếu | Một dòng bị đứt, hoặc thứ tự cột sai |

Một điểm có cao độ trống vẫn được giữ lại, nhưng không được dùng trong bề mặt. Phần **Điểm** cho biết có bao nhiêu điểm có cao độ.

Các dòng bắt đầu bằng `#`, `;` hoặc `//` là chú thích và bị bỏ qua. Dòng trống cũng bị bỏ qua.

## Thay thế hoặc thêm điểm

Nhập lại sẽ **thay thế** toàn bộ điểm; nó không thêm vào chúng. Tuyến, nền, đường ống, đường ngắt đã vẽ và ranh giới của bạn vẫn còn. Lịch sử hoàn tác bị xóa, nên hãy lưu dự án trước nếu bạn có thể cần các điểm cũ. Để gộp hai tệp, hãy ghép chúng trong trình soạn thảo văn bản hoặc bảng tính trước khi nhập (chú ý các số hiệu điểm trùng nhau).

Các điểm chưa thể di chuyển, sửa hoặc xóa trong CivilCraft. Hãy sửa chúng trong tệp và nhập lại.

## Liên quan

- [Định dạng tệp điểm](topic:point-file-formats): mọi thứ tự cột và cách nhận diện tiêu đề.
- [Dựng và tinh chỉnh bề mặt](topic:build-surface).
