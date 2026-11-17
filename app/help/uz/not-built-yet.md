---
title: Hali qurilmagan
summary: CivilCraft ning ushbu versiyasi hali nimalarni bajarmasligi va bugun uning oʻrniga nima qilish kerakligi.
keywords: yoʻq, cheklovlar, yoʻl xaritasi, mavjud emas, spirallar, kengaytirish, dwg, dxf, kirish inshootlari, retensiya, kesimlar, keyinroq, chegaralar
from: a2d970ef
---

CivilCraft hali erta bosqichda. Bu sahifa joriy versiya nimani bajarmasligini sanab oʻtadi, shuning uchun uni izlab vaqt sarflamang. Bularning hech biri sana bilan va'da qilinmagan.

## Nuqtalar

| Hali qurilmagan | Buning oʻrniga, bugun |
|---|---|
| Birinchi faylga ikkinchi nuqtalar faylini qoʻshish | Avval fayllarni matn muharririda yoki elektron jadvalda birlashtiring |
| Nuqtalar matn faylini eksport qilish | LandXML ni eksport qiling (nuqtalar CgPoints sifatida chiqadi), GIS {{ui:Eksport}} dan foydalaning (P, N, E, Z va D maydonli nuqtalar) yoki nuqtalarni elektron jadvalga {{ui:Nusxalash}} qiling |
| Nuqta yorliq uslublari, tavsif kaliti boʻyicha belgilar, chiziq kodlaridan egri chiziqlar (yoylar), loyihalar oʻrtasida ulashish uchun tavsif kalit fayli | Yorliqlarda raqam, balandlik va tavsif, yoki undan kamroq koʻrsatiladi ([CivilCraft sozlamalari](topic:settings)); kalitlar loyiha faylida saqlanadi |
| Birliklarni konvertatsiya qilish | Import qilishdan oldin faylni konvertatsiya qiling; **Birliklar** faqat belgini almashtiradi |

## Yuzalar

| Hali qurilmagan | Buning oʻrniga, bugun |
|---|---|
| Nuqtalardan bittadan koʻp yuza qurish | Har bir yuza uchun bitta loyiha |
| (Ichki) chegaralarni yashirish | **Tashqi chekkaning eng uzuni** yoki tashqi chegarani ishlating |
| Chizilgan bitta uzilish chizigʻini tanlash yoki tahrirlash | {{key:Mod+Z}}, yoki {{ui:Chizilgan uzilish chiziqlarini oʻchirish}} va qayta chizing |
| LandXML dan oʻqilgan yuzani tahrirlash (uzilish chiziqlari, chegara) | {{ui:Sirtni nuqtalardan qayta qurish}} |
| Balandliklar panjarasidan yasalgan yuzani tahrirlash | Panjarani boshqa sozlamalar bilan qayta import qiling |
| Koordinatalar tizimi oʻzgarganda LandXML dan oʻqilgan yuzani konvertatsiya qilish | Avval {{ui:Sirtni nuqtalardan qayta qurish}} |
| Yorliqli nuqta balandliklari va qiyalik qiymatlari | Ularni holat panelida oʻqing yoki **Qiyalik tahlili** bilan yuzani qiyalik boʻyicha boʻyang (Landshaft ish maydonida) ([Landshaft uchun tekislash](topic:landscape-grading#grading-checks)) |

## Trassalar va profillar

| Hali qurilmagan | Buning oʻrniga, bugun |
|---|---|
| Klotoiddan boshqa spirallar; ikki egri orasidagi spiral (murakkab oʻtishlar) | Egri chiziq uchlaridagi klotoid spirallar mavjud; boshqalari nomlanadi va LandXML import qilishda oʻtkazib yuboriladi |
| Ikki boshqa PI orasiga PI qoʻshish | Trassani qayta chizing yoki PI koordinatalarini qayta kiriting |
| Trassalar obyektlardan, ofsetlardan, kengaytirishlardan | PI lar boʻyicha chizing |
| Vertikal egri uchun K ni yozish | L ni yozing (K koʻrsatiladi) |
| Doiraviy va nosimmetrik vertikal egri chiziqlar | Faqat simmetrik parabolik egri chiziqlar |
| Bitta trassa uchun bittadan koʻp loyiha profili | Har bir variant uchun bitta trassa |
| Profil koʻrinishini kattalashtirish, profil ostidagi profil lentalari | Profil koʻrinishi butun trassaga moslashadi; uni [reja va profil varaqlari](topic:plan-profile-sheets) boʻyicha chop eting |
| DWG yoki LandXML dagi kesimlar | PDF dagi kesim varaqlari; maydonlar va hajmlarning {{ui:CSV}} si |
| Qiya namunaviy chiziqlar yoki yoʻl boʻylab turli kenglikdagi chiziqlar | Butun trassa uchun har ikki tomonda bitta kenglik |

## Koridorlar

| Hali qurilmagan | Buning oʻrniga, bugun |
|---|---|
| Oʻrta chiziqlar, toʻsiqlar va shablonlarni aylantiradigan superelevatsiya | Ularni shablon sifatida chizing ([Koridor shablonlari](topic:corridor-templates)); piket boʻyicha shablonlar hali superelevatsiyani qabul qilmaydi |
| Ikki hudud shablonlari orasida silliq oʻtish (oʻtishlar, torayishlar) | Piketda shablonni almashtiring yoki torayish sifatida chizilgan chiziqqa kenglik maqsadini bering |
| Chekka atrofida aylantirish, LandXML dagi superelevatsiya | Doiraviy egri chiziqlarda superelevatsiya markaziy chiziq atrofida aylanadi; xususiyat chizigʻiga kenglik maqsadi bilan qatorni kengaytiring |
| Yon qiyaliklar uchun maqsadlar (chiziqqacha yoki yuzagacha yoritish), oʻz koridor yuzalari | Maqsadlar yoʻlka va yelka chekkalarini siljitadi ([Koridorlar](topic:corridor)); koridor loyihalangan yuzaga tekislanadi |
| LandXML roadway sifatida eksport qilingan koridorlar; IFC eksportida trassada ikkinchi koridor | Taklif etilgan yuza eksport qilinadi |
| 3D da yoki kesimlarda taklif etilgan yuzani oʻzgartiradigan yer shablonlari | Ular har bir qatlamning maydonlari va hajmlarini beradi ([Yer shablonlari](topic:corridor-templates#terrain-templates)) |
| Tezlik, shina sirpanishi, burilish vaqti, burilish treylerlari yoki kuzov bilan tozalash bilan burilish trayektoriyalari; standart loyihalash transport vositalari kutubxonasi; transport vositasini sudrash bilan chizilgan burilish trayektoriyasi | Xususiyat chizigʻi yoki trassa boʻylab past tezlikdagi burilish trayektoriyalari, oʻz transport vositasi oʻlchamlari bilan ([Transport vositasi burilish trayektoriyalari](topic:swept-paths)) |

## Yer ishlari va hajmlar

| Hali qurilmagan | Buning oʻrniga, bugun |
|---|---|
| Pogʻonalar, loyihaga kiritilgan ochiq xususiyat chiziqlari, boshqa joydagi xususiyat chizigʻigacha tekislash | Xususiyat chizigʻini yoping ([Xususiyat chiziqlari](topic:feature-lines)) yoki uni mavjud yerning uzilish chizigʻi sifatida ishlating |
| Xususiyat chizigʻi uchini qoʻshish yoki olib tashlash | Chiziqni qayta chizing yoki uning bosqichli ofsetini yarating |
| Chizilgan uzilish chiziqlaridagi yoylar (nazorat nuqtalari orqali), xususiyat chiziqlaridagi spirallar | Yoylari bor xususiyat chizigʻini chizing va uni mavjud yerning uzilish chizigʻi sifatida ishlating |
| Masofa, balandlik yoki boshqa yuzagacha tekislash | Faqat mavjud yergacha yoritish |
| Platforma burchagini qoʻshish yoki olib tashlash | Platformani oʻchirib, qayta chizing |
| TIN-dan-TIN (prizma) hajmlari, toʻr katakchasi oʻlchamini tanlash | Toʻr usuli, katakcha oʻlchami siz uchun tanlanadi |
| Kengayish va qisqarish, unumdor qatlam, qoplama qalinligi | Hisobot raqamlariga koeffitsientlarni oʻzingiz qoʻllang |
| Bepul tashish va qayta tashish xarajatlari, turli trassalar boʻylab tashish, rejaga qoʻyilgan qarz konlari va chiqindi joylari | Muvozanat nuqtalari, koʻchirilgan hajmlar va oʻrtacha tashish masofalari bilan massa tashish diagrammasi |

## Quvur tarmoqlari

| Hali qurilmagan | Buning oʻrniga, bugun |
|---|---|
| Loyihada bittadan koʻp tarmoq | Yomgʻir suvi va maishiy uchun alohida loyihalar |
| Suv magistrallari: suv sifati va yoshi, qoidaga asoslangan boshqaruv, boshqa klapan turlari (oqim nazorati, drossel, ushlab turish), quvvat bilan berilgan nasoslar, bosimga bogʻliq talab, Darsi–Veysbax varianti, devor qalinliklari va bosim sinflari bilan quvur katalogi. Bosimli tarmoqlarning qolgan qismi laboratoriyada: [Suv magistrallari](topic:water-mains) | Bularni suv taqsimoti dasturida tekshiring; maishiy loyihalash oqimlari [Maishiy loyihalash oqimlari](topic:sanitary-design) da |
| Vaqt boʻyicha kanalizatsiya oqimlari (gidrograflar, dinamik marshrutlash, saqlash, nasoslar, toʻkilishlar) | [Maishiy loyihalash oqimlari](topic:sanitary-design) loyiha varaqasi uchun barqaror choʻqqi oqimini beradi |
| Kirish sigʻimi, nov tarqalishi, retensiyali marshrutlash, gidrograflar, bitta tugun koeffitsientidan boshqa energiya yoʻqotishlari | Ularni boshqa dasturda tekshiring; oqimlar, oʻlchamlar va gidravlik chiziqlar [Yomgʻir suvi drenaji](topic:storm-drainage) da |
| Rejali PDF, DWG, DXF yoki LandXML dagi suv yigʻish hududlari; yuzadan suv yigʻish hududlari (suv ajratkichlar) | Suv yigʻish hududlarini qoʻlda chizing; ular loyiha faylida saqlanadi |
| Quvur kataloglari, dumaloq boʻlmagan quvurlar, yuqoriga qaragan quti yoki silindr boʻlmagan inshootlar (konuslar, pogʻonalar, sekinlashish), kutubxonada drenaj toifasi | Parametrlardan inshoot turlari ([Quvur tarmogʻi](topic:pipe-network)); diametrli quvurlar |
| Profil koʻrinishidagi quvurlar, egri quvurlar | Oʻng panelda pastki nuqtalar va qoplamani oʻqing |

## Uchastkalar

| Hali qurilmagan | Buning oʻrniga, bugun |
|---|---|
| Uchastkalarni maydon yoki old chiziq boʻyicha joylashtirish, atrofdagi chiziqlardan uchastkalar, yoʻl huquqi | Har bir uchastkani burchaklari boʻyicha chizing yoki uning yozuvlarini kiriting |
| Rejadagi egri chiziqlar va chiziqlar jadvallari; qoʻlda koʻchirilgan yorliqlar | Har bir yoʻnalish oʻz boʻylab yorliqlanadi |
| LandXML dagi uchastkalar | Uchastkalar loyiha faylida saqlanadi va PDF, DWG va DXF ga chiqadi |

## Traversalar

| Hali qurilmagan | Buning oʻrniga, bugun |
|---|---|
| Eng kichik kvadratlar boʻyicha tuzatish, transit qoidasi, burchaklarni masofalarga nisbatan ogʻirlashtirish | Kompas qoidasi |
| Egilish burchaklari, zenit burchaklari va qiyalik masofalari, trigonometrik nivelirlash boʻyicha balandliklar | Gorizontal masofalar va burchaklarni toʻgʻri qisqartiring yoki yoʻnalishlarni ishlating |
| Yon nuqtalar, maʼlumot yigʻuvchilarning xom maʼlumot fayllari | Nuqtalarni nuqta fayli sifatida import qiling |

## Belgilash (staking)

| Hali qurilmagan | Buning oʻrniga, bugun |
|---|---|
| Ofset belgilari (belgidan orqaga qoʻyilgan tayanch nuqtalari), tutish nuqtasida qiyalik belgilari | Kerakli ofsetlarda belgilang, jumladan yelkadan tashqarida |
| Belgilarni toʻgʻridan-toʻgʻri maʼlumot yigʻuvchining oʻz formatiga yuborish | CSV koʻpchilik maʼlumot yigʻuvchilarning ofis dasturida ochiladi |
| Quvurlar, platformalar va uchastkalarni belgilash | Trassa yaqinidagi geodezik nuqtalardan yoki uchastka yozuvlaridan foydalaning |

## Fayllar va chiqish

| Hali qurilmagan | Buning oʻrniga, bugun |
|---|---|
| DWG yoki DXF dagi matn, shtrixlar va oʻlchamlar; qogʻoz fazosi; bogʻlangan chizmalar (xref); ikkilik DXF | Model fazosidagi chiziqlar ochiladi ([DWG yoki DXF ni chiziqlar sifatida ochish](topic:open-dwg-dxf)); bogʻlangan chizmalarni alohida oching |
| Bir nechta nuqtani sudrab bir vaqtda koʻchirish | Ularni kesib qoʻying va joylashtiring yoki bittalab tahrirlang |
| Portret varaqlar, oʻzingizning sarlavha bloklaringiz, joylashtiradigan viewportlar, DWG dagi reja va profil varaqlari | Har bir PDF uchun bitta gorizontal reja varaqasi yoki trassa boʻylab reja va profil varaqlari (PDF) |
| Balandlik lentalari va profillarni chop etish | Lentalar faqat ekranda; kerak boʻlsa skrinshot oling |
| Qatlam nomlari, ranglari yoki yorliq uslublarini oʻzgartirish | DXF eksportidan keyin ularni CAD dasturida oʻzgartiring |
| Bulutga saqlash va versiyalar tarixi | `.civilcraft.json` fayllarini saqlang va zaxiralang; bir loyihani birgalikda ishlash uchun CadCraft Studio da jonli seans ishlating ([Saytni birgalikda jonli loyihalash](topic:work-live)) |
| iPad va iPhone uchun CadCraft Studio hamda Google Play dan | Qurilmada brauzerda CivilCraft ni ishlating; Android da CadCraft Studio ni getcadcraft.com/download dagi APK dan oʻrnating |
| Bir vaqtning oʻzida bir nechta nuqta yoki loyiha faylini ochish | Har bir ochiq holatda bitta fayl (bir-biriga tegishli GIS fayllari, masalan shapefayl qismlari, birga ochiladi) |

## Landshaft

| Hali qurilmagan | Buning oʻrniga, bugun |
|---|---|
| Ishlab chiqaruvchilarning boshlari va nozillari | Umumiy boshlar yoki fayldan oʻz boshlaringizni qoʻshing; ishlab chiqaruvchi maʼlumotlari ruxsat berilganda kiritiladi |
| Tomchi chiziqlari uchun maksimal yon uzunliklar, vaqt boʻyicha oqimlar, nasoslar, halqali quvur tarmoqlari | Tomchi yoʻllarini ishlab chiqaruvchi eʼlon qilgan uzunlikda saqlang; tekshiruv tarmoq tarmoqlanishini talab qiladi |
| Konkav erkin shaklli obyektning aniq konturi; uning yer ostidagi hajmini aniq oʻlchash | Qavariq qobiq tekislanadi va yer ostidagi hajm taxminiy (Xususiyatlarda aytiladi) |
| BimCraft va ModelCraft ning oʻz Kutubxonadan joylashtirish funksiyasidagi oʻsimliklar | Landshaft IFC ni eksport qiling va uni BimCraft da bino yonida oching |
| 3D koʻrinishdagi batafsil oʻsimlik modellari (barglar, shoxlar, fasllar); 3D koʻrinishdagi erkin shaklli obyektlar va sugʻorish | 3D da oʻsimliklar oʻsimliklar roʻyxatidan olingan oddiy shakllar sifatida koʻrsatiladi ([Saytni 3D da koʻring](topic:site-3d)); ModelCraft ning sochilishi rasmlarni yaratadi |
| Ularning orqasidagi tekislangan sathni yuzada ushlab turadigan devorlar | Platforma yoki platformaga vertikal tomonlar bering: ular yuzadagi tayanch devorlar boʻladi ([Yer ishlari](topic:grading)) |
| Oʻz belgilaringizdagi SVG transformatsiyalari; oʻz GLB oʻsimlik modellaringizning teksturasi va ranglari; siqilgan GLB geometriyasi | Avval chizmangizda transformatsiyalarni yoying; modellar oʻsimlik rangida chiziladi; GLB ni siqmasdan eksport qiling ([Oʻsimlik grafikasi](topic:plant-graphics)) |
| Kutubxona hisobingizda saqlangan oʻz oʻsimliklar roʻyxati (ilovada tahrirlanadi) | Loyihaning oʻz roʻyxatini Oʻsimliklar jadvalida tahrirlang va oʻsimliklar fayli sifatida saqlang |
| Oynasiz yordamchilar uchun landshaft vositalari (fayl serveri va buyruqlar satri) | CivilCraft oynasi ochiq boʻlganda ishlaydi ([Sayt bilan AI yordamchisini ishlating](topic:assistants)) |

## Elektr liniyalari

| Hali qurilmagan | Buning oʻrniga, bugun |
|---|---|
| Mamlakatning standarti oʻrnatilgan holda (yuklama holatlari, masofalar, koeffitsientlar) | Standartingiz qiymatlarini {{ui:Yuklama holatlari va chegaralar…}} da belgilang va ularni kutubxonangiz bilan birga paket sifatida saqlang, qayta ishlatish va ulashish uchun ([Paketlar](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Simdan daraxt tojigacha yoki liniya yonidagi devorgacha yon masofa | Liniya kesib oʻtgan oʻsimliklar va devorlar ustidagi tik masofa ([Elektr liniyasi tekshiruvlari](topic:power-line-checks#clearances)) |
| Oʻtkazgichning sekin choʻzilishi va yangi oʻtkazgichning cho'zilishi | Ularni taranglash jadvalidagi haroratlar orqali hisobga oling |
| Koʻmilgan kabellarning issiqlik reytingi (ularning yotqizilishidan kelib chiqadigan tok reytingi) | Kabel elementiga yetkazib beruvchingizning tok reytingini kiriting |
| Qisqa tutashuv, himoya va yerga ulash tadqiqotlari | Maxsus elektr dasturidan foydalaning; CivilCraft tarmoqning uzunliklari va kabellarini beradi |
| Har bir elementi alohida loyihalangan panjarali minoralar va tuproqdagi ushlab turuvchi ankerlar | Tayanchlar nominal yuk boʻyicha tekshiriladi; tayanch simlari nominal yuk boʻyicha |
| Uni oʻqiydigan dasturda tekshiriladigan `.DON` tadqiqot fayli | Faylni oʻsha yerda tekshiring; haqiqiy fayl bilan sinash uchun namuna yuboring |
| Uch oʻlchamli koʻrinish va IFC dagi elektr liniyalari | Reja, liniya profili, varaqlar va GIS qatlamlari |
| Oynasiz yordamchilar uchun elektr liniyasi vositalari | CivilCraft oynasi ochiq boʻlganda ishlaydi ([Sayt bilan AI yordamchisini ishlating](topic:assistants)) |

## Qurilish massalari

| Hali qurilmagan | Buning oʻrniga, bugun |
|---|---|
| Zonalash kodlari yoki istalgan shahar qoidalari kutubxonasi | Chegaralarni oʻz nizomingizdan kiriting ([Zonalash chegaralari](topic:zoning-limits)) |
| Devorlardagi yorugʻlik (fasad yorugʻligi), shamol | [Quyosh soatlari](topic:sun-hours) faqat toʻgʻri quyoshni hisoblaydi |
| Daraxtlar, oʻsimliklar yoki massa sifatida chizilmagan narsalardan soya | Qoʻshni binolarni massa sifatida chizing |
| Massalardagi tom shakllari | Tekis tepali massalar |
| BimCraft da massa ishlab chiqilganda teshiklar, tomlar va devor turlari | BimCraft har bir qavat va pol uchun oddiy tashqi devorlar quradi; qolganini oʻsha yerda qoʻshing |

## GIS va koordinatalar tizimlari

| Hali qurilmagan | Buning oʻrniga, bugun |
|---|---|
| File Geodatabase; KML uslublari, belgilari, yer qoplamalari va tarmoq bogʻlanishlari | Avval GeoPackage, shapefayl yoki GeoJSON ga konvertatsiya qiling; KML belgilari uslublarsiz oʻqiladi |
| GIS obyektlari yoki ularning atributlarini tahrirlash | GIS dasturida tahrirlang va qayta import qiling. Tahlil paneli yangi qatlamlar yaratadi (bufer, qoplama, birlashtirish, tanlov) va maydon va uzunlik maydonlarini qoʻshadi, lekin obyektni joyida tahrirlamaydi |
| Tarmoq va rastr tahlili, tekis yoki kvadrat uchli va bir tomonli buferlar, atribut jadvalida qator qoʻshish yoki oʻchirish va maydon turini oʻzgartirish, qoʻlda sinf ranglari, grafikalarda uslub legendasi | Obyektlarni tanlash uchun Tanlash dan foydalaning va ulardan qatlam yarating; tekis uchlar taklif etilmaydi. Atribut boʻyicha rang berish va atribut jadvali tayyor: [Qatlamni atribut boʻyicha uslublash](topic:gis-symbology) va [Qatlam atribut jadvali bilan ishlash](topic:gis-table) ga qarang |
| Yorliq uslublari (oʻlcham, joylashuv) va bir-biridan qochadigan yorliqlar | Yorliqlar bitta oʻlchamda va obyektlar zich boʻlganda ustma-ust tushishi mumkin |
| Vertikal datumlar va geoid modellari | Balandliklar fayl bergan holda ishlatiladi; vertikal datumni oʻzingiz tekshiring |
| Hudud boʻyicha taklif etilgan NAD27 dan NAD83 gacha boʻlgan panjara siljishlaridan tashqari (OSTN15, boshqa datumlar uchun NTv2 fayl qoʻshganda ishlaydi), bir vaqtda bir nechta panjara, vertikal panjaralar | Datumingiz uchun panjara faylini oʻzingiz qoʻshing; loyihada bitta panjara |
| DXF yoki 3D eksportdagi xarita qatlamlari | Xarita qatlamlari PDF chop etishga kiradi va DWG yonida rasm sifatida |
| Kirish talab qiladigan xarita serverlari, kalit yoki token | Ochiq xizmatlardan foydalaning yoki geografik bogʻlangan rasm faylidan |
| Yuza, yer modeli yoki balandlik panjarasi va LiDAR vositalaridan LAS yoki LAZ fayllarini yozish | Yuzalarni GeoTIFF balandlik panjarasi sifatida eksport qiling. [Nuqta bulutlari](topic:point-clouds) qoʻshimchasi tozalangan bulutni LAS 1.4 yoki LAZ sifatida yozadi |
| LiDAR intensivligi, rangi va qaytishlari; bir nechta polosali balandlik panjaralari; 200 MB dan katta panjara yoki LiDAR fayllari | LiDAR faqat sinf boʻyicha filtrlanadi, panjaralar birinchi polosasidan foydalanadi; katta fayllarni avval plitkalarga boʻling |

## Kiritish

| Hali qurilmagan | Buning oʻrniga, bugun |
|---|---|
| Teginish orqali quti tanlash ({{key:Shift}} kerak) | Har bir geodezik nuqtani uzoq bosib qoʻshing |
| Chizish paytida yozilgan koordinatalar yoki masofalar | Taxminiy chizing, soʻng trassaning PI jadvalida aniq PI koordinatalarini yozing |
| Platforma burchaklari va inshootlar uchun koordinatalarni yozish | Ularning tutqichlarini sudrang; aniqlik uchun yaqinlashtiring va holat panelida E va N ni kuzating |
| Obyektlarga yopishish (uzilish chiziqlari uchun geodezik nuqtalardan tashqari) | Yaqinlashtiring va holat panelini kuzating |

## 3D koʻrinish

| Hali qurilmagan | Buning oʻrniga, bugun |
|---|---|
| 3D koʻrinishda chizish yoki tahrirlash | Rejada chizing va tahrirlang; 3D koʻrinish har bir tahrirni kuzatib boradi |
| 3D da bosib korridor xususiyat chiziqlari yoki GIS obyektlarini tanlash | Ularni rejada bosing |
| Oshirilgan koʻrinish yoki futda eksport qilish | Eksportlar metrda haqiqiy masshtabda; [Saytni 3D da eksport qiling](topic:export-3d) ga qarang |
| GLB yoki OBJ eksportdagi yorliqlar, 3D dagi yorliq oʻlchamlari va uslublari | Yorliqlar faqat 3D koʻrinishda, bitta oʻlchamda; [Saytni 3D da koʻring](topic:site-3d) ga qarang |
| Fotosuratdan teksturalar, yurishni video sifatida yozib olish, sayt tashqarisidagi soyalar, 3D koʻrinishda quyosh soatlari | Yuzalarga yoyilgan xarita qatlamlari; bir vaqtning oʻzida haydash va quyoshning joylashuvi; kun yoki fasl uchun [quyosh soatlari](topic:sun-hours) rejada |
