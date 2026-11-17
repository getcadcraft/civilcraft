---
title: Plaani väljastamine PDF-iks
summary: Kõige või praeguse vaate väljastamine vektor-PDF-ina standardsel lehel insener- või meetermõõtkavas, kihivärvides või mustana.
keywords: väljastamine, printimine, pdf, leht, mõõtkava, paberi suurus, plaanileht, avaldamine, tiitliplokk, põhjanool, mõõtkavariba
from: 9af396ca
---

{{ui:PDF}} väljastab plaani vektor-PDF-ina ühele lehele, koos tiitliribaga, põhjanoole ja mõõtkavaribaga. PDF tehakse brauseris ja laaditakse alla; see ei käi läbi brauseri printimisdialoogi.

## Väljastamine

1. Seadista plaan jaotises **Kuva**: näidatav pind, samakõrgusjoonte intervall ja mis on sisse lülitatud. Väljastamine järgib neid seadeid.
2. Kui soovid ainult osa asukohast, suumi ja nihuta plaani selle peale.
3. Klõpsa jaotises **Eksport** {{ui:PDF}} või vajuta {{key:Mod+P}}. Avaneb dialoog **Plaani väljastamine PDF-iks**.
4. Vali **Ala**: {{ui:Everything}} või {{ui:What is on screen}}.
5. Vali **Paber**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 või A1. Fuutide projekt algab Tabloidiga, meetriprojekt A3-ga. Lehed on alati põikformaadis.
6. Vali **Mõõtkava**. Loend märgib suurima mahtuva mõõtkava sõnaga „(mahub)“ ja valib selle.
   - Fuudid: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Meetrid: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Vali **Värvus**: {{ui:Layer colors}} või {{ui:Black}}.
8. Loe valikute all olevat rida. See annab ala suuruse paberil ja lehe suuruse, nt „Ala on 297 × 222 mm mõõtkavas 1" = 40' lehel 432 × 279 mm (põikformaat)."
9. Klõpsa {{ui:Download PDF}}.
   Brauser laeb alla `<name>.pdf`. Olekuriba ütleb „Väljastatud <name>.pdf mõõtkavas 1" = 40'.“

Kui ala on valitud mõõtkavas suurem kui leht, joonistatakse plaan keskele ja servad lõigatakse ära. Vali mõõtkava, mis on märgitud „(mahub)“, või suurem leht.

## Mis lehel on

- Plaan keskel joonistusalas tõeste vektoritena: samakõrgusjooned, sildid, trassid piketaažiga, koridorid, platvormid, lõikejooned, torud ja punktid.
- Joonte paksus kihi järgi: trassid, platvormid ja torud paksemad; kolmnurgad ja väiksemad samakõrgusjooned peened.
- Tiitliriba allservas projekti **Nimega**, mõõtkava, märge samakõrgusjoonte intervalli ja selle kohta, millist pinda näidatakse (olemasolev või projekteeritud), ning paremal kuupäev ja tarkvara versioon.
- Põhjanool üleval paremas nurgas (plaani põhi on üles) ja mõõtkavariba tiitliribas.
- Plaani all näidatud kaardikihid (pilt, kaardiplaadid või kaarditeenus), kui on märgitud **Kaardikihid plaani all**: need joonistatakse ühe pildina kogu joonistusala kohta 150 punkti tolli (dpi) kohta, joonte all, ja kaardi allikaviide läheb tiitliribale. CivilCrafti ootab kuni 8 sekundit kaardipiltide järele, mis veel saabuvad; kui mõned puuduvad, ütleb olekuriba seda.

Tekst kasutab PDF-i sisseehitatud fonti Helvetica. Läänemaise Euroopa märgistikust (Windows-1252) väljaspool olevad märgid prinditakse küsimärgina „?“, ja olekuteade loeb need kokku.

## Mida ei väljastata

- Kõrgusvööndid.
- Profiilivaade. Profiilide väljastamine ei ole veel saadaval.
- Rohkem kui üks leht (trassi puhul kasuta [plaani- ja profiililehti](topic:plan-profile-sheets)), vaateaknad, oma tiitliplokk või püstformaadis lehed.

:::note
Dialoog ütleb, et nõlvanooled on ainult ekraanil. Selles versioonis väljastatakse nõlvanooled, mis on jaotises **Kuva** sisse lülitatud (ja eksporditakse DXF-iks). Lülita need enne väljastamist välja, kui neid ei soovi.
:::

## Paberile printimine

Ava allalaaditud PDF mis tahes PDF-vaatajas ja prindi 100% (tegelik suurus), et mõõtkava jääks õigeks. „Mahuta lehele“ muudab mõõtkava.
