---
title: Elektr liniyasi tekshiruvlari
summary: CivilCraft har bir liniya va kabelda nimalarni tekshirishini, doim dolzarb holda: masofalar, oraliqlar, tebranish, koʻtarilish, tayanch yuklari va oʻlchamlari, armaturalar, ushlagichlar, poydevorlar, yetishmayotgan maʼlumotlar, ulanishlar, ortiqcha yuklanish va kuchlanish pasayishi.
keywords: tekshiruvlar, masofa, yer masofasi, toʻsiq, kesishish, faza oraligʻi, izolyator tebranishi, koʻtarilish, tayanch yuki, nominal yuk, oʻlcham, poydevor, ushlagich, armatura, travers, kuchlanish pasayishi, ortiqcha yuklanish, yetishmayotgan maʼlumot, uzilgan
from: e6a0da47
---

**Tekshiruvlar** (Elektr liniyalari boʻlimida) barcha muammolarni roʻyxatlaydi: muvaffaqiyatsiz boʻlganlari qizil, ogohlantirishlar sariq. Birortasini bossangiz, u bilan bogʻliq liniya, tayanch, sim yoki jihoz tanlanadi; ish maydoni ochiq boʻlganda, muvaffaqiyatsiz tayanchlar va oraliqlar rejada qizil aylana bilan belgilanadi.

:::warning
Loyihalash vositasi: bular sizning loyihangizning oʻz qoidalaringiz boʻyicha tekshiruvlari, sertifikat emas.
:::

## Masofalar

Simning eng past fazasi har bir oraliq boʻylab har bir yuklash holatida kuzatiladi. Uning yer ustidagi eng kichik masofasi liniyaning **Masofa qoidasi** ga yetishi kerak. Oraliq **toʻsiq** ni kesib oʻtgan joyda ({{ui:Obstacle}} bilan chizilgan: nuqta yoki chiziq, uning yer ustidagi balandligi va oʻz masofa qoidasi bilan), toʻsiq tepasi ustidagi masofa xuddi shunday tekshiriladi.

**Landscape ish maydoni yer ustiga qoʻygan narsalar ham hisobga olinadi.** Yakka oʻsimliklar (ulgʻaygan kengligi va balandligidagi tojlari), oʻsimlik ekilgan maydonlar va jonli devorlar (ulardagi eng baland tur) hamda devorlar (ularning tepasi) qayta chizilmasdan liniya ostidagi toʻsiqlar hisoblanadi. Ular {{ui:Yuklash holatlari va chegaralar…}} da belgilangan qoidalarni saqlaydi: **Liniya ostidagi Landscape oʻsimliklari** (namunaviy toʻplamlarda *Daraxtlar va oʻsimliklar*, 3 m) va **Liniya ostidagi Landscape devorlari** (*Bino*); tekshirmaslik uchun **Tekshirilmasin** ni tanlang. Masofa oʻsimlik yoki devor tepasidan simgacha, oraliq uni kesib oʻtgan joyda, toʻgʻridan-toʻgʻri yuqoriga oʻlchanadi; liniya yonidagi tojgacha boʻlgan yon masofa tekshirilmaydi. Daraxtni koʻchirish yoki devorni koʻtarish tekshiruvlarni darhol oʻzgartiradi.

Masofa qoidalari sizniki: ularni qoʻshish, nomini oʻzgartirish, oʻzgartirish yoki oʻchirish uchun istalgan **Masofa qoidasi** yonidagi **Qoidalar…** ni (yoki {{ui:Yuklash holatlari va chegaralar…}} ni) bosing.

## Oraliq va tebranish

- **Talab qilinadigan faza oraligʻi**: k·√(osilish + izolyator uzunligi) + U/150, issiq holat osilishi va kuchlanish U kV da (keng tarqalgan shakl; k sizning qoidalar toʻplamingizniki). Travers faza oraligʻi bilan solishtiriladi.
- **Izolyator tebranishi** osma tayanchlarda, shamol holatida: atan(koʻndalang yuk ÷ vertikal yuk), qoidalar toʻplamidagi eng katta tebranish bilan solishtiriladi.
- **Koʻtarilish**: qoʻshnilaridan past turgan osma tayanch sovuqda yuqoriga tortilishi mumkin; u belgilanadi.

## Tayanch yuklari va oʻlchamlari

Har bir tayanch va yuklash holati uchun, liniyaning barcha simlari bilan:

- **Koʻndalang**: metrga shamol × shamol oraligʻi (ikki oraliqning yarmi), burilishda esa qoʻshimcha 2·H·sin(burilish ÷ 2).
- **Liniya boʻylab**: tugash yoki burchakda ikki tomon taranglik farqi; osma tayanchda faqat bir tomonda muz boʻlganda (har bir oraliq alohida hisoblanadi, bu xavfsizroq tomonga xato qiladi).
- **Vertikal**: metrga vertikal yuk × vazn oraligʻi (ikki tomondagi eng past nuqtalar orasida) va jihozlar.

Gorizontal yuk tayanchning nominal nuqtasiga keltiriladi (ekvivalent yuk = yuk × biriktirish balandligi ÷ nominal nuqta balandligi) va uning **nominal yuki** × qoidalar toʻplami koeffitsienti bilan solishtiriladi. Agar u zaif boʻlsa, kutubxonangizdagi xuddi shu material va uni koʻtara oladigan eng kichik tayanch taklif qilinadi. **Ushlagich** bilan tayanch gorizontal yukni ushlagichga uzatadi, u yuk ÷ sin(ushlagich burchagi) ni koʻtaradi va oʻz nominal qiymati bilan tekshiriladi.

Armaturalar (qisqichlar, izolyatorlar, travers) nominal yuki boʻyicha tekshiriladi: langar armatura simning tortilishini, osma armatura esa vertikal va koʻndalang yukning oʻz ulushini koʻtaradi. Koʻrsatilgan **poydevor** tayanchning yerdagi chuqurligi va uning tagligidan biroz kengroq chuqurlikdir.

## Maʼlumotlar, ulanishlar va tok

- Kerakli maydoni boʻsh boʻlgan element yoki kutubxonada boʻlmagan kalit.
- Hech narsaga ulanmagan kabel marshruti uchi yoki jihoz.
- Har bir manbadan (manba sifatida belgilangan jihoz) yuklargacha (jihozlarda kVt va quvvat koeffitsienti) havo oraliqlari va kabellar boʻylab **kuchlanish pasayishi** va **tok**: √3·I·L·(R cos φ + X sin φ), R 20 °C da. Kabelning tok reytingidan koʻp yoki qoidalar toʻplami ruxsat bergandan koʻproq pasayish belgilanadi.
