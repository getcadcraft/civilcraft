---
title: Sudaryti kėlimo į vietą ataskaitą
summary: Išvardyti kuolelius palei trasą pikietais ir nuokrypiais arba artimus geodezinius taškus, su pikieto, nuokrypio, šiaurinėmis ir rytinėmis koordinatėmis, projektiniu ir esamu gruntu bei iškasa ar pylimu, ir įrašyti ataskaitą kaip CSV arba PDF.
keywords: kėlimas į vietą, žymėjimas, kėlimo ataskaita, iškasų lapas, nuolydžių lapas, pikietas, nuokrypis, iškasa, pylimas, išdėstymas, statybinis kėlimas, kaip įrengta
from: d8a4e9f1
---

Pasirinkite trasą ir spustelėkite **Kėlimo į vietą ataskaita** jos **Savybėse**.

## Kuoleliai ties pikietais ir nuokrypiais

1. **Nuo** ir **iki**: pikietai, kuriuos reikia pažymėti (1+50 arba 150).
2. **kas**: intervalas. Kuoleliai dedami ties kiekvienu jo kartotiniu, abiejuose galuose ir (jei pažymėtas langelis) ten, kur trasos kreivės prasideda ir baigiasi.
3. **Nuokrypiai**: kairėje ir dešinėje nuo trasos, žiūrint į didėjantį pikietą: `12 L, 0, 12 R`, `L12 CL R12` arba `-12, 0, 12` (kairė yra minusas). Trasa su koridoriumi pradedama nuo savo dangos ir kelio pečių kraštų.
4. **Numeruoti nuo** ir **su priešdėliu** pavadina kuolelius: 1, 2, 3 arba S101, S102.

## Geodeziniai taškai šalia trasos

Pasirinkite **geodeziniai taškai šalia trasos** ir kaip arti. Kiekvienas taškas per tą atstumą gauna savo pikietą ir nuokrypį, projektinį aukštį toje vietoje ir savo aukštį kaip gruntą: tai taškų, pažymėtų arba išmatuotų kaip įrengta, patikra.

## Ką sako ataskaita

| Stulpelis | Ką reiškia |
|---|---|
| Taškas | Kuoliuko pavadinimas arba geodezinio taško numeris |
| Pikietas, nuokrypis | Kur jis yra palei trasą: L – kairėje, R – dešinėje |
| Šiaurinė, rytinė koordinatė | Jo koordinatės |
| Projektinis aukštis | Įgilinto koridoriaus paviršius toje vietoje (nuo pažemio linijos iki pažemio linijos), kitu atveju projektinis profilis ašyje |
| Esamas aukštis | Esamas paviršius toje vietoje arba paties geodezinio taško aukštis |
| Iškasa/pylimas | C, kai gruntas virš projekto (nukasti), F, kai žemiau (supilti), iki šimtosios dalies |

Kuolelis be projektinio aukščio (už koridoriaus ribų arba trasoje be jo, toli nuo ašies) neturi iškasos ar pylimo; dialogas nurodo, kiek jų yra.

## Įrašyti ją

- **CSV**: pavadinimo eilutė, tada aukščiau nurodyti stulpeliai, plius iškasa ar pylimas kaip ženklinis skaičius (esamas minus projektinis) skaičiuoklėms ir lauko duomenų kaupikliams.
- **PDF**: lentelės puslapiai pasirinktame popieriuje, vienas kuolelis eilutėje, iškasos oranžine, pylimai žalia spalva, su antraštės juosta kaip kituose lapuose.

:::note
Kuoleliai apskaičiuojami pagal projekte esantį projektą. Prieš ką nors statydami, patikrinkite juos su patvirtintais planais.
:::
