---
title: "Khí hậu tương lai: lũ lụt, nhiệt và cháy rừng năm 2050 và 2080"
summary: Trong Từ địa chỉ đến mặt bằng công trường, nâng mực lũ thiết kế của công trường cho khí hậu tương lai, sàng lọc mức phơi nhiễm cháy rừng và biến đổi tệp thời tiết, hiện tại và tương lai song song, từ một gói dữ liệu khí hậu (SSP2-4.5 và SSP5-8.5, 2050 và 2080).
keywords: khí hậu, biến đổi khí hậu, tương lai, 2050, 2080, ssp, cmip6, kịch bản, mực nước biển, lũ, cao độ lũ cơ sở, bfe, fema, nhiệt, tệp thời tiết, epw, biến đổi, cháy rừng, bushfire
from: b0d2ee38
---

Các số liệu khí hậu đến từ một **gói dữ liệu**, không phải từ ứng dụng. Bật tiện ích bổ sung {{ui:Climate futures}} trong Cài đặt › Tiện ích bổ sung, hoặc nạp một tệp gói của riêng bạn trong khối {{ui:Climate future}}.

:::warning
Gói đi kèm tiện ích bổ sung là một **mẫu**: ba địa điểm (Denver, Miami, Johannesburg), một mô hình khí hậu, năm năm trong mỗi chu kỳ 20 năm. Nó dùng để thử các công cụ, **không dùng cho thiết kế**. Một gói đầy đủ được tạo bằng `tools/climate/build-pack.mjs` từ dữ liệu NEX-GDDP-CMIP6 của NASA.
:::

## Vị trí

Bề mặt › Thêm › Từ địa chỉ đến mặt bằng công trường. Đặt điểm, thêm các lớp (một lớp lũ FEMA cho cao độ lũ cơ sở) và nhấn nút đọc công trường. Dưới các dòng của công trường là khối {{ui:Climate future}}: chọn một **Kịch bản** (SSP2-4.5 hoặc SSP5-8.5) và một **Năm** (2050 = 2041-2060, 2080 = 2071-2090, đều so với 1995-2014). Địa điểm của gói gần điểm nhất được dùng, hoặc địa điểm bạn chọn; khi ở xa mọi địa điểm, các thay đổi trung bình toàn cầu được dùng và bảng ghi điều đó.

## Mực lũ thiết kế

Mực hiện tại là cao độ lũ cơ sở của FEMA khi lớp lũ có giá trị đó (feet, NAVD 88), nếu không thì nhập giá trị của riêng bạn. Chọn loại lũ (ven biển, sông hoặc mưa lớn, hoặc cả hai), độ sâu ngập tại công trường cho phần mưa, và độ cao an toàn nếu bạn muốn. {{ui:Raise the flood level}} hiển thị mực hiện tại và mực tương lai cạnh nhau, các phần do nước biển dâng và do mưa, cùng các giả định: toàn bộ mức nước biển dâng được cộng vào mực lũ ven biển; lưu lượng sông tăng tương ứng một-đối-một với lượng mưa ngày ướt nhất và độ sâu theo lưu lượng mũ 0.6 (Manning, lòng sông rộng); các phần được cộng lại.

:::warning
Đây là sàng lọc mức thay đổi, không phải nghiên cứu lũ. Mực lũ thiết kế thuộc về cơ quan có thẩm quyền hoặc kỹ sư của bạn.
:::

## Mức phơi nhiễm cháy rừng (chỉ sàng lọc)

Thảm thực vật gần nhất, độ dốc đi lên từ đó và khoảng cách cho một dải từ rất thấp đến cực cao, hiện tại và tương lai (tương lai nhân với thay đổi trong chỉ số thời tiết cháy của gói). **Chỉ sàng lọc:** thang tương đối riêng của chúng tôi để biết một công trường có cần đánh giá cháy rừng đầy đủ hay không; không phải xếp hạng theo quy chuẩn.

## Nhiệt: tệp thời tiết tương lai

Chọn một tệp `.epw` hiện tại và {{ui:Make the future weather file}}: nó được biến đổi bằng phương pháp dịch chuyển và kéo giãn đã công bố (Belcher, Hacker và Powell 2005) và mức nhiệt được so sánh (nhiệt độ trung bình và cao nhất, nhiệt độ thiết kế, số giờ trên 30 °C và 35 °C, ngày độ). {{ui:Save the future weather file}} lưu nó cho bảng Môi trường, kiểm tra năng lượng của BimCraft hoặc các công cụ của riêng bạn.

## Số liệu lấy từ đâu

NASA NEX-GDDP-CMIP6 (đầu ra mô hình CMIP6 đã thu nhỏ quy mô, CC BY 4.0 cho mỗi mô hình) cho nhiệt độ, độ ẩm, nắng, mưa và thời tiết cháy; trung bình toàn cầu IPCC AR6 cho mực nước biển dâng, trừ khi gói có số liệu địa phương. Bảng hiển thị nguồn, giấy phép và ngày của gói.
