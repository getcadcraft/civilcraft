---
title: Bóng đổ, sản lượng điện mặt trời và tiện nghi ngoài trời
summary: Nghiên cứu bóng đổ mà các khối nhà của bạn tạo ra trong một ngày hoặc một mùa, xem hoạt ảnh của nó, tính lượng điện mà các tấm pin mặt trời trên mái và tường sẽ tạo ra trong một năm điển hình, xem mức độ dễ chịu của con đường bên cạnh tòa nhà (UTCI), và nhận chỉ số sàng lọc về tiện nghi gió cho người đi bộ.
keywords: nghiên cứu bóng đổ, bóng, giờ nắng, hoạt ảnh, mặt trời, solar, PV, quang điện, tấm pin, sản lượng, kWh, EPW, tệp thời tiết, UTCI, tiện nghi nhiệt, tiện nghi ngoài trời, căng thẳng nhiệt, gió
from: 96e7af4d
---

Mục **Môi trường** nằm dưới **Giờ nắng** trong **Thuộc tính** của một khối. Nó dùng các khối bạn đã vẽ làm công trình.

## Tải tệp thời tiết

Chọn một tệp thời tiết năm điển hình (**.epw**) cho thị trấn của bạn. Chúng miễn phí từ trang thời tiết EnergyPlus và từ climate.onebuilding.org. Tệp ở lại trong trình duyệt của bạn cho lần truy cập này. Sản lượng điện mặt trời và nghiên cứu tiện nghi cần nó; nghiên cứu bóng đổ vẫn chạy được không cần nó khi dự án có hệ tọa độ.

## Nghiên cứu bóng đổ

Chọn một ngày (hoặc chọn **Mùa** rồi chọn ngày cuối và bước tính theo ngày) và múi giờ, sau đó **Chạy nghiên cứu bóng đổ**. Bạn nhận được bản đồ số giờ nắng, hoặc bóng, trên mặt đất quanh các khối; một bảng cho biết bao nhiêu phần mặt đất bị che bóng trong ngày; và hoạt ảnh của ngày mà bạn có thể phát hoặc xem từng bước. **Lưu bản đồ**, **Lưu khung hoạt ảnh** (tất cả khung trên một ảnh) và **Lưu số giờ** (CSV) giữ lại kết quả.

Mặt đất được coi là phẳng ở cao độ của khối thấp nhất. Để xem bóng trên mặt đất dốc, hãy dùng **Giờ nắng**, mục này đọc địa hình.

## Sản lượng điện mặt trời

Đặt hiệu suất tấm pin, tỷ lệ phủ của mỗi mái và tường, và tổn thất của hệ thống, rồi **Chạy sản lượng điện mặt trời**. Với mỗi mái và tường, bạn nhận được lượng điện một mét vuông tấm pin sẽ tạo ra trong một năm điển hình, bao nhiêu trong đó bị các khối lân cận lấy đi, và tổng cho mỗi khối. Mô hình được viết bằng lời thường ngay cạnh nút: đây là ước tính để lập kế hoạch từ một năm điển hình, không phải là cam kết.

## Tiện nghi ngoài trời

**Chạy tiện nghi** tính Chỉ số khí hậu nhiệt phổ quát (UTCI) cho một người đứng trên nền đất trống và bên cạnh khối đầu tiên (các phía nam, bắc, đông và tây), có tính bóng của mọi khối. Kết quả cho biết bao nhiêu bầu trời nhìn thấy được, UTCI trung bình ban ngày, và số giờ trên 32 (căng thẳng nhiệt) và dưới 0 (căng thẳng lạnh).

## Gió (sàng lọc)

**Chạy nghiên cứu gió** giải dòng khí quanh các khối của bạn một lần cho mỗi hướng gió thổi trong tệp thời tiết (4, 8, 12 hoặc 16 hướng), trên vùng xung quanh bạn chọn (vùng quê, ngoại ô hoặc trung tâm thành phố), rồi cộng gió theo giờ của cả năm. Bản đồ tô màu mặt đất theo lớp tiện nghi, từ xanh lục (**ngồi**) qua **đứng**, **đi dạo** và **đi bộ** đến đỏ (**không thoải mái**): hoạt động có tốc độ giới hạn (4, 6, 8 và 10 m/s) bị vượt quá không quá 5 % số giờ. Bảng thứ hai cho cấp NEN 8100 (A đến E) theo tỷ lệ số giờ gió vượt 5 m/s. Hệ số giật nhân với trung bình theo giờ để có cơn giật hiệu dụng.

Cách hoạt động, bằng lời thường: một bộ giải dòng xoáy lớn lattice-Boltzmann (của chúng tôi, trong thư viện `lib/wind`) trong một hộp quanh các công trình, một biên dạng tốc độ gió tăng theo độ cao theo độ nhám đã chọn, và tốc độ ở khoảng 1.5 m trên mặt đất so với tốc độ ngược dòng ở 10 m. **Sàng lọc** nhanh và thô; **Tiêu chuẩn** dùng nhiều ô hơn và chạy lâu hơn nhiều. Nếu bảng báo lưới thô (dưới 10 ô trên công trình cao nhất), hoặc dòng chảy vẫn đang thay đổi, hãy tin bản đồ ít hơn.

**Giới hạn của công cụ này.** Bộ giải đã được kiểm tra trên các dòng chảy giáo khoa (một kênh, một hốc dẫn động bởi nắp) và chạy trên một khối lập phương để xem vệt xoáy sau và sự tăng tốc ở các góc có đúng không. Nó **chưa** được kiểm chứng với các phép đo trong hầm gió trên công trình, nên mọi kết quả đều được ghi là chưa kiểm chứng. Đừng dùng nó cho một giá trị thiết kế, tải trọng gió hay chứng nhận lập kế hoạch: một kỹ sư gió phải chạy và xác nhận một nghiên cứu đúng quy cách. Mặt đất phẳng, tường công trình nhẵn, đường tắt về độ nhám theo trạm khí tượng và bảng ngưỡng là các giản lược; các ngưỡng có thể khác với tiêu chí mà cơ quan chức năng của bạn sử dụng.

## Gió với OpenFOAM (tiện ích bổ sung)

Bộ máy gió tích hợp ở trên là thử nghiệm. Để có bộ giải dòng chảy chuẩn, bật tiện ích bổ sung **Gió cho người đi bộ (OpenFOAM)** trong **Cài đặt > Tiện ích bổ sung** (nó tắt cho đến khi bạn bật). Đây là phần mềm theo giấy phép GPL riêng, được tách khỏi phần còn lại của CadCraft, và nó không bao gồm OpenFOAM: bạn tự cài đặt OpenFOAM. Khi đó **Bộ máy** trong khối gió sẽ liệt kê OpenFOAM.

Những gì bạn cần thiết lập, một lần:

1. **Cài đặt OpenFOAM** (dòng ESI v từ openfoam.com; tiện ích được kiểm thử với v2512). Trên Ubuntu hoặc Debian (cũng trong WSL trên Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, rồi `sudo apt install openfoam2512-default`. Nó được cài dưới `/usr/lib/openfoam/openfoam2512`. CadCraft cần `blockMesh`, `snappyHexMesh` và `simpleFoam` để chạy. (Gói `openfoam` 1912 cũ hơn trong kho lưu trữ của chính Ubuntu cũng chạy được, nhưng các đối tượng hàm (function objects) của nó bị sập; khi đó tiện ích tự đọc các tệp kết quả.)
2. **Khởi động trình trợ giúp** từ thư mục `runner` của tiện ích bằng Node.js: `node cc-openfoam-runner.mjs serve`. Nếu OpenFOAM không nằm trên đường dẫn tìm kiếm, đưa cho nó một tệp `runner.json` nhỏ với đường dẫn tới `etc/bashrc` của OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) và khởi động bằng `--config runner.json`. Trình trợ giúp chỉ lắng nghe trên máy tính này và in ra một mã thông báo.
3. **Dán mã thông báo** vào các ô của tiện ích trong khối gió (địa chỉ giữ nguyên là `http://127.0.0.1:8765`) rồi nhấn **Kiểm tra trình trợ giúp**.

Sau đó **Chạy nghiên cứu gió** thực hiện một trường hợp cho mỗi hướng gió trong tệp thời tiết: các khối của bạn trở thành một bề mặt (STL) trong một hộp có kích thước theo hướng dẫn thông thường (5 lần chiều cao công trình về mọi phía và phía trên, 10 phía sau), được chia lưới bằng blockMesh và snappyHexMesh, chạy dưới dạng RANS k-epsilon ổn định với đầu vào lớp biên khí quyển theo độ nhám bạn chọn, và tốc độ tại 1.5 m được đọc lại và chuyển thành cùng các lớp Lawson và NEN 8100. Không có gì rời khỏi máy tính của bạn.

**Những gì đã được kiểm tra.** Văn bản phía trên kết quả nói rõ điều này và là một phần của mọi tệp CSV đã lưu. Việc ghi trường hợp, đọc kết quả và toàn bộ quy trình của tiện ích được kiểm thử mà không có OpenFOAM, và một khối lập phương đã được chạy qua OpenFOAM thật ở ba kích thước lưới (các con số nằm trong ghi chú dự án). Nó **chưa** được kiểm chứng với các phép đo trong hầm gió trên công trình. Đây là chỉ số sàng lọc, không phải giá trị thiết kế và không phải chứng nhận. k-epsilon tiêu chuẩn thường dự đoán quá cao độ rối phía trước công trình, mặt đất phẳng, tường nhẵn và không có địa hình hay thảm thực vật.

