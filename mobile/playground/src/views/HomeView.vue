<script setup lang="ts">
import { useCounterStore } from '@lego/shared'
</script>

<template>
  <div class="home">
    <h1>Lego Mobile Playground</h1>
    <p>使用 @lego/shared: count = {{ useCounterStore().count }}</p>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
}
</style>
