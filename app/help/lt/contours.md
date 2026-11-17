---
title: Horizontalių, aukščių ir nuolydžių skaitymas
summary: Nustatykite horizontalių tarpą ir pagrindines horizontales, rodykite aukščių juostas, nuolydžio rodykles ir trikampius bei skaitykite žymeklio vietos gruntų aukščius.
keywords: horizontalės, horizontalių tarpas, pagrindinės horizontalės, žymos, aukščių juostos, nuolydžio rodyklės, trikampiai, taško aukštis, paviršiaus analizė, aukščių analizė, nuolydžių analizė
from: 585e500a
---

Paviršius rodomas su horizontalėmis, kai tik jis atsiranda. Visa, kas aprašyta šioje temoje, nustatoma kairėje esančioje srityje, skiltyje **Rodymas**. Rodymo parametrai keičia tik tai, ką matote (ir ką eksportuojate); jie nėra anuliavimo žingsniai.

## Nustatyti horizontalių tarpą

1. Skiltyje **Rodymas** pasirinkite reikšmę lauke **Horizontalės kas**.
   - Pėdomis: 0.25, 0.5, 1, 2, 5, 10 arba 20 ft.
   - Metrais: 0.1, 0.25, 0.5, 1, 2, 5 arba 10 m.
2. Pasirinkite **Pagrindinės kas**: kas 2-ąją, 4-ąją, 5-ąją arba 10-ąją horizontalę.
   Pagrindinės horizontalės braižomos storesnės ir pažymėtos savo aukščiu. Jos išdėstomos visais pagrindinio tarpo kartotiniais (su 1 ft horizontalėmis ir kas 5-ąja pagrindine: 245, 250, 255 …).
3. Jei žymos per daug susigula mažame plane, išjunkite {{ui:Horizontalių žymos}}.

Naujas projektas pradedamas nuo 1 vieneto, o kas 5-oji horizontalė yra pagrindinė. Horizontalės lūžta ties lūžio linijomis; jei jos kerta tėkmės liniją ar kalnagūbrį tiesiai, ši linija dar nėra lūžio linija (žr. [Sukurti ir patikslinti paviršių](topic:build-surface)).

:::note
Horizontalės braižomos tik tada, kai tarp žemiausio ir aukščiausio taško yra ne daugiau kaip 2,000 lygių. Vietovėje su dideliu reljefu ir labai mažu tarpu plane horizontalių visai nerodoma: pasirinkite didesnį tarpą.
:::

## Sušvelninti horizontales

Horizontalės braižomos tiesiomis atkarpomis, po vieną per kiekvieną paviršiaus trikampį, todėl ties kiekvienu trikampio kraštine jos šiek tiek lūžta. **Horizontalių glodinimas** skiltyje **Rodymas** suapvalina šiuos kampus:

- **Nėra (tiesios atkarpos)**: nubrėžtos linijos tokios, kokios yra. Taip rodomi nauji arba senesni brėžiniai.
- **Lengvas**: kampai šiek tiek suapvalinami. Linija niekada nenutolsta daugiau kaip 10 % kelio link kitos horizontalės ir niekada toliau nuo savo tiesios atkarpos nei viena šeštoji tos atkarpos ilgio.
- **Stiprus**: tekanti kreivė. Linija niekada nenutolsta daugiau kaip 25 % kelio link kitos horizontalės ir niekada toliau nuo savo tiesios atkarpos nei viena trečioji tos atkarpos ilgio.

Abiem atvejais išlygintos horizontalės vis tiek kerta kiekvieną trikampio kraštinę tame pačiame taške kaip ir tiesios, lieka tame trikampyje, kurį kerta kiekviena atkarpa, todėl niekada nekerta ir neliečia kitos horizontalės. Ten, kur horizontalė kerta lūžio liniją ar ribą, ji išlaiko aštrų lūžį. Braižomos ir eksportuojamos būtent išlygintos linijos (DXF, DWG, PDF, GIS ir 3D); jose yra daugiau viršūnių nei tiesiose linijose.

Glodinimas keičia tik nubrėžtas linijas. Aukščiai, tūriai, profiliai ir pjūviai vis tiek skaitomi iš paties paviršiaus. Horizontalė, einanti tiksliai per topografinius taškus (taškas 250.00 ties 250 horizontale), kiekviename tokiame taške išlaiko nedidelį kampą.

## Kaip sudaromas paviršius, kuriuo remiasi horizontalės

Horizontalės seka paviršių, o paviršius seka **Horizontalių skaičiavimo būdą** skiltyje **Paviršius** kairėje srityje. Numatytasis, **Trianguliacija su tiesine interpoliacija**, sujungia taškus į trikampius ir išlaiko kiekvieną tašką bei lūžio liniją tiksliai. Kiti būdai pirmiausia uždeda ant taškų taisyklingą tinklelį (kriging, minimali kreivė, natūralusis kaimynas, atvirkštinis atstumas ir kiti). Dėl to tarp taškų horizontalės būna apvalesnės, bet per kiekvieną tašką tiksliai neina; paviršiaus ataskaitoje skiltyje **Paviršius** nurodoma, kiek rezultatas nukrypsta jūsų taškuose.

**ABOS (aproksimacija pagal glodinimą)** yra vienas tinklelio būdų. Jis turi du savo parametrus: **Glodumas** (pradžioje 0.5; kuo mažesnė reikšmė, tuo glodžiau) ir **Tikslumas** (pradžioje 1: paviršius suderinamas taip, kad taškuose nukryptų ne daugiau kaip 1 % vietovės aukščių diapazono; įveskite mažesnį skaičių, kad būtų tikslesnis atitikimas). Jei jis negali pasiekti tikslumo savo tinklelyje, paviršiaus ataskaitoje tai nurodoma: įveskite mažesnį **Tinklelio žingsnį**.

## Skaityti aukštį bet kurioje vietoje

Perkelkite žymeklį per planą. Būsenos juostoje rodoma:

- **E** ir **N** po žymekliu
- **Gruntas** ir esamo grunto aukštis toje vietoje, interpoliuotas trikampyje po žymekliu
- **Suformuota** ir projektinis aukštis, kur aikštelė ar koridorius pakeitė gruntą
- „Už paviršiaus ribų“, kai žymeklis yra už paviršiaus

Topografinį tašką tiksliai perskaitykite pasirinkę {{ui:Pasirinkti}} ir spustelėję tašką: dešinėje srityje matomas jo numeris, rytinė koordinatė (E), šiaurinė koordinatė (N), aukštis, aprašymas ir grupė.

## Rodyti aukščių juostas

1. Pažymėkite {{ui:Aukščių juostos}}.
   Paviršius užpildomas spalva nuo žemų (mėlyna-žalsva) iki aukštų (ochros-rudos) vietų. Po žymimaisiais langeliais esanti legenda rodo kiekvienos juostos aukščių intervalą.
2. Laukelyje **Juostos** pasirinkite juostų skaičių: 5, 8, 10 arba 12. Juostos padalija intervalą nuo žemiausio iki aukščiausio aukščio į lygias dalis.

Juostos skirtos tik peržiūrai. Jos neeksportuojamos į DXF ir nespausdinamos į PDF.

## Rodyti nuolydžio rodykles

Pažymėkite {{ui:Šlaitų rodyklės}}. Kiekviename pakankamai dideliame trikampyje nubrėžiama trumpa rodyklė, rodanti nuokalnės kryptį. Plokšti trikampiai rodyklės negauna. Rodyklės – greitas nuotakos krypties patikrinimas; nuolydžio reikšmė dar nėra užrašoma.

## Rodyti trikampius, taškus ir kraštines

- {{ui:Trikampiai}} nubrėžia TIN kraštines. Įjunkite, kad patikrintumėte, kaip paviršius jungia taškus, ypač išilgai lūžio linijų ir paviršiaus išorėje.
- {{ui:Taškai}} nubrėžia kiekvieną topografinį tašką; {{ui:Taškų žymos}} prideda jo numerį, aukštį ir aprašymą (arba mažiau: žr. **Taškų žymos** [CivilCraft nustatymuose](topic:settings)).
- {{ui:Lūžio linijos}} nubrėžia lūžio linijas (ir ribą) oranžine spalva.
- {{ui:Paviršiaus kraštas}} nubrėžia paviršiaus kontūrą.

## Esamas arba projektuojamas

Kai aikštelė ar koridorius be problemų suformuoja gruntą, skiltyje **Paviršius** (**Rodymas**) siūlomas {{ui:Projektuojamas (su nuolydžiais)}}. Tada horizontalės, juostos ir rodyklės rodo suformuotą paviršių, todėl matote naują gruntą ir jo išėjimo linijas aplink jį. Grįžkite prie {{ui:Esamas gruntas}}, kad pamatytumėte topografiją.

## Kas eksportuojama

DXF ir PDF išvestis atitinka šiuos parametrus: to, ką išjungėte, nerašoma, o horizontalės yra rodomo paviršiaus. Aukščių juostos niekada neeksportuojamos.
