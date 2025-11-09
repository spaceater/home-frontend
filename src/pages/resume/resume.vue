<template>
  <div class="resume-wrapper">
    <iframe
      :src="buildStaticUrl('/home/resume/main.html')"
      class="resume-frame"
      ref="resumeFrame"></iframe>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { buildStaticUrl } from '@/config/static'

const resumeFrame = ref<HTMLIFrameElement | null>(null)

function handleLoad() {
  try {
    const frameTitle = resumeFrame.value?.contentDocument?.title
    if (frameTitle) {
      document.title = frameTitle
    }
  } catch (error) {
    document.title = '简历'
  }
}

onMounted(() => {
  resumeFrame.value?.addEventListener('load', handleLoad)
})

onBeforeUnmount(() => {
  resumeFrame.value?.removeEventListener('load', handleLoad)
})
</script>

<style scoped>
.resume-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-width: calc(210mm + 4rem);
  min-height: calc(297mm + 6rem);
  background: rgb(220, 220, 220);
}

.resume-frame {
  width: 210mm;
  height: 297mm;
  min-width: 210mm;
  min-height: 297mm;
  border: none;
  background: white;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.25);
}

</style>
