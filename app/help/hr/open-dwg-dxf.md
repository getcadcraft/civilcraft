---
title: Otvorite DWG ili DXF kao linije
summary: Otvorite linije crteža na tlocrtu, sloj po sloj, upotrijebite njegove izohipse, 3D polilinije i zatvorene obrise za teren te pretvorite njegove blokove točaka u geodetske točke.
keywords: provjera izmjere, kote u tekstu, dwg, dxf, cad, crtež, linije, izohipse, prijelomnice, granica, polilinija, 3D polilinija, slojevi, podložna karta, topo, geodetski crtež, blokovi, reference blokova, geodetske točke iz blokova, atributi, blokovi točaka, točka umetanja
from: da0f4c58
---

Topografska izmjera često stiže kao crtež: izohipse kao polilinije na svojoj visini, prijelomnice kao 3D polilinije, obris lokacije kao zatvorena polilinija. CivilCraft otvara **prostor modela** crteža kao slojeve na tlocrtu i može te linije pretvoriti izravno u teren.

## Otvorite crtež

1. Kliknite {{ui:Linije}} u grupi **Teren** (ili {{ui:Otvori}}, ili ispustite datoteku na tlocrt) i odaberite datoteku `.dwg` ili `.dxf`. Crtež se čita na ovom računalu; ništa se ne šalje. Čitaju se DWG od 2000. do 2018. i ASCII DXF.
2. Dijaloški okvir {{ui:Linije}} popisuje slojeve crteža koji sadrže linije, zatvorene oblike ili točke i imaju li **kote**. Slojevi koji su isključeni u crtežu počinju neoznačeni. Tekst, šrafure, kote i drugi objekti koji nisu linije broje se i izostavljaju (dijaloški okvir kaže koji).
3. Provjerite **Jedinice crteža**. Kad crtež kaže svoje jedinice, CivilCraft ih pretvara u jedinice projekta (milimetri u metre, metri u stope, palci u stope). Crtež u stopama čita se kao američke geodetske stope (US survey feet) bez skaliranja: razlikuju se za 2 dijela na milijun, a skaliranje koordinata ravninskog sustava (state plane) tom vrijednošću pomaknulo bi ih za nekoliko stopa. Kad crtež ne kaže svoje jedinice, njegovi se brojevi čitaju u jedinicama projekta; odaberite ispravne jedinice u popisu ako nisu.
4. U **Koristi za teren** odaberite što svaki sloj daje terenu (ili ostavite **Samo prikaži**). Slojevi nazvani kao izohipse (TOPO, CONT, CNTR) koji imaju kote počinju kao prijelomnice.
5. Kliknite {{ui:Dodaj}}. Slojevi se pojavljuju pod **GIS slojevi** u lijevoj ploči; svaka upotreba ulazi u teren. Svaki dio je zaseban korak: {{key:Mod+Z}} ih vraća jedan po jedan.

## Što može dati svaka vrsta sloja

| Sloj sadrži | Koristi za teren |
|---|---|
| Izohipse (polilinije na visini) | Prijelomnice na vlastitoj visini linija ili na polju ELEV |
| 3D polilinije | Prijelomnice na njihovim vlastitim visinama |
| Zatvoreni obris | Granica terena (najveći zatvoreni oblik ili onaj koji odaberete) |
| Točke s visinom | Geodetske točke, opisane nazivom sloja |
| Linije na visini 0 (linije tlocrta) | Ništa: ostaje na tlocrtu kao podložni crtež |

Crtež koji je zapisao CivilCraft sadrži svoje značajne linije kao 3D polilinije koje pamte svoje lukove. Tada dijaloški okvir prikazuje **Značajne linije**: ostavite oznaku da ih vratite kao značajne linije s lukovima i namjenama (jedan korak poništavanja) ili je uklonite da ih čitate kao linije kao i svaki drugi sloj.

Kasnije upotrijebite {{ui:Koristi za teren}} u izborniku sloja pod **GIS slojevi** da isto učinite za sloj koji ste samo prikazali.

## Geodetske točke iz blokova

Geodetski crteži često nose svoje točke kao blokove: mali simbol na svakom mjerenju, s atributima za broj točke, opis i visinu. Kad crtež ima reference blokova, dijaloški okvir ima odjeljak **Geodetske točke iz blokova**:

1. Označite blokove koje želite uzeti (tablica pokazuje koliko referenci ima svaki, na kojim slojevima i koje atribute), ili označite slojeve da uzmete svaku referencu bloka na njima.
2. Odaberite odakle dolaze **broj**, **opis** i **visina** svake točke: atribut, naziv bloka ili sloja, sljedeći slobodni brojevi ili Z točke umetanja. CivilCraft započinje s vjerojatnim atributima (PT, DESC, ELEV i slični) i visinu uzima iz atributa samo kad su blokovi na nuli.
3. Uklonite oznaku slojeva linija ako želite samo točke, zatim kliknite {{ui:Dodaj}}.

Svaka referenca postaje jedna geodetska točka na svojoj točki umetanja. Računaju se samo reference postavljene u prostoru modela; blokovi ugniježđeni u druge blokove ne. Brojevi koji već postoje u projektu ili su u crtežu upotrijebljeni dvaput dobivaju nove brojeve iza najvećeg, a atribut visine koji nije broj ostavlja tu točku bez visine; statusna traka broji oboje. Crtež se nikad ne mijenja, a svaka točka pamti svoj blok: njezina **Svojstva** prikazuju **Iz bloka** s blokom, slojem i oznakom (handle). Dodavanje točaka je jedan korak, pa ih {{key:Mod+Z}} uklanja sve.

## Kote zapisane kao tekst i provjera

Točkaste kote zapisane kao tekst (ili u atributu bloka koji nije blok geodetske točke) nisu linije. Odjeljak **Geodetske kote i provjera** može ih uzeti kao geodetske točke i popisuje što nije u redu s crtežom: jedinice, koordinatni sustav, udaljenost od nule, ravne izohipse, čudne kote, udvostručene točke. Vidi [Provjera geodetskog crteža pri uvozu](topic:survey-check).

## Kako se crtež čita

- Lukovi, kružnice, elipse, zakrivljeni segmenti polilinija i splajnovi postaju kratki ravni dijelovi (najviše svakih 5°).
- Reference blokova crtaju se gdje su postavljene, uključujući i ugniježđene blokove; ono što blok sadrži na sloju 0 preuzima sloj reference.
- Objekti nacrtani u drugoj ravnini (drugačiji smjer izvlačenja) postavljaju se u svjetske koordinate.
- Svaki objekt dobiva tri polja: LAYER, TYPE (vrsta objekta) i ELEV (njegova visina kad sve njegove točke imaju istu).
- Koordinate se uzimaju kakve jesu: crtež mora koristiti iste koordinate kao projekt (primjerice istu zonu ravninskog sustava). Vanjske reference (xref) se ne otvaraju: otvorite ih zasebno.

:::tip
Crtež izohipsi daje najbolji teren uz nekoliko točkastih kota na vrhovima i u udubinama, gdje izohipse same ostavljaju ravne trokute. Dodajte ih kao geodetske točke ili iz sloja točaka u crtežu.
:::
