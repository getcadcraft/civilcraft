---
title: Ang iyong power-line library
summary: Gumawa ng sarili mong conductor, underground cable, support, kagamitan at uri ng trench, sa mga kategoryang ikaw ang pumangalan, at i-share ang mga ito bilang file.
keywords: library, conductor, cable, pole, support, crossarm, insulator, fitting, stay, guy, transformer, cabinet, joint, trench, category, csv, import, export
from: 88733744
---

Hawak ng seksyong **Library** ng Power lines workspace ang bawat item na magagamit ng linya o kable. Walang nakatali rito sa isang bansa o gumagawa: ikaw ang gumagawa ng mga item na ginagamit mo.

## Tatlong uri ng item

| Uri | Saan ito nakatira | Mapapalitan mo ba? |
|---|---|---|
| **Examples** | Kasama ng CivilCraft, na may pangkalahatang numero na kinuwenta namin mula sa katangian ng materyal | Hindi: {{ui:Copy to my library}} muna |
| **In project** | Dumating kasama ng project file na binuksan mo | Hindi: {{ui:Copy to my library}} muna |
| **Mine** | Sarili mong mga item, na nakatago sa browser na ito | Oo, at agad na nase-save ang mga pagbabago |

Bawat project ay may kopya ng bawat item na ginagamit nito, kaya nabubuksan ang project sa anumang computer na may sarili nitong conductor at poste.

:::warning
Halimbawa lamang ang mga example item: tingnan ang bawat numero laban sa datos ng supplier mo. Sadyang walang current rating ang mga underground cable, dahil nakadepende ito sa kung paano inilatag ang kable.
:::

## Gumawa ng item

1. Sa **Library**, piliin ang **Kind** (overhead conductors, underground cables, supports, equipment o trench types).
2. I-click ang {{ui:New item}}, o pumili ng example at i-click ang {{ui:Copy to my library}} o {{ui:Duplicate}}.
3. Punan ang mga field nito. Ang mga field na may markang `*` ay ang kailangan ng mga check; ang item na kulang ng isa ay may markang `!` at nakalista sa **Checks** kapag may gumagamit nito na linya.
4. Bigyan ito ng **Category**, na may `/` sa pagitan ng mga antas: `Overhead/LV/Bundled`, `Supports/Concrete/12 m`. Sumusunod ang tree sa mga kategoryang ginawa mo.

Ano ang kailangan ng bawat uri:

| Uri | Kailangan para sa mga check |
|---|---|
| Overhead conductor | cross-section, diameter, mass kada metro, breaking strength, elastic modulus, thermal expansion |
| Underground cable | cores, cross-section, voltage, diameter, resistance, current rating |
| Support | kabuuang haba, nominal load (kinuha sa punto sa ibaba ng tuktok), lalim sa lupa |
| Equipment | ang uri nito; rated load para sa crossarm, fitting at stay; phase spacing at drop para sa crossarm; haba para sa insulator; anggulo para sa stay |
| Trench type | lalim, lapad, takip sa ibabaw ng mga kable |

## I-share ito

- Sine-save ng {{ui:Save my library}} ang bawat item mo bilang isang `.cclines.json` file; binabasa ito pabalik ng {{ui:Open a library…}} (ang mga item na may parehong key ay pinapalitan).
- Sine-save ng {{ui:Save as CSV}} ang uri na tinitingnan mo bilang spreadsheet; binabasa ng {{ui:Open a library…}} pabalik ang CSV ng uring iyon. Maaaring nasa anumang pagkakasunod ang mga column; ang file na may semicolon bilang separator ay maaaring gumamit ng decimal comma.
