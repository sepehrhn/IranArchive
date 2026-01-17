<script setup lang="ts">
</script>

<template>
  <footer class="mt-auto border-t border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 py-6 transition-colors duration-300">
    <div class="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="text-sm text-surface-600 dark:text-surface-400">
            © {{ new Date().getFullYear() }} Iran Archive.
        </div>
        
        <div class="flex items-center gap-4">
            <a href="https://x.com/Iran_Archive" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                <Button 
                    icon="pi pi-twitter" 
                    severity="secondary" 
                    rounded 
                    text 
                />
            </a>
        </div>
    </div>
  </footer>
</template>
