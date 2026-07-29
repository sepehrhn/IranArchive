<script setup lang="ts">
type DurationParts = {
    days: number
    hours: number
    minutes: number
    seconds: number
}

type TimelineItem = {
    date: string
    title: string
    text: string
}

const { locale } = useI18n()
const { pn } = usePersianNumbers()

const blackoutPeriods = [
    {
        startedAt: Date.parse('2026-01-08T16:30:00Z'),
        endedAt: Date.parse('2026-01-27T12:00:00Z'),
    },
    {
        startedAt: Date.parse('2026-01-27T12:00:00Z'),
        endedAt: Date.parse('2026-02-28T07:00:00Z'),
    },
    {
        startedAt: Date.parse('2026-02-28T07:00:00Z'),
        endedAt: Date.parse('2026-05-26T12:00:00Z'),
    },
] as const

const toDurationParts = (milliseconds: number): DurationParts => {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))

    return {
        days: Math.floor(totalSeconds / 86_400),
        hours: Math.floor((totalSeconds % 86_400) / 3_600),
        minutes: Math.floor((totalSeconds % 3_600) / 60),
        seconds: totalSeconds % 60,
    }
}

const periodDurations = blackoutPeriods.map(period =>
    toDurationParts(period.endedAt - period.startedAt),
)

const totalBlackoutDuration = toDurationParts(
    blackoutPeriods.reduce(
        (total, period) => total + (period.endedAt - period.startedAt),
        0,
    ),
)

const copy = computed(() => {
    const english = {
        title: 'Digital Blackout in Iran',
        phase: 'January 8 → May 26, 2026',
        summary: 'Total time unrestricted global internet was not generally available to the Iranian public',
        days: 'Days',
        hours: 'Hours',
        minutes: 'Minutes',
        seconds: 'Seconds',
        dayShort: 'd',
        hourShort: 'h',
        minuteShort: 'm',
        totalDuration: 'Total public blackout duration',
        phaseOne: 'Phase 1 — near-total protest shutdown',
        phaseOneDates: 'Jan 8, 16:30 UTC → Jan 27, ~12:00 UTC',
        interimPhase: 'Phase 2 — whitelisted access',
        interimPhaseDates: 'Jan 27, ~12:00 UTC → Feb 28, 07:00 UTC',
        interimPhaseText: 'Traffic partially recovered, but meaningful global access remained unavailable to the general public and was largely reserved for government-linked or whitelisted users, including “white SIM” holders.',
        phaseThree: 'Phase 3 — near-total wartime shutdown',
        phaseThreeDates: 'Feb 28, 07:00 UTC → May 26, 12:00 UTC',
        timelineTitle: 'Digital blackout timeline',
        methodologyTitle: 'How the total is calculated',
        methodologyText: 'The counter treats January 8 through May 26 as one continuous public digital blackout with three access regimes: near-total shutdown, discriminatory whitelisted access, and renewed near-total shutdown. The middle period is included because ordinary people still lacked meaningful, unrestricted global internet access. Total: 3,307 hours 30 minutes, or 137 days 19 hours 30 minutes.',
        currentStatusTitle: 'Current status',
        currentStatusText: 'Global connectivity began returning on May 26 and rose afterward, but access remained uneven, slow, and heavily filtered.',
        sourcesTitle: 'Measurement and access sources',
        reportLabel: 'Dossier 2026.01 · Digital repression',
        precedentTitle: 'A documented precedent: Bloody November 2019',
        precedentText: 'NetBlocks measured national connectivity collapsing to roughly 5% as authorities suppressed the November 2019 protests. The tactic returned at greater duration in 2026.',
        precedentAlt: 'NetBlocks graph showing Iran network connectivity collapsing during the November 2019 internet shutdown',
        precedentCredit: 'Graphic: NetBlocks · unaltered, used with source attribution',
        cloudflareTimelineSource: 'Cloudflare Radar: shutdown and restoration timeline',
        cloudflareWhitelistSource: 'Cloudflare: whitelists and white SIM cards restricted access to selected users',
        wiredSource: 'WIRED: access returned for state-approved users, not the general public',
        netblocksSource: 'NetBlocks: wartime phase ended after exactly 2,093 hours',
        timeline: [
            {
                date: 'Jan 8 · 16:30 UTC',
                title: 'Nationwide blackout begins',
                text: 'Traffic collapsed to near zero during the nationwide protest crackdown.',
            },
            {
                date: 'Jan 21–26',
                title: 'Brief controlled connectivity windows',
                text: 'Small amounts of traffic returned twice, but neither window became sustained, generally available public access.',
            },
            {
                date: 'Jan 27 · ~12:00 UTC',
                title: 'Whitelisted access phase begins',
                text: 'Traffic partially recovered, but the public digital blackout continued through aggressive filtering and privileged access for selected users and white SIM cards.',
            },
            {
                date: 'Feb 28 · 07:00 UTC',
                title: 'Near-total wartime shutdown begins',
                text: 'Connectivity again fell to near zero as the war began.',
            },
            {
                date: 'May 26 · 12:00 UTC',
                title: 'Sustained public restoration begins',
                text: 'International connectivity began a sustained rise after 2,093 hours of the wartime phase, ending the counted blackout period.',
            },
        ] satisfies TimelineItem[],
    }

    const persian = {
        title: 'خاموشی دیجیتال ایران',
        phase: '۸ ژانویه تا ۲۶ مه ۲۰۲۶',
        summary: 'کل مدتی که اینترنت جهانی آزاد و بدون محدودیت به‌طور عمومی در دسترس مردم ایران نبود',
        days: 'روز',
        hours: 'ساعت',
        minutes: 'دقیقه',
        seconds: 'ثانیه',
        dayShort: 'روز',
        hourShort: 'ساعت',
        minuteShort: 'دقیقه',
        totalDuration: 'کل مدت خاموشی دیجیتال عمومی',
        phaseOne: 'فاز ۱ — قطعی تقریباً کامل اعتراضات',
        phaseOneDates: '۸ ژانویه، ۱۶:۳۰ UTC ← ۲۷ ژانویه، حدود ۱۲:۰۰ UTC',
        interimPhase: 'فاز ۲ — دسترسی مبتنی بر فهرست سفید',
        interimPhaseDates: '۲۷ ژانویه، حدود ۱۲:۰۰ UTC ← ۲۸ فوریه، ۰۷:۰۰ UTC',
        interimPhaseText: 'بخشی از ترافیک بازگشت، اما دسترسی واقعی به اینترنت جهانی همچنان برای عموم مردم ممکن نبود و عمدتاً به کاربران مورد تأیید یا وابسته به حکومت، از جمله دارندگان «سیم‌کارت سفید»، محدود می‌شد.',
        phaseThree: 'فاز ۳ — قطعی تقریباً کامل دوران جنگ',
        phaseThreeDates: '۲۸ فوریه، ۰۷:۰۰ UTC ← ۲۶ مه، ۱۲:۰۰ UTC',
        timelineTitle: 'خط زمانی خاموشی دیجیتال',
        methodologyTitle: 'روش محاسبه مجموع',
        methodologyText: 'این شمارنده فاصله ۸ ژانویه تا ۲۶ مه را یک خاموشی دیجیتال پیوسته عمومی با سه وضعیت دسترسی در نظر می‌گیرد: قطعی تقریباً کامل، دسترسی تبعیض‌آمیز مبتنی بر فهرست سفید و قطعی تقریباً کامل دوباره. دوره میانی نیز محاسبه می‌شود، زیرا مردم عادی همچنان به اینترنت جهانی آزاد و معنادار دسترسی نداشتند. مجموع: ۳۳۰۷ ساعت و ۳۰ دقیقه، معادل ۱۳۷ روز و ۱۹ ساعت و ۳۰ دقیقه.',
        currentStatusTitle: 'وضعیت کنونی',
        currentStatusText: 'اتصال به اینترنت جهانی از ۲۶ مه به‌تدریج بازگشت، اما دسترسی همچنان نابرابر، کند و به‌شدت فیلترشده باقی ماند.',
        sourcesTitle: 'منابع اندازه‌گیری و دسترسی',
        reportLabel: 'پرونده ۲۰۲۶.۰۱ · سرکوب دیجیتال',
        precedentTitle: 'سابقه مستند: آبان خونین ۱۳۹۸',
        precedentText: 'نت‌بلاکس در جریان سرکوب اعتراضات آبان ۱۳۹۸ سقوط اتصال ملی به حدود ۵ درصد را اندازه‌گیری کرد. همین روش در سال ۲۰۲۶ برای مدتی بسیار طولانی‌تر تکرار شد.',
        precedentAlt: 'نمودار نت‌بلاکس از سقوط اتصال اینترنت ایران در خاموشی آبان ۱۳۹۸',
        precedentCredit: 'نمودار: نت‌بلاکس · بدون تغییر و با ذکر منبع',
        cloudflareTimelineSource: 'کلادفلر رادار: خط زمانی قطعی و بازگشت اتصال',
        cloudflareWhitelistSource: 'کلادفلر: محدود شدن دسترسی به کاربران منتخب از طریق فهرست سفید و سیم‌کارت سفید',
        wiredSource: 'وایرد: بازگشت اینترنت برای کاربران مورد تأیید حکومت، نه عموم مردم',
        netblocksSource: 'نت‌بلاکس: پایان فاز جنگ پس از دقیقاً ۲۰۹۳ ساعت',
        timeline: [
            {
                date: '۸ ژانویه · ۱۶:۳۰ UTC',
                title: 'آغاز قطعی سراسری',
                text: 'هم‌زمان با سرکوب اعتراضات سراسری، ترافیک اینترنت به نزدیک صفر سقوط کرد.',
            },
            {
                date: '۲۱ تا ۲۶ ژانویه',
                title: 'پنجره‌های کوتاه و کنترل‌شده اتصال',
                text: 'دو بار مقدار کمی ترافیک بازگشت، اما هیچ‌کدام به دسترسی عمومی، پایدار و سراسری تبدیل نشد.',
            },
            {
                date: '۲۷ ژانویه · حدود ۱۲:۰۰ UTC',
                title: 'آغاز فاز دسترسی فهرست سفید',
                text: 'بخشی از ترافیک بازگشت، اما خاموشی دیجیتال عمومی با فیلترینگ تهاجمی و دسترسی ویژه برای کاربران منتخب و سیم‌کارت‌های سفید ادامه یافت.',
            },
            {
                date: '۲۸ فوریه · ۰۷:۰۰ UTC',
                title: 'آغاز قطعی تقریباً کامل دوران جنگ',
                text: 'با آغاز جنگ، اتصال کشور دوباره به نزدیک صفر سقوط کرد.',
            },
            {
                date: '۲۶ مه · ۱۲:۰۰ UTC',
                title: 'آغاز بازگشت پایدار دسترسی عمومی',
                text: 'پس از ۲۰۹۳ ساعت از فاز جنگ، اتصال بین‌المللی وارد روند افزایشی پایدار شد و دوره محاسبه‌شده خاموشی پایان یافت.',
            },
        ] satisfies TimelineItem[],
    }

    return locale.value.startsWith('fa') ? persian : english
})

const formatTwoDigits = (value: number) => pn(String(value).padStart(2, '0'))
</script>

<template>
    <section class="blackout-report" aria-labelledby="blackout-report-title">
        <header class="blackout-report__header">
            <div>
                <p class="blackout-report__label">{{ copy.reportLabel }}</p>
                <h3 id="blackout-report-title">{{ copy.title }}</h3>
                <p class="blackout-report__phase">{{ copy.phase }}</p>
                <p class="blackout-report__summary">{{ copy.summary }}</p>
            </div>

            <div class="blackout-report__total">
                <span>{{ copy.totalDuration }}</span>
                <strong dir="ltr">
                    {{ pn(totalBlackoutDuration.days) }}
                    <small>{{ copy.dayShort }}</small>
                </strong>
            </div>
        </header>

        <div class="blackout-report__clock" dir="ltr">
            <div>
                <strong>{{ pn(totalBlackoutDuration.days) }}</strong>
                <span>{{ copy.days }}</span>
            </div>
            <div>
                <strong>{{ formatTwoDigits(totalBlackoutDuration.hours) }}</strong>
                <span>{{ copy.hours }}</span>
            </div>
            <div>
                <strong>{{ formatTwoDigits(totalBlackoutDuration.minutes) }}</strong>
                <span>{{ copy.minutes }}</span>
            </div>
        </div>

        <div class="blackout-report__regimes" aria-hidden="true">
            <span class="regime-one"></span>
            <span class="regime-two"></span>
            <span class="regime-three"></span>
        </div>

        <div class="blackout-report__phases">
            <article>
                <span class="phase-index">01</span>
                <h4>{{ copy.phaseOne }}</h4>
                <time dir="ltr">{{ copy.phaseOneDates }}</time>
                <strong dir="ltr">
                    {{ pn(periodDurations[0].days) }}{{ copy.dayShort }}
                    {{ formatTwoDigits(periodDurations[0].hours) }}{{ copy.hourShort }}
                    {{ formatTwoDigits(periodDurations[0].minutes) }}{{ copy.minuteShort }}
                </strong>
            </article>

            <article class="phase-whitelist">
                <span class="phase-index">02</span>
                <h4>{{ copy.interimPhase }}</h4>
                <time dir="ltr">{{ copy.interimPhaseDates }}</time>
                <strong dir="ltr">
                    {{ pn(periodDurations[1].days) }}{{ copy.dayShort }}
                    {{ formatTwoDigits(periodDurations[1].hours) }}{{ copy.hourShort }}
                    {{ formatTwoDigits(periodDurations[1].minutes) }}{{ copy.minuteShort }}
                </strong>
                <p>{{ copy.interimPhaseText }}</p>
            </article>

            <article>
                <span class="phase-index">03</span>
                <h4>{{ copy.phaseThree }}</h4>
                <time dir="ltr">{{ copy.phaseThreeDates }}</time>
                <strong dir="ltr">
                    {{ pn(periodDurations[2].days) }}{{ copy.dayShort }}
                    {{ formatTwoDigits(periodDurations[2].hours) }}{{ copy.hourShort }}
                    {{ formatTwoDigits(periodDurations[2].minutes) }}{{ copy.minuteShort }}
                </strong>
            </article>
        </div>

        <div class="blackout-report__body">
            <div class="blackout-timeline">
                <h4>{{ copy.timelineTitle }}</h4>
                <ol>
                    <li v-for="item in copy.timeline" :key="item.date">
                        <time dir="ltr">{{ item.date }}</time>
                        <div>
                            <h5>{{ item.title }}</h5>
                            <p>{{ item.text }}</p>
                        </div>
                    </li>
                </ol>
            </div>

            <aside class="blackout-notes">
                <div>
                    <i class="pi pi-calculator"></i>
                    <h4>{{ copy.methodologyTitle }}</h4>
                    <p>{{ copy.methodologyText }}</p>
                </div>
                <div class="blackout-notes__status">
                    <i class="pi pi-wifi"></i>
                    <h4>{{ copy.currentStatusTitle }}</h4>
                    <p>{{ copy.currentStatusText }}</p>
                </div>
            </aside>
        </div>

        <figure id="blackout-precedent" class="blackout-precedent">
            <div class="blackout-precedent__image">
                <img
                    src="/media/netblocks-iran-2019-blackout.jpg"
                    :alt="copy.precedentAlt"
                    width="1280"
                    height="720"
                    loading="lazy"
                />
            </div>
            <figcaption>
                <span class="phase-index">2019</span>
                <h4>{{ copy.precedentTitle }}</h4>
                <p>{{ copy.precedentText }}</p>
                <a
                    href="https://netblocks.org/reports/internet-disrupted-in-iran-amid-fuel-protests-in-multiple-cities-pA25L18b"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {{ copy.precedentCredit }}
                    <i class="pi pi-external-link"></i>
                </a>
            </figcaption>
        </figure>

        <footer class="blackout-sources">
            <h4>{{ copy.sourcesTitle }}</h4>
            <div>
                <a href="https://blog.cloudflare.com/iran-internet-partially-restored-may-2026/" target="_blank" rel="noopener noreferrer">
                    <span>{{ copy.cloudflareTimelineSource }}</span>
                    <i class="pi pi-external-link"></i>
                </a>
                <a href="https://blog.cloudflare.com/q1-2026-internet-disruption-summary/" target="_blank" rel="noopener noreferrer">
                    <span>{{ copy.cloudflareWhitelistSource }}</span>
                    <i class="pi pi-external-link"></i>
                </a>
                <a href="https://www.wired.me/story/irans-internet-came-back-but-not-for-everyone" target="_blank" rel="noopener noreferrer">
                    <span>{{ copy.wiredSource }}</span>
                    <i class="pi pi-external-link"></i>
                </a>
                <a href="https://t.me/netblocks/1503" target="_blank" rel="noopener noreferrer">
                    <span>{{ copy.netblocksSource }}</span>
                    <i class="pi pi-external-link"></i>
                </a>
            </div>
        </footer>
    </section>
</template>

<style scoped>
.blackout-report {
    --report-line: rgba(255, 255, 255, 0.18);
    --report-muted: #aaa39a;
    --report-red: #ef574b;
    color: #f2eee6;
    border: 1px solid var(--report-line);
    background: rgba(10, 10, 10, 0.72);
}

.blackout-report__header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(16rem, 0.42fr);
    gap: 3rem;
    padding: clamp(1.5rem, 4vw, 3rem);
    border-bottom: 1px solid var(--report-line);
}

.blackout-report__label,
.phase-index {
    margin: 0;
    color: var(--report-red);
    font-size: 0.65rem;
    font-weight: 900;
    letter-spacing: 0.18em;
    text-transform: uppercase;
}

.blackout-report__header h3 {
    max-width: 10ch;
    margin: 1.1rem 0 0;
    font-family: 'Newsreader', Georgia, serif;
    font-size: clamp(3.2rem, 6vw, 6rem);
    font-weight: 500;
    letter-spacing: -0.055em;
    line-height: 0.92;
}

.blackout-report__phase {
    display: inline-flex;
    margin: 1.5rem 0 0;
    padding: 0.45rem 0.65rem;
    color: var(--report-red);
    border: 1px solid rgba(239, 87, 75, 0.45);
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

.blackout-report__summary {
    max-width: 42rem;
    margin: 1.4rem 0 0;
    color: var(--report-muted);
    line-height: 1.7;
}

.blackout-report__total {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding-inline-start: 1.5rem;
    border-inline-start: 1px solid var(--report-line);
}

.blackout-report__total > span {
    color: var(--report-muted);
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.blackout-report__total strong {
    display: flex;
    align-items: baseline;
    gap: 0.45rem;
    margin-top: 1.2rem;
    font-family: 'Newsreader', Georgia, serif;
    font-size: clamp(5rem, 9vw, 8rem);
    font-weight: 500;
    letter-spacing: -0.07em;
    line-height: 0.8;
}

.blackout-report__total small {
    color: var(--report-red);
    font-family: Inter, sans-serif;
    font-size: 0.75rem;
    font-weight: 900;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.blackout-report__clock {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    border-bottom: 1px solid var(--report-line);
}

.blackout-report__clock > div {
    min-height: 13rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-inline-end: 1px solid var(--report-line);
}

.blackout-report__clock > div:last-child {
    border-inline-end: 0;
}

.blackout-report__clock strong {
    font-family: 'Newsreader', Georgia, serif;
    font-size: clamp(3.8rem, 8vw, 7rem);
    font-weight: 500;
    letter-spacing: -0.06em;
    line-height: 0.8;
}

.blackout-report__clock span {
    margin-top: 1rem;
    color: var(--report-muted);
    font-size: 0.65rem;
    font-weight: 900;
    letter-spacing: 0.16em;
    text-transform: uppercase;
}

.blackout-report__regimes {
    display: flex;
    height: 0.42rem;
    background: #191919;
}

.blackout-report__regimes span {
    display: block;
    height: 100%;
}

.regime-one {
    width: 13.7%;
    background: #ef574b;
}

.regime-two {
    width: 23.1%;
    background: #d7a93f;
}

.regime-three {
    width: 63.2%;
    background: #a91f19;
}

.blackout-report__phases {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    border-bottom: 1px solid var(--report-line);
}

.blackout-report__phases article {
    min-height: 19rem;
    padding: 1.4rem;
    border-inline-end: 1px solid var(--report-line);
}

.blackout-report__phases article:last-child {
    border-inline-end: 0;
}

.blackout-report__phases h4 {
    margin: 2.5rem 0 0;
    font-family: 'Newsreader', Georgia, serif;
    font-size: 1.7rem;
    font-weight: 500;
    line-height: 1.05;
}

.blackout-report__phases time {
    display: block;
    margin-top: 1rem;
    color: var(--report-muted);
    font-size: 0.68rem;
}

.blackout-report__phases strong {
    display: block;
    margin-top: 1.3rem;
    color: #f2eee6;
    font-size: 0.78rem;
}

.blackout-report__phases p {
    margin: 1rem 0 0;
    color: var(--report-muted);
    font-size: 0.76rem;
    line-height: 1.55;
}

.phase-whitelist {
    background: rgba(215, 169, 63, 0.07);
}

.blackout-report__body {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(18rem, 0.75fr);
    border-bottom: 1px solid var(--report-line);
}

.blackout-timeline,
.blackout-notes {
    padding: clamp(1.5rem, 4vw, 3rem);
}

.blackout-timeline {
    border-inline-end: 1px solid var(--report-line);
}

.blackout-timeline > h4,
.blackout-sources > h4 {
    margin: 0;
    font-size: 0.7rem;
    font-weight: 900;
    letter-spacing: 0.16em;
    text-transform: uppercase;
}

.blackout-timeline ol {
    margin: 2.5rem 0 0;
    padding: 0;
    list-style: none;
}

.blackout-timeline li {
    display: grid;
    grid-template-columns: 10rem minmax(0, 1fr);
    gap: 1.5rem;
    padding: 1.4rem 0;
    border-top: 1px solid var(--report-line);
}

.blackout-timeline time {
    color: var(--report-red);
    font-size: 0.7rem;
    font-weight: 900;
}

.blackout-timeline h5,
.blackout-notes h4,
.blackout-precedent h4 {
    margin: 0;
    font-family: 'Newsreader', Georgia, serif;
    font-size: 1.45rem;
    font-weight: 500;
}

.blackout-timeline p,
.blackout-notes p,
.blackout-precedent p {
    margin: 0.6rem 0 0;
    color: var(--report-muted);
    font-size: 0.82rem;
    line-height: 1.65;
}

.blackout-notes {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.blackout-notes > div {
    padding: 1.3rem;
    border: 1px solid var(--report-line);
}

.blackout-notes i {
    display: inline-block;
    margin-bottom: 2.5rem;
    color: var(--report-red);
}

.blackout-notes__status {
    background: rgba(70, 149, 103, 0.1);
}

.blackout-notes__status i {
    color: #70bb8d;
}

.blackout-precedent {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(18rem, 0.55fr);
    margin: 0;
    border-bottom: 1px solid var(--report-line);
}

.blackout-precedent__image {
    padding: clamp(1rem, 2vw, 1.5rem);
    border-inline-end: 1px solid var(--report-line);
}

.blackout-precedent img {
    width: 100%;
    height: 100%;
    min-height: 22rem;
    display: block;
    object-fit: contain;
    background: #111;
}

.blackout-precedent figcaption {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: clamp(1.5rem, 3vw, 2.5rem);
}

.blackout-precedent h4 {
    margin-top: 2rem;
    font-size: 2rem;
}

.blackout-precedent a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1rem;
    color: #e9e4dc;
    border-top: 1px solid var(--report-line);
    font-size: 0.68rem;
    font-weight: 800;
}

.blackout-sources {
    padding: clamp(1.5rem, 4vw, 3rem);
}

.blackout-sources > div {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0;
    margin-top: 1.5rem;
    border-top: 1px solid var(--report-line);
    border-inline-start: 1px solid var(--report-line);
}

.blackout-sources a {
    min-height: 5.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    color: #c6c0b7;
    border-inline-end: 1px solid var(--report-line);
    border-bottom: 1px solid var(--report-line);
    font-size: 0.74rem;
    line-height: 1.45;
}

.blackout-sources a:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.04);
}

@media (max-width: 900px) {
    .blackout-report__header,
    .blackout-report__body,
    .blackout-precedent {
        grid-template-columns: 1fr;
    }

    .blackout-report__total,
    .blackout-timeline,
    .blackout-precedent__image {
        padding-inline-start: 0;
        border-inline-start: 0;
        border-inline-end: 0;
    }

    .blackout-report__total {
        padding-top: 1.5rem;
        border-top: 1px solid var(--report-line);
    }

    .blackout-timeline {
        border-bottom: 1px solid var(--report-line);
    }
}

@media (max-width: 640px) {
    .blackout-report__clock,
    .blackout-report__phases,
    .blackout-sources > div {
        grid-template-columns: 1fr;
    }

    .blackout-report__clock > div {
        min-height: 9rem;
        border-inline-end: 0;
        border-bottom: 1px solid var(--report-line);
    }

    .blackout-report__clock > div:last-child {
        border-bottom: 0;
    }

    .blackout-report__phases article {
        min-height: auto;
        border-inline-end: 0;
        border-bottom: 1px solid var(--report-line);
    }

    .blackout-report__phases article:last-child {
        border-bottom: 0;
    }

    .blackout-timeline li {
        grid-template-columns: 1fr;
        gap: 0.7rem;
    }

    .blackout-precedent img {
        min-height: auto;
    }
}
</style>
