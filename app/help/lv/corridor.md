---
title: Ceļa koridora izvilkšana
summary: Ieslēdziet koridoru trasei, iestatiet joslas, uzkalniņa un sānu nogāzes vērtības un izlasiet griezumus, nogāzes robežlīnijas un zemes darbus, ko tas rada.
keywords: virsaugstināšana, super, sasvēršana, pārejas posms, izlīdzināšanas posms, pārejas tabula, šķērsslīpums, pagriezšana, koridors, sastāvs, apakšsastāvs, tipiskais šķērsgriezums, ceļš, josla, uzkalniņš, šķērsslīpums, sānu nogāze, nogāzes robeža, griezums, uzbērums, griezumi, mērķis, mērķi, platuma mērķis, augstuma mērķis, nobīdes mērķis, platināšana, seko citam koridoram
from: 91303189
---

Koridors izvelk vienu vienkāršu tipisko šķērsgriezumu (sastāvu) gar trasi un tās projektēto profilu, pielāgo to esošajam terēnam un pievieno rezultātu projektētajai virsmai. Trasei var būt vairāki koridori dažādos piketu diapazonos, un koridoru var veidot no atkārtoti lietojamām veidnēm pēc piketa ([Koridoru veidnes](topic:corridor-templates)). Zemāk esošais vienkāršais sastāvs ir vienāds abās pusēs; lai katrai pusei dotu savas daļas, skat. [Katru pusi veidot no daļām](topic:corridor#build-each-side-from-parts).

## Sastāvs

No centrālās līnijas uz āru katrā pusē:

1. **josla** ar noteiktu platumu, kas krīt prom no uzkalniņa ar **joslas slīpumu**
2. **uzbrauktuve** ar noteiktu platumu pie **uzbrauktuves slīpuma**
3. **sānu nogāze** no uzbrauktuves malas līdz vietai, kur tā satiekas ar terēnu: **griezuma nogāze**, kur terēns ir augstāk, un **uzbēruma nogāze**, kur tas ir zemāk

Sākuma vērtības ir vietturi, nevis projektēšanas standarts:

| Vērtība | ASV pēdas | Metri |
|---|---|---|
| Joslas platums | 12 ft | 3.6 m |
| Joslas slīpums | 2% | 2% |
| Uzbrauktuves platums | 4 ft | 1.2 m |
| Uzbrauktuves slīpums | 4% | 4% |
| Griezuma nogāze | 2 : 1 | 2 : 1 |
| Uzbēruma nogāze | 3 : 1 | 3 : 1 |
| Šķērsgriezums ik pēc | 10 ft | 5 m |

Sānu nogāžu slīpumi ir horizontāli pret vertikāli (H:V): 3 : 1 nozīmē 3 pāri uz 1 uz leju.

## Veidot koridoru

Jums vajag trasi bez kļūdām un projektētu profilu ar vismaz diviem PVI un bez kļūdām.

1. Izvēlieties trasi.
2. Labajā panelī, sadaļā **Koridors**, atzīmējiet **Izvilkt sastāvu gar projektēto profilu**.
   Lauki parādās, un koridors tiek veidots uzreiz. Plānā redzamas joslas un uzbrauktuves malas un nogāzes robežlīnijas; ja sadaļā **Attēlojums** izvēlēts {{ui:Projektētā (ar slīpumiem)}}, horizontāles rāda jauno terēnu.
3. Mainiet jebkuru vērtību: **Joslas platums**, **Joslas slīpums**, **Uzbrauktuves platums**, **Uzbrauktuves slīpums**, **Griezuma nogāze**, **Uzbēruma nogāze**, **Šķērsgriezums ik pēc**. Pēc katras nospiediet {{key:Enter}}. Griezuma, uzbēruma un šķērsgriezuma soļa vērtībām jābūt lielākām par 0.
4. Izlasiet rindu zem laukiem, piemēram, „39 šķērsgriezumi no 0+00.00 līdz 3+86.36; griezums 240.2 kub. jardi, uzbērums 556.0 kub. jardi.“

Šķērsgriezumi tiek veidoti ik pēc soļa **Šķērsgriezums ik pēc**, galos un katras horizontālās un vertikālās līknes sākumā un beigās. Katrs šķērsgriezums un līnijas caur tiem (centrālā līnija, joslas un uzbrauktuves malas, nogāzes robeža) kļūst par projektētās virsmas lūzumlīnijām.

Lai izslēgtu koridoru, noņemiet atzīmi no lodziņa. Tā vērtības tiek paturētas nākamreizei.

## Kad tas nav izveidots

Sarkans lodziņš zem laukiem norāda, kāpēc:

| Ziņojums | Ko darīt |
|---|---|
| „Koridoram vajag projektētu profilu bez kļūdām.“ | Pievienojiet PVI vai salabojiet pārklājošās vertikālās līknes (skat. [Projektēt vertikālo profilu](topic:profile)). |
| „Projektētais profils nepārklājas ar trasi.“ | Pārvietojiet PVI uz trases piketu diapazonu. |
| „Koridoram virsmā vajag vismaz divus šķērsgriezumus.“ | Lielākā daļa koridora ir ārpus esošā terēna. |
| „4 sānu nogāzes iziet ārpus virsmas, pirms sasniedz terēnu.“ | Virsmas malas tuvumā nogāze nevar sasniegt terēnu. Turiet ceļu tālāk no malas vai pazeminiet uzbērumu vai griezumu tur. |
| „Koridora nogāzes robežlīnijas krustojas (šķērsgriezumi pārklājas, piemēram, šaurā līkuma iekšpusē). Izmantojiet lielāku rādiusu vai šaurāku sastāvu.“ | Šķērsgriezumi ass līkuma iekšpusē pārklājas. Palieliniet rādiusu vai sašaurinājiet sastāvu. |

Koridors ar problēmu netiek iestrādāts terēnā un neskaitās zemes darbos.

## Koridori un platformas kopā

Projektētā virsma tiek veidota secīgi: vispirms katrs koridors, tad katra platforma. Kur platformas nolīdzināšana pārklājas ar koridoru, uzvar platforma. Tilpumi tiek aprēķināti visu nogāzes robežlīniju iekšienē kopā; skat. [Zemes darbu tilpumi](topic:volumes).

## Virsaugstināšana

Līkumā ceļš var sasvērties uz iekšpusi, tāpēc satiksme tiek mazāk stumta uz āru. Trases **Rekvizītos** sadaļā **Virsaugstināšana** atzīmējiet **Virsaugstināt līkumus**:

- Katrs apļveida līkums iegūst likmi **e** no pārejas tabulas: pirmo rindu, kuras rādiusu līkums sasniedz (rinda ar tukšu likmi saglabā parasto uzkalniņu). Tabula un **Maksimālais relatīvais gradients** (sākotnēji 0.5 %) ir vietturi, nevis standarts: iestatiet tos pēc saviem projektēšanas kritērijiem. Pievienojiet vai noņemiet rindas pēc vajadzības.
- Joslas griežas ap centrālo līniju. Pirms līkuma ārējā josla izlīdzinās **izlīdzināšanas posmā** (parastais uzkalniņš ÷ e × pārejas garums), tad **pārejas posmā** (joslas platums × e ÷ gradients) ārējā josla turpina griezties, līdz visa ceļa virsma slīpst ar e uz iekšpusi; divas trešdaļas pārejas posma atrodas pirms līkuma un viena trešdaļa uz tā. Pēc līkuma notiek tas pats pretējā secībā.
- Zemā puses uzbrauktuve nekad nav lēzenāka par savu joslu; augstajā pusē tā saglabā savu slīpumu (tā ripo pāri).
- Tabulā zem tā uzskaitīts katra līkuma rādiuss, likme, pārejas posms un izlīdzināšanas posms un vietas, kur sākas un beidzas pilna virsaugstināšana. **Virsaugstināšanas shēma** zīmē abu joslu šķērsslīpumus pa piketiem (kreisā josla ar nepārtrauktu līniju, labā ar punktētu).
- Līkums, kas ir pārāk īss, lai sasniegtu pilnu virsaugstināšanu, vai divi līkumi, kuru pārejas pārklājas, tiek norādīti lodziņā virs tabulas.

Šķērsgriezumi, tilpumi, 3D skats un lapas visi rāda sasvērto ceļu. Katra izmaiņa ir viens solis: {{key:Mod+Z}} to atsauc.

## Mērķi

Mērķis pārvieto vienu ceļa pusē esošu punktu uz līniju: **Braucamās daļas mala** vai **Uzbrauktuves mala**, pa **Kreisi** vai **Labi**. Katrs šķērsgriezums satiek līniju taisni pret centrālo līniju, iznākot uz āru tikai šajā pusē, tāpēc labās puses mērķis nekad nepārvieto kreiso pusi.

| Iestata | Kas notiek vietā, kur šķērsgriezums satiek līniju |
|---|---|
| **Platums** | Punkts atrodas uz līnijas: josla (vai uzbrauktuve) paplašinās vai sašaurinās līdz tai, paturot savu šķērsslīpumu. |
| **Augstums** | Punkts tur iegūst līnijas augstumu, savā nobīdē: joslas (vai uzbrauktuves) šķērsslīpums seko tam. |

Līnija var būt raksturlīnija (neatkarīgi no tās **Lietošanas**) vai cita koridora līnija: tā centrālā līnija, braucamās daļas malas, uzbrauktuves malas vai nogāzes robežlīnijas. Koridora līnija seko šim koridoram: mainiet otru ceļu, un šis seko. CivilCraft vispirms veido otru koridoru; divi koridori, kas mērķētu viens uz otru cilpā, vienā pusē tiek noraidīti, un tabula norāda, kurš.

1. Izvēlieties trasi un ieslēdziet tās koridoru.
2. Sadaļā **Mērķi** noklikšķiniet uz {{ui:Pievienot mērķi}}.
3. Izvēlieties **Pusi**, **Punktu**, ko tas **Iestata**, un **Līdz līnijai**. Katrs solis ir viens atsaukšanas solis.

**Rezultāts** norāda, pie cik šķērsgriezumiem līnija tika sasniegta. Šķērsgriezumi, kas to nesasniedz (aiz tās galiem vai aiz centrālās līnijas), paturē sastāva vērtības. Ja līnija tiek dzēsta, koridors atgriežas tādā stāvoklī, kāds tas bija pirms mērķa, un tabula to norāda. Vienai pusei var būt viens platuma un viens augstuma mērķis katram punktam.

## Katru pusi veidot no daļām

Ieslēdziet **Katru pusi veidot no daļām** zem koridora iestatījumiem. Katrai pusei tad ir savs saraksts no centrālās līnijas uz āru: joslas, uzbrauktuve, notekas, bordiūrs, zaļā josla, ietve un beigās sānu nogāze līdz terēnam (ar saviem griezuma un uzbēruma attiecībām). Sāciet no {{ui:Lauku ceļš}} vai {{ui:Pilsētas iela}}, pievienojiet un noņemiet daļas, pārvietojiet tās ar bultiņām un {{ui:Kopēt}} vienu pusi uz otru. Katra izmaiņa ir viens atsaukšanas solis.

Šķērsslīpums ir slīpums prom no ceļa, tāpēc ietve, kas notek uz ceļa pusi, ir negatīva. Bordiūrs ir sejas ar jūsu norādīto augstumu, virsotne ar jūsu norādīto platumu un pēc izvēles nokrišana aizmugurē. Virsaugstināšana pagriež katru joslu pirmajā rindā; notekas, bordiūrs, zaļā josla un ietve karājas no uzbūvēto joslu malas. Mērķi joprojām pārvieto joslu galu un pēdējo daļu. Šķērsgriezumi atzīmē notekas līniju, bordiūra augšu un aizmuguri un pārējo. Līkumā ar spirālēm pārejas posms ir spirāle: līmenisks uzkalniņš TS, pilna virsaugstināšana SC.

## Segumu slāņi

Joslai, uzbrauktuvei, notekai, zaļajai joslai vai ietvei var būt savs uzbūves slānis: zem daļas, {{ui:Pievienot slāni}} pievieno slāni ar nosaukumu, materiālu, biezumu un tā veidu (virsma, saistviela, pamats, apakšpamats, pārsegums vai cits), no augšas uz leju. Slāņi nepārvieto ceļa virsmu (tās augša ir projektētā virsma); katrs atrodas zem savas daļas, tā dziļums mērīts taisni uz leju. Šķērsgriezumi zīmē katra slāņa apakšu kā punktētu līniju, un {{ui:Segumu slāņi: daudzumi}} uzskaita katra slāņa plāna laukumu un tilpumu (laukums gar koridoru no tā šķērsgriezumiem, tilpums = laukums × biezums). IFC eksports ieraksta katru slāni kā savu elementu ar tā biezumu un materiālu (skat. [IFC eksports un imports](topic:ifc)). Biezums, ko ierakstāt, ir jūsu: CivilCraft neizmēro segumus.

## Kas vēl nav izveidots

Nogāzes robežlīnijas slīpumam mērķi vēl nav pieejami. Koridoram, kas mainās gar ceļu ar atsevišķi kreiso un labo pusi, izmantojiet [Koridoru veidnes](topic:corridor-templates). Skat. [Vēl nav izveidots](topic:not-built-yet).
