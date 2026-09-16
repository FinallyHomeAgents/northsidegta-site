document
  .getElementById('community-filter')
  ?.addEventListener('change', (event) => {
    for (const card of document.querySelectorAll('[data-community]'))
      card.hidden = Boolean(
        event.target.value && card.dataset.community !== event.target.value
      )
  })
