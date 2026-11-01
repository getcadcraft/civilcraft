---
title: Tự sắp xếp bố cục và lưu các thiết lập của bạn
summary: Chọn bảng nào hiện trình duyệt dự án, Thuộc tính hoặc nội dung riêng của bảng, hộp công cụ nằm đâu và các thanh chứa gì, lưu thành bố cục riêng, và giữ cả thiết lập theo tên để chuyển qua lại.
keywords: bố cục, không gian làm việc, sắp xếp, tùy chỉnh, bố cục của tôi, bố cục riêng, bảng, trình soạn, trình duyệt dự án, thuộc tính, hộp công cụ, thanh nhanh, hộp thông tin, môi trường làm việc, thiết lập, hồ sơ, lưu thiết lập, chuyển thiết lập, xuất thiết lập, nhập thiết lập, ccenv
from: 2a71af43
---

Ngoài ba bố cục dựng sẵn, bạn có thể tự sắp xếp một bố cục riêng, và lưu cả thiết lập của bạn theo một cái tên để chuyển lại chỉ trong một bước.

## Tự sắp xếp bố cục

1. Mở {{ui:Cài đặt}} (hình bánh răng, hoặc {{key:Mod+,}}), chọn {{ui:Chung toàn cục}}, rồi {{ui:Bố cục}}.
2. Chọn {{ui:Tự sắp xếp bố cục…}}. Hộp thoại bắt đầu từ bố cục bạn đang dùng.
3. Đặt tên cho nó, rồi chọn:
   - **Phía trên bản vẽ:** thanh công cụ của ứng dụng, một dải lệnh hoặc không có gì; một thanh tiêu đề; một hộp thông tin và các điều khiển nó chứa.
   - **Bên cạnh bản vẽ:** hộp công cụ ở bên trái, bên phải hoặc không có, kèm hoặc không kèm {{ui:Công cụ của tôi}}; bảng nào chứa các bảng màu, bảng nào ở trên cùng (chẳng hạn trình duyệt dự án hoặc Thuộc tính), và bảng nào là các thẻ bên dưới.
   - **Vùng bản vẽ:** các thẻ khung nhìn, một thanh nhanh và một thanh khung nhìn với các điều khiển bạn đánh dấu, bảng chỉnh sửa, một thanh trạng thái.
   - **Giao diện:** kích thước, đường viền nút và kiểu thẻ.
4. Chọn {{ui:Dùng bố cục này}}. Ứng dụng chuyển sang bố cục đó ngay, và mọi ứng dụng có bố cục cũng dùng nó.

Chỉ những gì ứng dụng này có mới được đưa ra. Bố cục của bạn được liệt kê dưới {{ui:Từ tiện ích bổ sung và tệp}}; {{ui:Xuất bố cục này}} lưu nó thành một tệp bạn có thể đưa cho đồng nghiệp, và nút xóa sẽ bỏ nó đi. Các bảng nó chứa vẫn neo, nổi và chuyển sang cửa sổ riêng như trong [Sắp xếp các bảng](common:arrange-panels).

## Lưu thiết lập của bạn thành môi trường làm việc

Một môi trường làm việc là toàn bộ thiết lập của bạn cho mọi ứng dụng trong trình duyệt này: bố cục, kiểu menu và phím của bạn, kiểu thanh công cụ, các bảng và kích thước của chúng, và {{ui:Công cụ của tôi}}. Giao diện (sáng/tối) và ngôn ngữ không nằm trong đó.

- **Lưu:** gõ một tên dưới {{ui:Môi trường làm việc}} và chọn {{ui:Lưu thiết lập của tôi}}. Lưu dưới một tên đã có sẽ thay thế thiết lập đó.
- **Chuyển:** chọn một thiết lập trong danh sách và chọn {{ui:Chuyển sang}}. Ứng dụng tải lại với thiết lập đó; nếu bạn có công việc chưa lưu, ứng dụng hỏi trước, như mọi lần tải lại.
- **Chia sẻ:** {{ui:Xuất}} lưu thiết lập đã chọn thành tệp `.ccenv.json`; {{ui:Nhập một thiết lập…}} thêm một thiết lập từ tệp. Một tệp chỉ đặt các lựa chọn này, không gì khác.
- **Gỡ:** chọn một thiết lập và chọn {{ui:Gỡ bỏ}}.

Bạn có thể giữ tối đa mười hai thiết lập.

Để thử các cách sắp xếp dựng sẵn trước, xem [bố cục hộp công cụ và hộp thông tin](common:layout-toolbox) và [bố cục dải lệnh và trình duyệt dự án](common:layout-ribbon).
