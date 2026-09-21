// The CMS publishes /collections/:slug; there is no collections overview.
export default function handler(_req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.status(404).send('<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | NorthSide GTA</title></head><body><main><h1>Page not found</h1><p>Explore our communities or contact Matthew and Landon for help finding a home.</p><a href="/communities">Explore communities</a> · <a href="/contact">Contact us</a></main></body></html>')
}
