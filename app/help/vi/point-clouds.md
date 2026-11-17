---
title: Đám điểm từ máy bay không người lái hoặc máy quét
summary: Với tiện ích bổ sung Đám điểm, mở tệp LAS hoặc LAZ có hàng triệu điểm, xem toàn bộ, làm sạch, phân loại thành mặt đất, thảm thực vật và công trình, rồi dựng mặt đất, đường đồng mức và khối lượng từ đó.
keywords: đám điểm, las, laz, máy bay không người lái, trắc lượng ảnh, recap, lidar, quét, mặt đất, phân loại, nhiễu, đống vật liệu, khối lượng, đào đắp, đường đồng mức, đường ngắt, eye-dome, orthomosaic, ortho, phủ, lớp bản đồ, xuất las, xuất laz, nén
from: e4a4901f
---

Hầu hết người dùng không cần tính năng này, nên nó là một tiện ích bổ sung. Bật {{ui:Đám điểm}} trong Cài đặt › Tiện ích bổ sung; một thẻ {{ui:Đám điểm}} sẽ xuất hiện trong bảng bên phải. Tệp được đọc trong trình duyệt của bạn và được cắt thành các ô (tile) lưu trong bộ nhớ riêng của trình duyệt (hoặc một thư mục bạn chọn). **Không có gì được tải lên.**

:::warning
Mọi thứ thẻ này báo cáo chỉ là một con số lấy từ dữ liệu của bạn, không phải chứng nhận. Nó được kiểm thử trên một công trường giả lập, chưa phải trên một khảo sát máy bay không người lái thực tế: hãy đọc các kết quả đầu tiên một cách thận trọng và cho chúng tôi biết bạn thấy gì. Người hành nghề đã đăng ký quyết định mặt đất, đường đồng mức và khối lượng có giá trị đến đâu.
:::

## Mở đám điểm

Dưới {{ui:Mở đám điểm}}, chọn một tệp LAS hoặc LAZ. Thẻ cho biết tệp có bao nhiêu điểm, hệ tọa độ và đơn vị, cùng dung lượng cần cho việc dựng; nhấn {{ui:Dựng đám điểm}}. Việc dựng có thể dừng lại và tiếp tục bằng {{ui:Tiếp tục}} (chọn lại đúng tệp đó). Tệp không bao giờ bị thay đổi. Một tệp 100 triệu điểm được dựng trong vài phút trên máy trạm và cần dung lượng gần bằng chính tệp đó.

Dưới {{ui:Đám điểm trên máy tính này}}, bạn mở hoặc xóa một đám điểm. {{ui:Giữ đám điểm trong một thư mục…}} (Chrome, Edge và ứng dụng CadCraft Studio) giữ các ô trong thư mục bạn chọn, ví dụ một thư mục đám điểm CadCraft trong Tài liệu, nên một đám điểm 10 GB không cần vừa với bộ nhớ của trình duyệt; các đám điểm đã dựng trước đó vẫn ở nơi chúng được dựng. Sau khi khởi động lại, trình duyệt sẽ hỏi quyền truy cập lần nữa: nhấn {{ui:Dùng lại thư mục …}}.

## Xem đám điểm

{{ui:Xem trong 3D}} vẽ đám điểm từ các ô thô và tinh chỉnh khi bạn tiến lại gần, không bao giờ vượt quá {{ui:Số điểm vẽ tối đa}} cùng lúc (2.5 triệu; 500 nghìn trên điện thoại). Tô màu theo màu của chính tệp, theo chiều cao, phân loại, cường độ hoặc số hiệu chỉnh. {{ui:Chiếu sáng eye-dome}} tạo bóng cạnh theo độ sâu để hình dạng dễ đọc mà không cần pháp tuyến (tắt trên điện thoại); {{ui:Điểm nhỏ dần theo khoảng cách}} làm các điểm xa nhỏ hơn và các điểm gần lớn hơn; {{ui:Kích thước điểm}} đặt kích thước. Mặt bằng hiển thị đám điểm dưới dạng raster bên dưới bản vẽ của bạn và **tinh chỉnh khi bạn phóng to** vào một phần của nó.

## Làm sạch

Dưới {{ui:Làm sạch}}, vẽ một lasso, một hộp hoặc một đa giác trên mặt bằng (hoặc trong 3D từ góc nhìn từ trên: trong 3D đường viền được chiếu thẳng xuống, nên chỉ chính xác khi nhìn từ trên). Thẻ hiển thị có bao nhiêu điểm nằm bên trong **trước** khi bạn áp dụng: {{ui:Xóa các điểm này}}, {{ui:Đổi phân loại}}, {{ui:Khôi phục điểm đã xóa}} hoặc {{ui:Cắt theo ranh giới này}}. {{ui:Hoàn tác}} và {{ui:Làm lại}} đi qua nhật ký chỉnh sửa; tệp gốc không bao giờ bị thay đổi. {{ui:Bộ lọc nhiễu…}} đánh dấu các điểm lạc là điểm thấp (phân loại 7) hoặc nhiễu cao (phân loại 18).

## Phân loại

{{ui:Tìm mặt đất}} làm việc theo từng ô và đánh dấu mặt đất (phân loại 2) và các điểm thấp; dung sai là 0.15 m, hoặc 0.08 m khi bật công tắc cấp khảo sát. Nó báo cáo các mối nối ô không khớp nhau. {{ui:Phân loại thảm thực vật và công trình}} sau đó đánh dấu thảm thực vật thấp, trung bình và cao, cùng công trình, dựa trên chiều cao trên mặt đất và mức độ bằng phẳng của vùng xung quanh. Không có học máy, nên một nhà kho mái bằng dưới tán cây có thể bị phân loại sai: hãy kiểm tra.

## Mặt đất, đường đồng mức, đường ngắt

{{ui:Dựng mặt đất}} tạo mặt đất hiện có từ các điểm mặt đất và thêm nó vào dự án giống như khi nhập LAS (một bước hoàn tác). Sau đó nó so sánh các điểm với mặt đất đó: giá trị trung bình, RMS, phân vị thứ 95, tỷ lệ nằm trong dung sai, và mười vị trí khác biệt nhiều nhất, mỗi vị trí có {{ui:Đến đó}}. Tô màu theo {{ui:Số hiệu chỉnh}} cho thấy nơi mặt đất và đám điểm không khớp nhau.

Một **đường ngắt** (mép bó vỉa, rãnh hoặc đỉnh bờ) được chọn trên đám điểm: {{ui:Chọn đường ngắt trên đám điểm}} trong khung 3D lấy điểm đã vẽ gần nhất tại mỗi lần nhấn, và {{ui:Chọn đường ngắt trên mặt bằng}} lấy điểm đám điểm gần nhất (ưu tiên mặt đất) dưới mỗi lần nhấn; nhấp đúp hoặc nhấn Enter để kết thúc đường. {{ui:Dựng mặt đất}} lần tiếp theo sẽ dùng nó. {{ui:Hiển thị đường đồng mức}} vẽ các đường đồng mức lên đám điểm trong một hình nhỏ và đặt khoảng cách đường đồng mức của dự án.

## Khối lượng

{{ui:Khối lượng đống vật liệu…}} tính khối lượng của bề mặt nằm phía trên một đáy, bên trong một ranh giới bạn vẽ. Vẽ ranh giới trên mặt đất bằng phẳng quanh đống và chọn đáy: điểm thấp nhất của ranh giới, một mặt phẳng, một đáy cong trơn, một bề mặt đi qua ranh giới, hoặc một cao độ bạn gõ. Trên mặt đất dốc hoặc cong, hãy dùng mặt phẳng hoặc đáy cong; điểm thấp nhất sẽ đọc quá cao. Các điểm ranh giới nhô cao hơn những điểm còn lại (một cây nằm trên đường) bị loại khỏi đáy. {{ui:Chuyến bay với chuyến bay}} cho đào và đắp giữa hai đám điểm. Cả hai đều có thể lưu dạng CSV.

## Orthomosaic

Dưới {{ui:Orthomosaic (ảnh từ trên cao)}}, chọn orthomosaic của máy bay không người lái cùng với tệp thế giới và `.prj` khi có: một GeoTIFF, hoặc PNG hay JPEG. Nó trở thành một **lớp bản đồ** của dự án, nên mặt bằng hiển thị nó bên dưới bản vẽ của bạn, và khung 3D (màu {{ui:Bản đồ}}) phủ nó lên mặt đất bạn đã dựng, nên hãy {{ui:Dựng mặt đất}} trước. Thẻ cho biết ảnh phủ bao nhiêu phần của đám điểm, và cảnh báo khi nó không phủ phần nào: nguyên nhân thường gặp là khác hệ tọa độ, nên hãy cung cấp tệp `.prj` đi kèm. Khi không có `.prj`, chương trình sẽ hỏi tọa độ nằm ở đâu. Ảnh được giữ bên trong tệp dự án; một GeoTIFF trên 200 MB bị từ chối và một ảnh ghép rất lớn được giảm xuống 16 megapixel, nên với một khảo sát lớn, hãy cắt ảnh ghép theo công trường trước.

## Xuất

{{ui:Xuất}} ghi đám điểm đã làm sạch và phân loại thành một tệp mới (tất cả các điểm, các phân loại đã làm sạch, hoặc chỉ mặt đất). Dưới {{ui:Loại tệp}}, chọn:

- **LAS 1.4 (không nén)**: định dạng điểm 6, hoặc 7 nếu có màu.
- **LAZ (nén)**: cùng các điểm được nén không mất dữ liệu, nên mọi điểm được khôi phục chính xác. Nó được ghi dưới định dạng điểm 0, hoặc 2 nếu có màu, trong tệp LAS 1.4. Trên công trường 300 m giả lập, LAZ có kích thước khoảng một phần năm tệp LAS 1.4. Các định dạng LAZ 0 và 2 chỉ giữ phân loại từ 0 đến 31: một điểm có phân loại cao hơn sẽ bị từ chối kèm thông báo, nên hãy xuất đám điểm đó dưới dạng LAS 1.4.

LAZ được ghi bởi bộ nén riêng của CadCraft, xây dựng từ đặc tả LAZ đã công bố. Chúng tôi đã kiểm tra rằng trình đọc của chính chúng tôi và hai trình đọc LAZ độc lập (laz-perf, mà ứng dụng dùng để mở tệp LAZ, và laspy với lazrs) đều đọc lại chính xác từng điểm, và rằng các tệp LAZ do laspy tạo ra cho kết quả giống hệt từng byte khi chúng tôi ghi lại các điểm của chúng. Các chương trình khác chưa được thử, nên nếu một chương trình không mở được tệp, hãy cho chúng tôi biết là chương trình nào.

Khi trình duyệt có thể ghi tệp trong lúc xử lý, bạn chọn tệp trước và một đám điểm rất lớn sẽ được ghi vào đó từng ô một thay vì được gom trong bộ nhớ; nếu không, tệp được gom lại và tải xuống, điều này vẫn ổn đến vài trăm megabyte.

## Những gì nó không làm

Nó chỉ đọc LAS và LAZ (E57, PLY và PCD chưa được nối vào thẻ này, và nhiều tệp của cùng một chuyến bay chưa được ghép lại), không chiếu lại đám điểm (hệ và mét của dự án được giả định), không đọc tệp RCP hoặc RCS của Autodesk, không tạo mặt từ ảnh chụp, và không tự tìm cột, bó vỉa hay đường ống.
