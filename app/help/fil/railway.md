---
title: Mag-design ng railway track
summary: Gawing railway ang alignment: rail transitions (clothoid, cubic parabola, Bloss, Helmert, sine half-wave, sine), cant sa bawat kurba kasama ang equilibrium cant nito, deficiency at excess, mga limitasyon ng cant at track geometry bilang babala, turnout at crossover ayon sa station, clearance envelope na dinadaan sa linya, at track na may riles, sleepers at ballast bed na itinayo bilang corridor, sa plan, sections, profile, 3D at quantities.
keywords: railway, riles, railroad, track, tren, metro, tram, cant, superelevation, cant deficiency, cant excess, equilibrium cant, transition, transition curve, clothoid, cubic parabola, bloss, helmert, sine half-wave, cosine, gauge, standard gauge, broad gauge, metre gauge, narrow gauge, sleeper, tie, crosstie, ballast, sub-ballast, formation, cess, sentro ng track, 60E1, 54E1, UIC60, 115RE, 136RE, cant gradient, rate ng pagbabago ng cant, turnout, switch, points, crossover, frog, frog number, lead, closure curve, diverging speed, clearance, clearance envelope, structure gauge, loading gauge, kinematic envelope, platform, platform gap, espasyo ng track, gradient, vertical curve, pinakamaliit na radius, LandXML cant
from: 99de9745
---

Anumang alignment ay puwedeng maging railway track. Ang mga kurba nito ay magkakaroon ng rail transitions at cant (ang superelevation ng mga riles), at ang corridor nito ay itatayo bilang track: mga riles na nakapatong sa sleepers sa ibabaw ng ballast bed, at ihahanay sa lupa na parang kalsada. Maaaring ilagay ang mga turnout at crossover sa track ayon sa station, at maaaring dagdagan ng clearance envelope ang linya at suriin laban sa mga bagay na nasa tabi ng track.

Bawat numero sa ibaba ay isang **placeholder**, hindi standard. Itinatakda ng mga riles ang kanilang limitasyon ayon sa line speed, uri ng track at bansa; itakda ang mga ito ayon sa standard ng sarili mong riles. Walang pambansang talahanayan na kasama ang CivilCraft.

## Gawing railway ang alignment

1. Piliin ang alignment at hanapin ang **Railway** sa Properties.
2. Lagyan ng tsek ang **This alignment is a railway track**. Bawat pagbabago ay isang hakbang sa I-undo.
3. Itakda ang **Design speed** sa itaas ng Properties ng alignment: ito ang line speed na sinusuri laban sa cant. Ang **Slowest trains** (sa Railway block) ang bilis na sinusuri laban sa cant excess.

## Mga transition

Bigyan ang bawat kurba ng spiral length sa magkabilang dulo sa PI table (**Spiral in**, **Spiral out**), pagkatapos piliin ang uri nito sa curve table ng Railway block, o gamitin ang **Transition for every curve**:

| Uri | Curvature sa kahabaan ng transition |
|---|---|
| Clothoid | lumalaki nang pantay (ang road spiral) |
| Cubic parabola | y = x³ / (6·R·L), kung saan ang L ay sinusukat sa tangent; medyo mas mahaba ang mismong kurba |
| Bloss | 3u² − 2u³ ng buong curvature (u = bahagi ng haba): dahan-dahang nagsisimula at nagtatapos |
| Helmert | dalawang parabola, 2u² at pagkatapos 1 − 2(1 − u)² |
| Sine half-wave | (1 − cos πu) / 2 |
| Sine | u − sin(2πu) / 2π |

Ang lahat maliban sa cubic parabola ay umiikot ng L / 2R, katulad ng clothoid. Tumatakbo ang mga station sa tunay na haba. Pinananatili ng LandXML ang uri (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Cant

I-type ang **Cant** ng bawat kurba sa millimetro. Ipinapakita ng talahanayan para sa bawat kurba:

- **Equilibrium** cant = G·v² / (g·R), kung saan ang G ay ang distansya ng mga sentro ng riles (**Rail centres**, ang gauge kasama ang lapad ng ulo ng riles maliban kung ito ang i-type mo). Kapag G = 1500 mm, ito ang pamilyar na 11.8·V² / R (V sa km/h, R sa m).
- **Deficiency** = equilibrium sa line speed − inilapat na cant.
- **Excess** = inilapat na cant − equilibrium sa bilis ng pinakamabagal na tren.
- **Ramp**: ang pinakamatarik na cant gradient sa kahabaan ng mga ramp nito, sa mm bawat metro.

Umaakyat ang cant sa bawat transition, hinuhubog ayon sa curvature nito: tuwid para sa clothoid o cubic parabola, hugis-Bloss para sa Bloss, at iba pa. Ang dulo ng kurba na walang transition ay umaakyat sa tuwid bago ito, hangga't kailangan ng limitasyon ng cant gradient, at sinasabi ito ng sistema: nagbabago ang cant kung saan hindi nagbabago ang curvature.

**Cant turns about** ay nagsasabi kung aling riles ang nananatili sa design profile: **the low rail** (ang karaniwan), **the inner rail**, o **the track centre** (bawat riles ay gumagalaw ng kalahati ng cant). Ang design profile ay ang tuktok ng riles doon.

Ipinapakita ng **Cant diagram** ang taas ng bawat riles sa ibabaw ng profile sa kahabaan ng mga station; ang profile view at ang plan at profile sheets ay nakakakuha ng parehong bilang banda sa ilalim ng profile.

## Mga limitasyon at babala sa cant

Ang **Most applied cant**, **Most cant deficiency**, **Most cant excess**, **Steepest cant gradient** at **Fastest change of cant** (ang gradient sa line speed, sa mm/s) ay sinusuri sa bawat kurba. Ang halagang lampas sa limitasyon ay babala sa Railway block at sa Problems panel, kasama ang limitasyon at ang natagpuang halaga. Kapag walang design speed, hindi sinusuri ang deficiency at ang rate of change (may tala na nagsasabi nito).

## Ang track

Itakda ang **Gauge** (mga preset na standard 1435 mm, broad, metre o narrow, o sarili mo), ang **Rail section** (60E1, 54E1, 49E1, 115RE, 136RE: ang inilathalang sukat lamang nila), ang bilang ng **Tracks** at ang kanilang **Track centres**, pagkatapos ang **Sleepers and ballast**: materyal ng sleeper, haba, lapad, lalim at spacing; lalim ng ballast sa ilalim ng sleeper (sa mababang riles), shoulder, slope, at gaano kababa ang tuktok nito kumpara sa sleepers; lalim ng sub-ballast, ang cess lampas sa dulo ng ballast, at ang cross fall ng formation.

Pindutin ang **Build the track**. Ina-on nito ang corridor ng alignment, itinayo bilang track sa kahabaan ng design profile: ang mga riles at sleepers ay humuhilig kasabay ng cant, hindi ang formation. Ang mga daylight slope ay bumababa mula sa cess edge sa cut at fill slopes ng corridor, at ang track ay ihahanay sa proposed surface na parang kalsada.

- **Plan**: parehong riles ng bawat track (layer C-RAIL-TRAK) at, kapag higit sa isang track, ang sentro ng bawat track (C-RAIL-CNTR), sa screen, sa DXF, DWG, PDF at sa plan and profile sheets.
- **Sections**: ang sleepers, riles, at ang ilalim ng ballast at ng sub-ballast sa bawat section.
- **3D**: ang mga riles, bawat sleeper at ang ballast bed (Show › Track), pati sa GLB, OBJ at USD.
- **Quantities**: haba ng track, riles (parehong riles ng bawat track, kasama ang sariling linya ng bawat track), sleepers, ang ballast bed at ang ballast na binawasan ng sleepers, at ang sub-ballast, sa pamamagitan ng average end areas sa pagitan ng mga section.

## Pagsusuri sa geometry ng track

Bukod sa cant, sinusuri ng Railway block ang mismong linya laban sa anim pang limitasyon (lahat placeholder, lahat ikaw ang magtatakda):

- **Steepest gradient** ng design profile, sa mm bawat metro.
- **Least vertical curve radius**, bilang factor k sa R ≥ k·V² (R sa metro, V sa km/h). Ang parabolic vertical curve na may haba L sa pagitan ng dalawang gradient ay may radius na L hinati sa pagbabago ng gradient.
- **Shortest vertical curve**.
- **Least curve radius** sa plan (ang 0 ay pinapatay ang pagsusuri).
- **Shortest arc or straight**, bilang segundo ng biyahe sa line speed: ang circular arc, o ang tuwid sa pagitan ng dalawang kurba, na mas maikli sa distansyang iyon ay may babala. Ang 1.8 s ay ang pamilyar na "kalahati ng bilis sa km/h, sa metro".
- **Rate of change of cant deficiency** sa kahabaan ng bawat transition, sa mm/s sa line speed.

Naglilista ang **Track geometry** ng pinakamatarik na gradient na natagpuan at bawat vertical curve kasama ang radius nito at ang radius na kailangan ng line speed. Ang vertical curve na nasa transition o cant ramp ay may tala. Kapag walang design profile o design speed, nilalaktawan ang mga pagsusuring nangangailangan nito at may tala na nagsasabi nito.

## Turnouts at crossovers

Sa ilalim ng **Turnouts and crossovers**, pindutin ang **Add a turnout**. Ilalagay ito sa pinakamahabang tuwid; itakda sa talahanayan:

- **Switch toe station**: kung saan magsisimula ang turnout sa alignment na ito.
- **Frog**: ang frog number N (1:N). Ang frog angle ay 2·atan(1 / 2N).
- **Side**: kaliwa o kanan, tumitingin pataas ang station.
- **Crossover spacing** sa metro: kapag higit sa 0, ang turnout ay nagiging crossover papunta sa parallel na track na ganoon kalayo (dalawang turnout at ang tuwid sa pagitan ng mga ito).

Ipinapakita ng talahanayan ang **Lead** (switch toe hanggang frog), ang **Radius** ng closure curve, at ang **Diverging speed** na pinapayagan ng radius na iyon sa limitasyon ng cant deficiency mo at walang cant. Ginagawang sariling alignment ng **Make its track** ang diverging route (ang switch, ang closure curve, pagkatapos tuwid sa frog angle) na may parehong railway settings, handa nang pahabain.

Ipinapakita ng plan ang dalawang diverging rail ng bawat turnout, ang centreline nito, isang tick sa switch toe at sa frog, at ang "1:N" (layer C-RAIL-TURN), sa screen at sa DXF, DWG, PDF at sheets. Ipinapakita ng 3D view ang diverging rails sa antas ng pangunahing track.

Placeholder ang hugis: isang tuwid na switch at isang closure curve mula sa frog number. Ang aktuwal na turnout ay sumusunod sa standard ng riles at sa drawing ng maker. Mga babala: turnout na lumalabas sa alignment, nasa kurba, transition, cant o vertical curve, o nagsa-overlap sa iba; at tala kapag ang line speed ay mas mataas sa diverging speed nito.

## Clearance envelope

Lagyan ng tsek ang **Sweep a clearance envelope along this track**. Piliin ang **Outline** (dalawang placeholder shape, o **Your own outline** na i-type bilang isang punto bawat linya: offset mula sa sentro ng track, pagkatapos taas sa itaas ng tuktok ng riles, sa metro), ang **Vehicle length** at **Bogie centres**, at, kung mayroon, ang **Platform edge** (gilid, distansya mula sa sentro ng track, taas sa ibabaw ng riles).

Sa bawat station, hinihilig ang outline kasabay ng cant sa paligid ng mababang riles at pinalalapad ng kurba: ang gitna ng sasakyan ay gumagalaw papasok ng b² / 8R, at ang mga dulo nito ay palabas ng (L² − b²) / 8R (b ang bogie centres, L ang haba ng sasakyan, R ang radius doon, sumusunod sa transition). Ipinapakita ng block ang section sa tuwid at kung saan ito pinakamalapad, at naglilista ng:

- ang **widest envelope** at kung saan ito,
- ang **track centres** na ikinukumpara sa mga sentro na kailangan ng dalawang katabing envelope,
- ang natitirang espasyo sa **platform edge**, o gaano ito kalalim sa loob,
- bawat feature line, pipe structure at iba pang railway alignment na natagpuan **sa loob ng envelope**.

Ang feature line na may elevation ay hinuhusgahan laban sa outline sa taas nito sa itaas ng riles; kapag walang design profile, o para sa punto na walang elevation, sa plan lamang ito hinuhusgahan at sinasabi ito ng listahan. Ipinapakita ng plan ang dalawang gilid ng envelope (layer C-RAIL-CLRN) na may krus sa bawat bagay sa loob.

Ang mga outline na inaalok ay **placeholder, hindi gauge ng anumang riles**. I-type ang structure gauge ng sarili mong riles bago umasa sa resulta.

## Sa ibang program

- **LandXML**: isinusulat ang railway alignment kasama ang mga transition nito (spiType) at isang `Cant` block: ang gauge, ang rotation point, ang line speed, at isang station kung saan nagsisimula at nagtatapos ang bawat cant ramp, kasama ang inilapat na cant, ang equilibrium cant at ang deficiency. Ang pagbubukas ng LandXML file na may `Cant` block ay ginagawang railway ang alignment na iyon kasama ang mga cant na iyon.
- **IFC**: ang alignment kasama ang cant segments nito, ang mga riles, sleepers, ballast at sub-ballast.

## Hindi pa naitatayo

Mga turnout sa IFC export, mga turnout family na lampas sa iisang closure curve (curved switches, swing-nose frogs, slips, diamonds), mga kinematic gauge rule (nakapirming outline ang envelope na may curve throw), overhead lines at signalling.

**Which standard.** Sa Railway block, ang "Standard to cite" ay tumatanggap ng None o European (UIC and EN). Kapag pinili ang European, pinangangalanan nito ang mga dokumentong sinisipi ng European project (EN 13803 para sa parameter ng alignment, EN 13232 para sa switches at crossings, EN 15273 para sa gauges, EN 13848 para sa kalidad ng geometry ng track) at naglalagay ng kahon para sa clause kung saan galing ang bawat limitasyon. Walang numero mula sa anumang standard ang naka-built in: ang cant, deficiency, excess, gradient at rate limits, ang geometry ng turnout at ang structure gauge ay pawang placeholder pa rin, at sinasabi ito ng window. Sinusuri ng railway engineer ang bawat halaga laban sa mismong teksto ng standard, at tinatype ang clause sa tabi nito bago may maitayo. Wala pa sa release na ito ang South Africa at ang AREMA tables.
