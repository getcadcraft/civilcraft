---
title: Sắp xếp các bảng và dùng màn hình thứ hai
summary: Neo các bảng bên cạnh sang trái, phải hoặc dưới, xếp chồng, nhóm thành thẻ, ghim hoặc ẩn, cho nổi trên bản vẽ, làm bố cục dày đặc hơn, chọn số hàng của thanh công cụ, hoặc chuyển chúng sang cửa sổ riêng trên màn hình khác.
keywords: bảng, neo, nổi, di chuyển bảng, kéo, bố cục, thẻ, nhóm thẻ, xếp chồng, ghim, tự động ẩn, ẩn bảng, đóng bảng, gọn, mật độ bố cục, dày đặc, số hàng thanh công cụ, xuống dòng, 1 hàng, 2 hàng, dòng thanh công cụ, màn hình thứ hai, hai màn hình, màn hình kép, nhiều màn hình, cửa sổ, cửa sổ bật lên, đặt lại bố cục
from: 49530239
---

Các bảng bên cạnh bản vẽ có thể di chuyển. Đặt chúng ở nơi bạn thấy hợp, hoặc cho chúng một cửa sổ riêng trên màn hình thứ hai để bản vẽ chiếm toàn bộ màn hình thứ nhất.

:::note
Mỗi bảng có một thanh tiêu đề: một thanh mảnh ghi tên bảng, menu {{ui:⋯}}, nút ghim và nút đóng ở đầu bảng. Các phiên bản trước 0.7 chỉ có tên và menu {{ui:⋯}}.
:::

## Di chuyển một bảng trong cửa sổ

1. Kéo bảng theo tên ở trên cùng.
2. Khi đang kéo, các vùng có viền sẽ hiện ở bên trái, bên phải và dưới bản vẽ. Thả bảng vào một vùng để neo bảng ở đó. Vùng bạn đang trỏ tới sẽ tối đi.
3. Thả bảng ở chỗ khác trên bản vẽ để bảng nổi.

Các bảng có thể dùng chung một cạnh: chúng xếp chồng lên nhau, và mỗi đường phân cách giữa hai bảng có thể kéo để chia lại không gian (khi đường phân cách đang được chọn, phím mũi tên sẽ dời nó, và nhấp đúp vào nó sẽ chia đều không gian). Kéo mép trong của một cạnh đã neo để làm nó rộng hơn hoặc hẹp hơn; nhấp đúp vào mép để đặt lại.

Bảng nổi luôn nằm trên bản vẽ. Di chuyển bảng bằng tên, và đổi kích thước bằng cách kéo góc dưới bên phải (hoặc chuyển tiêu điểm tới góc bằng {{key:Tab}} rồi dùng phím mũi tên). Nhấp đúp vào tên bảng để neo lại ở vị trí cũ.

:::touch
Kéo bằng một ngón tay trên tên bảng. Kéo góc dưới bên phải của bảng nổi bằng một ngón tay để đổi kích thước, và các mép giữa các bảng đã neo cũng làm tương tự. Để làm bảng nổi hoặc neo mà không cần kéo, dùng menu {{ui:⋯}}.
:::

## Nhóm bảng thành thẻ

Hai bảng có thể dùng chung một khung và chỉ hiện một bảng mỗi lúc. Kéo một bảng theo tên lên thanh tiêu đề của bảng khác (thanh tiêu đề có viền khi bạn trỏ tới) rồi thả: khung lúc này có một thẻ cho mỗi bảng, nằm trên thanh tiêu đề. Nhấp vào thẻ để hiện bảng đó. Khi một thẻ có tiêu điểm, {{key:Left}} và {{key:Right}} chuyển thẻ, còn {{key:Home}} và {{key:End}} đi tới thẻ đầu và thẻ cuối.

Để đưa một bảng ra khỏi nhóm, chọn {{ui:Chuyển ra khỏi nhóm thẻ}} trong menu {{ui:⋯}} của bảng, hoặc kéo bảng đi chỗ khác. Chọn {{ui:Ghép thẻ với}} và tên một bảng để nhóm chúng mà không cần kéo.

## Ghim, ẩn và đưa lại

- Nút ghim trên thanh tiêu đề của bảng làm bảng **tự động ẩn**: bảng rời khỏi chỗ neo và thành một thẻ nhỏ ở cạnh đó. Trỏ vào thẻ, đưa tiêu điểm tới hoặc nhấp vào thẻ, bảng sẽ trượt ra trên bản vẽ; rời chuột đi (hoặc nhấn {{key:Esc}}) thì bảng trượt trở lại. Nhấn nút ghim lần nữa, hoặc chọn {{ui:Bỏ ghim}}, để neo bảng vĩnh viễn.
- Nút đóng, hoặc {{ui:Ẩn bảng này}} trong menu, sẽ ẩn bảng và thu gọn chỗ neo của nó. Một thẻ nét đứt ở cạnh sẽ đưa bảng trở lại: nhấp vào nó, hoặc đưa tiêu điểm tới và nhấn {{key:Enter}}.

## Làm bố cục dày đặc hơn

{{ui:Cài đặt}} › {{ui:Chung}} › {{ui:Mật độ bố cục}} có hai lựa chọn. {{ui:Thoáng}} là mặc định. {{ui:Gọn}} thu chặt chiều cao hàng, phần đệm của bảng, nút trên thanh công cụ và chữ trong bảng của ứng dụng đó để có thêm nội dung trên màn hình. Lựa chọn này được giữ riêng cho từng ứng dụng. Màn hình cảm ứng vẫn giữ các nút lớn ở cả hai, còn điện thoại giữ bố cục riêng của nó. {{ui:Đặt lại bố cục}} giữ nguyên mật độ bạn đã chọn.

## Chọn số dòng của thanh công cụ

{{ui:Cài đặt}} › {{ui:Chung}} › {{ui:Số hàng thanh công cụ}} có ba lựa chọn. {{ui:Xuống dòng}} là mặc định: mọi nhóm công cụ đều hiện, trên bao nhiêu dòng tùy cần. {{ui:2 hàng}} giữ thanh công cụ trong hai dòng và {{ui:1 hàng}} trong một dòng, để bản vẽ có thêm chiều cao; các nhóm không vừa sẽ cuộn ngang bên trong thanh công cụ (dùng con lăn chuột, vuốt hai ngón, hoặc {{key:Tab}} để tới một công cụ). Thanh công cụ đã vừa trong hai dòng sẽ giữ nguyên khi chọn {{ui:2 hàng}}, vì lưới chỉ làm nó cao thêm. Lựa chọn này được giữ riêng cho từng ứng dụng. Màn hình cảm ứng và điện thoại giữ bố cục riêng. CadCraft có cài đặt riêng cho thanh công cụ của nó, trong {{ui:Cài đặt}} › {{ui:CadCraft}}.

## Dùng bàn phím

Nút {{ui:⋯}} của mỗi bảng mở một menu: {{ui:Neo bên trái}}, {{ui:Neo bên phải}}, {{ui:Neo ở dưới}}, {{ui:Nổi trên bản vẽ}}, {{ui:Ghim vào cạnh}}, {{ui:Ẩn bảng này}}, {{ui:Ghép thẻ với}} một bảng khác, {{ui:Chuyển sang cửa sổ mới}} và {{ui:Đưa lại}}. Chuyển tới nút bằng {{key:Tab}}, nhấn {{key:Enter}}, di chuyển bằng các phím mũi tên và nhấn {{key:Enter}} lần nữa. {{key:Esc}} đóng menu.

## Đưa các bảng sang màn hình thứ hai

1. Chọn {{ui:⋯}} trên một bảng, rồi {{ui:Chuyển tất cả bảng sang cửa sổ mới}}. Bạn cũng có thể chọn {{ui:Chuyển bảng sang cửa sổ mới}} trong {{ui:Cài đặt}}.
2. Một cửa sổ nhỏ mở ra với các bảng bên trong. Kéo nó sang màn hình khác và phóng to tùy ý.
3. Cứ tiếp tục làm việc: các bảng vẫn tác động lên bản vẽ như trước, và bản vẽ lấp đầy cửa sổ chính.

Phím tắt vẫn hoạt động khi cửa sổ bảng ở phía trước: các phím bạn nhấn ở đó, trừ khi gõ vào một ô nhập, sẽ đi tới bản vẽ. Câu hỏi và hộp thoại mà ứng dụng hỏi vẫn mở trong cửa sổ chính, nên bạn nhìn vào đó khi một hộp thoại xuất hiện. Chủ đề và cỡ chữ của bảng theo cửa sổ chính.

:::chromium
Chrome và Edge có thể tự đặt cửa sổ lên màn hình kia cho bạn. Khi đã kết nối màn hình thứ hai, chọn {{ui:Đưa sang màn hình khác của tôi}} trong cửa sổ bảng (hoặc {{ui:Đưa các bảng sang màn hình khác của tôi}} trong menu {{ui:⋯}} của một bảng). Trình duyệt hỏi một lần xem trang này có được xem các màn hình của bạn không; sau khi bạn cho phép, cửa sổ bảng sẽ mở trên màn hình đó mỗi lần.
:::

:::firefox safari
Tự kéo cửa sổ bảng sang màn hình kia. Lần sau cửa sổ sẽ mở ở cùng vị trí và cùng kích thước.
:::

## Nhiều cửa sổ bảng

Mỗi bảng có thể có một cửa sổ riêng: tối đa bốn cửa sổ bảng, ví dụ mỗi màn hình một cửa sổ.

- Trong menu {{ui:⋯}} của một bảng, {{ui:Chuyển sang cửa sổ mới}} mở một cửa sổ khác cho bảng đó, và {{ui:Chuyển vào cửa sổ bảng 2}} (và tương tự) chuyển bảng vào cửa sổ đang mở. Cửa sổ thứ hai có tên là "bảng 2".
- Kéo một bảng theo tên từ cửa sổ này sang cửa sổ khác: thả trên cửa sổ chính để neo tại đó (các vùng có viền hiện ra khi bạn trỏ tới) hoặc để bảng nổi, và thả trên một cửa sổ bảng khác để chuyển vào đó. Thả ở bất kỳ chỗ nào khác thì bảng giữ nguyên vị trí cũ.
- Cửa sổ bảng không còn bảng nào sẽ tự đóng.

Sau khi tải lại, ứng dụng sẽ đề nghị lại các cửa sổ bảng của bạn. Trình duyệt chỉ mở một cửa sổ mỗi lần nhấp, nên chọn {{ui:Mở cửa sổ tiếp theo}} một lần cho mỗi cửa sổ.

## Cách tương tự cho mọi phần của bố cục

Dải lệnh, hộp công cụ, các hàng công cụ và thanh trạng thái cũng rời sang cửa sổ riêng theo cách như một bảng: mở menu {{ui:⋯}} của phần đó và chọn {{ui:Chuyển sang cửa sổ mới}}; {{ui:Đưa lại}} (hoặc đóng cửa sổ) sẽ đưa nó về chỗ cũ. Các phím bạn nhấn trong cửa sổ đó đều tới ứng dụng, như khi nhấn từ cửa sổ bảng. Mỗi phần có một menu như vậy.

## Di chuyển hộp thoại

Mọi hộp thoại đều có thể dời khỏi bản vẽ: nhấn và kéo thanh tiêu đề của nó. Mỗi hộp thoại tự nhớ vị trí bạn để lại và quay về vị trí đó lần mở sau. Nhấp đúp vào thanh tiêu đề để căn giữa lại.

Bằng bàn phím, nhấn {{key:Alt}}+{{key:Shift}}+một phím mũi tên khi tiêu điểm nằm trong hộp thoại để dời 16 pixel mỗi lần; thêm {{key:Ctrl}} để dời 64 pixel. Hộp thoại nằm ngoài màn hình (sau khi cửa sổ hoặc màn hình nhỏ hơn) sẽ được đưa trở lại.

Trên điện thoại, hộp thoại vẫn là tờ toàn chiều rộng và không được dời.

Trong CadCraft Studio, hộp thoại {{ui:In ra PDF}} của CadCraft, mà bạn có thể để mở khi làm việc, có một nút trên thanh tiêu đề: {{ui:Mở trong cửa sổ riêng}}. Hộp thoại chuyển vào một cửa sổ riêng mà bạn có thể đặt trên màn hình khác. Đóng hộp thoại thì đóng cửa sổ, và đóng cửa sổ thì đóng hộp thoại.

## Đưa các bảng về chỗ cũ

- Chọn {{ui:Đưa các bảng về lại}} trong cửa sổ bảng, hoặc chỉ cần đóng cửa sổ. Các bảng trở về vị trí cũ.
- Đóng hoặc tải lại cửa sổ chính cũng đóng cửa sổ bảng. Khi ứng dụng mở lại, ứng dụng cho biết các bảng của bạn đang ở cửa sổ riêng; chọn {{ui:Mở lại}} để đưa cửa sổ về, hoặc {{ui:Giữ ở đây}}.
- {{ui:Cài đặt}} › {{ui:Chung}} › {{ui:Đặt lại bố cục}} đưa mọi bảng về vị trí ban đầu.

:::tip
Nếu không có gì mở ra khi bạn chuyển bảng sang cửa sổ mới, trình duyệt đã chặn cửa sổ bật lên. Ứng dụng sẽ báo điều này và giữ các bảng ở vị trí cũ. Cho phép cửa sổ bật lên cho getcadcraft.com, rồi thử lại.
:::

Bố cục được giữ riêng cho từng ứng dụng trong trình duyệt này, cùng với các cài đặt khác của bạn.
