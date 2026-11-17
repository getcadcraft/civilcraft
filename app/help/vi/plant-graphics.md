---
title: Đồ họa cây theo tỷ lệ, ký hiệu riêng và cây 3D
summary: Cách cây được vẽ trên mặt bằng ở mỗi tỷ lệ bản vẽ và mức chi tiết, và cách một bản ghi cây nhận ký hiệu riêng (SVG, hoặc khối DXF/DWG) và mô hình 3D riêng (OBJ, STL hoặc GLB) của bạn.
keywords: đồ họa cây, ký hiệu cây, ký hiệu theo tỷ lệ, mức chi tiết, mức độ chi tiết, vòng tròn đơn giản, đường viền, ký hiệu chi tiết, ký hiệu riêng, khối, svg, dxf, dwg, cây 3d, mô hình 3d riêng, obj, stl, glb, gltf, mô hình cây, cây trong 3d
from: 875837d9
---

## Ký hiệu mặt bằng theo tỷ lệ

Cảnh quan › {{ui:More}} › {{ui:Plant graphics}} thiết lập cách cây được vẽ trên mặt bằng. **Tự động, theo tỷ lệ** chọn một trong ba mức từ tỷ lệ bản vẽ:

- **Vòng tròn đơn giản** (thô hơn 1:500): một vòng tròn có bề rộng tán của cây.
- **Đường viền có tâm** (từ 1:500 đến 1:200): vòng tròn và một chữ thập nhỏ ở tâm.
- **Ký hiệu chi tiết** (mịn hơn 1:200): ký hiệu riêng của bản ghi nếu có, nếu không thì ký hiệu có sẵn.

Đổi hai tỷ lệ bằng **Đơn giản từ 1:** và **Đường viền từ 1:**, hoặc chọn một mức cho mọi tỷ lệ. Mỗi bộ tờ trong hộp thoại Tờ có **Mức chi tiết cây trên mặt bằng** riêng, nên bản vẽ tổng mặt bằng 1:500 và bản vẽ trồng cây 1:100 có thể khác nhau. Thiết lập được lưu cùng dự án.

## Ký hiệu riêng

Chọn một cây trong mục Cây trồng rồi nhấn {{ui:Own symbol…}}. Lệnh này đọc một tệp SVG, hoặc một khối của bản vẽ DXF hay DWG (khi bản vẽ có nhiều khối, bạn chọn một khối). Ký hiệu được co giãn để khớp với bề rộng tán của cây và được vẽ ở mức chi tiết. Ký hiệu được giữ trong dự án, nên tệp đi kèm dự án.

- Tệp SVG được đọc để lấy đường, đa tuyến, đa giác, hình chữ nhật, vòng tròn, elip và đường dẫn. Kịch bản, kiểu, liên kết và ảnh trong tệp không bao giờ được xét đến. Phép biến đổi không được áp dụng: bạn sẽ được thông báo khi tệp có chúng, vì vậy hãy làm phẳng chúng trong chương trình vẽ trước.
- Giới hạn: 512 KB SVG và 2000 hình. Tệp lớn hơn sẽ bị từ chối kèm lý do.

## Cây 3D riêng

{{ui:Own 3D model…}} trên cùng bản ghi đọc tệp **OBJ**, **STL** hoặc **GLB**. Sau đó, trong Đồ họa cây, đặt **Cây trong 3D** thành **Mô hình riêng của từng bản ghi**: mọi cây của bản ghi đó sẽ hiển thị mô hình của bạn, được co giãn theo chiều cao và bề rộng tán. Bản ghi không có mô hình riêng vẫn giữ các hình dạng có sẵn. Chọn **Khối đơn giản** để xem nhanh các khu lớn.

Tệp GLB chỉ được đọc để lấy hình dạng:

- Mọi thứ mô hình cần phải nằm trong tệp .glb. Mô hình trỏ đến tệp khác (một tệp .bin riêng, hoặc ảnh theo địa chỉ) sẽ bị từ chối: không có gì được tải xuống.
- Hình học được nén hoặc đóng gói (Draco, meshopt, vị trí lượng tử hóa) không được đọc. Hãy xuất không nén.
- Kết cấu và màu trong tệp không được dùng: mô hình được vẽ bằng màu của cây. Kết cấu vẫn được kiểm tra, và kết cấu lớn hơn 4096 điểm ảnh mỗi cạnh sẽ bị từ chối.
- Giới hạn: tệp 32 MB, 50 000 tam giác (tính mọi bản sao của một chi tiết được đặt nhiều lần), 64 ảnh và 16 MB ảnh.

Mỗi giới hạn sẽ từ chối tệp kèm lý do; không có phần nào đọc dở được giữ lại. Một bước hoàn tác trả lại ký hiệu hoặc mô hình cho bản ghi, và {{ui:Remove own symbol}} hoặc {{ui:Remove own 3D model}} sẽ gỡ chúng đi.

Xem [Bản ghi cây](topic:plant-records) để biết về chính bản ghi, và [Xem khu vực trong 3D](topic:site-3d).
