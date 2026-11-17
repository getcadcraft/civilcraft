---
title: Amarekhodi ezitshalo, izinhlobo ezilinywayo nosayizi onikezwayo
summary: Uhlu lwezitshalo lweprojekthi yakho njengethebula: izinhlobo ezilinywayo, usayizi onikezwayo (isitsha, ibhola lezimpande, ukugoqwa, isiqu esicacile), ukuminyana, amanothi okucaciswa, i-CSV ngaphakathi nangaphandle; isitshalo ngasinye esibekiwe sitshela usayizi; izimpawu zezitshalo ngesikali kanye nezimpawu zakho kanye namamodeli akho e-3D.
keywords: ithebula lezitshalo, inkomba yezitshalo, uhlobo oluthile, ukuhlukahluka, usayizi onikezwayo, isitsha, ibhola lezimpande, izimpande ezivezwe, ukugoqwa, isiqu esicacile, ukuminyana, izitshalo ngemitha yesikwele, ukucaciswa, amanothi okucaciswa, upawu wezitshalo, ibhulokhi, upawu wakho, isitshalo se-3d, izinga lobunjalo, ngesikali
from: 12251beb
---

Vula i-{{ui:Plant table}} kwiqembu le-Landscape kumenyu ye-{{ui:More}}, noma kwisigaba se-Izitshalo. Umugqa ngamunye ungurekhodi lesitshalo kuhlu lwalo projekthi (irekhodi elisuka kuhlu lwezitshalo likopishwa lapho ulingeza). Yonke ukuhlela kuhlolwa njengefayela elingeniswe, futhi kuyisinyathelo esisodwa sokuhlehlisa.

## Amakholomu

- **Igama lesayensi**, **Igama elivamile**, **Uhlobo**, **Ubude** kanye **Nesisabalalo** ekuvuthweni (ngamamitha).
- **Ukuhlukana** (isikhungo nesikhungo) noma **Ukuminyana** (izitshalo ngo-m²). Ibhedi yerekhodi elinokuminyana kodwa elingenakuhlukana ligcwaliswa ngalokho kuminyana, ngephethini yalo (ethrayangula noma esikwele).
- **Usayizi onikezwayo**: okuyinkombandlela ngayinye, kwahlukaniswa `;`. Inkombandlela ngayinye inekhodi, uhlobo (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) bese kuba noma yimuphi kwalezi: ivolumu `10L`, ubude `h0.6`, isisabalalo `s0.4`, isifunda `g14-16` (cm), isiqu esicacile `st1.8`. Isibonelo: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Izinhlobo ezilinywayo**: amagama ahlukaniswa `;`. Uhlobo oluthile lugcina usayizi walo namanothi lapho ifayela oliphathile lalinawo.
- **Amanothi okucaciswa**.

I-{{ui:Duplicate}} ikopisha umugqa ngaphansi kukhiye omusha; i-{{ui:Save as CSV}} ne-{{ui:Save as a plants file}} zibhala uhlu (imigqa ye-CSV yezinhlobo ezilinywayo ingaphansi kohlobo lwayo, nge-`cultivar_of`). Ukungenisa i-CSV noma ifayela lezitshalo kuyihlanganisa.

## Uhlu lwezitshalo lwakho lomtapo

Ngena ku-akhawunti yakho ye-CadCraft (I-Izilungiselelo, Okwengeziwe kwakho, Ngena) bese ithebula lezitshalo lingasebenzisa uhlu olugcina kumtapo:

- I-{{ui:From my Library list}} ilethe izinto zakho zezitshalo kumtapo (nanoma yiziphi ezisalindele ukubuyekezwa). Isitshalo osinaso lapha siyabuyekezwa kumtapo; izinhlobo ezilinywayo, usayizi onikezwayo, ukuminyana kanye nokucaciswa oke wakungeza lapha kuyagcinwa.
- I-{{ui:Save as a plant list}} igcina zonke izimgqa njengento yakho yezitshalo emtapweni, into eyodwa ngohlobo ngalunye: isitshalo esisha kuyinto esisha, isitshalo esishintshiwe kuyinguqulo entsha, esingashintshiwe asithinteki. Faka itiki ibhokisi kuqala: ukugcina kunikeza izitshalo ize zifinyeleleke esidlangalaleni ngaphansi kwe-CC0. Ukulayisha kokuqala komuntu ongakethembeki kuhlolwa ngumuntu ngaphambi kokuthi kuvele, njengakho konke okulayishwayo.

Umtapo ugcina irekhodi elisisekelo lesitshalo. Izinhlobo ezilinywayo, usayizi onikezwayo, ukuminyana namanothi okucaciswa kuhlala eprojekthini nasefayelweni lezitshalo ({{ui:Save as a plants file}}); ingxoxo itshela ukuthi yimigqa emingakanani okuthinta ngesikhathi ngasinye ogcina ngaso.

## Isitshalo esibekiwe sitshela usayizi

Khetha isitshalo, umduli, noma umugqa wokuxuba webhedi noma wendawo etshaliwe: uma irekhodi linezinhlobo ezilinywayo noma usayizi onikezwayo, i-{{ui:Cultivar and size}} ikhetha eyodwa. Uhlu lwesitshalo lubala ngohlobo, uhlobo oluthile nosayizi, futhi ilebula ingabonisa lokho: `{botanical} '{cultivar}' {size}` noma `{full}`.

## Izimpawu zezitshalo ngesikali

I-{{ui:Plant graphics}} (Landscape › More) isetha ukuthi izitshalo zidwetshwa kanjani eplanini: **okuzenzakalelayo** (ngaphansi kwe-1:500 isiyingi esisabalele kwesisabalalo, phakathi kka-1:200 no-1:500 umphetho nesikhungo, ngaphezulu upawu oneminingi; zombili izikali zingashintshwa) noma izinga elilodwa lazo zonke izikali. Ingxoxo yamashidi inayo yayo i-**Ukubonakala kwesitshalo eplanini** kulelo sethi.

Kurekhodi kwisigaba se-Izitshalo, i-{{ui:Own symbol…}} ifunda i-SVG, noma ibhulokhi yomdwebo we-DXF/DWG, bese iyidweba ngesisabalalo sesitshalo ezingeni elineminingi. I-{{ui:Own 3D model…}} ifunda i-OBJ, i-STL noma i-GLB; ku-Plant graphics khetha **Imodeli yalo lonke irekhodi** ukuze uyibone nge-3D. Amafayela ayakhawulelwa (512 KB ye-SVG, izimo ezingu-2000, izinxantathu ezingu-50 000) futhi agcinwa eprojekthini. Ukuguqulwa kwe-SVG akusetshenziswa (uyatshelwa lapho ifayela linakho). Bheka [Izithombe zezitshalo, upawu wakho nezitshalo ze-3D](topic:plant-graphics) ngamazinga, imikhawulo nokuthi i-GLB ingaba nani.
