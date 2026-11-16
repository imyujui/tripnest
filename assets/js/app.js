(() => {
  "use strict";

  const grid = document.querySelector("[data-destination-grid]");
  if (!grid) return;

  const searchInput = document.querySelector("#search-input");
  const sortSelect = document.querySelector("#sort-select");
  const filters = document.querySelector("[data-region-filters]");
  const resultCount = document.querySelector("[data-result-count]");
  const emptyState = document.querySelector("[data-empty-state]");
  const resetButton = document.querySelector("[data-reset-filters]");
  const loadState = document.querySelector("[data-load-state]");
  const totalDestinations = document.querySelector("[data-total-destinations]");
  const latestUpdate = document.querySelector("[data-latest-update]");

  let allDestinations = [];
  let activeRegion = "全部";

  function searchableText(destination) {
    return [
      destination.city,
      destination.cityEn,
      destination.country,
      destination.region,
      destination.theme,
      destination.tagline,
      ...destination.bestFor
    ].join(" ").toLocaleLowerCase("zh-Hant");
  }

  function renderFilters() {
    const regions = ["全部", ...new Set(allDestinations.map((item) => item.region))];
    filters.replaceChildren();
    regions.forEach((region) => {
      const button = TripNest.createElement("button", "filter-chip", region);
      button.type = "button";
      button.setAttribute("aria-pressed", String(region === activeRegion));
      button.addEventListener("click", () => {
        activeRegion = region;
        filters.querySelectorAll("button").forEach((chip) => {
          chip.setAttribute("aria-pressed", String(chip === button));
        });
        renderDestinations();
      });
      filters.append(button);
    });
  }

  function renderDestinations() {
    const query = searchInput.value.trim().toLocaleLowerCase("zh-Hant");
    const sort = sortSelect.value;
    let visible = allDestinations.filter((destination) => {
      const matchesRegion = activeRegion === "全部" || destination.region === activeRegion;
      const matchesSearch = !query || searchableText(destination).includes(query);
      return matchesRegion && matchesSearch;
    });

    if (sort === "city") {
      visible = [...visible].sort((a, b) => a.city.localeCompare(b.city, "zh-Hant"));
    } else if (sort === "updated") {
      visible = [...visible].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }

    grid.replaceChildren(...visible.map((destination, index) => TripNest.createDestinationCard(destination, index)));
    resultCount.textContent = String(visible.length);
    grid.hidden = visible.length === 0;
    emptyState.hidden = visible.length !== 0;
  }

  function resetFilters() {
    searchInput.value = "";
    sortSelect.value = "featured";
    activeRegion = "全部";
    renderFilters();
    renderDestinations();
    searchInput.focus();
  }

  function showLoadError(error) {
    loadState.replaceChildren();
    loadState.append(
      TripNest.createElement("p", "", `目的地資料暫時無法載入：${error.message}`),
      TripNest.createElement("p", "", "請重新整理頁面，或稍後再試。")
    );
    grid.setAttribute("aria-busy", "false");
  }

  searchInput.addEventListener("input", renderDestinations);
  sortSelect.addEventListener("change", renderDestinations);
  resetButton.addEventListener("click", resetFilters);
  document.addEventListener("keydown", (event) => {
    const isTyping = /input|textarea|select/i.test(document.activeElement?.tagName || "");
    if (event.key === "/" && !isTyping) {
      event.preventDefault();
      searchInput.focus();
    }
    if (event.key === "Escape" && document.activeElement === searchInput) {
      searchInput.value = "";
      renderDestinations();
      searchInput.blur();
    }
  });

  TripNest.loadDestinations()
    .then((destinations) => {
      allDestinations = destinations;
      renderFilters();
      renderDestinations();
      totalDestinations.textContent = String(destinations.length).padStart(2, "0");
      const latest = [...destinations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]?.updatedAt;
      latestUpdate.textContent = latest ? TripNest.formatDate(latest) : "—";
      loadState.hidden = true;
      grid.setAttribute("aria-busy", "false");
    })
    .catch(showLoadError);
})();
