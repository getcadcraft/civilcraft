---
title: Daryo suv sathi profillari
summary: Daryoni yer yuzasidan modellashtiring va standart qadam usulida barqaror suv sathi profillarini hisoblang: suv sathlari, energiya, tezliklar, Frud sonlari va reja ustida suv bosish maydoni. Laboratoriya funksiyasi; har bir natija muhandis tekshiruvidan oʻtishi kerak.
keywords: dayka, samarasiz oqim maydoni, kesim muharriri, daryo, gidravlika, suv sathi profili, orqaga suv koʻtarilishi, standart qadam, barqaror oqim, 1D, kundalang kesimlar, manning, gʻadir-budurlik, oʻtkazuvchanlik, kritik chuqurlik, normal chuqurlik, frud, energiya gradient chizigʻi, suv bosish maydoni, toshqin hududi, suv bosish, sohil stansiyalari, qirgʻoq stansiyalari, uchastka uzunliklari, siqilish, kengayish, tinch oqim, tez oqim, aralash rejim, gidravlik sakrash
from: fb8bf425
---

CivilCraft daryo boʻylab barqaror, bir oʻlchamli suv sathi profillarini hisoblaydi: siz bergan har bir oqim uchun har bir kundalang kesimdagi suv sathi, qoʻshni kesimlar orasidagi energiya balansidan (standart qadam usuli). Funksiya tekshirilayotganda laboratoriyada turadi.

**Faqat loyihalash yordami.** Suv sathlariga hech kim tayanishdan oldin malakali muhandis koʻrib chiqishi kerak: 1D model faqat oʻz kesimlari, gʻadir-budurlik qiymatlari, uchastka uzunliklari va chegaralari kabi yaxshi boʻladi, u koʻprik, suv oʻtkazgich yoki daryodan chiqqan oqimni bilmaydi.

## Daryoni chizish

1. Avval mavjud yer yuzasini yarating (nuqtalar, buzilish chiziqlari yoki ochgan TIN).
2. **Yuza** › {{ui:Yana}} ostida {{ui:Daryo}} ni tanlang.
3. Daryo oʻq chizigʻi boʻylab **yuqori oqimdan quyi oqimga** bosing, soʻng {{key:Enter}} ni bosing yoki ikki marta bosing.

CivilCraft har 50 m (200 ft) da, ikki tomonga 100 m (300 ft) masofada, yer yuzasidan oʻq chizigʻiga perpendikulyar kesim chizadi. Daryo stansiyalari quyi oqim uchidan oʻlchanadi, shuning uchun ular yuqori oqim tomon oshib boradi. Qirgʻoqlar har bir kesimning eng past nuqtasidan ikki tomonda 10 m (30 ft) masofada taxminiy qoʻyiladi.

Daryo torayadigan yoki inshoot joylashgan joyda kesim qoʻshish uchun daryoni tanlang, {{ui:Kesim qoʻshish}} ni bosing va uning boʻylab kesish chizigʻini chizing (istalgan yoʻnalishda: u quyi oqimga qarab chapdan oʻngga yoʻnaltiriladi).

## Daryoni sozlash

Daryoni tanlab, uni **Xossalar** da koʻring:

- **Oqim rejimi**: tinch (subkritik; odatdagi holat: quyi oqim chegarasidan yuqoriga hisoblanadi), tez (superkritik; yuqori oqim chegarasidan pastga hisoblanadi) yoki aralash (ikkalasi, soʻng har bir kesimda katta solishtirma kuchga ega boʻlgani; oldindan koʻrish).
- **Oqim profillari**: har biri uchun nom va oqim (masalan, 10 yillik va 100 yillik oqim) hamda quyi oqim uchidagi chegara (rejim tinch boʻlmaganda yuqori oqim uchidagi ham): energiya qiyaligi bilan **Normal chuqurlik** (yotoq qiyaligi birinchi taxmin), **Maʼlum suv sathi** balandligi yoki **Kritik chuqurlik**.
- **Yer yuzasidan kesimlar**: oraliq, chap va oʻngga qancha masofa, qirgʻoq taxmini va ikkita Manning n qiymati; {{ui:Kesimlarni qaytadan kesish}} kesimlarni almashtiradi (bitta ortga qaytarish qadami).
- **Kesimlar jadvali**: har bir kesim uchun chap va oʻng qirgʻoq siljishlari, oʻzan n va qirgʻoq oldi n, keyingi quyi oqim kesimgacha uchastka uzunliklari (chap qirgʻoq oldi, oʻzan, oʻng qirgʻoq oldi; rejadan boshlab oʻlchanadi) hamda siqilish va kengayish koeffitsiyentlari (boshida 0.1 va 0.3: silliq oʻtishlar). {{ui:Tahrirlash}} kesim muharririni ochadi (keyingi boʻlim); undan keyingi nuqta kesimda dayka yoki samarasiz maydon borligini bildiradi.

Har bir oʻzgarish bitta ortga qaytarish qadami ({{key:Mod+Z}}).

## Kesimni tahrirlash: qirgʻoqlar, daykalar va samarasiz maydonlar

{{ui:Tahrirlash}} kesimda uning yer yuzasini chizadi va yechuvchi oʻqiydigan narsalarni sudrash imkonini beradi: **chap va oʻng qirgʻoq** (kesimni chap qirgʻoq oldi, oʻzan va oʻng qirgʻoq oldiga boʻladi), har ikki tomondagi **dayka** va **samarasiz oqim maydonlari**. Har bir tutqichni strelka tugmalari bilan ham surish mumkin, har bir raqamni esa grafik yonida yozish mumkin. {{ui:Qoʻllash}} bitta ortga qaytarish qadamidir.

- **Dayka**ning oʻrni (siljish) va tepa balandligi bor. Undan narigi, daryodan uzoqdagi yer suv sathi tepadan past boʻlganda daryodan ajratiladi: uning maydoni, hoʻllangan perimetri va oʻtkazuvchanligi hisobga olinmaydi. Tepadan yuqorida butun kesim yana hisobga olinadi. Dayka oʻzi himoya qilayotgan qirgʻoqdan tashqarida turadi; qirgʻoqlar ichida joylashgani belgilanadi.
- **Samarasiz oqim maydoni** suvni ushlab turadi, lekin oqim olib oʻtmaydi (koʻtarma orqasidagi choʻntak, koʻprik yoʻlagi yonidagi oʻlik suv). Uning ikki siljishini bering va xohlasangiz, undan past boʻlganda samarasiz boʻladigan suv sathini (boʻsh qolsa {{ui:doim}}): bu sathdan yuqorida u qolganlar kabi oqadi. Asosiy oʻzanning bir qismini egallagani belgilanadi.
- Ikki kesim orasida suv bosish maydoni ikkala kesimda bor dayka orqasidagi yerni quruq qoldiradi, oʻsha yerda suv sathi tepadan past boʻlganda (ikki tepa orasidagi chiziq toʻgʻri).

## Hisoblash va natijalarni oʻqish

{{ui:Suv sathi profillari}} ni bosing. Tanlagan profil uchun quyidagilarni olasiz:

- daryo boʻylab **grafik** (oqim chapdan oʻngga): oʻzan tagi, qirgʻoqlar, suv sathi, energiya gradient chizigʻi va kritik suv sathi; kritik chuqurlikda ushlab turilgan kesimlar aylana bilan belgilanadi;
- har bir kesim uchun **jadval**: daryo stansiyasi, oqim, oʻzan tagi, suv sathi, kritik suv sathi, energiya gradient chizigʻi, chuqurlik, oʻzandagi va umumiy tezlik, oʻzan Frud soni, oqim maydoni, yuqori kenglik, har bir qirgʻoq oldidagi va oʻzandagi oqim, energiya qiyaligi hamda ogohlantirishlar;
- **ogohlantirishlar** oddiy soʻzlarda, masalan, kritik chuqurlikka qoʻyilgan kesim, kesim uchlaridan oshgan suv yoki ikki kesim orasida oʻtkazuvchanlikning katta oʻzgarishi (orasiga kesim qoʻshing).

{{ui:Jadval (CSV)}}, {{ui:Hisobot}} (usul, chegaralar va har bir jadval bilan oddiy matn) va {{ui:Grafik (SVG)}} yuklab olishlaringizga saqlanadi. Har birida tekshiruv qatori bor.

**Xossalar** da {{ui:Suv bosish maydonini koʻrsatish}} ni belgilang, tanlangan profil uchun rejada suvli hududni soyalash uchun; chuqurlik nolga teng boʻlgan joyda suv chizigʻi chiziladi. Kesimlar orasida suv sathi daryo boʻylab tekis va daryo stansiyasi bilan chiziqli oʻzgaradi. Dayka tepasidan past suv boʻlganda uning orqasidagi yer quruq qoladi. Daryo koridori ichidagi, suv yeta olmaydigan boshqa past yerlar (masalan, yoʻl koʻtarmasi orqasida) hali ham soyalanadi: tekshiring.

## Chizmada va Muammolarda

Daryo chiziqlari rejaga, PDF va DWG ga oʻz qatlamlarida tushadi: **C-WATR-CNTR** (oʻq chizigʻi), **C-WATR-SCTN** (har bir kesish chizigʻi, daryo stansiyasi bilan) va **C-WATR-FLOD** (suv bosish maydonining suv chizigʻi, profil uchun {{ui:Suv bosish maydonini koʻrsatish}} belgilanganda). Daryo ogohlantirishlari (kritik chuqurlikka qoʻyilgan kesim, kesim uchlaridan oshgan suv, qoʻshimcha kesimlarni talab qiladigan oʻtkazuvchanlik oʻzgarishi, yopilmagan energiya balansi, qirgʻoqlar ichidagi dayka) ham **Muammolar** paneliga tushadi: daryo haqida va ular kelib chiqqan kesimda joylashgan holda.

## Qanday hisoblanadi

- Ikki kesim orasidagi energiya: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Oʻtkazuvchanlik boʻlinish orqali: har bir qirgʻoq oldi oʻzgaruvchi n boʻyicha boʻlinadi, K = Σ (1/n)·A·R^(2/3) (AQSh birliklarida 1.486/n); oʻzan bitta boʻlak boʻlib, n oʻzgarsa kompozit n bilan. α oqimning qanday boʻlinishidan kelib chiqadi.
- Ishqalanish qiyaligi oʻrtacha oʻtkazuvchanlik boʻyicha, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², oqim bilan ogʻirlangan uchastka uzunligi boʻyicha.
- Quyi oqimga oqim tezlashganda siqilish koeffitsiyenti, sekinlashganda kengayish koeffitsiyenti.
- Kritik chuqurlik = eng kichik solishtirma energiya. Har bir suv sathi oraliqda yechiladi, shuning uchun u hech qachon kritik chuqurlikning notoʻgʻri tomoniga sakramaydi; yechim boʻlmasa, u kritik chuqurlikka qoʻyiladi va belgilanadi.

Dastur Manningning normal chuqurligi, toʻgʻri burchakli oʻzandagi kritik chuqurlik va Chou orqaga suv koʻtarilishi misoli (*Open-Channel Hydraulics*, 1959, 10-bob) bilan mustaqil integrallangan holda tekshirilgan. Xuddi shu usul keng tarqalgan 1D daryo dasturlarida qoʻllaniladi, shuning uchun qoʻlda hisoblash yoki talaba yozuvlari mos keladi.

## Suv oʻtkazgichlar va koʻpriklar

Daryo **Xossalar** ida, **Suv oʻtkazgichlar va koʻpriklar** boʻlimida {{ui:Suv oʻtkazgich qoʻshish}} yoki {{ui:Koʻprik qoʻshish}} uni ikki kesim orasiga qoʻyadi (har bir uchastkada kamida ikkitasi qoladi). Undan pastdagi profil oʻzgarmaydi; uning ustidagi suv sathi inshootdan keladi va profil shu yerdan yuqori oqimga davom etadi. **Natijalar** har bir inshoot uchun jadval qoʻshadi: quyi oqim suvi, yuqori oqim suv sathi, qaysi boshqaruv hukmronligi, teshik orqali oqim va yoʻl yoki palubasidan oshgan oqim. Faqat tinch oqim uchun.

- **Suv oʻtkazgich** (toʻrtburchak yoki dumaloq, bir yoki bir necha teng quvur). Kirish boshqaruvi kirish ochiq boʻlganda toʻsiq oqimi, u botganda orifis oqimi boʻladi; yuqori suvi koʻtarilishning bir va bir yarim barobari orasida aralashadi. Chiqish boshqaruvi energiya balansi: kirish yoʻqotishi, ishqalanish va chiqish tezlik boshi, quyi oqim suvi va kritik chuqurlikning oʻrta balandligi hamda tepa yuqorisidan kattasida, quvur boʻylab pasayishni ayirgan holda. Yuqori suv ikkisidan kattasidir. **Suv yoʻldan oʻtishi mumkin** ni belgilasangiz, yoʻlning toʻsiq oqimi quvurlar bilan oqimni boʻlishadi.
- **Koʻprik.** Teshik koʻprik ostidagi kesim boʻlib, tayanchlarda kesilgan, har bir ustun oqim olib oʻtmaydigan maydon sifatida. Teshikdagi suv sathi pastdagi kesimdan (kengayish koeffitsiyenti), yuqoridagi kesim esa teshikdan (siqilish koeffitsiyenti) keladi. Agar teshik bu quyi oqim suvida oqimni oʻtkaza olmasa, u kritik chuqurlikda ishlaydi va koʻprik tiqilish deb belgilanadi. Agar suv past xordaga yetsa, oqim bosimli oqim boʻladi (quyi oqim suvi past xordadan past boʻlganda shlyuz turi, undan yuqorida botgan), palubasidan oʻtgan suv esa toʻsiq oqimini qoʻshadi; yuqori oqim sathi ular oqimga yigʻilgan sathdir.

Koeffitsiyentlar (sarf, kirish yoʻqotishi, toʻsiq) yaxlit sonli standart qiymatlar boʻlib kiritiladi. Ularni oʻz loyihangiz uchun oʻzgartiring. Bular suv oʻtkazgich loyihalash qoʻllanmalarida chop etiladigan moslashtirilgan grafiklar emas, shuning uchun chegarasiga yaqin suv oʻtkazgichning yuqori suvini taxminiy deb qabul qiling. Yoʻl yoki palubasidan oshgan suv, botgan kirish, tiqilgan teshik va quvur ichidagi tez oqim **Muammolar** da koʻrsatiladi.

## Notekis oqim

Daryo **Xossalar** ida {{ui:Notekis oqim…}} toshqin gidrografini kesimlar boʻylab yoʻnaltiradi. Kirim oqimini soat va oqim juftliklari sifatida, har bir qatorda bittadan, quyi oqim qiyaligini (normal chuqurlik boʻyicha) va qancha vaqt ishlashini kiriting. U birinchi oqimdagi barqaror suv sathidan boshlanadi va toʻliq bir oʻlchamli tenglamalarni yechadi (vaqt boʻyicha 0.6 ogʻirlikdagi oshkor boʻlmagan toʻrt nuqtali sxema). Har bir kesimda eng yuqori suv sathi va oqimni, har birining sodir boʻlish soatini, ikki uchidagi oqim grafigini va hajm tekshiruvini (kirgan, chiqqan va saqlangan oʻzgarish) olasiz. Barqaror oqim barqaror qolishi, kirim oqimidagi pogʻona yangi oqimning barqaror profilida tugashi, hajm yopilishi va toshqin toʻlqinining tezligi kinematik toʻlqinga nisbatan tekshiriladi. Tinch oqim, bitta uchastka, yon kirimsiz va ishlash ichida suv oʻtkazgich va koʻprik yoʻq.

## Qoʻshilishlar

Bir chiqishga oqimni qoʻshadigan uchastkalar: oqimlar qoʻshiladi va quyi uchastka boshidagi suv sathi unga qoʻshiladigan uchastkalar uchlariga olib boriladi (qoʻshilishda bir xil suv sathi, oddiy usul: burchak yoʻq, impuls yoʻq, shuning uchun past Frud sonlariga mos). Model va sinovlar joyida (`river-structures.js`); rejada ikki daryoni qoʻshish paneli hali qurilmagan.

## Hali qurilmagan

Toʻsiqlar va shlyuzlar alohida inshoot sifatida, qoʻshilishlar paneli, notekis ishlash ichidagi inshootlar va superkritik notekis oqim. Aralash rejimli ishlash ikki kesim orasida gidravlik sakrashni belgilaydi, lekin uni joylashtirmaydi.

**Daryolar qayerda qoʻshiladi.** Daryo Xossalarida "Oqib boradi" qoʻshilgan daryoni nomlaydi. Qoʻshiladigan daryolar birgalikda yechiladi: ular oqib kelgan daryo ularning oqimlari yigʻindisini olib yuradi va ularning har biri oʻsha daryoning birinchi kesimi suv sathida tugaydi (teng suv sathi usuli; oqimlarning burchagi va impulsini hisobga olmaydi). Bosh daryo va soy qoʻshilishi uchun qoʻshilish nuqtasi pastida qisqa daryo chizing va ikkalasi unga oqib kelsin. Natijalar qoʻshilish jadvalini koʻrsatadi. Bu natijalardagi standart qiymatlar (siqilish 0.1, kengayish 0.3, gʻadir-budur kompozitli bitta boʻlakli oʻzan, solishtirma kuch boʻyicha aralash rejim) muhandis koʻrib chiqquncha saqlanadi va Natijalar buni aytadi.
