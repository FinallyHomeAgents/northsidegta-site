export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = () =>
      reject(
        new Error(
          'This photo could not be opened. Try exporting it as JPEG from Photos.'
        )
      )
    i.src = src
  })
}
export async function compressPhoto(file) {
  if (file.size > 30 * 1024 * 1024)
    throw new Error('Choose a photo under 30 MB.')
  if (!file.type.startsWith('image/') && !/\.(heic|heif)$/i.test(file.name))
    throw new Error(
      'This first version supports photos. Video editing is coming next.'
    )
  const url = URL.createObjectURL(file)
  try {
    const image = await loadImage(url)
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height))
    const c = document.createElement('canvas')
    c.width = Math.round(image.width * scale)
    c.height = Math.round(image.height * scale)
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.drawImage(image, 0, 0, c.width, c.height)
    let result = c.toDataURL('image/jpeg', 0.84)
    if (result.length > 2300000) result = c.toDataURL('image/jpeg', 0.65)
    return result
  } finally {
    URL.revokeObjectURL(url)
  }
}
function cover(ctx, image, x, y, w, h) {
  const scale = Math.max(w / image.width, h / image.height)
  ctx.drawImage(
    image,
    x + (w - image.width * scale) / 2,
    y + (h - image.height * scale) / 2,
    image.width * scale,
    image.height * scale
  )
}
function lines(ctx, text, max) {
  const words = text.split(/\s+/)
  const out = []
  let line = ''
  for (const word of words) {
    if (ctx.measureText(line + ' ' + word).width > max && line) {
      out.push(line)
      line = word
    } else line += (line ? ' ' : '') + word
  }
  if (line) out.push(line)
  return out
}
export async function renderPhoto(canvas, d) {
  const image = await loadImage(d.photo)
  canvas.width = 1080
  canvas.height = 1350
  const ctx = canvas.getContext('2d')
  const ivory = '#f6f5ef',
    green = '#173f35'
  ctx.fillStyle = ivory
  ctx.fillRect(0, 0, 1080, 1350)
  if (d.layout === 'postcard') {
    cover(ctx, image, 40, 40, 1000, 850)
    ctx.fillStyle = green
    ctx.font = '500 26px Arial'
    ctx.fillText(d.community.toUpperCase(), 64, 948)
    ctx.font = '54px Georgia'
    lines(ctx, d.title, 950)
      .slice(0, 3)
      .forEach((line, i) => ctx.fillText(line, 64, 1023 + i * 62))
    ctx.font = '26px Arial'
    ctx.fillText('NORTHSIDE GTA LIFE', 64, 1260)
  } else {
    cover(ctx, image, 0, 0, 1080, 1350)
    const g = ctx.createLinearGradient(0, 450, 0, 1350)
    g.addColorStop(0, 'rgba(12,35,28,0)')
    g.addColorStop(0.58, 'rgba(12,35,28,.72)')
    g.addColorStop(1, 'rgba(12,35,28,.98)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 1080, 1350)
    ctx.fillStyle = ivory
    ctx.font = '500 27px Arial'
    ctx.fillText(d.community.toUpperCase(), 64, 835)
    ctx.fillStyle = '#c4a56b'
    ctx.fillRect(64, 865, 74, 5)
    ctx.fillStyle = ivory
    ctx.font = d.layout === 'minimal' ? '600 66px Arial' : '72px Georgia'
    let titleLines = lines(ctx, d.title, 950)
    if (titleLines.length > 3) {
      ctx.font = d.layout === 'minimal' ? '600 54px Arial' : '58px Georgia'
      titleLines = lines(ctx, d.title, 950)
    }
    titleLines
      .slice(0, 3)
      .forEach((line, i) => ctx.fillText(line, 64, 958 + i * 82))
    ctx.font = '30px Georgia'
    ctx.fillText('NorthSide GTA Life', 64, 1240)
  }
  ctx.fillStyle = d.layout === 'postcard' ? green : ivory
  ctx.font = '23px Arial'
  ctx.fillText('Matthew & Landon  ·  Finally Home Agents', 64, 1306)
  return canvas
}
export async function photoBlob(canvas) {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Image export failed.'))),
      'image/jpeg',
      0.9
    )
  )
}
