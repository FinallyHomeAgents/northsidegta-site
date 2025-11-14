CMS.registerEventListener({
  name: 'smart-fill-restaurants',
  handler: async ({ entry, loadEntry, updateEntry }) => {
    const town = entry.getIn(['data', 'town']);
    const category = entry.getIn(['data', 'category']);
    const items = entry.getIn(['data', 'ballot_items']) || [];

    if (!town || !category) {
      alert("Please select both Town and Category before running Smart Fill.");
      return;
    }

    const action = confirm("Smart Fill Restaurants:\n\nClick OK to OVERWRITE all items.\nClick Cancel to APPEND to existing items.");
    const overwrite = action === true;

    const res = await fetch(`/api/tastehub/generate-ballot?town=${encodeURIComponent(town)}&category=${encodeURIComponent(category)}`);
    const data = await res.json();

    if (!Array.isArray(data)) {
      alert("Smart Fill failed. Please check the API route.");
      return;
    }

    const newItems = overwrite ? data : items.concat(data);

    updateEntry(entry.get('collection'), entry.get('slug'), {
      data: entry.get('data').set('ballot_items', newItems)
    });

    alert("Smart Fill complete! Review items and save the poll.");
  }
});
