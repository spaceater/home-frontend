<template>
  <div style="position: relative; width: 100%; height: 100%; min-height: 50rem;">
    <div style="position: absolute; left: 50%; transform: translateX(-50%); top: 1rem; width: 14rem; height: 7rem; background-color: rgb(200, 200, 200);">
      <label
        for="sigma-slider"
        style="position: absolute; left: 1rem; top: 0.8rem;"
      >{{ sigmaLabel }}</label>
      <input
        id="sigma-slider"
        type="range"
        min="0"
        max="1"
        step="1"
        v-model.number="sigmaSlider"
        style="position: absolute; left: 3.6rem; top: 1rem; width: 5rem;"
      />
      <label for="n-slider"
        style="position: absolute; left: 1rem; top: 2.8rem;"
      >{{ nLabel }}</label>
      <input
        id="n-slider"
        type="range"
        min="5"
        max="20"
        step="1"
        v-model.number="nSlider"
        style="position: absolute; left: 3.6rem; top: 3rem; width: 10rem;"
      />
      <label for="alpha-slider"
        style="position: absolute; left: 1rem; top: 4.8rem;"
      >{{ alphaLabel }}</label>
      <input id="alpha-slider"
        type="range"
        min="0"
        max="4"
        step="1"
        v-model.number="alphaSlider"
        style="position: absolute; left: 3.6rem; top: 5rem; width: 10rem;"
      />
      <button type="button"
        @click="startSimulation"
        style="position: absolute; left: 9.6rem; top: 1rem; width: 3rem;"
      >Start</button>
    </div>
    <div style="position: absolute; left: 50%; transform: translateX(-50%); top: 12rem; height: 40rem; width: 50rem; background-color: rgb(230, 230, 230);">
      <div style="position: absolute; left: -0.75rem; top: -0.75rem;">2</div>
      <div style="position: absolute; left: -0.75rem; top: 9.2rem;">1</div>
      <div style="position: absolute; left: -0.75rem; top: 19.2rem;">0</div>
      <div style="position: absolute; left: -1.1rem; top: 29.2rem;">-1</div>
      <div style="position: absolute; left: -1.2rem; top: 39.15rem;">-2</div>
      <div style="z-index: 1; position: absolute; left: 0; top: -1px; height: 2px; width: 50rem; background-color: black;"></div>
      <div style="z-index: 1; position: absolute; left: 0; top: calc(10rem - 1px); height: 2px; width: 50rem; background-color: black;"></div>
      <div style="z-index: 1; position: absolute; left: 0; top: calc(20rem - 1px); height: 2px; width: 50rem; background-color: black;"></div>
      <div style="z-index: 1; position: absolute; left: 0; top: calc(30rem - 1px); height: 2px; width: 50rem; background-color: black;"></div>
      <div style="z-index: 1; position: absolute; left: 0; top: calc(40rem - 1px); height: 2px; width: 50rem; background-color: black;"></div>
      <p style="z-index: 1; position: absolute; left: 0; top: -3rem;">
        {{ explanation }}
      </p>
      <div
        v-for="(result, index) in results"
        :key="index"
        :id="`result_${index}`"
        :style="{
          position: 'absolute',
          left: `${result.left}rem`,
          top: result.top,
          width: '0.5rem',
          height: result.height,
          backgroundColor: result.color,
        }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const normalDistributionList = [0.675, 0.84, 1.04, 1.28, 1.645] as const
const tDistributionTable = [
  [0.740697, 0.940965, 1.189567, 1.533206, 2.131847],
  [0.726686, 0.919544, 1.155767, 1.475884, 2.015048],
  [0.717558, 0.905703, 1.134157, 1.439756, 1.94318],
  [0.711141, 0.89603, 1.119159, 1.414924, 1.894579],
  [0.706386, 0.88889, 1.108145, 1.396815, 1.859548],
  [0.702722, 0.883404, 1.099716, 1.383029, 1.833113],
  [0.699812, 0.879058, 1.093058, 1.372184, 1.812461],
  [0.697445, 0.87553, 1.087666, 1.36343, 1.795885],
  [0.695482, 0.872609, 1.083211, 1.356217, 1.782288],
  [0.693829, 0.870152, 1.076469, 1.350171, 1.770933],
  [0.69241, 0.868055, 1.07628, 1.34503, 1.76131],
  [0.691196, 0.866245, 1.073531, 1.340606, 1.75305],
  [0.690132, 0.864667, 1.071137, 1.336757, 1.745884],
  [0.689195, 0.863279, 1.069033, 1.333379, 1.739607],
  [0.688363, 0.862049, 1.06717, 1.330391, 1.734064],
  [0.68762, 0.860951, 1.065507, 1.327728, 1.729133],
]

interface ResultState {
  left: number
  height: string
  top: string
  color: string
}

const simulationTimes = 100

const sigmaSlider = ref(1)
const nSlider = ref(10)
const alphaSlider = ref(3)

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const createDefaultResult = (index: number): ResultState => ({
  left: index * 0.5,
  height: '10rem',
  top: '15rem',
  color: 'rgb(200, 200, 200)',
})

const results = ref<ResultState[]>(
  Array.from({ length: simulationTimes }, (_, index) => createDefaultResult(index))
)

const explanation = ref('')

const alphaOptions = [0.5, 0.6, 0.7, 0.8, 0.9] as const

const pickValue = (list: ReadonlyArray<number>, index: number): number => {
  const maxIndex = list.length - 1
  if (maxIndex < 0) {
    return 0
  }
  const safeIndex = Math.trunc(clamp(index, 0, maxIndex))
  const value = list[safeIndex]
  if (value !== undefined) {
    return value
  }
  const fallback = list[maxIndex]
  if (fallback !== undefined) {
    return fallback
  }
  return 0
}

const sigmaLabel = computed(() => `σ${sigmaSlider.value === 0 ? '未知' : ' 1'}`)
const nLabel = computed(() => `n ${clamp(nSlider.value, 5, 20)}`)
const alphaLabel = computed(() => `α ${pickValue(alphaOptions, alphaSlider.value)}`)

const previousRootFontSize = ref('')

onMounted(() => {
  previousRootFontSize.value = document.documentElement.style.fontSize
  document.documentElement.style.fontSize = `${Math.max(screen.width, screen.height) / 96}px`
})

onBeforeUnmount(() => {
  document.documentElement.style.fontSize = previousRootFontSize.value
})

function generateNormalRandom() {
  return Math.cos(2 * Math.PI * Math.random()) * Math.sqrt(-2 * Math.log(1 - Math.random()))
}

function startSimulation() {
  let failure = 0
  const sigmaKnown = sigmaSlider.value === 1
  const n = clamp(nSlider.value, 5, 20)
  const alphaIndex = clamp(alphaSlider.value, 0, alphaOptions.length - 1)

  const tableRow = tDistributionTable[n - 5]
  const alphaValue = sigmaKnown
    ? pickValue(normalDistributionList, alphaIndex)
    : pickValue(tableRow ?? normalDistributionList, alphaIndex)

  for (let i = 0; i < simulationTimes; i += 1) {
    const normalRandomNumbers: number[] = []
    let xAverage = 0
    for (let j = 0; j < n; j += 1) {
      const value = generateNormalRandom()
      normalRandomNumbers.push(value)
      xAverage += value
    }
    xAverage /= n
    let s = 0
    if (sigmaKnown) {
      s = 1
    } else {
      for (const value of normalRandomNumbers) {
        s += Math.pow(value - xAverage, 2)
      }
      s /= n - 1
      s = Math.sqrt(s)
    }

    const r = (s * alphaValue) / Math.sqrt(n)
    const rangeBottom = xAverage - r
    const rangeTop = xAverage + r
    const isFailure = rangeBottom > 0 || rangeTop < 0
    if (isFailure) {
      failure += 1
    }
    const current = results.value[i] ?? createDefaultResult(i)
    results.value[i] = {
      ...current,
      height: `${(rangeTop - rangeBottom) * 10}rem`,
      top: `${(2 - rangeTop) * 10}rem`,
      color: isFailure ? 'rgb(200, 30, 30)' : 'rgb(30, 200, 30)',
    }
  }
  const successRate = (simulationTimes - failure) / simulationTimes
  if (sigmaKnown) {
    explanation.value = `方差已知情况下，对均值0做区间估计，实验次数100次，每次实验的结果如下图所示，其中红色的区间不包含真值，其频率为${successRate}.可以观察到区间的长度与样本取值无关.`
  } else {
    explanation.value = `方差未知情况下，对均值0做区间估计，实验次数100次，每次实验的结果如下图所示，其中红色的区间不包含真值，其频率为${successRate}.可以观察到区间的长度与样本取值有关，每次实验得到的区间长度是变化的.`
  }
}
</script>
