---
title: Xuất dữ liệu hoàn công cho GIS
summary: Gửi điểm khảo sát, đường đồng mức, tuyến, nền san, ống và công trình sang phòng GIS của thành phố hoặc quận dưới dạng shapefile, GeoPackage, GeoJSON hoặc KML, theo tọa độ lưới của hệ tọa độ dự án.
keywords: gis, xuất, kml, kmz, google earth, hoàn công, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, ống, công trình, tiện ích, thành phố, quận, lưới, mặt đất, epsg, prj
from: bba4fea5
---

Nhiều thành phố và quận yêu cầu dữ liệu hoàn công theo định dạng GIS khi dự án kết thúc: ống và công trình đặt ở đâu, cao độ san nền cuối cùng, đường tim. **GIS › Xuất** ghi những gì CivilCraft lưu thành các lớp GIS, mỗi loại đối tượng một lớp.

## Trước khi xuất

1. Đặt hệ tọa độ của dự án trong {{ui:Tọa độ}}. Phòng GIS cần biết số liệu nằm ở đâu; không có hệ tọa độ thì các tệp mang số riêng của dự án và không nêu tên hệ nào.
2. Kiểm tra bề mặt, tuyến, nền và mạng lưới ống theo cách bạn muốn giao.
3. Hỏi phòng GIS muốn định dạng nào và hệ tọa độ nào. Nhiều nơi vẫn yêu cầu shapefile trong đới state plane địa phương; hệ thống mới hơn dùng GeoPackage.

## Xuất

1. Nhấn {{ui:Xuất}} trong nhóm **GIS**.
2. Dưới **Nội dung**, chọn các loại cần gửi. Mỗi loại cho biết số đối tượng; loại chưa có gì sẽ bị mờ.
3. Dưới **Dạng**, chọn định dạng.
4. Đọc các ghi chú về tọa độ và đơn vị, rồi nhấn nút tải xuống. Dòng trạng thái cho biết những gì đã được ghi và các tên trường nào đã bị rút ngắn.

Hộp thoại cũng có xuất lưới cao độ ({{ui:Bề mặt dạng lưới cao độ GeoTIFF}}); xem [Lưới cao độ và LiDAR](topic:elevation-grids-and-lidar).

## Mỗi loại chứa gì

| Loại | Hình dạng | Trường |
|---|---|---|
| Điểm khảo sát | Điểm có cao độ | `P` số điểm, `N` bắc, `E` đông, `Z` cao độ, `D` mô tả |
| Đường đồng mức của mặt đất hiện trạng, của mặt san nền | Đường ở cao độ của nó | `ELEV` |
| Đường ngắt | Đường có cao độ | `NAME` |
| Ranh bề mặt | Đa giác (ranh đã vẽ, nếu không thì cạnh của bề mặt) | `NAME` |
| Tuyến | Đường tim | `NAME`, `LENGTH`, `STA_START`, `STA_END` (cọc dưới dạng số thuần) |
| Nền | Đa giác ở cao độ nền | `NAME`, `ELEV`, `AREA` |
| Đường giao với mặt đất | Đường có cao độ (nền và hành lang) | `NAME` |
| Đường đặc trưng của hành lang | Đường có cao độ: tim, mép mặt đường, lề | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Ống | Đường từ đáy trên đến đáy dưới | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (phần trăm), `LENGTH`, `NETWORK` |
| Công trình | Điểm ở miệng | `NAME`, `RIM`, `INVERT` (đáy ống thấp nhất tại đó), `SUMP`, `DIA`, `DIA_UNIT` |
| Mỗi lớp GIS | Như khi nhập | Trường riêng của lớp |

Chiều dài, cọc tuyến và cao độ theo đơn vị của dự án (US survey feet hoặc mét). Đường kính ống và công trình tính bằng inch cho dự án feet và bằng milimét cho dự án mét; `DIA_UNIT` cho biết là đơn vị nào.

## Các định dạng

- **Shapefile**: một tệp `.zip` gồm một shapefile cho mỗi loại (`.shp`, `.shx`, `.dbf`), tệp `.cpg` cho biết văn bản là UTF-8, và tệp `.prj` nêu hệ tọa độ. Hình dạng có cao độ được ghi theo kiểu Z của shapefile. Tên trường dài hơn 10 ký tự được rút ngắn, như định dạng yêu cầu, và dòng trạng thái liệt kê chúng.
- **GeoPackage**: một tệp `.gpkg` với một bảng cho mỗi loại, hệ tọa độ được lưu kèm mã EPSG. Một tệp thay vì nhiều tệp, tên trường dài được giữ nguyên.
- **KML** hoặc **KMZ** (KML nén): một tệp vĩ độ và kinh độ cho Google Earth và bản đồ web, một thư mục cho mỗi loại, mỗi đối tượng là một placemark được đặt tên theo trường NAME, với mọi trường là dữ liệu mở rộng; cao độ tính bằng mét (chế độ độ cao tuyệt đối). Giống GeoJSON, cần hệ tọa độ của dự án.
- **GeoJSON**: một tệp vĩ độ và kinh độ (chuẩn GeoJSON không cho phép gì khác) với mỗi đối tượng mang thuộc tính `kind` (`pipes`, `structures`, …) để người nhận tách chúng. Cao độ được đổi sang mét, như chuẩn yêu cầu; chúng vẫn theo mốc cao độ của dự án (CivilCraft không có mô hình geoid). Dự án không có hệ tọa độ thì không thể xuất GeoJSON, và hộp thoại sẽ nói lý do.

## Lưới, không phải mặt đất

Phòng GIS giữ dữ liệu theo tọa độ **lưới** của một hệ tọa độ. Nếu dự án dùng tọa độ mặt đất hoặc cục bộ (đặt trong {{ui:Tọa độ}}), mọi tọa độ được đổi lại về lưới khi xuất: số trong tệp khác số trên mặt bằng theo hệ số tỷ lệ của bạn (và góc xoay, với hệ cục bộ). Các trường điểm `N` và `E` cũng giữ giá trị lưới. Hộp thoại sẽ nhắc bạn.

:::tip
Gửi kèm tệp một ghi chú ngắn: hệ tọa độ và mã EPSG của nó, mốc cao độ đứng của cao độ, đơn vị, và nội dung từng tệp.
:::

## Những gì đã kiểm tra

- Mọi tệp được ghi đều được đọc lại bằng GDAL, thư viện mà hầu hết chương trình GIS dùng để đọc các tệp này: mọi hình dạng, cao độ và thuộc tính, số đối tượng, và hệ tọa độ dưới dạng mã EPSG (`.prj` và GeoPackage). Các bộ đọc của chúng tôi cũng đọc lại giống vậy.
- Tệp GeoJSON tuân theo RFC 7946: kinh độ trước vĩ độ, không có thành phần `crs`, vòng ngoài ngược chiều kim đồng hồ và lỗ rỗng theo chiều kim đồng hồ; vị trí khớp với PROJ trong vòng 2 mm.
- Một dự án tọa độ mặt đất đã được xuất và mọi điểm được kiểm tra với tọa độ lưới của nó.
- Chưa mở tệp nào trong các chương trình GIS khác. Hãy kiểm tra lần giao đầu tiên với phòng trước khi dựa vào nó.
