<script setup lang="ts">
const { locale } = useI18n()

const copy = computed(() => {
    const english = {
        seoTitle: 'IranArchive — Documenting the Crimes of the Islamic Republic',
        seoDescription: 'A source-linked archive of state violence, repression, victims, and digital blackouts in Iran.',
        eyebrow: 'Iran · 1979—present',
        heroLineOne: 'The state tried',
        heroLineTwo: 'to erase the record.',
        heroAccent: 'We keep it.',
        heroBody: 'IranArchive preserves names, evidence, and source trails for the crimes the Islamic Republic has tried to hide—from prison massacres and protest killings to gender persecution and digital blackouts.',
        enterArchive: 'Enter the evidence archive',
        rememberVictims: 'Remember the victims',
        currentLabel: 'January 2026 crackdown',
        currentValue: '5,000+',
        currentTitle: 'minimum reported killed',
        currentBody: 'On 16 January, the UN Special Rapporteur on Iran cited at least 5,000 deaths and warned the toll could be as high as 20,000. The blackout made full verification impossible.',
        readSource: 'Read the source',
        sourceName: 'Amnesty International',
        indexLabel: 'On this page',
        index: [
            { label: 'The record', href: '#record' },
            { label: 'The pattern', href: '#pattern' },
            { label: 'Historical record', href: '#history' },
            { label: 'Digital blackout', href: '#blackout' },
            { label: 'Explore the archive', href: '#archive' },
        ],
        recordKicker: 'The record',
        recordTitle: 'Scale matters. So does every name behind it.',
        recordBody: 'These figures describe the current scope of this archive and the blackout documented below. They are not a substitute for the individual records, testimony, and evidence.',
        stats: [
            { value: '21K+', label: 'victim registry records', note: 'Synced with the current external_source registry' },
            { value: '100', label: 'verified historical incidents', note: 'Bounded claims backed by rights investigations' },
            { value: '137d', label: 'public digital blackout', note: 'Plus 19 hours and 30 minutes in 2026' },
            { value: '46', label: 'years of state repression', note: 'From the establishment of the Islamic Republic to today' },
        ],
        patternKicker: 'Pattern recognition',
        patternTitle: 'Not isolated abuses. A system.',
        patternBody: 'Across decades and movements, the same architecture reappears: securitize dissent, use force, disappear the detained, silence witnesses, and deny accountability.',
        crimes: [
            {
                number: '01',
                icon: 'pi pi-crosshairs',
                title: 'Unlawful killing',
                body: 'Live ammunition, metal pellets, and lethal force have repeatedly been used against protesters and bystanders, including children.',
                source: 'Explore documented incidents',
                href: '/incidents',
                external: false,
            },
            {
                number: '02',
                icon: 'pi pi-lock',
                title: 'Detention, torture, disappearance',
                body: 'Mass arrests are followed by incommunicado detention, coerced confessions, torture, sexual violence, and pressure on families.',
                source: 'Human Rights Watch · 2026',
                href: 'https://www.hrw.org/news/2026/02/24/iran-tsunami-of-arbitrary-arrests-enforced-disappearances',
                external: true,
            },
            {
                number: '03',
                icon: 'pi pi-venus',
                title: 'Gender persecution',
                body: 'The UN fact-finding mission found that violations against women, girls, and supporters of equality amounted to crimes against humanity.',
                source: 'UN Fact-Finding Mission',
                href: 'https://www.ohchr.org/sites/default/files/documents/hrbodies/hrcouncil/ffmi-iran/FFM-Iran-Update-13-September-2024.pdf',
                external: true,
            },
            {
                number: '04',
                icon: 'pi pi-wifi',
                title: 'Information control',
                body: 'Internet shutdowns, filtering, surveillance, and whitelisted access isolate the public while abuses are carried out beyond scrutiny.',
                source: 'Go to the blackout report',
                href: '#blackout',
                external: false,
            },
        ],
        historyKicker: 'Historical record',
        historyTitle: 'Different generations. The same machinery.',
        historyBody: 'A selected chronology of state violence and repression. Each entry links to the investigation supporting the claim.',
        history: [
            {
                year: '1988',
                tag: 'Mass execution',
                title: 'Prison massacres',
                body: 'Thousands of imprisoned political dissidents were forcibly disappeared and extrajudicially executed, then buried largely in unmarked mass graves.',
                source: 'Amnesty International',
                href: 'https://www.amnesty.org/en/documents/mde13/9421/2018/en/',
            },
            {
                year: '1999',
                tag: 'Student repression',
                title: 'Tehran dormitory raid',
                body: 'Security forces and state-sanctioned vigilantes attacked student residences; at least one student was killed and hundreds were arrested.',
                source: 'Amnesty International',
                href: 'https://www.amnesty.org/en/latest/news/2009/07/iranian-government-must-allow-peaceful-commemorations-18-tir-events-20090709/',
            },
            {
                year: '2009',
                tag: 'Protest crackdown',
                title: 'Green Movement',
                body: 'Security forces used lethal and excessive force against election protesters, followed by mass detention, torture, and coerced confessions.',
                source: 'Human Rights Watch',
                href: 'https://www.hrw.org/report/2010/02/11/islamic-republic-31/post-election-abuses-show-serious-human-rights-crisis',
            },
            {
                year: '2019',
                tag: 'Killings + blackout',
                title: 'Bloody November',
                body: 'A nationwide internet shutdown accompanied a lethal crackdown. Rights groups documented unlawful force, mass arrests, and a deliberate cover-up.',
                source: 'Human Rights Watch',
                href: 'https://www.hrw.org/news/2019/11/27/iran-deliberate-coverup-brutal-crackdown',
            },
            {
                year: '2022',
                tag: 'Crimes against humanity',
                title: 'Woman, Life, Freedom',
                body: 'The UN mission found murder, imprisonment, torture, rape, persecution, enforced disappearance, and other inhumane acts in a widespread and systematic attack.',
                source: 'UN Fact-Finding Mission',
                href: 'https://www.ohchr.org/sites/default/files/documents/hrbodies/hrcouncil/ffmi-iran/FFM-Iran-Update-13-September-2024.pdf',
            },
            {
                year: '2026',
                tag: 'Mass killing + blackout',
                title: 'The current crackdown',
                body: 'Verified videos and testimony show security forces firing on protesters while a nationwide blackout obstructed documentation and concealed the scale of killing.',
                source: 'Amnesty International',
                href: 'https://www.amnesty.org/en/latest/campaigns/2026/01/what-happened-at-the-protests-in-iran/',
            },
        ],
        blackoutKicker: 'Information is evidence',
        blackoutTitle: 'When the killing begins, the network goes dark.',
        blackoutBody: 'The blackout is not a technical footnote. It isolates people, destroys livelihoods, obstructs documentation, and gives state violence cover. IranArchive keeps the full 2026 report on the landing page.',
        archiveKicker: 'Explore IranArchive',
        archiveTitle: 'Move from the pattern to the proof.',
        archiveBody: 'Search the people, incidents, source material, and worldwide actions connected to the record.',
        archiveLinks: [
            { number: '01', icon: 'pi pi-users', title: 'Victims', body: 'Names, portraits, biographies, and case records.', href: '/victims', cta: 'Enter the memorial' },
            { number: '02', icon: 'pi pi-exclamation-triangle', title: 'Incidents', body: 'Source-linked records of killings, crackdowns, and repression.', href: '/incidents', cta: 'Review incidents' },
            { number: '03', icon: 'pi pi-folder-open', title: 'Evidence', body: 'Archival media and documents preserved for public scrutiny.', href: '/assets', cta: 'Browse evidence' },
            { number: '04', icon: 'pi pi-calendar', title: 'Events', body: 'A historical and current record of solidarity actions worldwide.', href: '/events', cta: 'View the timeline' },
        ],
        finalLabel: 'Why this archive exists',
        finalTitle: 'Numbers establish scale. Names establish what was taken.',
        finalBody: 'Documentation is an act of resistance against disappearance, denial, and impunity. Preserve the record. Cite the evidence. Remember the people.',
        methodology: 'Source note: estimates from closed information environments can change as evidence emerges. IranArchive distinguishes archive counts from reported casualty estimates and links every external claim on this page to its source.',
        finalCta: 'Open the victims archive',
    }

    const persian = {
        seoTitle: 'ایران‌آرشیو — مستندسازی جنایت‌های جمهوری اسلامی',
        seoDescription: 'آرشیوی منبع‌محور از خشونت حکومتی، سرکوب، قربانیان و خاموشی‌های دیجیتال در ایران.',
        eyebrow: 'ایران · ۱۳۵۷ تا امروز',
        heroLineOne: 'حکومت کوشید',
        heroLineTwo: 'ردِ حقیقت را پاک کند.',
        heroAccent: 'ما آن را حفظ می‌کنیم.',
        heroBody: 'ایران‌آرشیو نام‌ها، مدارک و زنجیره منابعِ جنایت‌هایی را حفظ می‌کند که جمهوری اسلامی کوشیده پنهان کند؛ از کشتار زندانیان و معترضان تا آزار جنسیتی و خاموشی دیجیتال.',
        enterArchive: 'ورود به آرشیو مدارک',
        rememberVictims: 'یاد جان‌باختگان',
        currentLabel: 'سرکوب ژانویه ۲۰۲۶',
        currentValue: '۵٬۰۰۰+',
        currentTitle: 'حداقل جان‌باختگان گزارش‌شده',
        currentBody: 'در ۱۶ ژانویه، گزارشگر ویژه سازمان ملل در امور ایران از دست‌کم ۵ هزار کشته گفت و هشدار داد که شمار واقعی ممکن است تا ۲۰ هزار نفر باشد. خاموشی اینترنت راستی‌آزمایی کامل را ناممکن کرد.',
        readSource: 'مشاهده منبع',
        sourceName: 'عفو بین‌الملل',
        indexLabel: 'در این صفحه',
        index: [
            { label: 'پرونده', href: '#record' },
            { label: 'الگوی سرکوب', href: '#pattern' },
            { label: 'سابقه تاریخی', href: '#history' },
            { label: 'خاموشی دیجیتال', href: '#blackout' },
            { label: 'کاوش آرشیو', href: '#archive' },
        ],
        recordKicker: 'پرونده',
        recordTitle: 'مقیاس مهم است؛ تک‌تک نام‌های پشت آن هم.',
        recordBody: 'این ارقام دامنه کنونی آرشیو و خاموشی مستندشده در پایین صفحه را نشان می‌دهند. هیچ عددی جای پرونده فردی، شهادت و مدرک را نمی‌گیرد.',
        stats: [
            { value: '۲۱هزار+', label: 'پرونده در فهرست قربانیان', note: 'همگام‌شده با فهرست کنونی ایران‌ترایال' },
            { value: '۱۰۰', label: 'رویداد تاریخی راستی‌آزمایی‌شده', note: 'ادعاهای محدود و متکی بر تحقیقات حقوق بشری' },
            { value: '۱۳۷ روز', label: 'خاموشی دیجیتال عمومی', note: 'به‌علاوه ۱۹ ساعت و ۳۰ دقیقه در سال ۲۰۲۶' },
            { value: '۴۶', label: 'سال سرکوب حکومتی', note: 'از استقرار جمهوری اسلامی تا امروز' },
        ],
        patternKicker: 'شناخت الگو',
        patternTitle: 'نه تخلف‌های پراکنده؛ یک نظام.',
        patternBody: 'در دهه‌ها و جنبش‌های مختلف، یک معماری تکرار می‌شود: امنیتی‌کردن اعتراض، به‌کارگیری زور، ناپدیدکردن بازداشت‌شدگان، خاموش‌کردن شاهدان و انکار پاسخ‌گویی.',
        crimes: [
            {
                number: '۰۱',
                icon: 'pi pi-crosshairs',
                title: 'کشتار غیرقانونی',
                body: 'گلوله جنگی، ساچمه فلزی و زور مرگبار بارها علیه معترضان و رهگذران، از جمله کودکان، به کار رفته است.',
                source: 'مشاهده رویدادهای مستند',
                href: '/incidents',
                external: false,
            },
            {
                number: '۰۲',
                icon: 'pi pi-lock',
                title: 'بازداشت، شکنجه و ناپدیدسازی',
                body: 'بازداشت‌های گسترده با حبس بی‌خبر، اعتراف اجباری، شکنجه، خشونت جنسی و فشار بر خانواده‌ها ادامه می‌یابد.',
                source: 'دیده‌بان حقوق بشر · ۲۰۲۶',
                href: 'https://www.hrw.org/news/2026/02/24/iran-tsunami-of-arbitrary-arrests-enforced-disappearances',
                external: true,
            },
            {
                number: '۰۳',
                icon: 'pi pi-venus',
                title: 'آزار جنسیتی',
                body: 'هیئت حقیقت‌یاب سازمان ملل اعلام کرد که نقض حقوق زنان، دختران و حامیان برابری به جنایت علیه بشریت رسیده است.',
                source: 'هیئت حقیقت‌یاب سازمان ملل',
                href: 'https://www.ohchr.org/sites/default/files/documents/hrbodies/hrcouncil/ffmi-iran/FFM-Iran-Update-13-September-2024.pdf',
                external: true,
            },
            {
                number: '۰۴',
                icon: 'pi pi-wifi',
                title: 'کنترل اطلاعات',
                body: 'قطع اینترنت، فیلترینگ، نظارت و دسترسی فهرست‌سفید، مردم را منزوی می‌کند تا سرکوب دور از چشم جهان انجام شود.',
                source: 'رفتن به گزارش خاموشی',
                href: '#blackout',
                external: false,
            },
        ],
        historyKicker: 'سابقه تاریخی',
        historyTitle: 'نسل‌های متفاوت؛ همان ماشین سرکوب.',
        historyBody: 'گزیده‌ای از تاریخ خشونت و سرکوب حکومتی. هر مدخل به تحقیق پشتیبان آن پیوند دارد.',
        history: [
            {
                year: '۱۳۶۷',
                tag: 'اعدام جمعی',
                title: 'کشتار زندانیان',
                body: 'هزاران زندانی سیاسی به‌زور ناپدید و فراقضایی اعدام شدند و پیکر بسیاری در گورهای جمعی بی‌نام دفن شد.',
                source: 'عفو بین‌الملل',
                href: 'https://www.amnesty.org/en/documents/mde13/9421/2018/en/',
            },
            {
                year: '۱۳۷۸',
                tag: 'سرکوب دانشجویان',
                title: 'حمله به کوی دانشگاه',
                body: 'نیروهای امنیتی و گروه‌های مورد حمایت حکومت به خوابگاه دانشجویان یورش بردند؛ دست‌کم یک دانشجو کشته و صدها نفر بازداشت شدند.',
                source: 'عفو بین‌الملل',
                href: 'https://www.amnesty.org/en/latest/news/2009/07/iranian-government-must-allow-peaceful-commemorations-18-tir-events-20090709/',
            },
            {
                year: '۱۳۸۸',
                tag: 'سرکوب اعتراض',
                title: 'جنبش سبز',
                body: 'نیروهای حکومتی علیه معترضان انتخاباتی از زور مرگبار و نامتناسب استفاده کردند؛ سپس بازداشت جمعی، شکنجه و اعتراف اجباری رخ داد.',
                source: 'دیده‌بان حقوق بشر',
                href: 'https://www.hrw.org/report/2010/02/11/islamic-republic-31/post-election-abuses-show-serious-human-rights-crisis',
            },
            {
                year: '۱۳۹۸',
                tag: 'کشتار و قطع اینترنت',
                title: 'آبان خونین',
                body: 'قطع سراسری اینترنت با سرکوب مرگبار همراه شد. سازمان‌های حقوق بشری زور غیرقانونی، بازداشت گسترده و پنهان‌کاری سازمان‌یافته را مستند کردند.',
                source: 'دیده‌بان حقوق بشر',
                href: 'https://www.hrw.org/news/2019/11/27/iran-deliberate-coverup-brutal-crackdown',
            },
            {
                year: '۱۴۰۱',
                tag: 'جنایت علیه بشریت',
                title: 'زن، زندگی، آزادی',
                body: 'هیئت سازمان ملل قتل، حبس، شکنجه، تجاوز، آزار، ناپدیدسازی اجباری و اعمال غیرانسانی دیگر را در قالب حمله‌ای گسترده و سازمان‌یافته یافت.',
                source: 'هیئت حقیقت‌یاب سازمان ملل',
                href: 'https://www.ohchr.org/sites/default/files/documents/hrbodies/hrcouncil/ffmi-iran/FFM-Iran-Update-13-September-2024.pdf',
            },
            {
                year: '۲۰۲۶',
                tag: 'کشتار و خاموشی',
                title: 'سرکوب کنونی',
                body: 'ویدئوهای راستی‌آزمایی‌شده و شهادت‌ها تیراندازی نیروهای امنیتی به معترضان را نشان می‌دهد؛ هم‌زمان خاموشی سراسری ثبت و راستی‌آزمایی کشتار را مختل کرد.',
                source: 'عفو بین‌الملل',
                href: 'https://www.amnesty.org/en/latest/campaigns/2026/01/what-happened-at-the-protests-in-iran/',
            },
        ],
        blackoutKicker: 'اطلاعات، مدرک است',
        blackoutTitle: 'وقتی کشتار آغاز می‌شود، شبکه تاریک می‌شود.',
        blackoutBody: 'خاموشی اینترنت یک حاشیه فنی نیست؛ مردم را منزوی می‌کند، معیشت را از بین می‌برد، مستندسازی را مختل می‌کند و به خشونت حکومتی پوشش می‌دهد. گزارش کامل خاموشی ۲۰۲۶ در همین صفحه حفظ شده است.',
        archiveKicker: 'کاوش ایران‌آرشیو',
        archiveTitle: 'از الگو به مدرک بروید.',
        archiveBody: 'در میان افراد، رویدادها، منابع و کنش‌های جهانی مرتبط با این پرونده جست‌وجو کنید.',
        archiveLinks: [
            { number: '۰۱', icon: 'pi pi-users', title: 'قربانیان', body: 'نام‌ها، چهره‌ها، زندگی‌نامه‌ها و پرونده‌ها.', href: '/victims', cta: 'ورود به یادمان' },
            { number: '۰۲', icon: 'pi pi-exclamation-triangle', title: 'رویدادها', body: 'پرونده‌های منبع‌محورِ کشتار، سرکوب و خشونت حکومتی.', href: '/incidents', cta: 'بررسی رویدادها' },
            { number: '۰۳', icon: 'pi pi-folder-open', title: 'مدارک', body: 'رسانه‌ها و اسناد آرشیوی برای بررسی عمومی.', href: '/assets', cta: 'مرور مدارک' },
            { number: '۰۴', icon: 'pi pi-calendar', title: 'گردهمایی‌ها', body: 'سابقه تاریخی و کنونی کنش‌های همبستگی در سراسر جهان.', href: '/events', cta: 'مشاهده خط زمانی' },
        ],
        finalLabel: 'چرایی این آرشیو',
        finalTitle: 'عددها مقیاس را نشان می‌دهند. نام‌ها نشان می‌دهند چه چیزی از ما گرفته شد.',
        finalBody: 'مستندسازی، مقاومت در برابر ناپدیدسازی، انکار و مصونیت از مجازات است. پرونده را حفظ کنید. مدرک را نقل کنید. انسان‌ها را به یاد بسپارید.',
        methodology: 'یادداشت منبع: برآوردها در فضای بسته اطلاعاتی ممکن است با ظهور مدارک تازه تغییر کنند. ایران‌آرشیو شمار پرونده‌های آرشیو را از برآورد تلفات جدا می‌کند و هر ادعای بیرونی این صفحه را به منبع آن پیوند می‌دهد.',
        finalCta: 'بازکردن آرشیو قربانیان',
    }

    return locale.value.startsWith('fa') ? persian : english
})

useSeoMeta({
    title: () => copy.value.seoTitle,
    ogTitle: () => copy.value.seoTitle,
    description: () => copy.value.seoDescription,
    ogDescription: () => copy.value.seoDescription,
    ogUrl: 'https://iranarchive.net/',
    twitterCard: 'summary_large_image',
})

useHead(() => ({
    htmlAttrs: {
        lang: locale.value.startsWith('fa') ? 'fa' : 'en',
        dir: locale.value.startsWith('fa') ? 'rtl' : 'ltr',
    },
}))
</script>

<template>
    <div class="landing-page" :dir="locale.startsWith('fa') ? 'rtl' : 'ltr'">
        <section class="landing-hero" aria-labelledby="landing-title">
            <div class="landing-hero__grid" aria-hidden="true"></div>
            <div class="landing-shell landing-hero__content">
                <div class="landing-hero__copy">
                    <p class="landing-kicker landing-kicker--light">{{ copy.eyebrow }}</p>
                    <h1 id="landing-title" class="landing-hero__title" dir="auto">
                        <span>{{ copy.heroLineOne }}</span>
                        <span>{{ copy.heroLineTwo }}</span>
                        <em>{{ copy.heroAccent }}</em>
                    </h1>
                    <p class="landing-hero__body" dir="auto">{{ copy.heroBody }}</p>
                    <div class="landing-actions">
                        <NuxtLink to="/incidents" class="landing-button landing-button--solid">
                            <span>{{ copy.enterArchive }}</span>
                            <i class="pi pi-arrow-up-right"></i>
                        </NuxtLink>
                        <NuxtLink to="/victims" class="landing-button landing-button--ghost">
                            <span>{{ copy.rememberVictims }}</span>
                            <i class="pi pi-arrow-right rtl:rotate-180"></i>
                        </NuxtLink>
                    </div>
                </div>

                <aside class="landing-hero__dispatch" :aria-label="copy.currentLabel">
                    <div class="dispatch-topline">
                        <span class="dispatch-pulse"></span>
                        <span>{{ copy.currentLabel }}</span>
                    </div>
                    <strong class="dispatch-value">{{ copy.currentValue }}</strong>
                    <h2>{{ copy.currentTitle }}</h2>
                    <p dir="auto">{{ copy.currentBody }}</p>
                    <a
                        href="https://www.amnesty.org/en/latest/campaigns/2026/01/what-happened-at-the-protests-in-iran/"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="dispatch-source"
                    >
                        <span>{{ copy.readSource }} · {{ copy.sourceName }}</span>
                        <i class="pi pi-external-link"></i>
                    </a>
                </aside>
            </div>
            <div class="landing-hero__rule" aria-hidden="true">
                <span>IRANARCHIVE / EVIDENCE BEFORE ERASURE / 1979—PRESENT</span>
            </div>
        </section>

        <nav class="landing-index" :aria-label="copy.indexLabel">
            <div class="landing-shell landing-index__inner">
                <span class="landing-index__label">{{ copy.indexLabel }}</span>
                <a v-for="item in copy.index" :key="item.href" :href="item.href">{{ item.label }}</a>
            </div>
        </nav>

        <div class="landing-content">
            <section id="record" class="landing-section landing-section--paper">
                <div class="landing-shell">
                    <header class="landing-section__header">
                        <p class="landing-kicker">{{ copy.recordKicker }}</p>
                        <h2 dir="auto">{{ copy.recordTitle }}</h2>
                        <p dir="auto">{{ copy.recordBody }}</p>
                    </header>

                    <div class="record-grid">
                        <article v-for="(stat, index) in copy.stats" :key="stat.label" class="record-stat">
                            <span class="record-stat__index">0{{ index + 1 }}</span>
                            <strong>{{ stat.value }}</strong>
                            <h3>{{ stat.label }}</h3>
                            <p>{{ stat.note }}</p>
                        </article>
                    </div>
                </div>
            </section>

            <section id="pattern" class="landing-section landing-section--ink">
                <div class="landing-shell">
                    <header class="landing-section__header landing-section__header--light">
                        <p class="landing-kicker landing-kicker--red">{{ copy.patternKicker }}</p>
                        <h2 dir="auto">{{ copy.patternTitle }}</h2>
                        <p dir="auto">{{ copy.patternBody }}</p>
                    </header>

                    <div class="crime-grid">
                        <article v-for="crime in copy.crimes" :key="crime.number" class="crime-card">
                            <div class="crime-card__meta">
                                <span>{{ crime.number }}</span>
                                <i :class="crime.icon"></i>
                            </div>
                            <h3>{{ crime.title }}</h3>
                            <p>{{ crime.body }}</p>
                            <a
                                v-if="crime.external || crime.href.startsWith('#')"
                                :href="crime.href"
                                :target="crime.external ? '_blank' : undefined"
                                :rel="crime.external ? 'noopener noreferrer' : undefined"
                            >
                                <span>{{ crime.source }}</span>
                                <i :class="crime.external ? 'pi pi-external-link' : 'pi pi-arrow-down'"></i>
                            </a>
                            <NuxtLink v-else :to="crime.href">
                                <span>{{ crime.source }}</span>
                                <i class="pi pi-arrow-right rtl:rotate-180"></i>
                            </NuxtLink>
                        </article>
                    </div>
                </div>
            </section>

            <section id="history" class="landing-section landing-section--paper history-section">
                <div class="landing-shell">
                    <header class="landing-section__header">
                        <p class="landing-kicker">{{ copy.historyKicker }}</p>
                        <h2 dir="auto">{{ copy.historyTitle }}</h2>
                        <p dir="auto">{{ copy.historyBody }}</p>
                    </header>

                    <ol class="history-list">
                        <li v-for="(item, index) in copy.history" :key="item.year" class="history-item">
                            <div class="history-item__rail">
                                <span class="history-item__dot"></span>
                                <span v-if="index < copy.history.length - 1" class="history-item__line"></span>
                            </div>
                            <div class="history-item__year">{{ item.year }}</div>
                            <article>
                                <span class="history-item__tag">{{ item.tag }}</span>
                                <h3>{{ item.title }}</h3>
                                <p>{{ item.body }}</p>
                                <a :href="item.href" target="_blank" rel="noopener noreferrer">
                                    <span>{{ item.source }}</span>
                                    <i class="pi pi-external-link"></i>
                                </a>
                            </article>
                        </li>
                    </ol>
                </div>
            </section>

            <section id="blackout" class="landing-section landing-section--blackout">
                <div class="landing-shell">
                    <header class="landing-section__header landing-section__header--light blackout-heading">
                        <p class="landing-kicker landing-kicker--signal">{{ copy.blackoutKicker }}</p>
                        <h2 dir="auto">{{ copy.blackoutTitle }}</h2>
                        <p dir="auto">{{ copy.blackoutBody }}</p>
                    </header>
                    <BlackoutCounter />
                </div>
            </section>

            <section id="archive" class="landing-section landing-section--paper">
                <div class="landing-shell">
                    <header class="landing-section__header">
                        <p class="landing-kicker">{{ copy.archiveKicker }}</p>
                        <h2 dir="auto">{{ copy.archiveTitle }}</h2>
                        <p dir="auto">{{ copy.archiveBody }}</p>
                    </header>

                    <div class="archive-grid">
                        <NuxtLink v-for="item in copy.archiveLinks" :key="item.href" :to="item.href" class="archive-card">
                            <div class="archive-card__meta">
                                <span>{{ item.number }}</span>
                                <i :class="item.icon"></i>
                            </div>
                            <h3>{{ item.title }}</h3>
                            <p>{{ item.body }}</p>
                            <span class="archive-card__cta">
                                {{ item.cta }}
                                <i class="pi pi-arrow-up-right"></i>
                            </span>
                        </NuxtLink>
                    </div>
                </div>
            </section>

            <section class="landing-final">
                <div class="landing-shell landing-final__inner">
                    <div>
                        <p class="landing-kicker landing-kicker--light">{{ copy.finalLabel }}</p>
                        <h2 dir="auto">{{ copy.finalTitle }}</h2>
                        <p dir="auto">{{ copy.finalBody }}</p>
                    </div>
                    <NuxtLink to="/victims" class="landing-button landing-button--solid">
                        <span>{{ copy.finalCta }}</span>
                        <i class="pi pi-arrow-up-right"></i>
                    </NuxtLink>
                </div>
                <p class="landing-shell landing-methodology" dir="auto">{{ copy.methodology }}</p>
            </section>
        </div>
    </div>
</template>

<style scoped>
.landing-page {
    --landing-paper: #f1eee7;
    --landing-paper-deep: #e7e1d6;
    --landing-ink: #11100f;
    --landing-muted: #6e6961;
    --landing-line: rgba(17, 16, 15, 0.18);
    --landing-red: #d63a2f;
    --landing-signal: #ef574b;
    background: var(--landing-paper);
    color: var(--landing-ink);
    overflow: clip;
}

:global(.dark .landing-page) {
    --landing-paper: #11100f;
    --landing-paper-deep: #191714;
    --landing-ink: #f1eee7;
    --landing-muted: #aaa39a;
    --landing-line: rgba(241, 238, 231, 0.18);
}

.landing-shell {
    width: min(100% - 2rem, 1280px);
    margin-inline: auto;
}

.landing-hero {
    position: relative;
    isolation: isolate;
    min-height: min(880px, calc(100svh - 3rem));
    display: flex;
    flex-direction: column;
    color: #f4f0e8;
    background:
        radial-gradient(circle at 77% 28%, rgba(214, 58, 47, 0.22), transparent 25rem),
        linear-gradient(135deg, #151310 0%, #090909 56%, #16100f 100%);
}

.landing-hero::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    opacity: 0.16;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.38'/%3E%3C/svg%3E");
}

.landing-hero__grid {
    position: absolute;
    inset: 0;
    z-index: -1;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.055) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.055) 1px, transparent 1px);
    background-size: 5rem 5rem;
    mask-image: linear-gradient(to bottom, black, transparent 92%);
}

.landing-hero__content {
    flex: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(18rem, 0.55fr);
    gap: clamp(3rem, 8vw, 8rem);
    align-items: center;
    padding-block: clamp(5rem, 11vw, 9rem);
}

.landing-kicker {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0 0 1.4rem;
    color: var(--landing-muted);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.22em;
    line-height: 1;
    text-transform: uppercase;
}

.landing-kicker::before {
    content: '';
    width: 2rem;
    height: 2px;
    background: currentColor;
}

.landing-kicker--light {
    color: #a9a39a;
}

.landing-kicker--red,
.landing-kicker--signal {
    color: var(--landing-signal);
}

.landing-hero__title {
    display: flex;
    flex-direction: column;
    margin: 0;
    max-width: 12ch;
    font-family: 'Newsreader', Georgia, serif;
    font-size: clamp(4.2rem, 8.8vw, 8.8rem);
    font-weight: 500;
    letter-spacing: -0.065em;
    line-height: 0.82;
}

.landing-hero__title em {
    margin-top: 0.14em;
    color: var(--landing-signal);
    font-weight: 400;
}

.landing-hero__body {
    max-width: 48rem;
    margin: clamp(2.1rem, 4vw, 3.5rem) 0 0;
    color: #c6c0b7;
    font-size: clamp(1.05rem, 1.8vw, 1.35rem);
    line-height: 1.65;
}

.landing-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 2.4rem;
}

.landing-button {
    min-height: 3.35rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.9rem;
    padding: 0.85rem 1.25rem;
    border: 1px solid transparent;
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: transform 180ms ease, background-color 180ms ease, color 180ms ease, border-color 180ms ease;
}

.landing-button:hover {
    transform: translateY(-2px);
}

.landing-button--solid {
    color: #fff;
    background: var(--landing-red);
}

.landing-button--solid:hover {
    background: #f04b3f;
}

.landing-button--ghost {
    color: #ede8df;
    border-color: rgba(237, 232, 223, 0.34);
}

.landing-button--ghost:hover {
    color: #11100f;
    background: #ede8df;
    border-color: #ede8df;
}

.landing-hero__dispatch {
    position: relative;
    align-self: end;
    margin-bottom: clamp(0rem, 4vw, 3rem);
    padding: 1.5rem;
    border-top: 3px solid var(--landing-signal);
    border-inline-start: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
}

.dispatch-topline {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: #aaa39a;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
}

.dispatch-pulse {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--landing-signal);
    box-shadow: 0 0 0 0.3rem rgba(239, 87, 75, 0.12);
}

.dispatch-value {
    display: block;
    margin-top: 2.5rem;
    color: #fff;
    font-family: 'Newsreader', Georgia, serif;
    font-size: clamp(4.5rem, 7vw, 7rem);
    font-weight: 500;
    letter-spacing: -0.07em;
    line-height: 0.8;
}

.landing-hero__dispatch h2 {
    margin: 1rem 0 0;
    color: var(--landing-signal);
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
}

.landing-hero__dispatch p {
    margin: 1.5rem 0 0;
    color: #bdb7ae;
    font-size: 0.88rem;
    line-height: 1.65;
}

.dispatch-source {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1rem;
    color: #f4f0e8;
    border-top: 1px solid rgba(255, 255, 255, 0.16);
    font-size: 0.7rem;
    font-weight: 700;
}

.landing-hero__rule {
    min-height: 2.5rem;
    display: flex;
    align-items: center;
    overflow: hidden;
    color: #1a100d;
    background: var(--landing-signal);
    font-size: 0.65rem;
    font-weight: 900;
    letter-spacing: 0.25em;
    white-space: nowrap;
}

.landing-hero__rule span {
    width: min(100% - 2rem, 1280px);
    margin-inline: auto;
}

.landing-index {
    position: relative;
    z-index: 5;
    color: var(--landing-ink);
    border-bottom: 1px solid var(--landing-line);
    background: color-mix(in srgb, var(--landing-paper) 92%, transparent);
    backdrop-filter: blur(18px);
}

.landing-index__inner {
    min-height: 4rem;
    display: flex;
    align-items: center;
    gap: clamp(1rem, 3vw, 2.5rem);
    overflow-x: auto;
}

.landing-index__label {
    color: var(--landing-muted);
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    white-space: nowrap;
}

.landing-index a {
    position: relative;
    color: var(--landing-ink);
    font-size: 0.75rem;
    font-weight: 700;
    white-space: nowrap;
}

.landing-index a::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    bottom: -0.45rem;
    height: 2px;
    transform: scaleX(0);
    transform-origin: left;
    background: var(--landing-red);
    transition: transform 180ms ease;
}

.landing-index a:hover::after {
    transform: scaleX(1);
}

.landing-section {
    scroll-margin-top: 8rem;
    padding-block: clamp(5rem, 10vw, 9rem);
}

.landing-section--paper {
    color: var(--landing-ink);
    background: var(--landing-paper);
}

.landing-section--ink {
    color: #eee9df;
    background: #11100f;
}

.landing-section--blackout {
    color: #eee9df;
    background:
        linear-gradient(135deg, rgba(56, 15, 13, 0.7), transparent 45%),
        #090909;
}

.landing-section__header {
    max-width: 52rem;
    margin-bottom: clamp(3rem, 7vw, 5rem);
}

.landing-section__header h2,
.landing-final h2 {
    margin: 0;
    font-family: 'Newsreader', Georgia, serif;
    font-size: clamp(3.2rem, 6.6vw, 6.3rem);
    font-weight: 500;
    letter-spacing: -0.055em;
    line-height: 0.95;
}

.landing-section__header > p:last-child {
    max-width: 43rem;
    margin: 1.7rem 0 0;
    color: var(--landing-muted);
    font-size: 1.05rem;
    line-height: 1.75;
}

.landing-section__header--light > p:last-child {
    color: #aaa39a;
}

.record-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    border-top: 1px solid var(--landing-line);
    border-bottom: 1px solid var(--landing-line);
}

.record-stat {
    position: relative;
    min-height: 19rem;
    padding: 1.25rem;
    border-inline-end: 1px solid var(--landing-line);
}

.record-stat:last-child {
    border-inline-end: 0;
}

.record-stat__index {
    color: var(--landing-muted);
    font-size: 0.64rem;
    font-weight: 800;
    letter-spacing: 0.15em;
}

.record-stat strong {
    display: block;
    margin-top: 3.6rem;
    font-family: 'Newsreader', Georgia, serif;
    font-size: clamp(3.8rem, 6vw, 6rem);
    font-weight: 500;
    letter-spacing: -0.065em;
    line-height: 0.9;
}

.record-stat h3 {
    margin: 1rem 0 0;
    font-size: 0.74rem;
    font-weight: 900;
    letter-spacing: 0.13em;
    text-transform: uppercase;
}

.record-stat p {
    margin: 1rem 0 0;
    color: var(--landing-muted);
    font-size: 0.78rem;
    line-height: 1.55;
}

.crime-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-top: 1px solid rgba(255, 255, 255, 0.18);
    border-inline-start: 1px solid rgba(255, 255, 255, 0.18);
}

.crime-card {
    min-height: 26rem;
    display: flex;
    flex-direction: column;
    padding: clamp(1.5rem, 4vw, 3rem);
    border-inline-end: 1px solid rgba(255, 255, 255, 0.18);
    border-bottom: 1px solid rgba(255, 255, 255, 0.18);
    transition: background-color 200ms ease;
}

.crime-card:hover {
    background: rgba(255, 255, 255, 0.045);
}

.crime-card__meta,
.archive-card__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #77716a;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.15em;
}

.crime-card__meta i {
    color: var(--landing-signal);
    font-size: 1.2rem;
}

.crime-card h3,
.archive-card h3 {
    margin: auto 0 0;
    font-family: 'Newsreader', Georgia, serif;
    font-size: clamp(2.2rem, 4vw, 3.6rem);
    font-weight: 500;
    letter-spacing: -0.04em;
    line-height: 1;
}

.crime-card p {
    max-width: 32rem;
    margin: 1.25rem 0 0;
    color: #aaa39a;
    line-height: 1.65;
}

.crime-card a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1rem;
    color: #eee9df;
    border-top: 1px solid rgba(255, 255, 255, 0.18);
    font-size: 0.72rem;
    font-weight: 800;
}

.history-section {
    background:
        linear-gradient(90deg, transparent 0 49.95%, var(--landing-line) 50%, transparent 50.05%),
        var(--landing-paper);
}

.history-list {
    max-width: 68rem;
    margin: 0 auto;
    padding: 0;
    list-style: none;
}

.history-item {
    display: grid;
    grid-template-columns: 2rem 7rem minmax(0, 1fr);
    gap: clamp(1rem, 3vw, 3rem);
    min-height: 18rem;
}

.history-item__rail {
    position: relative;
    display: flex;
    justify-content: center;
}

.history-item__dot {
    width: 0.7rem;
    height: 0.7rem;
    margin-top: 0.5rem;
    border: 2px solid var(--landing-paper);
    border-radius: 50%;
    background: var(--landing-red);
    box-shadow: 0 0 0 1px var(--landing-red);
}

.history-item__line {
    position: absolute;
    top: 1.2rem;
    bottom: -0.5rem;
    width: 1px;
    background: var(--landing-line);
}

.history-item__year {
    padding-top: 0.1rem;
    font-family: 'Newsreader', Georgia, serif;
    font-size: 2.2rem;
    font-weight: 500;
    letter-spacing: -0.04em;
}

.history-item article {
    padding-bottom: 4rem;
}

.history-item__tag {
    color: var(--landing-red);
    font-size: 0.65rem;
    font-weight: 900;
    letter-spacing: 0.16em;
    text-transform: uppercase;
}

.history-item h3 {
    margin: 0.75rem 0 0;
    font-family: 'Newsreader', Georgia, serif;
    font-size: clamp(2.2rem, 4vw, 3.5rem);
    font-weight: 500;
    letter-spacing: -0.04em;
    line-height: 1;
}

.history-item p {
    max-width: 43rem;
    margin: 1.1rem 0 0;
    color: var(--landing-muted);
    line-height: 1.7;
}

.history-item a {
    display: inline-flex;
    align-items: center;
    gap: 0.7rem;
    margin-top: 1.4rem;
    color: var(--landing-ink);
    border-bottom: 1px solid var(--landing-line);
    font-size: 0.72rem;
    font-weight: 800;
}

.blackout-heading {
    margin-bottom: 3rem;
}

.archive-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-top: 1px solid var(--landing-line);
    border-inline-start: 1px solid var(--landing-line);
}

.archive-card {
    min-height: 22rem;
    display: flex;
    flex-direction: column;
    padding: clamp(1.4rem, 3.5vw, 2.5rem);
    color: var(--landing-ink);
    border-inline-end: 1px solid var(--landing-line);
    border-bottom: 1px solid var(--landing-line);
    transition: color 200ms ease, background-color 200ms ease;
}

.archive-card:hover {
    color: #f3efe7;
    background: var(--landing-red);
}

.archive-card:hover .archive-card__meta,
.archive-card:hover p {
    color: rgba(255, 255, 255, 0.75);
}

.archive-card__meta i {
    font-size: 1.2rem;
}

.archive-card p {
    max-width: 28rem;
    margin: 1rem 0 0;
    color: var(--landing-muted);
    line-height: 1.6;
}

.archive-card__cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid currentColor;
    font-size: 0.72rem;
    font-weight: 900;
}

.landing-final {
    padding-block: clamp(5rem, 10vw, 9rem) 2rem;
    color: #f2eee6;
    background: var(--landing-red);
}

.landing-final__inner {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 3rem;
    align-items: end;
}

.landing-final__inner > div {
    max-width: 58rem;
}

.landing-final .landing-kicker {
    color: rgba(255, 255, 255, 0.7);
}

.landing-final h2 {
    color: #fff;
}

.landing-final__inner p {
    max-width: 44rem;
    margin: 1.5rem 0 0;
    color: rgba(255, 255, 255, 0.82);
    font-size: 1.05rem;
    line-height: 1.7;
}

.landing-final .landing-button--solid {
    color: #11100f;
    background: #fff;
}

.landing-methodology {
    margin-top: 5rem;
    padding-top: 1.5rem;
    color: rgba(255, 255, 255, 0.68);
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    font-size: 0.73rem;
    line-height: 1.65;
}

@media (max-width: 960px) {
    .landing-hero__content {
        grid-template-columns: 1fr;
        align-items: start;
    }

    .landing-hero__dispatch {
        width: min(100%, 32rem);
        align-self: start;
        margin: 0;
    }

    .record-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .record-stat:nth-child(2) {
        border-inline-end: 0;
    }

    .record-stat:nth-child(-n + 2) {
        border-bottom: 1px solid var(--landing-line);
    }

    .landing-final__inner {
        grid-template-columns: 1fr;
        align-items: start;
    }

    .landing-final .landing-button {
        justify-self: start;
    }
}

@media (max-width: 640px) {
    .landing-shell {
        width: min(100% - 1.25rem, 1280px);
    }

    .landing-hero {
        min-height: auto;
    }

    .landing-hero__content {
        gap: 3rem;
        padding-block: 4.5rem;
    }

    .landing-hero__title {
        font-size: clamp(3.8rem, 17vw, 5.4rem);
        line-height: 0.86;
    }

    .landing-actions {
        flex-direction: column;
    }

    .landing-button {
        width: 100%;
    }

    .landing-index__inner {
        min-height: 3.5rem;
    }

    .landing-index__label {
        display: none;
    }

    .record-grid,
    .crime-grid,
    .archive-grid {
        grid-template-columns: 1fr;
    }

    .record-stat {
        min-height: 15rem;
        border-inline-end: 0;
        border-bottom: 1px solid var(--landing-line);
    }

    .record-stat:last-child {
        border-bottom: 0;
    }

    .crime-card,
    .archive-card {
        min-height: 22rem;
    }

    .history-section {
        background: var(--landing-paper);
    }

    .history-item {
        grid-template-columns: 1.2rem minmax(0, 1fr);
        gap: 1rem;
    }

    .history-item__year {
        grid-column: 2;
        font-size: 1.8rem;
    }

    .history-item article {
        grid-column: 2;
        margin-top: -0.5rem;
    }

    .history-item__rail {
        grid-row: 1 / span 2;
    }

    .landing-final .landing-button {
        justify-self: stretch;
    }
}

@media (prefers-reduced-motion: reduce) {
    .landing-page *,
    .landing-page *::before,
    .landing-page *::after {
        scroll-behavior: auto !important;
        transition-duration: 0.01ms !important;
    }
}
</style>
