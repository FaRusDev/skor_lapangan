// Game State
let gameState = {
  leftScore: 0,
  rightScore: 0,
  currentPeriod: 1,
  timeRemaining: 360, // 6 minutes in seconds
  isRunning: false,
  isGameEnded: false,
  scoreHistory: [],
}

let timerInterval

// DOM Elements
const leftScoreEl = document.getElementById("leftScore")
const rightScoreEl = document.getElementById("rightScore")
const timerEl = document.getElementById("timer")
const currentPeriodEl = document.getElementById("currentPeriod") // Mungkin tidak ada
const playPauseBtn = document.getElementById("playPauseBtn")
const playPauseText = document.getElementById("playPauseText")
const gameStatusEl = document.getElementById("gameStatus") // Mungkin tidak ada
const scoreHistoryEl = document.getElementById("scoreHistory") // Mungkin tidak ada
const leftTeamNameEl =
  document.getElementById("leftTeamName") ||
  document.getElementById("leftTeamNameH1")
const rightTeamNameEl =
  document.getElementById("rightTeamName") ||
  document.getElementById("rightTeamNameH1")

// Initialize the game
function initGame() {
  updateDisplay()
  if (gameStatusEl) updateGameStatus()
}

// Update all display elements
function updateDisplay() {
  // Hanya update angka skor dan period, tidak mengubah struktur/desain
  if (leftScoreEl) leftScoreEl.textContent = gameState.leftScore
  if (rightScoreEl) rightScoreEl.textContent = gameState.rightScore
  if (currentPeriodEl) currentPeriodEl.textContent = gameState.currentPeriod
  updateTimerDisplay()
}

// Update timer display
function updateTimerDisplay() {
  const minutes = Math.floor(gameState.timeRemaining / 60)
  const seconds = gameState.timeRemaining % 60

  // Format normal: 06:00, 05:59, 05:58, etc.
  timerEl.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`

  // Change color based on time remaining
  if (gameState.timeRemaining <= 60) {
    timerEl.style.color = "#f44336" // Red for last minute
  } else if (gameState.timeRemaining <= 120) {
    timerEl.style.color = "#ff9800" // Orange for last 2 minutes
  } else {
    timerEl.style.color = "white" // White color for visibility
  }
}

// Add score to a team
function addScore(team, points) {
  if (gameState.isGameEnded) {
    alert("Pertandingan sudah berakhir!")
    return
  }

  // Ambil nama tim dari contenteditable h1 jika ada, jika tidak dari input
  const teamName =
    team === "left"
      ? leftTeamNameEl.innerText || leftTeamNameEl.value
      : rightTeamNameEl.innerText || rightTeamNameEl.value

  if (team === "left") {
    gameState.leftScore += points
  } else {
    gameState.rightScore += points
  }

  // Add to history
  if (scoreHistoryEl) addToHistory(`${teamName} mendapat ${points} poin`)

  updateDisplay()
  if (gameStatusEl) updateGameStatus()

  // Play sound effect (optional)
  playScoreSound()
}

// Subtract score from a team
function subtractScore(team) {
  if (gameState.isGameEnded) {
    alert("Pertandingan sudah berakhir!")
    return
  }

  const teamName =
    team === "left"
      ? leftTeamNameEl.innerText || leftTeamNameEl.value
      : rightTeamNameEl.innerText || rightTeamNameEl.value

  if (team === "left" && gameState.leftScore > 0) {
    gameState.leftScore -= 1
    if (scoreHistoryEl) addToHistory(`${teamName} dikurangi 1 poin (koreksi)`)
  } else if (team === "right" && gameState.rightScore > 0) {
    gameState.rightScore -= 1
    if (scoreHistoryEl) addToHistory(`${teamName} dikurangi 1 poin (koreksi)`)
  }

  updateDisplay()
  if (gameStatusEl) updateGameStatus()
}

// Toggle timer (play/pause)
function toggleTimer() {
  if (gameState.isGameEnded) {
    alert("Pertandingan sudah berakhir!")
    return
  }

  if (gameState.isRunning) {
    pauseTimer()
  } else {
    startTimer()
  }
}

// Start timer
function startTimer() {
  gameState.isRunning = true
  playPauseText.textContent = "Pause"

  timerInterval = setInterval(() => {
    gameState.timeRemaining--
    updateTimerDisplay()

    if (gameState.timeRemaining <= 0) {
      endPeriod()
    }
  }, 1000)

  if (gameStatusEl) updateGameStatus()
}

// Pause timer
function pauseTimer() {
  gameState.isRunning = false
  playPauseText.textContent = "Play"
  clearInterval(timerInterval)
  updateGameStatus()
}

// End current period
function endPeriod() {
  pauseTimer()
  gameState.timeRemaining = 0
  updateTimerDisplay()

  if (gameState.currentPeriod === 1) {
    addToHistory(`--- Babak ${gameState.currentPeriod} Berakhir ---`)
    alert(`Babak ${gameState.currentPeriod} berakhir! Siap untuk babak ke-2?`)
    updateGameStatus()
  } else {
    endGame()
  }
}

// Move to next period
function nextPeriod() {
  if (gameState.currentPeriod < 2) {
    gameState.currentPeriod++
    gameState.timeRemaining = 360 // Reset to 6 minutes
    pauseTimer()
    updateDisplay()
    addToHistory(`--- Babak ${gameState.currentPeriod} Dimulai ---`)
    updateGameStatus()
  } else {
    alert("Sudah babak terakhir!")
  }
}

// Reset current period
function resetPeriod() {
  if (confirm("Yakin ingin reset babak ini?")) {
    pauseTimer()
    gameState.timeRemaining = 360 // Reset to 6 minutes
    gameState.leftScore = 0 // Reset skor kiri ke 0
    gameState.rightScore = 0 // Reset skor kanan ke 0
    updateDisplay()
    if (scoreHistoryEl)
      addToHistory(`--- Babak ${gameState.currentPeriod} Direset ---`)
    if (gameStatusEl) updateGameStatus()
  }
}

// End game
function endGame() {
  gameState.isGameEnded = true
  pauseTimer()

  const leftTeamName = leftTeamNameEl.innerText || leftTeamNameEl.value
  const rightTeamName = rightTeamNameEl.innerText || rightTeamNameEl.value

  let winner
  if (gameState.leftScore > gameState.rightScore) {
    winner = leftTeamName
  } else if (gameState.rightScore > gameState.leftScore) {
    winner = rightTeamName
  } else {
    winner = "Seri"
  }

  addToHistory("=== PERTANDINGAN BERAKHIR ===")
  if (winner === "Seri") {
    addToHistory("Hasil: SERI!")
    alert("Pertandingan berakhir SERI!")
  } else {
    addToHistory(`Pemenang: ${winner}!`)
    alert(`Pertandingan berakhir! Pemenang: ${winner}!`)
  }

  updateGameStatus()
}

// Reset entire game
function resetGame() {
  // Clear any existing localStorage data immediately (tanpa konfirmasi)
  localStorage.removeItem("basketballGameState")
  localStorage.removeItem("basketballTeamNames")
  
  if (confirm("Yakin ingin reset seluruh pertandingan?")) {
    // Stop timer dan clear interval
    pauseTimer()
    clearInterval(timerInterval)

    // Reset gameState ke nilai awal
    gameState = {
      leftScore: 0,
      rightScore: 0,
      currentPeriod: 1,
      timeRemaining: 360,
      isRunning: false,
      isGameEnded: false,
      scoreHistory: [],
    }

    // Reset tampilan
    updateDisplay()
    if (gameStatusEl) updateGameStatus()
    if (scoreHistoryEl) scoreHistoryEl.innerHTML = ""

    // Reset tombol play/pause ke "Play"
    if (playPauseText) playPauseText.textContent = "Play"

    // Reset team names to default
    if (leftTeamNameEl) {
      if (leftTeamNameEl.tagName === "H1")
        leftTeamNameEl.innerText = "nama team"
      else leftTeamNameEl.value = "nama team"
    }
    if (rightTeamNameEl) {
      if (rightTeamNameEl.tagName === "H1")
        rightTeamNameEl.innerText = "nama team"
      else rightTeamNameEl.value = "nama team"
    }
  }
}

// Update game status display
function updateGameStatus() {
  if (!gameStatusEl) return // Early return jika element tidak ada
  
  let status

  if (gameState.isGameEnded) {
    const leftTeamName = leftTeamNameEl.innerText || leftTeamNameEl.value
    const rightTeamName = rightTeamNameEl.innerText || rightTeamNameEl.value

    if (gameState.leftScore > gameState.rightScore) {
      status = `Pertandingan Berakhir - Pemenang: ${leftTeamName}`
    } else if (gameState.rightScore > gameState.leftScore) {
      status = `Pertandingan Berakhir - Pemenang: ${rightTeamName}`
    } else {
      status = "Pertandingan Berakhir - SERI"
    }
  } else if (gameState.isRunning) {
    status = `Babak ${gameState.currentPeriod} - Sedang Berlangsung`
  } else if (
    gameState.timeRemaining === 360 &&
    gameState.leftScore === 0 &&
    gameState.rightScore === 0
  ) {
    status = "Pertandingan Belum Dimulai"
  } else {
    status = `Babak ${gameState.currentPeriod} - Dijeda`
  }

  gameStatusEl.textContent = status
}

// Add entry to score history
function addToHistory(entry) {
  if (!scoreHistoryEl) return // Early return jika element tidak ada
  
  const timestamp = new Date().toLocaleTimeString("id-ID")
  const historyEntry = `[${timestamp}] ${entry}`
  gameState.scoreHistory.push(historyEntry)

  const historyItem = document.createElement("div")
  historyItem.className = "history-item"
  historyItem.textContent = historyEntry

  scoreHistoryEl.appendChild(historyItem)
  scoreHistoryEl.scrollTop = scoreHistoryEl.scrollHeight
}

// Play score sound effect (optional - browser may block without user interaction)
function playScoreSound() {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.2
    )

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  } catch (error) {
    // Sound not available, continue silently
  }
}

// Keyboard shortcuts
document.addEventListener("keydown", function (event) {
  if (event.target.tagName === "INPUT") return // Don't trigger if typing in input field

  switch (event.key) {
    case " ": // Spacebar for play/pause
      event.preventDefault()
      toggleTimer()
      break
    case "1":
      addScore("left", 1)
      break
    case "2":
      addScore("left", 2)
      break
    case "3":
      addScore("left", 3)
      break
    case "7":
      addScore("right", 1)
      break
    case "8":
      addScore("right", 2)
      break
    case "9":
      addScore("right", 3)
      break
    case "r":
    case "R":
      if (event.ctrlKey) {
        event.preventDefault()
        resetGame()
      }
      break
  }
})

// Initialize game when page loads
document.addEventListener("DOMContentLoaded", function () {
  initGame()
})
