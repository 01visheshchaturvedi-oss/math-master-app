// App logic migrated from project1.txt (Firebase removed in a later step)

import { appendHistory, loadHistory } from './storage.js'

// Global State Configuration
window.state = {
  view: 'home',
  mode: null,
  minRange: 100,
  maxRange: 999,
  numsPerQuestion: 2,
  totalQuestions: 5,
  selectedTables: Array.from({ length: 29 }, (_, i) => i + 2),
  tableSelectionMode: 'combinations',
  currentQuestionIndex: 0,
  questions: [],
  results: [],
  startTime: null,
  timerInterval: null,
  totalElapsed: 0,
  isPaused: false,
  grid: {
    rows: [],
    cols: [],
    userAnswers: {},
    currentStep: 0,
    cellStartTime: null,
    isError: false,
  },
}

window.historyData = loadHistory()

// Helper functions
window.setState = function setState(newState) {
  window.state = { ...window.state, ...newState }
  window.render()
}

function getRandomUnique(min, max, existing) {
  let num
  let attempts = 0
  do {
    num = Math.floor(Math.random() * (max - min + 1)) + min
    attempts++
    if (attempts > 500) break
  } while (existing.includes(num) || num % 10 === 0)
  return num
}

window.saveResult = async function saveResult(mode, totalTime, meta = {}) {
  const entry = {
    mode,
    totalTime,
    timestamp: Date.now(),
    ...meta,
  }
  window.historyData = appendHistory(entry)
  window.render()
}

window.render = function render() {
  const container = document.getElementById('app')
  if (!container) return

  switch (window.state.view) {
    case 'home':
      renderHome(container)
      break
    case 'config':
      renderConfig(container)
      break
    case 'test':
      renderTest(container)
      break
    case 'grid-test':
      renderGridTest(container)
      break
    case 'result':
      renderResult(container)
      break
    case 'grid-analysis':
      renderAnalysis(container)
      break
    case 'performance-history':
      renderPerformanceHistory(container)
      break
    default:
      renderHome(container)
  }
}

function renderHome(container) {
  const gridHistory = window.historyData.filter((h) => h.mode === 'grid')
  container.innerHTML = `
      <div class="p-8 text-center fade-in">
          <div class="flex flex-col items-center mb-10">
              <div class="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
              </div>
              <h1 class="text-3xl font-black text-slate-800">Math Master</h1>
              <p class="text-slate-400 font-medium">Speed and Accuracy Trainer</p>
          </div>

          <div class="grid grid-cols-1 gap-3">
              <button onclick="selectMode('addition')" class="flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all">
                  <span class="text-lg font-bold text-slate-700">Addition Practice</span>
                  <span class="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm font-black">+</span>
              </button>
              <button onclick="selectMode('subtraction')" class="flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all">
                  <span class="text-lg font-bold text-slate-700">Subtraction Practice</span>
                  <span class="bg-rose-100 text-rose-600 px-3 py-1 rounded-lg text-sm font-black">-</span>
              </button>
              <button onclick="selectMode('tables')" class="flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all">
                  <span class="text-lg font-bold text-slate-700">Tables Practice</span>
                  <span class="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg text-sm font-black">×</span>
              </button>
              <button onclick="selectMode('division')" class="flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all">
                  <span class="text-lg font-bold text-slate-700">Division Practice</span>
                  <span class="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-lg text-sm font-black">÷</span>
              </button>
              <button onclick="selectMode('complex')" class="flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all">
                  <span class="text-lg font-bold text-slate-700">Complex Analysis</span>
                  <span class="bg-purple-100 text-purple-600 px-3 py-1 rounded-lg text-sm font-black">∑</span>
              </button>
              <button onclick="selectMode('grid')" class="flex items-center justify-between p-5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all group shadow-lg">
                  <div class="text-left">
                      <span class="text-lg font-bold block">Grid Addition Practice</span>
                      ${
                        gridHistory.length > 0
                          ? `<span class="text-[10px] text-rose-400 font-bold uppercase tracking-tighter">Best: ${Math.min(
                              ...gridHistory.map((h) => h.totalTime),
                            ).toFixed(2)}s</span>`
                          : ''
                      }
                  </div>
                  <span class="text-rose-400 text-xl">▦</span>
              </button>

              <button onclick="setState({view: 'performance-history'})" class="mt-4 flex items-center justify-center gap-2 p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all font-bold">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                  View Performance History
              </button>
          </div>
      </div>
  `
}

window.selectMode = function selectMode(mode) {
  let settings = { mode, view: 'config', isPaused: false, totalElapsed: 0 }
  if (mode === 'grid') {
    settings.minRange = 1
    settings.maxRange = 100
  } else if (mode === 'division') {
    settings.dividendMin = 100
    settings.dividendMax = 999
    settings.divisorMin = 2
    settings.divisorMax = 20
  } else if (mode === 'addition' || mode === 'subtraction') {
    settings.minRange = 100
    settings.maxRange = 999
  }
  window.setState(settings)
}

function renderConfig(container) {
  const title = window.state.mode.charAt(0).toUpperCase() + window.state.mode.slice(1)
  let configHtml = `
      <div class="p-8 fade-in h-[90vh] flex flex-col">
          <button onclick="setState({view: 'home'})" class="flex items-center text-slate-400 mb-6 font-bold hover:text-slate-600">
              ← Back
          </button>
          <h2 class="text-2xl font-black text-slate-800 mb-8">${title} Settings</h2>
          <div class="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
  `

  if (window.state.mode === 'addition' || window.state.mode === 'subtraction') {
    configHtml += `
          <div>
              <label class="block text-sm font-bold text-slate-500 mb-2">Number Range</label>
              <div class="flex items-center gap-3">
                  <input type="number" id="minRange" value="${window.state.minRange}" class="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-center font-bold focus:border-blue-500 outline-none">
                  <span class="text-slate-300 font-bold">to</span>
                  <input type="number" id="maxRange" value="${window.state.maxRange}" class="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-center font-bold focus:border-blue-500 outline-none">
              </div>
          </div>
          <div>
              <label class="block text-sm font-bold text-slate-500 mb-2">Numbers per Question</label>
              <input type="number" id="numsPerQuestion" value="${window.state.numsPerQuestion}" class="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-center font-bold focus:border-blue-500 outline-none">
          </div>
          <div>
              <label class="block text-sm font-bold text-slate-500 mb-2">Number of Questions</label>
              <input type="number" id="totalQuestions" value="${window.state.totalQuestions}" class="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-center font-bold focus:border-blue-500 outline-none">
          </div>
      `
  } else if (window.state.mode === 'division') {
    configHtml += `
          <div class="bg-emerald-50 text-emerald-700 p-3 rounded-xl flex items-center gap-2 text-[10px] font-bold border border-emerald-100 mb-4">
              🛡️ NUMBERS ENDING IN 0 ARE AUTOMATICALLY EXCLUDED.
          </div>
          <div>
              <label class="block text-sm font-bold text-slate-500 mb-2">Dividend Range</label>
              <div class="flex items-center gap-3">
                  <input type="number" id="divMin" value="${window.state.dividendMin}" class="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-center font-bold focus:border-blue-500 outline-none">
                  <span class="text-slate-300 font-bold">to</span>
                  <input type="number" id="divMax" value="${window.state.dividendMax}" class="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-center font-bold focus:border-blue-500 outline-none">
              </div>
          </div>
          <div>
              <label class="block text-sm font-bold text-slate-500 mb-2">Divisor Range</label>
              <div class="flex items-center gap-3">
                  <input type="number" id="dorMin" value="${window.state.divisorMin}" class="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-center font-bold focus:border-blue-500 outline-none">
                  <span class="text-slate-300 font-bold">to</span>
                  <input type="number" id="dorMax" value="${window.state.divisorMax}" class="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-center font-bold focus:border-blue-500 outline-none">
              </div>
          </div>
          <div>
              <label class="block text-sm font-bold text-slate-500 mb-2">Number of Questions</label>
              <input type="number" id="totalQuestions" value="${window.state.totalQuestions}" class="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-center font-bold focus:border-blue-500 outline-none">
          </div>
      `
  } else if (window.state.mode === 'tables') {
    configHtml += `
          <div>
              <label class="block text-sm font-bold text-slate-500 mb-4">Select Tables to Practice</label>
              <div class="grid grid-cols-6 gap-2 mb-6 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                  ${Array.from({ length: 36 }, (_, i) => i + 2)
                    .map(
                      (n) => `
                      <button onclick="toggleTable(${n})" class="table-btn ${
                        window.state.selectedTables.includes(n) ? 'active' : ''
                      }">${n}</button>
                  `,
                    )
                    .join('')}
              </div>
          </div>
          <div>
              <label class="block text-sm font-bold text-slate-500 mb-2">Question Selection</label>
              <div class="grid grid-cols-2 gap-2">
                  <button onclick="setState({tableSelectionMode: 'count'})" class="p-3 border rounded-xl font-bold ${
                    window.state.tableSelectionMode === 'count'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-50'
                  }">Specific Count</button>
                  <button onclick="setState({tableSelectionMode: 'combinations'})" class="p-3 border rounded-xl font-bold ${
                    window.state.tableSelectionMode === 'combinations'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-50'
                  }">All Combinations (2-9)</button>
              </div>
          </div>
          ${
            window.state.tableSelectionMode === 'count'
              ? `<div><label class="block text-sm font-bold text-slate-500 mb-2">Number of Questions</label><input type="number" id="totalQuestions" value="${window.state.totalQuestions}" class="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-center font-bold outline-none"></div>`
              : ''
          }
      `
  } else if (window.state.mode === 'complex') {
    configHtml += `
          <div>
              <label class="block text-sm font-bold text-slate-500 mb-2">Number of Questions</label>
              <input type="number" id="totalQuestions" value="${window.state.totalQuestions}" class="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-center font-bold outline-none">
          </div>
      `
  } else if (window.state.mode === 'grid') {
    configHtml += `
          <div>
              <label class="block text-sm font-bold text-slate-500 mb-2">Number Range</label>
              <div class="flex items-center gap-3">
                  <input type="number" id="minRange" value="${window.state.minRange}" class="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-center font-bold focus:border-blue-500 outline-none">
                  <span class="text-slate-300 font-bold">to</span>
                  <input type="number" id="maxRange" value="${window.state.maxRange}" class="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-center font-bold focus:border-blue-500 outline-none">
              </div>
          </div>
      `
  }

  configHtml += `
          </div>
          <button onclick="startTest()" class="w-full py-4 bg-blue-600 text-white font-black text-lg rounded-2xl mt-6 shadow-lg shadow-blue-100 active:scale-95 transition-transform">
              Start Practice
          </button>
      </div>
  `
  container.innerHTML = configHtml
}

window.toggleTable = function toggleTable(n) {
  let tables = [...window.state.selectedTables]
  if (tables.includes(n)) tables = tables.filter((t) => t !== n)
  else tables.push(n)
  window.setState({ selectedTables: tables })
}

window.startTest = function startTest() {
  const inputs = {
    min: parseInt(document.getElementById('minRange')?.value || window.state.minRange, 10),
    max: parseInt(document.getElementById('maxRange')?.value || window.state.maxRange, 10),
    count: parseInt(
      document.getElementById('totalQuestions')?.value || window.state.totalQuestions,
      10,
    ),
    numsPerQ: parseInt(
      document.getElementById('numsPerQuestion')?.value || window.state.numsPerQuestion,
      10,
    ),
    divMin: parseInt(document.getElementById('divMin')?.value || window.state.dividendMin, 10),
    divMax: parseInt(document.getElementById('divMax')?.value || window.state.dividendMax, 10),
    dorMin: parseInt(document.getElementById('dorMin')?.value || window.state.divisorMin, 10),
    dorMax: parseInt(document.getElementById('dorMax')?.value || window.state.divisorMax, 10),
  }

  let questions = []

  if (window.state.mode === 'grid') {
    const existing = []
    const rows = []
    const cols = []
    for (let i = 0; i < 5; i++) {
      const r = getRandomUnique(inputs.min, inputs.max, existing)
      rows.push(r)
      existing.push(r)
      const c = getRandomUnique(inputs.min, inputs.max, existing)
      cols.push(c)
      existing.push(c)
    }
    window.setState({
      view: 'grid-test',
      grid: { rows, cols, userAnswers: {}, currentStep: 0, cellStartTime: Date.now(), isError: false },
      startTime: Date.now(),
      totalElapsed: 0,
      isPaused: false,
      minRange: inputs.min,
      maxRange: inputs.max,
    })
    window.startTimer()
    return
  }

  if (window.state.mode === 'tables') {
    if (window.state.tableSelectionMode === 'combinations') {
      window.state.selectedTables.forEach((t) => {
        for (let i = 2; i <= 9; i++) {
          questions.push({ q: t * i, a: `${t}*${i}`, type: 'reverse-table' })
        }
      })
    } else {
      for (let i = 0; i < inputs.count; i++) {
        const t = window.state.selectedTables[Math.floor(Math.random() * window.state.selectedTables.length)]
        const factor = Math.floor(Math.random() * 8) + 2
        questions.push({ q: t * factor, a: `${t}*${factor}`, type: 'reverse-table' })
      }
    }
    questions = questions.sort(() => Math.random() - 0.5)
  } else if (window.state.mode === 'addition' || window.state.mode === 'subtraction') {
    for (let i = 0; i < inputs.count; i++) {
      const nums = Array.from({ length: inputs.numsPerQ }, () => getRandomUnique(inputs.min, inputs.max, []))
      let answer
      let displayQ
      if (window.state.mode === 'addition') {
        answer = nums.reduce((a, b) => a + b, 0)
        displayQ = nums.join(' + ')
      } else {
        nums.sort((a, b) => b - a)
        answer = nums[0]
        for (let j = 1; j < nums.length; j++) answer -= nums[j]
        displayQ = nums.join(' - ')
      }
      questions.push({ q: displayQ, a: answer })
    }
  } else if (window.state.mode === 'division') {
    for (let i = 0; i < inputs.count; i++) {
      const divisor = Math.floor(Math.random() * (inputs.dorMax - inputs.dorMin + 1)) + inputs.dorMin
      const quotient = Math.floor(Math.random() * (inputs.divMax / divisor))
      const dividend = divisor * quotient
      questions.push({ q: `${dividend} ÷ ${divisor}`, a: quotient })
    }
  } else if (window.state.mode === 'complex') {
    for (let i = 0; i < inputs.count; i++) {
      const x = Math.floor(Math.random() * 90) + 10
      const y = Math.floor(Math.random() * 90) + 10
      const a = Math.floor(Math.random() * 90) + 10
      const b = Math.floor(Math.random() * 90) + 10
      const sum = x + y
      const avg = (a + b) / 2
      questions.push({ q: `Sum(${x}, ${y}) - Avg(${a}, ${b})`, a: Math.abs(sum - avg) })
    }
  }

  window.setState({
    view: 'test',
    questions,
    currentQuestionIndex: 0,
    startTime: Date.now(),
    totalElapsed: 0,
    isPaused: false,
    results: [],
    totalQuestions: questions.length,
  })
  window.startTimer()
}

window.startTimer = function startTimer() {
  if (window.state.timerInterval) clearInterval(window.state.timerInterval)
  window.state.timerInterval = setInterval(() => {
    if (window.state.isPaused) return
    const now = Date.now()
    const display = document.getElementById('timerDisplay')
    if (display) {
      const sec = ((window.state.totalElapsed + (now - window.state.startTime)) / 1000).toFixed(2)
      display.innerText = sec
    }
  }, 50)
}

window.togglePause = function togglePause() {
  if (window.state.isPaused) {
    window.setState({ isPaused: false, startTime: Date.now() })
    window.startTimer()
  } else {
    const now = Date.now()
    clearInterval(window.state.timerInterval)
    window.setState({ isPaused: true, totalElapsed: window.state.totalElapsed + (now - window.state.startTime) })
  }
}

function renderTest(container) {
  if (window.state.isPaused) {
    container.innerHTML = `<div class="p-8 text-center h-[70vh] flex flex-col items-center justify-center"><h2 class="text-4xl font-black mb-8">Paused</h2><button onclick="togglePause()" class="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg">Resume</button></div>`
    return
  }

  const q = window.state.questions[window.state.currentQuestionIndex]
  container.innerHTML = `
      <div class="p-8 fade-in text-center h-[70vh] flex flex-col justify-between">
          <div class="flex justify-between items-center mb-8">
              <div class="px-4 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500">Q ${window.state.currentQuestionIndex + 1}/${window.state.questions.length}</div>
              <div class="flex items-center gap-4">
                  <button onclick="togglePause()" class="p-2 bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></button>
                  <div class="px-4 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-black font-mono border border-amber-100" id="timerDisplay">0.00</div>
              </div>
          </div>
          <div>
              <h2 class="text-4xl font-black text-slate-800 mb-8">${q.q}</h2>
              <input type="text" id="answerInput" class="w-full bg-slate-50 border-2 border-slate-100 text-3xl font-black text-center p-6 rounded-3xl focus:border-blue-500 outline-none" onkeypress="if(event.key === 'Enter') handleAnswer()">
          </div>
          <div class="text-slate-300 text-xs font-bold">Press Enter to Submit</div>
      </div>
  `
  setTimeout(() => document.getElementById('answerInput')?.focus(), 100)
}

window.handleAnswer = async function handleAnswer() {
  const input = document.getElementById('answerInput')
  const val = input.value.trim().replace(/\s/g, '')
  const q = window.state.questions[window.state.currentQuestionIndex]

  let isCorrect = false
  if (q.type === 'reverse-table') isCorrect = val === q.a
  else isCorrect = parseFloat(val) === q.a

  if (!isCorrect) {
    input.classList.add('border-rose-500', 'bg-rose-50')
    setTimeout(() => input.classList.remove('border-rose-500', 'bg-rose-50'), 500)
    return
  }

  const results = [...window.state.results, { q: q.q, a: val, time: Date.now() - window.state.startTime }]

  if (window.state.currentQuestionIndex + 1 < window.state.questions.length) {
    window.setState({ currentQuestionIndex: window.state.currentQuestionIndex + 1, results })
  } else {
    clearInterval(window.state.timerInterval)
    const finalTime = (window.state.totalElapsed + (Date.now() - window.state.startTime)) / 1000
    await window.saveResult(window.state.mode, finalTime, { questions: window.state.questions.length })
    window.setState({ view: 'result', finalTime, results })
  }
}

function renderGridTest(container) {
  if (window.state.isPaused) {
    container.innerHTML = `<div class="p-8 text-center h-[70vh] flex flex-col items-center justify-center"><h2 class="text-4xl font-black mb-8">Paused</h2><button onclick="togglePause()" class="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg">Resume</button></div>`
    return
  }

  const { rows, cols, userAnswers, currentStep, isError } = window.state.grid
  let expected = 0
  let prompt = ''
  if (currentStep < 25) {
    const r = Math.floor(currentStep / 5)
    const c = currentStep % 5
    prompt = `${rows[r]} + ${cols[c]}`
    expected = rows[r] + cols[c]
  } else if (currentStep < 30) {
    const r = currentStep - 25
    prompt = `Row ${r + 1} Total`
    for (let c = 0; c < 5; c++) expected += userAnswers[`r${r}c${c}`]?.val || 0
  } else if (currentStep < 35) {
    const c = currentStep - 30
    prompt = `Col ${c + 1} Total`
    for (let r = 0; r < 5; r++) expected += userAnswers[`r${r}c${c}`]?.val || 0
  } else {
    prompt = 'GRAND TOTAL'
    for (let r = 0; r < 5; r++) expected += userAnswers[`rowSum${r}`]?.val || 0
  }

  container.innerHTML = `<div class="p-4"><div class="flex justify-between items-center mb-4"><button onclick="togglePause()" class="p-2 bg-slate-100 rounded-xl"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></button><div id="timerDisplay" class="px-4 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-black border border-amber-100">0.00</div></div><div class="grid grid-cols-7 gap-1 mb-6 select-none overflow-x-auto"><div class="grid-cell bg-slate-100"></div>${cols
    .map((c) => `<div class="grid-cell grid-header">${c}</div>`)
    .join('')}<div class="grid-cell grid-total-label">TOTAL</div>${rows
    .map(
      (r, rIdx) =>
        `<div class="grid-cell grid-header">${r}</div>${Array.from({ length: 5 })
          .map((_, cIdx) => {
            const key = `r${rIdx}c${cIdx}`
            const active = currentStep === rIdx * 5 + cIdx
            const data = userAnswers[key]
            return `<div class="grid-cell ${active ? (isError ? 'grid-error' : 'grid-active') : data ? 'grid-filled' : 'bg-white'}">${data?.val || ''}</div>`
          })
          .join('')}<div class="grid-cell ${currentStep === 25 + rIdx ? (isError ? 'grid-error' : 'grid-active') : userAnswers['rowSum' + rIdx] ? 'bg-green-100' : 'bg-green-50'}">${userAnswers['rowSum' + rIdx]?.val || ''}</div>`,
    )
    .join('')}<div class="grid-total-label grid-cell">TOTAL</div>${Array.from({ length: 5 })
    .map((_, cIdx) => {
      const active = currentStep === 30 + cIdx
      return `<div class="grid-cell ${active ? (isError ? 'grid-error' : 'grid-active') : userAnswers['colSum' + cIdx] ? 'bg-green-100' : 'bg-green-50'}">${userAnswers['colSum' + cIdx]?.val || ''}</div>`
    })
    .join('')}<div class="grid-cell ${currentStep === 35 ? (isError ? 'grid-error' : 'grid-active') : userAnswers['grand'] ? 'bg-blue-100' : 'bg-blue-50'}">${userAnswers['grand']?.val || ''}</div></div><div class="bg-slate-900 rounded-3xl p-6 text-center text-white"><div class="text-3xl font-black mb-4">${prompt}</div><input type="number" id="gridInput" class="w-full bg-slate-800 border-2 ${isError ? 'border-red-500' : 'border-slate-700'} text-4xl font-black text-center p-3 rounded-2xl outline-none" onkeypress="if(event.key === 'Enter') handleGridSubmit(${expected})"></div></div>`

  setTimeout(() => document.getElementById('gridInput')?.focus(), 50)
  window.startTimer()
}

window.handleGridSubmit = async function handleGridSubmit(expected) {
  const input = document.getElementById('gridInput')
  const val = parseInt(input.value, 10)
  if (Number.isNaN(val)) return
  if (val !== expected) {
    window.setState({ grid: { ...window.state.grid, isError: true } })
    return
  }
  const { currentStep, userAnswers, cellStartTime } = window.state.grid
  const timeTaken = (Date.now() - (cellStartTime || Date.now())) / 1000
  const newAnswers = { ...userAnswers }
  const key =
    currentStep < 25
      ? `r${Math.floor(currentStep / 5)}c${currentStep % 5}`
      : currentStep < 30
        ? `rowSum${currentStep - 25}`
        : currentStep < 35
          ? `colSum${currentStep - 30}`
          : 'grand'
  newAnswers[key] = { val, time: timeTaken }
  if (currentStep < 35) {
    window.setState({
      grid: {
        ...window.state.grid,
        userAnswers: newAnswers,
        currentStep: currentStep + 1,
        cellStartTime: Date.now(),
        isError: false,
      },
    })
  } else {
    clearInterval(window.state.timerInterval)
    const finalTime = (window.state.totalElapsed + (Date.now() - window.state.startTime)) / 1000
    await window.saveResult('grid', finalTime, { range: `${window.state.minRange}-${window.state.maxRange}` })
    window.setState({
      view: 'result',
      finalTime,
      grid: { ...window.state.grid, userAnswers: newAnswers, isError: false },
    })
  }
}

function renderResult(container) {
  const mode = window.state.mode
  container.innerHTML = `
      <div class="p-8 text-center fade-in">
          <h2 class="text-3xl font-black text-slate-800 mb-2">Practice Done!</h2>
          <div class="text-6xl font-black text-blue-600 mb-8">${window.state.finalTime.toFixed(2)}s</div>
          <div class="grid grid-cols-2 gap-3">
              <button onclick="setState({view: 'home'})" class="py-5 bg-slate-200 text-slate-700 font-black text-xl rounded-2xl">Home</button>
              <button onclick="selectAnalysisMode('${mode}')" class="py-5 bg-blue-600 text-white font-black text-xl rounded-2xl">Analysis</button>
          </div>
      </div>
  `
}

function renderPerformanceHistory(container) {
  const grouped = window.historyData.reduce((acc, h) => {
    const mode = h.mode || 'unknown'
    if (!acc[mode]) acc[mode] = []
    acc[mode].push(h)
    return acc
  }, {})

  container.innerHTML = `
      <div class="p-6 fade-in flex flex-col h-[90vh]">
          <div class="flex items-center justify-between mb-8">
              <button onclick="setState({view: 'home'})" class="text-slate-400 font-bold">← Back</button>
              <h2 class="text-xl font-black text-slate-800">History</h2>
          </div>
          <div class="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              ${Object.keys(grouped).length === 0 ? '<div class="text-center py-20">No history yet</div>' : ''}
              ${Object.entries(grouped)
                .reverse()
                .map(
                  ([mode, items]) => `
                  <div class="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                      <div class="flex justify-between items-center mb-3"><span class="text-sm font-black text-blue-600 uppercase">${mode}</span><span class="text-[10px] font-bold text-slate-400">${items.length} sessions</span></div>
                      <div class="space-y-2">${items
                        .slice(-3)
                        .reverse()
                        .map(
                          (item) => `<div class="flex justify-between text-xs"><span class="text-slate-400">${new Date(item.timestamp).toLocaleDateString()}</span><span class="font-bold text-slate-700">${item.totalTime.toFixed(2)}s</span></div>`,
                        )
                        .join('')}</div>
                      <button onclick="selectAnalysisMode('${mode}')" class="w-full mt-4 py-2 bg-slate-50 text-slate-600 text-[10px] font-black rounded-xl">View Analysis</button>
                  </div>
              `,
                )
                .join('')}
          </div>
      </div>
  `
}

window.selectAnalysisMode = function selectAnalysisMode(mode) {
  window.setState({ mode, view: 'grid-analysis' })
}

function renderAnalysis(container) {
  const modeHistory = window.historyData.filter((h) => h.mode === window.state.mode)
  const bestTime = modeHistory.length > 0 ? Math.min(...modeHistory.map((h) => h.totalTime)) : 0

  container.innerHTML = `
      <div class="p-6 fade-in flex flex-col h-[90vh]">
          <div class="flex items-center justify-between mb-8"><button onclick="setState({view: 'performance-history'})" class="text-slate-400 font-bold">← Back</button><h2 class="text-xl font-black text-slate-800 uppercase">${window.state.mode} Analysis</h2></div>
          <div class="grid grid-cols-2 gap-4 mb-8">
              <div class="bg-blue-50 p-6 rounded-3xl text-center"><div class="text-[10px] font-bold text-blue-400 uppercase">Best</div><div class="text-3xl font-black text-blue-700">${bestTime.toFixed(2)}s</div></div>
              <div class="bg-slate-50 p-6 rounded-3xl text-center"><div class="text-[10px] font-bold text-slate-400 uppercase">Sessions</div><div class="text-3xl font-black text-slate-700">${modeHistory.length}</div></div>
          </div>
          <div class="bg-white rounded-[2rem] border-2 border-slate-50 p-6 flex-1 flex flex-col shadow-sm">
              <canvas id="analysisChart"></canvas>
          </div>
          <button onclick="setState({view: 'home'})" class="w-full py-5 bg-slate-900 text-white font-black text-xl rounded-2xl mt-8">Exit</button>
      </div>
  `

  setTimeout(() => {
    const ctx = document.getElementById('analysisChart')?.getContext('2d')
    if (!ctx) return
    const recent = modeHistory.slice(-15)
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: recent.map((h) =>
          new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ),
        datasets: [{ data: recent.map((h) => h.totalTime), borderColor: '#3b82f6', fill: true, tension: 0.4 }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
    })
  }, 100)
}

// Initial render
window.render()
