---
title: Sửa một điểm đo
summary: Đổi số hiệu, tọa độ, cao độ hoặc mô tả của một điểm, hoặc kéo nó đến vị trí mới trên mặt bằng.
keywords: sửa điểm, dời điểm, đổi cao độ, đánh số lại, số hiệu điểm, mô tả, kéo, bắn hỏng, đông, bắc, easting, northing, cố định điểm
from: 375ae2e9
---

Một lần đo bị hỏng, chiều cao mia sai, mô tả gõ nhầm: chỉ cần sửa điểm đó, bề mặt sẽ tự cập nhật.

## Đổi giá trị của điểm

1. Với {{ui:Chọn}}, nhấp điểm trên mặt bằng. **Thuộc tính** hiển thị số hiệu, Đông, Bắc, cao độ và mô tả trong các ô.
2. Gõ giá trị mới rồi nhấn {{key:Enter}} (hoặc nhấp ra ngoài). Để trống **Cao độ** với điểm không có cao độ.
3. Bề mặt, đường đồng mức và mọi thứ dựng trên chúng được cập nhật ngay.

Mỗi thay đổi là một bước: {{key:Mod+Z}} hoàn tác và {{key:Mod+Y}} làm lại. Giá trị CivilCraft không dùng được (số hiệu mà điểm khác đã có, chữ trong tọa độ) sẽ bị từ chối: ô được viền và thanh trạng thái cho biết lý do.

Mã mô tả mới tạo một nhóm điểm mới, như khi nhập (xem [Dựng bề mặt](topic:build-surface)).

## Dời điểm trên mặt bằng

1. Chọn điểm (nó hiện một vòng).
2. Kéo vòng. Thanh trạng thái hiển thị Đông và Bắc nơi điểm sẽ đến.
3. Thả ra để dời; cao độ giữ nguyên. Nhấn {{key:Esc}} trước khi thả để đưa điểm về chỗ cũ.

## Đường ngắt đi theo điểm

Đường ngắt vẽ bằng công cụ {{ui:Đường ngắt}} sao chép các điểm mà nó đi qua. Khi bạn dời một điểm hoặc đổi cao độ của nó, các góc đường ngắt tại đó sẽ dời theo, trong cùng một bước. Nhóm đường ngắt tạo từ mô tả luôn được dựng lại từ các điểm.

:::note
Bề mặt đọc từ tệp LandXML giữ các tam giác riêng của nó: các sửa đổi điểm chỉ thay đổi nó sau khi {{ui:Dựng lại bề mặt từ các điểm}}.
:::
