---
title: Mẫu hành lang và mẫu mặt đất
summary: Tạo các mẫu nhỏ có thể tái sử dụng (bó vỉa và rãnh, vỉa hè, tường, mương), dựng hành lang từ chúng theo cọc với bên trái và bên phải tách riêng, chia một tuyến thành nhiều hành lang, và trải các lớp vật liệu lên mặt đất.
keywords: mẫu, các mẫu, thư viện mẫu, tạo mẫu, mặt cắt điển hình, cụm, cụm con, cấu kiện, mã điểm, điều kiện kết thúc, đường giao mặt đất, mương, tường chắn, bó vỉa, rãnh, vỉa hè, vùng, khoảng cọc, nhiều hành lang, nhiều hành lang, trái và phải, mẫu mặt đất, lớp đất mặt, mặt đường, lớp nền, trải, vật liệu, khối lượng
from: ce70e58b
---

**Mẫu** là một mặt cắt nhỏ bạn vẽ một lần và tái sử dụng: các điểm với độ lệch, độ dốc và mã điểm, cùng các cấu kiện có vật liệu. Một hành lang có thể được dựng từ các mẫu theo cọc, mỗi bên có các mẫu mặt đường riêng và điều kiện kết thúc riêng, và cùng các mẫu đó có thể được trải lên một mặt đất.

:::warning
Các mẫu ví dụ chỉ là chỗ giữ chỗ để bắt đầu. Các con số của chúng không được lấy từ tiêu chuẩn hay cơ quan nào. Một kỹ sư phải kiểm tra mọi mẫu, và mọi giá trị bạn đưa vào, trước khi dùng cho thiết kế.
:::

## Mở các mẫu

Mở {{ui:Bề mặt}} › {{ui:Thêm}} › {{ui:Mẫu hành lang…}} (hoặc gõ {{cmd:TEMPLATES}}). Cửa sổ có ba danh sách:

- **Trong dự án này**: các mẫu mà hành lang và mẫu mặt đất của dự án này dùng. Chúng được lưu trong tệp dự án.
- **Thư viện của tôi**: các mẫu được giữ trong trình duyệt này và có sẵn trong mọi dự án. Dùng {{ui:Lưu vào Thư viện của tôi}} trên một mẫu dự án để giữ nó.
- **Ví dụ**: hai làn có các lớp, bó vỉa và rãnh, vỉa hè, đường giao mặt đất, mương, tường chắn, lớp đất mặt dưới mặt đất, và mặt đường trên mặt đất. Mỗi mẫu được đánh dấu "Để kỹ sư kiểm tra".

{{ui:Dùng trong dự án này}} sao chép một mẫu từ thư viện hoặc ví dụ vào dự án. {{ui:Xuất mẫu của dự án này}} lưu chúng thành tệp `.cctemplates.json`, và {{ui:Nhập tệp}} đọc một tệp vào dự án và Thư viện của tôi. Dùng tệp để chia sẻ mẫu hoặc chuyển sang máy tính khác.

## Tạo một mẫu

{{ui:Mẫu mới}} (hoặc {{ui:Chỉnh sửa}} trên một mẫu dự án) mở trình soạn mẫu. Vẽ phía phải, hướng ra ngoài từ điểm 0,0 của mẫu; phía trái dùng cùng mẫu hướng ra ngoài sang trái.

1. Đặt tên và loại: **Mặt đường** (mẫu kế tiếp gắn vào cuối nó), **Điều kiện kết thúc** (nó chạm mặt đất) hoặc **Mẫu mặt đất**.
2. Thêm **giá trị**: các số có tên như bề rộng `w` hoặc độ dốc `s`. Một ô số ở bất kỳ đâu trong mẫu nhận một số hoặc tên của một giá trị; `-t` là giá trị `t` đổi thành âm. Một hành lang có thể cho mỗi lần dùng mẫu các giá trị riêng, nên một mẫu bó vỉa phục vụ mọi chiều cao bó vỉa.
3. Thêm **điểm** theo thứ tự. Mỗi điểm được đặt từ một điểm trước đó (hoặc điểm 0,0) theo ràng buộc của nó:

| Ràng buộc | Đặt điểm |
|---|---|
| Độ lệch theo độ dốc | Một độ lệch ra ngoài và một độ dốc (độ tăng trên mỗi độ dài; −0.02 là giảm 2%) |
| Độ lệch và độ tăng | Một độ lệch và một độ tăng |
| Thẳng lên hoặc xuống | Chỉ một độ tăng |
| Mái dốc đến mặt đất | Từ điểm của nó ra đến mặt đất, theo tỷ lệ đào khi đất cao hơn và tỷ lệ đắp khi đất thấp hơn |
| Đến mặt đất | Một độ lệch, rồi thẳng lên hoặc xuống đến mặt đất |
| Tường chắn | Một tường có độ dày bạn cho: khi đào, đỉnh của nó chạm mặt đất tại mặt đường; khi đắp, đường chạy qua nó và mặt ngoài của nó hạ xuống mặt đất |

   Đánh dấu **Đỉnh** cho các điểm mà bề mặt hoàn thiện đi qua. Điểm đỉnh cuối cùng là nơi mẫu kế tiếp ở phía đó bắt đầu. Một **Mục tiêu** cho phép hành lang di chuyển điểm: độ lệch hoặc cao độ của nó lấy từ một đường.

4. Thêm **cấu kiện**: các hình khép kín qua mã điểm (`0` là điểm 0,0), mỗi cái có tên, vật liệu và loại. Diện tích của chúng cho ra khối lượng.

Hình vẽ theo sát mọi thay đổi ở tỷ lệ thật, và danh sách bên dưới nó cho biết điều gì sai (một điểm chạm mặt đất trước điểm cuối, một giá trị mà mẫu không có, một cấu kiện không có diện tích). {{ui:Thêm vào dự án này}} hoặc {{ui:Lưu}} giữ nó, như một bước hoàn tác.

## Dựng hành lang từ mẫu

Chọn một tuyến có hành lang và, trong **Thuộc tính** của nó, bật {{ui:Dựng từ mẫu theo cọc}}. Hành lang bắt đầu với các ví dụ hai làn và đường giao mặt đất ở cả hai bên.

- **Vùng.** Mỗi vùng bắt đầu tại một cọc và chạy đến vùng kế tiếp. {{ui:Thêm vùng}} thêm một vùng; đổi cọc bắt đầu trong ô của nó.
- **Trái và phải tách riêng.** Mỗi bên của mỗi vùng có danh sách **Mặt đường** riêng, từ tim tuyến hướng ra ngoài, và **Điều kiện kết thúc** riêng: đường giao mặt đất, mương, tường, hoặc bất kỳ mẫu nào chạm mặt đất. Không có điều kiện kết thúc thì bên đó giao mặt đất tại mái đào và mái đắp của hành lang. {{ui:Sao chép từ trái sang phải}} sao chép một bên.
- **Giá trị và mục tiêu.** Dưới mỗi mẫu ở một bên, một ô cho mỗi giá trị (trống = giá trị riêng của mẫu) và, với một điểm nhận mục tiêu, đường đặc trưng hoặc đường của hành lang khác sẽ di chuyển nó.
- **Từ** và **Đến** giới hạn hành lang vào một phần của tuyến.

Mặt cắt, các đường mặt bằng cho mọi mã điểm, bề mặt đề xuất, bố trí cọc và khối lượng đất đều theo sau. Thuộc tính liệt kê khối lượng của mỗi cấu kiện theo bên và vùng (diện tích mặt cắt trung bình dọc tim tuyến). Siêu cao và các mục tiêu cạnh của hành lang không được dùng khi hành lang được dựng từ mẫu.

## Nhiều hành lang trên một tuyến

Dưới **Các hành lang trên tuyến này**, {{ui:Thêm hành lang}} thêm một hành lang trên phần còn lại của tuyến: hành lang đầu tiên được đặt cọc kết thúc tại giữa (hoặc giữ cọc riêng), và hành lang mới bắt đầu tại đó với vùng mẫu cuối cùng của hành lang đầu. Mỗi hành lang có tên, khoảng cọc, mẫu và khối lượng đất riêng. Tắt một hành lang bằng ô {{ui:Bật}} của nó. Nơi hai khoảng chồng lên nhau, hành lang sau san trên hành lang trước.

## Mẫu mặt đất

Một mẫu mặt đất trải các lớp của một mẫu lên địa hình từ điểm 0,0 của nó: một lớp dưới điểm 0,0 đi vào trong đất (lớp đất mặt cần bóc đi), một lớp trên nó nằm trên mặt đất (lớp nền và mặt đường trên bãi đỗ xe). Chiều rộng và độ dốc không quan trọng, chỉ độ sâu của mỗi cấu kiện phía trên hoặc phía dưới điểm 0,0.

Mở {{ui:Bề mặt}} › {{ui:Thêm}} › {{ui:Mẫu mặt đất…}} (hoặc gõ {{cmd:TERRAINTEMPLATES}}); khối này cũng có trong Thuộc tính của dự án. {{ui:Thêm mẫu mặt đất}} thêm một mẫu với ví dụ lớp đất mặt. Với mỗi mẫu, chọn:

- **mẫu** (các giá trị của nó có thể đổi cho mẫu này),
- **mặt đất**: mặt đất hiện trạng hoặc bề mặt đề xuất,
- **hình dạng** cắt nó: toàn bộ mặt đất, một thửa đất, một nền, hoặc một đường đặc trưng khép kín. Nhiều mẫu mặt đất có thể dùng các hình dạng khác nhau trên cùng một mặt đất.

Mỗi lớp liệt kê độ dày, diện tích mặt bằng và khối lượng. Khối lượng là diện tích mặt bằng nhân với độ dày, độ dày đo thẳng đứng xuống; diện tích được đo trên một lưới, và diện tích đã trải (nghiêng) cũng được đưa ra. Các hình dạng được vẽ trên mặt bằng ở lớp C-TOPO-TMPL. Mẫu mặt đất không thay đổi bề mặt đề xuất.

## Vật liệu và khối lượng

Khối đào đắp của dự án liệt kê **Vật liệu từ mẫu**: mọi cấu kiện hành lang và mọi lớp mẫu mặt đất cùng khối lượng của nó. {{ui:Gửi sang TakeoffCraft}} ghi chúng vào tệp khối lượng sau phần đào và đắp, mỗi mục một dòng, theo yard khối (dự án feet) hoặc mét khối.

## Tệp

Các mẫu, vùng, hành lang phụ và mẫu mặt đất được lưu trong tệp dự án. Một dự án không dùng chúng được lưu y hệt như trước, và các bản CivilCraft cũ hơn vẫn mở được dự án dùng chúng (chúng bỏ qua mẫu và dựng cụm riêng của hành lang).
