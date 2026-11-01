---
title: Có gì mới trong 0.7
summary: CivilCraft 0.7 bổ sung không gian làm việc Đường dây điện (đường dây trên không và cáp ngầm với thư viện riêng của bạn, độ võng và lực căng, kiểm tra khoảng cách và độ bền, bảng căng dây, khối lượng, tờ bản vẽ và GIS), không gian làm việc Cảnh quan (danh sách cây, mặt bằng trồng cây và bảng thống kê, san nền cảnh quan, lát nền, tường và bậc, công cụ tính tưới tiêu, tờ cảnh quan và đối tượng tự do), khối công trình với giới hạn quy hoạch bạn nhập và giờ nắng, đường cong chuyển tiếp clothoid, hành lang dựng từ các bộ phận mỗi bên, xuất USD và thêm công cụ cho các trợ lý AI.
keywords: có gì mới, ghi chú phát hành, nhật ký thay đổi, thay đổi, 0.7, phiên bản, tính năng mới, cảnh quan, không gian làm việc cảnh quan, danh sách cây, cây, trồng cây, bảng thống kê cây, luống, hàng rào cây, san nền, nền phẳng, đê đất, rãnh trũng, cao độ điểm, phân tích độ dốc, đọng nước, cảnh quan cứng, lát nền, lối đi, tường, đá vỉa, dốc, bậc, tưới tiêu, đầu phun, nhỏ giọt, tờ cảnh quan, đối tượng tự do, khối công trình, tạo khối, tổng diện tích sàn, quy hoạch, lùi, đường bao, mặt phẳng trời, hệ số sử dụng đất, mật độ xây dựng, giờ nắng, bóng đổ, ifc, phát triển trong bimcraft, đường cong chuyển tiếp, clothoid, chuyển tiếp, cấu tạo, bó vỉa, rãnh thoát nước, vỉa hè, usd, trợ lý, đơn vị, tiếng bồ đào nha
from: 3c9d79db
---

Đây là những thay đổi trong CivilCraft 0.7 so với 0.6. Phần mới lớn nhất là các không gian làm việc Đường dây điện và Cảnh quan, cùng khối công trình.

## Mới

### Không gian làm việc Cảnh quan

- **Một không gian làm việc Cảnh quan trên cùng khu đất.** {{ui:Bề mặt}} › {{ui:Thêm}} › {{ui:Không gian làm việc Cảnh quan}} thêm các công cụ trồng cây, san nền, cảnh quan cứng và tưới tiêu vào khu đất bạn đã có: cùng các điểm đo, bề mặt và tệp dự án. Chọn **Civil** dưới **Workspace** để quay lại. Xem [Không gian làm việc Cảnh quan](topic:landscape).
- **Danh sách cây.** Khoảng 420 loại cây thân gỗ, cây bụi, hàng rào cây, cỏ, cây lâu năm, cây phủ đất và cây leo phổ biến vùng ôn đới và Địa Trung Hải, kèm kích thước lúc trồng và lúc trưởng thành, vùng chịu lạnh, ánh sáng, nước và khoảng cách trồng. Tìm theo bất kỳ tên nào bằng tiếng Anh, Tây Ban Nha hoặc Bồ Đào Nha. Nhập danh sách của riêng bạn dạng CSV; nó được lưu cùng dự án. Các kích thước có sẵn là điển hình và đã làm tròn: hãy kiểm tra với vườn ươm địa phương. Xem [Danh sách cây](topic:plant-list).
- **Mặt bằng trồng cây.** {{ui:Cây}} đặt từng cây nằm trên mặt đất và đi theo việc san nền sau đó, {{ui:Luống}} lấp đầy một đường viền theo khoảng cách trồng với hỗn hợp theo phần trăm, và {{ui:Hàng rào cây}} đặt một hoặc hai hàng dọc theo một đường. Cây được ghi nhãn trên mặt bằng. Xem [Mặt bằng trồng cây và bảng thống kê](topic:planting).
- **Bảng thống kê cây.** Thêm › {{ui:Bảng thống kê cây…}} đếm cây theo loài và cỡ trồng. Lưu thành CSV hoặc XLSX, hoặc gửi sang TakeoffCraft để báo giá. Xem [Bảng thống kê cây](topic:planting#the-plant-schedule).
- **San nền cho cảnh quan.** {{ui:San nền}} có nền phẳng (bằng hoặc dốc), đê đất, rãnh trũng, và vùng san nền với cao độ điểm và đường đồng mức bạn kéo được. Đào và đắp hiện ra khi bạn làm. **Slope analysis** tô màu bề mặt theo hai giới hạn của riêng bạn, và **Flow arrows and ponding** cho thấy nước chảy đâu và sẽ đọng ở đâu. Tất cả đi vào cùng bề mặt dự kiến như nền và hành lang. Xem [San nền cho cảnh quan](topic:landscape-grading).
- **Lát nền, lối đi, tường, đá vỉa, dốc và bậc.** {{ui:Cảnh quan cứng}} vẽ lát nền với độ dốc ngang hoặc dốc về ga thoát nước, một mẫu và các lớp của nó; lối đi bám theo mặt đất; tường chắn và tường đứng riêng với móng bậc; đá vỉa; và dốc cùng bậc được kiểm tra theo các giới hạn bạn đặt. Tường chắn cao trên 1,2 m (4 ft) được đánh dấu để kỹ sư xem. Xem [Lát nền, tường và bậc](topic:hardscape).
- **Công cụ tính tưới tiêu.** {{ui:Tưới tiêu}} đặt đầu phun, ống nhánh, ống chính, van, đường nhỏ giọt và điểm đấu nối. {{ui:Kiểm tra hệ thống…}} tìm các vùng từ các đường ống và tính lưu lượng của mỗi vùng, áp suất cần tại van của nó và tại nguồn cấp (Hazen–Williams), lượng mưa nhân tạo, thời gian chạy, độ phủ và bảng vật tư. Đây là công cụ hỗ trợ tính toán, không phải chứng nhận thiết kế: người thiết kế tưới tiêu kiểm tra mọi kết quả. Đầu phun là các loại chung, hoặc của riêng bạn từ một tệp. Xem [Thiết kế tưới tiêu](topic:irrigation).
- **Tờ cảnh quan.** Thêm › {{ui:Tờ cảnh quan…}} tạo mặt bằng trồng cây, san nền và tưới tiêu cùng chú giải của chúng, và một tờ chi tiết gồm mặt cắt tường, cấu tạo lát nền và bậc, thành một PDF. Xem [Tờ cảnh quan](topic:landscape-sheets).
- **Đối tượng tự do.** Thêm › {{ui:Đối tượng tự do…}} đặt một lưới STL, OBJ hoặc mục thư viện làm từ ứng dụng khác, như chậu cây hay một tác phẩm điêu khắc. Nó nằm trên mặt đất hoặc cắt vào đó, và thể tích, diện tích cùng diện tích chiếm đất của nó được tính. Xem [Đối tượng tự do](topic:freeform-objects).
- **IFC cảnh quan.** Thêm › {{ui:Xuất IFC cảnh quan}} lưu cây (dưới dạng thảm thực vật cùng thuộc tính của chúng), cảnh quan cứng và đối tượng tự do thành IFC 4.3 cho mô hình BIM. Xem [IFC](topic:planting#ifc).
- **Từ đầu đến cuối.** [Thiết kế một khu vườn, từ đầu đến cuối](topic:landscape-walkthrough) đi qua toàn bộ không gian làm việc trên khu đất mẫu.

### Không gian làm việc Đường dây điện

- **Đường dây trên không và cáp ngầm trên khu đất của bạn.** {{ui:Bề mặt}} › {{ui:Thêm}} › {{ui:Không gian làm việc Đường dây điện}}: vẽ một đường dây theo các trụ đỡ, cáp trong rãnh, thiết bị và chướng ngại, trên cùng mặt đất và trong cùng tệp dự án. Xem [Không gian làm việc Đường dây điện](topic:power-lines).
- **Thư viện của riêng bạn.** Dây dẫn, cáp, trụ đỡ, thiết bị (xà ngang, sứ cách điện, phụ kiện, dây néo, máy biến áp, tủ, hộp nối) và loại rãnh, trong các danh mục bạn đặt tên, chia sẻ dưới dạng tệp hoặc bảng tính. Không có danh mục của quốc gia hay nhà sản xuất nào được tích hợp; các ví dụ ghi rõ chúng là ví dụ. Xem [Thư viện đường dây điện của bạn](topic:power-line-library).
- **Độ võng và lực căng theo các trường hợp tải của bạn.** Nhiệt độ, gió, băng và băng một bên; giới hạn lực căng theo tỷ lệ của lực phá hủy; đường dây xích chính xác trên mọi nhịp, kể cả nhịp dốc; bảng căng dây. Xem [Độ võng và lực căng](topic:sag-and-tension).
- **Kiểm tra, luôn cập nhật.** Khoảng cách tới mặt đất và chướng ngại, khoảng cách pha, độ lắc của sứ, lực nhổ, tải trọng trụ đỡ với việc chọn cỡ từ thư viện của bạn, dây néo, phụ kiện, móng, dữ liệu thiếu, cáp bị ngắt, quá tải và sụt áp, được đánh dấu trên mặt bằng và trên trắc dọc đường dây. Đây là công cụ hỗ trợ thiết kế: kỹ sư kiểm tra. Xem [Kiểm tra đường dây điện](topic:power-line-checks).
- **Bảng, tờ bản vẽ và GIS.** Bảng căng dây và trụ đỡ, khối lượng (CSV, Excel, TakeoffCraft), tờ mặt bằng và trắc dọc cùng báo cáo nghiên cứu trong một PDF, lớp GIS với dữ liệu của mọi tài sản. Xem [Bảng, khối lượng, tờ bản vẽ và GIS của đường dây điện](topic:power-line-outputs).
- **Sau những lần thử đầu.** Trắc dọc đường dây đi theo đường dây bạn chọn, có danh sách **Line**, đọc mặt đất, dây dẫn và khoảng cách dưới con trỏ và đo giữa hai điểm. Cây và tường cảnh quan được tính là chướng ngại dưới đường dây; tuyến cáp và ống hiện trong trắc dọc đường dây và giao cắt theo quy tắc khoảng cách bạn chọn; **Rules…** bên cạnh mỗi khoảng cách mở các quy tắc của riêng bạn; và các bộ quy tắc kèm thư viện được lưu thành gói để chia sẻ theo quốc gia. Xem [Kiểm tra đường dây điện](topic:power-line-checks) và [Gói](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Định dạng tệp riêng của bạn.** Đường dây điện được lưu trong tệp dự án CivilCraft, thư viện trong `.cclines.json` hoặc CSV, bộ quy tắc và gói trong các tệp JSON riêng của chúng: định dạng mở mà ai cũng đọc hoặc chuyển đổi được. Tệp nghiên cứu `.DON` là phần nhập và xuất bổ sung bên cạnh chúng.
- **Tệp nghiên cứu (.DON), chưa kiểm thử.** Lưu một đường dây thành tệp nghiên cứu `.DON` cho chương trình đường dây khác, hoặc đọc các trụ đỡ của một tệp; được dựng từ tên trường của định dạng, chưa thử với chương trình đó. Xem [Tệp nghiên cứu](topic:power-line-study-file).

### Đo

- **Công cụ Đo.** {{ui:Bề mặt}} › {{ui:Thêm}} › {{ui:Đo}} (hoặc {{key:M}}) đo trên mặt bằng: chiều dài và phương vị của từng cạnh, tổng cộng dồn, chiều dài dọc theo mặt đất và độ dốc, cùng diện tích và chu vi khi bạn khép hình. Không có gì được vẽ vào dự án. Xem [Đo](topic:measure).

### Khối công trình

- **Vẽ khối công trình.** Trong Thuộc tính, dưới **Building masses**, {{ui:Vẽ một khối}} (cũng là {{ui:Bề mặt}} › {{ui:Thêm}} › {{ui:Khối}}). Cho một khối số tầng và chiều cao tầng rồi đọc tổng diện tích sàn của nó. Chọn cách nó đặt trên nền dốc (bậc, bệ hoặc đào) và xem đắp và đào. Các khối hiện trên mặt bằng, trong PDF và trong DWG và DXF trên các lớp riêng của chúng. Xem [Vẽ khối công trình trên khu đất](topic:building-masses).
- **Đẩy và kéo trong 3D.** Trong khung nhìn 3D, kéo mái của một khối đã chọn, hoặc nhấn {{key:PageUp}} và {{key:PageDown}}, để đổi từng tầng một, trong một bước hoàn tác. **Sun** đổ bóng của các khối. Xem [Trong khung nhìn 3D](topic:building-masses#in-the-3d-view).
- **Giới hạn quy hoạch bạn nhập.** Khoảng lùi từng đường tính từ chỉ giới đường đỏ, giới hạn chiều cao, mặt phẳng lộ trời, hệ số sử dụng đất và mật độ xây dựng. Đường bao được phép xây vẽ trên mặt bằng, và mỗi khối nhận một dấu tích hoặc dấu chéo cho từng giới hạn. CivilCraft không chứa quy chuẩn quy hoạch nào: mọi con số là số bạn nhập từ quy định của riêng bạn. Xem [Kiểm tra khối theo giới hạn quy hoạch bạn nhập](topic:zoning-limits).
- **Giờ nắng.** Chọn một ngày, hoặc một mùa, và một múi giờ theo tên hoặc độ lệch, rồi đọc số giờ nắng trực tiếp trên mọi bức tường của mọi khối, từng tầng một, và trên mặt đất quanh chúng, vẽ trên mặt bằng. Lưu các bức tường và mặt đất thành CSV. Dự án cần một hệ tọa độ. Xem [Tính số giờ nắng trên một khu đất](topic:sun-hours).
- **Khối dạng IFC, và chuyển tiếp sang BimCraft.** {{ui:Khối dạng IFC}} lưu các khối thành IFC4, đặt trên bản đồ khi dự án có hệ tọa độ. {{ui:Phát triển trong BimCraft}} mở BimCraft trong một thẻ mới cùng các khối, nơi **Develop this mass** dựng tường ở mọi tầng và một sàn từ dấu chân. Không có gì được tải lên. Xem [Gửi tiếp](topic:building-masses#send-it-on).

### Tuyến

- **Đường cong chuyển tiếp clothoid.** Nhập chiều dài vào **Spiral in** và **Spiral out** trong bảng PI cho một đường cong: tiếp tuyến, chuyển tiếp, đường cong, chuyển tiếp, tiếp tuyến, với chiều dài bằng nhau hoặc khác nhau. Mặt bằng ghi nhãn TS, SC, CS và ST, danh sách đường cong cho θs cùng các khoảng cách tiếp tuyến và ngoại, và cọc cùng độ lệch chạy qua các đoạn chuyển tiếp. Xem [Đường cong chuyển tiếp](topic:alignment#spirals).
- **Đường cong chuyển tiếp trong LandXML.** LandXML ghi và đọc đường cong chuyển tiếp clothoid. Các tuyến có đường cong chuyển tiếp, mà trước đây CivilCraft bỏ qua khi nhập, giờ mở được. Xem [Trao đổi LandXML](topic:landxml).

### Hành lang

- **Dựng mỗi bên từ các bộ phận.** Bật **Build each side from parts** để cho mỗi bên một danh sách riêng từ tim tuyến ra ngoài: làn xe, lề, rãnh thoát nước, bó vỉa, dải trồng cây, vỉa hè và mái dốc bên với đào và đắp riêng. Bắt đầu từ {{ui:Đường nông thôn}} hoặc {{ui:Đường đô thị}} và sao chép một bên sang bên kia. Trắc ngang đánh dấu đường chảy, bó vỉa và lối đi bộ, và bề mặt đã san có bó vỉa. Xem [Dựng mỗi bên từ các bộ phận](topic:corridor#build-each-side-from-parts).
- **Siêu cao trên đường cong chuyển tiếp.** Trên đường cong có chuyển tiếp, đoạn nâng siêu cao chạy trên đoạn chuyển tiếp: mui phẳng tại TS, siêu cao đầy đủ tại SC. Xem [Siêu cao](topic:corridor#superelevation).

### Tệp 3D

- **Xuất USD.** Trong khung nhìn 3D, {{ui:USD}} ghi khu đất thành `.usda`, `.usdc` hoặc `.usdz` ở tỷ lệ thật và tại tọa độ dự án của nó: bề mặt, ống và công trình dưới dạng lưới, các đường, từng tuyến, và điểm đo cùng số của chúng. Xem [Xuất khu đất 3D thành USD](topic:usd).

### Trợ lý AI

- **Thêm cho trợ lý.** Khi trợ lý được bật trong {{ui:Cài đặt}} › {{ui:CivilCraft}}, một trợ lý giờ còn có thể đọc thửa đất, đào đắp và trắc dọc, thêm điểm đo, lưu dự án, xuất LandXML, DWG và USD, và làm việc trong các thư mục bạn chọn trong CadCraft Studio. Không gian làm việc Cảnh quan thêm công cụ để tìm cây, đặt cây, luống và hàng rào cây, san nền và kiểm tra tưới tiêu. Máy chủ tệp và dòng lệnh `cadcraft` mở các dự án đã lưu mà không cần cửa sổ. Xem [Để trợ lý AI làm việc với khu đất của bạn](topic:assistants).

## Trong mọi ứng dụng

- **Đơn vị.** {{ui:Cài đặt}} › {{ui:Chung}} › {{ui:Đơn vị}} có một danh sách riêng cho chiều dài, diện tích, thể tích, góc và độ dốc, với các cỡ chính xác theo định nghĩa của đơn vị (feet khảo sát Mỹ là một đơn vị riêng). Tắt những đơn vị bạn không bao giờ dùng và chúng rời khỏi danh sách đơn vị; gắn sao một đơn vị và công việc mới bắt đầu bằng nó. Một tệp luôn giữ đơn vị riêng của nó. Trong CivilCraft, danh sách **Units** của dự án theo các công tắc; sao ở một đơn vị chiều dài hệ mét bắt đầu dự án mới bằng mét (nếu không thì feet, là feet khảo sát Mỹ), sao ở một đơn vị diện tích hoặc thể tích đặt đơn vị báo cáo diện tích và thể tích, và ô chiều dài nhận ký hiệu của mọi đơn vị, như `3 ch` hoặc `450 mm`. Xem [Đơn vị, giá trị nhập và các danh sách đơn vị](common:unit-lists).
- **Bố cục dày hơn và các bảng tự gọn lại.** {{ui:Cài đặt}} › {{ui:Chung}} › {{ui:Mật độ bố cục}} › {{ui:Gọn}} chứa được nhiều hơn trên màn hình (màn hình cảm ứng và điện thoại giữ các nút lớn). Mỗi bảng bên có một thanh tiêu đề mảnh: kéo nó để neo hoặc cho bảng nổi, thả nó lên thanh của bảng khác để dùng chung một khung dưới dạng các thẻ, ghim nó để trượt ra mép, hoặc ẩn nó và gọi lại từ mép. Xem [Sắp xếp các bảng](common:arrange-panels#make-the-layout-denser).
- **Hộp thoại di chuyển được.** Kéo một hộp thoại bằng thanh tiêu đề để tránh khỏi bản vẽ; nó trở lại nơi bạn để. Nhấp đúp thanh tiêu đề để căn giữa lại. Xem [Di chuyển hộp thoại](common:arrange-panels#move-a-dialog).
- **Công thức cho trợ lý AI.** Mười yêu cầu mẫu cho trợ lý của riêng bạn (dọn bản vẽ, in một bộ, kiểm tra bản vẽ, hỏi mô hình, cộng một bản bóc tách, thử một biến thể chi tiết…), mỗi yêu cầu kèm các công cụ nó gọi và quyền nó cần, và mỗi yêu cầu được các bài kiểm thử của chúng tôi chạy lại. Các ứng dụng không chứa AI. Xem [Công thức cho trợ lý AI](common:assistants-recipes).
- **Ngôn ngữ.** **Português (Portugal)** là mới trong {{ui:Cài đặt}} › {{ui:Chung}} › {{ui:Ngôn ngữ}}. Nó, **Português (Brasil)**, **Español (México)** và **Bahasa Indonesia** giờ có đủ mọi chữ của các ứng dụng, dưới dạng bản nháp chưa được người bản ngữ xem xét. Các chủ đề trợ giúp bằng tiếng Anh, một số bằng tiếng Tây Ban Nha.
- **CadCraft Studio** nói rõ vì sao kiểm tra cập nhật thất bại (chưa có tệp cho hệ thống của bạn, không có mạng, chữ ký sai) thay vì chỉ "Done", và ngừng đưa lại thẻ Có gì mới mà bạn đã đóng cho đến khi có bản phát hành mới hơn.

## Chưa có trong phiên bản này

- **0.7 chưa được ký mã.** Việc ký, và gói Microsoft Store, đã chuyển sang 0.8 vì việc xác thực chứng chỉ chưa xong. Hãy kiểm tra SHA-256 bên cạnh mỗi tệp trên getcadcraft.com/download. Trên Windows, nếu SmartScreen chặn trình cài đặt, chọn {{ui:Thông tin thêm}}, rồi {{ui:Vẫn chạy}}. Trên Mac, lần đầu, nhấp chuột phải vào CadCraft Studio và chọn {{ui:Mở}}. CadCraft Studio chưa có trên cửa hàng ứng dụng nào, và chưa có bản cho iPad hay iPhone.
- Các danh sách góc và độ dốc trong {{ui:Đơn vị}} được lưu, nhưng chưa có ô nào đọc chúng.
- Đầu phun tưới của nhà sản xuất: chỉ có đầu phun chung và đầu phun của riêng bạn từ một tệp. Dữ liệu của nhà sản xuất chỉ được đưa vào khi họ cho phép, và chưa có ai cho phép.
- BimCraft và ModelCraft mang theo danh sách cây, nhưng chức năng Đặt từ thư viện của chúng chưa đưa ra cây. Cây đến BimCraft qua IFC cảnh quan.
- Các công cụ cảnh quan cho trợ lý hoạt động khi cửa sổ CivilCraft đang mở; máy chủ tệp và dòng lệnh chưa có chúng.
- Khối công trình: không có ánh sáng ban ngày hay gió ở mặt đứng, không có bóng đổ từ cây hay bất cứ thứ gì không vẽ thành khối, không có hình dạng mái, và giờ nắng hiện trên mặt bằng, không phải trong khung nhìn 3D. Phát triển trong BimCraft dựng tường trơn và một sàn, không có lỗ mở hay mái.
- Đường dây điện: không tích hợp tiêu chuẩn của quốc gia nào (bạn đặt các trường hợp tải, giới hạn và khoảng cách); không có độ dão dây dẫn, định mức nhiệt của cáp chôn, ngắn mạch, bảo vệ hay nghiên cứu nối đất; không có đường dây trong khung nhìn 3D hay IFC. Tệp nghiên cứu `.DON` chưa được thử với chương trình đọc nó.
- Đường cong chuyển tiếp không phải clothoid, đường chuyển tiếp giữa hai đường cong, và đường chuyển tiếp trong đường đặc trưng. Các đường chuyển tiếp đã được kiểm tra theo công thức và lược đồ LandXML, chưa kiểm tra với tệp LandXML có đường chuyển tiếp từ chương trình khác.
- Cấu tạo hành lang thay đổi dọc đường, vùng, và mục tiêu cho mái dốc bên.
- Đường ống cấp nước chính và mạng áp lực (công việc dân dụng tiếp theo), dòng chảy thay đổi theo thời gian, và liên kết giữa mạng cấp nước và mạng thoát nước mưa.
- Cung tròn trong đường ngắt đã vẽ. Bảng phương tiện thiết kế tiêu chuẩn: năm phương tiện đi kèm là chỗ giữ chỗ có ghi nhãn. Đường đặc trưng dùng chung giữa các dự án chờ dự án nhóm.

Mọi thứ còn lại nằm trong [Chưa xây dựng](topic:not-built-yet).
