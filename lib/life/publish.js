import { put } from '@vercel/blob'
import { destinationReady } from './core.js'
export async function prepareImage(d, image, env) {
  if (d.imageUrl) return d.imageUrl
  if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(image || ''))
    throw new Error('The designed image is missing. Review the preview again.')
  const bytes = Buffer.from(image.split(',')[1], 'base64')
  if (bytes.length > 1800000 || bytes[0] !== 255 || bytes[1] !== 216)
    throw new Error('The designed image is too large or invalid.')
  if (env.LIFE_LOCAL_DEV === '1' && !env.VERCEL) {
    d.localPublishedImage = image
    return `/api/life?action=image&id=${d.id}`
  }
  if (!env.BLOB_READ_WRITE_TOKEN)
    throw new Error('Photo publishing storage is not connected yet.')
  const result = await put(`northside-life/${d.id}.jpg`, bytes, {
    access: 'public',
    contentType: 'image/jpeg',
    addRandomSuffix: true,
    token: env.BLOB_READ_WRITE_TOKEN,
  })
  return result.url
}
async function graph(path, token, env, body) {
  const response = await fetch(
    `https://graph.facebook.com/${env.LIFE_META_GRAPH_VERSION}/${path}`,
    {
      method: body ? 'POST' : 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body
          ? { 'Content-Type': 'application/x-www-form-urlencoded' }
          : {}),
      },
      body: body ? new URLSearchParams(body) : undefined,
      signal: AbortSignal.timeout(8000),
    }
  )
  const data = await response.json()
  if (!response.ok || data.error)
    throw new Error(
      'Meta did not confirm this post. Check the account before retrying.'
    )
  return data
}
export async function publishDestination(d, destination, env, persist) {
  if (!destinationReady(destination, env))
    throw new Error('This destination is not connected yet.')
  const id = destination.id
  if (d.results?.[id]) return d.results[id] // Never blindly retry a possibly successful external mutation.
  if (id === 'website') {
    d.results[id] = {
      status: 'published',
      at: new Date().toISOString(),
      url: `/life/posts/${d.id}`,
    }
    await persist()
    return d.results[id]
  }
  const token = env[`${destination.prefix}_PAGE_ACCESS_TOKEN`]
  let container
  if (destination.kind === 'Instagram') {
    const account = env[`${destination.prefix}_IG_USER_ID`]
    container = (
      await graph(`${account}/media`, token, env, {
        image_url: d.imageUrl,
        caption: d.instagram,
        alt_text: d.alt,
      })
    ).id
    if (!container) throw new Error('Instagram could not prepare the photo.')
    let state
    for (let attempt = 0; attempt < 5; attempt++) {
      state = await graph(`${container}?fields=status_code`, token, env)
      if (state.status_code === 'FINISHED' || state.status_code === 'ERROR')
        break
      await new Promise((resolve) => setTimeout(resolve, 800))
    }
    if (state.status_code !== 'FINISHED')
      throw new Error(
        'Instagram is still preparing the image. Try again shortly.'
      )
  }
  d.results[id] = {
    status: 'needs_review',
    at: new Date().toISOString(),
    message:
      'Publishing started. If confirmation is interrupted, check the account before retrying.',
  }
  await persist()
  try {
    let result
    if (destination.kind === 'Instagram')
      result = await graph(
        `${env[`${destination.prefix}_IG_USER_ID`]}/media_publish`,
        token,
        env,
        { creation_id: container }
      )
    else
      result = await graph(
        `${env[`${destination.prefix}_PAGE_ID`]}/photos`,
        token,
        env,
        { url: d.imageUrl, caption: d.facebook, published: 'true' }
      )
    if (!result.id) throw new Error('Missing post confirmation')
    d.results[id] = {
      status: 'published',
      at: new Date().toISOString(),
      externalId: result.post_id || result.id,
    }
    await persist()
  } catch {
    d.results[id].message =
      'Confirmation was interrupted. Check this account manually; automatic retry is paused to prevent duplicates.'
    await persist()
  }
  return d.results[id]
}
