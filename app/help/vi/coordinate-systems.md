---
title: Đặt hệ tọa độ của dự án
summary: Cho biết khảo sát nằm trong hệ tọa độ nào, để CivilCraft hiển thị vĩ độ và kinh độ, đặt tệp GIS và lớp bản đồ, và ghi tệp .prj. Chọn theo mã, theo tên, theo chính tọa độ hoặc từ tệp .prj.
keywords: hệ tọa độ, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, phép chiếu, prj, wkt, datum, vĩ độ, kinh độ, lat long, địa lý, lưới, georeference, georeferencing, gán hệ tọa độ
from: 964250e2
---

Tọa độ của dự án chỉ là các số cho đến khi bạn nói chúng có nghĩa gì. Đặt hệ tọa độ **không bao giờ làm di chuyển gì**: nó chỉ cho CivilCraft biết, chẳng hạn, rằng E 6,150,000 N 2,080,000 là tọa độ state plane vùng 6 của California, tính bằng feet khảo sát Hoa Kỳ. Khi đã biết:

- thanh trạng thái hiển thị vĩ độ và kinh độ của con trỏ,
- các tệp GIS ở hệ khác (shapefile, GeoJSON, GeoPackage, lưới cao độ, LiDAR) được chuyển vào dự án khi mở,
- lớp bản đồ có thể được vẽ dưới mặt bằng ([Hiển thị lớp bản đồ dưới mặt bằng](topic:map-layers)),
- xuất sang định dạng GIS mang theo hệ tọa độ (một `.prj` cho shapefile, mã EPSG cho GeoPackage và GeoTIFF).

## Chọn hệ

1. Chọn {{ui:Tọa độ}} trong nhóm {{ui:GIS}} của thanh công cụ. Hộp thoại **Hệ tọa độ** mở ra. Ở trên cùng, nó cho biết dự án hiện đang ở hệ nào, hoặc **Không — tọa độ chỉ là số**.
2. Tìm hệ theo một trong các cách sau:
   - **Tìm kiếm**: nhập mã EPSG (`2277`, `EPSG:2277`) hoặc các từ trong tên (`texas central`, `utm 14n`, `lambert-93`). Mã được liệt kê từ mã bạn gõ; các từ liệt kê những hệ có tên chứa đủ mọi từ.
   - {{ui:Các hệ mà tọa độ này khớp}} (khi dự án có điểm hoặc bề mặt): CivilCraft đọc phần giữa dự án trong mọi hệ thuộc họ đơn vị của dự án và liệt kê các hệ có vùng sử dụng bao phủ nó. Tọa độ state plane thường chỉ khớp với vài vùng: một dự án ở Texas tại E 3,115,000 N 10,070,000 feet khảo sát Hoa Kỳ khớp với bốn biến thể Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Mỗi mục cho biết phần giữa dự án sẽ nằm ở đâu.
   - **Gần (vĩ độ, kinh độ)** và {{ui:Gợi ý}}: nhập vị trí công trường, ví dụ `30.27, -97.74` hoặc `30°16′N 97°44′W`, và CivilCraft liệt kê các hệ chiếu có vùng bao phủ vị trí đó, lưới quốc gia và lưới tiểu bang đứng trước.
   - {{ui:Đọc một tệp .prj…}}: mở tệp `.prj` đi kèm một shapefile hoặc bản vẽ. CivilCraft khớp nó với danh sách bằng phép tính chiếu (nên một tệp `.prj` ghi datum khác vẫn tìm đúng hệ) và cho biết đó là hệ nào; khi không khớp chính xác, mô tả của chính tệp được dùng. Bạn cũng có thể thả một `.prj` vào hộp thoại, hoặc mở hay thả một tệp lên riêng mặt bằng.
3. Nhấp một hệ trong danh sách. Dưới **Đã chọn**, nó hiển thị tên, mã EPSG, đơn vị, mức liên kết datum với WGS 84, vùng sử dụng theo vĩ độ và kinh độ, và phần giữa dự án nằm ở đâu trong hệ đó.
4. Giữ chọn **Lưới** (đa số dự án; xem [Tọa độ mặt đất và tọa độ cục bộ](topic:ground-and-local-coordinates) cho các lựa chọn khác) và chọn {{ui:Áp dụng}}.

Thanh trạng thái giờ hiển thị vĩ độ và kinh độ của con trỏ bên cạnh E và N. Đặt hệ là một bước hoàn tác: {{key:Mod+Z}} sẽ lấy lại.

:::note
Đơn vị phải khớp: dự án theo feet thì nhận hệ theo feet khảo sát Hoa Kỳ hoặc feet quốc tế; dự án theo mét thì nhận hệ theo mét. CivilCraft giải thích lý do từ chối (ví dụ "Dự án theo feet nhưng hệ này theo mét…"). Dự án feet với hệ foot khảo sát Hoa Kỳ thì dùng feet khảo sát: "ft" của dự án nghĩa là foot của hệ. Hệ địa lý (vĩ độ và kinh độ, như chính WGS 84) không thể là hệ của dự án: bản vẽ cần tọa độ đông và bắc.
:::

## Đổi hoặc gỡ hệ

Mở lại {{ui:Tọa độ}}, chọn hệ khác và chọn {{ui:Áp dụng}}. Khi dự án có điểm hoặc thiết kế, CivilCraft hỏi **Tọa độ đã ở trong … chưa?**

- {{ui:Có — không có gì di chuyển}}: các số giữ nguyên và chỉ ý nghĩa của chúng thay đổi. Dùng khi hệ cũ được chọn nhầm.
- {{ui:Không — chuyển đổi chúng}}: mọi điểm đo, đường ngắt, ranh giới, PI của tuyến, góc nền và công trình được chuyển từ hệ cũ sang hệ mới, trong một bước hoàn tác. Bề mặt đọc từ LandXML dưới dạng tam giác thì không thể chuyển; hãy dựng lại từ các điểm trước.

{{ui:Gỡ hệ}} bỏ hệ đi (không có gì di chuyển). Các lớp GIS đã có trong dự án vẫn ở nguyên chỗ.

## Vĩ độ và kinh độ trên thanh trạng thái

Khi dự án có hệ, thanh trạng thái hiển thị vĩ độ và kinh độ của con trỏ trên WGS 84, ví dụ `30°18′00.00″ N  97°42′00.00″ W`. Để chọn độ thập phân thay thế, vào {{ui:Cài đặt}}, {{ui:CivilCraft}}, **Vĩ độ và kinh độ** ([Cài đặt CivilCraft](topic:settings)). Với tọa độ mặt đất hoặc cục bộ, số hiển thị đi qua bước đó trước, nên nó đúng với điểm dưới con trỏ.

## Mức chính xác của phép dịch datum

Vĩ độ, kinh độ, GeoJSON và lớp bản đồ đều trên WGS 84. Mức liên kết của mỗi hệ với WGS 84 hiển thị trong hộp thoại:

| Hộp thoại ghi | Nghĩa là |
|---|---|
| WGS 84 itself | Không có dịch chuyển nào. |
| NAD83 is taken as WGS 84 | Hai hệ chênh nhau một hoặc hai mét trên phần lớn Bắc Mỹ, nhiều nhất vài mét. Tốt cho lớp bản đồ và bối cảnh công trường; không dùng cho mốc khảo sát. |
| Known to about *n* m (EPSG's figure) | Một phép dịch đã công bố; lớp bản đồ và GeoJSON có thể lệch khoảng chừng đó. |
| Not known for this datum | Không có phép dịch công bố nào nếu không có tệp lưới: lớp bản đồ và GeoJSON có thể lệch hàng trăm mét. |
| From the grid shift file … | Đang dùng một tệp dịch lưới (bên dưới): trong vòng khoảng 10 cm so với NAD83 bên trong lưới. |

Tọa độ riêng của dự án không bao giờ qua phép dịch datum: chỉ những gì được chuyển sang hoặc từ vĩ độ và kinh độ mới qua. Datum độ cao và mô hình geoid không được xử lý (cao độ không bao giờ được chuyển). Khi phép dịch tốt nhất cần một tệp lưới, danh sách mang phép dịch công bố thô hơn và hộp thoại hiển thị độ chính xác của nó (chẳng hạn các hệ NAD27 khoảng 20 m), cho đến khi bạn thêm lưới.

## Tệp dịch lưới

Với một hệ NAD27, **Tệp dịch lưới** trong hộp thoại hệ tọa độ đưa vĩ độ và kinh độ, các tệp GIS và lớp bản đồ về trong vòng khoảng 10 cm so với NAD83 thay vì khoảng 20 m:

- **Tải xuống** lưới mà CivilCraft gợi ý cho khu vực của hệ (NADCON5 cho phần lục địa Hoa Kỳ, NADCON cho Alaska, NTv2 cho Canada) từ cdn.proj.org, máy chủ lưới công cộng của PROJ. Chỉ tên tệp lưới được gửi đi.
- Hoặc **Thêm tệp lưới…** nếu bạn đã có: NTv2 (`.gsb`) hoặc lưới GeoTIFF của PROJ (`.tif`), tối đa 20 MB.

Lưới được lưu trong tệp dự án, nên đi theo dự án. Mục này cho biết phần giữa dự án có nằm trong lưới không: nếu nằm ngoài, không có phép dịch nào được áp dụng, nên hãy dùng lưới bao phủ công trường. **Ngừng dùng lưới** quay về phép dịch thô. Mỗi thay đổi là một bước: {{key:Mod+Z}} hoàn tác.

Các lớp GIS đã có trong dự án vẫn ở nguyên chỗ khi lưới thay đổi; nhập lại chúng để đặt qua lưới. Tọa độ riêng của dự án không bao giờ di chuyển.

## Những gì đã kiểm tra

- Mọi phép chuyển đổi được so với PROJ (pyproj 3.7.1 với PROJ 9.5.1), thư viện tọa độ mà đa số chương trình GIS dùng, trên hơn 330 hệ: state plane theo feet khảo sát Hoa Kỳ và feet, UTM bắc và nam, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator và web Mercator. Tọa độ đông và bắc khớp trong vòng 1 cm với cùng phép dịch datum (phần lớn dưới 1 mm), và phép toán chiếu khớp với định nghĩa của chính PROJ trong vòng 1 cm.
- Các tệp `.prj` do PROJ viết theo hai dạng phổ biến (ESRI và OGC) đã được đọc lại cho 105 hệ: 208 trên 210 khớp chính xác với mã EPSG, và hai hệ còn lại khớp với một hệ có cùng phép toán trên cùng ellipsoid. Các tệp `.prj` mà CivilCraft viết được PROJ đọc là cùng hệ đó. Tệp `.prj` ESRI cho các hệ stereographic cực (UPS, Alaska cực) không đọc được; hãy chọn những hệ đó theo mã.
- Vĩ độ và kinh độ trên thanh trạng thái khớp với PROJ trong vòng 0.01″ trên trình duyệt.
