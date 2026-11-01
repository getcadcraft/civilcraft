---
title: Sắp xếp các bảng và dùng màn hình thứ hai
summary: Neo các bảng bên cạnh sang trái, phải hoặc dưới, xếp chồng, gộp thành thẻ, ghim hoặc ẩn, nổi trên bản vẽ, làm bố cục dày đặc hơn, chọn số hàng cho thanh công cụ, hoặc chuyển chúng sang cửa sổ riêng trên màn hình khác.
keywords: bảng, neo, nổi, di chuyển bảng, kéo, bố cục, thẻ, nhóm thẻ, xếp chồng, ghim, tự động ẩn, ẩn bảng, đóng bảng, gọn, mật độ bố cục, dày đặc, số hàng thanh công cụ, xuống dòng, 1 hàng, 2 hàng, dòng thanh công cụ, màn hình thứ hai, hai màn hình, nhiều màn hình, cửa sổ, cửa sổ bật lên, đặt lại bố cục
from: 32a8dae2
---

Các bảng bên cạnh bản vẽ có thể di chuyển. Đặt chúng ở vị trí phù hợp với bạn, hoặc cho chúng một cửa sổ riêng trên màn hình thứ hai để bản vẽ chiếm toàn bộ màn hình thứ nhất.

:::note
Mỗi bảng có một thanh tiêu đề: thanh mỏng hiển thị tên bảng, nút {{ui:⋯}}, nút ghim và nút đóng ở đầu bảng. Các phiên bản trước 0.7 chỉ có tên và nút {{ui:⋯}}.
:::

## Di chuyển một bảng trong cửa sổ

1. Kéo bảng bằng tên ở đầu bảng.
2. Khi bạn kéo, các vùng có viền sẽ xuất hiện ở bên trái, bên phải và bên dưới bản vẽ. Thả bảng vào một vùng để neo tại đó. Vùng bạn đang trỏ tới sẽ tối đi.
3. Thả bảng ở bất kỳ chỗ nào khác trên bản vẽ để bảng nổi lên.

Các bảng có thể dùng chung một cạnh: chúng xếp chồng lên nhau, và mỗi đường phân cách giữa hai bảng có thể kéo để chia lại không gian (khi đường đang được chọn, phím mũi tên sẽ di chuyển nó, và nhấp đúp vào đường sẽ chia đều không gian). Kéo mép trong của một cạnh đã neo để làm nó rộng hơn hoặc hẹp hơn; nhấp đúp vào mép để đưa về như cũ.

Bảng nổi luôn nằm trên bản vẽ. Di chuyển bảng bằng tên của nó, và đổi kích thước bằng cách kéo góc dưới bên phải (hoặc đưa tiêu điểm tới góc bằng {{key:Tab}} rồi dùng phím mũi tên). Nhấp đúp vào tên bảng để neo lại tại vị trí cũ.

:::touch
Kéo bằng một ngón tay trên tên bảng. Kéo góc dưới bên phải của bảng nổi bằng một ngón tay để đổi kích thước, và các mép giữa các bảng đã neo cũng vậy. Để nổi hoặc neo bảng mà không cần kéo, dùng menu {{ui:⋯}}.
:::

## Gộp bảng thành thẻ

Hai bảng có thể dùng chung một khung và chỉ hiển thị một bảng tại một thời điểm. Kéo một bảng theo tên của nó lên thanh tiêu đề của bảng khác (thanh có viền khi bạn trỏ tới) rồi thả: khung khi đó có một thẻ cho mỗi bảng, nằm trên thanh tiêu đề. Nhấp vào một thẻ để hiển thị bảng đó. Khi một thẻ đang có tiêu điểm, {{key:Left}} và {{key:Right}} chuyển thẻ, còn {{key:Home}} và {{key:End}} đưa tới thẻ đầu tiên và thẻ cuối cùng.

Để đưa một bảng ra khỏi nhóm, chọn {{ui:Chuyển ra khỏi nhóm thẻ}} trong menu {{ui:⋯}} của bảng đó, hoặc kéo bảng đến chỗ khác. Chọn {{ui:Gộp thẻ với}} và tên một bảng để gộp chúng mà không cần kéo.

## Ghim, ẩn và hiển thị lại

- Nút ghim trên thanh tiêu đề của bảng làm bảng **tự động ẩn**: bảng rời khỏi vị trí neo và trở thành một thẻ nhỏ ở mép đó. Trỏ tới thẻ, đưa tiêu điểm hoặc nhấp vào thẻ, bảng sẽ trượt ra trên bản vẽ; rời chuột đi (hoặc nhấn {{key:Esc}}) thì nó trượt lại. Nhấn nút ghim lần nữa, hoặc chọn {{ui:Bỏ ghim}}, để neo bảng cố định.
- Nút đóng, hoặc {{ui:Ẩn bảng này}} trong menu, sẽ ẩn bảng và thu gọn vị trí neo. Một thẻ nét đứt ở mép sẽ đưa bảng trở lại: nhấp vào nó, hoặc đưa tiêu điểm tới rồi nhấn {{key:Enter}}.

## Làm bố cục dày đặc hơn

{{ui:Cài đặt}} › {{ui:Chung}} › {{ui:Mật độ bố cục}} có hai lựa chọn. {{ui:Thoáng}} là mặc định. {{ui:Gọn}} thu hẹp chiều cao hàng, khoảng đệm của bảng, nút thanh công cụ và chữ trong bảng của ứng dụng đó để nhiều nội dung vừa trên màn hình hơn. Lựa chọn được lưu riêng cho từng ứng dụng. Màn hình cảm ứng vẫn giữ các nút lớn ở cả hai chế độ, còn điện thoại giữ bố cục riêng. {{ui:Đặt lại bố cục}} giữ nguyên mật độ bạn đã chọn.

## Chọn số hàng cho thanh công cụ

{{ui:Cài đặt}} › {{ui:Chung}} › {{ui:Số hàng thanh công cụ}} có ba lựa chọn. {{ui:Xuống dòng}} là mặc định: mọi nhóm công cụ đều hiển thị, trên bao nhiêu dòng tùy cần. {{ui:2 hàng}} giữ thanh công cụ ở hai dòng và {{ui:1 hàng}} ở một dòng, để bản vẽ có thêm chiều cao; các nhóm không vừa sẽ cuộn ngang bên trong thanh công cụ (dùng con lăn chuột, vuốt bằng hai ngón, hoặc {{key:Tab}} tới một công cụ). Thanh công cụ đã vừa trong hai dòng sẽ giữ nguyên khi chọn {{ui:2 hàng}}, vì lưới chỉ làm nó cao hơn. Lựa chọn được lưu riêng cho từng ứng dụng. Màn hình cảm ứng và điện thoại giữ bố cục riêng. CadCraft có cài đặt riêng cho thanh công cụ của mình, trong {{ui:Cài đặt}} › {{ui:CadCraft}}.

## Dùng bàn phím

Nút {{ui:⋯}} của mỗi bảng mở một menu: {{ui:Neo bên trái}}, {{ui:Neo bên phải}}, {{ui:Neo ở dưới}}, {{ui:Nổi trên bản vẽ}}, {{ui:Ghim vào mép}}, {{ui:Ẩn bảng này}}, {{ui:Gộp thẻ với}} một bảng khác, {{ui:Chuyển sang cửa sổ mới}} và {{ui:Đưa lại}}. Dùng {{key:Tab}} để tới nút, nhấn {{key:Enter}}, di chuyển bằng phím mũi tên và nhấn {{key:Enter}} lần nữa. {{key:Esc}} đóng menu.

## Đưa bảng sang màn hình thứ hai

1. Chọn {{ui:⋯}} trên một bảng, rồi chọn {{ui:Chuyển tất cả bảng sang cửa sổ mới}}. Bạn cũng có thể chọn {{ui:Chuyển bảng sang cửa sổ mới}} trong {{ui:Cài đặt}}.
2. Một cửa sổ nhỏ mở ra với các bảng bên trong. Kéo nó sang màn hình khác và phóng to tùy ý.
3. Tiếp tục làm việc: các bảng vẫn tác động lên bản vẽ như trước, và bản vẽ lấp đầy cửa sổ chính.

Phím tắt vẫn hoạt động khi cửa sổ bảng ở trước: các phím bạn nhấn ở đó, trừ khi đang gõ trong ô nhập, sẽ gửi tới bản vẽ. Các câu hỏi và hộp thoại mà ứng dụng hiển thị vẫn mở trong cửa sổ chính, nên hãy xem ở đó khi một hộp thoại xuất hiện. Giao diện và cỡ chữ của bảng theo cửa sổ chính.

:::chromium
Chrome và Edge có thể đặt cửa sổ lên màn hình khác giúp bạn. Khi đã kết nối màn hình thứ hai, chọn {{ui:Đưa sang màn hình khác của tôi}} trong cửa sổ bảng (hoặc {{ui:Đưa các bảng sang màn hình khác của tôi}} trong menu {{ui:⋯}} của một bảng). Trình duyệt sẽ hỏi một lần xem trang này có được xem màn hình của bạn không; sau khi bạn cho phép, cửa sổ bảng sẽ mở trên màn hình đó mỗi lần.
:::

:::firefox safari
Tự kéo cửa sổ bảng sang màn hình khác. Lần sau nó sẽ mở ở cùng vị trí và cùng kích thước.
:::

## Nhiều cửa sổ bảng

Mỗi bảng có thể có một cửa sổ riêng: tối đa bốn cửa sổ bảng, ví dụ mỗi màn hình một cửa sổ.

- Trong menu {{ui:⋯}} của một bảng, {{ui:Chuyển sang cửa sổ mới}} mở một cửa sổ khác cho bảng đó, còn {{ui:Chuyển sang cửa sổ bảng 2}} (và tương tự) chuyển bảng vào một cửa sổ đang mở. Cửa sổ thứ hai có tên là "bảng 2".
- Kéo bảng theo tên từ cửa sổ này sang cửa sổ khác: thả vào cửa sổ chính để neo hoặc nổi ở đó (các vùng có viền sẽ hiện khi bạn trỏ tới), hoặc thả vào một cửa sổ bảng khác để chuyển bảng vào đó. Thả ở chỗ khác thì bảng giữ nguyên vị trí cũ.
- Cửa sổ bảng không còn bảng nào sẽ tự đóng.

Sau khi tải lại trang, ứng dụng sẽ đề nghị mở lại các cửa sổ bảng của bạn. Trình duyệt chỉ mở một cửa sổ mỗi lần nhấp, nên hãy chọn {{ui:Mở cửa sổ tiếp theo}} một lần cho mỗi cửa sổ.

## Di chuyển hộp thoại

Mọi hộp thoại đều có thể đưa ra khỏi đường đi của bản vẽ: nhấn và kéo thanh tiêu đề của nó. Hộp thoại nhớ vị trí bạn để lại, mỗi hộp thoại riêng, và trở về đúng chỗ đó lần sau khi mở. Nhấp đúp vào thanh tiêu đề để đưa hộp thoại về giữa.

Từ bàn phím, nhấn {{key:Alt}}+{{key:Shift}}+phím mũi tên khi tiêu điểm nằm trong hộp thoại để di chuyển 16 điểm ảnh mỗi lần; thêm {{key:Ctrl}} để di chuyển 64 điểm ảnh. Hộp thoại nằm ngoài màn hình (sau khi cửa sổ hoặc màn hình nhỏ hơn) sẽ được đưa trở lại.

Trên điện thoại, hộp thoại vẫn là tờ toàn chiều rộng và không được di chuyển.

Trong CadCraft Studio, hộp thoại {{ui:In ra PDF}} của CadCraft, hộp thoại bạn có thể giữ mở khi làm việc, có một nút trên thanh tiêu đề: {{ui:Mở trong cửa sổ riêng}}. Hộp thoại sẽ chuyển thành một cửa sổ riêng mà bạn có thể đặt trên màn hình khác. Đóng hộp thoại sẽ đóng cửa sổ, và đóng cửa sổ sẽ đóng hộp thoại.

## Đưa các bảng về lại

- Chọn {{ui:Đưa các bảng về lại}} trong cửa sổ bảng, hoặc đơn giản đóng cửa sổ đó. Các bảng sẽ trở về vị trí cũ.
- Đóng hoặc tải lại cửa sổ chính cũng sẽ đóng cửa sổ bảng. Khi ứng dụng mở lại, nó sẽ thông báo rằng các bảng của bạn đang ở cửa sổ riêng; chọn {{ui:Mở lại}} để đưa cửa sổ về, hoặc {{ui:Giữ ở đây}}.
- {{ui:Cài đặt}} › {{ui:Chung}} › {{ui:Đặt lại bố cục}} đưa mọi bảng về vị trí ban đầu.

:::tip
Nếu không có gì mở ra khi bạn chuyển bảng sang cửa sổ mới, trình duyệt đã chặn cửa sổ bật lên. Ứng dụng sẽ thông báo điều đó và giữ các bảng tại chỗ. Hãy cho phép cửa sổ bật lên cho getcadcraft.com, rồi thử lại.
:::

Bố cục được lưu riêng cho từng ứng dụng trong trình duyệt này, cùng với các cài đặt khác của bạn.
