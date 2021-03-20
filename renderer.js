import Team from 'Team.js'
const remote = require('electron').remote
const excel = require('exceljs')
const fs = require('fs')
const { Howl } = require('howler')

let timerContainer
let timer = 150

let leftShiftPressed = false
let rightShiftPressed = false
let leftCtrlPressed = false
let rightCtrlPressed = false
let crossModPressed = false
let climbDelPressed = false

let currentMatchName = ''
let totalMatchNumber = ''
let friendlyMatchName = ''

const redScore = 0
const blueScore = 0
const redClimbScore = 0
const blueClimbScore = 0

const redAutoScore = 0
const blueAutoScore = 0
let foulsByBlue = 0
let foulsByRed = 0
const redRP = 0
const blueRP = 0

const redClimbRP = 0
const blueClimbRP = 0

let redHighScore = false
let blueHighScore = false

let red1Num
let red2Num
let red3Num
let red4Num
let blue1Num
let blue2Num
let blue3Num
let blue4Num
let red1Name
let red2Name
let red3Name
let red4Name
let blue1Name
let blue2Name
let blue3Name
let blue4Name
let red1LastRank
let red2LastRank
let red3LastRank
let blue1LastRank
let blue2LastRank
let blue3LastRank
let red1NewRank
let red2NewRank
let red3NewRank
let blue1NewRank
let blue2NewRank
let blue3NewRank
let redAllianceNum
let blueAllianceNum
let redAllianceName
let blueAllianceName
let redAllianceWins
let blueAllianceWins

// const blueTeam = new Team('blue')

let preMatch = true
let inMatch = false
let postMatch = false

let autoSound
let endSound
let endgameSound
let faultSound
let teleopSound;

(function handleResize () {
  document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
      init()
    }
  }
  function init () {
    const window = remote.getCurrentWindow()
    incrementMatch(false)
    autoSound = new Howl({ src: ['sounds/auto.wav'] })
    endSound = new Howl({ src: ['sounds/end.wav'] })
    endgameSound = new Howl({ src: ['sounds/endgame.wav'] })
    faultSound = new Howl({ src: ['sounds/fault.wav'] })
    teleopSound = new Howl({ src: ['sounds/teleop.wav'] })
    window.on('resize', function () {
      document.body.style.transform = 'scale(' + (remote.getCurrentWindow().webContents.getOwnerBrowserWindow().getBounds().width / 1920) + ', ' +
                                                    (remote.getCurrentWindow().webContents.getOwnerBrowserWindow().getBounds().height / 1080) + ')'
    }
    )
    document.addEventListener('keydown', function (e) {
      if (e.code === 'F1' && !inMatch) startMatch()
      else if (e.code === 'F2' && !inMatch) publishAndDisplayScores()
      else if (e.code === 'F3' && !inMatch) nextMatchAndRemoveDisplay()
      else if (e.code === 'F6') incrementMatch(true)
      else if (e.code === 'F7') incrementMatch(false)
      else if (e.code === 'F8') toggleDisplay()
      else if (e.code === 'F9') resetMatch()
      else if (e.code === 'F10') publishScores()
      else if (e.code === 'F12' && inMatch) fieldFault()

      else if (e.code === 'KeyQ') updateRocketHatch('hatch-red-r1-top', true, leftShiftPressed)
      else if (e.code === 'KeyW') updateRocketHatch('hatch-red-r1-top', false, leftShiftPressed)
      else if (e.code === 'KeyA') updateRocketHatch('hatch-red-r1-mid', true, leftShiftPressed)
      else if (e.code === 'KeyS') updateRocketHatch('hatch-red-r1-mid', false, leftShiftPressed)
      else if (e.code === 'KeyZ') updateRocketHatch('hatch-red-r1-bot', true, leftShiftPressed)
      else if (e.code === 'KeyX') updateRocketHatch('hatch-red-r1-bot', false, leftShiftPressed)
      else if (e.code === 'Digit1') updateCargoHatch('hatch-red-bot-front', leftShiftPressed)
      else if (e.code === 'Digit2') updateCargoHatch('hatch-red-bot-left', leftShiftPressed)
      else if (e.code === 'Digit3') updateCargoHatch('hatch-red-bot-mid', leftShiftPressed)
      else if (e.code === 'Digit4') updateCargoHatch('hatch-red-bot-right', leftShiftPressed)

      else if (e.code === 'KeyE') updateRocketHatch('hatch-red-r2-top', false, leftCtrlPressed)
      else if (e.code === 'KeyR') updateRocketHatch('hatch-red-r2-top', true, leftCtrlPressed)
      else if (e.code === 'KeyD') updateRocketHatch('hatch-red-r2-mid', false, leftCtrlPressed)
      else if (e.code === 'KeyF') updateRocketHatch('hatch-red-r2-mid', true, leftCtrlPressed)
      else if (e.code === 'KeyC') updateRocketHatch('hatch-red-r2-bot', false, leftCtrlPressed)
      else if (e.code === 'KeyV') updateRocketHatch('hatch-red-r2-bot', true, leftCtrlPressed)
      else if (e.code === 'Digit5') updateCargoHatch('hatch-red-top-right', leftCtrlPressed)
      else if (e.code === 'Digit6') updateCargoHatch('hatch-red-top-mid', leftCtrlPressed)
      else if (e.code === 'Digit7') updateCargoHatch('hatch-red-top-left', leftCtrlPressed)
      else if (e.code === 'Digit8') updateCargoHatch('hatch-red-top-front', leftCtrlPressed)

      else if (e.code === 'KeyT') updateRocketHatch('hatch-blue-r1-top', true, rightShiftPressed)
      else if (e.code === 'KeyY') updateRocketHatch('hatch-blue-r1-top', false, rightShiftPressed)
      else if (e.code === 'KeyG') updateRocketHatch('hatch-blue-r1-mid', true, rightShiftPressed)
      else if (e.code === 'KeyH') updateRocketHatch('hatch-blue-r1-mid', false, rightShiftPressed)
      else if (e.code === 'KeyB') updateRocketHatch('hatch-blue-r1-bot', true, rightShiftPressed)
      else if (e.code === 'KeyN') updateRocketHatch('hatch-blue-r1-bot', false, rightShiftPressed)
      else if (e.code === 'Digit9') updateCargoHatch('hatch-blue-bot-left', rightShiftPressed)
      else if (e.code === 'Digit0') updateCargoHatch('hatch-blue-bot-mid', rightShiftPressed)
      else if (e.code === 'Minus') updateCargoHatch('hatch-blue-bot-right', rightShiftPressed)
      else if (e.code === 'Equal') updateCargoHatch('hatch-blue-bot-front', rightShiftPressed)

      else if (e.code === 'KeyU') updateRocketHatch('hatch-blue-r2-top', false, rightCtrlPressed)
      else if (e.code === 'KeyI') updateRocketHatch('hatch-blue-r2-top', true, rightCtrlPressed)
      else if (e.code === 'KeyJ') updateRocketHatch('hatch-blue-r2-mid', false, rightCtrlPressed)
      else if (e.code === 'KeyK') updateRocketHatch('hatch-blue-r2-mid', true, rightCtrlPressed)
      else if (e.code === 'KeyM') updateRocketHatch('hatch-blue-r2-bot', false, rightCtrlPressed)
      else if (e.code === 'Comma') updateRocketHatch('hatch-blue-r2-bot', true, rightCtrlPressed)
      else if (e.code === 'KeyO') updateCargoHatch('hatch-blue-top-front', rightCtrlPressed)
      else if (e.code === 'KeyP') updateCargoHatch('hatch-blue-top-right', rightCtrlPressed)
      else if (e.code === 'BracketLeft') updateCargoHatch('hatch-blue-top-mid', rightCtrlPressed)
      else if (e.code === 'BracketRight') updateCargoHatch('hatch-blue-top-left', rightCtrlPressed)

      else if (e.code === 'Numpad1') updateHab('100px', true)
      else if (e.code === 'Numpad4') updateHab('200px', true)
      else if (e.code === 'Numpad7') updateHab('300px', true)

      else if (e.code === 'Numpad2') updateHab('100px', false)
      else if (e.code === 'Numpad5') updateHab('200px', false)
      else if (e.code === 'Numpad8') updateHab('300px', false)

      else if (e.code === 'Numpad6') foulsByRed += (climbDelPressed ? -1 : 1) * 5
      else if (e.code === 'Numpad3') foulsByRed += (climbDelPressed ? -1 : 1) * 3
      else if (e.code === 'NumpadAdd') foulsByBlue += (climbDelPressed ? -1 : 1) * 5
      else if (e.code === 'NumpadEnter') foulsByBlue += (climbDelPressed ? -1 : 1) * 3

      else if (e.code === 'ShiftLeft') leftShiftPressed = true
      else if (e.code === 'ShiftRight') rightShiftPressed = true
      else if (e.code === 'ControlLeft') leftCtrlPressed = true
      else if (e.code === 'AltRight') rightCtrlPressed = true
      else if (e.code === 'NumpadMultiply') crossModPressed = true
      else if (e.code === 'NumpadSubtract') climbDelPressed = true
      else if (e.code === 'Backspace') nullHatchModPressed = true
      updateScore()
    })

    document.addEventListener('keyup', function (e) {
      if (e.code === 'ShiftLeft') leftShiftPressed = false
      else if (e.code === 'ShiftRight') rightShiftPressed = false
      else if (e.code === 'ControlLeft') leftCtrlPressed = false
      else if (e.code === 'AltRight') rightCtrlPressed = false
      else if (e.code === 'NumpadMultiply') crossModPressed = false
      else if (e.code === 'NumpadSubtract') climbDelPressed = false
      else if (e.code === 'Backspace') nullHatchModPressed = false
    })
  }
})()

function runTimer () {
  let secondsToDisplay = 0
  if (timer > 135) {
    secondsToDisplay = timer - 135
    document.getElementsByClassName('timer-bar')[0].style.backgroundColor = 'green'
  } else if (timer > 30) {
    secondsToDisplay = timer
    document.getElementsByClassName('timer-bar')[0].style.backgroundColor = 'green'
  } else if (timer > 0) {
    secondsToDisplay = timer
    document.getElementsByClassName('timer-bar')[0].style.backgroundColor = 'yellow'
  } else {
    secondsToDisplay = 0
    document.getElementsByClassName('timer-bar')[0].style.backgroundColor = 'red'
  }
  if (timer === 150) autoSound.play()
  else if (timer === 135) teleopSound.play()
  else if (timer === 30) endgameSound.play()
  document.getElementsByClassName('timer-bar')[0].style.width = (150 - timer) / 150 * 100 + '%'
  document.getElementsByClassName('time')[0].textContent = secondsToDisplay
  if (--timer < 0) {
    inMatch = false
    postMatch = true
    endSound.play()
    clearInterval(timerContainer)
  }
}

function updateScore (points, team) {

}

function updateDisplay () {
  document.getElementsByClassName('display-match')[0].innerHTML = friendlyMatchName
  if (currentMatchName.startsWith('Qualification')) {
    document.getElementById('display-red-1-num-playoffs').innerHTML = ''
    document.getElementById('display-red-2-num-playoffs').innerHTML = ''
    document.getElementById('display-red-3-num-playoffs').innerHTML = ''
    document.getElementById('display-red-4-num-playoffs').innerHTML = ''
    document.getElementById('display-blue-1-num-playoffs').innerHTML = ''
    document.getElementById('display-blue-2-num-playoffs').innerHTML = ''
    document.getElementById('display-blue-3-num-playoffs').innerHTML = ''
    document.getElementById('display-blue-4-num-playoffs').innerHTML = ''
    document.getElementById('display-red-1-name-playoffs').innerHTML = ''
    document.getElementById('display-red-2-name-playoffs').innerHTML = ''
    document.getElementById('display-red-3-name-playoffs').innerHTML = ''
    document.getElementById('display-red-4-name-playoffs').innerHTML = ''
    document.getElementById('display-blue-1-name-playoffs').innerHTML = ''
    document.getElementById('display-blue-2-name-playoffs').innerHTML = ''
    document.getElementById('display-blue-3-name-playoffs').innerHTML = ''
    document.getElementById('display-blue-4-name-playoffs').innerHTML = ''
    document.getElementById('display-red-1-avatar-playoffs').innerHTML = ''
    document.getElementById('display-red-2-avatar-playoffs').innerHTML = ''
    document.getElementById('display-red-3-avatar-playoffs').innerHTML = ''
    document.getElementById('display-red-4-avatar-playoffs').innerHTML = ''
    document.getElementById('display-blue-1-avatar-playoffs').innerHTML = ''
    document.getElementById('display-blue-2-avatar-playoffs').innerHTML = ''
    document.getElementById('display-blue-3-avatar-playoffs').innerHTML = ''
    document.getElementById('display-blue-4-avatar-playoffs').innerHTML = ''
    document.getElementById('display-red-alliance-name-playoffs').innerHTML = ''
    document.getElementById('display-blue-alliance-name-playoffs').innerHTML = ''
    document.getElementById('display-red-series-wins').innerHTML = ''
    document.getElementById('display-blue-series-wins').innerHTML = ''

    document.getElementsByClassName('display-team-title-red')[0].innerHTML = 'Team'
    document.getElementsByClassName('display-team-title-blue')[0].innerHTML = 'Team'
    document.getElementsByClassName('display-rank-title-red')[0].innerHTML = 'Rank'
    document.getElementsByClassName('display-rank-title-blue')[0].innerHTML = 'Rank'
    document.getElementById('display-red-1-num').innerHTML = red1Num
    document.getElementById('display-red-2-num').innerHTML = red2Num
    document.getElementById('display-red-3-num').innerHTML = red3Num
    document.getElementById('display-blue-1-num').innerHTML = blue1Num
    document.getElementById('display-blue-2-num').innerHTML = blue2Num
    document.getElementById('display-blue-3-num').innerHTML = blue3Num
    document.getElementById('display-red-1-name').innerHTML = red1Name
    document.getElementById('display-red-2-name').innerHTML = red2Name
    document.getElementById('display-red-3-name').innerHTML = red3Name
    document.getElementById('display-blue-1-name').innerHTML = blue1Name
    document.getElementById('display-blue-2-name').innerHTML = blue2Name
    document.getElementById('display-blue-3-name').innerHTML = blue3Name
    if (fs.existsSync('images/' + red1Num + '-avatar.png')) document.getElementById('display-red-1-avatar').innerHTML = "<img src='images/" + red1Num + "-avatar.png'>"
    else document.getElementById('display-red-1-avatar').innerHTML = ''
    if (fs.existsSync('images/' + red2Num + '-avatar.png')) document.getElementById('display-red-2-avatar').innerHTML = "<img src='images/" + red2Num + "-avatar.png'>"
    else document.getElementById('display-red-2-avatar').innerHTML = ''
    if (fs.existsSync('images/' + red3Num + '-avatar.png')) document.getElementById('display-red-3-avatar').innerHTML = "<img src='images/" + red3Num + "-avatar.png'>"
    else document.getElementById('display-red-3-avatar').innerHTML = ''
    if (fs.existsSync('images/' + blue1Num + '-avatar.png')) document.getElementById('display-blue-1-avatar').innerHTML = "<img src='images/" + blue1Num + "-avatar.png'>"
    else document.getElementById('display-blue-1-avatar').innerHTML = ''
    if (fs.existsSync('images/' + blue2Num + '-avatar.png')) document.getElementById('display-blue-2-avatar').innerHTML = "<img src='images/" + blue2Num + "-avatar.png'>"
    else document.getElementById('display-blue-2-avatar').innerHTML = ''
    if (fs.existsSync('images/' + blue3Num + '-avatar.png')) document.getElementById('display-blue-3-avatar').innerHTML = "<img src='images/" + blue3Num + "-avatar.png'>"
    else document.getElementById('display-blue-3-avatar').innerHTML = ''
  } else {
    document.getElementById('display-red-1-num').innerHTML = ''
    document.getElementById('display-red-2-num').innerHTML = ''
    document.getElementById('display-red-3-num').innerHTML = ''
    document.getElementById('display-blue-1-num').innerHTML = ''
    document.getElementById('display-blue-2-num').innerHTML = ''
    document.getElementById('display-blue-3-num').innerHTML = ''
    document.getElementById('display-red-1-name').innerHTML = ''
    document.getElementById('display-red-2-name').innerHTML = ''
    document.getElementById('display-red-3-name').innerHTML = ''
    document.getElementById('display-blue-1-name').innerHTML = ''
    document.getElementById('display-blue-2-name').innerHTML = ''
    document.getElementById('display-blue-3-name').innerHTML = ''
    document.getElementById('display-red-1-avatar').innerHTML = ''
    document.getElementById('display-red-2-avatar').innerHTML = ''
    document.getElementById('display-red-3-avatar').innerHTML = ''
    document.getElementById('display-blue-1-avatar').innerHTML = ''
    document.getElementById('display-blue-2-avatar').innerHTML = ''
    document.getElementById('display-blue-3-avatar').innerHTML = ''
    document.getElementById('display-red-1-rank').innerHTML = ''
    document.getElementById('display-red-2-rank').innerHTML = ''
    document.getElementById('display-red-3-rank').innerHTML = ''
    document.getElementById('display-blue-1-rank').innerHTML = ''
    document.getElementById('display-blue-2-rank').innerHTML = ''
    document.getElementById('display-blue-3-rank').innerHTML = ''
    document.getElementsByClassName('display-rank-title-red')[0].innerHTML = ''
    document.getElementsByClassName('display-rank-title-blue')[0].innerHTML = ''
    document.getElementsByClassName('display-climb-rp-red')[0].style.visibility = 'hidden'
    document.getElementsByClassName('display-climb-rp-blue')[0].style.visibility = 'hidden'
    document.getElementsByClassName('display-rocket-rp-red')[0].style.visibility = 'hidden'
    document.getElementsByClassName('display-rocket-rp-blue')[0].style.visibility = 'hidden'

    redAllianceWins = 0
    blueAllianceWins = 0
    const workbook = new excel.Workbook()
    workbook.xlsx.readFile('EventInfo.xlsx').then(function () {
      const worksheet = workbook.getWorksheet('Matches')
      worksheet.eachRow(function (row) {
        if ((row.getCell('A').text.split(' ')[0] + row.getCell('A').text.split(' ')[1] === currentMatchName.split(' ')[0] + currentMatchName.split(' ')[1]) ||
                    (row.getCell('A').text.startsWith('Final') && currentMatchName.startsWith('Final'))) {
          if (parseFloat(row.getCell('H').text) > parseFloat(row.getCell('I').text)) redAllianceWins++
          else if (parseFloat(row.getCell('H').text) < parseFloat(row.getCell('I').text)) blueAllianceWins++
        }
      })
      document.getElementById('display-red-series-wins').innerHTML = redAllianceWins
      document.getElementById('display-blue-series-wins').innerHTML = blueAllianceWins
    })

    document.getElementsByClassName('display-win-rp-red')[0].style.top = '-300px'
    document.getElementsByClassName('display-win-rp-blue')[0].style.top = '-300px'
    document.getElementsByClassName('display-team-title-red')[0].innerHTML = 'Alliance ' + redAllianceNum
    document.getElementsByClassName('display-team-title-blue')[0].innerHTML = 'Alliance ' + blueAllianceNum
    document.getElementById('display-red-alliance-name-playoffs').innerHTML = redAllianceName
    document.getElementById('display-blue-alliance-name-playoffs').innerHTML = blueAllianceName
    document.getElementById('display-red-1-num-playoffs').innerHTML = red1Num
    document.getElementById('display-red-2-num-playoffs').innerHTML = red2Num
    document.getElementById('display-red-3-num-playoffs').innerHTML = red3Num
    document.getElementById('display-red-4-num-playoffs').innerHTML = red4Num
    document.getElementById('display-blue-1-num-playoffs').innerHTML = blue1Num
    document.getElementById('display-blue-2-num-playoffs').innerHTML = blue2Num
    document.getElementById('display-blue-3-num-playoffs').innerHTML = blue3Num
    document.getElementById('display-blue-4-num-playoffs').innerHTML = blue4Num
    document.getElementById('display-red-1-name-playoffs').innerHTML = red1Name
    document.getElementById('display-red-2-name-playoffs').innerHTML = red2Name
    document.getElementById('display-red-3-name-playoffs').innerHTML = red3Name
    document.getElementById('display-red-4-name-playoffs').innerHTML = red4Name || ''
    document.getElementById('display-blue-1-name-playoffs').innerHTML = blue1Name
    document.getElementById('display-blue-2-name-playoffs').innerHTML = blue2Name
    document.getElementById('display-blue-3-name-playoffs').innerHTML = blue3Name
    document.getElementById('display-blue-4-name-playoffs').innerHTML = blue4Name || ''
    if (fs.existsSync('images/' + red1Num + '-avatar.png')) document.getElementById('display-red-1-avatar-playoffs').innerHTML = "<img src='images/" + red1Num + "-avatar.png'>"
    else document.getElementById('display-red-1-avatar-playoffs').innerHTML = ''
    if (fs.existsSync('images/' + red2Num + '-avatar.png')) document.getElementById('display-red-2-avatar-playoffs').innerHTML = "<img src='images/" + red2Num + "-avatar.png'>"
    else document.getElementById('display-red-2-avatar-playoffs').innerHTML = ''
    if (fs.existsSync('images/' + red3Num + '-avatar.png')) document.getElementById('display-red-3-avatar-playoffs').innerHTML = "<img src='images/" + red3Num + "-avatar.png'>"
    else document.getElementById('display-red-3-avatar-playoffs').innerHTML = ''
    if (fs.existsSync('images/' + red4Num + '-avatar.png')) document.getElementById('display-red-4-avatar-playoffs').innerHTML = "<img src='images/" + red4Num + "-avatar.png'>"
    else document.getElementById('display-red-4-avatar-playoffs').innerHTML = ''
    if (fs.existsSync('images/' + blue1Num + '-avatar.png')) document.getElementById('display-blue-1-avatar-playoffs').innerHTML = "<img src='images/" + blue1Num + "-avatar.png'>"
    else document.getElementById('display-blue-1-avatar-playoffs').innerHTML = ''
    if (fs.existsSync('images/' + blue2Num + '-avatar.png')) document.getElementById('display-blue-2-avatar-playoffs').innerHTML = "<img src='images/" + blue2Num + "-avatar.png'>"
    else document.getElementById('display-blue-2-avatar-playoffs').innerHTML = ''
    if (fs.existsSync('images/' + blue3Num + '-avatar.png')) document.getElementById('display-blue-3-avatar-playoffs').innerHTML = "<img src='images/" + blue3Num + "-avatar.png'>"
    else document.getElementById('display-blue-3-avatar-playoffs').innerHTML = ''
    if (fs.existsSync('images/' + blue4Num + '-avatar.png')) document.getElementById('display-blue-4-avatar-playoffs').innerHTML = "<img src='images/" + blue4Num + "-avatar.png'>"
    else document.getElementById('display-blue-4-avatar-playoffs').innerHTML = ''
  }

  if (currentMatchName.startsWith('Qualification')) {
    let red1Rank = ''
    let red2Rank = ''
    let red3Rank = ''
    let blue1Rank = ''
    let blue2Rank = ''
    let blue3Rank = ''
    if (red1LastRank !== 0) {
      if (red1NewRank < red1LastRank) red1Rank += '▲'
      else if (red1NewRank > red1LastRank) red1Rank += '▼'
    }
    if (red2LastRank !== 0) {
      if (red2NewRank < red2LastRank) red2Rank += '▲'
      else if (red2NewRank > red2LastRank) red2Rank += '▼'
    }
    if (red3LastRank !== 0) {
      if (red3NewRank < red3LastRank) red3Rank += '▲'
      else if (red3NewRank > red3LastRank) red3Rank += '▼'
    }
    if (blue1LastRank !== 0) {
      if (blue1NewRank < blue1LastRank) blue1Rank += '▲'
      else if (blue1NewRank > blue1LastRank) blue1Rank += '▼'
    }
    if (blue2LastRank !== 0) {
      if (blue2NewRank < blue2LastRank) blue2Rank += '▲'
      else if (blue2NewRank > blue2LastRank) blue2Rank += '▼'
    }
    if (blue3LastRank !== 0) {
      if (blue3NewRank < blue3LastRank) blue3Rank += '▲'
      else if (blue3NewRank > blue3LastRank) blue3Rank += '▼'
    }
    red1Rank += red1NewRank.toString()
    red2Rank += red2NewRank.toString()
    red3Rank += red3NewRank.toString()
    blue1Rank += blue1NewRank.toString()
    blue2Rank += blue2NewRank.toString()
    blue3Rank += blue3NewRank.toString()
    document.getElementById('display-red-1-rank').innerHTML = red1Rank
    document.getElementById('display-red-2-rank').innerHTML = red2Rank
    document.getElementById('display-red-3-rank').innerHTML = red3Rank
    document.getElementById('display-blue-1-rank').innerHTML = blue1Rank
    document.getElementById('display-blue-2-rank').innerHTML = blue2Rank
    document.getElementById('display-blue-3-rank').innerHTML = blue3Rank
  }
  document.getElementById('display-score-red').innerHTML = redScore
  if (redHighScore) document.getElementById('display-high-score-red').innerHTML = 'HIGH SCORE'
  else document.getElementById('display-high-score-red').innerHTML = ''
  document.getElementById('display-score-blue').innerHTML = blueScore
  if (blueHighScore) document.getElementById('display-high-score-blue').innerHTML = 'HIGH SCORE'
  else document.getElementById('display-high-score-blue').innerHTML = ''

  if (redScore > blueScore) {
    document.getElementById('display-win-red').innerHTML = 'WIN'
    document.getElementById('display-win-blue').innerHTML = ''
    document.getElementsByClassName('display-win-rp-red')[0].style.backgroundColor = 'red'
    document.getElementsByClassName('display-win-rp-red')[0].innerHTML = "<img src='images/win-icon.png'>"
    document.getElementsByClassName('display-win-rp-blue')[0].style.backgroundColor = 'rgb(184, 184, 184)'
    document.getElementsByClassName('display-win-rp-blue')[0].innerHTML = "<img src='images/win-icon-grey.png'>"
  } else if (redScore < blueScore) {
    document.getElementById('display-win-red').innerHTML = ''
    document.getElementById('display-win-blue').innerHTML = 'WIN'
    document.getElementsByClassName('display-win-rp-blue')[0].style.backgroundColor = 'blue'
    document.getElementsByClassName('display-win-rp-blue')[0].innerHTML = "<img src='images/win-icon.png'>"
    document.getElementsByClassName('display-win-rp-red')[0].style.backgroundColor = 'rgb(184, 184, 184)'
    document.getElementsByClassName('display-win-rp-red')[0].innerHTML = "<img src='images/win-icon-grey.png'>"
  } else {
    document.getElementById('display-win-red').innerHTML = 'TIE'
    document.getElementById('display-win-blue').innerHTML = 'TIE'
    document.getElementsByClassName('display-win-rp-blue')[0].style.backgroundColor = 'blue'
    document.getElementsByClassName('display-win-rp-blue')[0].innerHTML = "<img src='images/tie-icon.png'>"
    document.getElementsByClassName('display-win-rp-red')[0].style.backgroundColor = 'red'
    document.getElementsByClassName('display-win-rp-red')[0].innerHTML = "<img src='images/tie-icon.png'>"
  }

  if (redRocketRP) {
    document.getElementsByClassName('display-rocket-rp-red')[0].style.backgroundColor = 'red'
    document.getElementsByClassName('display-rocket-rp-red')[0].innerHTML = "<img src='images/rocket-icon.png'>"
  } else {
    document.getElementsByClassName('display-rocket-rp-red')[0].style.backgroundColor = 'rgb(184, 184, 184)'
    document.getElementsByClassName('display-rocket-rp-red')[0].innerHTML = "<img src='images/rocket-icon-grey.png'>"
  }
  if (redClimbRP) {
    document.getElementsByClassName('display-climb-rp-red')[0].style.backgroundColor = 'red'
    document.getElementsByClassName('display-climb-rp-red')[0].innerHTML = "<img src='images/hab-icon.png'>"
  } else {
    document.getElementsByClassName('display-climb-rp-red')[0].style.backgroundColor = 'rgb(184, 184, 184)'
    document.getElementsByClassName('display-climb-rp-red')[0].innerHTML = "<img src='images/hab-icon-grey.png'>"
  }
  if (blueRocketRP) {
    document.getElementsByClassName('display-rocket-rp-blue')[0].style.backgroundColor = 'blue'
    document.getElementsByClassName('display-rocket-rp-blue')[0].innerHTML = "<img src='images/rocket-icon.png'>"
  } else {
    document.getElementsByClassName('display-rocket-rp-blue')[0].style.backgroundColor = 'rgb(184, 184, 184)'
    document.getElementsByClassName('display-rocket-rp-blue')[0].innerHTML = "<img src='images/rocket-icon-grey.png'>"
  }
  if (blueClimbRP) {
    document.getElementsByClassName('display-climb-rp-blue')[0].style.backgroundColor = 'blue'
    document.getElementsByClassName('display-climb-rp-blue')[0].innerHTML = "<img src='images/hab-icon.png'>"
  } else {
    document.getElementsByClassName('display-climb-rp-blue')[0].style.backgroundColor = 'rgb(184, 184, 184)'
    document.getElementsByClassName('display-climb-rp-blue')[0].innerHTML = "<img src='images/hab-icon-grey.png'>"
  }

  document.getElementById('red-auto-stat').innerHTML = redAutoScore
  document.getElementById('red-hatch-stat').innerHTML = redHatchScore
  document.getElementById('red-cargo-stat').innerHTML = redCargoScore
  document.getElementById('red-climb-stat').innerHTML = redClimbScore
  document.getElementById('red-foul-stat').innerHTML = foulsByBlue

  document.getElementById('blue-auto-stat').innerHTML = blueAutoScore
  document.getElementById('blue-hatch-stat').innerHTML = blueHatchScore
  document.getElementById('blue-cargo-stat').innerHTML = blueCargoScore
  document.getElementById('blue-climb-stat').innerHTML = blueClimbScore
  document.getElementById('blue-foul-stat').innerHTML = foulsByRed
}

function resetMatch () {
  Array.from(document.getElementsByClassName('hatch')).forEach(element => { element.className = 'no-hatch' })
  Array.from(document.getElementsByClassName('left-half-hatch')).forEach(element => { element.className = 'no-hatch' })
  Array.from(document.getElementsByClassName('right-half-hatch')).forEach(element => { element.className = 'no-hatch' })
  Array.from(document.getElementsByClassName('null-hatch')).forEach(element => { element.className = 'no-hatch' })
  Array.from(document.getElementsByClassName('cargo')).forEach(element => { element.className = 'no-cargo' })
  Array.from(document.getElementsByClassName('left-half-cargo')).forEach(element => { element.className = 'no-cargo' })
  Array.from(document.getElementsByClassName('right-half-cargo')).forEach(element => { element.className = 'no-cargo' })
  Array.from(document.getElementsByClassName('hab-dismount-red')).forEach(element => { element.style.height = '0px' })
  Array.from(document.getElementsByClassName('hab-dismount-blue')).forEach(element => { element.style.height = '0px' })
  Array.from(document.getElementsByClassName('hab-climb-red')).forEach(element => { element.style.height = '0px' })
  Array.from(document.getElementsByClassName('hab-climb-blue')).forEach(element => { element.style.height = '0px' })
  foulsByBlue = 0
  foulsByRed = 0
  document.getElementsByClassName('timer-bar')[0].style.backgroundColor = 'green'
  clearInterval(timerContainer)
  document.getElementsByClassName('timer-bar')[0].style.width = '100%'
  document.getElementsByClassName('time')[0].textContent = 0
  preMatch = true
  inMatch = false
  postMatch = false
}

function startMatch () {
  timer = 150
  inMatch = true
  preMatch = false
  postMatch = false
  timerContainer = setInterval(runTimer, 1000)
}

function fieldFault () {
  document.getElementsByClassName('timer-bar')[0].style.backgroundColor = 'maroon'
  faultSound.play()
  clearInterval(timerContainer)
  inMatch = false
}

function publishAndDisplayScores () {
  publishScores()
  setTimeout(function () {
    updateDisplay()
    fadeInDisplay()
  }, 1000)
}

function nextMatchAndRemoveDisplay () {
  preMatch = true
  incrementMatch()
  resetMatch()
  fadeOutDisplay()
}

function fadeInDisplay () {
  document.getElementsByClassName('display-bg')[0].style.visibility = 'visible'
  document.getElementsByClassName('display-bg')[0].classList.add('unfade')
}

function fadeOutDisplay () {
  document.getElementsByClassName('display-bg')[0].classList.remove('unfade')
}

function toggleDisplay () {
  document.getElementsByClassName('display-bg')[0].style.visibility = 'visible'
  document.getElementsByClassName('display-bg')[0].classList.toggle('unfade')
}

function updateRocketHatch (id, left, del) {
  if (del) {
    if (document.getElementById(id).className === 'hatch') {
      if (document.getElementById(id.replace('hatch', 'cargo')).className === 'cargo') {
        if (left) document.getElementById(id.replace('hatch', 'cargo')).className = 'right-half-cargo'
        else document.getElementById(id.replace('hatch', 'cargo')).className = 'left-half-cargo'
      } else if (document.getElementById(id.replace('hatch', 'cargo')).className === 'left-half-cargo') {
        if (left) document.getElementById(id.replace('hatch', 'cargo')).className = 'no-cargo'
        else document.getElementById(id).className = 'left-half-hatch'
      } else if (document.getElementById(id.replace('hatch', 'cargo')).className === 'right-half-cargo') {
        if (left) document.getElementById(id).className = 'right-half-hatch'
        else document.getElementById(id.replace('hatch', 'cargo')).className = 'no-cargo'
      } else if (document.getElementById(id.replace('hatch', 'cargo')).className === 'no-cargo') {
        if (left) document.getElementById(id).className = 'right-half-hatch'
        else document.getElementById(id).className = 'left-half-hatch'
      }
    } else if (document.getElementById(id).className === 'left-half-hatch') {
      if (document.getElementById(id.replace('hatch', 'cargo')).className === 'left-half-cargo') {
        if (left) document.getElementById(id.replace('hatch', 'cargo')).className = 'no-cargo'
      } else document.getElementById(id).className = 'no-hatch'
    } else if (document.getElementById(id).className === 'right-half-hatch') {
      if (document.getElementById(id.replace('hatch', 'cargo')).className === 'right-half-cargo') {
        if (!left) document.getElementById(id.replace('hatch', 'cargo')).className = 'no-cargo'
      } else document.getElementById(id).className = 'no-hatch'
    }
  } else {
    if (document.getElementById(id).className === 'no-hatch') {
      if (left) document.getElementById(id).className = 'left-half-hatch'
      else document.getElementById(id).className = 'right-half-hatch'
    } else if (document.getElementById(id).className === 'left-half-hatch') {
      if (left) document.getElementById(id.replace('hatch', 'cargo')).className = 'left-half-cargo'
      else document.getElementById(id).className = 'hatch'
    } else if (document.getElementById(id).className === 'right-half-hatch') {
      if (left) document.getElementById(id).className = 'hatch'
      else document.getElementById(id.replace('hatch', 'cargo')).className = 'right-half-cargo'
    } else if (document.getElementById(id).className === 'hatch') {
      if (document.getElementById(id.replace('hatch', 'cargo')).className === 'no-cargo') {
        if (left) document.getElementById(id.replace('hatch', 'cargo')).className = 'left-half-cargo'
        else document.getElementById(id.replace('hatch', 'cargo')).className = 'right-half-cargo'
      } if (document.getElementById(id.replace('hatch', 'cargo')).className === 'left-half-cargo') {
        if (!left) document.getElementById(id.replace('hatch', 'cargo')).className = 'cargo'
      } else if (document.getElementById(id.replace('hatch', 'cargo')).className === 'right-half-cargo') {
        if (left) document.getElementById(id.replace('hatch', 'cargo')).className = 'cargo'
      }
    }
  }
}

function incrementMatch (backward) {
  const workbook = new excel.Workbook()
  workbook.xlsx.readFile('EventInfo.xlsx').then(function () {
    const worksheet = workbook.getWorksheet('Matches')
    const matchNameCol = worksheet.getColumn('A')
    matchNameCol.eachCell(function (cell) {
      if (cell.text.includes('Qualification')) totalMatchNumber = cell.text.split(' ')[cell.text.split(' ').length - 1]
    })
  }).then(function () {
    if (currentMatchName === '') {
      var worksheet = workbook.getWorksheet('Matches')
      currentMatchName = worksheet.getCell('A2').text
    } else {
      var worksheet = workbook.getWorksheet('Matches')
      var matchNameCol = worksheet.getColumn('A')
      let found = false
      let next = false
      let lastCell
      matchNameCol.eachCell(function (cell) {
        if (!found && cell.text === currentMatchName) {
          if (backward) currentMatchName = lastCell.text
          else next = true
        } else if (next) {
          found = true
          next = false
          if (!backward) currentMatchName = cell.text
        }
        lastCell = cell
      })
      if (currentMatchName === 'Match Name') {
        currentMatchName = worksheet.getCell('A2').text
      }
    }
    let matchRow
    let nextMatchRow
    let justFound
    var matchNameCol = worksheet.getColumn('A')
    matchNameCol.eachCell(function (cell) {
      if (justFound) {
        nextMatchRow = worksheet.getRow(cell.row)
        justFound = false
      }
      if (cell.text === currentMatchName) {
        matchRow = worksheet.getRow(cell.row)
        justFound = true
      }
    })

    red1Num = matchRow.getCell('B').text
    red2Num = matchRow.getCell('C').text
    red3Num = matchRow.getCell('D').text
    blue1Num = matchRow.getCell('E').text
    blue2Num = matchRow.getCell('F').text
    blue3Num = matchRow.getCell('G').text
    document.getElementById('team-num-red-1').innerHTML = red1Num
    document.getElementById('team-num-red-2').innerHTML = red2Num
    document.getElementById('team-num-red-3').innerHTML = red3Num
    document.getElementById('team-num-blue-1').innerHTML = blue1Num
    document.getElementById('team-num-blue-2').innerHTML = blue2Num
    document.getElementById('team-num-blue-3').innerHTML = blue3Num
    if (!currentMatchName.startsWith('Qualification')) {
      red4Num = matchRow.getCell('Z').text
      blue4Num = matchRow.getCell('AA').text
      redAllianceNum = matchRow.getCell('AB').text
      blueAllianceNum = matchRow.getCell('AC').text
      redAllianceName = matchRow.getCell('AD').text
      blueAllianceName = matchRow.getCell('AE').text
    }

    if (nextMatchRow === undefined || currentMatchName.startsWith('Final') || !nextMatchRow.getCell('B').text) {
      document.getElementsByClassName('info-up-next-red')[0].innerHTML = ''
      document.getElementsByClassName('info-up-next-blue')[0].innerHTML = ''
    } else {
      document.getElementsByClassName('info-up-next-red')[0].innerHTML = 'Up next: ' + nextMatchRow.getCell('B').text + ', ' +
                nextMatchRow.getCell('C').text + ', ' + nextMatchRow.getCell('D').text
      document.getElementsByClassName('info-up-next-blue')[0].innerHTML = 'Up next: ' + nextMatchRow.getCell('E').text + ', ' +
                nextMatchRow.getCell('F').text + ', ' + nextMatchRow.getCell('G').text
    }

    const teamLookupSheet = workbook.getWorksheet('Teams')
    teamLookupSheet.getColumn('A').eachCell(function (cell) {
      if (matchRow.getCell('B').text === cell.text) red1Name = teamLookupSheet.getRow(cell.row).getCell(2)
      else if (matchRow.getCell('C').text === cell.text) red2Name = teamLookupSheet.getRow(cell.row).getCell(2)
      else if (matchRow.getCell('D').text === cell.text) red3Name = teamLookupSheet.getRow(cell.row).getCell(2)
      else if (matchRow.getCell('E').text === cell.text) blue1Name = teamLookupSheet.getRow(cell.row).getCell(2)
      else if (matchRow.getCell('F').text === cell.text) blue2Name = teamLookupSheet.getRow(cell.row).getCell(2)
      else if (matchRow.getCell('G').text === cell.text) blue3Name = teamLookupSheet.getRow(cell.row).getCell(2)
      else if (!currentMatchName.startsWith('Qualification')) {
        if (matchRow.getCell('Z').text === cell.text) red4Name = teamLookupSheet.getRow(cell.row).getCell(2)
        else if (matchRow.getCell('AA').text === cell.text) blue4Name = teamLookupSheet.getRow(cell.row).getCell(2)
        if (!matchRow.getCell('Z').text) red4Name = ''
        if (!matchRow.getCell('AA').text) blue4Name = ''
      }
    })
    document.getElementById('team-name-red-1').innerHTML = red1Name
    document.getElementById('team-name-red-2').innerHTML = red2Name
    document.getElementById('team-name-red-3').innerHTML = red3Name
    document.getElementById('team-name-blue-1').innerHTML = blue1Name
    document.getElementById('team-name-blue-2').innerHTML = blue2Name
    document.getElementById('team-name-blue-3').innerHTML = blue3Name
  }).then(function () {
    if (currentMatchName.startsWith('Qualification')) friendlyMatchName = currentMatchName + ' of ' + totalMatchNumber
    else friendlyMatchName = currentMatchName
    document.getElementsByClassName('info-match')[0].innerHTML = friendlyMatchName
  })
}

function publishScores () {
  console.log(123)
  const workbook = new excel.Workbook()
  const backupFileName = currentMatchName.replace(' ', '')
  workbook.xlsx.readFile('EventInfo.xlsx').then(function () {
    let append = 0
    if (fs.existsSync('backups/Pre' + backupFileName + '.xlsx')) append++
    while (fs.existsSync('backups/Pre' + backupFileName + '-' + append + '.xlsx')) append++
    if (append === 0) return workbook.xlsx.writeFile('backups/Pre' + backupFileName + '.xlsx')
    else return workbook.xlsx.writeFile('backups/Pre' + backupFileName + '-' + append + '.xlsx')
  }).then(function () {
    let statSheet = workbook.getWorksheet('Stats')
    statSheet.eachRow(function (row, rowNumber) {
      if (rowNumber === 1) return
      if (row.getCell('B') === red1Num) {
        if (!parseFloat(row.getCell('J'))) red1LastRank = 0
        else red1LastRank = parseFloat(row.getCell('A'))
      } else if (row.getCell('B') === red2Num) {
        if (!parseFloat(row.getCell('J'))) red2LastRank = 0
        else red2LastRank = parseFloat(row.getCell('A'))
      } else if (row.getCell('B') === red3Num) {
        if (!parseFloat(row.getCell('J'))) red3LastRank = 0
        else red3LastRank = parseFloat(row.getCell('A'))
      } else if (row.getCell('B') === blue1Num) {
        if (!parseFloat(row.getCell('J'))) blue1LastRank = 0
        else blue1LastRank = parseFloat(row.getCell('A'))
      } else if (row.getCell('B') === blue2Num) {
        if (!parseFloat(row.getCell('J'))) blue2LastRank = 0
        else blue2LastRank = parseFloat(row.getCell('A'))
      } else if (row.getCell('B') === blue3Num) {
        if (!parseFloat(row.getCell('J'))) blue3LastRank = 0
        else blue3LastRank = parseFloat(row.getCell('A'))
      }
    })

    const worksheet = workbook.getWorksheet('Matches')
    if (redScore > highestScore) redHighScore = true
    if (blueScore > highestScore) blueHighScore = true
    if (redHighScore && blueHighScore) {
      redHighScore = redScore >= blueScore
      blueHighScore = blueScore >= redScore
    }

    const matchNameCol = worksheet.getColumn('A')
    let matchRow
    matchNameCol.eachCell(function (cell) {
      if (cell.text === currentMatchName) matchRow = worksheet.getRow(cell.row)
    })
    matchRow.getCell('H').value = redScore
    matchRow.getCell('I').value = blueScore
    matchRow.getCell('J').value = redRP
    matchRow.getCell('K').value = blueRP
    matchRow.getCell('L').value = redCargoScore
    matchRow.getCell('M').value = blueCargoScore
    matchRow.getCell('N').value = redHatchScore
    matchRow.getCell('O').value = blueHatchScore
    matchRow.getCell('P').value = redClimbScore
    matchRow.getCell('Q').value = blueClimbScore
    matchRow.getCell('R').value = redAutoScore
    matchRow.getCell('S').value = blueAutoScore
    matchRow.getCell('T').value = foulsByBlue
    matchRow.getCell('U').value = foulsByRed
    matchRow.getCell('V').value = redRocketRP
    matchRow.getCell('W').value = blueRocketRP
    matchRow.getCell('X').value = redClimbRP
    matchRow.getCell('Y').value = blueClimbRP

    var highestScore = 0
    worksheet.getColumn('H').eachCell(function (cell) {
      if (parseFloat(cell.text) > highestScore) highestScore = parseFloat(cell.text)
    })
    worksheet.getColumn('I').eachCell(function (cell) {
      if (parseFloat(cell.text) > highestScore) highestScore = parseFloat(cell.text)
    })

    const teamNumCol = statSheet.getColumn('B')
    let row = 1
    teamNumCol.eachCell(function (teamNumCell) {
      if (row === 1) {
        row++
        return
      }
      let matchesPlayed = 0
      let wins = 0
      let losses = 0
      let ties = 0
      let rankingPoints = 0
      let cargoPoints = 0
      let hatchPoints = 0
      let climbPoints = 0
      let autoPoints = 0
      let rocketRP = 0
      let climbRP = 0
      for (let i = 2; i <= 4; i++) {
        worksheet.getColumn(i).eachCell(function (matchTeamCell) {
          if (matchTeamCell.text !== teamNumCell.text) return
          if (!isNaN(parseFloat(worksheet.getRow(matchTeamCell.row).getCell('I'))) && !isNaN(parseFloat(worksheet.getRow(matchTeamCell.row).getCell('H')))) {
            matchesPlayed++
            if (parseFloat(worksheet.getRow(matchTeamCell.row).getCell('H')) > parseFloat(worksheet.getRow(matchTeamCell.row).getCell('I'))) wins++
            else if (parseFloat(worksheet.getRow(matchTeamCell.row).getCell('H')) < parseFloat(worksheet.getRow(matchTeamCell.row).getCell('I'))) losses++
            else ties++
            rankingPoints += parseFloat(worksheet.getRow(matchTeamCell.row).getCell('J')) || 0
            cargoPoints += parseFloat(worksheet.getRow(matchTeamCell.row).getCell('L')) || 0
            hatchPoints += parseFloat(worksheet.getRow(matchTeamCell.row).getCell('N')) || 0
            climbPoints += parseFloat(worksheet.getRow(matchTeamCell.row).getCell('P')) || 0
            autoPoints += parseFloat(worksheet.getRow(matchTeamCell.row).getCell('R')) || 0
            rocketRP += parseFloat(worksheet.getRow(matchTeamCell.row).getCell('V')) || 0
            climbRP += parseFloat(worksheet.getRow(matchTeamCell.row).getCell('X')) || 0
          }
        })
      }
      for (let i = 5; i <= 7; i++) {
        worksheet.getColumn(i).eachCell(function (matchTeamCell) {
          if (matchTeamCell.text !== teamNumCell.text) return
          if (!isNaN(parseFloat(worksheet.getRow(matchTeamCell.row).getCell('I'))) && !isNaN(parseFloat(worksheet.getRow(matchTeamCell.row).getCell('H')))) {
            if (parseFloat(worksheet.getRow(matchTeamCell.row).getCell('I')) > parseFloat(worksheet.getRow(matchTeamCell.row).getCell('H'))) wins++
            else if (parseFloat(worksheet.getRow(matchTeamCell.row).getCell('I')) < parseFloat(worksheet.getRow(matchTeamCell.row).getCell('H'))) losses++
            else ties++
            matchesPlayed++
            rankingPoints += parseFloat(worksheet.getRow(matchTeamCell.row).getCell('K').value) || 0
            cargoPoints += parseFloat(worksheet.getRow(matchTeamCell.row).getCell('M').value) || 0
            hatchPoints += parseFloat(worksheet.getRow(matchTeamCell.row).getCell('O').value) || 0
            climbPoints += parseFloat(worksheet.getRow(matchTeamCell.row).getCell('Q').value) || 0
            autoPoints += parseFloat(worksheet.getRow(matchTeamCell.row).getCell('S').value) || 0
            rocketRP += parseFloat(worksheet.getRow(matchTeamCell.row).getCell('W').value) || 0
            climbRP += parseFloat(worksheet.getRow(matchTeamCell.row).getCell('Y').value) || 0
          }
        })
      }
      statSheet.getRow(teamNumCell.row).getCell('D').value = (rankingPoints / matchesPlayed) || 0
      statSheet.getRow(teamNumCell.row).getCell('E').value = cargoPoints
      statSheet.getRow(teamNumCell.row).getCell('F').value = hatchPoints
      statSheet.getRow(teamNumCell.row).getCell('G').value = climbPoints
      statSheet.getRow(teamNumCell.row).getCell('H').value = autoPoints
      statSheet.getRow(teamNumCell.row).getCell('I').value = wins + '-' + losses + '-' + ties
      statSheet.getRow(teamNumCell.row).getCell('J').value = matchesPlayed
      statSheet.getRow(teamNumCell.row).getCell('K').value = rankingPoints
      statSheet.getRow(teamNumCell.row).getCell('L').value = rocketRP
      statSheet.getRow(teamNumCell.row).getCell('M').value = climbRP
    })

    statSheet = workbook.getWorksheet('Stats')
    const sortFunction = (a, b) => {
      if (a[3] === b[3]) {
        if (a[4] === b[4]) {
          if (a[5] === b[5]) {
            if (a[6] === b[6]) {
              if (a[7] === b[7]) {
                return 0
              } else return (a[7] > b[7]) ? -1 : 1
            } else return (a[6] > b[6]) ? -1 : 1
          } else return (a[5] > b[5]) ? -1 : 1
        } else return (a[4] > b[4]) ? -1 : 1
      } else return (a[3] > b[3]) ? -1 : 1
    }
    const rows = []
    for (let i = 2; i <= statSheet.actualRowCount; i++) {
      const row = []
      for (let j = 1; j <= statSheet.columnCount; j++) {
        row.push(statSheet.getRow(i).getCell(j).value)
      }
      rows.push(row)
    }
    rows.sort(sortFunction)
    rank = 0
    rows.forEach(element => {
      element[0] = ++rank
    })
    for (let i = rows.length; i >= 0; i--) {
      statSheet.spliceRows(i + 2, 1, rows[i])
    }
    statSheet.eachRow(function (row, rowNumber) {
      if (rowNumber === 1) return
      row.eachCell(function (cell, colNumber) {
        if (rowNumber % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD0CECE' }
          }
        }
        if (colNumber !== 3) cell.alignment = { horizontal: 'center' }
      })
    })

    return workbook.xlsx.writeFile('EventInfo.xlsx')
  }).catch(error =>
    alert('Could not publish match data. ' + error.message)
  ).then(function () {
    return workbook.xlsx.readFile('EventInfo.xlsx')
  }).then(function () {
    const statSheet = workbook.getWorksheet('Stats')
    statSheet.eachRow(function (row, rowNumber) {
      if (rowNumber === 1) return
      if (row.getCell('B') === red1Num) {
        if (parseFloat(row.getCell('J')) === 0) red1NewRank = 0
        else red1NewRank = parseFloat(row.getCell('A'))
      } else if (row.getCell('B') === red2Num) {
        if (parseFloat(row.getCell('J')) === 0) red2NewRank = 0
        else red2NewRank = parseFloat(row.getCell('A'))
      } else if (row.getCell('B') === red3Num) {
        if (parseFloat(row.getCell('J')) === 0) red3NewRank = 0
        else red3NewRank = parseFloat(row.getCell('A'))
      } else if (row.getCell('B') === blue1Num) {
        if (parseFloat(row.getCell('J')) === 0) blue1NewRank = 0
        else blue1NewRank = parseFloat(row.getCell('A'))
      } else if (row.getCell('B') === blue2Num) {
        if (parseFloat(row.getCell('J')) === 0) blue2NewRank = 0
        else blue2NewRank = parseFloat(row.getCell('A'))
      } else if (row.getCell('B') === blue3Num) {
        if (parseFloat(row.getCell('J')) === 0) blue3NewRank = 0
        else blue3NewRank = parseFloat(row.getCell('A'))
      }
    })
    let append = 0
    if (fs.existsSync('backups/Post' + backupFileName + '.xlsx')) append++
    while (fs.existsSync('backups/Post' + backupFileName + '-' + append + '.xlsx')) append++
    if (append === 0) return workbook.xlsx.writeFile('backups/Post' + backupFileName + '.xlsx')
    else return workbook.xlsx.writeFile('backups/Post' + backupFileName + '-' + append + '.xlsx')
  })
}

function updateCargoHatch (id, del) {
  if (del) {
    if ((inMatch || postMatch) && !nullHatchModPressed) {
      if (document.getElementById(id.replace('hatch', 'cargo')).className === 'cargo') document.getElementById(id.replace('hatch', 'cargo')).className = 'no-cargo'
      else if (document.getElementById(id).className === 'hatch') document.getElementById(id).className = 'no-hatch'
    } else {
      if (document.getElementById(id).className === 'null-hatch') document.getElementById(id).className = 'no-hatch'
    }
  } else {
    if ((inMatch || postMatch) && !nullHatchModPressed) {
      if (document.getElementById(id).className === 'no-hatch') document.getElementById(id).className = 'hatch'
      else if (document.getElementById(id.replace('hatch', 'cargo')).className === 'no-cargo') document.getElementById(id.replace('hatch', 'cargo')).className = 'cargo'
    } else {
      if (document.getElementById(id).className === 'no-hatch') document.getElementById(id).className = 'null-hatch'
    }
  }
}

function updateHab (height, red) {
  let className
  if (crossModPressed) {
    if (timer > 100) {
      if (red) className = 'hab-climb-red'
      else className = 'hab-climb-blue'
    } else {
      if (red) className = 'hab-dismount-red'
      else className = 'hab-dismount-blue'
    }
  } else {
    if (timer > 100) {
      if (red) className = 'hab-dismount-red'
      else className = 'hab-dismount-blue'
    } else {
      if (red) className = 'hab-climb-red'
      else className = 'hab-climb-blue'
    }
  }
  for (let i = 0; i < document.getElementsByClassName(className).length; i++) {
    if (!climbDelPressed && window.getComputedStyle(document.getElementsByClassName(className)[i]).height === '0px') {
      document.getElementsByClassName(className)[i].style.height = height
      return
    } else if (climbDelPressed && window.getComputedStyle(document.getElementsByClassName(className)[i]).height === height) {
      document.getElementsByClassName(className)[i].style.height = '0px'
      return
    }
  }
}
