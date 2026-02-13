<script setup lang="ts">
import { computed } from 'vue';
import type { ParsedEvent } from '~/server/utils/events/schemas';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
    event: ParsedEvent;
    qrCodeUrl: string;
    flagUrl?: string;
    width: number;
    height: number;
}>();

const { t } = useI18n();

const formatDate = (dateStr: string) => {
    return new Date(dateStr.replace(/\//g, '-')).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

const locationText = computed(() => {
    const loc = props.event.location;
    if (Array.isArray(loc)) return 'Multiple Locations';
    if (!loc) return 'Online';
    
    // Address + City (Country is now displayed separately in header)
    const parts = [loc.address, loc.city].filter(Boolean);
    return parts.join(', ');
});

const countryName = computed(() => {
    const loc = props.event.location;
    if (Array.isArray(loc) || !loc?.country) return '';
    return t(`countries.${loc.country}`, loc.country);
});

</script>

<template>
    <div 
        class="bg-slate-900 text-white relative flex flex-col overflow-hidden"
        :style="{ width: width + 'px', height: height + 'px' }"
    >
        <!-- Background Image -->
        <div 
            class="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style="background-image: url('/images/poster-bg.png');"
        >
            <!-- Gradient Overlay for readability -->
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/60"></div>
        </div>
        
        <!-- Header -->
        <div class="p-12 flex items-center justify-between relative z-10">
            <!-- Left: Logo + Brand -->
            <div class="flex items-center gap-4">
                <img src="/lion-and-sun.svg" class="w-16 h-16 drop-shadow-lg" crossorigin="anonymous" />
                <div class="flex flex-col">
                    <span class="text-3xl font-bold tracking-tighter text-white">IranArchive<span class="text-blue-400">.net</span></span>
                    <span class="text-lg text-slate-300 uppercase tracking-[0.2em] font-medium">Event Invitation</span>
                </div>
            </div>

            <!-- Right: Flag (Twemoji) + Country Name -->
            <div class="flex flex-col items-end gap-2 text-right">
                <div v-if="flagUrl" class="w-20 h-20 flex items-center justify-center drop-shadow-xl">
                    <img :src="flagUrl" class="w-full h-full object-contain" crossorigin="anonymous" />
                </div>
                <div v-if="countryName" class="text-2xl font-black text-white uppercase tracking-widest drop-shadow-md">
                    {{ countryName }}
                </div>
            </div>
        </div>

        <!-- Content -->
        <div class="flex-1 flex flex-col justify-center px-16 relative z-10 gap-16">
            <div class="flex flex-col gap-6">
                <!-- Title -->
                <h1 
                    class="text-7xl font-black leading-tight text-white"
                    style="text-shadow: 0 10px 20px rgba(0,0,0,0.5);"
                >
                    {{ event.title }}
                </h1>
                
                <!-- Organizer -->
                <div v-if="event.organizer?.name" class="flex items-center gap-3 text-blue-200 font-bold tracking-wide">
                    <span class="text-blue-400 uppercase tracking-widest text-sm" style="text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Organized by</span>
                    <span class="text-2xl border-b-2 border-blue-400/30 pb-1" style="text-shadow: 0 2px 4px rgba(0,0,0,0.3);">{{ event.organizer.name }}</span>
                </div>
            </div>

            <!-- Details Grid -->
            <div class="grid gap-12">
                <!-- Date/Time -->
                <div class="flex items-center gap-8">
                    <!-- Icon Box -->
                    <div class="w-24 h-24 rounded-3xl bg-slate-900/80 border border-white/10 flex items-center justify-center shrink-0" style="box-shadow: 0 0 30px rgba(0,0,0,0.5);">
                        <!-- Calendar SVG -->
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-14 h-14 text-blue-400">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                    </div>
                    <!-- Added flex-1 and min-w-0 for reliable wrapping -->
                    <div class="flex-1 min-w-0">
                        <div 
                            class="text-5xl font-black text-white tracking-tight"
                            style="line-height: 1.1; text-shadow: 0 4px 8px rgba(0,0,0,0.4);"
                        >
                            {{ formatDate(event.date.start) }}
                        </div>
                        <div 
                            class="text-4xl text-blue-300 font-bold mt-3"
                            style="line-height: 1.1; text-shadow: 0 4px 8px rgba(0,0,0,0.4);"
                        >
                            {{ formatTime(event.date.start_time) }}
                            <span v-if="event.date.end_time"> - {{ formatTime(event.date.end_time) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Location -->
                <div class="flex items-center gap-8">
                    <!-- Icon Box -->
                    <div class="w-24 h-24 rounded-3xl bg-slate-900/80 border border-white/10 flex items-center justify-center shrink-0" style="box-shadow: 0 0 30px rgba(0,0,0,0.5);">
                        <!-- Location SVG -->
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-14 h-14 text-orange-400">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                    </div>
                    <!-- Added flex-1 and min-w-0 -->
                    <div class="flex-1 min-w-0">
                        <div 
                            class="text-4xl font-bold text-slate-100"
                            style="line-height: 1.25; text-shadow: 0 4px 8px rgba(0,0,0,0.4);"
                        >
                            {{ locationText }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="p-12 bg-slate-950/95 flex items-center justify-between border-t border-white/10 relative z-10 mt-auto">
            <div class="flex flex-col gap-3">
                <span class="text-2xl font-black text-white uppercase tracking-widest drop-shadow-lg">Scan to View</span>
            </div>
            <div class="bg-white p-3 rounded-2xl shadow-2xl">
                <img v-if="qrCodeUrl" :src="qrCodeUrl" class="w-40 h-40" crossorigin="anonymous" />
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
</style>
