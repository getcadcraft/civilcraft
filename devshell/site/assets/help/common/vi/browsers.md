---
title: Trình duyệt và máy tính
summary: Các ứng dụng chạy được trong những trình duyệt nào, chúng khác nhau ở đâu và máy tính của bạn cần gì.
keywords: chrome, edge, firefox, safari, brave, trình duyệt, mac, windows, linux, ipad, máy tính bảng, webgl, yêu cầu, bộ nhớ
from: a11b09b1
---

Các ứng dụng chạy bên trong trình duyệt web. Chúng làm việc ngay trên máy tính của bạn: tệp được mở tại đó và không bao giờ gửi cho chúng tôi (xem [Tệp của bạn đi đâu](common:your-files)).

## Dùng trình duyệt nào

Hãy dùng phiên bản mới của một trong các trình duyệt sau:

| Trình duyệt | Bộ máy | Ghi chú |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Đầy đủ nhất: chọn thư mục, lưu để dùng ngoại tuyến, xử lý tệp. |
| Firefox | Gecko | Chạy được. Mở cả thư mục dùng bộ chọn đơn giản hơn. Có thể không lưu ngoại tuyến được trong cửa sổ riêng tư. |
| Safari | WebKit | Chạy được trên Mac và iPad. Mở cả thư mục dùng bộ chọn đơn giản hơn. Safari có thể xóa bản ngoại tuyến mà bạn không dùng trong vài tuần. |

Cả ba bộ máy đều ổn cho công việc hằng ngày. Khi một ứng dụng làm việc gì đó khác đi ở một trong số đó, phần trợ giúp của nó sẽ chỉ các bước cho trình duyệt của bạn.

## Các trình duyệt khác nhau ở đâu

- **Mở một thư mục.** Các trình duyệt Chromium hiện bộ chọn thư mục thật và đọc trực tiếp thư mục. Firefox và Safari yêu cầu bạn chọn một thư mục rồi đọc từng tệp trong đó, việc này lâu hơn với các thư mục dự án lớn; kéo thư mục thả vào ứng dụng thì cả ba đều dùng được.
- **Lưu.** Các ứng dụng lưu bằng cách tải xuống một tệp. Trình duyệt của bạn quyết định nơi đặt tệp tải xuống và có hỏi trước hay không.

:::chromium
Trong Chrome hoặc Edge, bật "Hỏi vị trí lưu từng tệp trước khi tải xuống" (trong Cài đặt, mục Tải xuống) để chọn thư mục mỗi lần.
:::

:::firefox
Trong Firefox, mở Cài đặt, rồi Chung, rồi Tải xuống, và chọn "Luôn hỏi nơi lưu tệp" để chọn thư mục mỗi lần.
:::

:::safari
Trong Safari, mở Cài đặt, rồi Cài đặt chung, và đặt "Vị trí tải xuống tệp" thành "Hỏi cho mỗi lần tải xuống" để chọn thư mục mỗi lần.
:::

## Mac, Windows và Linux

Các ứng dụng giống nhau trên mọi máy tính. Điều thay đổi là bàn phím: phím tắt được viết tự động cho máy tính của bạn. Xem [Phím, chuột và bàn di chuột](common:keys).

## Máy tính bảng và màn hình cảm ứng

Một số ứng dụng nhận cảm ứng (một ngón tay để vẽ hoặc chọn, hai ngón tay chụm để thu phóng và di chuyển khung nhìn). Phần trợ giúp của mỗi ứng dụng cho biết có hỗ trợ hay không. Trên iPad, hãy dùng Safari hoặc Chrome. Bàn phím giúp ích với các ứng dụng dùng lệnh gõ.

## Trình duyệt và hệ thống cũ nhất

Chúng tôi đọc các mốc này từ mã của các ứng dụng 0.7, không phải đoán: mọi tệp đã được phân tích và từng tính năng ngôn ngữ nó dùng đã được tra trong dữ liệu tương thích do các trình duyệt công bố. Dưới các phiên bản này, ứng dụng thậm chí không khởi động được, vì trình duyệt không hiểu mã.

| | Phiên bản cũ nhất có thể khởi động ứng dụng |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS và iOS 16.4) |

CadCraft Studio mang theo bộ máy web riêng trên Windows, nên cần Windows 10 hoặc 11; trên Mac nó dùng bộ máy của hệ thống, nên cần macOS 13.3 trở lên. Cài đặt › Cập nhật trong Studio cho biết bản của bạn đang chạy trên gì.

Đây là phiên bản cũ nhất *khởi động được*, đọc từ mã. Đây không phải danh sách các trình duyệt cũ mà chúng tôi đã chạy thử ứng dụng, nên một trình duyệt cũ hơn vẫn khởi động được có thể vẫn thiếu một tính năng.

## Máy tính của bạn cần gì

Đây là mức tối thiểu dự kiến cho các ứng dụng, không phải yêu cầu đã đo:

- 8 GB bộ nhớ (khuyến nghị 16 GB cho các mô hình liên kết lớn).
- Chip đồ họa hỗ trợ WebGL 2 cho các ứng dụng 3D. Nếu một khung nhìn 3D vẫn trống, hãy kiểm tra xem tăng tốc phần cứng có được bật trong cài đặt trình duyệt hay không.
- Màn hình rộng ít nhất 1280 pixel để hiện đủ thanh công cụ; màn hình nhỏ hơn sẽ làm chúng xuống dòng.

Các tệp rất lớn (bộ bản vẽ lớn, mô hình lớn) dùng nhiều bộ nhớ trong một thẻ trình duyệt. Hãy đóng các thẻ nặng khác nếu ứng dụng chậm lại.
