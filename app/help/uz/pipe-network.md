---
title: Gravitatsion quvur tarmogʻini loyihalash
summary: Yomgʻir suvi yoki maishiy quvur yoʻllarini inshoot-inshoot boʻyicha chizing, qiyalik, qoplama va tushish qoidalaringizni belgilang, CivilCraft tub balandliklarni oʻrnatsin va u koʻrsatgan muammolarni tuzating.
keywords: inshoot quruvchisi, inshoot turi, toʻrtburchak inshoot, quduq, rama, qoplama, devor qalinligi, kutubxona elementi, quvur tarmogʻi, yomgʻir suvi, maishiy, kanalizatsiya, inshootlar, quduqlar, kirish inshootlari, tub balandliklar, qoplama, qiyalik, tushish, yuqori chekka, choʻkma, gravitatsion quvurlar
from: 10a3c14d
---

Loyihada bitta gravitatsion quvur tarmogʻi boʻladi: yomgʻir suvi yoki maishiy. U inshootlardan (quduqlar, kirish inshootlari) va ular orasidagi toʻgʻri quvurlardan tashkil topadi. Oqim chizgan yoʻnalishingiz boʻylab ketadi. CivilCraft har bir quvur va inshootni siz belgilagan uchta qoida bilan tekshiradi va barcha tub balandliklarni shu qoidalardan oʻrnatishi mumkin.

## Yoʻlni chizish

Yer sathisiz ham quvurlarni chizishingiz mumkin, lekin chekka balandliklar, qoplama va avtomatik tub balandliklar uchun u kerak.

1. {{key:P}} ni bosing yoki **Loyihalash** guruhidagi {{ui:Quvurlar}} ni bosing.
   Ishora shunday deydi: «Quvurlar: oqim yuqoridan pastga qarab inshootlarni bosing (mavjud inshootni bosib qoʻshing). Enter tugatadi.»
2. Yuqoridagi inshoot qayerga tushishini bosing. Inshoot joylashtiriladi.
3. Har bir keyingi inshootni pastki oqimga bosing. Mavjud inshootga ulanish uchun uning ustiga bosing: holat paneli «S3 ga ulandi» deydi.
4. {{key:Enter}} ni bosing.
   Quvurlar chiziladi, tub balandliklar qoidalardan oʻrnatiladi va holat paneli masalan shunday deydi: «3 ta quvur chizildi, 12 ta tub balandlik qoidalardan oʻrnatildi; barcha tekshiruvlar oʻtdi.»

Yangi inshootlar S1, S2 … deb nomlanadi va 48 in (1200 mm) diametrga ega. Yangi quvurlar P1, P2 … deb nomlanadi va 12 in (300 mm) diametrga ega. Futli loyihada diametrlar dyuymda, metrli loyihada millimetrda.

{{key:Enter}} bilan tugating. Ikki marta bosish ham ishlaydi, lekin mavjud inshootda ikki marta bosib yurishni shu yerda tugatsangiz, ulanish tashlanadi: uni bir marta bosing, keyin {{key:Enter}} ni bosing.

## Qoidalaringizni belgilang

Hech narsa tanlanmaganda, oʻng panelda (**Loyiha**) **Quvur tarmogʻi** bloki bor:

| Sozlama | Boshlangʻich qiymat | Maʼnosi |
|---|---|---|
| Turi | Yomgʻir suvi | {{ui:Yomgʻir suvi}} yoki {{ui:Maishiy}}; LandXML ga yoziladi |
| Eng kichik qiyalik | 0.50% | Har bir quvur kamida shuncha pasayishi kerak |
| Eng kichik qoplama | 2 ft (0.6 m) | Yerdan quvur tepasigacha, butun quvur boʻylab |
| Inshootlardagi tushish | 0.10 ft (0.03 m) | Chiqish tub balandligi har bir kirish tub balandligidan kamida shuncha pastda boʻlishi kerak |

**Bu boshlangʻich qiymatlar vaqtinchalik, standart emas.** Agentligingiz yoki loyihangiz talab qilgan qiymatlarni kiriting. Qoplama yerdan tepaga (tub balandlik va ichki diametr) oʻlchanadi; devor qalinligi hisobga olinmaydi. Platformalar yoki koridorlar tekislangan joyda tekislangan yuza yer hisoblanadi.

## CivilCraft tub balandliklarni oʻrnatsin

- {{ui:Barcha tub balandliklarini qoidalar boʻyicha oʻrnatish}} (**Quvur tarmogʻi** blokida) barcha quvurlarni oʻrnatadi.
- {{ui:Tub balandliklarini qoidalar boʻyicha oʻrnatish}} (bitta quvur tanlanganida) faqat shu quvurni oʻrnatadi.

Pastki oqimga qarab, har bir yoʻl yuqori inshootida kamida qoplamadan boshlanadi, kamida eng kichik qiyalikka tushadi, har bir inshootdan tushishni kamida oʻtkazadi va quvur boʻylab yer eng kichik qoplamadan kamroq qoldiradigan joyda chuqurroq boʻladi. Tub balandliklar 0.01 gacha pastga yaxlitlanadi, hech qachon yuqoriga emas. Holat paneli «Tub balandliklar oʻrnatildi: har bir yoʻl yuqori uchida eng kichik qoplama, kamida eng kichik qiyalik, har bir inshootda kamida tushish.» deydi yoki nima qila olmaganini aytadi.

## Inshootlar va quvurlarni tahrirlash

{{ui:Tanlash}} bilan inshoot yoki quvurni bosib, uni oʻng panelda koʻring.

**Inshoot**: **Nomi**, **Chekka**, **Choʻkma chuqurligi**, **Diametr**, soʻng **Ishlatilgan chekka**, **Choʻkma**, **Sharqiy** va **Shimoliy**, hamda kiruvchi va chiquvchi quvurlar va ularning tub balandliklari.

- **Chekka** ni boʻsh qoldiring, u yer sathidan olinadi; keyin quti yer qiymatini kulrang rangda koʻrsatadi. Chekkani belgilash uchun qiymat kiriting.
- Rejada inshootning tutqichini sudrab uni koʻchiring. Uning quvurlari unga ergashadi; ularning tub balandliklari oʻz holatida qoladi, shuning uchun keyin muammolarni tekshiring.

**Turi**: tarmoqning inshoot turlaridan birini (quyida) yoki oʻz diametriga ega dumaloq inshoot uchun hech birini tanlang.

**Quvur**: **Nomi**, u oraliq boʻlgan inshootlar, **Diametr**, **Yuqori tub balandlik**, **Pastki tub balandlik**, soʻng **Uzunlik**, **Qiyalik** va **Eng kichik qoplama**.

Har bir qiymatdan keyin {{key:Enter}} ni bosing.

## Muammolarni oʻqing va tuzating

**Quvur tarmogʻi** bloki har bir muammoni roʻyxatlaydi (40 tagacha); uni bosib quvur yoki inshootni tanlang. Tanlangan quvur yoki inshoot oʻzinikini roʻyxatlaydi. Hech biri boʻlmasa, «Har bir quvur va inshoot qoidalardan oʻtadi.» deydi.

| Xabar (misollar) | Nima qilish kerak |
|---|---|
| «P2 tepalikka qarab ketadi (-0.40%).» yoki «… tekis …» | Tub balandliklarni almashtiring yoki ularni qoidalardan oʻrnating. |
| «P2 0.30% bilan minimal 0.50% dan tekisroq.» | Pastki oqimdagi tub balandlikni pasaytiring yoki yuqori oqimdagisini koʻtaring. |
| «P3 boʻylab 35 ning 1.40 qoplamasi bor, bu minimal 2 dan kam.» | Quvurni pasaytiring; tub balandliklarini qoidalardan oʻrnating. |
| «S3 da, P4 245.20 da chiqadi, bu P3 245.25 dan kirgan 0.1 dan kam.» | Chiqish quvurining yuqori tub balandligini pasaytiring. |
| «P1 ning tepasi S1 ning chekkasidan yuqori.» | Quvur inshoot uchun juda baland. |
| «S2 dan 2 ta quvur chiqadi; gravitatsion tarmoqda har bir inshootdan bitta chiqish boʻlishi kerak.» | Bitta chiquvchi quvurni olib tashlang yoki uni toʻgʻri yoʻnalishda qayta chizing. |
| «Quvurlar halqa hosil qiladi; oqim chiqishda tugashi kerak.» | Yoʻl oʻzi ichiga qaytib chizilgan; bitta quvurni oʻchiring. |
| «S5 yer sathidan tashqarida va chekka balandligi yoʻq.» | Chekkani kiriting yoki inshootni yer ustiga koʻchiring. |
| «P6 qisman yer sathidan tashqarida; u yerdagi qoplama nomaʼlum.» | Yuzani kengaytiring yoki u yerda qoplama tekshirilmasligini qabul qiling. |
| «P7 da hali tub balandliklar yoʻq.» | Ularni kiriting yoki qoidalardan oʻrnating. |

Muammoli quvurlar va inshootlar rejada ham qizil rangda belgilanadi.

## Inshoot turlari

Inshoot turi uning parametrlaridan qurilgan inshoot: quduq, kirish inshooti, birlashma quti yoki chiqish, **dumaloq** (ichki diametr) yoki **toʻrtburchak** (ichki kenglik va uzunlik), **devor qalinligi**, **pol plitasi**, eng past quvurdan pastdagi **choʻkma** va **rama va qopqoq** (dumaloq yoki toʻrtburchak ochiq, rama balandligi). Turlar tarmoqqa tegishli, loyiha Xususiyatlarida **Inshoot turlari** ostida.

1. {{ui:Yangi inshoot turi}} ni bosing. Oynada yozganingizda inshoot rejada va kesimda chiziladi.
2. {{ui:Turni qoʻshish}} ni bosing.
3. Inshootni tanlang va **Turi** ostida turni tanlang. U turning oʻlchamini va choʻkmasini oladi; uning oʻz choʻkmasini hali ham oʻzgartirish mumkin.

Turni tahrirlasangiz, shu turdagi har bir inshoot uning oʻlchamlariga ergashadi. Turni olib tashlasangiz, uning inshootlari bir xil kenglikdagi dumaloq inshootlar boʻlib qoladi. Har bir oʻzgarish bitta qadam: {{key:Mod+Z}} uni bekor qiladi.

Toʻrtburchak inshoot rejada, DXF, DWG va PDF da chiziladi, 3D da esa uzunligi chiquvchi quvuri boʻylab boʻlgan toʻrtburchak sifatida; quvurlar uning devoridan boshlanadi. LandXML uni devor qalinligi bilan toʻrtburchak inshoot (`RectStruct`) sifatida yozadi va bunday inshootlarni turlar sifatida qayta oʻqiydi.

### Turni kutubxona orqali ulashish

{{ui:Kutubxona elementi sifatida saqlash}} turni CadCraft kutubxona elementi sifatida yozadi (`.json` fayli): uning rejadagi belgisi, taxminiy chuqurlikkacha 3D jism va barcha oʻlchamlar. Ulashish uchun uni kutubxonaga yuklang. {{ui:Kutubxona elementini ochish}} shu tarzda saqlangan inshootni tarmoqqa qaytaradi, loyihaning birliklariga aylantirilgan holda. CivilCraft da yasalmagan inshoot boʻlmagan kutubxona elementlari sababi bilan rad etiladi.

## Oʻchirish

Quvurni tanlab, uni olib tashlash uchun {{key:Delete}} ni bosing. Inshootni oʻchirish unga ulangan quvurlarni ham oʻchiradi. Mac da Fn va Delete tugmalarini bosing yoki {{ui:Oʻchirish}} ni bosing.

## Hali qurilmagan

Oqimlar, quvur oʻlchamlari va gidravlik gradient chiziqi [Yomgʻir suvi drenaji](topic:storm-drainage) da. Quvur katalogi, dumaloq boʻlmagan quvurlar, profil koʻrinishidagi quvurlar, egri quvurlar va loyihada bittadan koʻp tarmoq hozircha mavjud emas. Qarang: [Hali qurilmagan](topic:not-built-yet).
