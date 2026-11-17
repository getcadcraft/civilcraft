---
title: Tọa độ mặt đất và cục bộ
summary: Làm việc với tọa độ mặt đất (bề mặt) được quy đổi từ lưới bằng một hệ số tỷ lệ tổng hợp bạn gõ hoặc tính tại một điểm, hoặc trong lưới công trường giả định được nối với hệ thống bằng hai điểm khống chế.
keywords: tọa độ mặt đất, tọa độ bề mặt, lưới sang mặt đất, hệ số tỷ lệ tổng hợp, csf, hệ số tổng hợp, hệ số lưới, hệ số cao độ, hệ số mực nước biển, hội tụ, góc bản đồ, hệ số tỷ lệ, tọa độ giả định, tọa độ cục bộ, lưới công trường, 5000 5000, điểm khống chế, định vị, hiệu chuẩn, hai điểm, sai số khép
from: 3d7453de
---

Tọa độ State plane và UTM là tọa độ **lưới**: một phép chiếu bản đồ kéo giãn hoặc co lại khoảng cách một chút (vài chục ppm), và công trường càng cao thì khoảng cách đo trên mặt đất càng khác khoảng cách trên lưới. Vì vậy nhiều khảo sát bàn giao tọa độ **mặt đất**, được điều chỉnh để khoảng cách trên mặt bằng bằng khoảng cách đo trên mặt đất, hoặc một lưới công trường **giả định** (5000, 5000 tại một điểm khống chế). CivilCraft giữ nguyên số liệu của bạn và ghi lại mối quan hệ của chúng với lưới, nên vĩ độ và kinh độ, tệp GIS và lớp bản đồ vẫn đặt đúng vị trí.

Mở {{ui:Tọa độ}} trong nhóm {{ui:GIS}}, chọn (hoặc giữ) hệ, rồi chọn dưới **Tọa độ lưới, mặt đất hoặc cục bộ**:

| Lựa chọn | Tọa độ của bạn là | Quan hệ với lưới |
|---|---|---|
| {{ui:Lưới}} | Của chính hệ thống (điểm bắt đầu) | Cùng số |
| {{ui:Mặt đất}} | Được quy đổi sang khoảng cách mặt đất | lưới = gốc + hệ số tổng hợp × (mặt đất − gốc) |
| {{ui:Cục bộ}} | Một lưới công trường giả định | Dời, xoay và co giãn lên lưới bằng hai điểm khống chế |

Bất cứ lựa chọn nào bạn đặt được lưu cùng dự án và là một bước hoàn tác; không có gì dịch chuyển.

## Tọa độ mặt đất

1. Chọn {{ui:Mặt đất}}.
2. Gõ **Hệ số tỷ lệ tổng hợp** từ khảo sát (ví dụ `0.99987`), hoặc tính nó:
   1. Dưới **Tính hệ số tại một điểm**, điểm bắt đầu ở giữa dự án. Chọn {{ui:Chọn một điểm trên mặt bằng}} và nhấp vào vị trí (nhấp gần một điểm khảo sát sẽ lấy điểm đó), hoặc gõ E và N.
   2. Cao độ lấy từ bề mặt tại đó; gõ cao độ khác nếu bạn cần.
   3. Chọn {{ui:Tính}}. CivilCraft hiển thị:
      - **Hệ số tỷ lệ lưới k**: phép chiếu bản đồ kéo giãn khoảng cách ở đó bao nhiêu.
      - **Hệ số cao độ**: khoảng cách trên elipsoid ngắn hơn khoảng cách ở độ cao đó bao nhiêu.
      - **Hệ số tổng hợp** = k × hệ số cao độ: khoảng cách lưới = khoảng cách mặt đất × hệ số này.
      - **Góc hội tụ**: góc từ bắc lưới đến bắc thật tại đó (phương vị trắc địa = phương vị lưới + góc hội tụ).
   4. Chọn nút {{ui:Dùng}} dưới các số để đặt hệ số tổng hợp vào ô.
3. Đặt **Điểm gốc**, nơi tọa độ mặt đất và tọa độ lưới trùng nhau. Mặc định là 0, 0: hầu hết các địa phương công bố tọa độ mặt đất đều điều chỉnh quanh gốc, nên tọa độ mặt đất vẫn gần với tọa độ lưới. Một số khảo sát điều chỉnh quanh điểm khống chế của dự án thay thế: dùng theo khảo sát.
4. Chọn {{ui:Áp dụng}}.

:::warning
Cao độ được lấy là độ cao trên elipsoid. CivilCraft không có mô hình geoid, nên nơi geoid nằm thấp hơn hoặc cao hơn elipsoid 30 m (100 ft) thì hệ số cao độ lệch khoảng 5 ppm. Khi khảo sát nêu hệ số tổng hợp của nó, hãy gõ hệ số đó.
:::

## Tọa độ cục bộ (giả định)

1. Chọn {{ui:Cục bộ}}.
2. Với **Điểm khống chế 1**, gõ số hiệu điểm khảo sát (hoặc chọn {{ui:Chọn}} rồi nhấp nó trên mặt bằng). Tọa độ cục bộ của nó hiển thị bên cạnh.
3. Gõ E và N **lưới** của nó, hoặc vĩ độ và kinh độ của nó trong ô thứ ba (ví dụ `30.2672, -97.7431`).
4. Làm tương tự cho **Điểm khống chế 2**, càng xa điểm đầu càng tốt.
5. CivilCraft hiển thị **Tỷ lệ** và **Góc xoay** tìm được, và nhắc bạn: **Hai điểm luôn khớp chính xác — kiểm tra điểm thứ ba.**
6. Đưa một **Điểm kiểm tra** theo cách tương tự. CivilCraft hiển thị phép khớp đặt nó cách tọa độ lưới bạn gõ bao xa (sai số khép, tính bằng đơn vị dự án và ppm). Sai số khép lớn nghĩa là một điểm sai, lỗi gõ, hoặc tọa độ ở đơn vị khác.
7. Chọn {{ui:Áp dụng}}.

Tỷ lệ xa 1 (vượt quá 0.5 đến 2) bị từ chối: hãy kiểm tra các điểm và đơn vị của chúng.

## Những gì đã kiểm tra

- Hệ số tỷ lệ và góc hội tụ khớp với PROJ (pyproj 3.7.1 với PROJ 9.5.1), thư viện tọa độ mà hầu hết chương trình GIS dùng, trong vòng 1 phần tỷ trên hơn 300 hệ với phép chiếu bảo giác (state plane, UTM, transverse Mercator, Lambert conformal conic), và trong trình duyệt tại một điểm được chọn trên mặt bằng.
- Các bước mặt đất và cục bộ chuyển đổi qua lại với sai số 1 phần tỷ; hai điểm khống chế trả lại đúng tỷ lệ và góc xoay đã dùng để tạo; một điểm kiểm tra lệch 0.05 ft cho thấy sai số khép 0.05 ft.
