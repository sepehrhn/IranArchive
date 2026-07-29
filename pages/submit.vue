<template>
  <div class="min-h-screen pb-12">
    <div class="container mx-auto px-4 mt-6 max-w-4xl">
      
      <!-- Header -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm mb-6">
        <h1 class="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-0">
          {{ t('submitPage.headerTitle') }}
        </h1>
        <p class="text-surface-500 dark:text-surface-400 mt-2">
          {{ t('submitPage.headerSubtitle') }}
        </p>
      </div>

      <!-- Privacy Warning -->
      <Message severity="warn" :closable="false" class="mb-6">
        <strong>{{ t('submitPage.privacyTitle') }}</strong> {{ t('submitPage.privacyMessage') }}
      </Message>

      <!-- Success State -->
      <div v-if="submitted" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
        <div class="flex items-start gap-3">
          <i class="pi pi-check-circle text-2xl text-green-600 dark:text-green-400"></i>
          <div class="flex-1">
            <h3 class="font-bold text-green-900 dark:text-green-100 mb-2">{{ t('submitPage.successTitle') }}</h3>
            <p class="text-green-800 dark:text-green-200 mb-3">
              {{ t('submitPage.successMessage') }}
            </p>
            <div class="bg-white dark:bg-surface-800 p-3 rounded border border-green-200 dark:border-green-700">
              <p class="text-sm text-surface-600 dark:text-surface-400 mb-1">{{ t('submitPage.trackingId') }}</p>
              <code class="text-sm font-mono bg-surface-100 dark:bg-surface-700 px-2 py-1 rounded">{{ submissionId }}</code>
            </div>
            <Button :label="t('submitPage.submitAnother')" icon="pi pi-plus" class="mt-4" size="small" @click="resetForm" />
          </div>
        </div>
      </div>

      <!-- Form Tabs -->
      <div v-else class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
        <TabView v-model:activeIndex="activeTab" class="w-full">
          
          <!-- Incident Tab -->
          <TabPanel :header="t('submitPage.tabs.incident')">
            <IncidentSubmissionForm
              v-if="activeTab === 0"
              @submit="handleSubmit"
              :submitting="submitting"
            />
          </TabPanel>

          <TabPanel :header="t('submitPage.tabs.event')">
            <div class="p-1">
              <EventSubmissionForm
                v-if="activeTab === 1"
                @success="handleSuccess"
              />
            </div>
          </TabPanel>



        </TabView>
      </div>

      <!-- Honeypot (hidden) -->
      <input type="text" name="website" v-model="honeypot" style="position: absolute; left: -9999px;" tabindex="-1" autocomplete="off">

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const { t } = useI18n();
import IncidentSubmissionForm from '~/components/submissions/IncidentSubmissionForm.vue';
import EventSubmissionForm from '~/components/submissions/EventSubmissionForm.vue';

import {  
  initUpload,
  completeSubmission,
  uploadToR2,
  calculateSHA256,
  validateUploadCollection,
  type SubmissionKind
} from '~/utils/submissionsClient';

// SEO
useHead({
  title: t('submitPage.title'),
  meta: [
    { name: 'description', content: t('submitPage.description') }
  ]
});

const activeTab = ref(0);
const submitting = ref(false);
const submitted = ref(false);
const submissionId = ref('');
const honeypot = ref('');

function resetForm() {
  submitted.value = false;
  submissionId.value = '';
  submitting.value = false;
}

function handleSuccess(payload: any) {
    void payload;
}

async function handleSubmit(payload: { kind: SubmissionKind; data: any; files: File[]; turnstileToken: string }) {
  // Check honeypot
  if (honeypot.value) {
    return;
  }

  const uploadValidation = validateUploadCollection(payload.files);
  if (!uploadValidation.valid) {
    alert(uploadValidation.error);
    return;
  }

  submitting.value = true;

  try {
    // Step 1: Calculate file hashes and initialize the upload.
    const fileInfos = [];
    for (const file of payload.files) {
      const sha256 = await calculateSHA256(file);
      fileInfos.push({
        name: file.name,
        size: file.size,
        mime: file.type,
        sha256
      });
    }

    const initResponse = await initUpload({
      turnstileToken: payload.turnstileToken,
      kind: payload.kind,
      files: fileInfos
    });

    submissionId.value = initResponse.submissionId;

    // Step 2: Upload the exact initialized files.
    const uploadedFiles = [];
    for (let i = 0; i < payload.files.length; i++) {
      const file = payload.files[i];
      const upload = initResponse.uploads[i];
      
      await uploadToR2(file, upload.putUrl);
      
      uploadedFiles.push({
        key: upload.key,
        sha256: fileInfos[i].sha256,
        originalName: file.name,
        mime: file.type,
        size: file.size
      });
    }

    // Step 3: Complete submission.
    await completeSubmission({
      submissionId: submissionId.value,
      kind: payload.kind,
      payload: payload.data,
      uploadedFiles,
      turnstileToken: payload.turnstileToken
    });
    submitted.value = true;

  } catch (error) {
    console.error('Submission error', error);
    alert('Submission failed. Please try again or contact us by email.');
  } finally {
    submitting.value = false;
  }
}
</script>
