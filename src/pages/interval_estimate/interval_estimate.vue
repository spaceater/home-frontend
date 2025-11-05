<template>
  <iframe
    :src="htmlUrl"
    style="border:none; width:100%; height:100%;display: block;"></iframe>
</template>

<script setup lang="ts">
import { buildStaticUrl } from '@/config/static'
const htmlUrl = buildStaticUrl("/home/interval-estimate.html")
</script>
