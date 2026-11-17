---
title: Troubleshooting
summary: Mga sintomas, sanhi, at ayos para sa mga problemang nararanasan sa CivilCraft, kasama ang eksaktong mensaheng ipinapakita ng app.
keywords: problema, error, hindi gumagana, ayos, tulong, mensahe, troubleshoot, tinanggihan, nawawala, mali, nagpalit, contours nawawala
from: a9f7dedc
---

Lumalabas ang mga mensahe sa status bar sa kanang ibaba, sa mga kahon sa kaliwa at kanang panel, at sa mga dialog. Nakasulat dito ang mga ito gaya ng ipinapakita ng app.

## Pagbubukas ng mga file

**"Mahigit 200 MB ang file na iyon; hindi pa nabubuksan ng CivilCraft ang ganoon kalalaking file."**
Hatiin ang point file, o bawasan ang data bago buksan.

**"Hindi mabuksan ang site.json: Hindi ito CivilCraft project file."**
Nagtatapos sa `.json` ang file o nagsisimula sa `{`, pero hindi ito CivilCraft project. Hindi dapat nagsisimula sa `{` ang mga point file.

**"Hindi mabuksan … Galing ang project file na ito sa mas bagong CivilCraft (version 2)."**
Na-save ang project ng mas bagong build. Buksan ito doon, o mag-export ng LandXML mula rito.

**"Hindi mabuksan … XML ito pero hindi LandXML (ang root element nito ay <…>)."**
Ibang uri ng XML ang file. Mag-export ng LandXML mula sa ibang program.

**"… walang point, TIN surface, o alignment na mababasa ng CivilCraft."**
Lahat ng nasa file ay bagay na nilalaktawan ng CivilCraft (halimbawa, grid surfaces lang, o spiral alignments lang). Sinasabi ng natitirang bahagi ng mensahe kung ano ang naroon. Tingnan ang [LandXML: ano ang binabasa at isinusulat](topic:landxml-reference).

**"Hindi ma-load ang sample: …"**
Ang {{ui:Buksan ang sample site}} ay bumabasa ng file mula sa CadCraft site. Kapag walang koneksyon, gumagana lang ito kung na-save ang CivilCraft para sa offline use (ipinapakita ng app bar button ang {{ui:Handa offline}}). Kumonekta online, i-click ang {{ui:I-save para sa offline}}, at mula noon ay gagana na ito offline. Tingnan ang [Offline](common:offline).

**Ipinapakita ng {{ui:I-save para sa offline}} ang {{ui:Hindi na-save}}.**
May ilang file na hindi na-download. Tingnan ang koneksyon at i-click ulit ang button.

**Ipinapakita ng {{ui:I-save para sa offline}} ang {{ui:Hindi available ang offline}}.**
Hindi kayang mag-imbak ng offline copy ng window na ito ng browser, kadalasan dahil private window ito o pinamamahalaan ang computer. Buksan ang CivilCraft sa normal na window.

**Offline, hindi talaga bumubukas ang app.**
Hindi ito na-save para sa offline sa browser na ito, o binura ng browser ang site data nito (ginagawa ito ng Safari para sa mga site na hindi nabisita nang ilang linggo). Kumonekta online, buksan ang CivilCraft, at i-click ang {{ui:I-save para sa offline}}.

**Mas luma ang offline copy.**
I-click ang {{ui:Handa offline}}, saka ang {{ui:I-save ulit (kunin ang pinakabagong bersyon)}} habang online.

**Naka-gray out ang isang file sa open box.**
Ang box ay naglilista lang ng point file, LandXML, at project file batay sa kanilang extension. I-drag na lang ang file sa plano, o palitan ang pangalan nito ng `.txt`.

## Pag-import ng points

**"Walang point na mabasa mula sa file na ito."**
Piliin nang manu-mano ang column order sa **Columns**. Kung wala pa ring gumana, buksan ang file sa text editor at tingnan kung isang point bawat linya ang laman, at may mga numero.

**Mukhang naka-mirror, naka-rotate, o nakaunat na parang linya ang site.**
Nagpalit ang northing at easting. Ang summary ay nagsabing "hinulaan mula sa bilang ng column". Piliin ang PENZD sa halip na PNEZD (o kabaligtaran) sa **Columns**, o i-import ulit.

**Malalayo ang ilang point sa iba, at naka-zoom out ang plano hanggang maging tuldok.**
May typo ang isang row sa coordinate, o magkahalo ang coordinate system sa file. Hanapin ang point (i-click ito para makita ang numero nito) at ayusin ang file.

**Mga row na nakalista sa ilalim ng "Hindi nabasang row".**
Tingnan ang table sa [I-import ang survey points](topic:import-points#rows-that-are-not-read).

**Nawala ang mga luma kong point.**
Pinapalitan ng pag-import ng point file ang lahat ng point, at nabubura ang undo. Buksan ang na-save mong project para maibalik ang mga ito.

## Ang surface

**"Surface: Hindi pa nabubuo" na may pulang box.**
Sinasabi ng box kung bakit: "Kailangan ng surface ng kahit tatlong point na may elevation.", "Nasa iisang linya ang lahat ng point: walang triangles.", "Walang point na may elevation.", "Hindi nagko-overlap ang boundary sa mga point." o "Walang natirang triangles sa loob ng boundary." Tingnan ang column order, ang mga point group (nakatakda ba ang mga ito sa {{ui:Hindi isinama}}?), at ang boundary.

**Pinuputol ng contours nang diretso ang isang kanal o tagaytay.**
Hindi breakline ang linyang iyon. Itakda ang group nito sa {{ui:Breakline}}, o iguhit ito gamit ang {{ui:Breakline}} tool. Tingnan ang [Buuin at pinuhin ang surface](topic:build-surface).

**Gumuguhit ng zig-zag ang isang breakline group.**
Higit sa isang linya ang laman ng group, o hindi nakanumero nang sunod sa linya ang mga point nito. Ibalik ang group sa {{ui:Mga punto}} at iguhit ang bawat linya gamit ang {{ui:Breakline}} tool.

**Mahahaba at manipis na triangles sa labas.**
Gumuhit ng boundary ({{key:O}}) o itakda ang **Longest outside edge**.

**Walang contours, kahit nabuo na ang surface.**
Naka-off ang {{ui:Contours}} sa ilalim ng **Display**, o sobrang liit ng interval kaya lalampas sa 2,000 ang contour levels. Pumili ng mas malaking interval.

**Walang nagbabago kahit breakline o boundary.**
Galing sa LandXML ang surface ("Surface (from LandXML)"). Ginagamit ito nang gaya ng pagkakaroon nito. I-click ang {{ui:Buuin muli ang surface mula sa mga punto}} para bumuo mula sa mga point.

**"Wala pang surface: buksan muna ang survey points."**
Kailangan ng breakline, boundary, at pad ng umiiral na ground surface. I-import muna ang mga point.

**"I-click ang survey point na may elevation: kinukuha ng breakline ang elevation ng mga point."**
Survey points lang ang pinipili ng {{ui:Breakline}} tool. Mag-zoom in at i-click ang isang point (ipinapakita ng orange na parisukat kung alin ang kukunin nito).

## Pagguhit

**Nawala ang huli kong point nang i-double-click ko para tapusin.**
Sa build na ito, tinatapos ng double-click ang alignment, pad, breakline, o boundary, pero inaalis ang point na na-double-click mo. I-click nang isang beses ang huling point at pindutin ang {{key:Enter}}. Gamitin ang {{key:Mod+Z}} kung nangyari na ito, saka muling gumuhit.

**Hindi ko matapos ang drawing sa tablet.**
Kailangan ng {{key:Enter}} para matapos; wala pang button sa screen. Magkabit ng keyboard. Tingnan ang [Mouse, trackpad, at touch](topic:keyboard#mouse-trackpad-and-touch).

**Ang pag-drag para maglagay ng point ay nagpa-pan.**
Ang pag-drag nang higit sa ilang pixel ay nagpa-pan sa plano sa lahat ng tool. I-click nang hindi gumagalaw.

**"Kailangan ng alignment ng kahit dalawang point." / "Kailangan ng pad ng kahit tatlong sulok." / "Kailangan ng pipe run ng kahit dalawang structure."**
Masyado kang maagang pumindot ng {{key:Enter}}. Itatapon ang drawing; magsimula ulit.

**Walang nangyayari sa mga key tulad ng A o G.**
Nasa text box o listahan sa panel pa rin ang focus, kaya napupunta roon ang mga letra. I-click nang isang beses ang plano, saka pindutin ang key. Sa Mac, ang delete key ay Backspace para sa browser: gamitin ang Fn at delete para burahin ang napiling object.

## Mga alignment at profile

**"Nagko-overlap ang mga curve sa PI 2 at PI 3: … Gumamit ng mas maliit na radius."**
Kailangan ng dalawang curve ng mas maraming tangent kaysa sa pagitan ng kanilang PI. Pababain ang isa o parehong radius sa PI table, o ilayo ang mga PI sa isa't isa.

**"Bumabalik nang diretso ang PI 3; hindi ito makakatanggap ng curve."**
Bumabalik sa sarili nito ang alignment sa PI na iyon. Ilipat o alisin ang PI.

**"Walang ground sa ilalim ng alignment na ito para magsimula."**
Wala sa surface ang alignment. Ilipat ito sa ibabaw ng surface, o magdagdag ng PVI sa pamamagitan ng pag-click habang naka-on ang {{ui:Magdagdag ng PVI}}.

**"Nagsisimula bago matapos ang curve o PVI bago nito ang vertical curve sa PVI 3 (L = …)." / "… lumalampas sa susunod na PVI."**
Paikliin ang haba ng curve o ilayo ang mga PVI sa isa't isa.

**"May PVI na sa …"**
May PVI na sa station na iyon. Mag-click sa ibang lugar, o i-drag ang umiiral na PVI.

**Walang laman ang profile view: "Gumuhit ng alignment para makita ang profile nito."**
Walang alignment, o may error ang napiling alignment.

## Corridor at pad

**"Kailangan ng corridor ng design profile na walang error."**
Magsimula ng design profile ({{ui:Simulan mula sa ground}}) at ayusin ang anumang overlap ng curve.

**"… lumalampas ang side slopes sa surface bago magtagpo sa ground." / "… lumalampas ang slope lines sa surface bago ito magtagpo …"**
Umaabot ang grading sa gilid ng surface bago magtagpo sa ground. Ilipat papasok mula sa gilid ang design, o ilapit ito sa ground. Ang bagong pad na bahagyang nasa labas ng surface ay maaaring magsimula sa elevation 0: i-type ang tamang elevation.

**"Nagtatawiran ang daylight lines ng corridor …" / "Tumatawid ang daylight line sa sarili nito …"**
Nagbabanggaan ang mga slope mula sa magkaibang gilid: masisikip na curve, makikitid na pad, malalalim na cut, o mataas na fill. Gumamit ng mas malaking radius, mas makitid na assembly, mas malapad na pad, o mas matarik na slope.

**"Wala pang volume: kailangang mag-grade ng pad nang walang problema."**
Ayusin ang mga problemang nakalista sa pulang box sa itaas nito.

**Naka-gray out ang {{ui:Proposed (graded)}}.**
Wala pang pad o corridor na na-grade.

## Mga pipe

**"Wala pang invert ang P2."**
I-click ang {{ui:Itakda ang invert nito ayon sa mga patakaran}} o i-type ang mga invert.

**"P1: walang ground sa S1 para magsimula."**
Wala sa surface ang upstream structure at walang rim. I-type ang rim nito.

**Lahat ng pipe ay namarkahan pagkatapos kong ilipat ang isang structure.**
Hindi nababago ng paglipat ng structure ang mga invert. I-click ang {{ui:Itakda ang lahat ng invert ayon sa mga patakaran}}.

Ipinaliliwanag ang lahat ng mensahe ng network sa [Ilatag ang gravity pipe network](topic:pipe-network#read-and-fix-problems).

## Pag-save at pag-export

**"Wala pang ie-export." / "Wala pang ie-plot."**
Walang laman ang project. I-import muna ang mga point.

**Hindi ko makita ang na-save na file.**
Nasa downloads ito ng browser (karaniwan sa Downloads folder). Tingnan ang [Mga file na maaari mong buksan, i-save, at i-export](topic:files#where-the-files-go).

**Mali ang scale ng PDF sa papel.**
I-print sa 100% o actual size, hindi "fit to page".

**May mga tandang pananong sa teksto ng PDF.**
Gumagamit ang mga pangalan o description ng mga karakter sa labas ng Western European set. Binibilang ito ng status message. Palitan ng simpleng karakter ang pangalan.

**Pinuputol ang plot sa mga gilid.**
Masyadong malaki ang scale para sa sheet. Pumili ng scale na may markang "(fits)", mas malaking sheet, o {{ui:Ang nasa screen}}.

**Binuksan ng {{key:Mod+P}} ang print dialog ng browser.**
Walang focus ang pahina. Isara ang dialog, i-click ang plano, at pindutin ulit ang {{key:Mod+P}}, o i-click ang {{ui:PDF}}.

## Ang app mismo

**Blangko ang screen o walang nangyayari sa toolbar.**
Gumamit ng kasalukuyang bersyon ng Chrome, Edge, Firefox, o Safari, at i-reload. Tingnan ang [Browsers](common:browsers).

**Mabagal ang app kapag malaki ang point file.**
I-off ang {{ui:Triangles}}, {{ui:Point labels}}, at {{ui:Elevation bands}}, at gumamit ng mas malaking contour interval. Matagal bumuo muli ang napakalaking surface pagkatapos ng bawat pagbabago.

**Nagtatanong ang browser ng "Leave site?"**
May hindi pa na-save na pagbabago ang project. Manatili, i-save gamit ang {{key:Mod+S}}, saka umalis.
