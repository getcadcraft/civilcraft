---
title: "Vandentiekio tinklai: slėgiai, srautai ir gaisrinis debitas"
summary: "Nubrėžkite slėgio tinklą iš mazgų, rezervuarų, bakų, vamzdžių, siurblių ir slėgio reduktorių plane; CivilCraft apskaičiuoja aukščius, slėgius ir srautus (Hazen–Williams, cikliniai tinklai), gaisrui galimą srautą ir paros sunaudojimą. Laboratorinė funkcija; kiekvieną rezultatą turi patikrinti inžinierius."
keywords: "vanduo, vandentiekio magistralė, vandens paskirstymas, slėgio tinklas, slėginis vamzdis, ciklinis tinklas, hazen-williams, C koeficientas, nuostolių aukštis, likęs slėgis, gaisrinis debitas, hidrantas, sunaudojimas, mazgas, rezervuaras, bakas, siurblys, siurblio kreivė, slėgio reduktorius, prv, atbulinis vožtuvas, išplėstinis laikotarpis, epanet, inp, greitis"
from: df46bf6d
---

Vandentiekio magistralės yra vietovės slėginė pusė: visada pilni vamzdžiai, per kuriuos vandenį stumia rezervuaras, bakas ar siurblys. CivilCraft apskaičiuoja aukštį ir slėgį kiekviename mazge bei srautą kiekviename vamzdyje, įskaitant ciklinius tinklus, kur vandeniui yra daugiau nei vienas kelias. Ši funkcija yra laboratorijoje, kol ji tikrinama.

**Tik skaičiavimo pagalbinė priemonė.** Kiekvienas skaičius turi būti patikrintas kvalifikuoto inžinieriaus: atsakymas tiek tikslus, kiek tikslūs jūsų nurodyti sunaudojimai, aukščiai, vamzdžių dydžiai ir šiurkštumo reikšmės, o stacionarus modelis nieko nežino apie vandens smūgį, vandens kokybę ar tikrą gaisrinio siurblio elgesį.

## Nubrėžkite tinklą

1. Skiltyje **Paviršius** › {{ui:Daugiau}} pasirinkite {{ui:Vandentiekio tinklai…}}. Langas lieka atidarytas, kol dirbate plane.
2. Pasirinkite {{ui:Rezervuaras}} ir spustelėkite plane, kur yra tiekimo šaltinis. Jo aukštis prasideda 100 ft (30 m) virš žemės; keiskite jį Ypatybėse.
3. Pasirinkite {{ui:Mazgas}} ir spustelėkite kiekvieną vietą, kur imamas vanduo arba susijungia vamzdžiai. Mazgas aukštį perima iš žemės; kitą įveskite Ypatybėse, kad jį pakeistumėte.
4. Pasirinkite {{ui:Vamzdis}}, spustelėkite mazgą, tada mazgą, prie kurio jis jungiasi. Įrankis lieka įjungtas kitam vamzdžiui. {{ui:Siurblys}} ir {{ui:Slėgio reduktorius}} braižomi taip pat – nuo siurbimo (arba aukštupio) mazgo iki tiekimo (arba žemupio) mazgo. {{ui:Bakas}} dedamas kaip mazgas.
5. Pasirinkite mazgą ir įveskite jo {{ui:Sunaudojimas}} (gpm, arba L/s metrų projekte). Pasirinkite vamzdį ir nustatykite jo {{ui:Skersmuo}} (in arba mm) ir, jei žinote, jo Hazen–Williams C.

Kiekvienas pakeitimas yra vienas anuliavimo žingsnis. Delete pašalina mazgą ir vamzdžius, kurie į jį baigiasi.

## Ką reiškia kiekviena dalis

- **Vamzdis.** Ilgis matuojamas išilgai plano, nebent įvedate patys. C yra Hazen–Williams šiurkštumas (pradžioje 130, numatytąjį keiskite lange). Mažųjų nuostolių koeficientas K prideda posūkių ir jungiamųjų detalių nuostolius. Pažymėkite **Atbulinis vožtuvas** vamzdžiui, kuriuo vanduo negali tekėti atgal; **Uždarytas** vamzdis nepraleidžia nieko.
- **Rezervuaras.** Šaltinis su fiksuotu aukščiu – vandens lygis virš atskaitos lygio. Jis tiekia arba ima tiek, kiek reikia tinklui.
- **Bakas.** Lygis, kuris per parą keičiasi. Stacionariuose rezultatuose jis yra šaltinis dabartiniame lygyje.
- **Siurblys.** Vienas projektinis taškas (srautas ir aukštis) nusako įprastą kreivę per jį: aukštis esant nuliniam srautui yra 133 % projektinio aukščio, o aukštis lygus nuliui esant dvigubam projektiniam srautui. Siurblys niekada nestumia vandens atgal.
- **Slėgio reduktorius.** Palaiko jūsų nustatytą slėgį žemupyje, kai tiekimo slėgis aukštesnis. Kai tiekimo slėgis žemesnis, jis atviras ir nieko nepalaiko; jei vanduo tekėtų atgal, jis užsidaro.

## Rezultatų skaitymas

Lange rodomas kiekvieno mazgo aukštis ir slėgis bei kiekvienos jungties srautas, greitis ir nuostolių aukštis kas 1,000 ft (arba kas km), o mazgai plane nuspalvinti: žalia – tarp jūsų mažiausio ir didžiausio slėgio, raudona – žemiau, gintarinė – aukščiau. Srauto rodyklės rodo kryptį. Pasirinkite mazgą ar vamzdį, kad perskaitytumėte jo skaičius Ypatybėse.

Po lentelėmis pateikiamas sąrašas, į ką žiūrėti: žemas ar aukštas slėgis, vamzdis, kuriuo vanduo teka greičiau už jūsų ribą, mazgas, atjungtas nuo visų šaltinių, arba skaičiuoklė, kuri nepasiekė sprendinio. Tos pačios išvados yra skydelyje Problemos. Ribas nustatykite lange (pradžioje 20 psi, 100 psi ir 10 ft/s; metrų projekte – 140 kPa, 700 kPa ir 3 m/s).

## Gaisrinis debitas

{{ui:Gaisrinis debitas…}} pritaiko debitą viename mazge ir parodo ten esantį slėgį bei mažiausią slėgį bet kur tinkle. Taip pat randamas tame mazge galimas srautas, kol silpniausias tinklo mazgas išlaiko jūsų nurodytą likusį slėgį. Kiti sunaudojimai lieka tokie, kokie yra.

## Paros sunaudojimas

{{ui:Paros sunaudojimas…}} paleidžia tinklą valandomis. Sunaudojimo modelį nurodykite failo parametruose (kartojamų daugiklių sąrašas); bakai pildosi ir tuštėja pagal įtekantį ir ištekantį srautą, o siurblys gali sekti įjungimo / išjungimo modelį. Bakas, pasiekiantis aukščiausią ar žemiausią lygį, įvardijamas sąraše: CivilCraft už jus neuždaro jo įtekėjimo ar ištekėjimo, todėl tai skaitykite kaip „šis bakas per mažas arba siurblys per didelis“.

## EPANET tekstas

{{ui:Įrašyti kaip EPANET tekstą (.inp)}} įrašo tinklą formatu, kurį skaito daugelis vandens programų, o {{ui:Atidaryti EPANET tekstą (.inp)…}} nuskaito tokį failą. Perkeliama tik tai, ką modeliuoja CivilCraft: mazgai, rezervuarai, bakai, vamzdžiai, siurbliai su aukščio kreive, slėgio reduktoriai, sunaudojimo modeliai ir laikai. Kiti vožtuvų tipai, siurbliai, apibūdinti galia, ir kitos nuostolių formulės įvardijami ir paliekami. Failas turi naudoti tuos pačius vienetus kaip projektas.

## Hidrantai, vožtuvai ir jungiamosios detalės

Pasirinkite mazgą ir pažymėkite **Hidrantas**, kad jį ten įdėtumėte; pasirinkite magistralę ir paspauskite **Pridėti viduryje**, kad ant jos įdėtumėte vožtuvą, oro vožtuvą, išleidimo vožtuvą ar skaitiklį. Tai tinklo objektai: jie juda kartu su juo, o vienas anuliavimo žingsnis juos pašalina.

Išdėstymas taip pat numato jungiamąsias detales, ir CivilCraft jas išvardija be papildomo prašymo: **trišakis**, kur susitinka trys magistralės, **kryžius**, kur susitinka keturios, **alkūnė** (su kampu), kur dvi magistralės pasisuka 5° ar daugiau, **redukcija**, kur susitinka du dydžiai, ir **kamštis** aklame gale. {{ui:Jungiamųjų detalių žiniaraštis (CSV)}} jas suskaičiuoja ir magistrales pagal dydį. Tai, ką numato išdėstymas – kiekių skaičiavimas, kurį reikia patikrinti su savo detalėmis, o ne sąrašas užsakymui.

Magistralės klojamos žemės paviršiuje, atimant dangą (4 ft arba 1.2 m), kad jas būtų galima nubraižyti ir modeliuoti 3D; aukščiau aprašyti slėgiai niekada nuo to nepriklauso.

## Plane ir failuose

Planas, PDF ir DWG ar DXF perduoda magistrales sluoksnyje **C-WATR-MAIN**, jų dydžius – sluoksnyje **C-WATR-TEXT**, hidrantus – **C-WATR-HYDR**, vožtuvus – **C-WATR-VALV**, o jungiamąsias detales – **C-WATR-FITT**. LandXML eksportas rašo vandens vamzdynų tinklą (kiekvienam mazgui – konstrukcija, kiekvienai magistralei – vamzdis, hidrantai pavadinti); LandXML importas nuskaito jį atgal kaip vandentiekio magistrales, be sunaudojimų, siurblių ar vožtuvų, kurių LandXML nepalaiko. IFC eksportas magistrales rašo kaip vamzdžių segmentus, hidrantus, vožtuvus ir jungiamąsias detales vienoje vandens sistemoje. Šie failai patikrinti su mūsų pačių skaitymo ir rašymo įrankiais; išbandykite juos kitose savo programose ir praneškite, ką jos rodo.

## Kas dar neįgyvendinta

Vandens kokybė ir amžius, valdymas ir taisyklės, išskyrus siurblio įjungimo / išjungimo modelį, kiti vožtuvų tipai, sunaudojimas priklausomai nuo slėgio, vamzdžiai su kintančiu skersmeniu ir kanalizacijos tinklų srautai laike. Žr. [Dar neįgyvendinta](topic:not-built-yet). Sanitariniai projektiniai srautai, kurie yra kitas skaičiavimas, aprašyti [Sanitariniai projektiniai srautai](topic:sanitary-design).
