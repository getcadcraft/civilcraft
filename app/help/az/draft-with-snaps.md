---
title: Tutma ilə çəkin, seçilmiş küncləri və köçürün, kopyalayın, fırladın
summary: Trassaları, platformaları, parsełləri və xüsusiyyət xətlərini artıq olan nöqtə və küncələrə dəqiq yerləşdirin, küncün şimal və şərqini yazın və ya seçin, tangensi iki seçilmiş nöqtəyə doğru çevirin və obyekti məsafə və ya bucaqla köçürün, kopyalayın və ya fırladın.
keywords: tutma, tutmalar, osnap, nöqtəyə tutma, küncə tutma, pi, təpə, künc, seçmə, nişangah, şərq, şimal, koordinatlar, yazılmış koordinatlar, tangens, istiqamət, rumb, köçür, kopyala, fırlat, çevir, fırladılmış kopya, dublikat, alt, sərbəst nöqtə, çertyojçuluq
from: 49864dda
---

**Yeni 0.9-da:** çəkdiyiniz zaman kursor planda artıq olan nöqtələrə və küncələrə düşür, platforma, parsel və ya xüsusiyyət xəttinin küncü yazıla və ya seçilə bilər. Bu mövzu üç aləti addım-addım göstərir.

## Nə edəcəksiniz

- Tutmalarla çəkin, beləliklə yeni trassa, platforma, parsel və ya xətt mövcud bir şeyə dəqiq başlayır və bitir.
- Küncün şərqini və şimalını yazaraq və ya planda yer seçərək təyin edin.
- Trassanın tangensini seçilmiş iki nöqtəyə doğru çevirin.
- Bütün obyekti köçürün, kopyalayın və ya fırladın.

## Addımlar

1. Çəkmə alətini seçin, məsələn {{ui:Alignment}}, {{ui:Pad}}, {{ui:Parcel}} və ya {{ui:Feature line}}. Göstəricini geodezik nöqtəyə, trassa PI-sinə, platformaya, parsel və ya kütlə küncünə, xüsusiyyət xətti təpəsinə və ya boru quyusuna yaxınlaşdırın. Nişan və onun altında etiket (PI, Künc, Təpə, Quyu və ya Nöqtə və onun nömrəsi) və nöqtənin düşəcəyi şərq və şimal görünür. Nöqtəni orada yerləşdirmək üçün klikləyin.
2. Nöqtəni sərbəst yerləşdirmək üçün klikləyərkən {{key:Alt}} saxlayın. Tutma söndürülür.
3. Platforma, parsel və ya xüsusiyyət xəttini seçin. Xüsusiyyətlərdə {{ui:Corners}} bloku hər küncü Şərq qutusu və Şimal qutusu ilə sadalayır. Yeni ədədlər yazın və ya küncün yanındakı nişangah düyməsinə basıb planda yer klikləyin. Küncə həmin şərq və şimal verilir. Seçimi ləğv etmək üçün {{key:Esc}} basın. Nişangah yalnız planda işləyir: əvvəl 3D görünüşü bağlayın.
4. Tangensi çevirmək üçün trassa seçin. Xüsusiyyətlərdə **İki nöqtədən tangens** altında tangensi seçin, {{ui:First point}} basın və planda klikləyin, {{ui:Second point}} basın və yenidən klikləyin, sonra {{ui:Set direction}} basın. Tangens birinci nöqtədən ikinciyə doğru gedəcək şəkildə dönür və öz uzunluğunu saxlayır.
5. Köçürmək, kopyalamaq və ya fırlatmaq üçün trassa, platforma, parsel və ya xüsusiyyət xətti seçin. Xüsusiyyətlərdə **Köçür, kopyala və fırlat** altında {{ui:Move east}} və {{ui:Move north}} yazın (mənfi ədədlər qərbə və cənuba gedir) və {{ui:Move}} və ya {{ui:Copy}} basın. Ya da {{ui:Distance from two points}} basın və köçürüləcək nöqtəni və köçürüləcəyi nöqtəni klikləyin.
6. Fırlatmaq üçün {{ui:Rotate counter-clockwise}} sahəsinə bucağı (dərəcə ilə) yazın, sonra {{ui:Rotate}} və ya {{ui:Copy rotated}} basın. Obyekt künclərinin ortası ətrafında fırlanır, bucağın yanındakı nişangahla fırlanma nöqtəsini seçməsəniz.

## Qeydlər

- Kopya əsl obyekti öz yerində saxlayır və sonradan seçilmiş olur.
- Hər köçürmə, kopyalama, fırlatma, seçilmiş küncü və çevrilmiş tangens bir geri qaytarma addımıdır.
- Tutmalar kursordan 10 ekran pikselinə qədər işləyir. Tutma nişanı yalnız bir yer təklif edir; siz klikləyənə qədər heç nə dəyişmir.
- Eyni nişangah trassanın PI sətirlərindədir. Bax [Trassalar](topic:alignment), [Parsellər](topic:parcels) və [Xüsusiyyət xətləri](topic:feature-lines).
