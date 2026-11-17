---
title: Yomgʻir suvi oqimlarini, quvur oʻlchamlarini va gidravlik gradiyent chizigʻini hisoblash
summary: Har bir inshootga oqadigan suv yigʻish hududlarini chizing, ratsional usul bilan tarmoq boʻylab oqimlarni jamlang, quvurlarni Manning tenglamasi bilan oʻlchang va gidravlik gradiyent chizigʻi qayerda toʻliq oqishi yoki sirtga yetishini koʻring.
keywords: yomgʻir suvi drenaji, suv yigʻish hududi, ratsional usul, oqim koeffitsiyenti, toʻplanish vaqti, yomgʻir intensivligi, idf, manning, quvur oʻlchami, gidravlik gradiyent chizigʻi, hgl, energiya gradiyent chizigʻi, egl, toʻlib oqish, suv toshqini, quyi oqim sathi
from: e44872ec
---

Yomgʻir suvi drenaji [quvurlar tarmogʻi](topic:pipe-network) ustida ishlaydi: avval tarmoqni chizing, soʻng unga oqib tushadigan hududlarni. Hech narsa tanlanmaganda hammasi oʻng panelda **Yomgʻir suvi drenaji** ostida koʻrinadi.

## Suv yigʻish hududini chizish

1. **Yomgʻir suvi drenaji** ostida **Suv yigʻish hududini chizish** tugmasini bosing.
2. Bitta inshootga oqadigan hududning burchaklariga bosing. {{key:Enter}} yoki ikki marta bosish tugatadi; {{key:Backspace}} oxirgi burchakni qaytarib oladi, {{key:Esc}} toʻxtatadi.
3. Suv yigʻish hududi ichidagi inshootga, agar boʻlmasa eng yaqin inshootga oqadi. Uning **Xossalari** ochiladi: nomi, **Oqim koeffitsiyenti C** (yomgʻirning oqib ketadigan ulushi, 0 dan 1 gacha), daqiqalarda **Toʻplanish vaqti** va qaysi inshootga **Oqib tushadi** ni belgilang.

**Xossalar** ichidagi **Yana suv yigʻish hududini chizish** keyingisini boshlaydi. Rejada suv yigʻish hududi ichiga bosib uni tanlang; {{key:Delete}} uni oʻchiradi. Har bir oʻzgarish bitta qadam: {{key:Mod+Z}} uni bekor qiladi.

## Loyiha jadalligini belgilash

Yomgʻir intensivligi i = a ÷ (tc + b)^c boʻlib, futli loyihada dyuym/soat, metrli loyihada millimetr/soat hisobida. **Intensivlik a**, **b** va **c** ni oʻzingiz loyihalaydigan qaytish davri uchun oʻz intensivlik–davomiylik–chastota egri chizigʻiga moslang.

:::warning
Boshlangʻich intensivlik egri chizigʻi, Manning n (0.013) va kirish yoʻqotishi (0.5) namunaviy qiymatlar, standart emas. Ularni oʻz yomgʻir maʼlumotlaringiz va loyihalash mezonlaringizdan belgilang.
:::

- **Eng qisqa toʻplanish vaqti**: hech bir quvur undan qisqaroq vaqtda hisoblanmaydi (boshida 10 daqiqa).
- **Manning n**: quvurlarning gʻadir-budurligi.
- **Kirish yoʻqotishi**: har bir inshootda yoʻqotiladigan bosim, undan chiqib ketayotgan quvurning tezlik bosimi V²/2g ulushi sifatida.
- **Chiqish joyidagi suv sathi**: quyi oqim sathi, oxirgi quvur boʻshaydigan joyda. Chiqish erkin boʻlsa boʻsh qoldiring.

## Oqimlar qanday jamlanadi

Har bir quvur undan yuqoridagi barcha suv yigʻish hududlarini olib oʻtadi. Q = C × i × A, bu yerda C × A tarmoq boʻylab jamlanadi va i — kelayotgan suvning eng uzun toʻplanish vaqtidagi intensivligi: hududning oʻz vaqti yoki yuqori oqimdagi hududdan vaqt va quvurlar orqali oʻtish vaqti (uzunlik ÷ toʻliq oqimdagi tezlik) yigʻindisi. Q futli loyihada kub fut/soniyada (A akrda), metrli loyihada kub metr/soniyada (A gektarda).

## Quvurlar oʻlchamini belgilash

**Oqimlar va gradiyent chiziqlari** ostidagi jadval har bir quvur uchun oqimni, uning qiyaligida toʻliq oqimda olib oʻtadigan miqdorini, tezligini, tepa va tagidagi gidravlik gradiyentni hamda qanchalik chuqur oqayotganini koʻrsatadi.

**Quvurlarni bu oqimlar uchun oʻlchamlang** har bir quvurga oʻz qiyaligida oqimini olib oʻtadigan eng kichik standart oʻlchamni beradi (12 dan 72 dyuymgacha yoki 300 dan 1800 mm gacha). Bu bir qadam. Tub balandliklari oʻz joyida qoladi: oʻlchamlar oʻzgarsa, qoplamani saqlash uchun **Barcha tub balandliklarini qoidalar boʻyicha oʻrnatish** dan foydalaning, soʻng jadvalni qayta tekshiring.

## Gradiyent chiziqlarini oʻqish

Gidravlik gradiyent chizigʻi (HGL) chiqish joyidan yuqoriga qarab hisoblanadi:

- Qisman toʻlgan quvurning HGL i suv sirtida: tub balandligi plus normal chuqurlik.
- Pastdagi suv uning tepasidan baland boʻlsa yoki toʻliq oqimda sigʻmaydigan miqdor olib oʻtsa, quvur toʻliq oqadi (bosim ostida) va uning HGL i uzunligi boʻylab ishqalanish qiyaligi bilan koʻtariladi.
- Har bir inshootda HGL chiqib ketayotgan quvurning tepadagi HGL i plus kirish yoʻqotishiga teng.
- Energiya gradiyent chizigʻi (EGL) — HGL plus tezlik bosimi.

Toʻliq oqayotgan quvur roʻyxatga olinadi, shuningdek HGL qirgʻoqdan baland boʻlgan har qanday inshoot: u yerda suv sirtga chiqadi va inshoot rejada qizil halqa bilan belgilanadi. Oqimini, chuqurligini, tezligini va ikkala gradiyent chizigʻini koʻrish uchun quvur yoki inshootni tanlang; ular uning **Xossalar** ida koʻrinadi.

## Yomgʻirni marshrutlash

Ratsional usul har bir quvur uchun bitta choʻqqi beradi. {{ui:Yomgʻirni marshrutlash}} (natijalar ostida, tarmoqning **Xossalar** ida) buning oʻrniga butun yomgʻirni hisoblaydi: har bir suv yigʻish hududining vaqt boʻyicha oqimi quvurlar boʻylab, ularning oʻtish vaqti va saqlanishi bilan olib boriladi va uchrashgan joyda qoʻshiladi.

1. {{ui:Yomgʻir davom etadi}} va {{ui:Yomgʻir intensivligi}} ni boʻsh qoldiring: eng uzun toʻplanish vaqti va yuqoridagi yomgʻir egri chizigʻi ishlatiladi, yoki oʻzingiz kiriting.
2. {{ui:Yomgʻirni marshrutlash}} tugmasini bosing. Jadvalda har bir quvur uchun kirish va chiqishdagi eng yuqori oqim, chiqish choʻqqisi qanchalik pastligi, quvur toʻliq sigʻimining qancha qismidan foydalanilgani va choʻqqiga chiqqan daqiqa koʻrsatiladi.
3. Har bir chiqish joyida kichik oqim-vaqt diagrammasi va {{ui:Gidrografni yuklab olish (CSV)}} chiqadi.

Suv yigʻish hududi oʻz toʻplanish vaqti boʻyicha oʻrtacha yomgʻirni chiqaradi, shuning uchun undan qisqa yomgʻir C × i × A dan past choʻqqi beradi. Har bir quvur Muskingum–Cunge usuli bilan, ratsional usul allaqachon topgan oqim chuqurligidan foydalanib marshrutlanadi. Turli toʻplanish vaqtiga ega ikki tarmoq birgalikda choʻqqiga chiqmaydi, shuning uchun ularning yigʻindisi choʻqqilar yigʻindisidan past boʻladi.

Bu toʻliq oqishni, orqaga bosimni, inshootlardagi saqlashni yoki suv toshqinini modellashtirmaydi. Marshrutlangan choʻqqisi toʻliq sigʻimidan yuqori boʻlgan quvur roʻyxatga olinadi va uning suvi sigʻadigandek uzatiladi. Uni vaqt va susayishni koʻrish uchun ishlating, quvur oʻlchamini belgilash uchun emas. Bu hisoblash vositasi: uni muhandis tekshiradi.

## Loyiha bilan saqlanadi

Suv yigʻish hududlari va yomgʻir sozlamalari loyiha faylida saqlanadi. Ular hali PDF chizmasida, DWG yoki DXF da va LandXML da emas: qarang [Hali qurilmagan](topic:not-built-yet).
