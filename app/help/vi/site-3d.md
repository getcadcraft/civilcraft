---
title: Xem công trường trong 3D
summary: Mở khung nhìn 3D, xoay, di chuyển và thu phóng, đặt độ phóng đại đứng và màu sắc, chọn những gì hiển thị, và nhấp vào tuyến, nền, đường đặc trưng, đường ngắt, ống, công trình và điểm để chọn chúng.
keywords: nhãn, nhãn 3d, bảng hiệu, nhãn hướng về camera, nhãn cọc, nhãn đường đồng mức, nhãn điểm, phủ, ảnh chụp từ trên cao, lớp bản đồ trên bề mặt, 3d, ba chiều, khung nhìn 3d, khối xem, la bàn, xoay, phối cảnh, song song, đẳng cự, iso, phóng đại đứng, địa hình, mô hình, mô hình công trường, bay quanh, trực quan hóa, kết xuất, ống trong 3d, công trình, ống 3d, hành lang 3d, mặt đường trong 3d, làn đường, bó vỉa, vỉa hè, cây trong 3d, cây bụi, hàng rào, cảnh quan 3d, dốc trong 3d, bậc thang, tường, lát nền, cứng hóa 3d
from: a16bafe1
---

Khung nhìn 3D hiển thị công trường như một mô hình: địa hình hiện trạng và bề mặt đã san, các đường đồng mức phủ lên chúng, đường ngắt và mép bề mặt, mỗi tuyến trên trắc dọc thiết kế của nó với các vạch cọc, các đường đặc trưng của hành lang và chính con đường (làn, lề, rãnh, bó vỉa, dải và vỉa hè, mỗi cái có màu riêng), các nền với đường giao với mặt đất, mạng ống với ống và công trình ở cao độ thật, và từ không gian làm việc Cảnh quan là cây, lát nền, lối đi, tường, bó vỉa, dốc và bậc thang. Nó đọc cùng dự án như bình đồ, nên mọi chỉnh sửa đều hiện ở cả hai.

## Mở khung nhìn 3D

1. Mở điểm đo (hoặc một tệp LandXML hay dự án) để có bề mặt. Chỉ riêng cây, lát nền hoặc dốc cũng đủ để mở nó.
2. Nhấn {{key:D}}, hoặc nhấp {{ui:3D}} trong nhóm {{ui:View}} trên thanh công cụ.
   Khung nhìn 3D mở ra trên bình đồ, nhìn toàn bộ công trường từ phía đông nam. Lần đầu, nó mất một chút thời gian để tải.
3. Nhấn {{key:D}} lần nữa, hoặc nhấp {{ui:3D}} lần nữa, để quay lại bình đồ. Chọn một công cụ vẽ như {{ui:Alignment}} hoặc {{ui:Pad}} cũng đưa bạn về bình đồ, vì việc vẽ diễn ra ở đó.

## Di chuyển xung quanh

| Để | Làm như sau |
|---|---|
| Xoay | Kéo bằng nút trái hoặc nút giữa |
| Di chuyển khung nhìn | Kéo bằng nút phải, hoặc giữ {{key:Shift}} và kéo |
| Thu phóng | Lăn bánh xe; nó thu phóng về phía con trỏ |
| Xoay trên bàn di chuột | Vuốt bằng hai ngón ({{key:Shift}} và vuốt để di chuyển khung nhìn) |
| Thu phóng trên bàn di chuột | Chụm ngón tay |
| Cảm ứng | Một ngón xoay; hai ngón chụm để thu phóng và kéo để di chuyển |
| Phím (khung nhìn đang có tiêu điểm) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} xoay, với {{key:Shift}} thì di chuyển; {{key:Plus}} và {{key:Minus}} thu phóng |

Thanh phía trên khung nhìn có phần còn lại:

- Danh sách khung nhìn: **Iso**, **Top**, **Bottom**, **Front** (nhìn về phía bắc), **Back**, **Left**, **Right**.
- {{ui:Perspective}}: khi được nhấn là khung nhìn phối cảnh; nhấp để chuyển sang phép chiếu song song (không có co ngắn).
- {{ui:Extents}}: hiển thị lại mọi thứ. {{key:F}} làm điều tương tự khi khung nhìn 3D đang mở.

## Khối xem

Khối xem ở góc trên bên phải xoay theo khung nhìn. Nhấp một mặt, cạnh hoặc góc để nhìn công trường từ đó (camera xoay mượt trừ khi hệ thống của bạn yêu cầu giảm chuyển động). Kéo khối để xoay quanh. Vành la bàn bên dưới nó cho thấy bắc (bắc lưới, +Y): kéo vành để xoay công trường quanh trục đứng, hoặc nhấp N, E, S hoặc W để nhìn từ phía đó. {{ui:Home}}, biểu tượng ngôi nhà nhỏ ở góc trên bên trái, đưa bạn về khung nhìn đẳng cự của toàn bộ công trường. Bằng bàn phím: {{key:Tab}} đến khối, các mũi tên chọn một mặt, cạnh hoặc góc, {{key:Enter}} nhìn từ đó.

Trên bình đồ, cùng khối này hiển thị mặt trên. Nhấp vào bất kỳ mặt, cạnh hoặc góc nào khác (hoặc kéo nó) để mở khung nhìn 3D nhìn từ đó: đây là cách nhanh nhất để vào 3D từ một hướng nhất định. Để thay khối bằng một biểu tượng trục nhỏ, hoặc ẩn nó, xem **Chỉ báo góc** trong [Cài đặt CivilCraft](topic:settings).

## Phóng đại độ cao

Công trường thường rộng hơn nhiều so với cao, nên độ cao được kéo giãn **2×** ban đầu. Chọn **1×**, **2×**, **3×**, **5×** hoặc **10×** trong danh sách trên thanh, hoặc dưới **Phóng đại đứng 3D** trong [Cài đặt CivilCraft](topic:settings) (hai cái là một cài đặt). Chỉ khung nhìn thay đổi: khối lượng, trắc dọc và các bản xuất giữ tỷ lệ thật.

## Tô màu bề mặt

- **Dải cao độ**: cùng các dải và màu như dải cao độ của bình đồ (số dải được đặt dưới **Hiển thị** trong bảng bên trái). Mỗi cạnh của dải được cắt đúng tại cao độ của nó.
- **Một màu**: địa hình hiện trạng và bề mặt đã san, mỗi cái một màu trơn.
- **Lớp bản đồ**: các lớp bản đồ hiển thị dưới bình đồ (một ảnh có tọa độ, ô bản đồ hoặc dịch vụ bản đồ; xem [Lớp bản đồ](topic:map-layers)) phủ lên các bề mặt như một tấm, nên một ảnh chụp từ trên cao hiển thị trên các ngọn đồi. Các ảnh còn đang tải sẽ được điền dần khi đến. Khi không có lớp bản đồ nào hiển thị, các bề mặt giữ dải cao độ của chúng và khung nhìn thông báo điều đó. Ảnh chỉ dùng cho màn hình: các bản xuất GLB và OBJ không mang theo nó.

Khi cả hai bề mặt được hiển thị, địa hình hiện trạng trong suốt trên bề mặt đã san, nên bạn có thể thấy phần đào (địa hình ở trên thiết kế) và phần đắp.

## Chọn những gì hiển thị

Nhấp {{ui:Show}} trên thanh rồi đánh dấu hoặc bỏ đánh dấu:

| Mục | Nội dung |
|---|---|
| Địa hình hiện trạng | Bề mặt được dựng từ điểm đo (hoặc đọc từ LandXML) |
| Bề mặt đã san | Địa hình hiện trạng với các hành lang và nền đã san vào (chỉ khi có) |
| Cạnh tam giác | Mọi cạnh TIN, dưới dạng đường |
| Đường đồng mức | Đường đồng mức phụ và chính của mỗi bề mặt được hiển thị, theo khoảng cách của bình đồ |
| Mép bề mặt | Mép ngoài của mỗi bề mặt được hiển thị, tại cao độ của nó |
| Đường ngắt | Mọi đường ngắt, tại cao độ của chúng |
| Tuyến và cọc | Mỗi tuyến trên trắc dọc thiết kế (trên mặt đất nếu không có trắc dọc), với các vạch mỗi 50 ft hoặc 20 m |
| Đường đặc trưng hành lang | Mép mặt đường, lề và đường giao với mặt đất ở cả hai bên |
| Mặt đường | Con đường mỗi hành lang dựng, từ mặt cắt của nó: làn, lề, rãnh, bó vỉa, dải và vỉa hè, mỗi cái một màu riêng, trên bề mặt đã san |
| Cây | Mọi cây, và các cây trong bồn và hàng rào, dưới dạng hình đơn giản theo kích thước từ danh sách cây: cây là một thân và một tán tròn (hình nón với cây lá kim, một chùm lá trên thân cao với cây cọ), cây bụi, cây hàng rào, cây lâu năm và cây phủ đất là các mái vòm, cỏ là các chùm, cây leo là các cột mảnh. Chúng đứng trên bề mặt đã san (hoặc địa hình hiện trạng) với kích thước mà bình đồ hiển thị: trưởng thành, hoặc lúc trồng |
| Cứng hóa | Lát nền và lối đi với độ dốc của chúng, tường, bó vỉa, bậc thang, và dốc leo thành từng đoạn với chiếu nghỉ giữa chúng |
| Nền và đường giao với mặt đất | Đường bao mỗi nền tại cao độ của nó và đường giao với mặt đất của nó |
| Ống và công trình | Ống như ống tròn giữa đáy trong của chúng, công trình từ miệng xuống hố thu |
| Điểm đo | Một chấm tại mỗi điểm có cao độ (ban đầu tắt) |
| Lớp GIS | Các lớp GIS hiển thị trên bình đồ, theo màu của chúng: đường và đường bao theo cao độ riêng của chúng, các đối tượng khác đặt trên địa hình hiện trạng (chúng bám theo chính xác); điểm là các dấu thập nhỏ. Các hình không có cao độ nằm ngoài bề mặt sẽ bị bỏ qua, và khung nhìn cho biết có bao nhiêu |
| Nhãn | Tên và giá trị luôn hướng về bạn: tên của mỗi tuyến tại điểm đầu và các cọc mỗi 100 ft (hoặc 100 m), cao độ của mỗi đường đồng mức chính, nền, đường đặc trưng và công trình theo tên, và khi **Điểm đo** được đánh dấu thì số và cao độ của mỗi điểm |

Nhãn giữ cùng kích thước và thẳng đứng dù bạn xoay hay thu phóng thế nào, và một ngọn đồi phía trước nhãn sẽ che nó. Khi chúng chen chúc, những nhãn quan trọng nhất hiện ra và phần còn lại chờ đến khi bạn phóng to: tuyến trước, rồi công trình, nền, đường đặc trưng, cọc, đường đồng mức và điểm, các cái gần hơn trước. Chúng chỉ có trên màn hình; các bản xuất và bản in không có chúng.

Các lựa chọn, độ phóng đại và màu sắc của bạn được ghi nhớ trong trình duyệt này.

Một con đường được dựng trên địa hình hiện trạng. Khi có tuyến và hành lang nhưng chưa có điểm đo hay bề mặt, con đường được vẽ trên địa hình tạm phẳng: ở cao độ trung bình của trắc dọc thiết kế, hoặc ngang bằng ở cao độ 0 khi cũng không có trắc dọc. Một cảnh báo ở cuối khung nhìn 3D và trong thuộc tính của hành lang nói điều đó. Đó chỉ là một hình ảnh: không có khối lượng hay mặt cắt nào lấy từ nó. Mở điểm đo hoặc một bề mặt và con đường sẽ tự chuyển sang địa hình thật.

Phóng đại độ cao kéo giãn địa hình, không kéo giãn cây: chúng đứng trên địa hình đã phóng đại ở chiều cao và độ rộng thật, nên một cây trông như một cây ở mọi cài đặt. Cây là các hình đơn giản, không phải mô hình chi tiết: hàng nghìn cây vẫn xoay và thu phóng nhanh.

## Ống và công trình

- Một ống được vẽ với đáy bên trong tại đáy trong bạn đặt và đỉnh bên trong (đỉnh ống) cao hơn một đường kính trong. Đường kính tính bằng inch trên dự án hệ Anh và milimét trên dự án hệ mét, như trong bảng bên phải.
- Một công trình chạy từ miệng của nó (được nhập, hoặc lấy từ mặt đất) xuống hố thu (đáy trong thấp nhất trừ chiều sâu hố thu). Không có đáy trong nào, nó được vẽ sâu 5 ft (1,5 m).
- Ống và công trình có vấn đề (xem kiểm tra mạng trong bảng bên phải) được vẽ bằng màu đỏ.
- Một ống không có đáy trong sẽ không được vẽ; một ghi chú ở cuối khung nhìn cho biết có bao nhiêu.

## Chọn từ khung nhìn 3D

Nhấp một tuyến (hoặc con đường của nó), một nền, một đường đặc trưng, một ống, một công trình, một điểm đo, một cây, một dốc hoặc lát nền khác. Nó được chọn y như khi bạn nhấp trên bình đồ: thuộc tính của nó mở trong bảng bên phải, nơi bạn có thể chỉnh sửa, và nó được vẽ bằng màu chọn lên trên mọi thứ trong 3D. Bất cứ thứ gì bạn chọn trên bình đồ cũng được tô sáng trong 3D. Một gợi ý cạnh con trỏ cho biết bạn vừa nhấp vào gì, cùng tọa độ đông, bắc và cao độ. Ống và công trình có thể nhấp được ngay cả khi chúng nằm dưới đất; một đường bị ngọn đồi che khuất thì không thể nhấp xuyên qua nó.

Nhấp một đường ngắt để xem nó là đường nào: nó được tô sáng, và thanh trạng thái gọi tên nó (đường ngắt không có thuộc tính riêng).

Nhấp vào mặt đất để đọc tọa độ đông, bắc và cao độ tại đó trong gợi ý.

## Lái dọc theo tuyến

Nhấp **Lái** trên thanh 3D và chọn một tuyến. Khung nhìn chuyển đến ghế lái: cách mặt đường 3.5 ft (1,07 m), trên trắc dọc thiết kế của nó (trên địa hình hiện trạng dọc theo đường tâm khi nó chưa có trắc dọc), nhìn về phía trước dọc theo tuyến.

- **Phát** hoặc {{key:Space}} lái với tốc độ bạn chọn (10 đến 65 mph, hoặc 15 đến 100 km/h); {{key:Space}} lần nữa để tạm dừng. Nó dừng ở cuối; **Phát** khi đó bắt đầu lại từ đầu.
- Thanh trượt nhảy đến bất kỳ cọc nào; {{key:Left}} và {{key:Right}} lùi và tiến 10 ft (5 m).
- Kéo trong khung nhìn sẽ tạm dừng và cho phép bạn nhìn xung quanh.
- **Dừng** hoặc {{key:Esc}} đưa khung nhìn về vị trí cũ.

Độ phóng đại đứng cũng áp dụng khi lái: đặt nó ở 1× để thấy con đường như sẽ được xây dựng.

## Ánh sáng từ mặt trời

Mở **Mặt trời** trên thanh 3D và đánh dấu **Chiếu sáng từ mặt trời**. Nhập một ngày, giờ trên đồng hồ và múi giờ của nó (độ lệch so với UTC: vào mùa hè, là múi giờ có tiết kiệm ánh sáng ban ngày), cùng vĩ độ và kinh độ của công trường. Khi dự án có hệ tọa độ, chúng được điền tự động từ đó.

Công trường khi đó được chiếu sáng từ vị trí mặt trời, với **Bóng đổ** trên mặt đất, hành lang và các nền; menu cho biết phương vị của mặt trời và độ cao của nó, hoặc cho biết nó nằm dưới đường chân trời. Vị trí được tính theo các phương trình thiên văn của NOAA. Bóng đổ đúng hướng ở mọi độ phóng đại, nhưng chúng dừng ở mép công trường: đồi và tòa nhà vượt ra ngoài mép đó không đổ bóng.

## Xuất khung nhìn 3D

Nhấp {{ui:GLB}} hoặc {{ui:OBJ}} trên thanh. Những gì khung nhìn hiển thị được lưu, ở tỷ lệ thật (không phóng đại), tính bằng mét, với Y hướng lên. Chi tiết: [Xuất công trường ra 3D](topic:export-3d).
