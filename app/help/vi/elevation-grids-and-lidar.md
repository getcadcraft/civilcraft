---
title: Lưới cao độ và LiDAR
summary: Dựng mặt đất tự nhiên từ DEM (GeoTIFF hoặc lưới ASCII) hoặc điểm LiDAR (LAS, LAZ) — chọn khu vực, lọc bớt dữ liệu, chọn lớp và kiểm tra đơn vị cao độ — rồi trả về một bề mặt dưới dạng lưới cao độ GeoTIFF.
keywords: dem, dtm, lưới cao độ, geotiff, tif, lưới ascii, asc, lidar, las, laz, đám điểm, point cloud, lớp, mặt đất, lọc bớt, nodata, raster, xuất geotiff, gis
from: c8b2d18a
---

Dữ liệu cao độ công khai có hai dạng: **lưới cao độ** (DEM: một cao độ cho mỗi ô vuông, thường là GeoTIFF `.tif` hoặc lưới ASCII `.asc`) và **điểm LiDAR** (hàng triệu điểm phản xạ laser trong tệp `.las`, hoặc `.laz` khi nén). CivilCraft chuyển một trong hai thành điểm đo hoặc bề mặt, ngay trong trình duyệt: không có gì được tải lên.

## Mở tệp

1. Nhấp {{ui:Mở}} (hoặc {{ui:Nhập}} trong nhóm GIS) rồi chọn tệp, hoặc kéo tệp vào mặt bằng. Với lưới ASCII, chọn thêm tệp `.prj` của nó để CivilCraft biết hệ tọa độ.
2. Hộp thoại nhập hiển thị những gì tệp khai về chính nó: kích thước, số ô hoặc số điểm, hệ tọa độ, vị trí theo vĩ độ và kinh độ, và khoảng cao độ. Với LiDAR, trước hết nó đọc mọi điểm một lần để đếm **lớp** (thanh tiến trình cho biết đã đi đến đâu; {{ui:Hủy}} dừng lại).

GeoTIFF có ba hoặc bốn kênh (đỏ, lục, lam) là ảnh, không phải cao độ: thay vào đó nó được đưa vào các lớp bản đồ.

## Chọn phần cần nhập

- **Khu vực**: {{ui:Phạm vi dự án và một lề}} (gõ độ lề), {{ui:Những gì mặt bằng đang hiển thị}}, hoặc {{ui:Toàn bộ tệp}}. Chỉ phần đó của tệp được đọc.
- **Lọc thưa đến**: khoảng cách giữa các điểm bạn nhận được, theo đơn vị dự án. Dòng dưới cài đặt cho biết số điểm đó khi bạn gõ. Với lưới, CivilCraft giữ mỗi ô thứ hai, thứ ba …, nên cao độ giữ nguyên như trong tệp; nó không bao giờ lấy trung bình các ô. Với LiDAR, khu vực được cắt thành các ô vuông có kích thước đó và giữ một điểm cho mỗi ô: {{ui:Điểm gần tâm mỗi ô nhất}} (mặc định), {{ui:Điểm thấp nhất trong mỗi ô}} (tốt khi tệp không có lớp mặt đất: mặt đất nằm dưới cây) hoặc {{ui:Trung bình các điểm của mỗi ô}}.
- **Lớp** (LiDAR): mặt đất (lớp 2) được chọn khi tệp có; công trình, cây và nhiễu bị bỏ ra. Khi không có lớp mặt đất, mọi lớp được chọn và hộp thoại nói rõ điều đó.
- **Mặt đất** (LiDAR, 0.8): đám điểm từ drone không có lớp mặt đất. Khi tệp không có lớp nào, hộp thoại bắt đầu ở {{ui:Tự tìm mặt đất (đám điểm từ drone, không có lớp mặt đất)}}: mọi lớp trừ nhiễu được đọc, giữ điểm thấp nhất trong mỗi ô, rồi CivilCraft loại bỏ công trình, cây và các điểm thấp lẻ tẻ bằng bộ lọc hình thái học dần dần (Zhang và cộng sự, 2003) mà bạn có thể điều chỉnh: **Vật thể lớn nhất cần loại bỏ** (chiều rộng của công trình lớn nhất; cửa sổ mở rộng cho đến khi phủ kín nó; 0 nghĩa là 20 ô) và **Độ dốc mặt đất lớn nhất**. Công việc được làm trên lưới điểm thấp nhất, nên một đám điểm hàng chục triệu điểm chỉ tốn không hơn số ô của nó (việc lọc thưa là một lượt đọc liên tục). Khoảng cách chính là kích thước ô: ô thô hơn thì nhanh hơn và bỏ sót các vật nhỏ ít hơn bạn tưởng, ô mịn hơn giữ được nhiều chi tiết mặt đất hơn. Báo cáo cho biết có bao nhiêu điểm được giữ làm mặt đất, bao nhiêu ô đã bị loại bỏ như vật thể và bao nhiêu điểm thấp lẻ tẻ bị bỏ. Trên một khảo sát drone 300 m giả lập với năm công trình, 70 cây và 200 điểm ngoại lai thấp, các điểm được giữ nằm trong 3 cm so với địa hình thực và không có mái hay tán cây nào được giữ lại.
- **Cao độ trong tệp**: mét, feet hoặc US survey feet. Khi tệp có ghi, đơn vị đã được chọn sẵn. Khi không ghi, bạn phải chọn: hộp thoại hiển thị khoảng cao độ theo cả hai cách để bạn biết cách nào hợp với công trường.
- **Nhập dưới dạng** (chỉ với lưới): {{ui:Điểm đo (mô tả DEM)}}, hoặc {{ui:Chính bề mặt (lưới tam giác)}}.

Một lần nhập lấy tối đa 500,000 điểm. Khi một lựa chọn cho ra nhiều hơn, hộp thoại cho biết vượt bao nhiêu và khoảng cách nào sẽ vừa, và {{ui:Nhập}} vẫn bị vô hiệu.

Nhấp {{ui:Nhập}}. Thanh tiến trình hiển thị việc đọc; {{ui:Hủy}} dừng lại và không có gì thay đổi.

:::warning
Đơn vị theo phương đứng là một cái bẫy thường gặp. Nhiều DEM state plane có Đông và Bắc tính bằng feet nhưng cao độ tính bằng mét. Hãy đối chiếu khoảng hộp thoại hiển thị với những gì bạn biết về công trường.
:::

## Kết quả nhận được

- **Điểm đo**: được đánh số tiếp sau số hiệu điểm cao nhất của bạn, với mô tả `DEM` (lưới) hoặc `LIDAR`, nên chúng tạo thành một nhóm điểm dưới **Điểm** và dựng bề mặt như mọi điểm khác. Nhập chúng là một bước: {{key:Mod+Z}} sẽ gỡ chúng ra.
- **Chính bề mặt**: một TIN lưới, hai tam giác cho mỗi ô, tách theo đường chéo tây nam–đông bắc. Tam giác có góc không có dữ liệu bị bỏ ra, nên các lỗ trong dữ liệu vẫn là lỗ. Bề mặt trùng với lưới tại mọi điểm lưới và là mặt phẳng phẳng bên trong mỗi tam giác giữa chúng. Nó thay thế bề mặt của dự án (hộp thoại hỏi trước); {{key:Mod+Z}} đưa bề mặt trước đó trở lại. Tiêu đề của bảng bên trái ghi **Bề mặt (từ lưới cao độ)**.

## Hệ tọa độ

- Nếu dự án có hệ tọa độ và tệp ghi một hệ khác, mọi điểm được chuyển sang hệ của dự án (và sang tọa độ mặt đất hoặc tọa độ cục bộ khi có).
- Nếu dự án không có hệ nào và hệ của tệp dùng đơn vị của dự án (feet hoặc mét), hộp thoại đề nghị đặt nó làm hệ tọa độ của dự án, trong cùng bước hoàn tác với các điểm.
- Nếu tệp dùng vĩ độ và kinh độ, hoặc tính bằng mét trong dự án feet, hộp thoại yêu cầu bạn chọn hệ tọa độ của dự án trước.
- Nếu tệp không ghi, các số của nó được coi là tọa độ của dự án. Bạn có thể chọn hệ của tệp thay thế.

## Xuất bề mặt thành GeoTIFF

1. Nhấp {{ui:Xuất}} trong nhóm GIS.
2. Trong phần GeoTIFF, chọn bề mặt (mặt đất tự nhiên hoặc bề mặt đã san nền) và kích thước ô. Mặc định lấy từ cạnh tam giác trung bình của bề mặt. Hộp thoại hiển thị kích thước lưới sẽ được ghi.
3. Nhấp {{ui:Tải GeoTIFF}}.

Tệp là một kênh cao độ dấu phẩy động 32-bit theo đơn vị dự án, phủ trên phạm vi của bề mặt; các ô nằm ngoài bề mặt là "no data" (−3.4028235e38). Giá trị của mỗi ô là cao độ của bề mặt tại tâm ô. Tọa độ là tọa độ **lưới**: dự án ở tọa độ mặt đất hoặc tọa độ cục bộ được chuyển ngược về lưới. Tệp ghi hệ tọa độ của dự án bằng mã EPSG; hệ không có mã EPSG thì không được ghi, và hộp thoại cảnh báo bạn cho bộ phận GIS biết đó là hệ nào.

## Những gì đã được kiểm tra

- Bộ đọc GeoTIFF và lưới ASCII đã được kiểm tra với GDAL (qua rasterio), thư viện mà hầu hết chương trình GIS dùng để đọc các tệp này: lưới float 32-bit và số nguyên 16-bit, dạng ô (tiled) và dạng dải (stripped), DEFLATE và LZW, nodata, tỷ lệ và độ lệch, pixel-is-point, lưới UTM, lưới state plane theo US survey feet và lưới vĩ độ/kinh độ — mọi giá trị đều bằng nhau.
- Bộ đọc LAS và LAZ đã được kiểm tra với laspy: LAS 1.2 và 1.4, định dạng điểm 0, 1, 3, 6, 7 và 8, có và không có hệ tọa độ, và LAZ được ghi bởi backend tương thích LASzip — mọi điểm đều bằng nhau.
- Tọa độ đã chuyển đổi được kiểm tra với PROJ đến 1 mm.
- GeoTIFF đã xuất được GDAL đọc lại: hệ tọa độ, vị trí ô, nodata, đơn vị và các giá trị bằng với bề mặt đến 0.0001.
- Chưa có gì ở đây được mở trong các chương trình GIS hoặc CAD khác.

## Chưa xây dựng

- Thay đổi mốc cao độ (mô hình geoid): cao độ được dùng như tệp đang có.
- Dữ liệu dạng sóng, các phản xạ LiDAR theo cách khác ngoài lớp, màu sắc và cường độ.
- Nhiều kênh, ảnh tổng quan (overview), hoặc tệp trên 200 MB.
- Ghi LAS hoặc LAZ từ bề mặt hoặc từ công cụ này (tiện ích bổ sung [đám điểm (point cloud)](topic:point-clouds) ghi đám điểm đã làm sạch thành LAS 1.4 hoặc LAZ).
