---
title: Địa hình từ đường đồng mức
summary: Tạo bề mặt mặt đất từ bản đồ đường đồng mức: chọn các lớp đường, cho biết cao độ của mỗi đường lấy từ đâu, kiểm tra các đường cắt nhau và trùng lặp, rồi dựng. Các đường đồng mức trở thành đường ngắt, với các tam giác phẳng trên sống núi và thung lũng được sửa. Bản đồ vẽ từ ảnh hoặc PDF có thể được chia tỷ lệ và đặt vị trí bằng hai điểm đã biết.
keywords: đường đồng mức, địa hình từ đường đồng mức, bề mặt từ đường đồng mức, bản đồ địa hình, bản đồ khảo sát, không có tọa độ, đường ngắt, tam giác phẳng, sống núi, thung lũng, đỉnh đồi, đường đồng mức cắt nhau, đường đồng mức trùng, khoảng cao đều, tỷ lệ bản đồ, hai điểm, đặt bản đồ, DXF, DWG, shapefile
from: e6161653
---

Đôi khi một khảo sát viên gửi một bản đồ đường đồng mức: các đường có cao độ, nhưng không có điểm. CivilCraft dựng mặt đất hiện có từ các đường đó.

## Đưa các đường đồng mức vào

Mở bản đồ dưới dạng đường nét: một bản vẽ DXF hoặc DWG, một shapefile hoặc GeoJSON (**GIS** › {{ui:Nhập}}, hoặc thả tệp lên mặt bằng). Các đường được đưa vào như **lớp bản đồ**. Dưới **Bề mặt** › {{ui:Thêm}}, chọn {{ui:Địa hình từ đường đồng mức}}.

## Cho biết cao độ của mỗi đường lấy từ đâu

Đánh dấu các lớp chứa đường đồng mức, rồi chọn **Cao độ lấy từ**:

- {{ui:Cao độ riêng của các đường}}: một đường mà mọi đỉnh của nó có cùng cao độ (một polyline 3D, hoặc một polyline có cao độ). Đường ở 0 là nét vẽ trên mặt bằng và không có cao độ.
- Một **trường số** của lớp (ví dụ ELEV), khi bản đồ đi kèm trường đó.
- {{ui:Một giá trị bắt đầu và một khoảng cách, theo thứ tự các đường được liệt kê}}: cho các đường không có cao độ nào. Đường đầu tiên được liệt kê nhận **Cao độ đường đầu tiên**, đường kế tiếp nhận giá trị đó cộng **Khoảng cao đều**, và cứ thế. Hãy liệt kê các đường từ thấp đến cao (hoặc sắp xếp lại trong lớp).

## Kiểm tra, rồi dựng

{{ui:Kiểm tra}} liệt kê những gì sai, bằng lời, trước khi có gì thay đổi:

- một đường **không có cao độ** hoặc có ít hơn hai điểm;
- một đường **trùng lặp** (cùng một hình hai lần, kể cả khi vẽ theo chiều ngược lại);
- hai đường **cắt nhau**, ở các cao độ khác nhau hoặc cùng một cao độ (một đường tự cắt chính nó cũng vậy), kèm vị trí;
- một cao độ **không nằm trên khoảng cao đều** (một lỗi gõ như 105.5 trên bản đồ khoảng 1 m).

Đánh dấu {{ui:Bỏ các đường cắt qua đường khác}} để bỏ đường cắt nhiều đường nhất (rồi đường kế tiếp, cho đến khi không còn đường nào cắt): một đường lạc cắt mọi đường đồng mức là đường bị bỏ, không phải các đường đồng mức. **Đơn giản hóa đường trong khoảng** làm mỏng các đỉnh gần với một đoạn thẳng hơn khoảng cách đó.

{{ui:Dựng mặt đất}} thêm các đường vào mặt đất hiện có như đường ngắt (một bước hoàn tác), để bề mặt đi qua đúng mọi đường đồng mức. Khi đánh dấu {{ui:Sửa các tam giác phẳng trên sống núi, thung lũng và đỉnh đồi}} và đã nhập khoảng cao đều, CivilCraft cũng thêm một điểm bên trong mỗi tam giác phẳng (tam giác mà các góc đều nằm trên một đường đồng mức), ở độ cao mà dốc bên cạnh tiếp tục tới, và không bao giờ cách đường đồng mức quá nửa khoảng cao đều. Nếu không, đỉnh sống núi, đáy thung lũng và đỉnh đồi sẽ thành các tấm phẳng. Trên một ngọn đồi thử nghiệm, sai số so với bề mặt thực giảm một phần tư; trên một sống núi giảm 40 %.

## Bản đồ không có tọa độ

Với một bản đồ đường đồng mức vẽ lại từ ảnh hoặc PDF, mở **Tỷ lệ và đặt các lớp theo hai điểm đã biết**. Cho hai điểm trên bản đồ và vị trí thật của chúng; các lớp được đánh dấu sẽ được chia tỷ lệ, xoay và dời để khớp (một bước hoàn tác; cao độ không đổi). Hai điểm đó cũng cho ra tỷ lệ (hiện trong thông báo) và góc xoay.

Bề mặt chỉ tốt bằng bản đồ: giữa hai đường đồng mức nó là một mặt phẳng, nên địa hình thật giữa chúng không được biết. Hãy kiểm tra kết quả với các cao độ điểm trước khi dựa vào nó.
