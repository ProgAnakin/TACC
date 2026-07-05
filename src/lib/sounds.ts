export type SoundType = 'bell' | 'chime' | 'triple' | 'silent'

export const SOUNDS: { type: SoundType; label: string; emoji: string }[] = [
  { type: 'bell',   label: 'Bell',   emoji: '🔔' },
  { type: 'chime',  label: 'Chime',  emoji: '🎵' },
  { type: 'triple', label: 'Beep',   emoji: '📳' },
  { type: 'silent', label: 'Silent', emoji: '🔕' },
]

function ctx(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  } catch {
    return null
  }
}

export function playSound(type: SoundType): void {
  if (type === 'silent') return
  const ac = ctx()
  if (!ac) return

  const master = ac.createGain()
  master.connect(ac.destination)

  if (type === 'bell') {
    const osc = ac.createOscillator()
    osc.connect(master)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ac.currentTime)
    osc.frequency.exponentialRampToValueAtTime(440, ac.currentTime + 1.2)
    master.gain.setValueAtTime(0.35, ac.currentTime)
    master.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 1.6)
    osc.start(ac.currentTime)
    osc.stop(ac.currentTime + 1.6)

  } else if (type === 'chime') {
    // C5 → E5 → G5 ascending arpeggio
    [523, 659, 784].forEach((freq, i) => {
      const osc  = ac.createOscillator()
      const gain = ac.createGain()
      osc.connect(gain)
      gain.connect(master)
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = ac.currentTime + i * 0.16
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.28, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55)
      osc.start(t)
      osc.stop(t + 0.55)
    })

  } else if (type === 'triple') {
    [0, 0.18, 0.36].forEach((delay) => {
      const osc  = ac.createOscillator()
      const gain = ac.createGain()
      osc.connect(gain)
      gain.connect(master)
      osc.type = 'square'
      osc.frequency.value = 880
      const t = ac.currentTime + delay
      gain.gain.setValueAtTime(0.12, t)
      gain.gain.setValueAtTime(0, t + 0.08)
      osc.start(t)
      osc.stop(t + 0.1)
    })
  }
}

export function getSoundPreference(): SoundType {
  const v = localStorage.getItem('reminder-sound') as SoundType | null
  return v && SOUNDS.some((s) => s.type === v) ? v : 'bell'
}

export function setSoundPreference(type: SoundType): void {
  localStorage.setItem('reminder-sound', type)
}
