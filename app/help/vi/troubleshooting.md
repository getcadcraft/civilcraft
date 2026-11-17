---
title: Khắc phục sự cố
summary: Triệu chứng, nguyên nhân và cách khắc phục các sự cố thường gặp trong CivilCraft, kèm nội dung thông báo chính xác mà ứng dụng hiển thị.
keywords: sự cố, lỗi, không hoạt động, sửa, trợ giúp, thông báo, khắc phục, bị từ chối, thiếu, sai, đổi chỗ, thiếu đường đồng mức
from: a9f7dedc
---

Thông báo xuất hiện ở thanh trạng thái phía dưới bên phải, trong các hộp ở bảng bên trái và bảng bên phải, và trong các hộp thoại. Chúng được trích dẫn ở đây đúng như ứng dụng hiển thị.

## Mở tệp

**"Tệp này lớn hơn 200 MB; CivilCraft chưa mở được tệp lớn như vậy."**
Hãy tách tệp điểm, hoặc giảm bớt dữ liệu trước khi mở.

**"Không thể mở site.json: Đây không phải tệp dự án CivilCraft."**
Tệp kết thúc bằng `.json` hoặc bắt đầu bằng `{` nhưng không phải là dự án CivilCraft. Tệp điểm không được bắt đầu bằng `{`.

**"Không thể mở … Tệp dự án này được tạo bằng CivilCraft mới hơn (phiên bản 2)."**
Dự án được lưu bởi một bản dựng mới hơn. Hãy mở nó ở bản đó, hoặc xuất LandXML từ nó.

**"Không thể mở … Đây là XML nhưng không phải LandXML (phần tử gốc là <…>)."**
Tệp là một loại XML khác. Hãy xuất LandXML từ chương trình khác.

**"… không có điểm, bề mặt TIN hoặc tuyến nào mà CivilCraft đọc được."**
Mọi thứ trong tệp đều là loại CivilCraft bỏ qua (ví dụ chỉ có bề mặt lưới, hoặc chỉ có tuyến xoắn ốc). Phần còn lại của thông báo cho biết có những gì. Xem [LandXML: đọc và ghi những gì](topic:landxml-reference).

**"Không tải được site mẫu: …"**
{{ui:Mở công trường mẫu}} đọc một tệp từ trang CadCraft. Khi không có kết nối, nó chỉ hoạt động nếu CivilCraft đã được lưu để dùng ngoại tuyến (nút trên thanh ứng dụng hiển thị {{ui:Sẵn sàng ngoại tuyến}}). Hãy kết nối mạng, nhấp {{ui:Lưu để dùng ngoại tuyến}}, và từ đó nó hoạt động ngoại tuyến. Xem [Ngoại tuyến](common:offline).

**{{ui:Lưu để dùng ngoại tuyến}} hiển thị {{ui:Không thể lưu}}.**
Một số tệp chưa tải xuống được. Hãy kiểm tra kết nối và nhấp lại nút.

**{{ui:Lưu để dùng ngoại tuyến}} hiển thị {{ui:Không dùng được chế độ ngoại tuyến}}.**
Cửa sổ trình duyệt này không thể giữ bản sao ngoại tuyến, thường là vì đây là cửa sổ riêng tư hoặc máy tính do tổ chức quản lý. Hãy mở CivilCraft trong cửa sổ thông thường.

**Ngoại tuyến, ứng dụng không mở được.**
Ứng dụng chưa được lưu để dùng ngoại tuyến trong trình duyệt này, hoặc trình duyệt đã xóa dữ liệu trang (Safari làm điều này với các trang không truy cập trong vài tuần). Hãy kết nối mạng, mở CivilCraft và nhấp {{ui:Lưu để dùng ngoại tuyến}}.

**Bản sao ngoại tuyến là một bản dựng cũ hơn.**
Nhấp {{ui:Sẵn sàng ngoại tuyến}}, rồi {{ui:Lưu lại (lấy bản mới nhất)}} khi có kết nối.

**Một tệp bị mờ trong hộp mở.**
Hộp chỉ liệt kê tệp điểm, LandXML và tệp dự án theo phần đuôi. Thay vào đó, hãy kéo tệp lên mặt bằng, hoặc đổi tên thành `.txt`.

## Nhập điểm

**"Không đọc được điểm nào từ tệp này."**
Hãy chọn thứ tự cột trong **Cột** bằng tay. Nếu không có gì hiệu quả, hãy mở tệp bằng trình soạn thảo văn bản và kiểm tra rằng mỗi dòng là một điểm, có chứa các con số.

**Mặt bằng bị lật ngược, xoay hoặc kéo dài thành một đường.**
Bắc và Đông đã bị đảo. Bản tóm tắt ghi "đoán theo số cột". Hãy chọn PENZD thay vì PNEZD (hoặc ngược lại) trong **Cột**, hoặc nhập lại.

**Các điểm ở xa phần còn lại, và mặt bằng thu nhỏ thành một chấm.**
Một dòng bị gõ sai tọa độ, hoặc tệp trộn lẫn các hệ tọa độ. Hãy tìm điểm đó (nhấp vào nó để xem số hiệu) và sửa tệp.

**Các dòng được liệt kê dưới "Dòng không đọc được".**
Xem bảng trong [Nhập điểm đo](topic:import-points#rows-that-are-not-read).

**Các điểm cũ của tôi đã mất.**
Nhập một tệp điểm sẽ thay thế toàn bộ điểm và xóa lịch sử hoàn tác. Hãy mở dự án đã lưu để lấy lại chúng.

## Bề mặt

**"Bề mặt: Chưa xây dựng" với hộp màu đỏ.**
Hộp cho biết lý do: "Bề mặt cần ít nhất ba điểm có cao độ.", "Các điểm đều nằm trên một đường: không có tam giác.", "Không có điểm nào có cao độ.", "Đường biên không giao với các điểm." hoặc "Không còn tam giác nào bên trong đường biên." Hãy kiểm tra thứ tự cột, các nhóm điểm (các nhóm có được đặt là {{ui:Bỏ qua}} không?), và đường biên.

**Đường đồng mức cắt thẳng qua một rãnh hoặc gờ.**
Đường đó không phải là đường ngắt. Hãy đặt nhóm của nó thành {{ui:Đường ngắt}}, hoặc vẽ nó bằng công cụ {{ui:Đường ngắt}}. Xem [Dựng và tinh chỉnh bề mặt](topic:build-surface).

**Một nhóm đường ngắt vẽ thành đường ngoằn ngoèo.**
Nhóm chứa nhiều hơn một đường, hoặc các điểm của nó không được đánh số theo đường. Hãy đặt lại nhóm thành {{ui:Điểm}} và vẽ từng đường bằng công cụ {{ui:Đường ngắt}}.

**Các tam giác dài và mảnh dọc theo phía ngoài.**
Hãy vẽ một đường biên ({{key:O}}) hoặc đặt **Cạnh ngoài dài nhất**.

**Không có đường đồng mức nào, mặc dù bề mặt đã được dựng.**
Hoặc {{ui:Đường đồng mức}} đang tắt trong **Hiển thị**, hoặc khoảng cách quá nhỏ đến mức sẽ có hơn 2,000 mức đường đồng mức. Hãy chọn khoảng cách lớn hơn.

**Đường ngắt hoặc đường biên không thay đổi gì.**
Bề mặt được lấy từ LandXML ("Bề mặt (từ LandXML)"). Nó được dùng nguyên như vậy. Nhấp {{ui:Dựng lại bề mặt từ các điểm}} để dựng từ các điểm.

**"Chưa có bề mặt: hãy mở các điểm đo trước."**
Đường ngắt, đường biên và nền cần một bề mặt mặt đất có sẵn. Hãy nhập điểm trước.

**"Hãy nhấp một điểm đo có cao độ: đường ngắt lấy cao độ của các điểm."**
Công cụ {{ui:Đường ngắt}} chỉ chọn điểm đo. Hãy phóng to và nhấp vào một điểm (một ô vuông màu cam cho biết điểm nào sẽ được chọn).

## Vẽ

**Điểm cuối cùng của tôi biến mất khi tôi nhấp đúp để kết thúc.**
Trong bản dựng này, nhấp đúp sẽ kết thúc tuyến, nền, đường ngắt hoặc đường biên nhưng bỏ điểm mà bạn đã nhấp đúp. Hãy nhấp điểm cuối một lần và nhấn Enter. Dùng {{key:Mod+Z}} nếu điều đó đã xảy ra, rồi vẽ lại.

**Tôi không thể kết thúc bản vẽ trên máy tính bảng.**
Kết thúc cần phím Enter; hiện chưa có nút trên màn hình. Hãy gắn bàn phím. Xem [Chuột, bàn di chuột và cảm ứng](topic:keyboard#mouse-trackpad-and-touch).

**Kéo để đặt điểm lại làm di chuyển khung nhìn.**
Kéo quá vài pixel sẽ di chuyển mặt bằng trong mọi công cụ. Hãy nhấp mà không di chuyển.

**"Tuyến cần ít nhất hai điểm." / "Nền cần ít nhất ba góc." / "Tuyến ống cần ít nhất hai công trình."**
Bạn đã nhấn Enter quá sớm. Bản vẽ bị hủy; hãy bắt đầu lại.

**Các phím như A hoặc G không có tác dụng.**
Một ô nhập văn bản hoặc danh sách trong bảng vẫn đang có tiêu điểm, nên các chữ cái đi vào đó. Hãy nhấp mặt bằng một lần, rồi nhấn phím. Trên Mac, phím xóa là Backspace đối với trình duyệt: dùng Fn và Delete để xóa vùng chọn.

## Tuyến và trắc dọc

**"Các đường cong tại PI 2 và PI 3 chồng lên nhau: … Hãy dùng bán kính nhỏ hơn."**
Hai đường cong cần nhiều tiếp tuyến hơn khoảng có giữa các PI của chúng. Hãy giảm một hoặc cả hai bán kính trong bảng PI, hoặc đưa các PI ra xa nhau.

**"PI 3 quay ngược lại ngay; không thể đặt đường cong."**
Tuyến quay ngược trở lại chính nó tại PI đó. Hãy di chuyển hoặc xóa PI.

**"Tuyến này không có mặt đất bên dưới để bắt đầu."**
Tuyến nằm ngoài bề mặt. Hãy di chuyển nó lên bề mặt, hoặc thêm PVI bằng cách nhấp khi {{ui:Thêm PVI}} đang bật.

**"Đường cong đứng tại PVI 3 (L = …) bắt đầu trước khi đường cong hoặc PVI trước đó kết thúc." / "… vượt qua PVI kế tiếp."**
Hãy rút ngắn chiều dài đường cong hoặc đưa các PVI ra xa nhau.

**"Đã có PVI tại …"**
Đã có một PVI tại cọc đó. Hãy nhấp ở chỗ khác, hoặc kéo PVI hiện có.

**Khung nhìn trắc dọc trống: "Vẽ một tuyến để xem trắc dọc của nó."**
Chưa có tuyến nào, hoặc tuyến đã chọn có lỗi.

## Hành lang và nền

**"Hành lang cần một trắc dọc thiết kế không có lỗi."**
Hãy bắt đầu một trắc dọc thiết kế ({{ui:Bắt đầu từ mặt đất}}) và sửa mọi chỗ đường cong chồng lên nhau.

**"… mái dốc bên chạy ra khỏi bề mặt trước khi gặp mặt đất." / "… các đường dốc chạy ra khỏi bề mặt trước khi gặp nó …"**
Phần san đạt đến mép bề mặt trước khi gặp mặt đất. Hãy đưa thiết kế vào trong từ mép, hoặc đưa nó gần mặt đất hơn. Một nền mới được vẽ một phần nằm ngoài bề mặt có thể bắt đầu ở cao độ 0: hãy nhập một cao độ thực.

**"Các đường giao với mặt đất của hành lang cắt qua …" / "Đường giao với mặt đất tự cắt chính nó …"**
Các mái dốc từ các phía khác nhau va vào nhau: đường cong gấp, nền hẹp, đào sâu hoặc đắp cao. Hãy dùng bán kính lớn hơn, cấu kiện hẹp hơn, nền rộng hơn hoặc mái dốc đứng hơn.

**"Chưa có khối lượng: nền cần được san không có lỗi."**
Hãy sửa các lỗi được liệt kê trong hộp màu đỏ phía trên nó.

**{{ui:Dự kiến (đã san)}} bị mờ.**
Chưa có nền hoặc hành lang nào được san.

## Ống

**"P2 chưa có cao độ đáy."**
Nhấp {{ui:Đặt cao độ đáy theo quy tắc}} hoặc nhập cao độ đáy.

**"P1: không có mặt đất tại S1 để bắt đầu."**
Công trình phía thượng lưu nằm ngoài bề mặt và không có miệng. Hãy nhập một cao độ miệng cho nó.

**Mọi ống đều bị đánh dấu sau khi tôi di chuyển một công trình.**
Di chuyển công trình không thay đổi cao độ đáy. Nhấp {{ui:Đặt mọi cao độ đáy theo quy tắc}}.

Mọi thông báo về mạng được giải thích trong [Bố trí mạng ống tự chảy](topic:pipe-network#read-and-fix-problems).

## Lưu và xuất

**"Chưa có gì để xuất." / "Chưa có gì để in."**
Dự án đang trống. Hãy nhập điểm trước.

**Tôi không tìm thấy tệp đã lưu.**
Tệp nằm trong thư mục tải xuống của trình duyệt (thường là thư mục Downloads). Xem [Tệp có thể mở, lưu và xuất](topic:files#where-the-files-go).

**Tỷ lệ PDF sai trên giấy.**
In ở 100% hoặc kích thước thực, không dùng "vừa trang".

**Có dấu chấm hỏi trong văn bản PDF.**
Tên hoặc mô tả dùng ký tự ngoài bộ ký tự Tây Âu. Thông báo trạng thái đếm các ký tự này. Hãy đổi tên bằng ký tự thông thường.

**Bản in bị cắt ở các mép.**
Tỷ lệ quá lớn so với khổ giấy. Hãy chọn tỷ lệ có ghi "(vừa)", khổ giấy lớn hơn, hoặc {{ui:Những gì đang hiển thị trên màn hình}}.

**{{key:Mod+P}} mở hộp thoại in của trình duyệt.**
Trang chưa có tiêu điểm. Hãy đóng hộp thoại, nhấp vào mặt bằng, và nhấn {{key:Mod+P}} lại, hoặc nhấp {{ui:PDF}}.

## Bản thân ứng dụng

**Màn hình trống hoặc thanh công cụ không làm gì.**
Hãy dùng phiên bản hiện tại của Chrome, Edge, Firefox hoặc Safari, rồi tải lại trang. Xem [Trình duyệt](common:browsers).

**Ứng dụng chậm với một tệp điểm lớn.**
Tắt {{ui:Tam giác}}, {{ui:Nhãn điểm}} và {{ui:Dải cao độ}}, và dùng khoảng cách đường đồng mức lớn hơn. Các bề mặt rất lớn cần một lúc để dựng lại sau mỗi thay đổi.

**Trình duyệt hỏi "Rời khỏi trang này?"**
Dự án có thay đổi chưa lưu. Hãy ở lại, lưu bằng {{key:Mod+S}}, rồi rời đi.
