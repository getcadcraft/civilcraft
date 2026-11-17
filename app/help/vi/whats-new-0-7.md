---
title: Có gì mới trong 0.7 (trước đó)
summary: CivilCraft 0.7 thêm Không gian làm việc Đường dây điện (đường dây trên không và cáp ngầm với thư viện riêng của bạn, độ võng và lực căng, kiểm tra khoảng cách và độ bền, bảng căng dây, khối lượng, tờ và GIS), Không gian làm việc Cảnh quan (danh sách cây, bản vẽ trồng cây và bảng thống kê, san nền cảnh quan, lát, tường và bậc thang, công cụ hỗ trợ tính toán tưới tiêu, tờ cảnh quan và đối tượng tự do), khối công trình với giới hạn quy hoạch bạn nhập và số giờ nắng, đường xoắn clothoid, hành lang xây từ các phần ở mỗi bên, xuất USD và thêm công cụ cho trợ lý AI.
keywords: có gì mới 0.7, bản phát hành trước, ghi chú phát hành, nhật ký thay đổi, thay đổi, 0.7, phiên bản, tính năng mới, cảnh quan, không gian làm việc cảnh quan, danh sách cây, cây, trồng cây, bảng thống kê cây, luống, hàng rào cây, san nền, nền, gò đất, rãnh thoát, cao độ điểm, phân tích độ dốc, đọng nước, cảnh quan cứng, lát, đường đi, tường, bó vỉa, bậc thang, tưới tiêu, phun tưới, nhỏ giọt, tờ cảnh quan, đối tượng tự do, khối công trình, khối, quy hoạch, lùi đường, đường bao, mặt phẳng phơi sáng, hệ số sử dụng đất, mật độ xây dựng, số giờ nắng, bóng đổ, ifc, phát triển trong bimcraft, đường xoắn, clothoid, chuyển tiếp, định mức, bó vỉa, rãnh, vỉa hè, usd, trợ lý, đơn vị, tiếng Bồ Đào Nha
from: 797d2f2f
---

Đây là những thay đổi trong CivilCraft 0.7 so với 0.6. Các phần mới lớn nhất là Không gian làm việc Đường dây điện, Không gian làm việc Cảnh quan và khối công trình.

## Mới

### Không gian làm việc Cảnh quan

- **Không gian làm việc Cảnh quan trên cùng một công trường.** {{ui:Bề mặt}} › {{ui:Thêm}} › {{ui:Không gian làm việc Cảnh quan}} thêm công cụ trồng cây, san nền, cảnh quan cứng và tưới tiêu vào công trường bạn đã có: cùng các điểm khảo sát, bề mặt và tệp dự án. Chọn **Civil** trong **Không gian làm việc** để quay lại. Xem [Không gian làm việc Cảnh quan](topic:landscape).
- **Danh sách cây.** Khoảng 420 loại cây thân gỗ, cây bụi, hàng rào, cỏ, cây lâu năm, cây phủ đất và dây leo phổ biến ở vùng ôn đới và Địa Trung Hải, kèm kích thước khi trồng và khi trưởng thành, vùng chịu lạnh, ánh sáng, nước và khoảng cách trồng. Tìm theo bất kỳ tên nào bằng tiếng Anh, tiếng Tây Ban Nha hoặc tiếng Bồ Đào Nha. Bạn có thể nhập danh sách riêng dạng CSV; danh sách được lưu cùng dự án. Kích thước có sẵn chỉ mang tính điển hình và đã làm tròn: hãy kiểm tra với vườn ươm địa phương. Xem [Danh sách cây](topic:plant-list).
- **Bản vẽ trồng cây.** {{ui:Cây}} đặt từng cây riêng lẻ nằm trên mặt đất và theo các thay đổi san nền sau đó, {{ui:Luống}} lấp đầy một đường viền theo khoảng cách của cây với hỗn hợp theo phần trăm, và {{ui:Hàng rào cây}} đặt một hoặc hai hàng dọc theo một đường. Cây được ghi nhãn trên bản vẽ. Xem [Bản vẽ trồng cây và bảng thống kê](topic:planting).
- **Bảng thống kê cây.** Thêm › {{ui:Bảng thống kê cây…}} đếm cây theo loài và kích thước khi trồng. Lưu dưới dạng CSV hoặc XLSX, hoặc gửi sang TakeoffCraft để định giá. Xem [Bảng thống kê cây](topic:planting#the-plant-schedule).
- **San nền cho cảnh quan.** {{ui:San nền}} có các bệ (bằng phẳng hoặc dốc xuống), gò đất, rãnh thoát và các khu vực san nền với cao độ điểm và đường đồng mức mà bạn kéo. Khối lượng đào và đắp hiển thị ngay khi bạn làm. **Phân tích độ dốc** tô màu bề mặt theo hai giới hạn do bạn đặt, và **Mũi tên dòng chảy và đọng nước** cho thấy nước chảy ở đâu và chỗ nào sẽ đọng lại. Tất cả được đưa vào cùng bề mặt đề xuất với nền và hành lang. Xem [San nền cho cảnh quan](topic:landscape-grading).
- **Lát, đường đi, tường, bó vỉa, dốc và bậc thang.** {{ui:Cảnh quan cứng}} vẽ phần lát với độ dốc ngang hoặc dốc về rãnh thoát, một kiểu mẫu và các lớp của nó; đường đi bám theo mặt đất; tường chắn và tường độc lập với móng bậc; bó vỉa; và dốc, bậc thang được kiểm tra theo giới hạn bạn đặt. Tường chắn cao hơn 1,2 m (4 ft) được đánh dấu để kỹ sư xem xét. Xem [Lát, tường và bậc thang](topic:hardscape).
- **Công cụ hỗ trợ tính toán tưới tiêu.** {{ui:Tưới tiêu}} đặt các đầu phun, nhánh phụ, đường chính, van, đường nhỏ giọt và điểm đấu nối. {{ui:Kiểm tra hệ thống…}} tìm các vùng từ đường ống, tính lưu lượng từng vùng, áp suất cần tại van và tại nguồn cấp (Hazen–Williams), lượng mưa, thời gian tưới, độ phủ và bảng vật tư. Đây là công cụ hỗ trợ tính toán, không phải chứng nhận thiết kế: nhà thiết kế tưới tiêu phải kiểm tra mọi kết quả. Đầu phun là các loại chung, hoặc của riêng bạn từ một tệp. Xem [Thiết kế tưới tiêu](topic:irrigation).
- **Tờ cảnh quan.** Thêm › {{ui:Tờ cảnh quan…}} tạo bản vẽ trồng cây, san nền và tưới tiêu cùng chú giải, và một tờ chi tiết gồm mặt cắt tường, cấu tạo lát và bậc thang, trong một tệp PDF. Xem [Tờ cảnh quan](topic:landscape-sheets).
- **Đối tượng tự do.** Thêm › {{ui:Đối tượng tự do…}} đặt một lưới STL, OBJ hoặc mục thư viện được làm trong ứng dụng khác, chẳng hạn bồn cây hoặc tác phẩm điêu khắc. Đối tượng nằm trên mặt đất hoặc cắt vào đất, và thể tích, diện tích cùng diện tích chiếm đất của nó được tính. Xem [Đối tượng tự do](topic:freeform-objects).
- **IFC cảnh quan.** Thêm › {{ui:Xuất IFC cảnh quan}} lưu cây (dưới dạng thực vật với các thuộc tính), cảnh quan cứng và đối tượng tự do dưới dạng IFC 4.3 cho mô hình BIM. Xem [IFC](topic:planting#ifc).
- **Từ đầu đến cuối.** [Thiết kế một khu vườn, từ đầu đến cuối](topic:landscape-walkthrough) hướng dẫn toàn bộ không gian làm việc trên công trường mẫu.

### Không gian làm việc Đường dây điện

- **Đường dây trên không và cáp ngầm trên công trường của bạn.** {{ui:Bề mặt}} › {{ui:Thêm}} › {{ui:Không gian làm việc Đường dây điện}}: vẽ một đường theo các cột đỡ, cáp trong rãnh, thiết bị và chướng ngại, trên cùng mặt đất và trong cùng tệp dự án. Xem [Không gian làm việc Đường dây điện](topic:power-lines).
- **Thư viện riêng của bạn.** Dây dẫn, cáp, cột đỡ, thiết bị (xà ngang, sứ cách điện, phụ kiện, dây néo, máy biến áp, tủ, mối nối) và các loại rãnh, theo danh mục bạn đặt tên, chia sẻ dưới dạng tệp hoặc bảng tính. Không có danh mục của quốc gia hay nhà sản xuất nào được tích hợp sẵn; các ví dụ đều ghi rõ là ví dụ. Xem [Thư viện đường dây điện của bạn](topic:power-line-library).
- **Độ võng và lực căng theo các trường hợp tải của bạn.** Nhiệt độ, gió, băng và băng ở một phía; giới hạn lực căng theo một phần của lực đứt; đường dây xích (catenary) chính xác trên mọi nhịp, kể cả khi có độ dốc; và bảng căng dây. Xem [Độ võng và lực căng](topic:sag-and-tension).
- **Kiểm tra luôn được cập nhật.** Khoảng cách tới mặt đất và chướng ngại, khoảng cách pha, độ đung của sứ, lực nhổ, tải cột đỡ với việc chọn kích thước từ thư viện, dây néo, phụ kiện, móng, thiếu dữ liệu, cáp bị ngắt kết nối, quá tải và sụt áp, được đánh dấu trên bản vẽ và trên mặt cắt dọc đường dây. Đây là công cụ hỗ trợ thiết kế: kỹ sư phải kiểm tra. Xem [Kiểm tra đường dây điện](topic:power-line-checks).
- **Bảng, tờ và GIS.** Bảng căng dây và cột đỡ, khối lượng (CSV, Excel, TakeoffCraft), tờ mặt bằng và mặt cắt dọc với báo cáo nghiên cứu trong một tệp PDF, các lớp GIS với dữ liệu của mọi tài sản. Xem [Bảng, khối lượng, tờ và GIS đường dây điện](topic:power-line-outputs).
- **Sau những lần thử đầu tiên.** Mặt cắt dọc đường dây theo dõi đường bạn chọn, có danh sách **Đường** và đọc nền đất, dây dẫn và khoảng cách dưới con trỏ, đồng thời đo giữa hai điểm. Cây và tường cảnh quan được tính là chướng ngại dưới đường dây; tuyến cáp và ống hiển thị trên mặt cắt dọc và giao nhau theo quy tắc khoảng cách bạn chọn; **Quy tắc…** cạnh mỗi khoảng cách mở các quy tắc riêng của bạn; và các bộ quy tắc có thư viện được lưu dưới dạng gói để chia sẻ theo quốc gia. Xem [Kiểm tra đường dây điện](topic:power-line-checks) và [Gói](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Định dạng tệp riêng của bạn.** Đường dây điện được lưu trong tệp dự án CivilCraft, thư viện lưu trong `.cclines.json` hoặc CSV, bộ quy tắc và gói trong các tệp JSON riêng: đều là định dạng mở mà ai cũng đọc hoặc chuyển đổi được. Tệp nghiên cứu `.DON` là phần nhập và xuất bổ sung bên cạnh chúng.
- **Tệp nghiên cứu (.DON), chưa kiểm thử.** Lưu một đường dây thành tệp nghiên cứu `.DON` cho chương trình đường dây khác, hoặc đọc cột đỡ từ tệp đó; được xây dựng từ tên trường của định dạng, chưa kiểm thử với chương trình đó. Xem [Tệp nghiên cứu](topic:power-line-study-file).

### Đo đạc

- **Công cụ Đo.** {{ui:Bề mặt}} › {{ui:Thêm}} › {{ui:Đo}} (hoặc {{key:M}}) đo trên mặt bằng: chiều dài và phương vị của mỗi cạnh, tổng cộng dồn, chiều dài theo mặt đất và độ dốc, và diện tích cùng chu vi khi bạn khép hình. Không có gì được vẽ vào dự án. Xem [Đo](topic:measure).

### Khối công trình

- **Vẽ khối công trình.** Trong Thuộc tính, dưới **Khối công trình**, {{ui:Vẽ một khối}} (cũng có thể là {{ui:Bề mặt}} › {{ui:Thêm}} › {{ui:Khối}}). Đặt cho khối số tầng và chiều cao tầng rồi đọc tổng diện tích sàn. Chọn cách khối đặt trên nền dốc (bậc thang, bệ hoặc cắt) và xem phần đắp và đào. Khối hiển thị trên mặt bằng, trong PDF và trong DWG và DXF trên các lớp riêng. Xem [Vẽ khối công trình trên công trường](topic:building-masses).
- **Đẩy và kéo trong 3D.** Trong khung nhìn 3D, kéo mái của khối đang chọn, hoặc nhấn {{key:PageUp}} và {{key:PageDown}}, để thay đổi từng tầng một, trong một bước hoàn tác. **Mặt trời** đổ bóng các khối. Xem [Trong khung nhìn 3D](topic:building-masses#in-the-3d-view).
- **Giới hạn quy hoạch do bạn nhập.** Lùi đường theo từng dòng tính từ đường phố, giới hạn chiều cao, mặt phẳng phơi sáng bầu trời, hệ số sử dụng đất và mật độ xây dựng. Vùng được phép xây dựng vẽ trên mặt bằng, và mỗi khối có dấu tick hoặc dấu chéo cho từng giới hạn. CivilCraft không có quy chuẩn quy hoạch nào: mọi con số là do bạn nhập từ quy định địa phương. Xem [Kiểm tra khối theo các giới hạn quy hoạch bạn nhập](topic:zoning-limits).
- **Số giờ nắng.** Chọn một ngày hoặc một mùa, và múi giờ theo tên hoặc độ lệch, rồi đọc số giờ nắng trực tiếp trên mọi tường của mọi khối, theo từng tầng, và trên mặt đất xung quanh, được vẽ trên mặt bằng. Lưu tường và mặt đất dưới dạng CSV. Dự án cần có hệ tọa độ. Xem [Tính số giờ nắng trên công trường](topic:sun-hours).
- **Khối dạng IFC, và chuyển sang BimCraft.** {{ui:Khối dạng IFC}} lưu các khối dưới dạng IFC4, đặt trên bản đồ khi dự án có hệ tọa độ. {{ui:Phát triển trong BimCraft}} mở BimCraft trong một thẻ mới với các khối, nơi **Phát triển khối này** dựng tường trên mọi tầng và một sàn từ mặt bằng. Không có gì được tải lên. Xem [Gửi tiếp](topic:building-masses#send-it-on).

### Tuyến

- **Đường xoắn clothoid.** Nhập chiều dài vào **Xoắn vào** và **Xoắn ra** trong bảng PI cho một đường cong: tiếp tuyến, đường xoắn, đường cong, đường xoắn, tiếp tuyến, với chiều dài bằng nhau hoặc khác nhau. Bản vẽ ghi nhãn TS, SC, CS và ST, danh sách đường cong cho θs cùng các khoảng cách tiếp tuyến và ngoài, và cọc và độ lệch chạy qua các đường xoắn. Xem [Đường xoắn](topic:alignment#spirals).
- **Đường xoắn trong LandXML.** LandXML ghi và đọc đường xoắn clothoid. Các tuyến có đường xoắn, trước đây CivilCraft bỏ qua khi nhập, nay có thể mở được. Xem [Trao đổi LandXML](topic:landxml).

### Hành lang

- **Xây từng bên từ các phần.** Bật **Xây từng bên từ các phần** để mỗi bên có danh sách riêng tính từ tim tuyến ra ngoài: làn xe, lề đường, rãnh thoát, bó vỉa, dải trồng cây, vỉa hè và mái dốc bên với phần đào và đắp riêng. Bắt đầu từ {{ui:Đường nông thôn}} hoặc {{ui:Đường đô thị}} rồi sao chép một bên sang bên kia. Mặt cắt ngang đánh dấu đường đáy rãnh, bó vỉa và vỉa hè, và bề mặt san nền có bó vỉa. Xem [Xây từng bên từ các phần](topic:corridor#build-each-side-from-parts).
- **Siêu cao trên đường xoắn.** Trên đường cong có đường xoắn, đoạn chuyển siêu cao chạy trên đường xoắn: mặt đường phẳng tại TS, siêu cao đầy đủ tại SC. Xem [Siêu cao](topic:corridor#superelevation).

### Tệp 3D

- **Xuất USD.** Trong khung nhìn 3D, {{ui:USD}} ghi công trường dưới dạng `.usda`, `.usdc` hoặc `.usdz` ở tỷ lệ thật và theo tọa độ dự án: bề mặt, ống và công trình dưới dạng lưới, các đường, mỗi tuyến, và điểm khảo sát kèm số hiệu. Xem [Xuất công trường 3D sang USD](topic:usd).

### Trợ lý AI

- **Thêm việc cho trợ lý.** Khi bật trợ lý trong {{ui:Cài đặt}} › {{ui:CivilCraft}}, trợ lý giờ còn có thể đọc thửa đất, đào và đắp, và mặt cắt; thêm điểm khảo sát; lưu dự án; xuất LandXML, DWG và USD; và làm việc trong các thư mục bạn chọn trong CadCraft Studio. Không gian làm việc Cảnh quan thêm công cụ tìm cây, đặt cây, luống và hàng rào, san nền, và kiểm tra tưới tiêu. Máy chủ tệp và dòng lệnh `cadcraft` mở dự án đã lưu mà không cần cửa sổ. Xem [Để trợ lý AI làm việc với công trường của bạn](topic:assistants).

## Trong mọi ứng dụng

- **Đơn vị.** {{ui:Cài đặt}} › {{ui:Chung}} › {{ui:Đơn vị}} có một danh sách riêng cho chiều dài, diện tích, thể tích, góc và độ dốc, với kích thước chính xác theo định nghĩa của đơn vị (foot khảo sát Mỹ là một đơn vị riêng). Tắt các đơn vị bạn không dùng và chúng sẽ rời khỏi danh sách; đánh dấu sao một đơn vị và công việc mới sẽ bắt đầu bằng đơn vị đó. Một tệp luôn giữ đơn vị riêng của nó. Trong CivilCraft, danh sách **Đơn vị** của dự án theo các công tắc; đánh dấu sao một chiều dài hệ mét sẽ bắt đầu dự án mới bằng mét (nếu không thì là foot, tức foot khảo sát Mỹ), đánh dấu sao một diện tích hoặc thể tích sẽ đặt đơn vị báo cáo cho diện tích và thể tích, và ô chiều dài nhận ký hiệu của mọi đơn vị, chẳng hạn `3 ch` hoặc `450 mm`. Xem [Đơn vị, giá trị nhập và danh sách đơn vị](common:unit-lists).
- **Bố cục dày hơn và các bảng tự gọn lại.** {{ui:Cài đặt}} › {{ui:Chung}} › {{ui:Mật độ bố cục}} › {{ui:Gọn}} để vừa nhiều thứ hơn trên màn hình (màn hình cảm ứng và điện thoại vẫn giữ nút lớn). Mỗi bảng bên có thanh tiêu đề mỏng: kéo để neo hoặc làm nổi bảng, thả lên thanh của bảng khác để chia sẻ một khung dưới dạng thẻ, ghim để bảng trượt về mép, hoặc ẩn và đưa lại từ mép. Xem [Sắp xếp các bảng](common:arrange-panels#make-the-layout-denser).
- **Hộp thoại di chuyển được.** Kéo hộp thoại theo thanh tiêu đề ra khỏi bản vẽ; khi đóng, nó trở về đúng chỗ cũ. Nhấp đúp vào thanh tiêu đề để căn giữa lại. Xem [Di chuyển hộp thoại](common:arrange-panels#move-a-dialog).
- **Công thức cho trợ lý AI.** Mười yêu cầu mẫu cho trợ lý của riêng bạn (dọn bản vẽ, in một bộ, kiểm tra bản vẽ, hỏi mô hình, tổng hợp khối lượng, thử biến thể chi tiết…), mỗi yêu cầu kèm các công cụ nó gọi và quyền cần thiết, và mỗi yêu cầu được các bài kiểm thử của chúng tôi chạy lại. Các ứng dụng không chứa AI. Xem [Công thức cho trợ lý AI](common:assistants-recipes).
- **Ngôn ngữ.** **Português (Portugal)** là mới trong {{ui:Cài đặt}} › {{ui:Chung}} › {{ui:Ngôn ngữ}}. Ngôn ngữ này, **Português (Brasil)**, **Español (México)** và **Bahasa Indonesia** nay có đầy đủ mọi từ của ứng dụng, dưới dạng bản nháp chưa được người bản ngữ duyệt. Các chủ đề trợ giúp bằng tiếng Anh, một số bằng tiếng Tây Ban Nha.
- **CadCraft Studio** cho biết lý do kiểm tra cập nhật thất bại (chưa có tệp cho hệ thống của bạn, không có mạng, chữ ký sai) thay vì chỉ "Xong", và không hiện lại thẻ Có gì mới mà bạn đã đóng cho đến khi có bản phát hành mới hơn.

## Chưa có trong phiên bản này

- **0.7 chưa được ký mã.** Việc ký mã và gói Microsoft Store đã chuyển sang 0.8 vì việc xác thực chứng chỉ chưa hoàn tất. Kiểm tra SHA-256 bên cạnh mỗi tệp tại getcadcraft.com/download. Trên Windows, nếu SmartScreen chặn trình cài đặt, chọn {{ui:Thông tin thêm}}, rồi {{ui:Vẫn chạy}}. Trên Mac, lần đầu, nhấp chuột phải vào CadCraft Studio và chọn {{ui:Mở}}. CadCraft Studio chưa có trên kho ứng dụng nào, và chưa có bản dựng cho iPad hay iPhone.
- Các danh sách góc và độ dốc trong {{ui:Đơn vị}} được lưu, nhưng chưa có ô nào đọc chúng.
- Đầu phun tưới của nhà sản xuất: chỉ có đầu phun chung và đầu phun của riêng bạn từ một tệp. Dữ liệu của nhà sản xuất chỉ được đưa vào khi họ cho phép, và hiện chưa có nhà sản xuất nào cho phép.
- BimCraft và ModelCraft có danh sách cây, nhưng chức năng Đặt từ thư viện của chúng chưa cung cấp cây. Cây đi tới BimCraft qua IFC cảnh quan.
- Các công cụ cảnh quan cho trợ lý chỉ hoạt động khi cửa sổ CivilCraft đang mở; máy chủ tệp và dòng lệnh chưa có chúng.
- Khối công trình: chưa có ánh sáng ban ngày hoặc gió cho mặt đứng, chưa có bóng từ cây hoặc bất kỳ thứ gì không được vẽ như khối, chưa có hình dạng mái, và số giờ nắng hiển thị trên mặt bằng, không trong khung nhìn 3D. Phát triển trong BimCraft chỉ dựng tường trơn và sàn, không có lỗ mở hay mái.
- Đường dây điện: không có tiêu chuẩn quốc gia nào được tích hợp (bạn tự đặt trường hợp tải, giới hạn và khoảng cách); không có nghiên cứu về từ biến dây dẫn, khả năng tải nhiệt của cáp chôn, ngắn mạch, bảo vệ hay nối đất; không có đường dây trong khung nhìn 3D hoặc IFC. Tệp nghiên cứu `.DON` chưa được kiểm thử với chương trình đọc nó.
- Đường xoắn không phải clothoid, đường xoắn giữa hai đường cong, và đường xoắn trong đường đặc trưng. Các đường xoắn đã được kiểm tra theo công thức và lược đồ LandXML, nhưng chưa kiểm tra với tệp LandXML có đường xoắn từ chương trình khác.
- Định dạng hành lang thay đổi dọc theo đường, các vùng, và mục tiêu cho mái dốc bên.
- Mạng ống nước và mạng áp lực (công việc dân dụng tiếp theo), lưu lượng thay đổi theo thời gian, và liên kết giữa mạng nước và mạng thoát nước mưa.
- Cung tròn trong đường ngắt đã vẽ. Bảng xe thiết kế tiêu chuẩn: năm xe đi kèm là ví dụ tạm thời. Đường đặc trưng dùng chung giữa các dự án sẽ chờ đến các dự án nhóm.

Mọi thứ khác nằm trong [Chưa xây dựng](topic:not-built-yet).
