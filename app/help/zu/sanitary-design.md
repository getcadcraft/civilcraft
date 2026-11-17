---
title: Bala izinga lokugeleza kwemfucuza futhi uhlole umsele
summary: Faka abantu nendawo engena ku-manhole ngayinye yenethiwekhi yemfucuza; i-CivilCraft iyenezela phansi kwenethiwekhi, ibale izinga eliphezulu lokugeleza ngefektha yokuphezulu nokungena kwamanzi, futhi ihlole ukukwazi nejubane lephayipi ngalinye.
keywords: ukudonsa kwemfucuza, umsele, umsele wemfucuza, amanzi okuchitha, izinga lokuklama, izinga eliphezulu, ifektha yokuphezulu, harmon, babbitt, ukungena kwamanzi, inani labantu, ngomuntu ngamunye, iphesenti eligcwele, ukuzihlanza, ijubane, ukulinganisa amapayipi, ishidi lokuklama
from: 73ba197a
---

Izinga lokugeleza kwemfucuza lisebenza ku-[inethiwekhi yamapayipi](topic:pipe-network) uma i-{{ui:Type}} yayo iyi-{{ui:Sanitary}}. Lapho ungakakhethi lutho, ipaneli esekhohlo ibonisa **Izinga lokugeleza kwemfucuza** lapho inethiwekhi yesiphepho ibonisa ukukhishwa kwesiphepho.

## Faka lokho okungena

1. Khetha i-manhole. Ngaphansi kwe-**Izinga lokugeleza kwemfucuza**, bhala i-{{ui:People entering here}} ne-{{ui:Area entering here}} (amahektha kuprojekthi yemitha, amacre kuprojekthi yamafidi).
2. Ezitolo, ezihlalweni noma ezimbonini, bhala abantu abalingene: indawo ephindwe ngabantu ngehektha (noma ngekhari) elisetshenziswa yi-agency yakho. Indawo ibalwa ngokungena kwamanzi kunoma yikuphi.
3. Phinda ku-manhole ngayinye lapho umgwaqo noma isiza sixhumana khona. I-manhole lapho akukho lutho oluxhumayo ihlala ngu-0 kokubili.

Iphayipi ngalinye lithwala konke okungena ku-manhole layo ephezulu nakho konke okungenza ngaphezulu kwayo. Khetha i-manhole ukubona okudlula kuyo.

## Izilungiselelo

| Ukusetha | Kusho ukuthini |
|---|---|
| {{ui:Flow per person}} | ukugeleza kwesilinganiso somuntu ngaxhathu: amalitha (iprojekthi yemitha) noma amagaloni aseMelika ngosuku (iprojekthi yamafidi) |
| {{ui:Infiltration}} | amanzi omhlaba avuza ngaphakathi: amalitha ngesekhondi ngehektha, noma amagaloni ngosuku ngekhari |
| {{ui:Peaking factor}} | Harmon, 1 + 14 / (4 + √P), noma Babbitt, 5 / P^0.2, lapho P kungabantu ngezinkulungwane |
| {{ui:Peaking factor at least}} / {{ui:Peaking factor at most}} | ifektha ibanjwe phakathi kwalezi zimbili |
| {{ui:Manning n}} | yamandla nejubane |
| {{ui:Least velocity}} / {{ui:Most velocity}} | ekujuleni komsele okungokwawo ekugelezeni okuphezulu |
| {{ui:Most of full capacity}} | ukuthi iphayipi lingagcwala kangakanani ngesikhathi sokugeleza okuphezulu, njengephesenti walokho kuthwala uma kugcwele |

Amanani okuqala ayisibambi, hhayi isilinganiso. Sebenzisa amanani i-agency yakho ayishicilelayo.

## Okubalwayo

Ngephayipi ngalinye, ngokulandelana kokugeleza:

- izinga eliphezulu = abantu × ukugeleza ngomuntu × ifektha yokuphezulu + indawo × ukungena kwamanzi
- amandla agcwele (ngokwesibalo sika-Manning ngethambeka lephayipi), nokuthi izinga eliphezulu limgcwalisa kangakanani
- ukujula okujwayelekile kwezinga eliphezulu nejubane lapho

Ithebula le-**Imiphumela yemfucuza** liveza abantu bephayipi ngalinye, ifektha yokuphezulu, izinga eliphezulu lokugeleza (L/s, noma gpm nama-cubic feet ngesekhondi), iphesenti eligcwele kanye nejubane. Izinkinga zilandelwa ngaphansi kwalo: iphayipi elishaya kakhulu kunomkhawulo, elihamba kancane kakhulu kunejubane elincane (lingazihlanza ngokwalo), elisheshayo kakhulu kunelikhulu, noma elingenalo ithambeka. I-{{ui:Size the pipes for these flows}} ikhetha ngephayipi ngalinye usayizi omncane ojwayelekile (200 mm noma 8 amainchi nangaphezulu) ophethe izinga eliphezulu laleli phayipi ngaphakathi komkhawulo; isinyathelo esisodwa se-{{key:Mod+Z}} siyawuhlehlisa.

:::note
Lokhu kungu-izinga eliphezulu elizinzile elibalwa yishidi lokuklama, eliqhathaniswe noshidi lokuklama elishicilelwe kuze kube yisilinganiso sokuzungeza esiphrintiwe. Akuyona imodeli yomsele ngokuhamba kwesikhathi: akukho ama-hydrograph, ukugcinwa, izipompo noma ukuchichima. Bona [Akukakhiwa](topic:not-built-yet).
:::

Ijubane lisebenzisa ibalo lika-Manning ngo-n efanayo ngojulile ngalunye. Abanye bama-agency bama-chati e-part-full angavumela u-n ukushintsha ngokujula, okunika ijubane elincane kancane emsele ogcwele ngamaphesenti angu-60 kuya kwangu-70 (cishe ngamaphesenti angu-3 ngaphansi).
