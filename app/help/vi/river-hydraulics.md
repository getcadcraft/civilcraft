---
title: Trắc dọc mặt nước sông
summary: Mô hình hóa một con sông từ bề mặt địa hình và tính trắc dọc mặt nước ổn định theo phương pháp bước tiêu chuẩn: mực nước, năng lượng, vận tốc, số Froude và phạm vi ngập trên bình đồ. Tính năng thử nghiệm; mọi kết quả cần kỹ sư xem xét.
keywords: đê, vùng dòng chảy không hiệu quả, trình soạn mặt cắt, sông, thủy lực, trắc dọc mặt nước, nước dâng ngược, bước tiêu chuẩn, dòng chảy ổn định, 1d, mặt cắt ngang, manning, độ nhám, khả năng dẫn lưu, độ sâu tới hạn, độ sâu đều, froude, đường năng lượng, phạm vi ngập lụt, vùng ngập, bờ sông, cọc bờ, chiều dài đoạn sông, co hẹp, mở rộng, dưới tới hạn, trên tới hạn, chế độ hỗn hợp, nhảy thủy lực
from: fb8bf425
---

CivilCraft tính trắc dọc mặt nước ổn định, một chiều dọc theo sông: với mỗi lưu lượng bạn nhập, mực nước tại mọi mặt cắt ngang, từ cân bằng năng lượng giữa các mặt cắt kề nhau (phương pháp bước tiêu chuẩn). Tính năng này đang nằm trong phòng thử nghiệm khi được kiểm tra.

**Chỉ là công cụ hỗ trợ thiết kế.** Mực nước cần kỹ sư có chuyên môn xem xét trước khi bất kỳ ai dựa vào chúng: mô hình một chiều chỉ tốt bằng các mặt cắt, giá trị độ nhám, chiều dài đoạn sông và biên của nó, và mô hình không biết về cầu, cống hay dòng chảy tràn ra khỏi sông.

## Vẽ sông

1. Dựng bề mặt địa hình hiện trạng trước (điểm, đường ngắt, hoặc TIN bạn đã mở).
2. Trong **Bề mặt** › {{ui:More}}, chọn {{ui:River}}.
3. Nhấp dọc theo đường tâm sông **từ thượng lưu xuống hạ lưu**, rồi nhấn {{key:Enter}} hoặc nhấp đúp.

CivilCraft cắt một mặt cắt vuông góc với đường tâm mỗi 50 m (200 ft), dài 100 m (300 ft) về mỗi phía, từ địa hình. Cọc sông được đo từ đầu hạ lưu, nên tăng dần về phía thượng lưu. Bờ ban đầu là ước đoán cách điểm thấp nhất của mỗi mặt cắt 10 m (30 ft) về mỗi phía.

Để thêm một mặt cắt nơi sông thu hẹp hoặc có công trình, chọn sông, nhấn {{ui:Add a section}} và vẽ một đường cắt ngang qua sông (theo chiều nào cũng được: nó sẽ được quay để chạy từ trái sang phải khi nhìn xuôi dòng).

## Thiết lập sông

Chọn sông để xem trong **Thuộc tính**:

- **Chế độ dòng chảy**: dưới tới hạn (trường hợp thường gặp: tính từ thượng lưu theo biên hạ lưu), trên tới hạn (tính từ hạ lưu theo biên thượng lưu) hoặc hỗn hợp (cả hai, rồi lấy cái có lực riêng lớn hơn tại mỗi mặt cắt; có xem trước).
- **Trắc dọc dòng chảy**: một tên và một lưu lượng cho mỗi cái (ví dụ lũ 10 năm và lũ 100 năm), và biên ở đầu hạ lưu (và đầu thượng lưu khi chế độ không phải dưới tới hạn): **Độ sâu đều** với độ dốc năng lượng (độ dốc đáy là ước đoán ban đầu), một cao độ **Mặt nước đã biết**, hoặc **Độ sâu tới hạn**.
- **Mặt cắt từ địa hình**: khoảng cách, phạm vi sang trái và phải, ước đoán bờ, và hai giá trị n Manning; {{ui:Cut sections again}} thay thế các mặt cắt (một bước hoàn tác).
- **Bảng mặt cắt**: với mỗi mặt cắt, độ lệch bờ trái và phải, n lòng dẫn và n bãi ngập, các chiều dài đoạn đến mặt cắt kế tiếp về hạ lưu (bãi ngập trái, lòng dẫn, bãi ngập phải; đo từ bình đồ để bắt đầu), và hệ số co hẹp và mở rộng (0,1 và 0,3 để bắt đầu: chuyển tiếp dần). {{ui:Edit}} mở trình soạn mặt cắt (mục tiếp theo); dấu chấm sau nó cho biết mặt cắt có đê hoặc vùng không hiệu quả.

Mọi thay đổi là một bước hoàn tác ({{key:Mod+Z}}).

## Sửa mặt cắt: bờ, đê và vùng không hiệu quả

{{ui:Edit}} trên một mặt cắt vẽ địa hình của nó và cho phép bạn kéo những gì bộ giải đọc: **bờ trái và phải** (chúng chia mặt cắt thành bãi ngập trái, lòng dẫn chính và bãi ngập phải), một **đê** ở hai bên và **vùng dòng chảy không hiệu quả**. Mọi núm điều khiển cũng có thể di chuyển bằng các phím mũi tên, và mọi con số có thể nhập ngay cạnh biểu đồ. {{ui:Apply}} là một bước hoàn tác.

- Một **đê** có vị trí (độ lệch) và cao độ đỉnh. Phần địa hình nằm ngoài đê, xa sông, bị cắt khỏi sông khi mặt nước thấp hơn đỉnh: diện tích, chu vi ướt và khả năng dẫn lưu của nó bị loại khỏi tính toán. Trên đỉnh, toàn bộ mặt cắt được tính lại. Đê nằm ngoài bờ mà nó bảo vệ; đê nằm trong bờ sẽ bị đánh dấu.
- Một **vùng dòng chảy không hiệu quả** giữ nước nhưng không mang lưu lượng (một túi nước sau nền đường đắp, nước đọng cạnh đầu cầu). Nhập hai độ lệch của nó và, nếu muốn, mực nước mà dưới đó vùng này không hiệu quả ({{ui:always}} khi để trống): trên mực đó nó chảy như phần còn lại. Vùng chiếm một phần lòng dẫn chính sẽ bị đánh dấu.
- Giữa hai mặt cắt, phạm vi ngập để lại khô phần địa hình phía sau một đê mà cả hai mặt cắt đều có, khi mặt nước ở đó thấp hơn đỉnh (đường nối giữa hai đỉnh là thẳng).

## Tính và đọc kết quả

Nhấn {{ui:Water surface profiles}}. Với trắc dọc bạn chọn, bạn nhận được:

- một **biểu đồ** dọc theo sông (lưu lượng từ trái sang phải): đáy lòng dẫn, bờ, mặt nước, đường năng lượng và mặt nước tới hạn; các mặt cắt giữ ở độ sâu tới hạn được khoanh tròn;
- một **bảng** cho mỗi mặt cắt: cọc sông, lưu lượng, đáy lòng dẫn, mặt nước, mặt nước tới hạn, đường năng lượng, độ sâu, vận tốc trong lòng dẫn và tổng thể, số Froude của lòng dẫn, diện tích dòng chảy, bề rộng mặt thoáng, lưu lượng trong mỗi bãi ngập và lòng dẫn, độ dốc năng lượng, và cảnh báo;
- **cảnh báo** bằng lời thường, ví dụ một mặt cắt đặt ở độ sâu tới hạn, nước vượt đầu mặt cắt, hoặc độ thay đổi lớn về khả năng dẫn lưu giữa hai mặt cắt (thêm mặt cắt ở giữa).

{{ui:Table (CSV)}}, {{ui:Report}} (văn bản thuần với phương pháp, các biên và mọi bảng) và {{ui:Plot (SVG)}} lưu vào thư mục tải xuống. Mỗi tệp đều kèm dòng xem xét.

Đánh dấu {{ui:Show the flood extent}} trong **Thuộc tính** để tô vùng ướt trên bình đồ cho trắc dọc đã chọn, với đường mép nước vẽ tại nơi độ sâu bằng không. Giữa các mặt cắt, mặt nước phẳng ngang sông và thay đổi tuyến tính theo cọc sông. Phần địa hình sau đê được để khô khi nước ở dưới đỉnh. Các vùng trũng khác trong hành lang sông mà nước không tới được (ví dụ phía sau nền đường bộ) vẫn bị tô màu: hãy kiểm tra.

## Trên bản vẽ và trong Vấn đề

Các đường của sông đi vào bình đồ, PDF và DWG trên các lớp riêng: **C-WATR-CNTR** (đường tâm), **C-WATR-SCTN** (mỗi đường cắt, kèm cọc sông) và **C-WATR-FLOD** (đường mép nước của phạm vi ngập, khi {{ui:Show the flood extent}} được đánh dấu cho một trắc dọc). Các cảnh báo của sông (một mặt cắt đặt ở độ sâu tới hạn, nước vượt đầu mặt cắt, một thay đổi về khả năng dẫn lưu cần thêm mặt cắt, một cân bằng năng lượng không khép kín, một đê nằm trong bờ) cũng đi vào bảng **Vấn đề**, thuộc về sông và đặt tại mặt cắt mà chúng xuất phát.

## Cách tính

- Năng lượng giữa hai mặt cắt: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Khả năng dẫn lưu theo phân đoạn: mỗi bãi ngập được chia tại chỗ n của nó thay đổi, K = Σ (1/n)·A·R^(2/3) (1,486/n trong đơn vị Mỹ); lòng dẫn là một đoạn, với n tổng hợp khi n của nó thay đổi. α đến từ cách chia khả năng dẫn lưu.
- Độ dốc ma sát theo khả năng dẫn lưu trung bình, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², trên chiều dài đoạn có trọng số lưu lượng.
- Hệ số co hẹp khi dòng chảy tăng tốc theo chiều xuôi dòng, mở rộng khi chậm lại.
- Độ sâu tới hạn = năng lượng riêng nhỏ nhất. Mỗi mực nước được giải trên một khoảng kẹp, nên không bao giờ nhảy sang phía sai của tới hạn; khi không có nghiệm, nó được đặt ở độ sâu tới hạn và bị đánh dấu.

Chương trình được kiểm tra với độ sâu đều Manning, độ sâu tới hạn trong kênh chữ nhật, và ví dụ nước dâng ngược của Chow (*Open-Channel Hydraulics*, 1959, chương 10) được tích phân độc lập. Cùng phương pháp này được các chương trình sông một chiều phổ biến sử dụng, nên một phép tính tay hay ghi chép của sinh viên vẫn áp dụng được.

## Cống và cầu

Trong **Thuộc tính** của sông, dưới **Cống và cầu**, {{ui:Add a culvert}} hoặc {{ui:Add a bridge}} đặt một công trình giữa hai mặt cắt (mỗi đoạn luôn giữ ít nhất hai mặt cắt). Trắc dọc bên dưới công trình không đổi; mặt nước ngay phía trên nó đến từ công trình, và trắc dọc tiếp tục lên thượng lưu từ đó. **Kết quả** thêm một bảng cho mỗi công trình: nước hạ lưu, mực nước thượng lưu, kiểm soát nào chi phối, lưu lượng qua lỗ thông và lưu lượng tràn qua mặt đường hoặc mặt cầu. Chỉ áp dụng cho dòng chảy dưới tới hạn.

- **Cống** (hộp hoặc tròn, một hoặc nhiều ống bằng nhau). Kiểm soát ở cửa vào là dòng tràn đập khi cửa còn thoáng và dòng qua lỗ khi cửa bị ngập, pha trộn giữa một và một rưỡi lần chiều cao, theo mực nước thượng lưu. Kiểm soát ở cửa ra là cân bằng năng lượng: tổn thất cửa vào, ma sát và cột áp vận tốc ra, trên mức cao hơn của nước hạ lưu và điểm giữa độ sâu tới hạn cùng đỉnh cống, trừ phần chênh cao dọc ống. Mực nước thượng lưu là giá trị lớn hơn trong hai giá trị. Đánh dấu **Cho phép nước tràn qua đường** và lưu lượng tràn qua mặt đường được chia sẻ với các ống.
- **Cầu.** Khẩu độ là mặt cắt bên dưới cầu, được cắt tại các mố, với mỗi trụ là một diện tích không mang lưu lượng. Mực nước trong khẩu độ đến từ mặt cắt bên dưới (hệ số mở rộng), và mặt cắt phía trên đến từ khẩu độ (hệ số co hẹp). Nếu khẩu độ không thoát được lưu lượng ở nước hạ lưu đó, nó chảy ở độ sâu tới hạn và cầu bị đánh dấu là nghẽn. Nếu nước chạm dầm đáy, dòng chảy là dòng áp lực (kiểu cống khi nước hạ lưu dưới dầm đáy, ngập khi trên đó), và nước tràn qua mặt cầu thêm dòng tràn đập; mực nước thượng lưu là mực mà tại đó tổng bằng lưu lượng.

Các hệ số (lưu lượng, tổn thất cửa vào, đập tràn) là giá trị mặc định làm tròn do chương trình đặt sẵn. Hãy thay đổi chúng cho thiết kế của bạn. Chúng không phải biểu đồ đã khớp như trong sổ tay thiết kế cống, nên hãy xem mực nước thượng lưu của cống gần giới hạn là một ước tính. Nước tràn qua đường hoặc mặt cầu, cửa vào bị ngập, khẩu độ bị nghẽn và dòng nhanh trong ống được hiển thị trong **Vấn đề**.

## Dòng chảy không ổn định

{{ui:Unsteady flow…}} trong **Thuộc tính** của sông cho chạy một quá trình lũ dọc theo các mặt cắt. Nhập lưu lượng vào dưới dạng giờ và lưu lượng, mỗi cặp một dòng, độ dốc hạ lưu (độ sâu đều) và thời gian chạy. Bắt đầu từ mặt nước ổn định ở lưu lượng đầu tiên, và giải đầy đủ hệ phương trình một chiều (sơ đồ bốn điểm ẩn, trọng số 0,6 theo thời gian). Bạn nhận được mực nước và lưu lượng đỉnh tại mọi mặt cắt cùng giờ xảy ra, một biểu đồ lưu lượng tại hai đầu, và kiểm tra khối lượng (vào, ra và phần thay đổi được trữ). Chương trình kiểm tra dòng ổn định vẫn ổn định, một bước trong lưu lượng vào kết thúc tại trắc dọc ổn định của lưu lượng mới, khối lượng khép kín, và tốc độ sóng lũ so với sóng động học. Chỉ áp dụng cho dòng dưới tới hạn, một đoạn sông, không có lưu lượng nhập bên, và không có cống hay cầu trong lần chạy.

## Nút hợp lưu

Các đoạn sông nối lưu lượng về một cửa ra: các lưu lượng cộng lại, và mực nước ở đầu đoạn hạ lưu được đưa lên đến đầu các đoạn nối vào nó (cùng mực nước tại điểm hợp lưu, phương pháp đơn giản: không có góc, không có động lượng, nên phù hợp với số Froude thấp). Mô hình và các kiểm thử nằm trong `river-structures.js`; bảng để nối hai sông trên bình đồ chưa xây dựng.

## Chưa xây dựng

Đập tràn và cửa van như các công trình riêng, bảng cho nút hợp lưu, công trình trong một lần chạy không ổn định, và dòng không ổn định trên tới hạn. Lần chạy chế độ hỗn hợp đánh dấu một nhảy thủy lực giữa hai mặt cắt nhưng không đặt vị trí của nó.

**Nơi các sông nhập lưu.** Trong Thuộc tính của sông, "Đổ vào" nêu tên sông mà nó nhập vào. Các sông nhập lưu được giải cùng nhau: sông mà chúng đổ vào mang tổng lưu lượng của chúng, và mỗi sông kết thúc tại mực nước của mặt cắt đầu tiên của sông đó (phương pháp cân bằng mực nước; bỏ qua góc và động lượng của các dòng). Để nối sông chính với một con suối, vẽ một đoạn sông ngắn bên dưới điểm hợp lưu và cho cả hai đổ vào nó. Kết quả hiển thị một bảng nút hợp lưu. Các giá trị mặc định trong các kết quả này (co hẹp 0,1, mở rộng 0,3, lòng dẫn một đoạn với độ nhám tổng hợp, chế độ hỗn hợp theo lực riêng) được giữ nguyên cho đến khi kỹ sư xem xét, và Kết quả nói rõ điều đó.
