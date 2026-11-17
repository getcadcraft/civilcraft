---
title: Chưa xây dựng
summary: Những gì bản dựng CivilCraft này chưa làm được, và bạn nên làm gì thay thế hiện nay.
keywords: thiếu, giới hạn, lộ trình, chưa có, đường xoắn ốc, mở rộng, dwg, dxf, cửa thu, lưu giữ, mặt cắt ngang, sẽ có sau, giới hạn
from: a2d970ef
---

CivilCraft vẫn đang ở giai đoạn đầu. Trang này liệt kê những gì bản dựng hiện tại chưa làm, để bạn không tìm kiếm chúng. Không có mục nào ở đây được hứa về thời điểm.

## Điểm

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Thêm tệp điểm thứ hai vào tệp đầu tiên | Ghép các tệp trong trình soạn thảo văn bản hoặc bảng tính trước |
| Xuất tệp văn bản điểm | Xuất LandXML (các điểm được xuất dưới dạng CgPoints), dùng {{ui:Xuất}} GIS (điểm với các trường P, N, E, Z và D), hoặc {{ui:Sao chép}} các điểm vào bảng tính |
| Kiểu nhãn điểm, ký hiệu theo từng khóa mô tả, đường cong (cung) từ mã đường, một tệp khóa mô tả để chia sẻ giữa các dự án | Nhãn hiển thị số, cao độ và mô tả, hoặc ít hơn ([Cài đặt CivilCraft](topic:settings)); các khóa được giữ trong tệp dự án |
| Chuyển đổi đơn vị | Chuyển đổi tệp trước khi nhập; **Đơn vị** chỉ đổi nhãn |

## Bề mặt

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Hơn một bề mặt được dựng từ điểm | Một dự án cho mỗi bề mặt |
| Ẩn các ranh giới (trong) | Dùng **Cạnh ngoài dài nhất** hoặc một ranh giới ngoài |
| Chọn hoặc sửa một đường ngắt đã vẽ | {{key:Mod+Z}}, hoặc {{ui:Gỡ các đường ngắt đã vẽ}} rồi vẽ lại |
| Sửa một bề mặt đọc từ LandXML (đường ngắt, ranh giới) | {{ui:Dựng lại bề mặt từ các điểm}} |
| Sửa bề mặt tạo từ lưới cao độ | Nhập lại lưới với các lựa chọn khác |
| Chuyển đổi bề mặt đọc từ LandXML khi hệ tọa độ thay đổi | {{ui:Dựng lại bề mặt từ các điểm}} trước |
| Nhãn cao độ điểm và giá trị độ dốc | Đọc chúng trên thanh trạng thái, hoặc tô màu bề mặt theo độ dốc bằng **Phân tích độ dốc** trong không gian làm việc Cảnh quan ([San nền cho cảnh quan](topic:landscape-grading#grading-checks)) |

## Tuyến và trắc dọc

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Đường xoắn khác clothoid; đường xoắn giữa hai đường cong (chuyển tiếp phức hợp) | Đường xoắn clothoid ở hai đầu một đường cong có sẵn; các loại khác được nêu tên và bỏ qua khi nhập LandXML |
| Chèn một PI giữa hai PI khác | Vẽ lại tuyến, hoặc gõ lại tọa độ PI |
| Tuyến từ đối tượng, dời, mở rộng | Vẽ bằng các PI |
| Gõ K cho đường cong đứng | Gõ L (K được hiển thị) |
| Đường cong đứng tròn và không đối xứng | Chỉ đường cong parabol đối xứng |
| Hơn một trắc dọc thiết kế cho mỗi tuyến | Một tuyến cho mỗi phương án |
| Phóng to khung nhìn trắc dọc, dải trắc dọc dưới trắc dọc | Khung nhìn trắc dọc vừa với toàn bộ tuyến; in trên [các tờ mặt bằng và trắc dọc](topic:plan-profile-sheets) |
| Mặt cắt trong DWG hoặc LandXML | Tờ mặt cắt dạng PDF; {{ui:CSV}} của diện tích và khối lượng |
| Đường lấy mẫu nghiêng, hoặc có độ rộng khác nhau dọc theo đường | Một độ rộng mỗi bên cho cả tuyến |

## Hành lang

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Dải phân cách, rào chắn và siêu cao làm xoay mẫu | Vẽ chúng như các mẫu ([Mẫu hành lang](topic:corridor-templates)); mẫu theo cọc chưa nhận siêu cao |
| Chuyển đổi dần giữa mẫu của hai vùng (chuyển tiếp, thu hẹp) | Đổi mẫu tại một cọc, hoặc đặt mục tiêu chiều rộng cho một điểm trên đường vẽ làm đoạn thu hẹp |
| Xoay quanh một cạnh, siêu cao trong LandXML | Siêu cao xoay quanh tim tuyến trên đường cong tròn; mở rộng một làn bằng mục tiêu chiều rộng cho một đường đặc trưng |
| Mục tiêu cho mái dốc (đến một đường hoặc một bề mặt), bề mặt hành lang riêng | Mục tiêu di chuyển mép mặt đường và lề ([Hành lang](topic:corridor)); hành lang được san vào bề mặt đề xuất |
| Hành lang xuất dưới dạng LandXML roadways; hai hành lang trên một tuyến trong xuất IFC | Bề mặt đề xuất được xuất |
| Mẫu địa hình làm thay đổi bề mặt đề xuất, trong 3D hoặc trong các mặt cắt | Chúng cho diện tích và khối lượng của từng lớp ([Mẫu địa hình](topic:corridor-templates#terrain-templates)) |
| Đường quét xe với tốc độ, trượt lốp, thời gian đánh lái, rơ-moóc đánh lái hoặc khoảng hở thân xe; thư viện xe thiết kế tiêu chuẩn; đường quét vẽ bằng cách kéo xe | Đường quét xe tốc độ thấp dọc theo đường đặc trưng hoặc tuyến, với kích thước xe của bạn ([Đường quét xe](topic:swept-paths)) |

## San nền và khối lượng

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Bậc thang, đường đặc trưng mở được san vào thiết kế, san đến một đường đặc trưng từ nơi khác | Đóng đường đặc trưng ([Đường đặc trưng](topic:feature-lines)), hoặc dùng nó như đường ngắt của mặt đất hiện trạng |
| Chèn hoặc xóa đỉnh của đường đặc trưng | Vẽ lại đường, hoặc tạo dời bậc thang từ nó |
| Cung trong đường ngắt đã vẽ (qua điểm đo), đường xoắn trong đường đặc trưng | Vẽ đường đặc trưng với cung và dùng nó như đường ngắt của mặt đất hiện trạng |
| San đến một khoảng cách, cao độ hoặc bề mặt khác | Chỉ san lộ ra đến mặt đất hiện trạng |
| Thêm hoặc xóa góc nền | Xóa nền và vẽ lại |
| Khối lượng TIN-đến-TIN (lăng trụ), chọn kích thước ô lưới | Phương pháp lưới, kích thước ô được chọn sẵn |
| Hệ số nở và co, lớp đất mặt, chiều dày mặt đường | Tự áp dụng hệ số cho các số liệu được báo cáo |
| Chi phí vận chuyển miễn phí và vượt mức, vận chuyển giữa các tuyến khác nhau, bãi mượn và bãi thải đặt trên mặt bằng | Biểu đồ khối lượng đất với điểm cân bằng, khối lượng di chuyển và khoảng cách vận chuyển trung bình |

## Mạng ống

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Nhiều hơn một mạng cho mỗi dự án | Dự án riêng cho nước mưa và nước thải |
| Ống nước: chất lượng và tuổi nước, điều khiển theo quy tắc, các loại van khác (điều chỉnh lưu lượng, tiết lưu, duy trì), bơm cấp theo công suất, nhu cầu phụ thuộc áp suất, tùy chọn Darcy–Weisbach, danh mục ống với độ dày thành và cấp áp suất. Phần còn lại của mạng áp lực nằm trong phòng thí nghiệm: [Ống nước](topic:water-mains) | Kiểm tra chúng trong phần mềm cấp nước; lưu lượng thiết kế nước thải nằm trong [Lưu lượng thiết kế nước thải](topic:sanitary-design) |
| Lưu lượng cống theo thời gian (thủy đồ, định tuyến động, lưu trữ, bơm, tràn) | [Lưu lượng thiết kế nước thải](topic:sanitary-design) cho lưu lượng đỉnh ổn định mà bản vẽ thiết kế dùng |
| Khả năng thu của cửa thu, lan tràn rãnh, định tuyến lưu giữ, thủy đồ, tổn thất năng lượng khác ngoài một hệ số tại nút | Kiểm tra trong phần mềm khác; lưu lượng, kích thước và đường năng lượng nằm trong [Thoát nước mưa](topic:storm-drainage) |
| Lưu vực trong bản in PDF, DWG, DXF hoặc LandXML; lưu vực từ bề mặt (đường phân thủy) | Vẽ lưu vực bằng tay; chúng được lưu trong tệp dự án |
| Danh mục ống, ống không tròn, công trình không phải hộp hoặc trụ thẳng đứng (hình nón, bậc, gia cố chân), một loại thoát nước trong thư viện | Loại công trình từ tham số ([Mạng ống](topic:pipe-network)); ống có đường kính |
| Ống trong khung nhìn trắc dọc, ống cong | Đọc cao độ đáy và độ che phủ trong bảng bên phải |

## Thửa đất

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Chia lô theo diện tích hoặc mặt tiền, thửa đất từ các đường xung quanh, quyền đi qua | Vẽ từng thửa theo các góc của nó, hoặc nhập các đoạn ranh |
| Bảng đường cong và bảng đoạn thẳng trên mặt bằng; nhãn kéo bằng tay | Mỗi đoạn được ghi nhãn dọc theo chính nó |
| Thửa đất trong LandXML | Thửa đất được lưu trong tệp dự án và xuất ra PDF, DWG và DXF |

## Đường chuyền

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Điều chỉnh bình phương tối thiểu, quy tắc transit, gán trọng số góc theo khoảng cách | Quy tắc la bàn |
| Góc lệch, góc thiên đỉnh và khoảng cách nghiêng, cao độ theo đo cao lượng giác | Quy về khoảng cách và góc ngang đúng, hoặc phương vị |
| Các điểm đo phụ, tệp dữ liệu thô từ máy thu thập dữ liệu | Nhập các điểm như một tệp điểm |

## Đóng cọc

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Cọc lệch (điểm tham chiếu đặt lùi khỏi cọc), cọc mái dốc tại điểm chạm | Đóng cọc tại các khoảng lệch bạn cần, kể cả vượt qua lề |
| Gửi cọc thẳng sang định dạng riêng của máy thu thập dữ liệu | Tệp CSV mở được trong phần mềm văn phòng của hầu hết máy thu thập dữ liệu |
| Đóng cọc cho ống, nền và thửa đất | Dùng điểm đo gần tuyến, hoặc các đoạn ranh của thửa |

## Tệp và đầu ra

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Văn bản, tô bóng và kích thước từ DWG hoặc DXF; không gian giấy; bản vẽ liên kết (xref); DXF nhị phân | Đường nét từ không gian mô hình được mở ([Mở DWG hoặc DXF làm đường nét](topic:open-dwg-dxf)); mở bản vẽ liên kết riêng |
| Di chuyển nhiều điểm cùng lúc bằng cách kéo | Cắt và dán chúng, hoặc sửa từng điểm một |
| Tờ dọc, khung tên riêng, khung nhìn bạn tự sắp xếp, tờ mặt bằng và trắc dọc trong DWG | Một tờ mặt bằng ngang cho mỗi PDF, hoặc các tờ mặt bằng và trắc dọc dọc theo tuyến (PDF) |
| In các dải cao độ và trắc dọc | Dải chỉ hiển thị trên màn hình; chụp ảnh màn hình nếu bạn cần chúng |
| Đổi tên lớp, màu hoặc kiểu nhãn | Đổi trong phần mềm CAD sau khi xuất DXF |
| Lưu trữ đám mây và lịch sử phiên bản | Lưu tệp `.civilcraft.json` và sao lưu; để làm việc cùng một dự án, dùng phiên trực tiếp trong CadCraft Studio ([Thiết kế một công trường cùng nhau, trực tiếp](topic:work-live)) |
| CadCraft Studio cho iPad và iPhone, và từ Google Play | Dùng CivilCraft trên trình duyệt của thiết bị; trên Android, CadCraft Studio cài từ APK tại getcadcraft.com/download |
| Mở nhiều tệp điểm hoặc tệp dự án cùng lúc | Một tệp cho mỗi lần mở (các tệp GIS thuộc về nhau, như các phần của shapefile, mở cùng nhau) |

## Cảnh quan

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Đầu phun và vòi của nhà sản xuất | Đầu chung, hoặc thêm đầu của riêng bạn từ tệp; dữ liệu của hãng được thêm khi họ cho phép |
| Chiều dài ống nhánh tối đa cho đường nhỏ giọt, lưu lượng theo thời gian, bơm, mạng ống vòng | Giữ đường nhỏ giọt trong chiều dài hãng công bố; kiểm tra cần một mạng phân nhánh |
| Đường viền chính xác của một vật thể tự do lõm; thể tích dưới mặt đất đo chính xác | Bao lồi được san và thể tích dưới mặt đất là ước tính (được nêu trong Thuộc tính) |
| Cây trong Đặt từ thư viện của BimCraft và ModelCraft | Xuất IFC cảnh quan và mở trong BimCraft cạnh công trình |
| Mô hình cây chi tiết (lá, cành, mùa) trong khung nhìn 3D; vật thể tự do và tưới trong khung nhìn 3D | Cây hiển thị trong 3D dưới dạng hình đơn giản theo kích thước trong danh sách cây ([Xem công trường trong 3D](topic:site-3d)); phân tán của ModelCraft tạo ảnh trồng cây |
| Tường cứng giữ một cao độ san phía sau nó trên bề mặt | Cho bệ hoặc nền các cạnh thẳng đứng: chúng là tường chắn trên bề mặt ([San nền](topic:grading)) |
| Biến đổi SVG trong ký hiệu của riêng bạn; kết cấu và màu của mô hình cây GLB riêng; hình học GLB nén | Làm phẳng biến đổi trong phần mềm vẽ trước; mô hình được vẽ theo màu của cây; xuất GLB không nén ([Đồ họa cây](topic:plant-graphics)) |
| Danh sách cây riêng lưu trong tài khoản Thư viện (sửa trong ứng dụng) | Sửa danh sách riêng của dự án trong Bảng cây và lưu thành tệp cây |
| Công cụ cảnh quan cho trợ lý không có cửa sổ (máy chủ tệp và dòng lệnh) | Chúng hoạt động khi cửa sổ CivilCraft đang mở ([Để trợ lý AI làm việc với công trường của bạn](topic:assistants)) |

## Đường dây điện

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Tiêu chuẩn của một quốc gia được tích hợp sẵn (trường hợp tải, khoảng hở, hệ số) | Đặt giá trị tiêu chuẩn trong {{ui:Trường hợp tải và giới hạn…}} và lưu, cùng thư viện, thành một gói để dùng lại và chia sẻ ([Gói](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Khoảng cách ngang từ dây dẫn tới tán cây hoặc tường bên cạnh đường dây | Khoảng hở thẳng đứng phía trên cây và tường mà đường dây cắt qua ([Kiểm tra đường dây điện](topic:power-line-checks#clearances)) |
| Dây dẫn bị dão và độ giãn của dây mới | Tính đến chúng qua nhiệt độ trong bảng căng dây |
| Định mức nhiệt của cáp chôn ngầm (dòng định mức từ cách lắp đặt) | Nhập dòng định mức của nhà cung cấp trên mục cáp |
| Nghiên cứu ngắn mạch, bảo vệ và tiếp địa | Dùng chương trình điện chuyên dụng; CivilCraft cho chiều dài mạng và cáp |
| Cột tháp giàn thiết kế từng thanh, và neo dây trong đất | Trụ được kiểm tra theo tải danh định; dây néo theo tải định mức |
| Tệp nghiên cứu `.DON` được kiểm tra trong chương trình đọc nó | Kiểm tra tệp ở đó; gửi cho chúng tôi một mẫu để chúng tôi thử với tệp thật |
| Đường dây điện trong khung nhìn 3D và IFC | Mặt bằng, trắc dọc đường dây, các tờ và lớp GIS |
| Công cụ đường dây điện cho trợ lý không có cửa sổ | Chúng hoạt động khi cửa sổ CivilCraft đang mở ([Để trợ lý AI làm việc với công trường của bạn](topic:assistants)) |

## Khối nhà

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Thư viện mã quy hoạch hoặc quy định của bất kỳ thành phố nào | Nhập giới hạn từ quy định của riêng bạn ([Giới hạn quy hoạch](topic:zoning-limits)) |
| Ánh sáng bầu trời trên tường (ánh sáng ban ngày mặt tiền), gió | [Số giờ nắng](topic:sun-hours) chỉ đếm nắng trực tiếp |
| Bóng từ cây, cây trồng hoặc bất cứ thứ gì không vẽ như một khối | Vẽ các tòa nhà lân cận thành khối |
| Hình dạng mái trên khối | Khối có đỉnh phẳng |
| Lỗ mở, mái và loại tường khi khối được phát triển trong BimCraft | BimCraft tạo tường ngoài trơn trên mọi tầng và sàn; thêm phần còn lại ở đó |

## GIS và hệ tọa độ

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| File Geodatabase; kiểu KML, biểu tượng, lớp phủ mặt đất và liên kết mạng | Chuyển sang GeoPackage, shapefile hoặc GeoJSON trước; các dấu KML được đọc mà không có kiểu |
| Sửa đối tượng GIS hoặc thuộc tính của chúng | Sửa trong chương trình GIS rồi nhập lại. Bảng Phân tích tạo lớp mới (vùng đệm, chồng lớp, nối, chọn) và thêm trường diện tích và chiều dài, nhưng không sửa đối tượng tại chỗ |
| Phân tích mạng và raster, vùng đệm với đầu phẳng hoặc vuông và vùng đệm một phía, thêm hoặc xóa hàng và đổi kiểu trường trong bảng thuộc tính, màu lớp thủ công, chú giải kiểu trong bản in | Dùng Chọn để chọn đối tượng và tạo lớp từ chúng; đầu phẳng chưa được cung cấp. Tô màu theo thuộc tính và bảng thuộc tính đã có: xem [Tạo kiểu lớp theo thuộc tính](topic:gis-symbology) và [Làm việc với bảng thuộc tính của lớp](topic:gis-table) |
| Kiểu nhãn (cỡ chữ, vị trí) và nhãn không đè lên nhau | Nhãn cùng một cỡ và có thể chồng lên nhau khi đối tượng dày đặc |
| Mốc cao độ đứng và mô hình geoid | Cao độ được dùng như tệp cung cấp; tự kiểm tra mốc cao độ |
| Dịch chuyển lưới khác với NAD83 từ NAD27 được gợi ý theo khu vực (OSTN15, NTv2 cho các mốc khác hoạt động khi bạn thêm tệp), nhiều lưới cùng lúc, lưới đứng | Tự thêm tệp lưới cho mốc của bạn; một lưới cho một dự án |
| Lớp bản đồ trong xuất DXF hoặc 3D | Lớp bản đồ đi vào bản in PDF, và cạnh DWG dưới dạng hình ảnh |
| Máy chủ bản đồ cần đăng nhập, khóa hoặc token | Dùng dịch vụ công cộng, hoặc tệp hình ảnh được định vị |
| Ghi tệp LAS hoặc LAZ từ bề mặt, mô hình mặt đất hoặc các công cụ lưới cao độ và LiDAR | Xuất bề mặt thành lưới cao độ GeoTIFF. Tiện ích [Đám mây điểm](topic:point-clouds) ghi đám đã làm sạch thành LAS 1.4 hoặc LAZ |
| Cường độ, màu và lượt trả về LiDAR; lưới cao độ có nhiều dải; tệp lưới hoặc LiDAR trên 200 MB | LiDAR chỉ lọc theo lớp, lưới dùng dải đầu tiên; cắt tệp lớn thành ô trước |

## Nhập liệu

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Chọn hộp bằng cảm ứng (cần {{key:Shift}}) | Nhấn giữ từng điểm đo để thêm |
| Gõ tọa độ hoặc khoảng cách khi đang vẽ | Vẽ gần đúng, rồi gõ tọa độ PI chính xác trong bảng PI của tuyến |
| Gõ tọa độ cho góc nền và công trình | Kéo tay cầm của chúng; phóng to để chính xác và theo dõi E và N trên thanh trạng thái |
| Bắt điểm vào đối tượng (trừ điểm đo cho đường ngắt) | Phóng to và theo dõi thanh trạng thái |

## Khung nhìn 3D

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Vẽ hoặc sửa trong khung nhìn 3D | Vẽ và sửa trên mặt bằng; khung nhìn 3D theo dõi mọi chỉnh sửa |
| Chọn đường đặc trưng hành lang hoặc đối tượng GIS bằng cách nhấp trong 3D | Nhấp chúng trên mặt bằng |
| Xuất khung nhìn phóng đại hoặc theo feet | Xuất theo tỷ lệ thật bằng mét; xem [Xuất công trường sang 3D](topic:export-3d) |
| Nhãn trong xuất GLB hoặc OBJ, cỡ và kiểu nhãn trong 3D | Nhãn chỉ hiển thị trong khung nhìn 3D, một cỡ; xem [Xem công trường trong 3D](topic:site-3d) |
| Kết cấu từ ảnh, ghi lại chuyến đi thành video, bóng từ ngoài công trường, số giờ nắng hiển thị trong 3D | Lớp bản đồ phủ lên các bề mặt; lái xe và vị trí mặt trời tại một thời điểm; [số giờ nắng](topic:sun-hours) cho một ngày hoặc một mùa trên mặt bằng |
