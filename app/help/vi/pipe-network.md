---
title: Bố trí mạng ống tự chảy
summary: Vẽ các tuyến ống thoát nước mưa hoặc nước thải theo từng công trình, đặt quy tắc độ dốc, độ che phủ và độ sụt, để CivilCraft đặt cao độ đáy, và sửa các vấn đề nó liệt kê.
keywords: trình tạo công trình, loại công trình, công trình hình chữ nhật, hố ga, khung, nắp, độ dày thành, mục thư viện, mạng ống, thoát nước mưa, nước thải, cống, công trình, cửa thu, cao độ đáy, độ che phủ, độ dốc, độ sụt, miệng, hố thu, ống tự chảy
from: 10a3c14d
---

Một dự án chứa một mạng ống tự chảy, thoát nước mưa hoặc nước thải. Nó gồm các công trình (hố ga, cửa thu) và các ống thẳng giữa chúng. Dòng chảy đi theo hướng bạn vẽ. CivilCraft kiểm tra mọi ống và công trình theo ba quy tắc bạn đặt, và có thể đặt mọi cao độ đáy từ các quy tắc đó.

## Vẽ một tuyến

Bạn có thể vẽ ống mà không có bề mặt, nhưng miệng, độ che phủ và cao độ đáy tự động cần có bề mặt.

1. Nhấn {{key:P}}, hoặc nhấn {{ui:Ống}} trong nhóm **Thiết kế**.
   Gợi ý ghi: "Ống: nhấn các công trình từ đầu tuyến xuống hạ lưu (nhấn một công trình có sẵn để nối). Enter để kết thúc."
2. Nhấn nơi đặt công trình thượng lưu. Một công trình được đặt.
3. Nhấn từng công trình tiếp theo về phía hạ lưu. Để nối với công trình đã có, nhấn vào nó: thanh trạng thái ghi "Đã nối S3."
4. Nhấn {{key:Enter}}.
   Các ống được vẽ, cao độ đáy được đặt theo quy tắc, và thanh trạng thái ghi, ví dụ, "Đã vẽ 3 ống, đã đặt 12 cao độ đáy theo quy tắc; mọi kiểm tra đều đạt."

Công trình mới được đặt tên S1, S2 … với đường kính 48 in (1200 mm). Ống mới được đặt tên P1, P2 … với đường kính 12 in (300 mm). Đường kính tính bằng inch trong dự án theo feet và bằng milimét trong dự án theo mét.

Kết thúc bằng {{key:Enter}}. Nhấp đúp cũng được, nhưng khi bạn nhấp đúp vào một công trình có sẵn để kết thúc tuyến ở đó, phần nối bị bỏ: hãy nhấn một lần, rồi nhấn {{key:Enter}}.

## Đặt quy tắc

Khi không chọn gì, bảng bên phải (**Dự án**) có một khối **Mạng ống**:

| Cài đặt | Giá trị khởi đầu | Ý nghĩa |
|---|---|---|
| Loại | Thoát nước mưa | {{ui:Thoát nước mưa}} hoặc {{ui:Thoát nước thải}}; được ghi vào LandXML |
| Độ dốc tối thiểu | 0.50% | Mọi ống phải dốc xuống ít nhất bằng mức này |
| Độ che phủ tối thiểu | 2 ft (0.6 m) | Từ mặt đất đến đỉnh ống, dọc theo toàn bộ ống |
| Độ sụt trong công trình | 0.10 ft (0.03 m) | Cao độ đáy ra phải thấp hơn mọi cao độ đáy vào ít nhất bằng khoảng này |

**Các giá trị khởi đầu này chỉ là giá trị giữ chỗ, không phải tiêu chuẩn.** Hãy đặt các giá trị mà cơ quan hoặc dự án của bạn yêu cầu. Độ che phủ được đo từ mặt đất đến đỉnh (cao độ đáy cộng đường kính trong); chiều dày thành không được tính. Ở nơi nền hoặc hành lang đã được san, bề mặt đã san là mặt đất.

## Để CivilCraft đặt cao độ đáy

- {{ui:Đặt mọi cao độ đáy theo quy tắc}} (trong khối **Mạng ống**) đặt cho mọi ống.
- {{ui:Đặt cao độ đáy theo quy tắc}} (khi chọn một ống) chỉ đặt cho ống đó.

Đi theo hướng xuôi dòng, mỗi tuyến bắt đầu với độ che phủ tối thiểu tại công trình đầu, dốc ít nhất bằng độ dốc tối thiểu, hạ ít nhất phần độ sụt qua mỗi công trình, và đi sâu hơn ở bất kỳ chỗ nào mà mặt đất dọc theo ống sẽ để lại độ che phủ nhỏ hơn mức tối thiểu. Cao độ đáy được làm tròn xuống 0.01, không bao giờ làm tròn lên. Thanh trạng thái ghi "Đã đặt cao độ đáy: độ che phủ tối thiểu tại đầu mỗi tuyến, ít nhất độ dốc tối thiểu, ít nhất độ sụt trong mỗi công trình." hoặc nêu điều nó không làm được.

## Sửa công trình và ống

Nhấn một công trình hoặc ống bằng {{ui:Chọn}} để xem nó trong bảng bên phải.

**Công trình**: **Tên**, **Miệng**, **Độ sâu hố thu**, **Đường kính**, rồi **Miệng đã dùng**, **Hố thu**, **Đông** và **Bắc**, và các ống vào và ra cùng cao độ đáy của chúng.

- Để trống **Miệng** để lấy từ bề mặt; khi đó ô hiển thị giá trị bề mặt màu xám. Nhập một giá trị để cố định miệng.
- Kéo tay cầm của công trình trên mặt bằng để di chuyển nó. Các ống của nó đi theo; cao độ đáy giữ nguyên, nên hãy kiểm tra các vấn đề sau đó.

**Loại**: chọn một trong các loại công trình của mạng (bên dưới), hoặc không có để có một công trình tròn với đường kính riêng.

**Ống**: **Tên**, các công trình nó nối giữa, **Đường kính**, **Cao độ đáy trên**, **Cao độ đáy dưới**, rồi **Chiều dài**, **Độ dốc** và **Độ che phủ tối thiểu**.

Nhấn {{key:Enter}} sau mỗi giá trị.

## Đọc và sửa vấn đề

Khối **Mạng ống** liệt kê mọi vấn đề (tối đa 40); nhấn một vấn đề để chọn ống hoặc công trình. Một ống hoặc công trình được chọn liệt kê vấn đề của riêng nó. Khi không chọn gì, khối ghi "Mọi ống và công trình đều đạt quy tắc."

| Thông báo (ví dụ) | Làm gì |
|---|---|
| "P2 chảy ngược dốc (-0.40%)." hoặc "… chảy phẳng …" | Đổi cao độ đáy, hoặc đặt chúng theo quy tắc. |
| "P2 ở 0.30% thoải hơn mức tối thiểu 0.50%." | Hạ cao độ đáy hạ lưu hoặc nâng cao độ đáy thượng lưu. |
| "P3 có 1.40 độ che phủ dọc theo nó, nhỏ hơn mức tối thiểu 2." | Hạ ống; đặt cao độ đáy theo quy tắc. |
| "Trong S3, P4 rời đi ở 245.20, thấp hơn 0.1 so với P3 đi vào ở 245.25." | Hạ cao độ đáy trên của ống ra. |
| "Đỉnh của P1 cao hơn miệng của S1." | Ống quá cao so với công trình. |
| "S2 có 2 ống đi ra khỏi nó; mạng thoát nước tự chảy chỉ nên có một lối ra khỏi mỗi công trình." | Xóa một ống đi ra, hoặc vẽ lại theo đúng hướng. |
| "Các ống tạo thành vòng; dòng chảy phải kết thúc tại một cửa ra." | Một tuyến đã bị vẽ quay lại chính nó; xóa một ống. |
| "S5 nằm ngoài bề mặt và không có cao độ miệng." | Nhập một miệng, hoặc di chuyển công trình lên bề mặt. |
| "P6 nằm một phần ngoài bề mặt; độ che phủ tại đó chưa biết." | Mở rộng bề mặt, hoặc chấp nhận rằng độ che phủ ở đó không được kiểm tra. |
| "P7 chưa có cao độ đáy." | Nhập chúng, hoặc đặt chúng theo quy tắc. |

Ống và công trình có vấn đề cũng được đánh dấu màu đỏ trên mặt bằng.

## Loại công trình

Một loại công trình là một công trình được tạo từ tham số: hố ga, cửa thu, hộp nối hoặc cửa ra, **tròn** (đường kính trong) hoặc **chữ nhật** (chiều rộng và chiều dài trong), với **chiều dày thành**, **sàn**, một **hố thu** dưới ống thấp nhất, và một **khung và nắp** (lỗ tròn hoặc chữ nhật, chiều cao khung). Các loại thuộc về mạng, dưới **Loại công trình** trong Thuộc tính của dự án.

1. Nhấn {{ui:Loại công trình mới}}. Hộp thoại vẽ công trình trên mặt bằng và mặt cắt khi bạn gõ.
2. Nhấn {{ui:Thêm loại}}.
3. Chọn một công trình và chọn loại dưới **Loại**. Nó lấy kích thước và hố thu của loại; hố thu riêng vẫn có thể đổi.

Sửa một loại và mọi công trình thuộc loại đó theo kích thước của nó. Xóa một loại và các công trình của nó vẫn là công trình tròn cùng chiều rộng. Mỗi thay đổi là một bước: {{key:Mod+Z}} hoàn tác.

Một công trình chữ nhật được vẽ trên mặt bằng, trong DXF, DWG và PDF, và trong 3D là một hình chữ nhật với chiều dài dọc theo ống ra của nó; ống bắt đầu tại thành của nó. LandXML ghi nó như một công trình chữ nhật (`RectStruct`) với chiều dày thành, và đọc các công trình như vậy trở lại thành loại.

### Chia sẻ một loại qua thư viện

{{ui:Lưu thành mục thư viện}} ghi loại thành một mục thư viện CadCraft (tệp `.json`): ký hiệu mặt bằng, khối 3D tới độ sâu điển hình, và mọi kích thước. Tải nó lên thư viện để chia sẻ. {{ui:Mở mục thư viện}} đọc một công trình đã lưu theo cách này trở lại mạng, được chuyển sang đơn vị của dự án. Các mục thư viện không phải công trình được tạo trong CivilCraft sẽ bị từ chối, kèm lý do.

## Xóa

Chọn một ống và nhấn {{key:Delete}} để xóa nó. Xóa một công trình cũng xóa các ống nối với nó. Trên Mac, nhấn Fn và Delete, hoặc nhấn {{ui:Xóa}}.

## Chưa xây dựng

Lưu lượng, kích thước ống và đường năng lượng thủy lực nằm trong [Thoát nước mưa](topic:storm-drainage). Danh mục ống, ống không tròn, ống trong khung nhìn trắc dọc, ống cong và nhiều hơn một mạng cho mỗi dự án chưa có. Xem [Chưa xây dựng](topic:not-built-yet).
