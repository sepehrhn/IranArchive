<template>
  <form @submit.prevent="handleSubmit" class="p-4 sm:p-6 space-y-6">
    
    <!-- Basic Information -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Incident Information</h3>
      
      <div>
        <label class="block text-sm font-medium mb-2">Title *</label>
        <InputText
          v-model="form.title"
          placeholder="Brief title of the incident"
          class="w-full"
          :invalid="submitted && !form.title"
          required
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Start Date *</label>
          <FormDateInput
            v-model="form.startDate"
            dateFormat="yy/mm/dd"
            showIcon
            class="w-full"
            placeholder="YYYY/MM/DD"
            :invalid="submitted && !form.startDate"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Start Time</label>
          <InputText
            v-model="form.startTime"
            placeholder="HH:MM"
            class="w-full"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">End Date</label>
          <FormDateInput
            v-model="form.endDate"
            dateFormat="yy/mm/dd"
            showIcon
            class="w-full"
            placeholder="YYYY/MM/DD"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">End Time</label>
          <InputText
            v-model="form.endTime"
            placeholder="HH:MM"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Precision</label>
          <Select
            v-model="form.precision"
            :options="precisionOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Country</label>
          <InputText
            v-model="form.country"
            class="w-full"
            disabled
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Province</label>
          <InputText
            v-model="form.province"
            placeholder="e.g., Tehran"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">City</label>
          <InputText
            v-model="form.city"
            placeholder="e.g., Tehran"
            class="w-full"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Address</label>
          <InputText
            v-model="form.address"
            placeholder="Specific location or landmark"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Latitude</label>
          <InputNumber
            v-model="form.lat"
            placeholder="e.g., 35.6892"
            class="w-full"
            :minFractionDigits="0"
            :maxFractionDigits="8"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Longitude</label>
          <InputNumber
            v-model="form.lng"
            placeholder="e.g., 51.3890"
            class="w-full"
            :minFractionDigits="0"
            :maxFractionDigits="8"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Description *</label>
        <Textarea
          v-model="form.description"
          rows="6"
          placeholder="Detailed description of what happened..."
          class="w-full"
          :invalid="submitted && !form.description"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Sources</label>
        <Textarea
          v-model="sourcesText"
          rows="3"
          placeholder="One URL per line"
          class="w-full"
        />
        <small class="text-surface-500">Enter URLs to news articles, social media posts, etc. One per line.</small>
      </div>

      <!-- Casualties/Severity -->
      <div class="space-y-3">
        <h4 class="text-md font-semibold text-surface-900 dark:text-surface-0">Severity (Casualties)</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Deaths (Min)</label>
            <InputNumber
              v-model="form.deaths_min"
              placeholder="0"
              class="w-full"
              :min="0"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Deaths (Max)</label>
            <InputNumber
              v-model="form.deaths_max"
              placeholder="0"
              class="w-full"
              :min="0"
            />
          </div>
          <div class="flex items-end">
            <small class="text-surface-500 pb-2">Estimated death toll range</small>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Injured (Min)</label>
            <InputNumber
              v-model="form.injured_min"
              placeholder="0"
              class="w-full"
              :min="0"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Injured (Max)</label>
            <InputNumber
              v-model="form.injured_max"
              placeholder="0"
              class="w-full"
              :min="0"
            />
          </div>
          <div class="flex items-end">
            <small class="text-surface-500 pb-2">Estimated injured range</small>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">Arrests (Min)</label>
            <InputNumber
              v-model="form.arrests_min"
              placeholder="0"
              class="w-full"
              :min="0"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Arrests (Max)</label>
            <InputNumber
              v-model="form.arrests_max"
              placeholder="0"
              class="w-full"
              :min="0"
            />
          </div>
          <div class="flex items-end">
            <small class="text-surface-500 pb-2">Estimated arrests range</small>
          </div>
        </div>
      </div>

      <!-- Evidence Files -->

      <div>
        <label class="block text-sm font-medium mb-2">Evidence Files</label>
        <FileUpload
          mode="advanced"
          :multiple="true"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,application/pdf"
          :maxFileSize="90000000"
          @select="onFileSelect"
          @remove="onFileRemove"
          chooseLabel="Add Evidence Files"
          uploadLabel="Upload"
          cancelLabel="Clear All"
          :showUploadButton="false"
          :showCancelButton="true"
        >
          <template #empty>
            <p class="text-sm text-surface-500">Drag and drop evidence files here, or click to browse.</p>
          </template>
        </FileUpload>
        <small class="text-surface-500">
          Images (JPG, PNG, WebP, GIF), Videos (MP4, WebM), or Documents (PDF). Max 90MB total.
        </small>
        <div v-if="selectedFiles.length > 0" class="mt-2">
          <p class="text-sm font-medium">Selected: {{ selectedFiles.length }} file(s)</p>
        </div>
      </div>

      <!-- Relationships -->
      <div class="space-y-3">
        <h4 class="text-md font-semibold text-surface-900 dark:text-surface-0">Relationships</h4>
        
        <div>
          <label class="block text-sm font-medium mb-2">Evidence IDs</label>
          <InputText
            v-model="form.evidence_ids"
            placeholder="vid-2026-00001, vid-2026-00002"
            class="w-full"
          />
          <small class="text-surface-500">Comma-separated evidence IDs to link to this incident</small>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Victim IDs</label>
          <InputText
            v-model="form.victim_ids"
            placeholder="vic-2026-00001, vic-2026-00002"
            class="w-full"
          />
          <small class="text-surface-500">Comma-separated victim IDs involved in this incident</small>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Related Incident IDs</label>
          <InputText
            v-model="form.related_incident_ids"
            placeholder="inc-2026-00001, inc-2026-00002"
            class="w-full"
          />
          <small class="text-surface-500">Comma-separated incident IDs related to this one</small>
        </div>
      </div>
    </div>

    <!-- Turnstile -->
    <div>
      <div id="turnstile-incident" ref="turnstileContainer"></div>
    </div>

    <!-- Submit -->
    <div class="flex gap-3">
      <Button
        type="submit"
        label="Submit Incident Report"
        icon="pi pi-send"
        :loading="submitting"
        :disabled="!turnstileToken"
      />
      <Button
        type="button"
        label="Reset"
        severity="secondary"
        outlined
        @click="resetForm"
      />
    </div>

  </form>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

const props = defineProps<{
  submitting: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: any];
}>();

const config = useRuntimeConfig();
const turnstileContainer = ref<HTMLElement>();
const turnstileToken = ref('');
const submitted = ref(false);
const selectedFiles = ref<File[]>([]);

const precisionOptions = [
  { label: 'Exact', value: 'Exact' },
  { label: 'Approximate', value: 'Approx' },
  { label: 'Unknown', value: 'Unknown' }
];

const form = ref({
  title: '',
  startDate: null as Date | null,
  startTime: '',
  endDate: null as Date | null,
  endTime: '',
  precision: 'Exact',
  country: 'Iran',
  province: '',
  city: '',
  address: '',
  lat: null as number | null,
  lng: null as number | null,
  description: '',
  deaths_min: null as number | null,
  deaths_max: null as number | null,
  injured_min: null as number | null,
  injured_max: null as number | null,
  arrests_min: null as number | null,
  arrests_max: null as number | null,
  evidence_ids: '',
  victim_ids: '',
  related_incident_ids: ''
});

const sourcesText = ref('');

onMounted(() => {
  // Load Turnstile script
  if (!document.getElementById('turnstile-script')) {
    const script = document.createElement('script');
    script.id = 'turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      renderTurnstile();
    };
    document.head.appendChild(script);
  } else {
    renderTurnstile();
  }
});

function renderTurnstile() {
  if (!(window as any).turnstile || !turnstileContainer.value) return;
  
  (window as any).turnstile.render(turnstileContainer.value, {
    sitekey: config.public.turnstileSiteKey,
    callback: (token: string) => {
      turnstileToken.value = token;
    }
  });
}

function onFileSelect(event: any) {
  selectedFiles.value = event.files;
}

function onFileRemove(event: any) {
  // PrimeVue FileUpload handles file list internally
  selectedFiles.value = event.files;
}

function handleSubmit() {
  submitted.value = true;

  if (!form.value.title || !form.value.description || !form.value.startDate) {
    return;
  }

  const sources = sourcesText.value
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Parse ID arrays
  const evidence_ids = form.value.evidence_ids
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const victim_ids = form.value.victim_ids
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const related_incident_ids = form.value.related_incident_ids
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const data = {
    title: form.value.title,
    occurred_at: {
      start: formatDate(form.value.startDate),
      start_time: form.value.startTime,
      end: formatDate(form.value.endDate),
      end_time: form.value.endTime,
      timezone: 'Asia/Tehran',
      precision: form.value.precision
    },
    location: {
      country: form.value.country,
      province: form.value.province,
      city: form.value.city,
      address: form.value.address,
      lat: form.value.lat,
      lng: form.value.lng
    },
    description: form.value.description,
    sources,
    severity: {
      deaths: {
        min: form.value.deaths_min || 0,
        max: form.value.deaths_max || 0
      },
      injured: {
        min: form.value.injured_min || 0,
        max: form.value.injured_max || 0
      },
      arrests: {
        min: form.value.arrests_min || 0,
        max: form.value.arrests_max || 0
      }
    },
    evidence_ids,
    victims: victim_ids,
    related_incidents: related_incident_ids,
    evidence_count: selectedFiles.value.length
  };

  emit('submit', {
    kind: 'incident',
    data,
    files: selectedFiles.value,
    turnstileToken: turnstileToken.value
  });
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

function resetForm() {
  form.value = {
    title: '',
    startDate: null,
    startTime: '',
    endDate: null,
    endTime: '',
    precision: 'Exact',
    country: 'Iran',
    province: '',
    city: '',
    address: '',
    lat: null,
    lng: null,
    description: '',
    deaths_min: null,
    deaths_max: null,
    injured_min: null,
    injured_max: null,
    arrests_min: null,
    arrests_max: null,
    evidence_ids: '',
    victim_ids: '',
    related_incident_ids: ''
  };
  sourcesText.value = '';
  selectedFiles.value = [];
  submitted.value = false;
}
</script>
