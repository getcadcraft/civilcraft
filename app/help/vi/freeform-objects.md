---
title: Đối tượng tự do
summary: Đưa một hình khối được làm trong ứng dụng khác (STL, OBJ hoặc mục thư viện) lên công trường; nó đặt trên mặt đất hoặc được đào vào mặt đất, và thể tích, diện tích và diện tích chiếm đất được tính như các phần còn lại.
keywords: tự do, đối tượng tùy chỉnh, điêu khắc, chậu cây, ghế, lưới, stl, obj, mục thư viện, nhận biết địa hình, theo mặt đất, cắt vào mặt đất, khối lượng, thể tích, ifc
from: ec835f33
---

Một đặc trưng dùng một lần (chậu cây, tường ghế, tác phẩm điêu khắc, gò chơi) có thể được làm trong ModelCraft hoặc PartCraft và đặt ở đây để nó nằm trong cùng mô hình và bảng thống kê như mọi thứ khác.

1. Cảnh quan › Thêm › {{ui:Đối tượng tự do…}} và chọn tệp **STL** hoặc **OBJ** (theo đơn vị của dự án: feet trong dự án feet, mét trong dự án mét) hoặc một **mục thư viện** CadCraft (`.json`) có thân lưới.
2. Nhấp vào nơi nó được đặt.

## Nền của nó

- **Theo mặt đất**: điểm thấp nhất của nó nằm trên mặt đất thấp nhất dưới diện tích chiếm đất, nên không có gì lơ lửng. Thuộc tính ước tính bao nhiêu phần của nó nằm dưới mặt đất.
- **Cắt vào mặt đất**: nền của nó được đặt ở một cao độ và mặt đất bên trong diện tích chiếm đất được san đến đó với các mái đường giao mặt đất, được tính trong Khối lượng đất đào đắp như một bệ.

Xoay nó bằng **Xoay**, kéo nó trên mặt bằng để dời.

## Đã tính

Thuộc tính cho biết **thể tích** (với khối đặc kín), **diện tích bề mặt**, **diện tích chiếm đất** và **chiều cao** của nó, đo từ lưới. Xuất IFC ghi nó với **lớp IFC** bạn chọn và các khối lượng đó.

:::note
Diện tích chiếm đất là bao lồi (convex hull) của đường viền: một hình lõm (chậu cây hình chữ L) được san như thể nó được lấp đầy.
:::
