---
title: Suvarma layihəsi
summary: Hesablama köməkçisi, möhürlənmiş layihə deyil: sahədə səpicilər, yan borular, əsas xətt, klapanlar və damcı xətləri; borulardan tapılmış zonalar; Hazen–Williams ilə təzyiq itkisi, ən pis hal səpici, təchizata qarşı axın və təzyiq, yağıntı sürətləri, iş vaxtları, əhatə və material siyahısı.
keywords: suvarma, yağışlandırıcı, səpici, sprey, rotor, fırlanan nasadka, köpük başlığı, damcı, damcı xətti, emitter, klapan, zona, stansiya, nəzarətçi, əsas xətt, yan xətt, birləşmə nöqtəsi, su təchizatı, təzyiq, psi, kpa, axın, gpm, sürtünmə itkisi, hazen williams, yağıntı sürəti, iş vaxtı, əhatə, başdan-başa, material siyahısı
from: 7d6342c1
---

:::warning
Bu hesablama köməkçisidir, möhürlənmiş layihə deyil: suvarma layihəçisi quraşdırılmadan əvvəl hər nəticəni yoxlamalıdır.
:::

## Sistemi qurun

1. Sol tərəfdəki **Suvarma** bölməsində **Səpici**ni, onun **Bucağını** və bucağın başladığı yeri, yan borular və əsas xətt üçün boru ölçülərini seçin.
2. {{ui:Irrigation}} › {{ui:Point of connection}}: su təchizatının birləşdiyi yerə klik edin. **Təzyiqi**, **mövcud axını** və sayğac və geri axma itkisini Xüsusiyyətlər-də təyin edin.
3. {{ui:Irrigation}} › {{ui:Valve}}: hər zonanın klapanının yerinə klik edin. Klapan zonanı başladır.
4. {{ui:Irrigation}} › {{ui:Head}}: səpicilər yerləşdirmək üçün klik edin; hər klik bir səpici yerləşdirir.
5. {{ui:Irrigation}} › {{ui:Lateral pipe}}: klapandan səpicilər üzərindən klik edin və {{key:Enter}} basın. {{ui:Mainline}}: birləşmə nöqtəsindən hər klapana.

Boru ucları səpicilərə, klapanlara, təchizata və digər boru uclarına yapışır, buna görə şəbəkə birləşir. Zona klapandan yan borular boyunca çatılan hər şeydir; əsas xətt eyni anda bir zonanı daşıyır.

## Damcı

{{ui:Irrigation}} › {{ui:Drip line}}: xətt boyunca klik edin, qidalandığı yerdən (yan boru ucu və ya klapan) başlayaraq. Xüsusiyyətlər-də **emitter axını** və **aralığı** təyin edin; damcı xəttinin axını üzərindəki emitterlərdir.

## Yoxlama

{{ui:Irrigation}} › {{ui:Check the system…}} hər zonanı siyahılayır:

| Sütun | Necə hesablanır |
|---|---|
| Axın | Səpicilərin (və damcı xətlərinin) axınlarının cəmi |
| Klapanda | Ən pis halda səpicinin iş təzyiqi üstəgəl ona qədər boru itkiləri (Hazen–Williams, borunun daxili diametri, hündürlük dəyişməsi) və klapan üzərindən itki |
| Təchizatda | Eyni üstəgəl həmin zonanı daşıyan əsas xəttin itkisi, və sayğac və geri axma itkisi |
| Yağıntı | Səpicilərin axını, başdan-başa aralıqla suladıqları sahəyə bölünür |
| Həftədə dəqiqə | **Həftəlik su** parametrini tətbiq etmək üçün |
| Problemlər | Sürətin həddi aşması, səpicinin təzyiq diapazonundan kənarda olması, bir klapanda səpici və rotorların olması, təchizatda kifayət qədər təzyiq və ya axının olmaması, heç bir zonada olmayan səpicilər, döngələr |

Zonanın rəqəmlərini və ən pis halda səpicinin planda dairə ilə göstərilməsi üçün klapanı seçin. Material siyahısı səpiciləri növünə və bucağına görə, boruları ölçüsünə görə, klapanları, damcı xəttini, emitterləri və kontrollerin stansiyalarını sayır. **CSV kimi saxla** ikisini də saxlayır.

Suvarma bölməsindəki parametrlər: **Hazen–Williams C** (yeni plastik boru üçün 150), borudakı **ən sürətli axın** (1.5 m/s), **klapan üzərindən itki** və **Həftəlik su**. Onlar etiketlənmiş defoltlardır.

## Əhatə

{{ui:Irrigation}} › {{ui:Show coverage}} sahənin nə qədərinin səpicilərin quru buraxdığını, nə qədərinin iki və ya daha çox səpici tərəfindən suvarıldığını və hansı səpicilərin qonşuya çatmadığını (başdan-başa aralıq) göstərir.

## Səpicilər

Siyahıdakı səpicilər CadCraft tərəfindən layihə yağıntı sürətlərindən yazılmış **ümumi** növlərdir (sabit spreylər, fırlanan nasadkalar, dişli rotorlar, köpük başlıqları, mikro-spreylər, emitterlər), hər hansı istehsalçının məhsulları deyil. **Səpiciləri fayldan əlavə edin…** öz səpicilərinizi oxuyur (hər səpicinin atımı, axını və ya yağıntı sürəti və təzyiq diapazonu olan JSON siyahısı); onlar layihə ilə birlikdə saxlanılır. İstehsalçının dərc olunmuş məlumatları yalnız həmin istehsalçının qeydə alınmış icazəsi ilə daxil edilir.

Ümumi səpicilərin altında siyahıda **tipik səpicilər** var (adları "typical values" ilə bitir): sabit spreylərin, fırlanan nasadkaların və dişli rotorların, mikro-spreylərin, köpük başlıqlarının və emitterlərin nasadka ölçüləri, radiusu, axını və təzyiq diapazonu ilə. Onlar CadCraft tərəfindən dərc olunmuş riyaziyyatdan (axın üçün orifis tənliyi, radius üçün püskürmə atımı miqyası) və nominal axın siniflərindən hesablanır, yalnız açıq mənbələrdən; heç bir istehsalçının cədvəli kopyalanmır. Birini seçin və seçici onun əsasını və lisenziyasını göstərir. Birindən istifadə edən layihə səpicini və onun mənbəyini layihə faylında saxlayır. Onlar planlaşdırma üçündür: qurmazdan əvvəl real səpicinin öz məlumatlarını yoxlayın.
