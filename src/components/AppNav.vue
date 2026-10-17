<script setup>
import { useTheme } from '../composables/useTheme.js'
import AccountMenu from './AccountMenu.vue'
import { usePlan } from '../composables/usePlan.js'

const { theme, toggleLight, toggleHabs } = useTheme()
const { plan } = usePlan()

const links = [
  { to: { name: 'catalogue' }, label: 'Exercices', icon: 'M4 6h16M4 12h16M4 18h10' },
  { to: { name: 'favoris' }, label: 'Favoris', icon: 'M12 20.5s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 7.5 2.8c0 5.5-7.5 10.1-7.5 10.1Z' },
  { to: { name: 'plan' }, label: 'Plan', icon: 'M9 5h10M9 12h10M9 19h10M5 5h.01M5 12h.01M5 19h.01' },
  { to: { name: 'plans' }, label: 'Mes plans', icon: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z' },
]

</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-30 border-t border-navy/10 bg-white/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b dark:border-ice/10 dark:bg-navy/80 print:hidden">
    <div class="mx-auto flex max-w-7xl items-center px-4 sm:px-6">
      <RouterLink :to="{ name: 'catalogue' }" class="mr-8 hidden items-center gap-1.5 py-4 text-xl font-bold tracking-tight md:flex">
        <span class="text-navy dark:text-white">Drill</span><span class="text-royal dark:text-periwinkle">Hub</span>
      </RouterLink>
      <div class="flex min-w-0 flex-1 justify-around md:flex-none md:gap-1">
        <RouterLink
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          exact-active-class="!text-royal dark:!text-periwinkle md:bg-royal/10 dark:md:bg-periwinkle/15"
          class="relative flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2.5 whitespace-nowrap sm:px-3 md:px-4 text-[11px] sm:text-xs font-medium text-navy/60 transition-colors duration-200 hover:text-navy md:flex-row md:gap-2 md:text-sm dark:text-ice/60 dark:hover:text-ice"
        >
          <svg class="size-6 md:size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="link.icon" /></svg>
          {{ link.label }}
          <span v-if="link.label === 'Plan' && plan.items.length" class="absolute top-1 right-2 grid min-w-5 place-items-center rounded-full bg-royal px-1 text-[10px] font-semibold text-white md:static">{{ plan.items.length }}</span>
        </RouterLink>
      </div>
      <div class="flex shrink-0 items-center md:ml-auto">
        <button
          type="button"
          class="grid size-9 place-items-center rounded-xl transition-colors sm:size-10 duration-200 hover:bg-navy/5 hover:text-navy dark:hover:bg-ice/10 dark:hover:text-ice text-navy/60 dark:text-ice/60"
          :aria-label="theme === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair'"
          :title="theme === 'light' ? 'Mode sombre' : 'Mode clair'"
          @click="toggleLight"
        >
          <svg v-if="theme === 'light'" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
          <svg v-else class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
        </button>
        <button
          type="button"
          class="grid size-9 place-items-center rounded-xl transition-colors sm:size-10 duration-200 hover:bg-navy/5 hover:text-navy dark:hover:bg-ice/10 dark:hover:text-ice"
          :class="theme === 'habs' ? '' : 'hover:[&>svg]:opacity-100 hover:[&>svg]:grayscale-0'"
          :aria-pressed="theme === 'habs'"
          aria-label="Thème Canadiens"
          title="Thème Canadiens"
          @click="toggleHabs"
        >
          <svg class="h-5 w-auto transition duration-200" :class="theme === 'habs' ? '' : 'opacity-60 grayscale'" viewBox="0 0 437.31 298.85" aria-hidden="true">
            <path class="fill-white" d="M388.08458,147.40244l31.24035-32.82437-17.77621-81.753L322.6998,9.32884l-7.12808,6.60007C289.17141,8.09683,241.65086-.08729,209.97048.0007,92.57708.17674.352,65.4735,0,148.63447,0,219.7393,61.33671,298.85221,211.02647,298.85221c118.6254,0,225.28264-79.02491,225.28264-79.02491Z" />
            <path class="fill-habs-blue" d="M377.61248,146.43442,410.43683,112.026,394.59666,39.24918,324.81185,18.48093,317.68377,25.169C294.09949,17.42492,243.76289,8.09683,210.0585,8.09683,95.48113,8.36082,8.44811,71.19355,8.0961,148.63445c-.352,81.313,78.497,142.03366,202.93041,142.03366,87.121,0,176.354-46.46453,214.01852-72.95284Z" />
            <path class="fill-white" d="M166.234,99.08989V199.58705c-16.54422,0-69.16882-19.36022-69.16882-49.89657C97.06518,112.026,150.92179,101.55391,166.234,99.08989Zm68.02478,62.83273v39.51247a237.58494,237.58494,0,0,1-39.60046.792V161.92262Zm-39.60046-25.9603V96.80184a257.97238,257.97238,0,0,1,39.60046,1.232v37.92845Zm170.722,18.0402S316.01175,187.79493,261.45109,197.915V102.16991c59.22471,7.4801,94.24912,46.11255,94.24912,46.11255L395.12469,107.538,382.45252,50.4253,328.5959,34.67313l-6.86409,7.3921C299.90755,33.52912,254.763,22.441,204.77845,22.441c-100.0572,0-181.89813,56.76065-181.98615,126.72149-.176,68.2008,69.25682,127.16148,181.28212,127.16148,103.40122,0,178.1141-49.28058,201.52237-62.48074Z" />
            <path class="fill-white" d="M204.86645,174.06674h19.00823v16.10418H204.86645Zm.44-49.54458h18.48021V109.122l-18.48021-.704Zm134.3776,28.07233a150.748,150.748,0,0,0-63.62475-33.26438V179.6988C296.65153,173.97874,319.17979,164.29862,339.68405,152.59449ZM151.71383,181.98683V116.60208c-18.83222,5.45606-40.04047,16.19218-40.04047,33.08838C111.67336,161.3066,129.53757,175.29875,151.71383,181.98683Z" />
            <path class="fill-habs-red" d="M362.56433,168.25866c-64.68077,37.92845-107.80127,45.32055-160.24988,44.79254-73.83288-.616-115.89737-30.18436-115.89737-65.38477,0-31.68038,38.54445-61.95274,117.39337-61.95274,52.97662,0,116.86537,14.25617,151.00977,47.87257l28.42432-28.95233-9.68008-45.93655L331.676,46.46524l-7.65609,8.53611c-22.96826-9.15209-61.77672-21.91226-121.44142-21.91226-90.11306,0-169.138,52.09662-169.138,115.01735,0,65.82478,68.81681,117.39337,166.41,117.39337,99.08916,0,157.16983-37.31244,190.69823-54.91265Z" />
          </svg>
        </button>
        <AccountMenu />
      </div>
    </div>
  </nav>
</template>
