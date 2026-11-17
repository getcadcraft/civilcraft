---
title: Elektr liniyalari ish maydoni
summary: Saytingizdagi havo liniyalari va yer osti kabellari, oʻz kutubxonalaringiz bilan, yuklash holatlaringiz ostida osilish va taranglik, masofa va mustahkamlik tekshiruvlari, tortish jadvallari, miqdorlar, varaqlar hamda GIS eksporti.
keywords: elektr liniyasi, havo liniyasi, elektr, taqsimlash, ustunlar, tayanchlar, sim, osilish, taranglik, tortish, masofa, yer osti kabeli, xandaq, ish maydoni, kommunal xizmat
from: 638dd856
---

Elektr liniyalari ish maydoni havo liniyalari va yer osti kabellarini sizda mavjud CivilCraft saytiga qoʻyadi: oʻsha survey nuqtalari, oʻsha yer, oʻsha loyiha fayli.

:::warning
Loyihalash vositasi. Ish maydoni osilish, taranglik, masofalar va yuklarni **sizning** yuklash holatlaringiz va chegaralaringiz asosida hisoblaydi; hech bir mamlakatning standarti kiritilmagan. Qurishdan oldin muhandis har bir natijani amaldagi standart bilan tekshiradi.
:::

## Ochish

{{ui:Yuza}} › {{ui:Yana}} › {{ui:Elektr liniyalari ish maydoni}} ni tanlang, yoki Ish maydoni ostidagi **Elektr liniyalari** ni tanlang. Shunda asboblar panelida **Elektr liniyalari** guruhi paydo boʻladi; Loyihalash va GIS guruhlari chetga suriladi. Qaytish uchun Ish maydoni ostida **Civil** ni tanlang. CivilCraft bu kompyuterda oxirgi ishlatilgan ish maydonini eslab qoladi.

Chap panelning yuqorisida ikkita boʻlim paydo boʻladi:

- **Elektr liniyalari**: yuklash holatlaringiz va chegaralaringiz, loyihadagi liniyalar va kabellar, hamda doim dolzarb boʻlgan **Tekshiruvlar**. Tekshiruvni bossangiz, u nima haqida ekani tanlanadi.
- **Kutubxona**: oʻz simlaringiz, kabellaringiz, tayanchlaringiz, jihozlaringiz va xandaq turlaringiz. Qarang: [Elektr liniyasi kutubxonangiz](topic:power-line-library).

## Elektr liniyalari guruhidagi asboblar

| Asbob | Nima qiladi | Mavzu |
|---|---|---|
| **Liniya** | Havo liniyasi: har bir tayanchni bosing | [Havo liniyasini chizish](topic:overhead-line) |
| **Tayanch** | Oraliqqa tayanch qoʻshish | [Havo liniyasini chizish](topic:overhead-line) |
| **Kabel** | Xandaqdagi yer osti kabeli marshruti | [Yer osti kabellari](topic:underground-cables) |
| **Jihoz** | Shkaf, transformator, birikma yoki tarmoq oziqlanadigan manba | [Yer osti kabellari](topic:underground-cables) |
| **Toʻsiq** | Liniya kesib oʻtadigan narsa: yoʻl, bino, boshqa liniya | [Tekshiruvlar](topic:power-line-checks) |
| **Profil** | Liniya profili: yer, tayanchlar va har bir yuklash holatidagi sim | [Havo liniyasini chizish](topic:overhead-line#the-line-profile) |
| **Yana** | Yuklash holatlari va chegaralar, tortish jadvallari, miqdorlar, varaqlar va hisobot, GIS, tadqiqot fayllari | [Osilish va taranglik](topic:sag-and-tension), [Natijalar](topic:power-line-outputs), [Tadqiqot fayllari](topic:power-line-study-file) |

Qoʻshgan har bir narsa bitta bekor qilish qadami boʻladi, loyiha faylida saqlanadi va rejada `C-POWR-…` nomli qatlamlarda chiziladi, shuning uchun DXF, DWG va PDF eksportlari ham uni olib oʻtadi.
