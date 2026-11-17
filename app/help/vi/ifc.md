---
title: Xuất và nhập IFC
summary: Lưu toàn bộ dự án thành một tệp IFC duy nhất theo IFC 4.3, IFC4 hoặc IFC2x3 (tuyến, đường, công tác đất, bề mặt, tường, đường ống), và mở tệp IFC để lấy tuyến và bề mặt.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, tuyến, ifcalignment, đường, ifcroad, công tác đất, tin, sản phẩm bàn giao, mua sắm, xuất ifc, nhập ifc
from: 6b998bcf
---

IFC là định dạng trao đổi mở mà nhiều chủ đầu tư công yêu cầu như một sản phẩm bàn giao. CivilCraft ghi toàn bộ dự án vào một tệp IFC và đọc lại tuyến và bề mặt từ các tệp IFC.

## Xuất

1. Nhấp {{ui:IFC}} trong nhóm **Xuất** (trong kiểu dải lệnh: {{ui:Xuất}} › {{ui:Xuất}} › {{ui:IFC}}).
2. Chọn lược đồ. **IFC 4.3 ADD2** là lựa chọn đầu tiên và mặc định: đây là phiên bản có tuyến, đường và công tác đất. Chỉ chọn IFC4 hoặc IFC2x3 khi phần mềm của bên nhận không đọc được 4.3.
3. Hộp thoại cho biết tệp sẽ chứa gì và lược đồ đã chọn bỏ đi những gì. Nhấp {{ui:Xuất IFC}}.
   Tệp được tải xuống với tên "*tên dự án*-ifc4x3.ifc", "-ifc4.ifc" hoặc "-ifc2x3.ifc". CivilCraft nhớ lược đồ bạn chọn lần cuối.

## Mỗi lược đồ chứa gì

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Tuyến | IfcAlignment với các bố cục ngang (đoạn thẳng, cung tròn, đường xoắn clothoid) và đứng (độ dốc, đường cong parabol), các đường cong của chúng (IfcCompositeCurve, IfcGradientCurve), điểm bắt đầu cọc và các sự kiện siêu cao | Một polyline 3D trên một phần tử công trình dân dụng | Một polyline 3D trên một proxy |
| Hành lang | IfcRoad với các phần đường; làn xe, lề, rãnh và vỉa hè thành IfcPavement, bó vỉa thành IfcKerb, dải trồng cây; mỗi lớp mặt đường thành một IfcCourse với chiều dày, vật liệu và khối lượng; mái dốc thành IfcEarthworksCut và IfcEarthworksFill với khối lượng đào và đắp; tốc độ thiết kế và cấp đường | Các phần tử công trình dân dụng được đặt tên theo đúng bản chất, nhóm theo từng đường | Proxy, nhóm theo từng đường |
| Bề mặt | IfcGeographicElement TERRAIN với mạng tam giác bất quy tắc | Các tập mặt tam giác | Mô hình bề mặt dựa trên mặt (tệp lớn hơn) |
| Nền và tường | Mặt trên của nền, mái dốc thành công tác đất, tường chắn thành IfcWall RETAININGWALL | Tương tự, tường là một kiểu tường do người dùng định nghĩa | Tương tự, kiểu tường nằm trong ObjectType |
| Mạng đường ống | IfcPipeSegment và IfcDistributionChamberElement trong một IfcDistributionSystem | Tương tự | IfcFlowSegment và hố ga trong một IfcSystem |
| Định vị địa lý | IfcProjectedCRS và IfcMapConversion | Tương tự | ePSet_ProjectedCRS và ePSet_MapConversion trên công trường |

Một **đường sắt** (tuyến có bật Đường sắt) được đưa vào IFC 4.3 dưới dạng IfcRailway: các đoạn chuyển tiếp thành kiểu riêng (clothoid, parabol bậc ba, Bloss, Helmert, nửa sóng sin dưới dạng đường cosin, sin), độ nghiêng ray thành IfcAlignmentCant, và đường ray thành ray, tà vẹt và lớp đá balát, với lớp cấp phối đá dưới balát bên dưới. IFC4 và IFC2x3 nhận cùng các phần đó dưới dạng phần tử công trình dân dụng hoặc proxy. Mở một đường sắt IFC 4.3 sẽ đưa lại các đoạn chuyển tiếp và độ nghiêng của nó.

Mọi tệp cũng mang các thửa đất (dấu chân), cây trồng và cảnh quan cứng của không gian làm việc Cảnh quan, cùng khối nhà (mỗi khối là một IfcBuilding với các tầng), tất cả trong một công trường. Bộ thuộc tính mang những gì bạn đã thiết kế: cọc, cấu trúc, mái dốc đào và đắp, bề rộng và số làn, cao độ đáy cống, cao độ miệng, chiều cao tường; khối lượng (chiều dài, diện tích, thể tích) là các bộ IfcElementQuantity.

## Đơn vị và tọa độ

Tệp dùng đơn vị chiều dài của dự án (mét, hoặc US survey feet); diện tích và thể tích tính bằng mét vuông và mét khối. Khi có hệ tọa độ (GIS › Tọa độ), tệp được đặt lên bản đồ: tọa độ gốc easting và northing của nó, cùng góc xoay và tỷ lệ của hệ mặt đất (cục bộ), nằm trong chuyển đổi bản đồ. Không có hệ tọa độ thì tệp ghi gốc cục bộ trong một bộ thuộc tính và không được đặt lên bản đồ.

## Nhập

Mở tệp .ifc bằng {{ui:Mở}} hoặc thả nó lên mặt bằng. Hộp thoại nhập cho biết tệp chứa gì:

- **Tuyến** từ IFC 4.3 (bố cục ngang và đứng) và đường cong tuyến IFC 4x1 trở thành tuyến CivilCraft cùng các PI, bán kính, chiều dài đường xoắn và PVI. Một tuyến mà mô hình PI của CivilCraft không chứa được (đường cong ghép, đường xoắn nằm giữa hai đường cong, tuyến bắt đầu hoặc kết thúc trong một đường cong) sẽ không được nhập, và hộp thoại nêu lý do.
- **Bề mặt**: chọn bề mặt sẽ trở thành mặt đất tự nhiên, hoặc giữ bề mặt của dự án.
- **Mọi thứ khác** (và các bề mặt khác) có thể hiện trong khung nhìn 3D làm tham chiếu. Phần tử tham chiếu tồn tại khi dự án đang mở; chúng không được lưu trong tệp dự án.

Tệp do CivilCraft ghi ở IFC4 hoặc IFC2x3 sẽ đưa lại chính xác các tuyến từ bộ thuộc tính của chúng.

## Chưa xây dựng

- Siêu cao của đường được ghi dưới dạng các sự kiện siêu cao và trong bề mặt đường (độ nghiêng là dành cho đường sắt).
- Lưu các phần tử tham chiếu trong tệp dự án, và nhập mạng đường ống hoặc nền từ IFC dưới dạng đối tượng có thể chỉnh sửa.
