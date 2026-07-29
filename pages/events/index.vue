<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { ParsedEvent } from '~/server/utils/events/schemas';
import { useCountries } from '~/composables/useCountries';
import { useEvents } from '~/composables/useEvents';

const { t, locale } = useI18n();

useSeoMeta({
    title: () => t('eventsPage.title'),
    ogTitle: () => t('eventsPage.title'),
    description: () => t('eventsPage.description'),
    ogDescription: () => t('eventsPage.description'),
    ogImage: 'https://iranarchive.com/og-image-events.jpg',
    twitterCard: 'summary_large_image',
});

const { listEvents } = useEvents();
const { loadCountries, getCountryFlagUrl } = useCountries();

const events = ref<ParsedEvent[]>([]);
const pending = ref(true);
const searchQuery = ref('');
const selectedCountry = ref<string | null>(null);
const selectedCity = ref<string | null>(null);
const sortOrder = ref<'newest' | 'oldest'>('newest');
const visibleLimit = ref(24);

onMounted(async () => {
    try {
        await loadCountries();
        events.value = await listEvents();
    } finally {
        pending.value = false;
    }
});

const getLocation = (event: ParsedEvent) => {
    return Array.isArray(event.location) ? null : event.location;
};

const getEventTimestamp = (event: ParsedEvent) => {
    const [year, month, day] = event.date.start.split('/').map(Number);
    const timeMatch = event.date.start_time?.match(/^(\d{1,2}):(\d{2})/);
    const hours = timeMatch ? Number(timeMatch[1]) : 0;
    const minutes = timeMatch ? Number(timeMatch[2]) : 0;
    return Date.UTC(year, month - 1, day, hours, minutes);
};

const archivedEvents = computed(() => {
    return events.value.filter(event => ['past', 'held'].includes(event.computed_state));
});

const archiveStats = computed(() => {
    const countries = new Set<string>();
    const cities = new Set<string>();

    archivedEvents.value.forEach(event => {
        const location = getLocation(event);
        if (location?.country) countries.add(location.country);
        if (location?.city) cities.add(`${location.country || ''}:${location.city}`);
    });

    const timestamps = archivedEvents.value
        .map(getEventTimestamp)
        .filter(Number.isFinite)
        .sort((a, b) => a - b);

    return {
        total: archivedEvents.value.length,
        countries: countries.size,
        cities: cities.size,
        first: timestamps[0],
        last: timestamps[timestamps.length - 1],
    };
});

const countryOptions = computed(() => {
    const codes = new Set<string>();
    archivedEvents.value.forEach(event => {
        const country = getLocation(event)?.country;
        if (country) codes.add(country);
    });

    return Array.from(codes)
        .map(code => ({
            label: t(`countries.${code}`, code),
            value: code,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
});

const cityOptions = computed(() => {
    if (!selectedCountry.value) return [];

    const cities = new Set<string>();
    archivedEvents.value.forEach(event => {
        const location = getLocation(event);
        if (location?.city && location.country === selectedCountry.value) {
            cities.add(location.city);
        }
    });

    return Array.from(cities)
        .sort((a, b) => a.localeCompare(b))
        .map(city => ({ label: city, value: city }));
});

const sortOptions = computed(() => [
    { label: t('eventsPage.newestFirst'), value: 'newest' },
    { label: t('eventsPage.oldestFirst'), value: 'oldest' },
]);

const filteredEvents = computed(() => {
    const query = searchQuery.value.trim().toLocaleLowerCase();

    const filtered = archivedEvents.value.filter(event => {
        const location = getLocation(event);
        const matchesCountry = !selectedCountry.value || location?.country === selectedCountry.value;
        const matchesCity = !selectedCity.value || location?.city === selectedCity.value;

        if (!matchesCountry || !matchesCity) return false;
        if (!query) return true;

        const searchable = [
            event.title,
            event.description,
            event.organizer?.name,
            location?.city,
            location?.address,
            location?.country ? t(`countries.${location.country}`, location.country) : '',
            ...(event.tags || []),
        ]
            .filter(Boolean)
            .join(' ')
            .toLocaleLowerCase();

        return searchable.includes(query);
    });

    return [...filtered].sort((a, b) => {
        const direction = sortOrder.value === 'newest' ? -1 : 1;
        return (getEventTimestamp(a) - getEventTimestamp(b)) * direction;
    });
});

const visibleEvents = computed(() => filteredEvents.value.slice(0, visibleLimit.value));

const archiveGroups = computed(() => {
    const groups = new Map<string, ParsedEvent[]>();

    visibleEvents.value.forEach(event => {
        const key = event.date.start.slice(0, 7);
        const group = groups.get(key) || [];
        group.push(event);
        groups.set(key, group);
    });

    return Array.from(groups.entries()).map(([key, groupEvents]) => {
        const [year, month] = key.split('/').map(Number);
        const label = new Intl.DateTimeFormat(locale.value === 'fa' ? 'fa-IR' : 'en-US', {
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
        }).format(new Date(Date.UTC(year, month - 1, 1)));

        return {
            key,
            label,
            events: groupEvents,
        };
    });
});

const archiveRange = computed(() => {
    if (!archiveStats.value.first || !archiveStats.value.last) return '';

    const formatter = new Intl.DateTimeFormat(locale.value === 'fa' ? 'fa-IR' : 'en-US', {
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    });

    const first = formatter.format(new Date(archiveStats.value.first));
    const last = formatter.format(new Date(archiveStats.value.last));
    return first === last ? first : `${first} – ${last}`;
});

const hasActiveFilters = computed(() => {
    return Boolean(
        searchQuery.value ||
        selectedCountry.value ||
        selectedCity.value
    );
});

const resetFilters = () => {
    searchQuery.value = '';
    selectedCountry.value = null;
    selectedCity.value = null;
    visibleLimit.value = 24;
};

watch(selectedCountry, () => {
    selectedCity.value = null;
});

watch(
    [searchQuery, selectedCountry, selectedCity, sortOrder],
    () => {
        visibleLimit.value = 24;
    }
);
</script>

<template>
    <div class="space-y-8 pb-12">
        <section class="relative overflow-hidden rounded-3xl border border-surface-700/40 bg-surface-950 text-white shadow-2xl shadow-surface-950/20">
            <div class="absolute inset-0 archive-grid opacity-30"></div>
            <div class="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-primary-500/15 blur-3xl"></div>
            <div class="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>

            <div class="relative grid gap-10 px-6 py-10 md:px-10 md:py-14 lg:grid-cols-[1fr_auto] lg:items-end">
                <div class="max-w-3xl">
                    <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-surface-300 backdrop-blur">
                        <i class="pi pi-history text-primary-400"></i>
                        {{ t('eventsPage.eyebrow') }}
                    </div>
                    <h1 class="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
                        {{ t('eventsPage.heroTitle') }}
                    </h1>
                    <p class="mt-5 max-w-2xl text-base leading-7 text-surface-300 md:text-lg">
                        {{ t('eventsPage.heroSubtitle') }}
                    </p>
                    <div v-if="archiveRange" class="mt-7 flex items-center gap-3 text-sm font-semibold text-surface-300">
                        <span class="h-px w-10 bg-primary-400"></span>
                        {{ archiveRange }}
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-3 lg:w-[430px]">
                    <div class="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur md:p-5">
                        <p class="text-2xl font-black md:text-3xl">
                            <Skeleton v-if="pending" width="3rem" height="2rem" class="!bg-white/15" />
                            <span v-else>{{ $nFa(archiveStats.total) }}</span>
                        </p>
                        <p class="mt-1 text-[10px] font-bold uppercase tracking-wider text-surface-400 md:text-xs">
                            {{ t('eventsPage.archivedEvents') }}
                        </p>
                    </div>
                    <div class="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur md:p-5">
                        <p class="text-2xl font-black md:text-3xl">
                            <Skeleton v-if="pending" width="3rem" height="2rem" class="!bg-white/15" />
                            <span v-else>{{ $nFa(archiveStats.countries) }}</span>
                        </p>
                        <p class="mt-1 text-[10px] font-bold uppercase tracking-wider text-surface-400 md:text-xs">
                            {{ t('eventsPage.countriesRepresented') }}
                        </p>
                    </div>
                    <div class="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur md:p-5">
                        <p class="text-2xl font-black md:text-3xl">
                            <Skeleton v-if="pending" width="3rem" height="2rem" class="!bg-white/15" />
                            <span v-else>{{ $nFa(archiveStats.cities) }}</span>
                        </p>
                        <p class="mt-1 text-[10px] font-bold uppercase tracking-wider text-surface-400 md:text-xs">
                            {{ t('eventsPage.citiesRepresented') }}
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section class="rounded-3xl border border-surface-200 bg-surface-0 p-5 shadow-sm dark:border-surface-800 dark:bg-surface-900 md:p-7">
            <div class="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                    <p class="text-xs font-black uppercase tracking-[0.2em] text-primary-500">
                        {{ t('eventsPage.exploreArchive') }}
                    </p>
                    <h2 class="mt-2 text-2xl font-black text-surface-900 dark:text-surface-0">
                        {{ t('eventsPage.timeline') }}
                    </h2>
                    <p class="mt-1 max-w-2xl text-sm leading-6 text-surface-500 dark:text-surface-400">
                        {{ t('eventsPage.archiveDescription') }}
                    </p>
                </div>
                <Button
                    v-if="hasActiveFilters"
                    :label="t('eventsPage.clearFilters')"
                    icon="pi pi-filter-slash"
                    severity="secondary"
                    text
                    size="small"
                    @click="resetFilters"
                />
            </div>

            <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(280px,1.5fr)_1fr_1fr_0.9fr]">
                <div class="relative">
                    <i class="pi pi-search absolute left-3 top-1/2 z-10 -translate-y-1/2 text-surface-400"></i>
                    <InputText
                        v-model="searchQuery"
                        :placeholder="t('eventsPage.searchPlaceholder')"
                        class="w-full !pl-10"
                    />
                </div>
                <Select
                    v-model="selectedCountry"
                    :options="countryOptions"
                    optionLabel="label"
                    optionValue="value"
                    :placeholder="t('eventsPage.allCountries')"
                    showClear
                    filter
                    class="w-full"
                >
                    <template #value="slotProps">
                        <div v-if="slotProps.value" class="flex min-w-0 items-center gap-2">
                            <img
                                :src="getCountryFlagUrl(slotProps.value)"
                                :alt="countryOptions.find(country => country.value === slotProps.value)?.label || slotProps.value"
                                class="h-3.5 w-5 flex-shrink-0 rounded-sm object-cover shadow-sm"
                            />
                            <span class="truncate">
                                {{ countryOptions.find(country => country.value === slotProps.value)?.label }}
                            </span>
                        </div>
                        <span v-else class="text-surface-400">{{ slotProps.placeholder }}</span>
                    </template>
                    <template #option="slotProps">
                        <div class="flex items-center gap-3">
                            <img
                                :src="getCountryFlagUrl(slotProps.option.value)"
                                :alt="slotProps.option.label"
                                class="h-4 w-6 flex-shrink-0 rounded object-cover shadow-sm"
                            />
                            <span>{{ slotProps.option.label }}</span>
                        </div>
                    </template>
                </Select>
                <Select
                    v-model="selectedCity"
                    :options="cityOptions"
                    optionLabel="label"
                    optionValue="value"
                    :placeholder="selectedCountry ? t('eventsPage.allCities') : t('eventsPage.chooseCountryFirst')"
                    :disabled="!selectedCountry"
                    showClear
                    filter
                    class="w-full"
                />
                <Select
                    v-model="sortOrder"
                    :options="sortOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                />
            </div>
        </section>

        <section>
            <div class="mb-5 flex flex-wrap items-center justify-between gap-3 px-1">
                <p class="text-sm font-semibold text-surface-500 dark:text-surface-400">
                    {{ t('eventsPage.showing') }}
                    <span class="font-black text-surface-900 dark:text-surface-100">{{ $nFa(Math.min(visibleEvents.length, filteredEvents.length)) }}</span>
                    {{ t('eventsPage.of') }}
                    <span class="font-black text-surface-900 dark:text-surface-100">{{ $nFa(filteredEvents.length) }}</span>
                    {{ t('eventsPage.records') }}
                </p>
                <p class="flex items-center gap-2 text-xs text-surface-400">
                    <i class="pi pi-info-circle"></i>
                    {{ t('eventsPage.expandHint') }}
                </p>
            </div>

            <div v-if="pending" class="space-y-6">
                <EventsEventSkeleton v-for="i in 4" :key="i" />
            </div>

            <div v-else-if="archiveGroups.length" class="space-y-12">
                <section
                    v-for="group in archiveGroups"
                    :key="group.key"
                    class="relative border-l border-surface-200 pl-5 dark:border-surface-800 md:pl-8"
                >
                    <div class="sticky top-20 z-10 mb-5 flex items-center">
                        <span class="absolute -left-[26.5px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-primary-500 bg-surface-50 shadow-[0_0_0_5px_rgba(99,102,241,0.12)] dark:bg-surface-950 md:-left-[38.5px]"></span>
                        <div class="flex items-center gap-3 rounded-full border border-surface-200 bg-surface-0/95 px-4 py-2 shadow-sm backdrop-blur dark:border-surface-700 dark:bg-surface-900/95 md:-ml-2">
                            <h2 class="text-sm font-black uppercase tracking-[0.12em] text-surface-800 dark:text-surface-100">
                                {{ group.label }}
                            </h2>
                            <span class="rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-bold text-surface-500 dark:bg-surface-800 dark:text-surface-400">
                                {{ $nFa(group.events.length) }}
                            </span>
                        </div>
                    </div>

                    <div class="grid gap-6 xl:grid-cols-2">
                        <EventsEventCard
                            v-for="event in group.events"
                            :key="event.id"
                            :event="event"
                        />
                    </div>
                </section>

                <div v-if="visibleEvents.length < filteredEvents.length" class="flex justify-center pt-2">
                    <Button
                        :label="t('eventsPage.loadMore')"
                        icon="pi pi-chevron-down"
                        iconPos="right"
                        severity="secondary"
                        outlined
                        class="!rounded-xl !px-6"
                        @click="visibleLimit += 24"
                    />
                </div>
            </div>

            <div v-else class="rounded-3xl border-2 border-dashed border-surface-200 bg-surface-50/50 px-6 py-24 text-center dark:border-surface-800 dark:bg-surface-900/30">
                <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100 dark:bg-surface-800">
                    <i class="pi pi-search text-2xl text-surface-400"></i>
                </div>
                <h2 class="text-2xl font-black text-surface-800 dark:text-surface-100">
                    {{ t('eventsPage.noResultsTitle') }}
                </h2>
                <p class="mx-auto mt-2 max-w-md text-surface-500 dark:text-surface-400">
                    {{ t('eventsPage.noResultsDescription') }}
                </p>
                <Button
                    :label="t('eventsPage.clearFilters')"
                    icon="pi pi-filter-slash"
                    severity="secondary"
                    class="mt-6"
                    @click="resetFilters"
                />
            </div>
        </section>

        <aside class="flex gap-4 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-5 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
            <i class="pi pi-book mt-0.5 text-lg text-amber-600 dark:text-amber-400"></i>
            <div>
                <h2 class="font-black">{{ t('eventsPage.archiveNoteTitle') }}</h2>
                <p class="mt-1 text-sm leading-6 text-amber-900/75 dark:text-amber-100/70">
                    {{ t('eventsPage.archiveNoteDescription') }}
                </p>
            </div>
        </aside>
    </div>
</template>

<style scoped>
.archive-grid {
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 36px 36px;
    mask-image: linear-gradient(to bottom right, black, transparent 80%);
}

</style>
