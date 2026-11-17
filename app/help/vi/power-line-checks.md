---
title: Kiểm tra đường dây điện
summary: CivilCraft kiểm tra gì trên mọi đường dây và cáp, luôn được cập nhật: khoảng hở, khoảng cách pha, độ lệch, nhấc lên, tải trụ và kích thước, phụ kiện, dây néo, móng, dữ liệu thiếu, kết nối, quá tải và sụt áp.
keywords: kiểm tra, khoảng hở, khoảng hở mặt đất, chướng ngại, giao cắt, khoảng cách pha, độ lệch chuỗi sứ, nhấc lên, tải trụ, tải danh định, kích thước, móng, dây néo, phụ kiện, xà ngang, sụt áp, quá tải, thiếu dữ liệu, ngắt kết nối
from: e6a0da47
---

**Kiểm tra** trong mục Đường dây điện liệt kê mọi vấn đề: màu đỏ cho những gì không đạt và màu hổ phách cho cảnh báo. Nhấn vào một mục để chọn đường dây, trụ, cáp hoặc thiết bị mà nó nói tới; các trụ và nhịp không đạt được khoanh đỏ trên mặt bằng khi không gian làm việc đang mở.

:::warning
Đây là công cụ hỗ trợ thiết kế: các kiểm tra này đối chiếu thiết kế của bạn với quy tắc riêng của bạn, không phải là chứng nhận.
:::

## Khoảng hở

Pha thấp nhất của dây dẫn được theo dõi dọc theo mọi nhịp ở mọi trường hợp tải. Khoảng hở thấp nhất của nó phía trên mặt đất phải đạt **Quy tắc khoảng hở** của đường dây. Khi một nhịp cắt qua một **chướng ngại** (vẽ bằng {{ui:Chướng ngại}}: một điểm hoặc một đường, với chiều cao trên mặt đất và quy tắc khoảng hở riêng), khoảng hở phía trên đỉnh chướng ngại được kiểm tra theo cách tương tự.

**Những gì không gian làm việc Cảnh quan đặt trên mặt đất cũng được tính.** Cây đơn (tán ở kích thước trưởng thành và chiều cao), hàng rào và luống trồng (loài cao nhất trong đó), và tường (đỉnh tường) là chướng ngại dưới đường dây mà không cần vẽ lại. Chúng giữ các quy tắc đặt trong {{ui:Trường hợp tải và giới hạn…}}: **Cây và thực vật cảnh quan dưới đường dây** (các bộ mẫu dùng *Cây và thực vật*, 3 m) và **Tường cảnh quan dưới đường dây** (*Công trình*); chọn **Không kiểm tra** để bỏ qua chúng. Khoảng hở được đo thẳng đứng từ đỉnh cây hoặc tường đến dây dẫn tại nơi nhịp cắt qua; khoảng cách ngang đến tán cây bên cạnh đường dây không được kiểm tra. Di chuyển một cây hoặc nâng một bức tường sẽ thay đổi kết quả kiểm tra ngay lập tức.

Quy tắc khoảng hở là của riêng bạn: mở bằng **Quy tắc…** bên cạnh bất kỳ **Quy tắc khoảng hở** nào (hoặc {{ui:Trường hợp tải và giới hạn…}}) để thêm, đổi tên, thay đổi hoặc xóa.

## Khoảng cách và độ lệch

- **Khoảng cách pha** cần thiết: k·√(võng + chiều dài sứ) + U/150, với độ võng của trường hợp nóng và điện áp U tính bằng kV (một dạng thông dụng; k do bộ quy tắc của bạn quy định). So sánh với khoảng cách pha của xà ngang.
- **Độ lệch chuỗi sứ** trên trụ treo, dưới trường hợp gió: atan(tải ngang ÷ tải đứng), so với độ lệch lớn nhất của bộ quy tắc.
- **Nhấc lên**: một trụ treo thấp hơn các trụ lân cận có thể bị kéo lên khi trời lạnh; trường hợp này được đánh dấu.

## Tải trụ và kích thước

Với mỗi trụ và mỗi trường hợp tải, cùng với mọi dây dẫn của đường dây:

- **Ngang**: gió trên mỗi mét × nhịp gió (nửa tổng của hai nhịp), cộng 2·H·sin(góc rẽ ÷ 2) tại góc rẽ.
- **Dọc đường dây**: hiệu lực căng của hai phía tại trụ neo cuối hoặc trụ góc; tại trụ treo chỉ khi có băng ở một phía (mỗi nhịp được tính riêng, điều này nghiêng về phía an toàn).
- **Đứng**: tải đứng trên mỗi mét × nhịp trọng lượng (giữa các điểm thấp nhất của hai bên) cộng thiết bị.

Tải ngang được đưa về điểm danh định của trụ (tải tương đương = tải × chiều cao gắn ÷ chiều cao điểm danh định) và so với **tải danh định** × hệ số của bộ quy tắc. Khi trụ quá yếu, trụ nhỏ nhất cùng vật liệu trong thư viện của bạn có thể chịu được tải sẽ được gợi ý. Một trụ có **dây néo** chuyển tải ngang cho dây néo, dây này chịu tải ÷ sin(góc dây néo) và được kiểm tra với định mức riêng của nó.

Phụ kiện (kẹp, sứ, xà ngang) được kiểm tra theo tải định mức: một phụ kiện neo chịu lực căng của dây dẫn, một phụ kiện treo chịu phần tải đứng và tải ngang của nó. **Móng** hiển thị là độ sâu của trụ trong đất và một hố rộng hơn chân trụ một chút.

## Dữ liệu, kết nối và dòng điện

- Một mục có trường bắt buộc còn trống, hoặc một khóa không có trong thư viện.
- Đầu tuyến cáp, hoặc một thiết bị, không được nối với gì.
- **Sụt áp** và **dòng điện** từ mỗi nguồn (thiết bị được đánh dấu là nguồn) đến các phụ tải (kW và hệ số công suất trên thiết bị), dọc theo các nhịp trên không và cáp: √3·I·L·(R cos φ + X sin φ), với R ở 20 °C. Dòng vượt quá định mức của cáp, hoặc sụt áp vượt mức bộ quy tắc cho phép, sẽ được đánh dấu.
