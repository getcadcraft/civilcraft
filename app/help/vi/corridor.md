---
title: Quét hành lang đường bộ
summary: Bật hành lang cho một tuyến, đặt giá trị làn xe, lề đường và mái dốc, rồi đọc các mặt cắt, đường giao với mặt đất và khối lượng đất đào đắp mà nó tạo ra.
keywords: nút giao, giao điểm, đường gặp đường, đường nhánh, giao chữ T, băng qua, cao độ nền, nối, nối vào, siêu cao, siêu, nghiêng ngang, đoạn chuyển siêu cao, đoạn bắt đầu siêu cao, bảng hệ số, độ dốc ngang, xoay, hành lang, cấu kiện, cấu kiện mặt cắt điển hình, đường, làn xe, lề đường, độ dốc ngang, mái dốc, đường giao với mặt đất, đào, đắp, mặt cắt, mục tiêu, mục tiêu chiều rộng, mục tiêu cao độ, mục tiêu độ lệch, mở rộng, mép mặt đường, theo hành lang khác
from: 6dcb92b3
---

Hành lang quét một mặt cắt điển hình đơn giản (một cấu kiện) dọc theo tuyến và trắc dọc thiết kế của nó, san theo mặt đất hiện có và thêm kết quả vào bề mặt dự kiến. Một tuyến có thể mang nhiều hành lang trên các khoảng cọc khác nhau, và một hành lang có thể được dựng từ các mẫu tái sử dụng theo cọc ([Mẫu hành lang](topic:corridor-templates)). Cấu kiện đơn giản dưới đây giống nhau ở cả hai bên; để mỗi bên có các bộ phận riêng, xem [Xây dựng từng bên từ các bộ phận](topic:corridor#build-each-side-from-parts).

## Cấu kiện

Từ tim tuyến ra ngoài, ở mỗi bên:

1. một **làn xe** có chiều rộng cho trước, dốc xuống từ mui luyện theo **độ dốc làn xe**
2. một **lề đường** có chiều rộng cho trước theo **độ dốc lề đường**
3. một **mái dốc** từ mép lề đường đến chỗ gặp mặt đất: **mái dốc đào** ở chỗ mặt đất cao hơn, **mái dốc đắp** ở chỗ nó thấp hơn

Các giá trị ban đầu chỉ là giá trị tạm, không phải tiêu chuẩn thiết kế:

| Giá trị | US feet | Mét |
|---|---|---|
| Chiều rộng làn xe | 12 ft | 3.6 m |
| Độ dốc làn xe | 2% | 2% |
| Chiều rộng lề đường | 4 ft | 1.2 m |
| Độ dốc lề đường | 4% | 4% |
| Mái dốc đào | 2 : 1 | 2 : 1 |
| Mái dốc đắp | 3 : 1 | 3 : 1 |
| Khoảng cách mặt cắt | 10 ft | 5 m |

Độ dốc của mái dốc được tính theo ngang trên đứng (H:V): 3 : 1 nghĩa là 3 đơn vị ngang ứng với 1 đơn vị đứng.

## Dựng hành lang

Bạn cần một tuyến không có lỗi và một trắc dọc thiết kế có ít nhất hai PVI và không có lỗi.

1. Chọn tuyến.
2. Trong bảng bên phải, dưới **Hành lang**, đánh dấu **Quét cấu kiện dọc theo trắc dọc thiết kế**.
   Các ô hiện ra và hành lang được dựng ngay. Mặt bằng hiện mép làn xe và lề đường cùng các đường giao với mặt đất; khi chọn {{ui:Dự kiến (đã san)}} dưới **Hiển thị**, các đường đồng mức thể hiện mặt đất mới.
3. Đổi bất kỳ giá trị nào: **Chiều rộng làn xe**, **Độ dốc làn xe**, **Chiều rộng lề đường**, **Độ dốc lề đường**, **Mái dốc đào**, **Mái dốc đắp**, **Khoảng cách mặt cắt**. Nhấn {{key:Enter}} sau mỗi giá trị. Mái dốc đào, mái dốc đắp và khoảng cách mặt cắt phải lớn hơn 0.
4. Đọc dòng dưới các ô, ví dụ "39 mặt cắt từ 0+00.00 đến 3+86.36; đào 240.2 cu yd, đắp 556.0 cu yd."

Các mặt cắt được cắt tại mỗi bước **Khoảng cách mặt cắt**, tại hai đầu, và tại điểm đầu và điểm cuối của mọi đường cong ngang và đứng. Mỗi mặt cắt và các đường đi qua chúng (tim tuyến, mép làn xe và lề đường, đường giao với mặt đất) trở thành đường ngắt của bề mặt dự kiến.

Để tắt hành lang, bỏ đánh dấu ô. Các giá trị của nó được giữ lại cho lần sau.

## Khi không dựng được

Một hộp màu đỏ dưới các ô cho biết lý do:

| Thông báo | Cách xử lý |
|---|---|
| "Hành lang cần một trắc dọc thiết kế không có lỗi." | Thêm PVI, hoặc sửa các đường cong đứng chồng lên nhau (xem [Thiết kế trắc dọc](topic:profile)). |
| "Trắc dọc thiết kế không trùng với tuyến." | Di chuyển các PVI vào trong khoảng cọc của tuyến. |
| "Hành lang cần ít nhất hai mặt cắt trên bề mặt." | Phần lớn hành lang nằm ngoài mặt đất hiện có. |
| "4 mái dốc chạy ra khỏi bề mặt trước khi gặp mặt đất." | Gần mép bề mặt, mái dốc không thể chạm mặt đất. Đặt đường cách xa mép, hoặc hạ chiều cao đắp hay đào tại đó. |
| "Các đường giao với mặt đất của hành lang cắt nhau (mặt cắt chồng lên nhau, ví dụ ở phía trong của một đường cong gấp). Dùng bán kính lớn hơn hoặc cấu kiện hẹp hơn." | Các mặt cắt ở phía trong một đường cong gấp bị chồng lên nhau. Tăng bán kính hoặc thu hẹp cấu kiện. |

Hành lang có lỗi sẽ không được san vào và không được tính trong khối lượng đất.

## Hành lang và nền cùng lúc

Bề mặt dự kiến được dựng theo thứ tự: trước hết là mọi hành lang, sau đó là mọi nền. Chỗ san nền chồng lên hành lang thì nền được ưu tiên. Chỗ một đối tượng sau chồng lên một con đường, chỉ phần đường nằm trong đường giao với mặt đất của đối tượng sau được thay thế; phần còn lại của đường, và mọi đường ngắt mặt đất mà đường cắt qua, giữ nguyên hình dạng. Khối lượng được tính trong tất cả các đường giao với mặt đất cùng lúc; xem [Khối lượng đất](topic:volumes).

## Siêu cao

Qua một đường cong, mặt đường có thể nghiêng về phía trong, để xe ít bị đẩy ra phía ngoài. Đánh dấu **Siêu cao các đường cong** dưới **Siêu cao** trong **Thuộc tính** của tuyến:

- Mỗi đường cong tròn lấy một hệ số **e** từ bảng hệ số: hàng đầu tiên mà bán kính của đường cong đạt tới (hàng có hệ số để trống giữ nguyên mui luyện bình thường). Bảng và **Độ dốc tương đối tối đa** (0.5 % để bắt đầu) chỉ là giá trị tạm, không phải tiêu chuẩn: đặt theo tiêu chí thiết kế của bạn. Thêm hoặc xóa hàng khi cần.
- Các làn xe xoay quanh tim tuyến. Trước đường cong, làn ngoài phẳng dần qua **đoạn bắt đầu** (runout: mui luyện thường ÷ e × đoạn chuyển), rồi qua **đoạn chuyển** (runoff: chiều rộng làn xe × e ÷ độ dốc), làn ngoài tiếp tục nghiêng cho đến khi cả đoạn đường dốc e về phía trong; hai phần ba đoạn chuyển nằm trước đường cong và một phần ba nằm trên đường cong. Sau đường cong, mọi việc xảy ra theo chiều ngược lại.
- Lề đường ở phía thấp không bao giờ phẳng hơn làn xe của nó; ở phía cao, nó giữ độ dốc riêng (nó tự nghiêng).
- Bảng bên dưới liệt kê bán kính, hệ số, đoạn chuyển và đoạn bắt đầu của mỗi đường cong, và chỗ siêu cao đầy đủ bắt đầu và kết thúc. **Biểu đồ siêu cao** vẽ độ dốc ngang của cả hai làn dọc theo các cọc (làn trái nét liền, làn phải nét đứt).
- Đường cong quá ngắn không đạt được siêu cao đầy đủ, hoặc hai đường cong có đoạn chuyển chồng lên nhau, được thông báo trong một hộp phía trên bảng.

Mặt cắt, khối lượng, khung nhìn 3D và các tờ đều thể hiện đường nghiêng. Mỗi thay đổi là một bước: {{key:Mod+Z}} hoàn tác.

## Mục tiêu

Một mục tiêu di chuyển một điểm của một bên đường đến một đường: **Mép mặt đường** hoặc **Mép lề đường**, ở bên **Trái** hoặc **Phải**. Mỗi mặt cắt gặp đường vuông góc với tim tuyến, chỉ đi ra ở bên đó, nên mục tiêu bên phải không bao giờ làm dịch chuyển bên trái.

| Thiết lập | Điều gì xảy ra tại chỗ mặt cắt gặp đường |
|---|---|
| **Chiều rộng** | Điểm nằm trên đường: làn xe (hoặc lề đường) mở rộng hoặc thu hẹp đến đường đó, giữ nguyên độ dốc ngang. |
| **Cao độ** | Điểm nhận cao độ của đường tại đó, ở độ lệch riêng của nó: độ dốc ngang của làn xe (hoặc lề đường) theo đó. |

Đường có thể là một đường đặc trưng (bất kể **Công dụng** của nó) hoặc một đường của hành lang khác: tim tuyến, mép mặt đường, mép lề đường hoặc đường giao với mặt đất. Đường của một hành lang đi theo hành lang đó: đổi con đường kia thì con đường này cũng theo. CivilCraft dựng hành lang kia trước; hai hành lang nhắm mục tiêu vào nhau thành vòng lặp sẽ bị từ chối ở một phía, và bảng cho biết phía nào.

1. Chọn tuyến và bật hành lang của nó.
2. Dưới **Mục tiêu**, nhấp {{ui:Thêm mục tiêu}}.
3. Chọn **Bên**, **Điểm**, mục **Thiết lập** và **Đến đường**. Mỗi thay đổi là một bước hoàn tác.

**Kết quả** cho biết đường đạt tới ở bao nhiêu mặt cắt. Các mặt cắt không đạt tới đường (vượt qua hai đầu của nó, hoặc nằm phía sau tim tuyến) giữ các giá trị của cấu kiện. Một đường bị xóa sẽ để hành lang như trước khi có mục tiêu, và bảng cho biết điều đó. Một bên có thể có một mục tiêu chiều rộng và một mục tiêu cao độ cho mỗi điểm.

## Xây dựng từng bên từ các bộ phận

Bật **Xây dựng từng bên từ các bộ phận** trong cài đặt của hành lang. Khi đó mỗi bên có danh sách riêng, từ tim tuyến ra ngoài: làn xe, lề đường, rãnh thoát nước, bó vỉa, dải trồng cây, vỉa hè và cuối cùng là mái dốc xuống mặt đất (với tỷ lệ đào và đắp riêng). Bắt đầu từ {{ui:Đường nông thôn}} hoặc {{ui:Đường đô thị}}, thêm và xóa các bộ phận, di chuyển chúng bằng các mũi tên, và {{ui:Sao chép}} một bên sang bên kia. Mỗi thay đổi là một bước hoàn tác.

Độ dốc ngang là độ dốc đi xa khỏi đường, nên một vỉa hè thoát nước về phía đường sẽ mang dấu âm. Bó vỉa là một mặt có chiều cao bạn nhập, một đỉnh có chiều rộng bạn nhập và một độ hạ tùy chọn ở phía sau. Siêu cao xoay mọi làn xe trong hàng đầu tiên; rãnh, bó vỉa, dải và vỉa hè treo từ mép làn xe như đã dựng. Mục tiêu vẫn di chuyển đầu mút của làn xe và bộ phận cuối. Mặt cắt ngang đánh dấu đường dòng chảy của rãnh, đỉnh và mặt sau bó vỉa, và phần còn lại. Trên đường cong có đường xoắn ốc, đoạn chuyển chính là đường xoắn ốc: mui luyện phẳng tại TS, siêu cao đầy đủ tại SC.

## Các lớp kết cấu mặt đường

Một làn xe, lề đường, rãnh, dải trồng cây hoặc vỉa hè có thể mang lớp cấu tạo của nó: dưới bộ phận, {{ui:Thêm một lớp}} thêm một lớp với tên, vật liệu, chiều dày và loại (mặt, lớp liên kết, lớp móng, lớp móng dưới, lớp bảo vệ hoặc khác), từ trên xuống.

Các lớp không làm dịch chuyển bề mặt đường (đỉnh của nó là bề mặt thiết kế); mỗi lớp nằm dưới bộ phận của nó, độ sâu đo thẳng đứng xuống. Mặt cắt ngang vẽ đáy mỗi lớp bằng một nét đứt, và {{ui:Các lớp kết cấu mặt đường: khối lượng}} liệt kê diện tích mặt bằng và thể tích của mọi lớp (diện tích dọc hành lang tính từ các mặt cắt, thể tích = diện tích × chiều dày). Xuất IFC ghi mỗi lớp thành một phần tử riêng với chiều dày và vật liệu của nó (xem [Xuất và nhập IFC](topic:ifc)). Chiều dày bạn nhập là do bạn quyết định: CivilCraft không tính kích thước mặt đường.

## Nơi đường gặp đường, nền và lối đi

Khi bật {{ui:Nối các đường và nền mà nó gặp}} (nó được bật cho mọi hành lang), CivilCraft nối một hành lang với những gì nó gặp trên mặt bằng:

- **Một đường kết thúc trên một đường khác** (đầu tuyến của nó nằm trên đường kia, hoặc trong khoảng chừng một nửa chiều rộng mặt đường của chính nó tính từ mép đường đó) là đường nhánh của một nút giao. Đường nó gặp mở mép của nó cho mặt đường của đường nhánh: qua miệng nút, lề đường, bó vỉa, dải và vỉa hè được đặt theo độ dốc ngang của làn xe và vẽ như mặt đường. Đường nhánh được đặt lên bề mặt đường chính chỗ hai bên chồng lên nhau, và được nâng hoặc hạ dần đến nó qua đoạn tiếp cận.
- **Hai đường giao nhau** được nối theo cùng cách ở cả hai bên. Đường được liệt kê đầu tiên dưới Các tuyến là đường xuyên; đường còn lại đi theo bề mặt của nó qua giao điểm.
- **Một đường kết thúc tại một nền** (bên trong nó, hoặc trong khoảng chừng một nửa chiều rộng mặt đường tính từ mép của nó) đến cao độ của nền và được nâng dần đến nó qua đoạn tiếp cận.
- **Một lối đi** (Cảnh quan › Cảnh quan cứng) dừng ở mép ngoài của đường, ngang với vỉa hè hoặc lề đường tại đó, thay vì nằm trên đường. Lối đi cắt ngang đường trở thành hai đoạn. Một đầu được vẽ hơi ngắn so với đường (trong vòng hai lần chiều rộng lối đi) được kéo tiếp đến mép của nó.

**Thuộc tính** cho biết mỗi hành lang đã nối với gì, được nâng hoặc hạ bao nhiêu tại đó và trên chiều dài nào. Chiều dài đó là giá trị lớn hơn giữa 10 m (30 ft) và hai mươi lần mức thay đổi, và không bao giờ quá 45% hành lang. **Trắc dọc thiết kế không bị thay đổi**: khung trắc dọc vẫn hiện đường độ dốc bạn đã vẽ, còn các mặt cắt, bề mặt dự kiến, khối lượng và khung nhìn 3D thể hiện đường như đã nối. Để làm mối nối chính xác theo thiết kế, dịch PVI cuối đến cao độ mà Thuộc tính báo cáo.

Tắt công tắc trên một hành lang để nó đúng như trắc dọc và cấu kiện của nó quy định; khi đó nó không tham gia vào bất kỳ nút giao nào, dù là đường nhánh hay đường xuyên. Các đường gặp nhau gần như thẳng hàng (dưới khoảng 20°) được giữ nguyên, và các đường mòn cũng vậy.

Những gì nút giao chưa làm được: chưa có bo góc bó vỉa (các góc vuông), không có làn rẽ hay đảo, đầu của đường nhánh được cắt vuông góc với tuyến riêng của nó, và một hành lang được dựng từ mẫu mở mép theo cách đơn giản tương tự (rãnh hoặc tường ở điều kiện cuối được san ngang qua miệng, không có cống). Về bo góc bó vỉa trên mặt bằng, tam giác tầm nhìn và kẻ vạch, xem [Đất, đường, khảo sát, mỏ và liên kết](topic:soils-roads-survey-mines-links).

## Chưa xây dựng

Mục tiêu cho độ dốc đường giao với mặt đất chưa có. Với một hành lang thay đổi dọc đường, với trái và phải tách riêng, dùng [Mẫu hành lang](topic:corridor-templates). Xem [Chưa xây dựng](topic:not-built-yet).
