---
title: Kelio koridoriaus išvedimas
summary: Įjunkite koridorių trasai, nustatykite juostų, pakelės ir šoninio nuolydžio reikšmes bei skaitykite jo sukuriamus pjūvius, išėjimo linijas ir žemės darbus.
keywords: viražas, super, įvedimo ruožas, išvedimo ruožas, nuolydžių lentelė, skersinis nuolydis, pasukimas, koridorius, surinkimas, tipinis skerspjūvis, kelias, juosta, pakelė, skersinis nuolydis, šoninis nuolydis, išėjimas, iškasa, pylimas, pjūviai, tikslas, tikslai, pločio tikslas, aukščio tikslas, poslinkio tikslas, platinimas, važiuojamosios dalies kraštas, sekti kitą koridorių
from: 91303189
---

Koridorius išvedžioja vieną paprastą tipinį skerspjūvį palei trasą ir jos projektinį profilį, sujungia jį su esamu gruntu ir prideda rezultatą prie projektuojamo paviršiaus. Trasoje gali būti keli koridoriai skirtinguose pikketų ruožuose, o koridorių galima sudaryti iš pakartotinai naudojamų šablonų pagal pikketą ([Koridoriaus šablonai](topic:corridor-templates)). Toliau pateiktas paprastas surinkimas yra vienodas abiejose pusėse; norėdami kiekvienai pusei duoti savas dalis, žr. [Kiekvieną pusę sudaryti iš dalių](topic:corridor#build-each-side-from-parts).

## Surinkimas

Nuo centrinės linijos į išorę, kiekvienoje pusėje:

1. **juosta** nurodyto pločio, nuo vainiko krintanti pagal **juostos nuolydį**
2. **pakelė** nurodyto pločio su **pakelės nuolydžiu**
3. **šoninis nuolydis** nuo pakelės krašto iki susitikimo su gruntu: **iškasos nuolydis**, kai gruntas aukščiau, ir **pylimo nuolydis**, kai žemiau

Pradinės reikšmės yra vietos rezervuotojai, o ne projektavimo standartas:

| Reikšmė | US feet | Metrai |
|---|---|---|
| Juostos plotis | 12 ft | 3.6 m |
| Juostos nuolydis | 2% | 2% |
| Pakelės plotis | 4 ft | 1.2 m |
| Pakelės nuolydis | 4% | 4% |
| Iškasos nuolydis | 2 : 1 | 2 : 1 |
| Pylimo nuolydis | 3 : 1 | 3 : 1 |
| Pjūvis kas | 10 ft | 5 m |

Šoninių nuolydžių nuolydžiai yra horizontalūs su vertikaliais (H:V): 3 : 1 reiškia 3 vienetus į šoną už 1 žemyn.

## Sukurti koridorių

Jums reikia trasos be klaidų ir projektinio profilio su bent dviem PVI, be klaidų.

1. Pasirinkite trasą.
2. Dešinėje srityje, skiltyje **Koridorius**, pažymėkite **Išvesti surinkimą palei projektinį profilį**.
   Laukai atsiranda ir koridorius iš karto sukuriamas. Plane rodomi juostos ir pakelės kraštai bei išėjimo linijos; kai skiltyje **Rodymas** pasirinktas {{ui:Projektuojamas (su nuolydžiais)}}, horizontalės rodo naują gruntą.
3. Pakeiskite bet kurią reikšmę: **Juostos plotis**, **Juostos nuolydis**, **Pakelės plotis**, **Pakelės nuolydis**, **Iškasos nuolydis**, **Pylimo nuolydis**, **Pjūvis kas**. Po kiekvienos paspauskite {{key:Enter}}. Iškasos, pylimo ir pjūvių tarpo reikšmės turi būti didesnės už 0.
4. Perskaitykite eilutę po laukais, pavyzdžiui „39 pjūviai nuo 0+00.00 iki 3+86.36; iškasa 240.2 cu yd, pylimas 556.0 cu yd.“

Pjūviai pjaunami kas kiekvieną **Pjūvis kas** žingsnį, galuose, bei kiekvienos horizontaliosios ir vertikaliosios kreivės pradžioje ir pabaigoje. Kiekvienas pjūvis ir linijos per juos (centrinė linija, juostos ir pakelės kraštai, išėjimo linijos) tampa projektuojamo paviršiaus lūžio linijomis.

Norėdami išjungti koridorių, nuimkite žymėjimą nuo langelio. Jo reikšmės išsaugomos kitam kartui.

## Kai jis nesudaromas

Raudonas langelis po laukais paaiškina, kodėl:

| Pranešimas | Ką daryti |
|---|---|
| „Koridoriui reikia projektinio profilio be klaidų.“ | Pridėkite PVI arba ištaisykite persidengiančias vertikaliąsias kreives (žr. [Projektuoti vertikalųjį profilį](topic:profile)). |
| „Projektinis profilis nesutampa su trasa.“ | Perkelkite PVI į trasos pikketų ruožą. |
| „Koridoriui reikia bent dviejų pjūvių paviršiuje.“ | Didžioji koridoriaus dalis yra už esamo grunto ribų. |
| „4 šoniniai nuolydžiai išeina už paviršiaus ribų prieš pasiekdami gruntą.“ | Paviršiaus krašto artumoje nuolydis nepasiekia grunto. Laikykite kelią toliau nuo krašto arba ten sumažinkite pylimo ar iškasos aukštį. |
| „Koridoriaus išėjimo linijos kertasi (pjūviai persidengia, pavyzdžiui siauro posūkio vidinėje pusėje). Naudokite didesnį spindulį arba siauresnį surinkimą.“ | Pjūviai aštraus posūkio vidinėje pusėje persidengia. Padidinkite spindulį arba sumažinkite surinkimą. |

Koridorius su problema neformuojamas į gruntą ir neįskaičiuojamas žemės darbuose.

## Koridoriai ir aikštelės kartu

Projektuojamas paviršius sudaromas eilės tvarka: pirmiausia visi koridoriai, paskui visos aikštelės. Ten, kur aikštelės formavimas kertasi su koridoriumi, pirmenybę turi aikštelė. Tūriai skaičiuojami visų išėjimo linijų viduje kartu; žr. [Žemės darbų tūriai](topic:volumes).

## Viražas

Per kreivę kelias gali pasvirti į vidinę pusę, todėl eismas mažiau spaudžiamas į išorę. Skiltyje **Viražas** trasos **Ypatybėse** pažymėkite **Įvesti viražą kreivėse**:

- Kiekviena apskritiminė kreivė paima normą **e** iš normų lentelės: pirmą eilutę, kurios spindulį kreivė pasiekia (eilutė su tuščia norma palieka įprastą vainiką). Lentelė ir **Didžiausias santykinis nuolydis** (pradžioje 0.5 %) yra vietos rezervuotojai, ne standartas: nustatykite juos pagal savo projektavimo kriterijus. Pridėkite ar pašalinkite eilutes pagal poreikį.
- Juostos sukasi aplink centrinę liniją. Prieš kreivę išorinė juosta išlyginama per **išvedimo ruožą** (įprastas vainikas ÷ e × **įvedimo ruožas**), tada per **įvedimo ruožą** (juostos plotis × e ÷ nuolydis) išorinė juosta toliau sukasi, kol visas kelias nuslysta e vidinės pusės link; du trečdaliai įvedimo ruožo yra prieš kreivę, vienas trečdalis – ant jos. Po kreivės vyksta atvirkščiai.
- Žemoje pusėje esanti pakelė niekada nebūna lygesnė už savo juostą; aukštoje pusėje ji išlaiko savo nuolydį (ji nusiriečia).
- Lentelė po ja išvardija kiekvienos kreivės spindulį, normą, įvedimo ir išvedimo ruožus bei vietas, kur prasideda ir baigiasi pilnas viražas. **Viražo diagrama** braižo abiejų juostų skersinius nuolydžius palei pikketus (kairė juosta – ištisine linija, dešinė – brūkšnine).
- Kreivė, per trumpa pasiekti pilną viražą, arba dvi kreivės, kurių pereinamieji ruožai persidengia, nurodoma dėžutėje virš lentelės.

Pjūviai, tūriai, 3D vaizdas ir brėžiniai visi rodo pasvirusį kelią. Kiekvienas pakeitimas – vienas žingsnis: {{key:Mod+Z}} jį anuliuoja.

## Tikslai

Tikslas perkelia vieną kelio vienos pusės tašką į liniją: **Važiuojamosios dalies kraštas** arba **Pakelės kraštas**, kairėje arba dešinėje pusėje. Kiekvienas pjūvis susitinka su linija statmenai centrinei linijai, eidamas į išorę tik toje pusėje, todėl dešinės pusės tikslas niekada nejuda kairės pusės.

| Nustato | Kas nutinka, kur pjūvis susitinka su linija |
|---|---|
| **Plotis** | Taškas guli ant linijos: juosta (arba pakelė) platėja arba siaurėja iki jos, išlaikydama savo skersinį nuolydį. |
| **Aukštis** | Taškas įgauna linijos aukštį toje vietoje, savo poslinkyje: juostos (arba pakelės) skersinis nuolydis seka. |

Linija gali būti charakteristinė linija (kad ir koks būtų jos **Naudojimas**) arba kito koridoriaus linija: jo centrinė linija, važiuojamosios dalies kraštai, pakelių kraštai arba išėjimo linijos. Kito koridoriaus linija seka tą koridorių: pakeiskite kitą kelią, ir šis seks. CivilCraft pirmiausia pastato kitą koridorių; du koridoriai, kurie taikytų vienas į kitą ciklu, atmetami vienoje pusėje, o lentelė nurodo, kurioje.

1. Pasirinkite trasą ir įjunkite jos koridorių.
2. Skiltyje **Tikslai** spustelėkite {{ui:Pridėti tikslą}}.
3. Pasirinkite **Pusę**, **Tašką**, ką jis **Nustato**, ir **Iki linijos**. Kiekvienas pakeitimas – vienas anuliavimo žingsnis.

**Rezultatas** nurodo, į kiek pjūvių linija buvo pasiekta. Pjūviai, kurie jos nepasiekia (už jos galų arba kur ji yra už centrinės linijos), išlaiko surinkimo reikšmes. Linija, kuri ištrinama, palieka koridorių tokį, koks buvo prieš tikslą, ir lentelė tai nurodo. Vienoje pusėje kiekvienam taškui gali būti po vieną pločio ir vieną aukščio tikslą.

## Kiekvieną pusę sudaryti iš dalių

Įjunkite **Kiekvieną pusę sudaryti iš dalių** koridoriaus nustatymuose. Tada kiekviena pusė turi savo sąrašą nuo centrinės linijos į išorę: juostos, pakelė, latakas, bordiūras, želdynų juosta, šaligatvis ir, paskutinis, šoninis nuolydis iki grunto (su savo iškasos ir pylimo santykiais). Pradėkite nuo {{ui:Kelias užmiestyje}} arba {{ui:Miesto gatvė}}, pridėkite ir pašalinkite dalis, perkelkite jas rodyklėmis, o {{ui:Kopijuoti}} nukopijuokite vieną pusę į kitą. Kiekvienas pakeitimas – vienas anuliavimo žingsnis.

Skersinis nuolydis yra nuokrypis nuo kelio, todėl šaligatvis, nukreiptas link kelio, turi neigiamą reikšmę. Bordiūras yra paviršius nurodyto aukščio, viršus nurodyto pločio ir pasirinktinis nusileidimas gale. Viražas pasuka kiekvieną juostą pirmoje eilutėje; latakas, bordiūras, juosta ir šaligatvis kabo nuo pastatytų juostų krašto. Tikslai vis dar perkelia juostų galą ir paskutinę dalį. Skersiniai pjūviai pažymi latako tėkmės liniją, bordiūro viršų ir užpakalinį kraštą bei kitus. Kreivėje su spiralėmis įvedimo ruožas yra spiralė: lygus vainikas TS taške, pilnas viražas SC taške.

## Dangos sluoksniai

Juostai, pakelei, lataky, želdynų juostai ar šaligatviui gali priklausyti jų konstrukcija: po dalimi {{ui:Pridėti sluoksnį}} prideda sluoksnį su pavadinimu, medžiaga, storiu ir rūšimi (paviršius, rišiklis, pagrindas, apatinis pagrindas, dengiamasis sluoksnis arba kita), iš viršaus žemyn. Sluoksniai nekeičia kelio paviršiaus (jo viršus yra projektuojamas paviršius); kiekvienas guli po savo dalimi, o jo gylis matuojamas tiesiai žemyn. Pjūviai kiekvieno sluoksnio apačią braižo brūkšnine linija, o {{ui:Dangos sluoksniai: kiekiai}} išvardija kiekvieno sluoksnio plano plotą ir tūrį (plotas išilgai koridoriaus pagal jo pjūvius, tūris = plotas × storis). IFC eksportas kiekvieną sluoksnį rašo kaip atskirą elementą su storiu ir medžiaga (žr. [IFC eksportas ir importas](topic:ifc)). Storis, kurį įvedate, yra jūsų: CivilCraft nedimensionuoja dangų.

## Kas dar nesukurta

Išėjimo nuolydžio tikslai dar nepasiekiami. Koridoriui, kuris keičiasi išilgai kelio, su atskirtomis kairiąja ir dešiniąja puse, naudokite [Koridoriaus šablonus](topic:corridor-templates). Žr. [Dar nesukurta](topic:not-built-yet).
