---
title: staking အစီရင်ခံစာ ပြုလုပ်ရန်
summary: alignment တစ်လျှောက် station နှင့် offset များ၊ သို့မဟုတ် ၎င်းနားရှိ survey points များကို station၊ offset၊ northing၊ easting၊ design နှင့် ground elevation များ၊ cut သို့မဟုတ် fill နှင့်အတူ စာရင်းပြုစုပြီး အစီရင်ခံစာကို CSV သို့မဟုတ် PDF အဖြစ် သိမ်းပါ။
keywords: staking, stakeout, stake report, cut sheet, grade sheet, station, offset, cut, fill, layout, construction staking, as-built
from: d8a4e9f1
---

alignment တစ်ခုကို ရွေးပြီး ၎င်း၏ **Properties** တွင် **Staking report** ကို နှိပ်ပါ။

## Station နှင့် offset များတွင် stake များ

1. **From** နှင့် **to**: stake ထိုးမည့် station များ (1+50 သို့မဟုတ် 150)။
2. **every**: ကြားကာလ။ stake များကို ၎င်း၏ မြှောက်ကိန်းတိုင်းတွင်၊ နှစ်ဖက်စလုံးတွင်၊ (အကွက် အမှန်ခြစ်ပါက) alignment ၏ ကွေ့ကောက်မှု စတင်ရာနှင့် ပြီးဆုံးရာ နေရာများတွင် ထားပါသည်။
3. **Offsets**: alignment ၏ ဘယ်နှင့် ညာ၊ station ကို ကြည့်ရှုလျက်: `12 L, 0, 12 R`၊ `L12 CL R12` သို့မဟုတ် `-12, 0, 12` (ဘယ်ဘက်သည် အနုတ်ဖြစ်သည်)။ corridor ရှိသော alignment သည် pavement နှင့် shoulder အစွန်းများဖြင့် စတင်ပါသည်။
4. **Number from** နှင့် **with prefix** က stake များကို အမည်ပေးပါသည်: 1၊ 2၊ 3 သို့မဟုတ် S101၊ S102။

## alignment အနားရှိ survey points များ

**survey points near the alignment** ကို ရွေးပြီး ၎င်းတို့ ဘယ်လောက်နီးရမည်ကို ရွေးပါ။ ထိုအကွာအဝေးအတွင်းရှိ point တစ်ခုစီသည် station နှင့် offset၊ ထိုနေရာရှိ design နှင့် ၎င်း၏ ကိုယ်ပိုင် elevation ကို ground အဖြစ် ရရှိပါသည်။ ၎င်းသည် as built အဖြစ် stake ထိုးထားခြင်း သို့မဟုတ် ပစ်ထားခြင်း point များကို စစ်ဆေးခြင်း ဖြစ်ပါသည်။

## အစီရင်ခံစာက ဘာပြောသလဲ

| Column | ဘာလဲ |
|---|---|
| Point | stake ၏ အမည်၊ သို့မဟုတ် survey point ၏ နံပါတ် |
| Station, Offset | alignment တစ်လျှောက် နေရာ: L ဘယ်၊ R ညာ |
| Northing, Easting | ၎င်း၏ coordinates |
| Design elev. | ထိုနေရာရှိ graded corridor ၏ မျက်နှာပြင် (daylight line မှ daylight line အထိ)၊ မဟုတ်ပါက centerline ပေါ်ရှိ design profile |
| Ground elev. | ထိုနေရာရှိ ရှိပြီးသား မျက်နှာပြင်၊ သို့မဟုတ် survey point ၏ ကိုယ်ပိုင် elevation |
| Cut/fill | ground သည် design အထက်ရှိလျှင် C (အောက်ဆင်းဖြတ်ရန်)၊ အောက်ရှိလျှင် F (အပေါ်ဖြည့်ရန်)၊ ရာခိုင်နှုန်းတစ်ခုအထိ |

design elevation မရှိသော stake (corridor အပြင်ဘက်၊ သို့မဟုတ် centerline မှ ဝေးသော alignment တွင်) တွင် cut သို့မဟုတ် fill မရှိပါ။ ဒိုင်ယာလော့ခ်က အရေအတွက်ကို ပြပါမည်။

## သိမ်းခြင်း

- **CSV**: ခေါင်းစဉ်လိုင်းတစ်ကြောင်း၊ ထို့နောက် အထက်ပါ columns များ၊ နှင့် cut သို့မဟုတ် fill ကို လက်မှတ်ပါသော နံပါတ် (ground နှုတ် design) အဖြစ် spreadsheet နှင့် data collector များအတွက် ထည့်ပါသည်။
- **PDF**: ရွေးချယ်ထားသော စက္ကူပေါ်ရှိ ဇယားစာမျက်နှာများ၊ stake တစ်ခုကို တစ်အတန်း၊ cut များကို လိမ္မော်ရောင်နှင့် fill များကို အစိမ်းရောင်၊ အခြားစာရွက်များနှင့် တူညီသော title strip ဖြင့်။

:::note
Stake များကို ပရောဂျက်ရှိ design မှ တွက်ချက်ထားပါသည်။ မည်သည့်အရာမျှ မတည်ဆောက်မီ အတည်ပြုထားသော ပုံစံများနှင့် စစ်ဆေးပါ။
:::
