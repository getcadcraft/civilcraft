---
title: Chọn, sao chép và dán điểm đo
summary: Chọn điểm đo bằng cách nhấp, Shift và khung, hoặc tất cả cùng lúc; sao chép, cắt, dán, dán tại chỗ, nhân bản và xóa chúng với số hiệu điểm mới không bao giờ trùng; dán các hàng điểm đến và từ bảng tính.
keywords: sao chép, dán, cắt, nhân bản, xóa điểm, chọn điểm, chọn tất cả, chọn khung, cửa sổ, bộ nhớ tạm, bảng tính, csv, đánh số lại, số hiệu điểm, dán tại chỗ, bản sao, bố trí cọc
from: 78a6aea7
---

Điểm đo có thể được sao chép và dán trong một dự án, giữa các dự án ở hai thẻ trình duyệt, và đến và đi từ bảng tính. Mọi thay đổi là một bước hoàn tác, và bề mặt được dựng lại ngay từ các điểm mới.

## Chọn điểm

Với {{ui:Chọn}} ({{key:V}}):

- **Nhấp** một điểm để chọn nó (và chỉ nó). Các số của nó hiển thị dưới **Thuộc tính**.
- {{key:Shift}} và **nhấp** để thêm một điểm vào vùng chọn, hoặc bỏ nó ra.
- {{key:Shift}} và **kéo** để vẽ một khung: các điểm bên trong được thêm vào vùng chọn. Kéo quanh các điểm thay vì vậy thì nó thành lasso; xem [Chọn lasso điểm đo](topic:lasso-selection). Kéo không kèm {{key:Shift}} thì di chuyển khung nhìn, như thường lệ.
- {{key:Mod+A}} (hoặc {{ui:Thêm}} › {{ui:Chọn tất cả các điểm}}) chọn mọi điểm.
- {{key:Esc}} (hoặc {{ui:Thêm}} › {{ui:Bỏ chọn}}) xóa vùng chọn.

Điểm được chọn có một vòng tròn. Khi chọn nhiều hơn một, **Thuộc tính** hiển thị số lượng, số hiệu, khoảng cao độ và các nhóm của chúng.

## Sao chép, cắt và xóa

- {{ui:Sao chép}} hoặc {{key:Mod+C}} sao chép các điểm đã chọn. CivilCraft giữ bản sao, và cũng đặt nó lên bộ nhớ tạm của hệ thống dưới dạng hàng điểm, để bạn dán thẳng vào bảng tính hoặc tệp văn bản.
- {{ui:Thêm}} › {{ui:Cắt}} hoặc {{key:Mod+X}} sao chép rồi xóa chúng, trong một bước.
- {{ui:Thêm}} › {{ui:Xóa}} hoặc {{key:Delete}} xóa chúng. {{key:Mod+Z}} đưa chúng trở lại.

Các hàng gồm: điểm, bắc, đông, cao độ, mô tả (P,N,E,Z,D), phân tách bằng dấu phẩy, với ba chữ số thập phân. Để đông đứng trước bắc, đặt **Hàng điểm** trong [Cài đặt CivilCraft](topic:settings). Một mô tả mà bảng tính sẽ coi là công thức (bắt đầu bằng =, +, - hoặc @) được thêm dấu nháy đơn phía trước, để nó vẫn là văn bản.

## Dán

1. Nhấn {{key:Mod+V}} hoặc nhấp {{ui:Dán}}. Các điểm đi theo con trỏ dưới dạng chữ thập nhỏ, với một đường chấm nối về nơi chúng xuất phát.
2. Nhấp nơi chúng sẽ đến. Phần giữa các điểm đã sao chép rơi vào điểm nhấp.
3. Hoặc nhấn {{key:Enter}} để đặt chúng theo tọa độ riêng, hoặc {{key:Esc}} để hủy.

{{ui:Thêm}} › {{ui:Dán tại chỗ}} hoặc {{key:Mod+Shift+V}} dán ngay tại tọa độ riêng của các điểm. Các điểm đã dán sau đó được chọn, để bạn có thể sao chép, di chuyển hoặc xóa lại.

:::note
Nhấp {{ui:Dán}} trên thanh công cụ đọc bộ nhớ tạm của hệ thống. Lần đầu, trình duyệt có thể hỏi liệu CivilCraft có được xem bộ nhớ tạm không. Nếu bạn từ chối, nút trên thanh công cụ chỉ dán bản sao riêng của CivilCraft; {{key:Mod+V}} vẫn dán các hàng từ bảng tính mà không hỏi.
:::

## Số hiệu điểm không bao giờ trùng

Hai điểm không bao giờ có chung số hiệu. Khi bạn dán:

- Điểm đã dán giữ số hiệu của nó khi không điểm nào trong dự án có số đó. Vì vậy sau **Cắt**, các điểm dán lại với số hiệu riêng, và các điểm sao chép từ dự án khác giữ số của chúng nếu còn trống.
- Điểm đã dán có số hiệu bị chiếm sẽ nhận một số nguyên mới: cao hơn số lớn nhất đang dùng một đơn vị, đếm tiếp lên.
- Thanh trạng thái cho biết đã xảy ra gì, ví dụ "1 giữ số hiệu; 9 nhận số mới: 10–18 thành 277–285".

Trong [Cài đặt CivilCraft](topic:settings), bạn có thể chọn **Luôn số mới**, và một số để số mới bắt đầu, ví dụ 5000 cho điểm thiết kế.

:::warning
Các nhóm điểm dựng bề mặt như một **đường ngắt** nối các điểm theo thứ tự số hiệu. Bản sao đã dán của các điểm đường ngắt (ví dụ điểm FL) nhận số hiệu mới, cao hơn, và nối vào cuối đường ngắt đó, có thể kèm một bước nhảy dài. Hãy kiểm tra mặt bằng sau khi dán các điểm như vậy, hoặc đặt nhóm của chúng thành {{ui:Điểm}}.
:::

## Nhân bản

{{ui:Thêm}} › {{ui:Nhân bản}} hoặc {{key:Mod+D}} tạo một bản sao của các điểm đã chọn đi theo con trỏ: nhấp nơi nó sẽ đến. Các bản sao luôn nhận số hiệu mới, và bộ nhớ tạm của CivilCraft được giữ nguyên.

## Từ bảng tính hoặc tệp văn bản

Chọn các hàng điểm trong bảng tính (điểm, bắc, đông, cao độ, mô tả) và sao chép. Trong CivilCraft, nhấn {{key:Mod+V}} rồi nhấp nơi chúng sẽ đến, hoặc nhấn {{key:Mod+Shift+V}} để đặt chúng theo tọa độ riêng, thường là điều bạn muốn với dữ liệu khảo sát thực tế.

Các hàng được đọc y như một [tệp điểm](topic:point-file-formats): dấu phẩy, tab hoặc khoảng trắng, và một hàng tiêu đề nếu có. Không có tiêu đề, thứ tự cột lấy từ **Hàng điểm** trong [Cài đặt CivilCraft](topic:settings).

Khi cả hai đều có, CivilCraft quyết định theo cái nào mới hơn: các hàng trên bộ nhớ tạm của hệ thống khác với lần sao chép cuối của CivilCraft là được sao chép sau, nên chúng được dán. Văn bản không chứa điểm nào sẽ bị bỏ qua, và bản sao của CivilCraft được dán thay thế.

## Giữa các dự án và thẻ

Bản sao được giữ trong trình duyệt này, nên một thẻ CivilCraft thứ hai có thể dán nó, ngay cả sau khi thẻ đầu tiên đóng. Các điểm sao chép từ dự án đơn vị mét và dán vào dự án đơn vị feet giữ nguyên số hiệu: không có gì được chuyển đổi, và thanh trạng thái cho biết điều đó.

## Những gì không được sao chép

Hiện chỉ các điểm đo được sao chép. Tuyến, nền, mạng ống, đường ngắt và ranh giới chưa thể sao chép hoặc dán. Dán không thể di chuyển các điểm hiện có: dùng {{ui:Cắt}} rồi dán, hoặc di chuyển từng điểm một ([Chỉnh sửa một điểm đo](topic:edit-points)).
