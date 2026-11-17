---
title: Chọn điểm khảo sát bằng lasso
summary: Giữ Shift và kéo một đường viền tự do quanh các điểm khảo sát để chọn chúng, như cửa sổ, chọn cắt hoặc hàng rào; đổi kiểu bằng Space khi đang kéo. Kéo thẳng vẫn vẽ một hộp.
keywords: lasso, tự do, chọn điểm, vùng chọn, cửa sổ, chọn cắt, hàng rào, space, đa giác, chọn hộp, kéo với shift
from: 3dd4fcaa
---

## Bạn sẽ học được gì

Cách chọn điểm khảo sát bằng cách vẽ quanh chúng, khi một hộp sẽ lấy những điểm bạn không muốn.

## Vẽ một lasso

1. Nhấp {{ui:Select}} (hoặc nhấn {{key:V}}).
2. Giữ {{key:Shift}}, nhấn trên mặt bằng và kéo **quanh** các điểm bạn muốn, di chuyển **sang phải** trước.
3. Thả ra.

Các điểm bên trong đường viền được thêm vào vùng chọn. Một lần kéo gần như thẳng vẫn vẽ một hộp, như trước; ngay khi nó cong ra khỏi đường thẳng đó (hơn khoảng 12 pixel), nó trở thành lasso.

## Cửa sổ, chọn cắt và hàng rào

| Bạn kéo | Lasso | Chọn |
|---|---|---|
| Sang phải trước | Cửa sổ (đường viền liền) | Các điểm bên trong nó |
| Sang trái trước | Chọn cắt (nét đứt, màu xanh lá) | Các điểm bên trong nó, và các điểm mà đường viền chạm vào |
| Nhấn {{key:Space}} khi đang kéo | Cửa sổ, rồi chọn cắt, rồi hàng rào | Hàng rào (đường nét đứt màu cam, không khép kín): các điểm mà đường đi qua |

Dòng trạng thái ghi tên lasso khi bạn kéo. {{key:Esc}} khi đang kéo sẽ hủy và không chọn gì.

:::tip
Hàng rào là cách nhanh để chọn các điểm đo dọc theo bó vỉa hoặc đường rãnh: kéo dọc theo chúng rồi thả ra.
:::

## Xem thêm

- [Chọn, sao chép và dán điểm khảo sát](topic:copy-paste-points)
- [Phím và chuột](topic:keyboard)
