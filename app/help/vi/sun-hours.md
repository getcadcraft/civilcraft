---
title: Tính số giờ nắng trên công trường
summary: Chọn một ngày (hoặc một mùa) và múi giờ, rồi xem số giờ nắng trực tiếp trên mọi tường của mọi khối công trình và trên mặt đất xung quanh chúng, với mặt đất được vẽ trên mặt bằng và số liệu dạng CSV.
keywords: nắng, giờ nắng, bóng đổ, bóng râm, tiếp cận ánh sáng mặt trời, giờ ban ngày, mặt đứng, tường, mùa, hạ chí, đông chí, xuân phân, thu phân, múi giờ, giờ tiết kiệm ánh sáng ban ngày, vĩ độ, kinh độ, CSV, raster
from: 4e32a314
---

**Giờ nắng** đếm số giờ nắng trực tiếp chiếu tới mỗi tường của mỗi khối công trình và trên mặt đất quanh chúng, vào một ngày bạn chọn hoặc trung bình trong một mùa. Các khối và chính mặt đất đổ bóng; không có gì khác đổ bóng (không cây cối, không nhà láng giềng mà bạn chưa vẽ). Ánh sáng bầu trời không phải nắng trực tiếp thì không được tính.

## Trước khi bắt đầu

Vị trí của mặt trời lấy từ vĩ độ và kinh độ của công trường, và chúng đến từ **hệ tọa độ** của dự án. Dự án không có hệ tọa độ sẽ bị từ chối kèm thông báo: hãy đặt nó trước (**Tọa độ** trong nhóm GIS). Vĩ độ và kinh độ nhập tay sẽ chỉ là phỏng đoán, nên không có ô nhập cho chúng.

## Tính toán

Trong **Thuộc tính**, dưới **Khối công trình**, **Giờ nắng**:

1. Chọn **Ngày**. Mặc định là ngày mặt trời thấp nhất tại vị trí của bạn (21 tháng 12, hoặc 21 tháng 6 ở bán cầu nam). Với một mùa, đánh dấu **Trong một mùa**, rồi chọn **Ngày cuối** và số ngày cách nhau giữa các lần lấy mẫu.
2. Nhập **Múi giờ**: một tên như `America/Mexico_City`, hoặc độ lệch so với UTC như `-6`. Một tên sẽ theo quy tắc giờ tiết kiệm ánh sáng ban ngày của múi giờ đó cho ngày được chọn; độ lệch bạn nhập được dùng đúng như đã nhập, nên hãy dùng độ lệch có hiệu lực vào ngày đó. Dòng dưới ô cho bạn biết độ lệch nào đã tìm thấy.
3. Chọn tần suất đặt mặt trời (mỗi 5, 10, 15 hoặc 30 phút), rồi nhấn **Tính giờ nắng**. Một mùa chạy trong các tiến trình nền; **Dừng** sẽ hủy.

## Bạn nhận được gì

- Một bảng theo khối: **tường nhận nắng ít nhất**, **trung bình** và **tường nhận nắng nhiều nhất**, tính bằng giờ mỗi ngày, cùng một bảng mọi tường với hướng mặt và số giờ theo từng tầng.
- Mặt đất quanh các khối, vẽ trên mặt bằng từ tối (không nắng) đến vàng (nhiều nhất mà một ô nhận được), kèm chú giải. Các ô nằm dưới một khối được để trống. **Hiển thị mặt đất trên mặt bằng** sẽ tắt nó.
- **Tường dạng CSV** và **Mặt đất dạng CSV** lưu các số liệu.

Với một mùa, các con số là trung bình mỗi ngày trên các ngày đã lấy mẫu. Không có gì được lưu trong dự án: kết quả chỉ để xem, và chạy lại sẽ tạo lại nó.

## Cần biết

- Một tường chỉ được tính một thời điểm là có nắng khi nó quay mặt về phía mặt trời và không có gì cản. Tường quay đi thì không nhận gì.
- Mặt đất được lấy mẫu trên một lưới phụ thuộc vào kích thước công trường, và vị trí mặt trời được tính tại giữa mỗi bước thời gian, nên số giờ chính xác đến khoảng bước bạn đã chọn.
- Vị trí mặt trời là một công thức thiên văn đã công bố, chính xác khoảng một phút cung.
