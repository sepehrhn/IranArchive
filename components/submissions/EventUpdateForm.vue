<template>
  <div class="space-y-6">
    <div class="text-center mb-8">
      <div class="inline-block p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 mb-4">
        <i class="pi pi-file-edit text-3xl text-amber-500"></i>
      </div>
      <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-2">Suggest Update</h2>
      <p class="text-surface-500 text-sm">
        Help us keep <strong>{{ initialData?.title }}</strong> accurate.
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      
      <!-- Description -->
      <div>
        <IftaLabel>
          <Textarea
            id="update_desc"
            v-model="form.description"
            rows="5"
            class="w-full"
            variant="filled"
            autoResize
            :invalid="errors.description"
          />
          <label for="update_desc">Description of Changes *</label>
        </IftaLabel>
        <small v-if="errors.description" class="text-red-500 mt-1 block px-1">
          Please describe what needs to be updated.
        </small>
        <small class="text-surface-500 mt-1 block px-1">
          e.g. "The time has changed to 18:00", "The location is wrong", etc.
        </small>
      </div>

      <!-- Source URL -->
      <div>
        <IftaLabel>
          <InputText
            id="update_source"
            v-model="form.sourceUrl"
            class="w-full"
            variant="filled"
            :invalid="errors.sourceUrl"
          />
          <label for="update_source">Source URL (Proof) *</label>
        </IftaLabel>
        <small v-if="errors.sourceUrl" class="text-red-500 mt-1 block px-1">
          Please provide a link to verify this update.
        </small>
        <small class="text-surface-500 mt-1 block px-1">
          Link to official announcement, social media post, etc.
        </small>
      </div>



      <!-- Turnstile -->
      <div class="flex flex-col items-center gap-4 pt-4">
        <div id="turnstile-update" ref="turnstileContainer"></div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-6 border-t border-surface-200 dark:border-surface-700">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          outlined
          @click="$emit('cancel')"
          :disabled="submitting"
        />
        <Button
          type="submit"
          label="Submit Update"
          icon="pi pi-send"
          :loading="submitting"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import type { ParsedEvent } from '~/server/utils/events/schemas';

const props = defineProps<{
  initialData: ParsedEvent;
  submitting: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: any];
  cancel: [];
}>();

const config = useRuntimeConfig();
const turnstileContainer = ref<HTMLElement>();
const turnstileToken = ref('');

const form = ref({
  description: '',
  sourceUrl: ''
});

const errors = ref({
  description: false,
  sourceUrl: false
});

onMounted(() => {
  // Load Turnstile script if not present (handled globally usually but good to check)
  if (!document.getElementById('turnstile-script')) {
    const script = document.createElement('script');
    script.id = 'turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
  
  nextTick(() => renderTurnstile());
});

function renderTurnstile() {
  if (!(window as any).turnstile) {
    setTimeout(renderTurnstile, 200);
    return;
  }
  if (!turnstileContainer.value) {
    setTimeout(renderTurnstile, 100);
    return;
  }
  
  turnstileContainer.value.innerHTML = '';
  
  (window as any).turnstile.render(turnstileContainer.value, {
    sitekey: config.public.turnstileSiteKey,
    callback: (token: string) => {
      turnstileToken.value = token;
    },
    'error-callback': () => {
      console.error('Turnstile error');
    }
  });
}

function handleSubmit() {
  console.log('EventUpdateForm: handleSubmit called');

  errors.value = {
    description: !form.value.description.trim(),
    sourceUrl: !form.value.sourceUrl.trim()
  };

  if (errors.value.description || errors.value.sourceUrl) {
    return;
  }

  if (!turnstileToken.value) {
    alert('Please wait for the security check to complete.');
    return;
  }

  emit('submit', {
    kind: 'event', // Submitting as event kind, but payload logic handles update info
    data: {
      is_update: true,
      original_event_id: props.initialData.id,
      original_event_title: props.initialData.title,
      update_type: 'general_update',
      update_description: form.value.description,
      source_url: form.value.sourceUrl,
      // Minimal required fields to satisfy schema if backend validates strictly?
      // Assuming backend allows arbitrary payload or minimal fields for now.
      // If backend requires full event schema, we might have issues.
      // But typically "data" is just JSON.
      title: `UPDATE REPORT: ${props.initialData.title}`, // helping the PR title generator
      description: form.value.description,
      announcement: form.value.sourceUrl,
      type: 'online', // dummy
      date: { start: '2025/01/01', start_time: '00:00' }, // dummy to pass validation if any
      organizer: { name: 'Update Reporter' } // dummy
    },
    files: [],
    turnstileToken: turnstileToken.value
  });
}
</script>
