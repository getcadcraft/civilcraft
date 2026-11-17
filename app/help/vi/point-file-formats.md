---
title: Định dạng tệp điểm
summary: Thứ tự cột mà CivilCraft đọc, cách nó tìm dấu phân cách và hàng tiêu đề, các tên tiêu đề mà nó nhận ra, và cách các hàng được kiểm tra.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, định dạng tệp điểm, cột, tiêu đề, dấu phân cách
from: 84fab42e
---

Tệp điểm là văn bản thuần, mỗi dòng một điểm. CivilCraft đọc nó trong trình duyệt; không có gì được tải lên.

## Thứ tự cột

Các chữ cái đặt tên cho cột từ trái sang phải: **P** số hoặc tên điểm, **N** Bắc, **E** Đông, **Z** cao độ, **D** mô tả.

| Thứ tự | Các cột | Dòng ví dụ |
|---|---|---|
| PNEZD | điểm, bắc, đông, cao độ, mô tả | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | điểm, đông, bắc, cao độ, mô tả | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | điểm, bắc, đông, cao độ | `101,2080000.00,6150000.00,250.00` |
| PENZ | điểm, đông, bắc, cao độ | `101,6150000.00,2080000.00,250.00` |
| NEZD | bắc, đông, cao độ, mô tả | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | đông, bắc, cao độ, mô tả | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | bắc, đông, cao độ | `2080000.00 6150000.00 250.00` |
| ENZ | đông, bắc, cao độ | `6150000.00 2080000.00 250.00` |

Các thứ tự không có P sẽ đánh số điểm 1, 2, 3 … theo thứ tự trong tệp. X là đông và Y là bắc.

## Dấu phân cách

CivilCraft xem 20 dòng đầu tiên và chọn dấu đầu tiên trong các dấu sau xuất hiện ở ít nhất 60% số dòng đó: dấu phẩy, tab, dấu chấm phẩy. Nếu không có, nó tách theo chuỗi khoảng trắng.

- Trong tệp có dấu phẩy, tab và dấu chấm phẩy, một trường đặt trong dấu ngoặc kép có thể chứa dấu phân cách (`"FL, NORTH"`), và `""` bên trong dấu ngoặc kép là một dấu nháy kép.
- Trong tệp phân cách bằng khoảng trắng, mô tả ở cuối dòng có thể chứa khoảng trắng: mọi thứ sau cột tọa độ cuối cùng là mô tả.
- Các dòng bắt đầu bằng `#`, `;` hoặc `//`, và các dòng trống, sẽ bị bỏ qua.
- Dấu thứ tự byte (BOM) ở đầu tệp bị bỏ qua.

## Hàng tiêu đề

Dòng đầu tiên được coi là tiêu đề khi có ít hơn hai trường là số. Nếu mọi trường của tiêu đề đều là tên mà CivilCraft nhận ra, thứ tự cột được lấy từ đó ("từ hàng tiêu đề"). Tên được so khớp không phân biệt chữ hoa, khoảng trắng, dấu chấm, gạch dưới, gạch nối và dấu ngoặc:

| Cột | Tên nhận ra |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Nếu có tên tiêu đề không được nhận ra, hoặc các tên không tạo thành một trong tám thứ tự, tiêu đề sẽ bị bỏ qua và thứ tự được đoán theo số cột.

:::warning
Một tiêu đề có cả cột vĩ độ (`lat`, `latitude`) lẫn cột kinh độ (`lon`, `long`, `longitude`) được đọc là độ, không phải bắc và đông. Khi {{ui:Nhập}}, các điểm được chuyển qua hệ tọa độ của dự án, và dự án chưa có hệ tọa độ sẽ yêu cầu bạn chọn trước. Các hàng nằm ngoài ±90° vĩ độ hoặc ±180° kinh độ bị từ chối. Xem [Nhập dữ liệu GIS](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Đoán theo số cột

Khi không có tiêu đề dùng được và **Cột** được để ở {{ui:Nhận diện}}:

- 5 cột trở lên: PNEZD.
- 4 cột: PNEZ khi cột đầu tiên là số nguyên ở mọi dòng được lấy mẫu và cột thứ tư là số; ngược lại là NEZD.
- 3 cột: NEZ.

PNEZD và PENZD không thể phân biệt bằng các con số. Việc đoán theo **Hàng điểm** trong [Cài đặt CivilCraft](topic:settings): P, N, E, Z, D ở đầu, hoặc P, E, N, Z, D (khi đó bốn cột được đọc là PENZ và ba cột là ENZ). Hộp thoại ghi "đoán theo số cột — kiểm tra xem bắc và đông có bị đảo ngược không". Chọn đúng thứ tự trong **Cột** nếu bản xem trước trông sai.

## Cách kiểm tra các hàng

- Một hàng có thể bỏ trống mô tả.
- Bắc và đông phải là số. Cao độ có thể để trống (điểm được giữ lại nhưng không dùng trong mặt).
- Số điểm có thể là bất kỳ văn bản nào (cả chữ cái, như `CP1`), nhưng không được để trống.
- Nếu một số điểm bị lặp lại, hàng đầu tiên được giữ và các hàng còn lại được liệt kê là chưa đọc.
- Mô tả được giữ tối đa 200 ký tự; ký tự điều khiển được đổi thành khoảng trắng.
- Tối đa 200 hàng chưa đọc được giữ cho hộp thoại (hiển thị 25), và tất cả đều được đếm.

## Nhóm điểm

Nhóm của một điểm là từ đầu tiên trong mô tả, viết hoa. "GRD", "grd shot" và "Grd" đều thuộc nhóm GRD. Điểm không có mô tả thuộc nhóm "(không có mô tả)". Xem [Nhập điểm khảo sát](topic:import-points).

## Ghi điểm

CivilCraft chưa xuất tệp văn bản điểm. Các điểm được xuất sang LandXML (dạng CgPoints), trong tệp dự án, và qua {{ui:Xuất}} GIS dưới dạng shapefile, GeoPackage hoặc GeoJSON với các trường P, N, E, Z và D ([Xuất dữ liệu hoàn công cho GIS](topic:gis-export)). Xem [Chưa xây dựng](topic:not-built-yet).
