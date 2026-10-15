// Sales site behaviour: videos that play only while on screen, the tour
// button, and the demo-request form (form service, or the visitor's e-mail app).
(() => {
  const cfg = window.CADERNINHO || {}
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Contact address and year
  document.querySelectorAll('[data-contact-email]').forEach((el) => { if (cfg.email) el.textContent = cfg.email })
  document.querySelectorAll('.contact-email').forEach((a) => { if (cfg.email) a.href = `mailto:${cfg.email}` })
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()) })

  // Showcase videos: play while visible (muted loops), pause off screen. With
  // reduced motion they stay on their poster and play on a tap.
  const videos = [...document.querySelectorAll('video.autoplay')]
  if (reduceMotion) {
    videos.forEach((v) => { v.controls = true })
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) target.play().catch(() => { target.controls = true })
        else target.pause()
      })
    }, { threshold: 0.35 })
    videos.forEach((v) => io.observe(v))
  }

  // "Watch the tour": scroll to the video and start it
  const tour = document.getElementById('tour-video')
  document.getElementById('play-tour-hero')?.addEventListener('click', () => {
    tour?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
    tour?.play().catch(() => {})
  })

  // Demo request
  const form = document.getElementById('demo-form')
  const status = document.getElementById('form-status')
  const submit = document.getElementById('f-submit')
  if (!form) return
  const say = (text, state = '') => { status.textContent = text; status.dataset.state = state }

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    // Required fields, with a plain message for the first one missing
    const required = [...form.querySelectorAll('[required]')]
    required.forEach((el) => el.removeAttribute('aria-invalid'))
    const missing = required.find((el) => !el.value.trim() || (el.type === 'email' && !el.checkValidity()))
    if (missing) {
      missing.setAttribute('aria-invalid', 'true')
      missing.focus()
      const label = form.querySelector(`label[for="${missing.id}"]`)?.textContent.trim() || 'this field'
      say(missing.type === 'email' && missing.value.trim() ? 'Please check the e-mail address.' : `Please fill in ${label.toLowerCase()}.`, 'error')
      return
    }
    const data = Object.fromEntries(new FormData(form))

    if (cfg.formEndpoint) {
      submit.disabled = true
      say('Sending…')
      try {
        const res = await fetch(cfg.formEndpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
        if (!res.ok) throw new Error(String(res.status))
        form.reset()
        say('Thank you. We’ll be in touch within one working day.', 'ok')
      } catch {
        say(`It didn’t go through. Please try again, or write to ${cfg.email}.`, 'error')
      } finally {
        submit.disabled = false
      }
      return
    }

    // No form service yet: the visitor's e-mail app opens with the request written
    const body = [
      `Name: ${data.name}`, `Shop: ${data.shop}`, `E-mail: ${data.email}`,
      `WhatsApp: ${data.whatsapp || '-'}`, `Reply by: ${data.reply_by}`, `Language: ${data.language}`, '', data.message || '',
    ].join('\n')
    window.location.href = `mailto:${cfg.email}?subject=${encodeURIComponent(`Demo request: ${data.shop}`)}&body=${encodeURIComponent(body)}`
    say(`Your e-mail app should open with the request ready to send. If it doesn’t, write to ${cfg.email}.`)
  })
})()
