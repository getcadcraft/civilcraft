---
title: Qatı atributa görə üslublaşdır
summary: GIS qatının obyektlərini sahənin dəyərlərinə görə rənglədin (hər dəyər üçün bir rəng və ya rəqəm intervalları ilə), nöqtələri rəqəmlə ölçüləndirin, poliqonları rənglə doldurun və planda legenda göstərin.
keywords: simvolologiya, üslub, rəng, rəngləmə, kateqoriyalı, dərəcəli, unikal dəyərlər, bərabər interval, kvantil, təbii fasilələr, jenks, rampa, rəng korluğu, legenda, ölçü, nöqtələr, xoroplet, siniflər, gis
from: a3a69add
---

Qatın **üç nöqtə** menyusunu GIS qatları siyahısında açın və {{ui:Style by attribute…}} seçin.

## Üç üslub

- **Tək simvol:** qatın rəngi, əvvəlki kimi.
- **Kateqoriyalı:** istənilən sütunun hər fərqli dəyəri üçün bir rəng. Səkkiz dəyərə qədər səkkiz Okabe-Ito rəngi verilir (ümumi rəng korluğu növləri üçün bir-birindən ayrı qalmaq üçün seçilib); daha çox dəyər olduqda ən çox rastlanan yeddi dəyərə hər biri üçün rəng verilir, qalanları ortaq boz **Other** (Digər) sinfinə düşür. Dəyəri olmayan obyektlər boz olur.
- **Dərəcəli:** rəqəm sütunu 2-dən 9-a qədər intervala bölünür, hər birinə rampadan rəng verilir. Fasilədəki dəyər aşağı intervala düşür.

## İntervallar necə kəsilir

| Üsul | Fasilələr |
|---|---|
| Bərabər interval (Equal interval) | Ən kiçik dəyərdən ən böyüyə qədər olan aralıq bərabər enlərə bölünür. 0-dan 30-a qədər dəyərlər üç intervalda: 0, 10, 20, 30. |
| Kvantil (Quantile) | Hər intervalda təxminən eyni sayda obyekt. Fasilələr sıralanmış dəyərlərdən adi düz xətt interpolyasiyası ilə oxunur: 1-dən 10-a qədər iki intervalda fasilə 5.5-dir. |
| Təbii fasilələr (Natural breaks, Jenks) | Hər intervalın içində ən az səpələnmə yaradan kəsiklər, belə ki oxşar dəyərlərin qrupları birlikdə qalır. 1,500-dən çox dəyərdə 1,500 bərabər aralıqlı dəyərlə işləyir və bunu bildirir. |

## Rənglər

Viridis və Cividis tünddən açığa doğru, parlaqlıqda sabit dəyişikliklə gedir, buna görə intervalların sırası boz və ya rəng korluğu ilə də oxuna bilir. Blues açıqdan tünddədir. Qırmızıdan maviyə orta dəyər ətrafında iki tərəfli rampadır. **Rəngləri tərsinə çevir** istənilən birini çevirir. Dialoq tətbiq etməzdən əvvəl intervalları və hər birindəki obyektlərin sayını sadalayır.

## Ölçü, doldurma və legenda

- **Nöqtənin ölçüsü** rəqəm sütununa görə: dəyər böyüdükcə hər nöqtənin kvadratı böyüyür, verdiyiniz iki ölçü arasında (kağızda millimetrlə yarım tərəf).
- **Poliqonların içini rəngləndir** hər poliqonu sinif rəngi ilə doldurur (deşiklər boş qalır). Rəng ekrandadır; çaplar və DXF/DWG rəngli konturları göstərir.
- **Planda legenda göstər** sinifləri, saylarını və ölçü diapazonunu planın aşağı sol küncündə çəkir. Legenda ekrandadır; çapa daxil deyil.
- Obyektləri sahə ilə etiketləmək üçün eyni menyuda **Bununla etiketlə**-dən istifadə edin.

Üslub layihə faylında saxlanılır. Üslubları tanımayan versiya faylı qatın rəngi ilə açır. Çaplar, DXF və DWG sinifləri qatın adı və sinifin adı ilə ayrı qatlarda, doqquz əsas CAD rənginin ən yaxınında daşıyır. 200,000-dən çox obyektli qat tək rənglə çəkilir.
