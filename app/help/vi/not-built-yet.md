---
title: Chưa xây dựng
summary: Những gì bản dựng này của CivilCraft chưa làm được, và hiện nay nên làm gì thay thế.
keywords: thiếu, giới hạn, lộ trình, chưa có, không có sẵn, đường xoắn ốc, mở rộng, dwg, dxf, miệng thu, ao điều tiết, mặt cắt ngang, sẽ có sau, giới hạn
from: b91588d4
---

CivilCraft còn đang trong giai đoạn đầu. Trang này liệt kê những gì bản dựng hiện tại chưa làm, để bạn không phải tìm kiếm. Không có mục nào ở đây được hứa hẹn theo một ngày nào.

## Điểm

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Thêm một tệp điểm thứ hai vào tệp đầu tiên | Nối các tệp trong trình soạn thảo văn bản hoặc bảng tính trước |
| Xuất tệp văn bản điểm | Xuất LandXML (điểm đi ra dưới dạng CgPoints), dùng {{ui:Xuất}} GIS (điểm với các trường P, N, E, Z và D), hoặc {{ui:Sao chép}} các điểm vào bảng tính |
| Kiểu nhãn điểm, ký hiệu theo khóa mô tả, đường cong (cung) từ mã đường, một tệp khóa mô tả để chia sẻ giữa các dự án | Nhãn hiện số hiệu, cao độ và mô tả, hoặc ít hơn ([Cài đặt CivilCraft](topic:settings)); các khóa được giữ trong tệp dự án |
| Chuyển đổi đơn vị | Chuyển đổi tệp trước khi nhập; **Đơn vị** chỉ đổi nhãn |

## Bề mặt

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Nhiều hơn một bề mặt được dựng từ điểm | Một dự án cho mỗi bề mặt |
| Ẩn các biên (trong) | Dùng **Cạnh ngoài dài nhất** hoặc một biên ngoài |
| Chọn hoặc sửa một đường ngắt đã vẽ | {{key:Mod+Z}}, hoặc {{ui:Gỡ các đường ngắt đã vẽ}} và vẽ lại |
| Sửa một bề mặt đọc từ LandXML (đường ngắt, biên) | {{ui:Dựng lại bề mặt từ các điểm}} |
| Sửa một bề mặt tạo từ lưới cao độ | Nhập lại lưới với các lựa chọn khác |
| Chuyển đổi một bề mặt đọc từ LandXML khi hệ tọa độ thay đổi | {{ui:Dựng lại bề mặt từ các điểm}} trước |
| Cao độ điểm có nhãn và giá trị độ dốc | Đọc chúng trên thanh trạng thái, hoặc tô màu bề mặt theo độ dốc bằng **Phân tích độ dốc** trong không gian làm việc Cảnh quan ([San nền cho cảnh quan](topic:landscape-grading#grading-checks)) |

## Tuyến và trắc dọc

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Đường xoắn ốc khác đường clothoid; đường xoắn ốc nằm giữa hai đường cong (chuyển tiếp ghép) | Đường xoắn ốc clothoid ở hai đầu một đường cong có sẵn; các loại khác được đặt tên và bỏ qua khi nhập LandXML |
| Chèn một PI giữa hai PI khác | Vẽ lại tuyến, hoặc gõ lại tọa độ PI |
| Tuyến từ đối tượng, độ lệch, mở rộng | Vẽ bằng các PI |
| Gõ K cho đường cong đứng | Gõ L (K được hiển thị) |
| Đường cong đứng tròn và không đối xứng | Chỉ đường cong parabol đối xứng |
| Nhiều hơn một trắc dọc thiết kế cho mỗi tuyến | Một tuyến cho mỗi phương án |
| Phóng to khung trắc dọc, các dải trắc dọc dưới trắc dọc | Khung trắc dọc vừa với toàn bộ tuyến; in trên [tờ mặt bằng và trắc dọc](topic:plan-profile-sheets) |
| Mặt cắt dạng DWG hoặc LandXML | Tờ mặt cắt dạng PDF; {{ui:CSV}} của diện tích và khối lượng |
| Đường lấy mẫu xiên, hoặc có chiều rộng khác nhau dọc đường | Một chiều rộng cho mỗi bên cho cả tuyến |

## Hành lang

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Dải phân cách giữa, rào chắn và siêu cao làm xoay các mẫu | Vẽ chúng như mẫu ([Mẫu hành lang](topic:corridor-templates)); mẫu theo cọc chưa nhận siêu cao |
| Thay đổi dần giữa mẫu của hai vùng (chuyển tiếp, vuốt thon) | Đổi mẫu tại một cọc, hoặc đặt cho một điểm một mục tiêu chiều rộng tới một đường vẽ làm đoạn vuốt |
| Xoay quanh một mép, siêu cao trong LandXML | Siêu cao xoay quanh tim tuyến trên đường cong tròn; mở rộng làn xe bằng mục tiêu chiều rộng tới một đường đặc trưng |
| Mục tiêu cho mái dốc bên (đường giao với mặt đất tới một đường hoặc bề mặt), các bề mặt hành lang riêng | Mục tiêu di chuyển mép mặt đường và lề đường ([Hành lang](topic:corridor)); hành lang được san vào bề mặt dự kiến |
| Bó vỉa bo góc, làn rẽ và đảo được san vào nút giao; đầu đường nhánh được cắt theo mép đường chính trên góc xiên; lối đi nối với đường trên mặt bằng, trong chiều dài và diện tích | Các đường gặp nhau được nối vuông góc, mép đường chính được mở và đường nhánh được nâng dần đến nó ([Nơi đường gặp đường](topic:corridor#where-roads-meet-roads-pads-and-paths)); lối đi dừng ở mép đường trong bề mặt dự kiến và trong 3D |
| Hành lang xuất dưới dạng đường bộ LandXML; hành lang thứ hai trên một tuyến trong xuất IFC | Bề mặt dự kiến được xuất |
| Mẫu địa hình làm thay đổi bề mặt dự kiến, trong 3D hoặc trong mặt cắt | Chúng cho diện tích và khối lượng của từng lớp ([Mẫu địa hình](topic:corridor-templates#terrain-templates)) |
| Vết quét với tốc độ, trượt lốp, thời gian đánh lái, rơ-moóc đánh lái hoặc khoảng hở thân xe; thư viện các xe thiết kế tiêu chuẩn; vết quét vẽ bằng cách kéo xe | Vết quét tốc độ thấp dọc đường đặc trưng hoặc tuyến, với kích thước xe của bạn ([Vết quét của xe](topic:swept-paths)) |

## San và khối lượng

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Bậc thang, đường đặc trưng mở được san vào thiết kế, san tới một đường đặc trưng từ nơi khác | Đóng đường đặc trưng ([Đường đặc trưng](topic:feature-lines)), hoặc dùng nó như đường ngắt của mặt đất hiện có |
| Chèn hoặc xóa một đỉnh của đường đặc trưng | Vẽ lại đường, hoặc tạo một đường lệch bậc từ nó |
| Cung trong đường ngắt đã vẽ (qua điểm khảo sát), đường xoắn ốc trong đường đặc trưng | Vẽ đường đặc trưng có cung và dùng nó như đường ngắt của mặt đất hiện có |
| San tới một khoảng cách, cao độ hoặc bề mặt khác | Đường giao với mặt đất tới mặt đất hiện có duy nhất |
| Thêm hoặc xóa một góc nền | Xóa nền và vẽ lại |
| Khối lượng TIN tới TIN (lăng trụ), chọn kích thước ô lưới | Phương pháp lưới, kích thước ô do CivilCraft chọn |
| Độ nở và co, lớp đất mặt, chiều sâu mặt đường | Tự áp dụng hệ số cho các số đã báo cáo |
| Chi phí vận chuyển miễn phí và vượt mức, vận chuyển qua các tuyến khác nhau, bãi mượn và bãi thải đặt trên mặt bằng | Biểu đồ vận chuyển khối lượng với điểm cân bằng, khối lượng đã chuyển và cự ly vận chuyển trung bình |

## Mạng đường ống

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Nhiều hơn một mạng cho mỗi dự án | Dự án riêng cho nước mưa và nước thải |
| Đường ống nước chính: chất lượng và tuổi nước, điều khiển theo quy tắc, các loại van khác (kiểm soát lưu lượng, tiết lưu, duy trì), máy bơm cho bằng công suất, nhu cầu phụ thuộc áp suất, tùy chọn Darcy–Weisbach, danh mục ống với độ dày thành và cấp áp suất. Phần còn lại của mạng áp suất nằm trong phòng thí nghiệm: [Đường ống nước chính](topic:water-mains) | Kiểm tra các mục đó trong phần mềm phân phối nước; lưu lượng thiết kế nước thải có trong [Lưu lượng thiết kế nước thải](topic:sanitary-design) |
| Lưu lượng cống theo thời gian (hydrograph, định tuyến động, lưu trữ, máy bơm, tràn) | [Lưu lượng thiết kế nước thải](topic:sanitary-design) cho lưu lượng đỉnh ổn định mà một tờ thiết kế dùng |
| Khả năng của miệng thu, phân bố trên rãnh, định tuyến ao điều tiết, hydrograph, tổn thất năng lượng khác hệ số một nút | Kiểm tra trong phần mềm khác; lưu lượng, kích thước và đường năng lượng có trong [Thoát nước mưa](topic:storm-drainage) |
| Lưu vực trong bản in PDF, DWG, DXF hoặc LandXML; lưu vực từ bề mặt (đường phân thủy) | Vẽ lưu vực bằng tay; chúng được lưu trong tệp dự án |
| Danh mục ống, ống không tròn, công trình không phải hộp hoặc trụ đứng (nón, bậc, gia cố chân), loại thoát nước trong thư viện | Các loại công trình từ tham số ([Mạng đường ống](topic:pipe-network)); ống có đường kính |
| Ống trong khung trắc dọc, ống cong | Đọc cao độ đáy và độ phủ trong bảng bên phải |

## Thửa đất

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Chia lô theo diện tích hoặc mặt tiền, thửa đất từ các đường quanh chúng, hành lang an toàn đường | Vẽ từng thửa theo các góc của nó, hoặc nhập các cạnh của nó |
| Bảng đường cong và bảng đường thẳng trên mặt bằng; nhãn được dời bằng tay | Mỗi cạnh được ghi nhãn dọc theo chính nó |
| Thửa đất trong LandXML | Thửa đất được lưu trong tệp dự án và xuất ra PDF, DWG và DXF |

## Đường chuyền

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Bình sai bình phương tối thiểu, quy tắc transit, gia trọng góc theo khoảng cách | Quy tắc la bàn |
| Góc lệch, góc thiên đỉnh và khoảng cách xiên, cao độ bằng đo cao lượng giác | Quy về khoảng cách ngang và góc ngang đúng, hoặc phương vị |
| Điểm nhìn phụ, tệp dữ liệu thô từ máy thu thập dữ liệu | Nhập các điểm như một tệp điểm |

## Đóng cọc

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Cọc lệch (điểm tham chiếu đặt lùi khỏi cọc), cọc mái dốc tại điểm chạm | Đóng cọc tại các độ lệch bạn cần, kể cả vượt qua lề đường |
| Gửi cọc thẳng sang định dạng riêng của máy thu thập dữ liệu | CSV mở được trong phần mềm văn phòng của hầu hết các máy thu thập dữ liệu |
| Đóng cọc cho đường ống, nền và thửa đất | Dùng các điểm khảo sát gần tuyến, hoặc các cạnh của thửa đất |

## Tệp và đầu ra

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Chữ, nét tô và kích thước từ DWG hoặc DXF; không gian giấy; bản vẽ liên kết (xref); DXF nhị phân | Nét vẽ từ không gian mô hình được mở ([Mở DWG hoặc DXF dưới dạng nét vẽ](topic:open-dwg-dxf)); mở bản vẽ liên kết riêng |
| Dời nhiều điểm cùng lúc bằng cách kéo | Cắt và dán chúng, hoặc sửa từng điểm một |
| Tờ dọc, khung tên của riêng bạn, khung nhìn bạn tự sắp xếp, tờ mặt bằng và trắc dọc trong DWG | Một tờ mặt bằng ngang cho mỗi PDF, hoặc tờ mặt bằng và trắc dọc dọc theo một tuyến (PDF) |
| In các dải cao độ và trắc dọc | Các dải chỉ có trên màn hình; chụp màn hình nếu bạn cần chúng |
| Đổi tên lớp, màu hoặc kiểu nhãn | Đổi trong chương trình CAD sau khi xuất DXF |
| Lưu trên đám mây và lịch sử phiên bản | Lưu tệp `.civilcraft.json` và sao lưu thường xuyên; để cùng làm một dự án, dùng phiên live trong CadCraft Studio ([Thiết kế một công trường cùng nhau, trực tiếp](topic:work-live)) |
| CadCraft Studio cho iPad và iPhone, và từ Google Play | Dùng CivilCraft trên trình duyệt của thiết bị; trên Android, CadCraft Studio được cài từ tệp APK tại getcadcraft.com/download |
| Mở nhiều tệp điểm hoặc tệp dự án cùng lúc | Một tệp cho mỗi lần mở (các tệp GIS thuộc về nhau, như các phần của một shapefile, được mở cùng nhau) |

## Cảnh quan

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Đầu phun và vòi của nhà sản xuất | Đầu chung, hoặc thêm đầu của riêng bạn từ một tệp; dữ liệu của nhà sản xuất được đưa vào khi họ cho phép |
| Chiều dài ngang tối đa cho đường nhỏ giọt, lưu lượng theo thời gian, máy bơm, mạng ống vòng | Giữ đường nhỏ giọt trong chiều dài đã công bố của nhà sản xuất; việc kiểm tra cần một mạng nhánh |
| Đường viền chính xác của một vật thể tự do lõm; thể tích dưới mặt đất đo chính xác | Bao lồi được san và thể tích dưới mặt đất là ước tính (có ghi trong Thuộc tính) |
| Thực vật trong Đặt từ thư viện của BimCraft và ModelCraft | Xuất IFC cảnh quan và mở trong BimCraft cạnh công trình |
| Mô hình thực vật chi tiết (lá, cành, mùa) trong khung nhìn 3D; vật thể tự do và tưới tiêu trong khung nhìn 3D | Thực vật hiện trong 3D dưới dạng hình đơn giản theo kích thước trong danh sách thực vật ([Xem khu đất trong 3D](topic:site-3d)); tán ngẫu nhiên của ModelCraft tạo ảnh trồng cây |
| Tường lát nền giữ một mức san phía sau trên bề mặt | Cho một sân hoặc nền các mặt đứng: chúng là tường chắn trên bề mặt ([San nền](topic:grading)) |
| Biến đổi SVG trong ký hiệu của riêng bạn; kết cấu và màu của mô hình GLB thực vật của riêng bạn; hình học GLB nén | Làm phẳng các biến đổi trong chương trình vẽ trước; mô hình được vẽ theo màu của thực vật; xuất GLB không nén ([Đồ họa thực vật](topic:plant-graphics)) |
| Danh sách thực vật của riêng bạn được giữ trong tài khoản Thư viện (chỉnh sửa trong ứng dụng) | Sửa danh sách riêng của dự án trong Bảng thực vật và lưu thành tệp thực vật |
| Các công cụ cảnh quan cho trợ lý không có cửa sổ (máy chủ tệp và dòng lệnh) | Chúng hoạt động khi cửa sổ CivilCraft đang mở ([Để trợ lý AI làm việc với khu đất của bạn](topic:assistants)) |

## Đường dây điện

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Tiêu chuẩn chuẩn của một quốc gia được dựng sẵn (trường hợp tải, khoảng hở, hệ số) | Đặt giá trị theo tiêu chuẩn của bạn trong {{ui:Trường hợp tải và giới hạn…}} và lưu, cùng thư viện, thành một gói để dùng lại và chia sẻ ([Gói](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Khoảng cách ngang từ dây dẫn đến tán cây hoặc tường bên đường dây | Khoảng hở thẳng đứng phía trên cây và tường mà đường dây băng qua ([Kiểm tra đường dây điện](topic:power-line-checks#clearances)) |
| Dây dẫn bị trượt theo thời gian (từ biến) và độ giãn của dây mới | Tính đến chúng qua nhiệt độ trong bảng căng dây |
| Định mức nhiệt của cáp chôn ngầm (dòng định mức theo cách đặt) | Nhập dòng định mức của nhà cung cấp trên mục cáp |
| Nghiên cứu ngắn mạch, bảo vệ và tiếp địa | Dùng chương trình điện chuyên dụng; CivilCraft cho chiều dài và cáp của mạng |
| Cột giàn thép được thiết kế từng thanh, và neo dây néo trong đất | Cột được kiểm tra theo tải danh định; dây néo theo tải định mức |
| Tệp nghiên cứu `.DON` được kiểm tra trong chương trình đọc nó | Kiểm tra tệp ở đó; gửi cho chúng tôi một mẫu để kiểm thử với tệp thực |
| Đường dây điện trong khung nhìn 3D và trong IFC | Mặt bằng, trắc dọc đường dây, các tờ và lớp GIS |
| Các công cụ đường dây điện cho trợ lý không có cửa sổ | Chúng hoạt động khi cửa sổ CivilCraft đang mở ([Để trợ lý AI làm việc với khu đất của bạn](topic:assistants)) |

## Khối nhà

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Thư viện mã quy hoạch hoặc quy tắc của bất kỳ thành phố nào | Gõ các giới hạn theo quy định của bạn ([Giới hạn quy hoạch](topic:zoning-limits)) |
| Ánh sáng bầu trời trên tường (ánh sáng ban ngày mặt tiền), gió | [Giờ nắng](topic:sun-hours) chỉ tính nắng trực tiếp |
| Bóng từ cây, thực vật hoặc bất cứ thứ gì không được vẽ như khối | Vẽ các tòa nhà lân cận như khối |
| Hình dạng mái trên khối | Khối có đỉnh phẳng |
| Lỗ mở, mái và loại tường khi khối được phát triển trong BimCraft | BimCraft dựng tường ngoài trơn trên mọi tầng và một sàn; thêm phần còn lại ở đó |

## GIS và hệ tọa độ

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| File Geodatabase; kiểu KML, biểu tượng, lớp phủ mặt đất và liên kết mạng | Chuyển sang GeoPackage, shapefile hoặc GeoJSON trước; các placemark KML được đọc mà không có kiểu |
| Sửa các đối tượng GIS hoặc thuộc tính của chúng | Sửa trong chương trình GIS và nhập lại. Bảng Phân tích tạo lớp mới (đệm, chồng lớp, nối, chọn) và thêm trường diện tích và chiều dài, nhưng không sửa đối tượng tại chỗ |
| Phân tích mạng và raster, đệm với đầu phẳng hoặc vuông và đệm một phía, thêm hoặc xóa hàng và đổi kiểu trường trong bảng thuộc tính, màu lớp thủ công, chú giải kiểu trong bản in | Dùng Chọn để chọn đối tượng và tạo lớp từ chúng; đầu phẳng không được cung cấp. Tô màu theo thuộc tính và bảng thuộc tính đã có: xem [Tô màu lớp theo thuộc tính](topic:gis-symbology) và [Làm việc với bảng thuộc tính của lớp](topic:gis-table) |
| Kiểu nhãn (cỡ, vị trí) và nhãn tránh nhau | Nhãn cùng cỡ và có thể chồng lên nhau khi đối tượng dày đặc |
| Mốc cao độ thẳng đứng và mô hình geoid | Cao độ được dùng như tệp cung cấp; tự kiểm tra mốc cao độ |
| Dịch lưới khác NAD83 từ NAD27 gợi ý theo khu vực (OSTN15, NTv2 cho các mốc khác hoạt động khi bạn thêm tệp), nhiều lưới cùng lúc, lưới thẳng đứng | Tự thêm tệp lưới cho mốc của bạn; một lưới cho mỗi dự án |
| Lớp bản đồ trong DXF hoặc xuất 3D | Lớp bản đồ đi vào bản in PDF, và cạnh DWG như một ảnh |
| Máy chủ bản đồ cần đăng nhập, khóa hoặc mã thông báo | Dùng dịch vụ công cộng, hoặc một tệp ảnh đã định vị địa lý |
| Ghi tệp LAS hoặc LAZ từ bề mặt, mô hình mặt đất, hoặc các công cụ lưới cao độ và LiDAR | Xuất bề mặt thành lưới cao độ GeoTIFF. Tiện ích [Đám điểm](topic:point-clouds) ghi một đám đã làm sạch thành LAS 1.4 hoặc LAZ |
| Cường độ, màu và lượt phản hồi LiDAR; lưới cao độ với nhiều dải; tệp lưới hoặc LiDAR trên 200 MB | LiDAR chỉ được lọc theo lớp, lưới dùng dải đầu tiên; cắt các tệp lớn thành ô trước |

## Đầu vào

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Chọn khung bằng cảm ứng (cần {{key:Shift}}) | Nhấn giữ từng điểm khảo sát để thêm nó |
| Nhập tọa độ hoặc khoảng cách bằng bàn phím khi đang vẽ | Vẽ gần đúng, rồi gõ tọa độ PI chính xác trong bảng PI của tuyến |
| Nhập tọa độ cho các góc nền và công trình | Kéo các núm của chúng; phóng to để chính xác và xem E và N trên thanh trạng thái |
| Bắt vào đối tượng (trừ điểm khảo sát cho đường ngắt) | Phóng to và xem thanh trạng thái |

## Khung nhìn 3D

| Chưa xây dựng | Thay vào đó, hiện nay |
|---|---|
| Vẽ hoặc sửa trong khung nhìn 3D | Vẽ và sửa trên mặt bằng; khung nhìn 3D theo dõi mọi chỉnh sửa |
| Chọn đường đặc trưng hành lang hoặc đối tượng GIS bằng cách nhấp trong 3D | Nhấp chúng trên mặt bằng |
| Xuất khung nhìn phóng đại hoặc theo feet | Xuất có tỷ lệ thật bằng mét; xem [Xuất khu đất ra 3D](topic:export-3d) |
| Nhãn trong xuất GLB hoặc OBJ, cỡ và kiểu nhãn trong 3D | Nhãn chỉ hiện trong khung nhìn 3D, một cỡ; xem [Xem khu đất trong 3D](topic:site-3d) |
| Kết cấu từ ảnh, ghi lại chuyến đi thành video, bóng từ ngoài khu đất, giờ nắng hiện trong khung nhìn 3D | Lớp bản đồ phủ lên các bề mặt; lái xe và vị trí mặt trời tại một thời điểm; [giờ nắng](topic:sun-hours) cho một ngày hoặc một mùa trên mặt bằng |
