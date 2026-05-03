<template>
  <svg :width="size" :height="size" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-svg">
    <defs>
      <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366f1"/>
        <stop offset="50%" stop-color="#4f46e5"/>
        <stop offset="100%" stop-color="#06b6d4"/>
      </linearGradient>
    </defs>
    <!-- Rounded square background -->
    <rect x="2" y="2" width="44" height="44" rx="12" :fill="`url(#${gradientId})`"/>
    <!-- "C" letter stylized -->
    <path d="M30 14.5C28.2 13.5 26.2 13 24 13C18.5 13 14 17.5 14 23C14 28.5 18.5 33 24 33C26.2 33 28.2 32.5 30 31.5" 
      stroke="white" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <!-- Data dots accent -->
    <circle cx="33" cy="17" r="2" fill="rgba(255,255,255,0.8)"/>
    <circle cx="36" cy="23" r="1.5" fill="rgba(255,255,255,0.5)"/>
    <circle cx="33" cy="29" r="2" fill="rgba(255,255,255,0.8)"/>
    <!-- Connecting lines -->
    <line x1="30" y1="14.5" x2="33" y2="17" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    <line x1="30" y1="31.5" x2="33" y2="29" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
  </svg>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: { type: [Number, String], default: 36 }
});

// Unique gradient ID to avoid conflicts when multiple logos render
const gradientId = computed(() => `logo-grad-${Math.random().toString(36).substr(2, 5)}`);
</script>

<style scoped>
.logo-svg {
  flex-shrink: 0;
  display: block;
}
</style>
