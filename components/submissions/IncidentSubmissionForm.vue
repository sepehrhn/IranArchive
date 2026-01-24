<template>
  <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
    
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
          <Calendar
            v-model="form.startDate"
            dateFormat="yy/mm/dd"
            showIcon
            class="w-full"
            placeholder="YYYY/MM/DD"
            :invalid="submitted && !form.startDate"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Start Time (optional)</label>
          <InputText
            v-model="form.startTime"
            placeholder="HH:MM"
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
        <label class="block text-sm font-medium mb-2">Sources (optional)</label>
        <Textarea
          v-model="sourcesText"
          rows="3"
          placeholder="One URL per line"
          class="w-full"
        />
        <small class="text-surface-500">Enter URLs to news articles, social media posts, etc. One per line.</small>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Evidence Files (optional)</label>
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

const form = ref({
  title: '',
  startDate: null as Date | null,
  startTime: '',
  country: 'Iran',
  province: '',
  city: '',
  description: ''
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

  const data = {
    title: form.value.title,
    occurred_at: {
      start: formatDate(form.value.startDate),
      start_time: form.value.startTime,
      timezone: 'Asia/Tehran',
      precision: 'Exact'
    },
    location: {
      country: form.value.country,
      province: form.value.province,
      city: form.value.city
    },
    description: form.value.description,
    sources,
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
    country: 'Iran',
    province: '',
    city: '',
    description: ''
  };
  sourcesText.value = '';
  selectedFiles.value = [];
  submitted.value = false;
}
</script>
