---
title: Đơn vị, cọc và định dạng số
summary: Dự án theo feet và mét, cách ghi và nhập cọc, độ dốc, phương vị, diện tích, thể tích và kích thước ống, cùng ảnh hưởng của việc đổi đơn vị.
keywords: nhập chiều dài, phép tính, máy tính, tổng, phân số, feet và inch, 4+7/16, đơn vị, feet, US survey feet, mét, hệ mét, hệ Anh, định dạng cọc, đánh cọc, độ dốc, phần trăm, mái dốc, h:v, phương vị, yard khối, đường kính
from: 0b9b5b6b
---

## Đơn vị dự án

Dự án dùng **US feet** hoặc **mét** (**Đơn vị** ở bảng bên trái). Mọi tọa độ, cao độ, chiều dài và cọc trong dự án đều theo đơn vị đó.

:::warning
Đổi **Đơn vị** sẽ thay đổi nhãn, định dạng cọc, giá trị mặc định và cách ghi tệp. Hệ thống **không** chuyển đổi bất kỳ con số nào. Một công trường đo bằng feet rồi đổi sang mét vẫn giữ nguyên các con số, nay được đọc là mét. Thanh trạng thái ghi: "Đơn vị hiện là mét. Tọa độ chưa được chuyển đổi." Hãy đặt đơn vị khớp với dữ liệu của bạn trước khi thiết kế.
:::

Những gì phụ thuộc vào đơn vị:

| | US feet | Mét |
|---|---|---|
| Định dạng cọc | `12+34.56` (cọc 100 ft) | `1+234.567` (cọc 1000 m) |
| Khoảng cách đường đồng mức có sẵn | 0.25 đến 20 ft | 0.1 đến 10 m |
| Diện tích | ft² | m² |
| Thể tích | yd³ | m³ |
| Đường kính ống và công trình | inch | milimét |
| Bán kính đường cong mặc định | 100 ft | 30 m |
| Vạch cọc trên mặt bằng | mỗi 50 ft, nhãn mỗi 100 ft | mỗi 20 m, nhãn mỗi 100 m |
| Tỷ lệ in | 1" = 5' đến 1" = 1000' | 1:50 đến 1:10000 |
| Đơn vị chiều dài LandXML | USSurveyFoot | meter |

Dự án mới bắt đầu bằng feet, hoặc bằng mét khi đơn vị chiều dài được đánh dấu sao trong {{ui:Cài đặt}} › {{ui:Chung}} › {{ui:Đơn vị}} là đơn vị hệ mét. Danh sách **Đơn vị** hiển thị các đơn vị được bật tại đó, và luôn có đơn vị riêng của dự án. Khi có đơn vị diện tích hoặc thể tích được đánh dấu sao (acres, hectares, acre-feet …), diện tích và thể tích sẽ được báo cáo theo đơn vị đó thay cho cột trên. Xem [Đơn vị, giá trị nhập và danh sách đơn vị](common:unit-lists).

Khi mở LandXML, dự án lấy đơn vị của tệp. Tệp dùng international feet sẽ mở thành dự án feet; các con số không đổi.

## Nhập chiều dài và tổng

Ô nào nhận chiều dài hoặc cao độ đều đọc được hơn một số thường: nhấn Enter và ô sẽ hiển thị kết quả theo đơn vị của dự án.

| Bạn nhập | Trong dự án feet | Trong dự án mét |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | cùng chiều dài tính bằng mét |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | tính bằng feet | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, và các đơn vị khác theo US survey feet | cùng chiều dài tính bằng mét |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | tổng, tính bằng feet | tổng, tính bằng mét |

Mọi ký hiệu chiều dài trong bảng đơn vị dùng chung đều được chấp nhận, với kích thước chính xác: feet của dự án là US survey feet, nên `10 US ft` bằng 10 và `3 ch` (chuỗi đo theo international foot) bằng 197.9996. Dùng `+ - * /` và dấu ngoặc, cùng `abs`, `round`, `ceil` và `floor`. Dấu gạch ngang viết liền trong chiều dài là một phần của nó (`24'-6"`, `6-1/2`); có khoảng trắng bao quanh thì là phép trừ (`24' - 6"` = 23.5 ft). Một số thường nhân hoặc chia chiều dài, và là chiều dài theo đơn vị dự án khi được cộng vào một chiều dài. Nếu CivilCraft không đọc được nội dung bạn nhập, ô sẽ được đánh dấu và thanh trạng thái cho biết vị trí.

Cọc không phải là phép tính: `10+00` trong ô cọc là cọc 10+00. Độ dốc theo phần trăm, số điểm và mô tả được đọc đúng như đã nhập.

## Cọc

Cọc là khoảng cách dọc theo một tuyến, ghi với dấu cộng:

- Feet: phần trước dấu cộng là hàng trăm feet. `12+34.56` là 1,234.56 ft.
- Mét: phần trước dấu cộng là hàng nghìn mét. `1+234.567` là 1,234.567 m.
- Cọc âm giữ dấu trừ ở phía trước: `-0+50.00`.

Ở bất kỳ nơi nào nhập cọc (**Cọc bắt đầu**, **Cọc** của PVI), bạn có thể nhập có dấu cộng (`12+34.56`) hoặc dạng số thường (`1234.56`). Khoảng trắng bị bỏ qua.

## Độ dốc và mái dốc

- **Độ dốc** (trắc dọc, ống, độ dốc làn và lề) tính theo phần trăm: `+1.25%` đi lên theo chiều cọc tăng, `-0.50%` đi xuống.
- **Mái dốc** (đào và đắp của nền, đào và đắp của hành lang) được tính theo tỷ lệ ngang trên đứng: `3` nghĩa là 3 : 1, ba đơn vị ngang cho một đơn vị lên hoặc xuống.
- **K** của đường cong đứng bằng chiều dài chia cho độ thay đổi độ dốc tính theo phần trăm.

## Phương vị và góc

Phương vị là phương vị góc phần tư theo độ, phút và giây: `N 63°12'05" E`. Góc lệch của đường cong (Δ) dùng cùng đơn vị độ, phút và giây, kèm "trái" hoặc "phải".

## Khoảng lệch

Khoảng lệch từ tuyến là khoảng cách vuông góc với tuyến, ký hiệu **L** (trái) hoặc **R** (phải) khi nhìn theo chiều cọc tăng.

## Hiển thị số

- Tọa độ và cao độ hiển thị 2 chữ số thập phân trong bảng và thanh trạng thái (3 chữ số với điểm đo được chọn).
- Diện tích và thể tích được nhóm theo hàng nghìn: `128,250 ft²`, `454.9 yd³`.
- Tọa độ không bao giờ được nhóm, để có thể sao chép đúng như hiện có.

## Tọa độ

CivilCraft làm việc trên một mặt phẳng: Đông sang phải, Bắc lên trên. Công việc thiết kế luôn diễn ra trong tọa độ chiếu (state plane, UTM hoặc lưới địa phương). Bạn có thể cho CivilCraft biết tọa độ thuộc hệ tọa độ nào, và là tọa độ lưới, mặt đất hay địa phương; khi đó nó hiển thị vĩ độ và kinh độ, đặt các tệp GIS và lớp bản đồ, nhưng không bao giờ tự thay đổi đơn vị hay dịch chuyển tọa độ của bạn. Xem [Đặt hệ tọa độ của dự án](topic:coordinate-systems) và [Tọa độ mặt đất và địa phương](topic:ground-and-local-coordinates). Giá trị state plane lớn (hàng triệu feet) vẫn ổn; CivilCraft tính toán tương đối so với công trường bên trong để giữ độ chính xác.
