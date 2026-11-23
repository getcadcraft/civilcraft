---
title: Hali qurilmagan
summary: Ushbu CivilCraft versiyasi hali nimalarni bajarmaydi va hozir oʻrniga nima qilish kerak.
keywords: yoʻqolgan, cheklovlar, yoʻl xaritasi, mavjud emas, spirallar, kengaytirish, dwg, dxf, kirish quvurlari, havzalar, koʻndalang kesimlar, keyinroq keladi, chegaralar
from: b91588d4
---

CivilCraft hali yosh. Bu sahifa joriy versiya nimani bajarmasligini koʻrsatadi, shuning uchun uni izlab vaqt sarflamaysiz. Bu yerdagi hech narsa uchun sana vaʼda qilinmagan.

## Nuqtalar

| Hali qurilmagan | Hozir, oʻrniga |
|---|---|
| Birinchi nuqtalar fayliga ikkinchi nuqtalar faylini qoʻshish | Avval fayllarni matn muharririda yoki elektron jadvalda birlashtiring |
| Nuqtalar matn faylini eksport qilish | LandXML ni eksport qiling (nuqtalar CgPoints sifatida chiqadi), GIS {{ui:Eksport}} dan foydalaning (P, N, E, Z va D maydonlari bilan nuqtalar) yoki nuqtalarni {{ui:Nusxalash}} bilan elektron jadvalga qoʻying |
| Nuqta yorliq uslublari, tavsif kaliti boʻyicha belgilar, chiziq kodlaridan egri chiziqlar (yoylar), loyihalar orasida ulashish uchun tavsif kalit fayli | Yorliqlar raqam, balandlik va tavsifni yoki undan kamini koʻrsatadi ([CivilCraft sozlamalari](topic:settings)); kalitlar loyiha faylida saqlanadi |
| Birliklarni konvertatsiya qilish | Import qilishdan oldin faylni konvertatsiya qiling; **Birliklar** faqat yorliqlarni almashtiradi |

## Yuzalar

| Hali qurilmagan | Hozir, oʻrniga |
|---|---|
| Nuqtalardan bir nechta yuza qurish | Har bir yuza uchun alohida loyiha |
| Ichki chegaralarni yashirish | **Eng uzun tashqi chekka** yoki tashqi chegarani ishlating |
| Chizilgan bitta uzilish chizigʻini tanlash yoki tahrirlash | {{key:Mod+Z}}, yoki {{ui:Chizilgan uzilish chiziqlarini oʻchirish}} va qayta chizish |
| LandXML dan oʻqilgan yuzani (uzilish chiziqlari, chegara) tahrirlash | {{ui:Sirtni nuqtalardan qayta qurish}} |
| Balandlik panjarasidan yaratilgan yuzani tahrirlash | Panjarani boshqa tanlovlar bilan qayta import qiling |
| Koordinatalar tizimi oʻzgarganda LandXML dan oʻqilgan yuzani konvertatsiya qilish | Avval {{ui:Sirtni nuqtalardan qayta qurish}} |
| Yorliqli nuqtaviy balandliklar va qiyalik qiymatlari | Ularni holat satrida oʻqing yoki Landshaft ish maydonidagi **Qiyalik tahlili** bilan yuzani qiyalik boʻyicha boʻyang ([Landshaft uchun tekislash](topic:landscape-grading#grading-checks)) |

## Trassalar va profillar

| Hali qurilmagan | Hozir, oʻrniga |
|---|---|
| Klotoiddan boshqa spirallar; ikki egri chiziq orasidagi spiral (murakkab oʻtishlar) | Egri chiziq uchlaridagi klotoid spirallar mavjud; boshqalari nomlanadi va LandXML importida oʻtkazib yuboriladi |
| Ikkita boshqa PI orasiga PI qoʻshish | Trassani qayta chizing yoki PI koordinatalarini qayta kiriting |
| Obyektlardan, siljishlardan, kengaytmalardan trassalar | PI lar bilan chizing |
| Vertikal egri chiziq uchun K kiritish | L kiriting (K koʻrsatiladi) |
| Aylana va nosimmetrik vertikal egri chiziqlar | Faqat simmetrik parabolik egri chiziqlar |
| Har bir trassaga bir nechta loyiha profili | Har bir variant uchun bitta trassa |
| Profil koʻrinishini kattalashtirish, profil ostidagi profil polosalari | Profil koʻrinishi butun trassaga moslashadi; uni [reja va profil varaqlarida](topic:plan-profile-sheets) chop eting |
| DWG yoki LandXML dagi kesimlar | PDF dagi kesim varaqlari; maydonlar va hajmlarning {{ui:CSV}} si |
| Burchak ostidagi namuna chiziqlari yoki yoʻl boʻylab turli kenglikdagi | Butun trassa uchun har bir tomonda bitta kenglik |

## Koridorlar

| Hali qurilmagan | Hozir, oʻrniga |
|---|---|
| Oʻrta chiziqlar, toʻsiqlar va shablonlarni aylantiradigan superelevatsiya | Ularni shablon sifatida chizing ([Koridor shablonlari](topic:corridor-templates)); piket boʻyicha shablonlar hali superelevatsiyani qabul qilmaydi |
| Ikki mintaqa shablonlari orasidagi silliq oʻtish (oʻtishlar, torayishlar) | Piketda shablonni oʻzgartiring yoki nuqtaga torayish sifatida chizilgan chiziqqa kenglik nishonini bering |
| Chekka atrofida aylanish, LandXML dagi superelevatsiya | Superelevatsiya egri chiziqlarda markaziy chiziq atrofida aylanadi; kengaytirish uchun xususiyat chizigʻiga kenglik nishonidan foydalaning |
| Yon qiyaliklar uchun nishonlar (yer bilan tutashuvdan chiziqqa yoki yuzaga), koridorning oʻz yuzalari | Nishonlar qoplama chekkalari va chekka chegaralarini siljitadi ([Koridorlar](topic:corridor)); koridor loyihalangan yuzaga tekislanadi |
| Tutashuvga tekislangan bordyur burilishlari, burilish yoʻllari va orollar; yon yoʻl uchini qiyshiq holda asosiy yoʻl chetiga kesish; rejada yoʻlkaning yoʻlga uzunligi va maydoni bilan ulanishi | Tutashgan yoʻllar toʻgʻri burchak bilan ulanadi, asosiy yoʻl chekkasi ochiladi va yon yoʻl unga tekislanadi ([Yoʻllar tutashganda](topic:corridor#where-roads-meet-roads-pads-and-paths)); yoʻlka loyihalangan yuzada va 3D da yoʻl chetida toʻxtaydi |
| LandXML yoʻl sifatida eksport qilingan koridorlar; IFC eksportida trassadagi ikkinchi koridor | Loyihalangan yuza eksport qilinadi |
| Loyihalangan yuzani, 3D da yoki kesimlarda oʻzgartiradigan relyef shablonlari | Ular har bir qatlamning maydoni va hajmini beradi ([Relyef shablonlari](topic:corridor-templates#terrain-templates)) |
| Tezlik, shina sirpanishi, rulash vaqti, tirkamalarni boshqarish yoki kuzov ruxsati bilan burilish izlari; standart loyiha transport vositalari kutubxonasi; transport vositasini sudrab chizilgan burilish izi | Chiziq yoki trassa boʻylab past tezlikdagi burilish izlari, oʻzingizning transport vositasi oʻlchamlari bilan ([Transport vositasi burilish izlari](topic:swept-paths)) |

## Tekislash va hajmlar

| Hali qurilmagan | Hozir, oʻrniga |
|---|---|
| Pogʻonalar, loyihaga tekislangan ochiq xususiyat chiziqlari, boshqa joydan xususiyat chizigʻiga tekislash | Xususiyat chizigʻini yoping ([Xususiyat chiziqlari](topic:feature-lines)) yoki uni mavjud yerning uzilish chizigʻi sifatida ishlating |
| Xususiyat chizigʻi uchini qoʻshish yoki olib tashlash | Chiziqni qayta chizing yoki uning pogʻonali siljitilgan nusxasini yarating |
| Chizilgan uzilish chiziqlarida yoylar (survey nuqtalari orqali), xususiyat chiziqlarida spirallar | Yoylari bilan xususiyat chizigʻini chizing va uni mavjud yerning uzilish chizigʻi sifatida ishlating |
| Masofa, balandlik yoki boshqa yuzaga tekislash | Faqat mavjud yerga tutashtirish |
| Maydoncha burchagini qoʻshish yoki olib tashlash | Maydonchani oʻchirib, qayta chizing |
| TIN-dan TIN-gacha (prizma) hajmlari, panjara katagi oʻlchamini tanlash | Panjara usuli, katak oʻlchami siz uchun tanlanadi |
| Shishish va qisqarish, unumdor tuproq, qoplama chuqurliklari | Koeffitsiyentlarni xabar qilingan raqamlarga oʻzingiz qoʻllang |
| Bepul tashish va qayta tashish xarajatlari, turli trassalar boʻylab tashish, rejada joylashtirilgan qarz konlari va chiqindi joylari | Balans nuqtalari, koʻchirilgan hajmlar va oʻrtacha tashish masofalari bilan massa tashish diagrammasi |

## Quvur tarmoqlari

| Hali qurilmagan | Hozir, oʻrniga |
|---|---|
| Loyihada bir nechta tarmoq | Yomgʻir va sanitariya uchun alohida loyihalar |
| Suv magistrallari: suv sifati va yoshi, qoida asosidagi boshqaruv, boshqa klapan turlari (oqimni boshqarish, drossel, ushlab turuvchi), quvvat bilan berilgan nasoslar, bosimga bogʻliq talab, Darcy–Weisbach varianti, devor qalinligi va bosim sinflari boʻyicha quvur katalogi. Bosimli tarmoqlarning qolgan qismi laboratoriyada: [Suv magistrallari](topic:water-mains) | Ularni suv taqsimoti dasturida tekshiring; sanitariya loyihalash oqimlari [Sanitariya loyihalash oqimlari](topic:sanitary-design) da |
| Vaqt boʻyicha kanalizatsiya oqimlari (gidrograflar, dinamik yoʻnaltirish, saqlash, nasoslar, toshib ketish) | [Sanitariya loyihalash oqimlari](topic:sanitary-design) loyihalash varagʻi ishlatadigan barqaror choʻqqi oqimini beradi |
| Kirish quvuri sigʻimi, suv oqizgich ariq yoyilishi, ushlab turuvchi havzaning yoʻnaltirilishi, gidrograflar, bitta tutashuv koeffitsiyentidan boshqa energiya yoʻqotishlari | Ularni boshqa dasturda tekshiring; oqimlar, oʻlchamlar va gradient chiziqlari [Yomgʻir drenaji](topic:storm-drainage) da |
| PDF chizmasi, DWG, DXF yoki LandXML dagi suv yigʻish hududlari; yuzadan suv yigʻish hududlari (suv ayirgichlar) | Suv yigʻish hududlarini qoʻlda chizing; ular loyiha faylida saqlanadi |
| Quvur katalogi, dumaloq boʻlmagan quvurlar, tik quti yoki silindr boʻlmagan inshootlar (konuslar, pogʻonalar, yon pogʻonali oʻrnatish), kutubxonada drenaj toifasi | Parametrlar boʻyicha inshoot turlari ([Quvur tarmogʻi](topic:pipe-network)); diametrli quvurlar |
| Quvurlar profil koʻrinishida, egri quvurlar | Oʻng panelda quvur inversiyalari va qoplamasini oʻqing |

## Uchastkalar

| Hali qurilmagan | Hozir, oʻrniga |
|---|---|
| Maydon yoki old tomon boʻyicha uchastkalarni joylashtirish, atrofdagi chiziqlardan uchastkalar, yoʻl ajratish | Har bir uchastkani burchaklari bilan chizing yoki uning yoʻnalishlarini kiriting |
| Rejadagi egri chiziqlar jadvallari va chiziqlar jadvallari; qoʻlda siljitilgan yorliqlar | Har bir segment oʻz chizigʻi boʻylab yorliqlanadi |
| LandXML dagi uchastkalar | Uchastkalar loyiha faylida saqlanadi va PDF, DWG va DXF ga chiqadi |

## Poligonlar

| Hali qurilmagan | Hozir, oʻrniga |
|---|---|
| Eng kichik kvadratlar tuzatishi, transit qoidasi, burchaklarni masofalarga nisbatan ogʻirlash | Kompas qoidasi |
| Ogʻish burchaklari, zenit burchaklari va qiyalik masofalari, trigonometrik nivelirlash bilan balandliklar | Gorizontal masofalar va burchaklarga toʻgʻri keltiring yoki azimutlar |
| Yon nuqtalar, maʼlumot yigʻuvchilardan xom maʼlumot fayllari | Nuqtalarni nuqta fayli sifatida import qiling |

## Qoziqlar

| Hali qurilmagan | Hozir, oʻrniga |
|---|---|
| Siljitilgan qoziqlar (qoziqdan orqaga qoʻyilgan tayanch nuqtalar), tutash nuqtada qiyalik qoziqlari | Kerakli siljishlarda, shu jumladan yon chekkadan tashqarida qoziq qoʻying |
| Qoziqlarni toʻgʻridan-toʻgʻri maʼlumot yigʻuvchining oʻz formatiga yuborish | CSV aksariyat maʼlumot yigʻuvchilarning ofis dasturida ochiladi |
| Quvurlar, maydonchalar va uchastkalarga qoziq qoʻyish | Trassa yaqinidagi survey nuqtalaridan yoki uchastka yoʻnalishlaridan foydalaning |

## Fayllar va chiqish

| Hali qurilmagan | Hozir, oʻrniga |
|---|---|
| DWG yoki DXF dan matn, shtrixlash va oʻlchamlar; qogʻoz fazosi; bogʻlangan chizmalar (xref); ikkilik DXF | Model fazosidagi chiziqlar ochiladi ([DWG yoki DXF ni chiziqlar sifatida ochish](topic:open-dwg-dxf)); bogʻlangan chizmalarni alohida oching |
| Bir vaqtning oʻzida bir nechta nuqtani sudrab siljitish | Ularni kesib qoʻying va qoʻying yoki bittadan tahrirlang |
| Portret varaqlari, oʻzingizning sarlavha bloki, oʻzingiz joylashtiradigan koʻrinish oynalari, DWG dagi reja va profil varaqlari | PDF da bitta gorizontal reja varagi yoki trassa boʻylab reja va profil varaqlari (PDF) |
| Balandlik polosalarini va profillarni chop etish | Polosalar faqat ekranda; kerak boʻlsa skrinshot oling |
| Qatlam nomlari, ranglari yoki yorliq uslublarini oʻzgartirish | DXF eksportidan keyin ularni CAD dasturida oʻzgartiring |
| Bulutda saqlash va versiyalar tarixi | `.civilcraft.json` fayllarini saqlang va zaxiralang; bitta loyiha ustida birgalikda ishlash uchun CadCraft Studio da jonli seansdan foydalaning ([Saytni birgalikda jonli loyihalash](topic:work-live)) |
| iPad va iPhone uchun CadCraft Studio hamda Google Play dan | Qurilmada brauzerda CivilCraft dan foydalaning; Androidda CadCraft Studio ni getcadcraft.com/download dagi APK orqali oʻrnating |
| Bir vaqtda bir nechta nuqta yoki loyiha fayllarini ochish | Har bir ochish uchun bitta fayl (bir-biriga tegishli GIS fayllar, masalan shapefile qismlari, birga ochiladi) |

## Landshaft

| Hali qurilmagan | Hozir, oʻrniga |
|---|---|
| Ishlab chiqaruvchilarning boshlari va nasadkalari | Umumiy boshlar yoki faylingizdan oʻzingizning boshlaringizni qoʻshing; ishlab chiqaruvchi maʼlumotlari ruxsat berilganda kiritiladi |
| Tomchi chiziqlari uchun maksimal yon uzunliklar, vaqt boʻyicha oqimlar, nasoslar, halqali quvur tarmoqlari | Tomchi yoʻllarini ishlab chiqaruvchi eʼlon qilgan uzunlikda saqlang; tekshiruv shoxlangan tarmoqni talab qiladi |
| Konkav erkin shaklli obyektning aniq konturi; uning yer ostidagi hajmi aniq oʻlchangan | Qavariq qobiq tekislanadi va yer ostidagi hajm taxminiy (Xususiyatlarda aytiladi) |
| BimCraftʼ va ModelCraftʼning oʻz kutubxonadan joylashtirish funksiyasidagi oʻsimliklar | Landshaft IFC ni eksport qiling va uni BimCraftʼda bino yonida oching |
| 3D koʻrinishdagi batafsil oʻsimlik modellari (barglar, shoxlar, fasllar); 3D koʻrinishdagi erkin shaklli obyektlar va sugʻorish | Oʻsimliklar 3D da oʻsimliklar roʻyxatidan olingan oddiy shakllar koʻrinishida koʻrsatiladi ([Saytni 3D da koʻrish](topic:site-3d)); ModelCraft ning sochish (scatter) funksiyasi ekish rasmlarini yaratadi |
| Yuzada tekislangan sathni orqasida ushlab turuvchi qattiq qoplama devorlari | Platforma yoki maydonchaga vertikal yonlar bering: ular yuzadagi tutuvchi devorlar boʻladi ([Tekislash](topic:grading)) |
| Oʻz belgilaringizdagi SVG oʻzgartirishlari; oʻz GLB oʻsimlik modellaringizning teksturasi va ranglari; siqilgan GLB geometriyasi | Oʻz chizmangiz dasturida oʻzgartirishlarni avval yassilang; modellar oʻsimlik rangida chiziladi; GLB ni siqmasdan eksport qiling ([Oʻsimlik grafikasi](topic:plant-graphics)) |
| Kutubxona hisobingizda saqlanadigan oʻz oʻsimliklar roʻyxati (ilovada tahrirlanadi) | Loyihaning oʻz roʻyxatini Oʻsimliklar jadvalida tahrirlang va uni oʻsimliklar fayli sifatida saqlang |
| Oynasiz yordamchilar uchun landshaft asboblari (fayl serveri va buyruq qatori) | Ular CivilCraft oynasi ochiq boʻlganda ishlaydi ([AI yordamchisi bilan saytda ishlash](topic:assistants)) |

## Elektr liniyalari

| Hali qurilmagan | Hozir, oʻrniga |
|---|---|
| Mamlakat standarti ichiga oʻrnatilgan (yuklama holatlari, ruxsat etilgan masofalar, koeffitsiyentlar) | Standartingizning qiymatlarini {{ui:Yuklama holatlari va chegaralar…}} da belgilang va kutubxonangiz bilan birga qadoq sifatida saqlang, qayta ishlatish va ulashish uchun ([Qadoqlar](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Oʻtkazgichdan daraxt tojigacha yoki liniya yonidagi devorgacha yon masofa | Liniya kesib oʻtgan oʻsimliklar va devorlar ustidagi vertikal ruxsat masofasi ([Elektr liniyasi tekshiruvlari](topic:power-line-checks#clearances)) |
| Oʻtkazgichning sekin choʻzilishi va yangi oʻtkazgichning choʻzilishi | Ularni tortish jadvalidagi haroratlar orqali hisobga oling |
| Yer ostidagi kabellarning issiqlik reytingi (yotqizilish usuliga koʻra tok reytingi) | Yetkazib beruvchingizning tok reytingini kabel elementiga kiriting |
| Qisqa tutashuv, himoya va yerga ulash tadqiqotlari | Maxsus elektr dasturidan foydalaning; CivilCraft tarmoqning uzunliklari va kabellarini beradi |
| Panjarali minoralar elementma-element loyihalangan va tuproqdagi tayanch langarlari | Tayanchlar nominal yuk boʻyicha tekshiriladi; tayanch simlari — ularning nominal yuki boʻyicha |
| `.DON` tadqiqot fayli, uni oʻqiydigan dasturda tekshirilgan | Faylni oʻsha yerda tekshiring; haqiqiy namuna bilan sinashimiz uchun bizga namuna yuboring |
| 3D koʻrinishdagi va IFC dagi elektr liniyalari | Reja, liniya profili, varaqlar va GIS qatlamlari |
| Oynasiz yordamchilar uchun elektr liniyasi asboblari | Ular CivilCraft oynasi ochiq boʻlganda ishlaydi ([AI yordamchisi bilan saytda ishlash](topic:assistants)) |

## Bino massalari

| Hali qurilmagan | Hozir, oʻrniga |
|---|---|
| Zonalash kodlari yoki istalgan shaharning qoidalari kutubxonasi | Oʻz qarorlaringizdagi chegaralarni kiriting ([Zonalash chegaralari](topic:zoning-limits)) |
| Devorlardagi osmon yorugʻligi (fasad yorugʻligi), shamol | [Quyosh soatlari](topic:sun-hours) faqat toʻgʻridan-toʻgʻri quyoshni hisoblaydi |
| Daraxtlar, oʻsimliklar yoki massa sifatida chizilmagan narsalardan soya | Qoʻshni binolarni massa sifatida chizing |
| Massalardagi tom shakllari | Yassi tepali massalar |
| Massa BimCraftʼda ishlab chiqilganda teshiklar, tomlar va devor turlari | BimCraft har bir qavatda va pol uchun oddiy tashqi devorlarni quradi; qolganlarini shu yerda qoʻshing |

## GIS va koordinatalar tizimlari

| Hali qurilmagan | Hozir, oʻrniga |
|---|---|
| File Geodatabase; KML uslublari, belgilar, yer qoplamalari va tarmoq havolalari | Avval GeoPackage, shapefile yoki GeoJSON ga oʻtkazing; KML belgilari uslublarsiz oʻqiladi |
| GIS obyektlari yoki ularning atributlarini tahrirlash | GIS dasturida tahrirlang va qayta import qiling. Tahlil paneli yangi qatlamlar yaratadi (bufer, qoplash, birlashtirish, tanlash) va maydon va uzunlik maydonlarini qoʻshadi, lekin obyektni joyida tahrirlamaydi |
| Tarmoq va rastr tahlili, tekis yoki kvadrat uchli buferlar va bir tomonlama buferlar, atributlar jadvalida qatorlarni qoʻshish yoki oʻchirish va maydon turini oʻzgartirish, qoʻlda sinf ranglari, chizmalardagi uslub legendasi | Obyektlarni tanlash uchun Tanlash dan foydalaning va ulardan qatlam yarating; tekis uchlar taklif qilinmaydi. Atribut boʻyicha boʻyash va atributlar jadvali qurilgan: qarang [Qatlamni atribut boʻyicha uslublash](topic:gis-symbology) va [Qatlamning atributlar jadvali bilan ishlash](topic:gis-table) |
| Yorliq uslublari (oʻlchami, joylashuvi) va bir-biridan qochadigan yorliqlar | Yorliqlar bir oʻlchamda va obyektlar zich boʻlganda ustma-ust tushishi mumkin |
| Vertikal datumlar va geoid modellari | Balandliklar fayl bergani kabi ishlatiladi; vertikal datumni oʻzingiz tekshiring |
| NAD27 dan NAD83 ga boshqa siljishlar, hudud boʻyicha taklif qilingan (OSTN15, boshqa datumlar uchun NTv2 fayl qoʻshilganda ishlaydi), bir vaqtda bir nechta panjara, vertikal panjaralar | Datumingiz uchun panjara faylini oʻzingiz qoʻshing; loyihada bitta panjara |
| DXF yoki 3D eksportdagi xarita qatlamlari | Xarita qatlamlari PDF chizmasiga chiqadi va DWG yonida rasm sifatida |
| Kirish, kalit yoki token talab qiladigan xarita serverlari | Ochiq xizmatlardan yoki geoxaritalangan rasm faylidan foydalaning |
| Yuzadan, yer modelidan yoki balandlik panjarasi va LiDAR asboblaridan LAS yoki LAZ fayllarini yozish | Yuzalarni GeoTIFF balandlik panjarasi sifatida eksport qiling. [Nuqta bulutlari](topic:point-clouds) qoʻshimchasi tozalangan bulutni LAS 1.4 yoki LAZ sifatida yozadi |
| LiDAR intensivligi, rangi va qaytishlari; bir nechta qatlamli balandlik panjaralari; 200 MB dan katta panjara yoki LiDAR fayllari | LiDAR faqat sinf boʻyicha filtrlanadi, panjaralar birinchi qatlamdan foydalanadi; katta fayllarni avval boʻlaklarga boʻling |

## Kiritish

| Hali qurilmagan | Hozir, oʻrniga |
|---|---|
| Sensorli tanlash oynasi (u {{key:Shift}} ni talab qiladi) | Har bir survey nuqtasini qoʻshish uchun uzoq bosing |
| Chizish paytida kiritilgan koordinatalar yoki masofalar | Taxminan chizing, soʻng trassaning PI jadvalida aniq PI koordinatalarini kiriting |
| Maydoncha burchaklari va inshootlar uchun koordinatalarni kiritish | Ularning dastaklarini sudrang; aniqlik uchun kattalashtiring va holat satridagi E va N ga qarang |
| Obyektlarga tutib olish (uzilish chiziqlari uchun survey nuqtalaridan tashqari) | Kattalashtiring va holat satriga qarang |

## 3D koʻrinish

| Hali qurilmagan | Hozir, oʻrniga |
|---|---|
| 3D koʻrinishda chizish yoki tahrirlash | Rejada chizing va tahrirlang; 3D koʻrinish har bir tahrirni kuzatadi |
| 3D da bosish orqali koridor xususiyat chiziqlari yoki GIS obyektlarini tanlash | Ularni rejada bosing |
| Vertikal kattalashtirilgan koʻrinishni yoki futlarda eksport qilish | Eksport metrda haqiqiy masshtabda; qarang [3D da saytni eksport qilish](topic:export-3d) |
| GLB yoki OBJ eksportidagi yorliqlar, 3D dagi yorliq oʻlchamlari va uslublari | Yorliqlar faqat 3D koʻrinishda, bitta oʻlchamda; [3D da saytni koʻrish](topic:site-3d) ga qarang |
| Fotosuratlardan teksturalar, yoʻlni video sifatida yozish, sayt tashqarisidan soyalar, 3D koʻrinishda koʻrsatiladigan quyosh soatlari | Yuzalarda joylashgan xarita qatlamlari; bir vaqtda haydash va quyoshning joylashuvi; bir kun yoki fasl uchun [quyosh soatlari](topic:sun-hours) rejada |
