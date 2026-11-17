---
title: "Ống cấp nước: áp lực, lưu lượng và lưu lượng chữa cháy"
summary: Vẽ mạng áp lực gồm các nút, hồ chứa, bể, ống, bơm và van giảm áp trên mặt bằng; CivilCraft tính cột áp, áp lực và lưu lượng (Hazen–Williams, mạng vòng), lưu lượng sẵn có cho chữa cháy, và một ngày nhu cầu. Tính năng thử nghiệm; mọi kết quả đều cần kỹ sư kiểm tra.
keywords: nước, ống nước, mạng phân phối nước, mạng áp lực, ống áp lực, mạng vòng, hazen-williams, hệ số C, tổn thất cột áp, áp lực dư, lưu lượng chữa cháy, trụ cứu hỏa, nhu cầu, nút, hồ chứa, bể, bơm, đường cong bơm, van giảm áp, prv, van một chiều, thời kỳ kéo dài, epanet, inp, vận tốc
from: df46bf6d
---

Ống cấp nước là phần áp lực của công trường: các ống luôn đầy, với nước được đẩy đi bởi hồ chứa, bể hoặc bơm. CivilCraft tính cột áp và áp lực tại mỗi nút cùng lưu lượng trong mỗi ống, kể cả mạng vòng nơi nước có nhiều hơn một đường đi. Tính năng này đang ở khu thử nghiệm (lab) trong khi được kiểm tra.

**Chỉ là công cụ hỗ trợ tính toán.** Mọi con số cần kỹ sư có chuyên môn kiểm tra: kết quả chỉ chính xác bằng các nhu cầu, cao độ, kích thước ống và giá trị độ nhám mà bạn đã nhập, và mô hình ổn định không biết gì về búa nước, chất lượng nước hay hoạt động thực tế của bơm chữa cháy.

## Vẽ mạng

1. Trong **Bề mặt** › {{ui:Thêm}}, chọn {{ui:Ống cấp nước…}}. Cửa sổ vẫn mở trong khi bạn làm việc trên mặt bằng.
2. Chọn {{ui:Hồ chứa}} và nhấp lên mặt bằng nơi có nguồn cấp. Cột áp của nó bắt đầu cao hơn mặt đất 100 ft (30 m); thay đổi trong Thuộc tính.
3. Chọn {{ui:Nút}} và nhấp vào từng vị trí có lấy nước hoặc ống gặp nhau. Nút lấy cao độ từ mặt đất; nhập cao độ khác trong Thuộc tính để ghi đè.
4. Chọn {{ui:Ống}}, nhấp một nút, rồi nhấp nút mà nó nối tới. Công cụ vẫn bật cho ống tiếp theo. {{ui:Bơm}} và {{ui:Van giảm áp}} được vẽ theo cùng cách, từ nút hút (hoặc thượng lưu) đến nút đẩy (hoặc hạ lưu). {{ui:Bể}} được đặt như một nút.
5. Chọn một nút và nhập {{ui:Nhu cầu}} của nó (gpm, hoặc L/s trong dự án mét). Chọn một ống và đặt {{ui:Đường kính}} của nó (in, hoặc mm) và, nếu bạn biết, hệ số Hazen–Williams C của nó.

Mỗi thay đổi là một bước hoàn tác. Phím Delete xóa nút và các ống kết thúc tại nó.

## Ý nghĩa của từng phần

- **Ống.** Chiều dài được đo dọc theo mặt bằng trừ khi bạn nhập một giá trị. C là độ nhám Hazen–Williams (ban đầu là 130, thay đổi mặc định trong cửa sổ). Hệ số tổn thất cục bộ K cộng thêm tổn thất của các đoạn cong và phụ kiện. Đánh dấu **Van một chiều** cho ống không được dẫn nước ngược; ống **Đóng** không dẫn gì cả.
- **Hồ chứa.** Nguồn có cột áp cố định, tức mực nước mà nó giữ trên mốc chuẩn (datum). Nó cấp hoặc lấy bất cứ lượng nước nào mạng cần.
- **Bể.** Mực nước thay đổi trong một ngày. Trong kết quả ổn định, bể là nguồn ở mực hiện tại của nó.
- **Bơm.** Một điểm thiết kế (lưu lượng và cột áp) cho đường cong thông thường đi qua nó: cột áp ở lưu lượng bằng không là 133 % cột áp thiết kế, và cột áp bằng không ở hai lần lưu lượng thiết kế. Bơm không bao giờ đẩy nước ngược.
- **Van giảm áp.** Giữ áp lực bạn đặt ở hạ lưu khi nguồn cấp cao hơn. Khi nguồn cấp thấp hơn, van mở và không giữ gì; nếu nước sẽ chảy ngược, van đóng lại.

## Đọc kết quả

Cửa sổ hiển thị cột áp và áp lực của mọi nút, cùng lưu lượng, vận tốc và tổn thất cột áp trên mỗi 1,000 ft (hoặc mỗi km) của mọi liên kết, với các nút được tô màu trên mặt bằng: xanh là nằm giữa áp lực thấp nhất và cao nhất bạn đặt, đỏ là thấp hơn, cam là cao hơn. Mũi tên lưu lượng chỉ hướng. Chọn một nút hoặc ống để đọc số liệu trong Thuộc tính.

Bên dưới các bảng là danh sách những điểm cần xem: áp lực thấp hoặc cao, ống có vận tốc vượt giới hạn của bạn, nút bị cắt khỏi mọi nguồn, hoặc bộ giải không hội tụ. Các phát hiện này cũng có trong bảng Vấn đề. Đặt giới hạn trong cửa sổ (ban đầu là 20 psi, 100 psi và 10 ft/s; 140 kPa, 700 kPa và 3 m/s trong dự án mét).

## Lưu lượng chữa cháy

{{ui:Lưu lượng chữa cháy…}} vẽ một lưu lượng tại một nút và hiển thị áp lực tại đó cùng áp lực thấp nhất ở bất kỳ đâu trong mạng. Nó cũng tìm lưu lượng sẵn có tại nút đó trong khi nút yếu nhất trong mạng giữ áp lực dư bạn đưa vào. Các nhu cầu khác giữ nguyên.

## Một ngày nhu cầu

{{ui:Một ngày nhu cầu…}} chạy mạng theo từng giờ. Nhập mẫu nhu cầu trong cài đặt của tệp (một danh sách hệ số nhân lặp lại); bể đầy và cạn theo lưu lượng vào và ra, còn bơm có thể theo mẫu bật/tắt. Bể đạt mực cao nhất hoặc thấp nhất sẽ được nêu tên trong danh sách: CivilCraft không tự đóng cửa vào hoặc cửa ra cho bạn, vì vậy hãy hiểu đó là "bể này quá nhỏ hoặc bơm quá lớn".

## Văn bản EPANET

{{ui:Lưu dạng văn bản EPANET (.inp)}} ghi mạng theo định dạng văn bản thuần mà nhiều phần mềm nước đọc được, và {{ui:Mở văn bản EPANET (.inp)…}} đọc một tệp như vậy. Chỉ những gì CivilCraft mô hình hóa được chuyển sang: nút, hồ chứa, bể, ống, bơm có đường cong cột áp, van giảm áp, mẫu nhu cầu và thời gian. Các loại van khác, bơm cho theo công suất, và các công thức tổn thất cột áp khác được nêu tên và bỏ qua. Tệp phải dùng cùng đơn vị với dự án.

## Trụ cứu hỏa, van và phụ kiện

Chọn một nút và đánh dấu **Trụ cứu hỏa** để đặt một trụ tại đó; chọn một ống chính và nhấn **Thêm ở giữa** để đặt van, van xả khí, van xả đáy hoặc đồng hồ đo lên đó. Chúng là đối tượng của mạng: di chuyển cùng mạng và một bước hoàn tác sẽ xóa chúng.

Bố trí cũng ngầm bao hàm các phụ kiện, và CivilCraft liệt kê chúng mà không cần yêu cầu: một **tê** nơi ba ống chính gặp nhau, một **thập** nơi bốn ống gặp nhau, một **co** (kèm góc) nơi hai ống chính rẽ từ 5° trở lên, một **côn thu** nơi hai cỡ gặp nhau, và một **nắp bịt** tại đầu cụt. {{ui:Bảng thống kê phụ kiện (CSV)}} đếm chúng và các ống chính theo cỡ. Đây là những gì bố trí ngầm bao hàm, một bảng bóc tách để đối chiếu với chi tiết của riêng bạn, không phải danh sách để đặt hàng.

Ống chính được đặt ở mặt đất trừ đi một lớp phủ (4 ft hoặc 1.2 m) để có thể vẽ và mô hình hóa trong 3D; các áp lực nêu trên không bao giờ phụ thuộc vào điều này.

## Trên mặt bằng và trong tệp

Mặt bằng, PDF và DWG hoặc DXF mang các ống chính trên **C-WATR-MAIN**, cỡ ống trên **C-WATR-TEXT**, trụ cứu hỏa trên **C-WATR-HYDR**, van trên **C-WATR-VALV** và phụ kiện trên **C-WATR-FITT**. Xuất LandXML ghi một mạng ống nước (một công trình cho mỗi nút, một ống cho mỗi ống chính, trụ cứu hỏa được đặt tên); nhập LandXML đọc lại mạng đó dưới dạng ống chính cấp nước, không có nhu cầu, bơm hay van, vì LandXML không mang các thông tin này. Xuất IFC ghi các ống chính dưới dạng đoạn ống, trụ cứu hỏa, van và phụ kiện trong một hệ thống nước. Các tệp này đã được kiểm tra bằng bộ đọc và bộ ghi của chúng tôi; hãy thử chúng trong các chương trình khác của bạn và cho chúng tôi biết kết quả.

## Chưa có ở đây

Chất lượng và tuổi nước, điều khiển và quy tắc ngoài mẫu bật/tắt của bơm, các loại van khác, nhu cầu theo áp lực, ống có đường kính thay đổi, và lưu lượng nước thải theo thời gian. Xem [Chưa xây dựng](topic:not-built-yet). Lưu lượng thiết kế vệ sinh, vốn là một phép tính khác, nằm trong [Lưu lượng thiết kế vệ sinh](topic:sanitary-design).
