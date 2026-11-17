---
title: Nhập dữ liệu GIS
summary: Đưa shapefile, GeoJSON và GeoPackage vào dự án dưới dạng lớp GIS, đặt chúng qua đúng hệ tọa độ, xem thuộc tính và dùng chúng cho bề mặt.
keywords: gis, nhãn, gắn nhãn đối tượng, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, nhập, lớp, thuộc tính, hệ tọa độ, epsg, vĩ độ, kinh độ, đường đồng mức, thửa đất, đường ngắt, ranh giới
from: f6b235cc
---

Phòng GIS của thành phố và quận cung cấp bối cảnh khu đất dưới dạng tệp GIS: thửa đất, quyền địa dịch, đường đồng mức, tiện ích, mốc khảo sát. CivilCraft mở ba loại trong số đó thành **lớp GIS** nằm dưới thiết kế của bạn trên mặt bằng.

| Tệp | Mở gì |
|---|---|
| Shapefile | Tệp `.shp` cùng với `.shx`, `.dbf`, `.prj` và `.cpg` (chọn tất cả), hoặc tệp `.zip` mà chúng được gửi trong đó. Một zip chứa nhiều shapefile cho nhiều lớp. |
| GeoJSON | Tệp `.geojson` (tệp `.json` có các dòng đầu ghi `FeatureCollection` hoặc `Feature` cũng được). |
| GeoPackage | Tệp `.gpkg`. Mọi bảng đối tượng trong đó đều được liệt kê. |
| KML hoặc KMZ | Tệp `.kml` (từ Google Earth hoặc bản đồ web), hoặc tệp `.kmz` đã nén. Mỗi thư mục thành một lớp (tách thành điểm, đường và đa giác khi chứa nhiều loại); tên, mô tả và dữ liệu mở rộng của placemark thành thuộc tính. Cao độ tính bằng mét, và vĩ độ, kinh độ như GeoJSON. |

Đọc các điểm, đa điểm, đường, đa giác có lỗ và hình nhiều phần, cùng với cao độ (z) khi tệp có. Các giá trị đo (M) bị bỏ qua. Lưới cao độ và LiDAR được mở theo cách tương tự: xem [Lưới cao độ và LiDAR](topic:elevation-grids-and-lidar).

## Mở tệp

1. Nhấn {{ui:Nhập}} trong nhóm **GIS** (hoặc {{ui:Mở}}), chọn tệp, hoặc thả chúng lên mặt bằng. Tệp được đọc trên máy tính này; không có gì được tải lên.
2. Hộp thoại **Nhập dữ liệu GIS** liệt kê mọi lớp tìm thấy: loại, số đối tượng (và bao nhiêu không có hình học), số trường thuộc tính, và hệ tọa độ mà tệp nêu. Bỏ chọn những lớp bạn không muốn.
3. Đọc phần **Hệ tọa độ** (bên dưới) và dòng **Sẽ xảy ra**, rồi nhấn {{ui:Nhập}}.
4. Các lớp xuất hiện trên mặt bằng và dưới **Lớp GIS** trong bảng bên trái. Việc nhập là một bước: {{key:Mod+Z}} hoàn tác.

Tệp lớn hiển thị một dòng tiến trình trên mặt bằng với nút {{ui:Hủy}}.

## Hệ tọa độ

Tệp GIS cho biết chúng ở đâu thông qua một hệ tọa độ (`.prj` của shapefile, bảng tham chiếu không gian của GeoPackage; GeoJSON luôn là vĩ độ và kinh độ). CivilCraft đổi mỗi lớp từ hệ riêng của nó sang hệ của dự án. Nó không bao giờ đoán:

- **Dự án có hệ tọa độ** (đặt trong {{ui:Tọa độ}}): mọi lớp có hệ riêng đều được đổi sang nó, kể cả điều chỉnh mặt đất hoặc cục bộ. Tệp không có `.prj` có hai lựa chọn: **Giống dự án** (số của nó được nạp như cũ) hoặc **Chọn hệ của tệp**.
- **Dự án chưa có hệ, và tệp ở hệ chiếu theo đơn vị của dự án** (ví dụ một đới state plane tính bằng US survey feet cho dự án feet): hộp thoại đề nghị **Dùng hệ đó làm hệ tọa độ của dự án**. Nó được đặt trong cùng một bước hoàn tác với việc nhập. Không có gì trong dự án bị dịch chuyển; hệ tọa độ chỉ cho biết các số có nghĩa gì. Bạn có thể chọn hệ khác cho dự án, và các lớp sẽ được đổi sang đó.
- **Dự án chưa có hệ, và tệp ở vĩ độ và kinh độ** (mọi GeoJSON) **hoặc ở đơn vị khác**: {{ui:Nhập}} bị mờ cho đến khi bạn chọn hệ tọa độ của dự án. Bộ chọn bắt đầu gần dữ liệu.
- **Cả dự án lẫn tệp đều không nêu hệ**: các số được nạp như cũ và hộp thoại nói như vậy.

Cao độ cũng được đổi: cao độ GeoJSON là mét (chuẩn GeoJSON nói vậy); cao độ của tệp khác được lấy theo đơn vị của hệ riêng của chúng.

:::warning
Vị trí trong tệp GeoJSON nằm ngoài ±180° kinh độ hoặc ±90° vĩ độ không phải là vĩ độ và kinh độ. Các đối tượng đó bị bỏ qua và hộp thoại cho biết số lượng. Tệp như vậy thường là tệp chiếu đã lưu mà không có hệ; hãy yêu cầu lại, hoặc yêu cầu shapefile kèm `.prj` của nó.
:::

NAD83 được xem như WGS 84 (hệ mà GeoJSON dùng); hai hệ này khác nhau vài mét ở Bắc Mỹ, nên dữ liệu GeoJSON có thể lệch chừng đó. Khi phép dịch tốt nhất cần một tệp lưới (ví dụ NADCON cho NAD27), CivilCraft dùng một phép dịch thô hơn đã công bố, và hộp thoại hệ tọa độ hiển thị mức thô (với NAD27 khoảng 20 m), cho đến khi bạn thêm lưới: xem [Tệp dịch chuyển lưới](topic:coordinate-systems).

## Lớp GIS

Mỗi hàng dưới **Lớp GIS** có:

- một ô đánh dấu để hiện hoặc ẩn lớp (lớp bị ẩn cũng không được chọn);
- màu của nó, chọn từ danh sách;
- một menu (ba chấm) với {{ui:Thu phóng đến}}, {{ui:Dùng cho bề mặt…}}, {{ui:Đổi tên…}} và {{ui:Xóa}}.

Hiện, ẩn, đổi màu, đổi tên và xóa đều là bước hoàn tác. Lớp GIS được lưu trong tệp dự án và trở lại khi bạn mở nó. Chúng cũng được đưa ra cùng với bản in PDF của mặt bằng và các tệp xuất DXF và DWG, mỗi lớp nằm trên một lớp tên `GIS-` cùng số của nó.

## Gắn nhãn đối tượng từ thuộc tính

Trong menu {{ui:Thêm}} của lớp (ba chấm trong **Lớp GIS**), chọn một trường dưới **Gắn nhãn theo**: mỗi đối tượng hiển thị giá trị của nó trên mặt bằng, bằng màu của lớp. Điểm được gắn nhãn bên cạnh điểm; đường được gắn nhãn dọc giữa phần dài nhất của nó (xoay để đọc từ trái sang phải); đa giác được gắn nhãn ở tâm. Số hiển thị đến ba chữ số thập phân. Nhãn cao 1.8 mm trên giấy ở mọi tỷ lệ, và chúng được đưa vào bản in PDF, DXF và DWG. Chọn **Không gắn nhãn** để bỏ đi; mỗi thay đổi là một bước ({{key:Mod+Z}} hoàn tác). Một lớp gắn nhãn tối đa 5,000 đối tượng.

## Xem một đối tượng

Khi {{ui:Chọn}} đang bật, nhấn vào một đối tượng. **Thuộc tính** hiển thị lớp của nó, đây là đối tượng nào, hình dạng (phần, lỗ, đỉnh), cao độ, tệp nó đến từ và hệ tọa độ của tệp đó, rồi mọi thuộc tính trong một bảng. Thuộc tính chỉ đọc: CivilCraft hiển thị dữ liệu GIS như khi nhận, không sửa nó.

Điểm được ưu tiên hơn đường khi cả hai nằm dưới con trỏ; bên trong đa giác, đa giác nhỏ nhất được chọn.

## Dùng cho bề mặt

Mở menu của lớp và chọn {{ui:Dùng cho bề mặt…}} (hoặc nút trong **Thuộc tính**). Những gì được đề nghị tùy thuộc vào lớp:

| Lớp | Có thể thành |
|---|---|
| Đường có cao độ (đường 3D) | Đường ngắt ở cao độ riêng của chúng |
| Đường không có cao độ nhưng có trường số (đường đồng mức) | Đường ngắt ở cao độ trong trường bạn chọn |
| Đa giác | Ranh bề mặt (đa giác được chọn, nếu không thì đa giác lớn nhất), hoặc các đường ngắt dọc theo cạnh của chúng |
| Điểm có cao độ, hoặc có trường cao độ | Điểm khảo sát, được mô tả bằng tên lớp để tạo thành nhóm điểm |

Mỗi lần sử dụng là một bước hoàn tác, sao chép hình học vào dự án; bản thân lớp vẫn giữ nguyên. Cao độ được lấy theo đơn vị dự án.

## Tệp điểm có vĩ độ và kinh độ

Tệp điểm có tiêu đề nêu các cột **latitude** và **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`) được đọc như độ, không phải bắc và đông. Hộp thoại nhập nói rõ điều này. Khi nhấn {{ui:Nhập}}, các điểm được đổi sang hệ tọa độ của dự án; dự án chưa có hệ sẽ yêu cầu bạn chọn trước. Độ không bao giờ được nạp thành feet. Các hàng nằm ngoài ±90° vĩ độ hoặc ±180° kinh độ bị từ chối, kèm lý do. Cột cao độ được lấy như cũ, theo đơn vị của dự án.

## Tệp LandXML có nêu hệ tọa độ

Khi tệp LandXML bạn mở có phần tử `CoordinateSystem` (mã EPSG, mô tả WKT hoặc tên hệ), CivilCraft đề nghị nó làm hệ tọa độ của dự án. Không có gì dịch chuyển nếu bạn chấp nhận; hệ tọa độ chỉ cho biết các số có nghĩa gì.

## Những gì đã kiểm tra

- Mỗi bộ đọc đã được so sánh với GDAL, thư viện mà hầu hết chương trình GIS dùng để đọc các tệp này, trên các tệp do GDAL ghi: shapefile mọi loại có và không có cao độ, đường nhiều phần, đa giác có lỗ, hình học rỗng, văn bản, thuộc tính số, ngày và đúng/sai, văn bản UTF-8 và Windows-1252 có và không có `.cpg`, zip nhiều shapefile, GeoJSON với mọi loại hình học, và GeoPackage có bốn bảng. Mọi hình học, cao độ và thuộc tính đều khớp.
- Vị trí đổi từ vĩ độ và kinh độ, và từ UTM, khớp với PROJ (thư viện chiếu đứng sau GDAL) trong vòng 3 mm.
- Các tệp hỏng (bị cắt ngắn, khai sai kích thước, zip hỏng, GeoPackage hỏng) cho một thông báo đơn giản; không có gì bị treo.
- Chưa có gì ở đây được mở trong chương trình GIS khác, và geodatabase tệp, KML và KMZ chưa được đọc (xem [Chưa xây dựng](topic:not-built-yet)).
