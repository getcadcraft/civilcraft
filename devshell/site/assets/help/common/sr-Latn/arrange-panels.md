---
title: Raspoređivanje panela i korišćenje drugog monitora
summary: Zakačite bočne panele levo, desno ili pri dnu, slažite ih, grupišite ih kao kartice, prikačite ili sakrijte, pustite ih da lebde preko crteža, zbijte raspored, izaberite koliko redova ima traka sa alatima ili ih premestite u sopstveni prozor na drugom ekranu.
keywords: paneli, zakači, pusti da lebdi, premesti panel, prevuci, raspored, kartice, grupa kartica, slaganje, pribadača, automatsko skrivanje, sakrij panel, zatvori panel, zbijeno, gustina rasporeda, redovi alatki, prelomi, 1 red, 2 reda, redovi trake, drugi monitor, dva ekrana, dvostruki monitor, više monitora, prozor, iskačući prozor, vrati raspored
from: 32a8dae2
---

Paneli pored crteža mogu da se pomeraju. Postavite ih gde vam odgovara ili im dajte sopstveni prozor na drugom monitoru, pa crtež zauzima ceo prvi.

:::note
Svaki panel ima naslovnu traku: tanku traku sa imenom panela, meni {{ui:⋯}}, pribadaču i dugme za zatvaranje na vrhu panela. Verzije pre 0.7 imaju samo ime i meni {{ui:⋯}}.
:::

## Pomeranje panela u prozoru

1. Prevucite panel za njegovo ime na vrhu.
2. Dok prevlačite, pojavljuju se označene oblasti levo, desno i pri dnu crteža. Ispustite panel na jednu od njih da se zakači tamo. Oblast nad kojom ste potamni.
3. Ispustite ga bilo gde drugde preko crteža da lebdi.

Paneli mogu da dele jednu stranu: slažu se, a svaka linija između dva od njih prevlačenjem deli prostor (kad je linija u fokusu, strelice je pomeraju, a dvostruki klik je deli ravnomerno). Prevucite unutrašnju ivicu zakačene strane da bude šira ili uža; dvostruki klik na ivicu je vraća.

Lebdeći panel ostaje preko crteža. Pomerajte ga za ime, a menjajte mu veličinu prevlačenjem donjeg desnog ugla (ili dođite tabulatorom do ugla i koristite strelice). Dvostruki klik na njegovo ime ga zakači ponovo tamo gde je bio.

:::touch
Prevucite jednim prstom za ime panela. Donji desni ugao lebdećeg panela prevucite jednim prstom da promenite veličinu, a ivice između zakačenih panela isto. Da pustite da lebdi ili zakačite bez prevlačenja, koristite meni {{ui:⋯}}.
:::

## Grupisanje panela u kartice

Dva panela mogu da dele jedan okvir i da prikazuju po jedan u isto vreme. Prevucite panel za ime na naslovnu traku drugog panela (traka je označena dok ste iznad nje) i pustite: okvir sada ima karticu za svaki panel, u svojoj naslovnoj traci. Kliknite karticu da prikažete taj panel. Kad je kartica u fokusu, {{key:Left}} i {{key:Right}} menjaju kartice, a {{key:Home}} i {{key:End}} idu na prvu i poslednju.

Da izvučete panel iz grupe, izaberite {{ui:Izbaci iz grupe kartica}} u njegovom meniju {{ui:⋯}}, ili ga prevucite negde drugde. Izaberite {{ui:Grupiši u karticu sa}} i ime panela da ih grupišete bez prevlačenja.

## Pribadača, sakrivanje i vraćanje

- Pribadača na naslovnoj traci panela ga čini **automatskim skrivanjem**: panel napušta svoje mesto i postaje mala kartica na toj ivici. Pokazivač na karticu, fokus ili klik na nju izvlače panel preko crteža; kad se odmaknete (ili pritisnete {{key:Esc}}), on se vraća. Pritisnite pribadaču ponovo, ili izaberite {{ui:Otpni}}, da ga trajno zakačite.
- Dugme za zatvaranje ili {{ui:Sakrij ovaj panel}} u meniju sakriva panel i sažima njegov okvir. Isprekidana kartica na ivici ga vraća: kliknite je, ili je fokusirajte i pritisnite {{key:Enter}}.

## Zbijanje rasporeda

{{ui:Podešavanja}} › {{ui:Opšte}} › {{ui:Gustina rasporeda}} ima dva izbora. {{ui:Udobno}} je podrazumevano. {{ui:Zbijeno}} sužava visine redova, unutrašnje razmake panela, dugmad na traci sa alatima i tekst panela te aplikacije, da stane više na ekranu. Čuva se za svaku aplikaciju. Ekran osetljiv na dodir zadržava velika dugmad u oba, a telefon zadržava svoj raspored. {{ui:Vrati raspored}} ne menja gustinu koju ste podesili.

## Izbor broja redova trake sa alatima

{{ui:Podešavanja}} › {{ui:Opšte}} › {{ui:Redovi alatki}} ima tri izbora. {{ui:Prelomi}} je podrazumevano: svaka grupa alata se prikazuje, u onoliko redova koliko treba. {{ui:2 reda}} drži traku na dva reda, a {{ui:1 red}} na jednom, pa crtež dobija visinu; grupe koje ne staju se pomeraju u stranu unutar trake (koristite točkić miša, dvoprstni pomak ili {{key:Tab}} do alata). Traka koja već staje u dva reda ostaje kakva jeste pod {{ui:2 reda}}, jer bi mreža samo bila viša. Izbor se čuva za svaku aplikaciju. Ekran osetljiv na dodir i telefon zadržavaju svoj raspored. CadCraft ima sopstveno podešavanje za svoju traku, pod {{ui:Podešavanja}} › {{ui:CadCraft}}.

## Korišćenje tastature

Dugme {{ui:⋯}} svakog panela otvara meni: {{ui:Zakači levo}}, {{ui:Zakači desno}}, {{ui:Zakači pri dnu}}, {{ui:Lebdi preko crteža}}, {{ui:Prikači za ivicu}}, {{ui:Sakrij ovaj panel}}, {{ui:Grupiši u karticu sa}} drugi panel, {{ui:Premesti u novi prozor}} i {{ui:Vrati ga}}. Tabulatorom dođite do dugmeta, pritisnite {{key:Enter}}, pomerajte se strelicama i ponovo pritisnite {{key:Enter}}. {{key:Esc}} zatvara meni.

## Stavljanje panela na drugi monitor

1. Izaberite {{ui:⋯}} na panelu, pa {{ui:Premesti sve panele u novi prozor}}. Možete izabrati i {{ui:Premesti panele u novi prozor}} u {{ui:Podešavanja}}.
2. Otvara se mali prozor sa panelima. Prevucite ga na drugi monitor i napravite ga koliko god želite velikim.
3. Nastavite da radite: paneli deluju na crtež kao i pre, a crtež ispunjava glavni prozor.

Prečice rade dok je prozor sa panelima ispred: tasteri koje tu pritisnete, osim kad kucate u polje, idu na crtež. Pitanja i dijalozi koje aplikacija postavlja i dalje se otvaraju u glavnom prozoru, pa tamo gledajte kad se pojavi jedan. Tema i veličina teksta panela prate glavni prozor.

:::chromium
Chrome i Edge mogu sami da postave prozor na drugi ekran. Kad je drugi ekran povezan, izaberite {{ui:Stavi ga na moj drugi ekran}} u prozoru sa panelima (ili {{ui:Stavi panele na moj drugi ekran}} u meniju {{ui:⋯}} panela). Pregledač jednom pita da li sajt sme da vidi vaše ekrane; kad to dozvolite, prozor sa panelima se otvara na tom ekranu svaki put.
:::

:::firefox safari
Prevucite prozor sa panelima na drugi monitor sami. Sledeći put se otvara na istom mestu i u istoj veličini.
:::

## Više prozora sa panelima

Svaki panel može da ima sopstveni prozor: do četiri prozora sa panelima, na primer po jedan za svaki monitor.

- U meniju {{ui:⋯}} panela, {{ui:Premesti u novi prozor}} otvara još jedan prozor za taj panel, a {{ui:Premesti u prozor panela 2}} (i tako dalje) ga premešta u onaj koji je već otvoren. Drugi prozor se zove „paneli 2“.
- Prevucite panel za ime iz jednog prozora u drugi: pustite iznad glavnog prozora da se tamo zakači (označene oblasti se vide dok ste iznad njega) ili da lebdi, a iznad drugog prozora sa panelima da se prebaci u njega. Pustite bilo gde drugde i ostaje tamo gde je bio.
- Prozor sa panelima koji nema više panela zatvara se sam.

Posle ponovnog učitavanja aplikacija ponudi vaše prozore sa panelima ponovo. Pregledači otvaraju jedan prozor po kliku, pa izaberite {{ui:Otvori sledeći}} po jednom za svaki prozor.

## Pomeranje dijaloga

Svaki dijalog može da se pomeri s puta crteža: pritisnite i prevucite njegovu naslovnu traku. Dijalog pamti gde ste ga ostavili, svaki za sebe, i vraća se na to mesto kad se sledeći put otvori. Dvostruki klik na naslovnu traku ga ponovo centrira.

S tastature, pritisnite {{key:Alt}}+{{key:Shift}}+strelicu dok je fokus unutar dijaloga da ga pomerate po 16 piksela; dodajte {{key:Ctrl}} za 64. Dijalog koji se nađe van ekrana (posle manjeg prozora ili ekrana) vraća se.

Na telefonu dijalozi ostaju listovi pune širine i ne pomeraju se.

U CadCraft Studio, u dijalogu {{ui:Štampa u PDF}}, koji možete ostaviti otvoren dok radite, nalazi se dugme u naslovnoj traci: {{ui:Otvori u sopstvenom prozoru}}. Dijalog prelazi u sopstveni prozor koji možete staviti na drugi monitor. Zatvaranje dijaloga zatvara prozor, a zatvaranje prozora zatvara dijalog.

## Vraćanje panela

- Izaberite {{ui:Vrati panele}} u prozoru sa panelima, ili ga jednostavno zatvorite. Paneli se vraćaju tamo gde su bili.
- Zatvaranje ili ponovno učitavanje glavnog prozora zatvara i prozor sa panelima. Kad se aplikacija ponovo otvori, kaže da su vaši paneli bili u sopstvenom prozoru; izaberite {{ui:Otvori ga}} da vratite prozor, ili {{ui:Zadrži ih ovde}}.
- {{ui:Podešavanja}} › {{ui:Opšte}} › {{ui:Vrati raspored}} vraća svaki panel na mesto gde je počeo.

:::tip
Ako se ništa ne otvori kad premestite panele u novi prozor, pregledač je blokirao iskačući prozor. Aplikacija to kaže i ostavlja panele gde su bili. Dozvolite iskačuće prozore za getcadcraft.com, pa pokušajte ponovo.
:::

Raspored se čuva za svaku aplikaciju u ovom pregledaču, zajedno s ostalim podešavanjima.
