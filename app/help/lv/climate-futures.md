---
title: "Klimata nākotne: 2050. un 2080. gada plūdi, karstums un meža ugunsgrēks"
summary: Adresē objektam paaugstiniet objekta plūdu līmeni nākotnes klimatam, izvērtējiet meža ugunsgrēka iedarbību un pārveidojiet laika failu, salīdzinājumā ar tagadni, no klimata datu paketes (SSP2-4.5 un SSP5-8.5, 2050 un 2080).
keywords: klimats, klimata pārmaiņas, nākotne, 2050, 2080, ssp, cmip6, scenārijs, jūras līmenis, plūdi, plūdu bāzes augstums, bfe, fema, karstums, laika fails, epw, morfēšana, meža ugunsgrēks, savvaļas ugunsgrēks
from: b0d2ee38
---

Klimata skaitļi nāk no **datu paketes**, nevis no lietotnes. Ieslēdziet papildinājumu {{ui:Klimata nākotne}} sadaļā Iestatījumi › Papildinājumi vai ielādējiet savu paketes failu {{ui:Klimata nākotne}} blokā.

:::warning
Papildinājumā iekļautā pakete ir **paraugs**: trīs vietas (Denvera, Maiami, Johannesburga), viens klimata modelis, pieci gadi katrā 20 gadu periodā. Tā ir paredzēta rīku izmēģināšanai, **nevis projektēšanai**. Pilnu paketi veido ar `tools/climate/build-pack.mjs` no NASA NEX-GDDP-CMIP6 datiem.
:::

## Kur tas ir

Virsma › Vairāk › Adrese objektam. Iestatiet punktu, pievienojiet slāņus (FEMA plūdu slānis dod plūdu bāzes augstumu) un nospiediet pogu, kas nolasa objektu. Zem objekta rindām ir bloks {{ui:Klimata nākotne}}: izvēlieties **Scenārijs** (SSP2-4.5 vai SSP5-8.5) un **Gads** (2050 = 2041–2060, 2080 = 2071–2090, abi salīdzinājumā ar 1995–2014). Tiek izmantota paketes vieta, kas atrodas tuvāk punktam, vai tā, ko izvēlaties; ja tā atrodas tālu no visām vietām, tiek izmantotas globālās vidējās izmaiņas, un panelis to saka.

## Projektēšanas plūdu līmenis

Pašreizējais līmenis ir FEMA plūdu bāzes augstums, ja plūdu slānim tāds bija (pēdās, NAVD 88), citādi ierakstiet savu. Izvēlieties plūdu veidu (piekrastes, upes vai stipras lietusgāzes, vai abus), plūdu dziļumu objektā lietus daļai un brīvmalu, ja vēlaties. {{ui:Paaugstināt plūdu līmeni}} parāda pašreizējo un nākotnes līmeni blakus, jūras līmeņa un lietus daļas, kā arī pieņēmumus: viss jūras līmeņa pieaugums tiek pieskaitīts piekrastes līmenim; upes plūsma pieaug tieši proporcionāli lietus daudzumam slapjākajā dienā, un dziļums seko plūsmai ar pakāpi 0.6 (Manninga, plats kanāls); daļas tiek saskaitītas.

:::warning
Izmaiņu izvērtējums, nevis plūdu pētījums. Projektēšanas plūdu līmenis ir iestādes vai jūsu inženiera.
:::

## Meža ugunsgrēka iedarbība (tikai izvērtējums)

Tuvākā veģetācija, slīpums no tās uz augšu un attālums dod joslu no ļoti zemas līdz ekstremālai, tagadnei un nākotnei (nākotne reizina ar paketes izmaiņām ugunsgrēku laikapstākļu indeksā). **Tikai izvērtējums:** mūsu pašu relatīvā skala, lai noteiktu, vai objektam vajadzīgs pilnvērtīgs meža ugunsgrēka novērtējums; tas nav normatīvs vērtējums.

## Karstums: nākotnes laika fails

Izvēlieties esošu `.epw` failu un {{ui:Izveidot nākotnes laika failu}}: tas tiek morfēts ar publicēto nobīdes un stiepšanas metodi (Belcher, Hacker and Powell 2005), un karstums tiek salīdzināts (vidējā un karstākā temperatūra, projektēšanas temperatūras, stundas virs 30 °C un 35 °C, dienu grādi). {{ui:Saglabāt nākotnes laika failu}} saglabā to Vides panelim, BimCraft enerģijas pārbaudei vai jūsu pašu rīkiem.

## No kurienes nāk skaitļi

NASA NEX-GDDP-CMIP6 (CMIP6 modeļu izvades detalizācija, CC BY 4.0 katram modelim) temperatūrai, mitrumam, saulei, lietum un ugunsgrēku laikapstākļiem; IPCC AR6 globālais vidējais jūras līmeņa celšanai, ja paketē nav vietējo skaitļu. Panelis rāda paketes avotu, licenci un datumu.
