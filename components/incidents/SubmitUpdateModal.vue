<template>
  <Dialog v-model:visible="visible" modal header="Submit Update or Correction" :style="{ width: '35rem' }">
    <div class="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Thank you for helping us maintain accuracy. All submissions are reviewed by our research team before publication.
    </div>

    <form @submit.prevent="submit" class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
            <label for="type" class="font-semibold text-sm">Submission Type</label>
            <SelectButton v-model="form.type" :options="types" aria-labelledby="start" class="w-full" />
        </div>

        <div class="flex flex-col gap-2">
             <label for="message" class="font-semibold text-sm">Description / Correction <span class="text-red-500">*</span></label>
             <Textarea id="message" v-model="form.message" rows="4" placeholder="Please describe the evidence or the error in detail..." required />
        </div>

        <div class="flex flex-col gap-2">
             <label for="links" class="font-semibold text-sm">Supporting Links</label>
             <InputText id="links" v-model="form.links" placeholder="https://..." />
             <small class="text-gray-500">Links to videos, tweets, or articles.</small>
        </div>
        
        <div class="flex flex-col gap-2">
             <label for="email" class="font-semibold text-sm">Email (Optional)</label>
             <InputText id="email" v-model="form.email" placeholder="For follow-up questions only" type="email" />
        </div>
        
        <div class="flex justify-end gap-2 mt-4">
            <Button label="Cancel" severity="secondary" @click="visible = false" text />
            <Button label="Submit Report" type="submit" />
        </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
const visible = defineModel<boolean>('visible');
const toast = useToast();

const types = ['Add Evidence', 'Suggest Edit', 'Report Duplicate', 'Challenge'];

const form = reactive({
    type: 'Add Evidence',
    message: '',
    links: '',
    email: ''
});

const submit = () => {
    // Mock submission
    toast.add({ severity: 'success', summary: 'Received', detail: 'Your submission has been received and queued for review.', life: 5000 });
    
    // Reset
    form.message = '';
    form.links = '';
    
    visible.value = false;
};
</script>
