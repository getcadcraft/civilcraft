---
title: Quét hành lang đường
summary: Bật một hành lang cho một tuyến, đặt giá trị làn, vai đường và mái dốc, rồi đọc các mặt cắt, đường giao mặt đất và khối lượng đào đắp mà nó tạo ra.
keywords: siêu cao, super, nghiêng ngang, runoff, runout, bảng tỷ suất, độ dốc ngang, xoay, hành lang, cụm, cụm con, mặt cắt điển hình, đường, làn, vai đường, độ dốc ngang, mái dốc, đường giao mặt đất, đào, đắp, mặt cắt, mục tiêu, các mục tiêu, mục tiêu chiều rộng, mục tiêu cao độ, mục tiêu độ lệch, mở rộng, mép mặt đường, theo hành lang khác
from: 91303189
---

Hành lang quét một mặt cắt điển hình đơn giản (một cụm) dọc theo tuyến và trắc dọc thiết kế của nó, san nó vào mặt đất hiện trạng và thêm kết quả vào bề mặt đề xuất. Một tuyến có thể mang nhiều hành lang trên các khoảng cọc khác nhau, và một hành lang có thể được dựng từ các mẫu tái sử dụng theo cọc ([Mẫu hành lang](topic:corridor-templates)). Cụm đơn giản dưới đây giống nhau ở cả hai bên; để cho mỗi bên các phần riêng, xem [Dựng từng bên từ các phần](topic:corridor#build-each-side-from-parts).

## Cụm

Từ tim tuyến hướng ra ngoài, ở mỗi bên:

1. một **làn** có bề rộng cho trước, dốc xuống từ đỉnh theo **độ dốc làn**
2. một **vai đường** có bề rộng cho trước theo **độ dốc vai đường**
3. một **mái dốc** từ mép vai đường đến khi gặp mặt đất: **mái đào** khi đất cao hơn, **mái đắp** khi đất thấp hơn

Các giá trị khởi đầu là chỗ giữ chỗ, không phải tiêu chuẩn thiết kế:

| Giá trị | Feet Hoa Kỳ | Mét |
|---|---|---|
| Bề rộng làn | 12 ft | 3.6 m |
| Độ dốc làn | 2% | 2% |
| Bề rộng vai đường | 4 ft | 1.2 m |
| Độ dốc vai đường | 4% | 4% |
| Mái đào | 2 : 1 | 2 : 1 |
| Mái đắp | 3 : 1 | 3 : 1 |
| Khoảng cách mặt cắt | 10 ft | 5 m |

Độ dốc của mái được tính ngang trên đứng (H:V): 3 : 1 nghĩa là 3 đơn vị ngang cho 1 đơn vị đứng.

## Dựng hành lang

Bạn cần một tuyến không có lỗi và một trắc dọc thiết kế có ít nhất hai PVI và không có lỗi.

1. Chọn tuyến.
2. Trong bảng bên phải, dưới **Hành lang**, đánh dấu **Quét một cụm dọc theo trắc dọc thiết kế**.
   Các ô hiện ra và hành lang được dựng ngay. Mặt bằng hiển thị mép của làn và vai đường cùng các đường giao mặt đất; với {{ui:Dự kiến (đã san)}} được chọn dưới **Hiển thị**, đường đồng mức thể hiện mặt đất mới.
3. Đổi bất kỳ giá trị nào: **Bề rộng làn**, **Độ dốc làn**, **Bề rộng vai đường**, **Độ dốc vai đường**, **Mái đào**, **Mái đắp**, **Khoảng cách mặt cắt**. Nhấn {{key:Enter}} sau mỗi lần. Đào, đắp và khoảng cách mặt cắt phải lớn hơn 0.
4. Đọc dòng dưới các ô, ví dụ "39 mặt cắt từ 0+00.00 đến 3+86.36; đào 240.2 cu yd, đắp 556.0 cu yd."

Mặt cắt được cắt tại mỗi bước **Khoảng cách mặt cắt**, tại hai đầu, và tại điểm đầu và cuối của mọi đường cong ngang và đứng. Mỗi mặt cắt và các đường đi qua chúng (tim tuyến, mép làn và vai đường, đường giao mặt đất) trở thành đường ngắt của bề mặt đề xuất.

Để tắt hành lang, bỏ đánh dấu ô. Các giá trị của nó được giữ cho lần sau.

## Khi không dựng được

Một hộp đỏ dưới các ô cho biết lý do:

| Thông báo | Cần làm gì |
|---|---|
| "Hành lang cần một trắc dọc thiết kế không có lỗi." | Thêm PVI, hoặc sửa các đường cong đứng chồng nhau (xem [Thiết kế trắc dọc đứng](topic:profile)). |
| "Trắc dọc thiết kế không chồng lên tuyến." | Di chuyển PVI vào khoảng cọc của tuyến. |
| "Hành lang cần ít nhất hai mặt cắt trên bề mặt." | Phần lớn hành lang nằm ngoài mặt đất hiện trạng. |
| "4 mái dốc chạy ra ngoài bề mặt trước khi gặp mặt đất." | Gần mép bề mặt, mái không thể chạm mặt đất. Giữ đường cách xa mép, hoặc hạ chiều cao đắp hoặc đào tại đó. |
| "Các đường giao mặt đất của hành lang cắt nhau (mặt cắt chồng lên nhau, ví dụ ở phía trong của một đường cong gấp). Dùng bán kính lớn hơn hoặc cụm hẹp hơn." | Các mặt cắt ở phía trong của một đường cong gấp chồng lên nhau. Tăng bán kính hoặc thu hẹp cụm. |

Hành lang có lỗi không được san vào và không tính trong khối lượng đào đắp.

## Hành lang và nền cùng nhau

Bề mặt đề xuất được dựng theo thứ tự: mọi hành lang trước, rồi mọi nền. Nơi phần san của một nền chồng lên một hành lang, nền thắng. Khối lượng được tính trong tất cả các đường giao mặt đất cùng nhau; xem [Khối lượng đào đắp](topic:volumes).

## Siêu cao

Qua một đường cong, đường có thể nghiêng về phía trong, để xe ít bị đẩy ra ngoài hơn. Đánh dấu **Siêu cao các đường cong** dưới **Siêu cao** trong **Thuộc tính** của tuyến:

- Mỗi đường cong tròn lấy một tỷ suất **e** từ bảng tỷ suất: hàng đầu tiên mà bán kính của đường cong đạt tới (hàng có tỷ suất để trống giữ độ nghiêng ngang thông thường). Bảng và **Độ dốc tương đối tối đa** (ban đầu 0.5 %) là chỗ giữ chỗ, không phải tiêu chuẩn: hãy đặt chúng theo tiêu chí thiết kế của bạn. Thêm hoặc bỏ hàng khi cần.
- Các làn xoay quanh tim tuyến. Trước đường cong, làn ngoài hạ dần qua **runout** (độ nghiêng ngang thông thường ÷ e × runoff), rồi qua **runoff** (bề rộng làn × e ÷ độ dốc gradient), làn ngoài tiếp tục xoay cho đến khi cả đường dốc e về phía trong; hai phần ba runoff nằm trước đường cong và một phần ba nằm trên nó. Sau đường cong, điều tương tự xảy ra theo chiều ngược lại.
- Vai đường phía thấp không bao giờ phẳng hơn làn của nó; ở phía cao, nó giữ độ dốc riêng (nó lật lên).
- Bảng dưới đó liệt kê bán kính, tỷ suất, runoff và runout của mỗi đường cong, và nơi siêu cao đầy đủ bắt đầu và kết thúc. **Sơ đồ siêu cao** vẽ độ nghiêng ngang của cả hai làn dọc theo các cọc (làn trái nét liền, làn phải nét đứt).
- Một đường cong quá ngắn để đạt siêu cao đầy đủ, hoặc hai đường cong có đoạn chuyển tiếp chồng nhau, được báo trong một hộp phía trên bảng.

Mặt cắt, khối lượng, khung nhìn 3D và các bản vẽ đều thể hiện con đường nghiêng. Mỗi thay đổi là một bước: {{key:Mod+Z}} hoàn tác.

## Mục tiêu

Một mục tiêu di chuyển một điểm của một bên đường đến một đường: **Mép mặt đường** hoặc **Mép vai đường**, ở bên **Trái** hoặc **Phải**. Mỗi mặt cắt gặp đường vuông góc với tim tuyến, đi ra ngoài chỉ ở bên đó, nên một mục tiêu bên phải không bao giờ di chuyển bên trái.

| Đặt | Điều xảy ra tại nơi mặt cắt gặp đường |
|---|---|
| **Chiều rộng** | Điểm nằm trên đường: làn (hoặc vai đường) mở rộng hoặc thu hẹp đến đó, giữ độ dốc ngang của nó. |
| **Cao độ** | Điểm lấy cao độ của đường tại đó, ở độ lệch riêng của nó: độ dốc ngang của làn (hoặc vai đường) theo đó. |

Đường có thể là một đường đặc trưng (với **Dùng** bất kỳ) hoặc một đường của hành lang khác: tim tuyến, mép mặt đường, mép vai đường hoặc đường giao mặt đất của nó. Đường của một hành lang theo hành lang đó: đổi hành lang kia thì hành lang này theo. CivilCraft dựng hành lang kia trước; hai hành lang nhắm mục tiêu lẫn nhau theo vòng lặp sẽ bị từ chối ở một bên, và bảng cho biết bên nào.

1. Chọn tuyến và bật hành lang của nó.
2. Dưới **Mục tiêu**, nhấp {{ui:Thêm mục tiêu}}.
3. Chọn **Bên**, **Điểm**, điều nó **Đặt** và **Đến đường**. Mỗi thay đổi là một bước hoàn tác.

**Kết quả** cho biết có bao nhiêu mặt cắt đạt đến đường. Mặt cắt không đạt đến (vượt quá hai đầu của đường, hoặc nằm sau tim tuyến) giữ giá trị của cụm. Một đường bị xóa sẽ để hành lang như trước mục tiêu, và bảng cho biết điều đó. Một bên có thể có một mục tiêu chiều rộng và một mục tiêu cao độ cho mỗi điểm.

## Dựng từng bên từ các phần

Bật **Dựng từng bên từ các phần** dưới cài đặt của hành lang. Mỗi bên khi đó có danh sách riêng, từ tim tuyến hướng ra ngoài: làn, vai đường, rãnh, bó vỉa, dải trồng cây, vỉa hè và cuối cùng là mái dốc đến mặt đất (với tỷ lệ đào và đắp riêng). Bắt đầu từ {{ui:Đường nông thôn}} hoặc {{ui:Đường đô thị}}, thêm và bỏ các phần, di chuyển chúng bằng mũi tên, và {{ui:Sao chép}} một bên sang bên kia. Mỗi thay đổi là một bước hoàn tác.

Độ dốc ngang là độ dốc đi ra xa đường, nên một vỉa hè thoát nước về phía đường có giá trị âm. Bó vỉa là một mặt có chiều cao bạn cho, một đỉnh có bề rộng bạn cho và một phần giảm tùy chọn ở phía sau. Siêu cao xoay mọi làn ở hàng đầu tiên; rãnh, bó vỉa, dải và vỉa hè treo từ mép của các làn khi đã dựng. Các mục tiêu vẫn di chuyển đầu của các làn và phần cuối. Mặt cắt ngang đánh dấu đáy rãnh, đỉnh và mặt sau của bó vỉa, và các phần khác. Trên đường cong có đường cong chuyển tiếp xoắn ốc, runoff là đoạn xoắn: mái ngang bằng phẳng tại TS, siêu cao đầy đủ tại SC.

## Các lớp mặt đường

Một làn, vai đường, rãnh, dải trồng cây hoặc vỉa hè có thể mang cấu tạo mặt đường của nó: dưới phần đó, {{ui:Thêm một lớp}} thêm một lớp có tên, vật liệu, độ dày và loại (mặt, liên kết, nền, lớp nền dưới, lớp đệm hoặc khác), từ trên xuống. Các lớp không làm di chuyển bề mặt đường (đỉnh của nó là bề mặt thiết kế); mỗi lớp nằm dưới phần của nó, độ sâu đo thẳng xuống. Mặt cắt ngang vẽ đáy mỗi lớp bằng nét đứt, và {{ui:Các lớp kết cấu mặt đường: khối lượng}} liệt kê diện tích mặt bằng và khối lượng của mọi lớp (diện tích dọc hành lang từ các mặt cắt, khối lượng = diện tích × độ dày). Xuất IFC ghi mỗi lớp thành một phần tử riêng với độ dày và vật liệu của nó (xem [Xuất và nhập IFC](topic:ifc)). Độ dày bạn nhập là của bạn: CivilCraft không định cỡ mặt đường.

## Những gì chưa được xây dựng

Mục tiêu cho độ dốc của đường giao mặt đất chưa có sẵn. Với một hành lang thay đổi dọc đường, và trái phải tách riêng, dùng [Mẫu hành lang](topic:corridor-templates). Xem [Chưa xây dựng](topic:not-built-yet).
