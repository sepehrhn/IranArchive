<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <footer class="mt-auto border-t border-white/10 bg-[#090909] py-8">
    <div class="archive-shell flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="text-xs font-bold uppercase tracking-[0.16em] text-surface-500">
        &copy; {{ $nFa(new Date().getFullYear()) }} {{ t('footer.copyright') }}
      </div>

      <div class="flex items-center gap-4">
        <a href="https://x.com/Iran_Archive" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
          <Button icon="pi pi-twitter" severity="secondary" text />
        </a>
      </div>
    </div>
  </footer>
</template>
