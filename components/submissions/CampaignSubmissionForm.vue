<template>
  <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
    
    <!-- Basic Information -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Campaign Information</h3>
      
      <div>
        <label class="block text-sm font-medium mb-2">Campaign URL <span class="text-red-500">*</span></label>
        <InputText
          v-model="form.url"
          placeholder="https://www.change.org/..."
          class="w-full"
          :invalid="submitted && !form.url"
          required
        />
        <small class="text-surface-500">Link to the petition or campaign page</small>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Campaign Title <span class="text-red-500">*</span></label>
        <InputText
          v-model="form.title"
          placeholder="Title of the campaign"
          class="w-full"
          :invalid="submitted && !form.title"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Status</label>
        <Select
          v-model="form.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select status"
          class="w-full"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Thumbnail Image</label>
        <FileUpload
          mode="basic"
          accept="image/jpeg,image/png,image/webp"
          :maxFileSize="5000000"
          @select="onFileSelect"
          chooseLabel="Choose Thumbnail"
          class="w-full"
        />
        <small class="text-surface-500">JPG, PNG, or WebP. Max 5MB. Will be displayed at 400x300px.</small>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Description</label>
        <Textarea
          v-model="form.description"
          rows="4"
          placeholder="Brief description of the campaign goals..."
          class="w-full"
        />
      </div>
    </div>

    <!-- Turnstile -->
    <div>
      <div id="turnstile-campaign" ref="turnstileContainer"></div>
    </div>

    <!-- Submit -->
    <div class="flex gap-3">
      <Button
        type="submit"
        label="Submit Campaign"
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
import { ref, onMounted } from 'vue';

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

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Closed', value: 'closed' },
  { label: 'Victory', value: 'victory' },
  { label: 'Unknown', value: 'unknown' }
];

const form = ref({
  url: '',
  title: '',
  status: 'active',
  description: ''
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

  if (!form.value.url || !form.value.title) {
    return;
  }

  const data = {
    url: form.value.url,
    title: form.value.title,
    status: form.value.status,
    description: form.value.description
  };

  const files = selectedFile.value ? [selectedFile.value] : [];

  emit('submit', {
    kind: 'campaign',
    data,
    files,
    turnstileToken: turnstileToken.value
  });
}

function resetForm() {
  form.value = {
    url: '',
    title: '',
    status: 'active',
    description: ''
  };
  selectedFile.value = null;
  submitted.value = false;
}
</script>
