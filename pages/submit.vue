<template>
  <div class="min-h-screen pb-12">
    <div class="container mx-auto px-4 mt-6 max-w-4xl">
      
      <!-- Header -->
      <div class="bg-surface-0 dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm mb-6">
        <h1 class="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-0">
          Submit Information
        </h1>
        <p class="text-surface-500 dark:text-surface-400 mt-2">
          Submit incidents, events, or campaigns anonymously. All submissions are reviewed before publishing.
        </p>
      </div>

      <!-- Privacy Warning -->
      <Message severity="warn" :closable="false" class="mb-6">
        <strong>Privacy Warning:</strong> Do not include personally identifying information unless you accept it may be published. All submissions are public after approval.
      </Message>

      <!-- Success State -->
      <div v-if="submitted" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
        <div class="flex items-start gap-3">
          <i class="pi pi-check-circle text-2xl text-green-600 dark:text-green-400"></i>
          <div class="flex-1">
            <h3 class="font-bold text-green-900 dark:text-green-100 mb-2">Submission Received!</h3>
            <p class="text-green-800 dark:text-green-200 mb-3">
              Your submission has been received and will be reviewed. A pull request will be created for manual review.
            </p>
            <div class="bg-white dark:bg-surface-800 p-3 rounded border border-green-200 dark:border-green-700">
              <p class="text-sm text-surface-600 dark:text-surface-400 mb-1">Tracking ID:</p>
              <code class="text-sm font-mono bg-surface-100 dark:bg-surface-700 px-2 py-1 rounded">{{ submissionId }}</code>
            </div>
            <Button label="Submit Another" icon="pi pi-plus" class="mt-4" size="small" @click="resetForm" />
          </div>
        </div>
      </div>

      <!-- Form Tabs -->
      <div v-else class="bg-surface-0 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
        <TabView v-model:activeIndex="activeTab" class="w-full">
          
          <!-- Incident Tab -->
          <TabPanel header="Incident">
            <IncidentSubmissionForm
              v-if="activeTab === 0"
              @submit="handleSubmit"
              :submitting="submitting"
            />
          </TabPanel>

          <TabPanel header="Event">
            <div class="p-1">
              <EventSubmissionForm
                v-if="activeTab === 1"
                @success="handleSuccess"
              />
            </div>
          </TabPanel>

          <!-- Campaign Tab -->
          <TabPanel header="Campaign">
            <CampaignSubmissionForm
              v-if="activeTab === 2"
              @submit="handleSubmit"
              :submitting="submitting"
            />
          </TabPanel>

        </TabView>
      </div>

      <!-- Honeypot (hidden) -->
      <input type="text" name="website" v-model="honeypot" style="position: absolute; left: -9999px;" tabindex="-1" autocomplete="off">

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import IncidentSubmissionForm from '~/components/submissions/IncidentSubmissionForm.vue';
import EventSubmissionForm from '~/components/submissions/EventSubmissionForm.vue';
import CampaignSubmissionForm from '~/components/submissions/CampaignSubmissionForm.vue';
import {  
  initUpload,
  completeSubmission,
  uploadToR2,
  calculateSHA256,
  type SubmissionKind
} from '~/utils/submissionsClient';

// SEO
useHead({
  title: 'Submit Information - IranArchive',
  meta: [
    { name: 'description', content: 'Submit incidents, events, or campaigns to IranArchive anonymously.' }
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
    console.log('Page: Event submission success', payload);
    // Component shows success message internally now, but if we want to bubble up:
    // submitted.value = true; 
    // submissionId.value = payload.submissionId;
    // But since the component is handling it UI-wise, we might not need to do anything here.
}

onMounted(() => {
  console.log('Page: submit.vue mounted');
});

async function handleSubmit(payload: { kind: SubmissionKind; data: any; files: File[]; turnstileToken: string }) {
  console.log('Page: handleSubmit called', { kind: payload.kind, files: payload.files.length, token: !!payload.turnstileToken });
  
  // Check honeypot
  if (honeypot.value) {
    console.warn('Honeypot filled - potential spam');
    return;
  }

  submitting.value = true;

  try {
    // Step 1: Calculate file hashes and init upload
    console.log('Page: Calculating hashes...');
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

    console.log('Page: calling initUpload...');
    const initResponse = await initUpload({
      turnstileToken: payload.turnstileToken,
      kind: payload.kind,
      files: fileInfos
    });
    console.log('Page: initUpload success', initResponse);

    submissionId.value = initResponse.submissionId;

    // Step 2: Upload files to R2
    if (payload.files.length > 0) {
        console.log('Page: Uploading files to R2...');
        // ... (existing upload logic)
    } 
    
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

    // Step 3: Complete submission
    console.log('Page: calling completeSubmission...');
    await completeSubmission({
      submissionId: submissionId.value,
      kind: payload.kind,
      payload: payload.data,
      uploadedFiles,
      turnstileToken: payload.turnstileToken
    });
    console.log('Page: completeSubmission success');

    // Success!
    submitted.value = true;

  } catch (error: any) {
    console.error('Submission error (Page):', error);
    alert(`Submission failed: ${error.message || 'Unknown error'}`);
  } finally {
    submitting.value = false;
  }
}
</script>
