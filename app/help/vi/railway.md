---
title: Thiết kế đường ray
summary: Biến một tuyến thành đường sắt: đoạn chuyển tiếp (clothoid, parabol bậc ba, Bloss, Helmert, nửa sóng sin, sin), siêu cao tại mỗi đường cong với siêu cao cân bằng, thiếu và thừa siêu cao, giới hạn siêu cao và hình học đường ray dưới dạng cảnh báo, ghi và đường chéo ghi theo cọc, bao khổ giới hạn quét dọc theo tuyến, và đường ray gồm ray, tà vẹt và nền đá balát được dựng như hành lang, trên bình đồ, mặt cắt, trắc dọc, 3D và khối lượng.
keywords: đường sắt, ray, đường ray, tàu hỏa, tàu điện ngầm, tàu điện, siêu cao, thiếu siêu cao, thừa siêu cao, siêu cao cân bằng, đoạn chuyển tiếp, đường cong chuyển tiếp, clothoid, parabol bậc ba, bloss, helmert, nửa sóng sin, cosin, khổ đường, khổ tiêu chuẩn, khổ rộng, khổ mét, khổ hẹp, tà vẹt, tà vẹt ngang, đá balát, balát phụ, nền đường, lề đường sắt, khoảng cách tâm đường ray, 60E1, 54E1, UIC60, 115RE, 136RE, độ dốc siêu cao, tốc độ thay đổi siêu cao, ghi, mũi ghi, đường chéo ghi, tim ghi, số tim ghi, đoạn dẫn, đường cong khép, tốc độ đi ghi, khoảng cách an toàn, bao khổ giới hạn, khổ giới hạn, khổ giới hạn công trình, sân ga, khoảng cách sân ga, khoảng cách đường ray, độ dốc, đường cong đứng, bán kính tối thiểu, siêu cao LandXML
from: 99de9745
---

Mọi tuyến đều có thể là một đường ray. Khi đó các đường cong của tuyến nhận đoạn chuyển tiếp ray và siêu cao (độ nghiêng của ray), còn hành lang được dựng như một đường ray: ray đặt trên tà vẹt, nằm trên nền đá balát, và được san vào nền đất như đường bộ. Ghi và đường chéo ghi được đặt theo cọc, và có thể quét một bao khổ giới hạn dọc theo tuyến rồi kiểm tra với các vật nằm cạnh đường ray.

Mọi con số dưới đây đều là **giá trị tạm**, không phải tiêu chuẩn. Đường sắt đặt giới hạn theo tốc độ tuyến, loại đường ray và quốc gia; hãy đặt theo tiêu chuẩn của tuyến đường sắt của bạn. CivilCraft không kèm bảng quốc gia nào.

## Đặt tuyến thành đường sắt

1. Chọn tuyến và tìm **Đường sắt** trong Thuộc tính.
2. Đánh dấu **Tuyến này là đường ray**. Mỗi thay đổi là một bước hoàn tác.
3. Đặt **Tốc độ thiết kế** ở đầu Thuộc tính của tuyến: đó là tốc độ tuyến mà siêu cao được kiểm tra. **Đoàn tàu chậm nhất** (trong khối Đường sắt) là tốc độ dùng để kiểm tra thừa siêu cao.

## Đoạn chuyển tiếp

Đặt chiều dài đường xoắn ở hai đầu mỗi đường cong trong bảng PI (**Chuyển tiếp vào**, **Chuyển tiếp ra**), rồi chọn loại trong bảng đường cong của khối Đường sắt, hoặc chọn **Đoạn chuyển tiếp cho mọi đường cong**:

| Loại | Độ cong dọc theo đoạn chuyển tiếp |
|---|---|
| Clothoid | tăng đều (đường xoắn đường bộ) |
| Parabol bậc ba | y = x³ / (6·R·L), với L đo theo tiếp tuyến; đường cong thực dài hơn một chút |
| Bloss | 3u² − 2u³ của độ cong đầy đủ (u = tỷ lệ chiều dài): bắt đầu và kết thúc êm |
| Helmert | hai parabol, 2u² rồi 1 − 2(1 − u)² |
| Nửa sóng sin | (1 − cos πu) / 2 |
| Sin | u − sin(2πu) / 2π |

Tất cả trừ parabol bậc ba đều quay một góc L / 2R, giống clothoid. Cọc chạy theo chiều dài thực. LandXML giữ loại (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Siêu cao

Nhập **Siêu cao** của mỗi đường cong theo milimét. Bảng hiển thị cho mỗi đường cong:

- **Siêu cao cân bằng** = G·v² / (g·R), G là khoảng cách giữa tâm hai ray (**Khoảng cách tâm ray**, bằng khổ đường cộng bề rộng đầu ray trừ khi bạn nhập khác). Với G = 1500 mm, đây là công thức quen thuộc 11,8·V² / R (V tính bằng km/h, R tính bằng m).
- **Thiếu** = siêu cao cân bằng ở tốc độ tuyến − siêu cao áp dụng.
- **Thừa** = siêu cao áp dụng − siêu cao cân bằng ở tốc độ của đoàn tàu chậm nhất.
- **Dốc**: độ dốc siêu cao lớn nhất dọc theo các đoạn chuyển tiếp, tính bằng mm trên mét.

Siêu cao tăng dần qua mỗi đoạn chuyển tiếp, theo dạng độ cong của đoạn đó: thẳng với clothoid hoặc parabol bậc ba, theo dạng Bloss với Bloss, v.v. Đầu đường cong không có đoạn chuyển tiếp sẽ tăng siêu cao trên đoạn thẳng trước đó, dài đến mức giới hạn độ dốc siêu cao yêu cầu, và chương trình ghi nhận điều đó: khi ấy siêu cao thay đổi ở chỗ độ cong không đổi.

**Siêu cao quay quanh** cho biết ray nào giữ nguyên trên trắc dọc thiết kế: **ray thấp** (thường dùng), **ray trong**, hoặc **tâm đường ray** (mỗi ray dịch chuyển một nửa siêu cao). Trắc dọc thiết kế là đỉnh ray tại đó.

**Biểu đồ siêu cao** vẽ độ cao của mỗi ray so với trắc dọc dọc theo các cọc; khung nhìn trắc dọc và các tờ bình đồ - trắc dọc hiển thị cùng nội dung như một dải dưới trắc dọc.

## Giới hạn và cảnh báo siêu cao

**Siêu cao áp dụng lớn nhất**, **Thiếu siêu cao lớn nhất**, **Thừa siêu cao lớn nhất**, **Độ dốc siêu cao lớn nhất** và **Tốc độ đổi siêu cao nhanh nhất** (độ dốc ở tốc độ tuyến, mm/s) được kiểm tra trên mọi đường cong. Giá trị vượt giới hạn là một cảnh báo trong khối Đường sắt và trong bảng Vấn đề, kèm giới hạn và giá trị tìm được. Khi không có tốc độ thiết kế, thiếu siêu cao và tốc độ đổi không được kiểm tra (có ghi chú cho biết điều đó).

## Đường ray

Đặt **Khổ đường** (các mức đặt sẵn tiêu chuẩn 1435 mm, rộng, mét hoặc hẹp, hoặc giá trị của bạn), **Tiết diện ray** (60E1, 54E1, 49E1, 115RE, 136RE: chỉ các kích thước đã công bố), số **Đường ray** và **Khoảng cách tâm đường ray**, rồi **Tà vẹt và đá balát**: vật liệu tà vẹt, chiều dài, bề rộng, chiều cao và khoảng cách; chiều dày đá balát dưới tà vẹt (tại ray thấp), vai đá, độ dốc, mức đỉnh đá thấp hơn đỉnh tà vẹt bao nhiêu; chiều dày balát phụ, lề đất vượt quá chân đá balát, và độ dốc ngang của nền.

Nhấn **Dựng đường ray**. Lệnh này bật hành lang của tuyến, được dựng thành đường ray dọc theo trắc dọc thiết kế: ray và tà vẹt nghiêng theo siêu cao, còn nền thì không. Các mái dốc đào mở ra từ mép lề tại mặt cắt đào và đắp của hành lang, và đường ray được san vào mặt đất đề xuất như đường bộ.

- **Bình đồ**: cả hai ray của mỗi đường ray (lớp C-RAIL-TRAK) và, khi có nhiều hơn một đường ray, tâm của mỗi đường ray (C-RAIL-CNTR), trên màn hình, trong DXF, DWG, PDF và các tờ bình đồ - trắc dọc.
- **Mặt cắt**: tà vẹt, ray, và đáy đá balát và balát phụ trong mọi mặt cắt.
- **3D**: ray, mọi tà vẹt và nền đá balát (Hiện › Đường ray), cũng xuất trong GLB, OBJ và USD.
- **Khối lượng**: chiều dài đường ray, ray (cả hai ray của mọi đường ray, dọc theo tuyến riêng của từng đường ray), tà vẹt, nền đá balát và đá balát trừ phần tà vẹt, và balát phụ, theo phương pháp diện tích đầu trung bình giữa các mặt cắt.

## Kiểm tra hình học đường ray

Ngoài siêu cao, khối Đường sắt còn kiểm tra chính tuyến theo sáu giới hạn khác (đều là giá trị tạm, do bạn đặt):

- **Độ dốc lớn nhất** của trắc dọc thiết kế, tính bằng mm trên mét.
- **Bán kính đường cong đứng nhỏ nhất**, dưới dạng hệ số k trong R ≥ k·V² (R tính bằng mét, V tính bằng km/h). Đường cong đứng parabol có chiều dài L giữa hai độ dốc có bán kính bằng L chia cho độ thay đổi độ dốc.
- **Đường cong đứng ngắn nhất**.
- **Bán kính đường cong nhỏ nhất** trên bình đồ (0 thì tắt kiểm tra).
- **Cung hoặc đoạn thẳng ngắn nhất**, tính theo số giây đi ở tốc độ tuyến: cung tròn, hoặc đoạn thẳng giữa hai đường cong, ngắn hơn quãng đường đó sẽ bị cảnh báo. 1,8 giây là con số quen thuộc "một nửa tốc độ tính bằng km/h, đơn vị mét".
- **Tốc độ đổi thiếu siêu cao** dọc theo mỗi đoạn chuyển tiếp, tính bằng mm/s ở tốc độ tuyến.

**Hình học đường ray** liệt kê độ dốc lớn nhất tìm được và mọi đường cong đứng cùng bán kính của nó và bán kính tốc độ tuyến cần. Đường cong đứng nằm trên đoạn chuyển tiếp hoặc đoạn tăng siêu cao sẽ có ghi chú. Khi không có trắc dọc thiết kế hoặc không có tốc độ thiết kế, các kiểm tra cần chúng sẽ bị bỏ qua và có ghi chú cho biết điều đó.

## Ghi và đường chéo ghi

Trong **Ghi và đường chéo ghi**, nhấn **Thêm ghi**. Ghi được đặt trên đoạn thẳng dài nhất; đặt trong bảng:

- **Cọc mũi ghi**: nơi ghi bắt đầu trên tuyến này.
- **Tim ghi**: số tim ghi N (1:N). Góc tim ghi là 2·atan(1 / 2N).
- **Phía**: trái hoặc phải, nhìn theo chiều tăng cọc.
- **Khoảng cách đường chéo ghi** tính bằng mét: lớn hơn 0 thì ghi trở thành đường chéo ghi sang một đường ray song song ở khoảng cách đó (hai ghi và đoạn thẳng nối giữa chúng).

Bảng hiển thị **Đoạn dẫn** (từ mũi ghi đến tim ghi), **Bán kính** của đường cong khép và **Tốc độ đi ghi** mà bán kính đó cho phép với giới hạn thiếu siêu cao của bạn và không có siêu cao. **Tạo đường ray của ghi** biến tuyến đi ghi thành một tuyến riêng (mũi ghi, đường cong khép, rồi đi thẳng theo góc tim ghi) với cùng cài đặt đường sắt, sẵn sàng để kéo dài.

Bình đồ vẽ hai ray đi ghi của mỗi ghi, đường tâm, một vạch tại cọc mũi ghi và tại tim ghi, và "1:N" (lớp C-RAIL-TURN), trên màn hình, trong DXF, DWG, PDF và các tờ. Khung nhìn 3D vẽ các ray đi ghi ở cao độ của đường chính.

Hình dạng ghi chỉ là **giá trị tạm**: một ghi thẳng và một đường cong khép theo số tim ghi. Ghi được dựng sẽ theo tiêu chuẩn đường sắt và bản vẽ của nhà sản xuất. Cảnh báo: ghi chạy ra khỏi tuyến, nằm trên đường cong, đoạn chuyển tiếp, siêu cao hoặc đường cong đứng, hoặc chồng lên ghi khác; và có ghi chú khi tốc độ tuyến cao hơn tốc độ đi ghi của nó.

## Bao khổ giới hạn

Chọn **Quét bao khổ giới hạn dọc theo đường ray này**. Chọn **Đường bao** (hai hình tạm, hoặc **Đường bao của bạn** nhập dưới dạng các điểm, mỗi dòng một điểm: khoảng cách lệch so với tâm đường ray, rồi chiều cao trên đỉnh ray, tính bằng mét), **Chiều dài phương tiện** và **Khoảng cách tâm bogie**, và nếu có, **Mép sân ga** (phía, khoảng cách từ tâm đường ray, chiều cao trên ray).

Tại mỗi cọc, đường bao được nghiêng theo siêu cao quay quanh ray thấp và được mở rộng theo đường cong: phần giữa phương tiện dịch vào trong một đoạn b² / 8R, hai đầu dịch ra ngoài một đoạn (L² − b²) / 8R (b là khoảng cách tâm bogie, L là chiều dài phương tiện, R là bán kính tại đó, theo đoạn chuyển tiếp). Khối này vẽ mặt cắt trên đoạn thẳng và tại nơi rộng nhất, và liệt kê:

- **bao rộng nhất** và vị trí của nó,
- **khoảng cách tâm đường ray** so với khoảng cách mà hai bao lân cận cần,
- khoảng trống còn lại tại **mép sân ga**, hoặc mức lấn vào bao,
- mọi đường đặc trưng, công trình ống và tuyến đường sắt khác nằm **trong bao**.

Đường đặc trưng có cao độ được đánh giá theo đường bao ở chiều cao của nó trên ray; không có trắc dọc thiết kế, hoặc với điểm không có cao độ, nó chỉ được đánh giá trên bình đồ và danh sách có ghi điều đó. Bình đồ hiển thị hai mép của bao (lớp C-RAIL-CLRN) với dấu chéo tại mỗi vật nằm trong bao.

Các đường bao được đưa ra là **giá trị tạm, không phải khổ đường sắt của bất kỳ tuyến nào**. Hãy nhập khổ giới hạn công trình của tuyến đường sắt bạn trước khi dựa vào kết quả.

## Trong các chương trình khác

- **LandXML**: tuyến đường sắt được ghi kèm các đoạn chuyển tiếp (spiType) và một khối `Cant`: khổ đường, điểm quay, tốc độ tuyến, và một cọc tại mỗi đầu đoạn tăng siêu cao, cùng siêu cao áp dụng, siêu cao cân bằng và thiếu siêu cao. Mở tệp LandXML có khối `Cant` sẽ biến tuyến đó thành đường sắt với các siêu cao đó.
- **IFC**: tuyến với các đoạn siêu cao, ray, tà vẹt, đá balát và balát phụ.

## Chưa xây dựng

Ghi trong xuất IFC, các họ ghi ngoài đường cong khép đơn (ghi cong, tim ghi lưỡi quay, ghi chéo đôi, ghi hình thoi), quy tắc khổ động học (bao là một đường bao cố định có độ lệch theo đường cong), đường dây trên không và tín hiệu.

**Tiêu chuẩn nào.** Trong khối Đường sắt, "Tiêu chuẩn trích dẫn" chọn Không có hoặc Châu Âu (UIC và EN). Chọn Châu Âu sẽ nêu tên các tài liệu mà dự án châu Âu trích dẫn (EN 13803 cho thông số tuyến, EN 13232 cho ghi và giao cắt, EN 15273 cho khổ giới hạn, EN 13848 cho chất lượng hình học đường ray) và cho mỗi giới hạn một ô để ghi điều khoản liên quan. Không có con số nào từ tiêu chuẩn nào được tích hợp sẵn: giới hạn siêu cao, thiếu, thừa, độ dốc và tốc độ đổi, hình học ghi và khổ giới hạn công trình vẫn là giá trị tạm, và cửa sổ cho biết điều đó. Kỹ sư đường sắt cần kiểm tra từng giá trị theo chính văn bản tiêu chuẩn, và ghi điều khoản bên cạnh trước khi dựng bất cứ thứ gì. Tiêu chuẩn Nam Phi và các bảng AREMA không có trong bản phát hành này.
