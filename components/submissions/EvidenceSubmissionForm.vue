<template>
  <form @submit.prevent="handleSubmit" class="p-4 sm:p-6 space-y-6">
    
    <!-- Basic Information -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Evidence Details</h3>
      
      <div>
        <label class="block text-sm font-medium mb-2">Type *</label>
        <Select
          v-model="form.type"
          :options="typeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select evidence type"
          class="w-full"
          :invalid="submitted && !form.type"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Title *</label>
        <InputText
          v-model="form.title"
          placeholder="Brief title describing the evidence"
          class="w-full"
          :invalid="submitted && !form.title"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Description *</label>
        <Textarea
          v-model="form.description"
          rows="4"
          placeholder="Detailed description of what is shown/heard in the evidence..."
          class="w-full"
          :invalid="submitted && !form.description"
          required
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Captured Date (optional)</label>
          <Calendar
            v-model="form.capturedAt"
            dateFormat="yy/mm/dd"
            showIcon
            class="w-full"
            placeholder="YYYY/MM/DD"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Location (optional)</label>
          <InputText
            v-model="form.claimedLocation"
            placeholder="e.g., Tehran, Iran"
            class="w-full"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">File * (Required)</label>
        <FileUpload
          mode="basic"
          :accept="acceptedFileTypes"
          :maxFileSize="90000000"
          @select="onFileSelect"
          chooseLabel="Choose File"
          :class="{ 'p-invalid': submitted && !selectedFile }"
        />
        <small class="text-surface-500">
          Images (JPG, PNG, WebP), Videos (MP4, WebM), or Documents (PDF). Max 90MB.
        </small>
        <Message v-if="submitted && !selectedFile" severity="error" :closable="false" class="mt-2">
          Evidence file is required
        </Message>
      </div>
    </div>

    <!-- Turnstile -->
    <div>
      <div id="turnstile-evidence" ref="turnstileContainer"></div>
    </div>

    <!-- Submit -->
    <div class="flex gap-3">
      <Button
        type="submit"
        label="Submit Evidence"
        icon="pi pi-send"
        :loading="submitting"
        :disabled="!turnstileToken || !selectedFile"
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
const selectedFile = ref<File | null>(null);

const typeOptions = [
  { label: 'Video', value: 'video' },
  { label: 'Image', value: 'image' },
  { label: 'Document', value: 'document' }
];

const form = ref({
  type: '',
  title: '',
  description: '',
  capturedAt: null as Date | null,
  claimedLocation: ''
});

const acceptedFileTypes = computed(() => {
  return 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,application/pdf';
});

onMounted(() => {
  if (!document.getElementById('turnstile-script')) {
    const script = document.createElement('script');
    script.id = 'turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => renderTurnstile();
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
  selectedFile.value = event.files[0];
}

function handleSubmit() {
  submitted.value = true;

  if (!form.value.type || !form.value.title || !form.value.description || !selectedFile.value) {
    return;
  }

  const data = {
    type: form.value.type,
    title: form.value.title,
    description: form.value.description,
    captured_at: formatDate(form.value.capturedAt),
    claimed_location: form.value.claimedLocation,
    provenance: {
      submitted_by: 'Anonymous'
    },
    content_warning: 'none'
  };

  emit('submit', {
    kind: 'evidence',
    data,
    files: [selectedFile.value],
    turnstileToken: turnstileToken.value
  });
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

function resetForm() {
  form.value = {
    type: '',
    title: '',
    description: '',
    capturedAt: null,
    claimedLocation: ''
  };
  selectedFile.value = null;
  submitted.value = false;
}
</script>
