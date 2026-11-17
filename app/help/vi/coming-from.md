---
title: Chuyển từ phần mềm kỹ thuật dân dụng khác
summary: Quy trình làm việc quen thuộc trong thiết kế dân dụng được ánh xạ sang CivilCraft thế nào, và những khác biệt khiến người dùng có kinh nghiệm vấp trong giờ đầu tiên.
keywords: chuyển đổi, di chuyển, quen thuộc, khác biệt, quy trình, lệnh, ánh xạ, cogo, hành lang, san nền, mạng ống, kiểu, dòng lệnh
from: feae37d6
---

Nếu bạn đã dùng Civil 3D, bạn đã biết các ý tưởng trong CivilCraft: điểm và nhóm điểm, bề mặt TIN với đường ngắt và biên, tuyến theo PI, trắc dọc theo PVI, các cấu kiện quét thành hành lang, san nền đến đường giao với mặt đất, mạng ống thoát theo trọng lực, LandXML. Điều khác biệt gần như là mọi thứ xung quanh chúng: không có tệp bản vẽ, không có dòng lệnh (trừ khi bạn chọn kiểu menu {{ui:Drafting classic}}), không có kiểu, không có Prospector và không có hộp thoại cài đặt. CivilCraft là một công cụ nhỏ, tập trung trong trình duyệt, và trong bản dựng này nó chỉ làm được một phần nhỏ những gì một bộ phần mềm dân dụng đầy đủ làm được. Trang này ánh xạ những gì bạn biết sang những gì có ở đây.

:::tip
Nếu bạn thích dải lệnh của Civil 3D, chọn kiểu menu {{ui:Civil ribbon}} trong {{ui:Settings}} › {{ui:CivilCraft}} › {{ui:Menus, keys and mouse}}: các thẻ Trang chủ, Bề mặt, Chỉnh sửa, Vị trí địa lý, Xem và Xuất, nút giữa để di chuyển khung nhìn, và {{key:Shift}} cùng nút giữa để xoay chế độ xem 3D. Nếu bạn gõ lệnh, {{ui:Drafting classic}} thêm một dòng lệnh (ALIGNMENT, PAD, PROFILE, ZOOM …). Xem [Menu, phím và chuột](topic:menus-keys-and-mouse).
:::

## Bản đồ quy trình

| Bạn muốn làm gì | Cách quen thuộc | Trong CivilCraft |
|---|---|---|
| Đưa điểm khảo sát vào | Nhập điểm bằng định dạng tệp điểm | {{ui:Open}}, rồi kiểm tra thứ tự cột trong **Nhập điểm** ([Nhập điểm khảo sát](topic:import-points)) |
| Sắp xếp điểm | Nhóm điểm, khóa mô tả | Nhóm tự động theo từ đầu tiên của mô tả; không có khóa mô tả |
| Sửa một điểm | Trình sửa điểm, điểm nắm | Nhấp vào điểm và nhập trong Thuộc tính, hoặc kéo nó ([Sửa một điểm khảo sát](topic:edit-points)) |
| Dựng mặt đất hiện trạng | Tạo bề mặt, thêm nhóm điểm làm dữ liệu | Tự động: bề mặt được dựng lại mỗi khi đầu vào thay đổi |
| Thêm đường ngắt | Thêm đường ngắt từ đa tuyến hoặc đường đặc trưng | Đặt một nhóm điểm thành {{ui:Breakline}}, hoặc nhấp các điểm bằng công cụ {{ui:Breakline}} ({{key:B}}) |
| Cắt bề mặt | Biên ngoài, biên ẩn, chiều dài tam giác tối đa | {{ui:Boundary}} ({{key:O}}, chỉ ngoài) và **Cạnh ngoài dài nhất** |
| Hiển thị đường đồng mức | Kiểu bề mặt | **Hiển thị** trong bảng bên trái: khoảng cách, bội số đường chính, nhãn, dải, mũi tên độ dốc |
| Bố trí tim tuyến | Công cụ tạo tuyến, cài đặt đường cong và đường xoắn | {{ui:Alignment}} ({{key:A}}): nhấp các PI, {{key:Enter}}; bán kính và chiều dài đường xoắn trong bảng PI |
| Tạo khung nhìn trắc dọc | Trình hướng dẫn khung nhìn trắc dọc, dải | {{ui:Profile}} ({{key:R}}): một khung nhìn trắc dọc dưới mặt bằng, luôn vừa khung |
| Thiết kế độ dốc | Công cụ bố trí trắc dọc | {{ui:Start from the ground}}, {{ui:Add PVIs}} ({{key:I}}), kéo PVI, nhập **Đường cong L** |
| Dựng đường | Mặt cắt điển hình, cấu kiện con, hành lang, mục tiêu, vùng | Đánh dấu **Quét mặt cắt điển hình dọc theo trắc dọc thiết kế** dưới tuyến; một làn, lề và mái dốc mỗi bên, hoặc mỗi bên được dựng từ các phần (rãnh, bó vỉa, vỉa hè …) |
| San một nền | Đường đặc trưng, nhóm san, tiêu chí san | {{ui:Pad}} ({{key:G}}): một nền phẳng với mái dốc đào và đắp đến đường giao với mặt đất |
| Tính khối lượng đất | Bề mặt khối lượng, bảng khối lượng | **Khối lượng đất** trong bảng bên phải, phương pháp lưới, cập nhật trực tiếp |
| Bố trí thoát nước mưa hoặc nước thải | Mạng ống với danh sách cấu kiện, quy tắc | {{ui:Pipes}} ({{key:P}}): nhấp các công trình phía hạ lưu; ba quy tắc bạn đặt; cao độ đáy ống tự động |
| Trao đổi với người khác | Nhập và xuất LandXML | {{ui:Open}} một tệp LandXML; {{ui:LandXML}} để xuất ([Trao đổi LandXML](topic:landxml)) |
| Gửi nét vẽ sang CAD | Xuất sang DWG | {{ui:DWG}} (định dạng 2000 đến 2018) hoặc {{ui:DXF}} (R12) |
| In | Bố cục, khung nhìn, bộ tờ | {{ui:PDF}}: một tờ ngang của mặt bằng ở tỷ lệ đã chọn; các tờ mặt bằng, trắc dọc và tờ mặt cắt dưới dạng PDF |
| Chia sẻ công việc giữa các tệp | Lối tắt dữ liệu, tham chiếu | Chưa có: mỗi tệp một dự án |
| Hoàn tác | Hoàn tác | {{key:Mod+Z}} và {{key:Mod+Y}}, 200 bước; cài đặt hiển thị không phải là bước hoàn tác |

## Những khác biệt khiến người ta vấp

**Không có dòng lệnh** trừ khi bạn chọn kiểu menu {{ui:Drafting classic}}. Công cụ là các nút trên thanh công cụ và các chữ cái đơn: {{key:A}} tuyến, {{key:G}} nền, {{key:P}} ống, {{key:B}} đường ngắt, {{key:O}} biên, {{key:R}} trắc dọc, {{key:I}} thêm PVI, {{key:V}} chọn, {{key:F}} vừa khung. Trong các kiểu menu khác, gõ tên lệnh sẽ không làm gì. Xem [Phím và chuột](topic:keyboard).

**Enter kết thúc; nhấp đúp có rủi ro.** Nhấp điểm cuối một lần, rồi nhấn {{key:Enter}}. Trong bản dựng này, nhấp đúp cũng kết thúc, nhưng bỏ điểm bạn vừa nhấp đúp. Nhấp chuột phải không kết thúc hay lặp lại; nó chỉ di chuyển khung nhìn khi bạn kéo bằng nút này.

**Mọi thứ luôn động.** Thay đổi một nhóm điểm, một bán kính, một PVI hoặc độ dốc nền, và bề mặt, đường đồng mức, hành lang, đường giao với mặt đất và khối lượng cập nhật ngay. Không có gì cần dựng lại và không có gì bị lỗi thời.

**Không có gì là đối tượng bản vẽ.** Mặt bằng là một khung nhìn của thiết kế, không phải bản vẽ bạn có thể sửa bằng lệnh CAD. Bạn không thể thêm đường hoặc chữ của riêng mình, đổi màu lớp, hay phân rã bất cứ thứ gì. Xuất sang DXF và hoàn thiện bản vẽ trong một chương trình CAD.

**Không có kiểu.** Màu sắc, độ dày nét, cỡ nhãn và tên lớp được cố định (xem [Các lớp mặt bằng](topic:plan-layers)). Giấy và Mô hình trên thanh ứng dụng chuyển giữa màn hình sáng và tối.

**Mỗi loại một.** Một bề mặt mặt đất hiện trạng, một kết quả đã san, một mạng ống cho mỗi dự án. Nhiều tuyến và nền thì không sao.

**Đơn vị chỉ là nhãn.** Chọn {{ui:US feet}} hoặc {{ui:Metres}} không đổi bất cứ thứ gì. Không có tỷ lệ bản vẽ. Hệ tọa độ là tùy chọn: đặt một hệ dưới {{ui:Coordinates}} và không có gì di chuyển, nó chỉ cho biết các số có ý nghĩa gì (xem [Đặt hệ tọa độ của dự án](topic:coordinate-systems)). Feet được coi là feet khảo sát Mỹ khi ghi vào LandXML.

**Nhóm đường ngắt nối theo thứ tự số hiệu điểm.** Một nhóm đặt thành {{ui:Breakline}} trở thành một đường đi qua mọi điểm của nó, theo thứ tự số. Các mã dùng chung (hai đường dòng chảy cùng mã "FL") tạo thành một đường zig-zag; hãy vẽ những đường đó bằng tay.

**Cọc trông giống nhau, mét thì khác.** Feet dùng cọc 100 ft (12+34.56); mét dùng cọc 1000 m (1+234.567).

**Xóa trên Mac.** Phím có nhãn delete trên Mac là Backspace đối với trình duyệt. Dùng Fn và delete, hoặc nút {{ui:Delete}}, để xóa vùng chọn.

**Tệp là bản tải xuống.** {{ui:Save}} tải xuống một tệp `.civilcraft.json` mỗi lần; không có "lưu đè lên tệp đang mở". Một bản khôi phục công việc chưa lưu được giữ trong trình duyệt này ([Khôi phục công việc chưa lưu](common:recover)). Mở một tệp điểm sẽ thay thế các điểm mà không hỏi. Xem [Các tệp bạn có thể mở, lưu và xuất](topic:files).

**Quy tắc là của bạn.** Quy tắc mạng ống và mặt cắt điển hình của hành lang bắt đầu với các giá trị giữ chỗ không phải là tiêu chuẩn. Hãy đặt quy tắc của riêng bạn trước khi tin vào bất kỳ kiểm tra nào.

**Khối lượng dựa trên lưới.** Đào và đắp đến từ một lưới mịn giữa hai bề mặt, bên trong các đường giao với mặt đất, không có hệ số nở hoặc co. Chúng gần với, nhưng không giống, khối lượng TIN-sang-TIN.

## Những gì còn thiếu

Đường xoắn khác clothoid, mặt cắt điển hình thay đổi dọc theo đường, nền có độ dốc, khả năng miệng thu và trữ nước, danh mục cấu kiện, ống trong trắc dọc, bố trí thửa đất và định kích thước lô, bình sai bình phương tối thiểu và cơ sở dữ liệu khảo sát, mở DWG, và nhiều hơn nữa. Danh sách đầy đủ, cùng những gì nên làm thay thế hôm nay, nằm trong [Chưa xây dựng](topic:not-built-yet).
