(() => {
  "use strict";

  const loading = document.querySelector("[data-detail-loading]");
  const errorState = document.querySelector("[data-detail-error]");
  const content = document.querySelector("[data-detail-content]");
  const params = new URLSearchParams(window.location.search);
  const destinationId = params.get("id");

  const find = (selector) => document.querySelector(selector);
  const setText = (selector, value) => { find(selector).textContent = value; };

  function renderList(containerSelector, items, itemBuilder) {
    const container = find(containerSelector);
    container.replaceChildren(...items.map(itemBuilder));
  }

  function renderDestination(destination, allDestinations) {
    document.title = `${destination.city}旅行指南 — TripNest`;
    const meta = document.querySelector('meta[name="description"]');
    meta.content = `${destination.city}旅行指南：${destination.tagline}。收錄景點、美食、交通與三日路線。`;

    const hero = find("[data-hero-photo]");
    hero.style.backgroundImage = `url("${destination.heroImage.replaceAll('"', "%22")}")`;
    hero.setAttribute("aria-label", destination.imageAlt);
    setText("[data-breadcrumb-city]", destination.city);
    setText("[data-eyebrow]", `${destination.region} · ${destination.theme}`);
    setText("[data-city]", destination.city);
    setText("[data-city-en]", `${destination.cityEn}, ${destination.country}`);
    setText("[data-tagline]", destination.tagline);
    setText("[data-seal-character]", destination.city.slice(0, 1));
    setText("[data-days]", destination.recommendedDays);
    setText("[data-season]", destination.bestSeason);
    setText("[data-pace]", destination.pace);
    setText("[data-description]", destination.description);
    setText("[data-updated-at]", TripNest.formatDate(destination.updatedAt));
    find("[data-updated-at]").dateTime = destination.updatedAt;

    const credit = find("[data-image-credit]");
    credit.href = destination.imageCredit.url;
    credit.querySelector("span").textContent = destination.imageCredit.name;

    renderList("[data-best-for]", destination.bestFor, (label) => TripNest.createElement("span", "mini-tag", label));
    renderList("[data-highlights]", destination.highlights, (highlight, index) => {
      const card = TripNest.createElement("article", "highlight-card");
      card.append(TripNest.createElement("span", "", `${String(index + 1).padStart(2, "0")} · ${highlight.area}`));
      const body = TripNest.createElement("div");
      body.append(TripNest.createElement("h3", "", highlight.name), TripNest.createElement("p", "", highlight.description));
      card.append(body);
      return card;
    });
    renderList("[data-foods]", destination.foods, (food, index) => {
      const item = TripNest.createElement("article", "food-item");
      item.append(
        TripNest.createElement("span", "", String(index + 1).padStart(2, "0")),
        TripNest.createElement("h3", "", food.name),
        TripNest.createElement("p", "", food.note)
      );
      return item;
    });

    const transportEntries = [
      ["ARRIVAL", "如何抵達", destination.transport.arrival],
      ["IN THE CITY", "市內移動", destination.transport.gettingAround],
      ["LOCAL NOTE", "移動提醒", destination.transport.tip]
    ];
    renderList("[data-transport]", transportEntries, ([label, title, text]) => {
      const card = TripNest.createElement("article", "transport-card");
      card.append(
        TripNest.createElement("span", "", label),
        TripNest.createElement("h3", "", title),
        TripNest.createElement("p", "", text)
      );
      return card;
    });

    renderList("[data-itinerary]", destination.itinerary, (day) => {
      const item = TripNest.createElement("li", "itinerary-day");
      item.append(TripNest.createElement("span", "day-label", `DAY ${day.day}`), TripNest.createElement("h3", "", day.title));
      const stops = TripNest.createElement("div", "stop-list");
      day.stops.forEach((stop) => stops.append(TripNest.createElement("span", "", stop)));
      item.append(stops);
      return item;
    });
    renderList("[data-tips]", destination.tips, (tip) => TripNest.createElement("li", "", tip));
    renderList("[data-sources]", destination.sources, (source) => {
      const item = TripNest.createElement("li");
      const link = TripNest.createElement("a", "", `${source.label} ↗`);
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noreferrer noopener";
      item.append(link);
      return item;
    });

    const related = allDestinations
      .filter((item) => item.id !== destination.id)
      .sort((a, b) => Number(b.region === destination.region) - Number(a.region === destination.region))
      .slice(0, 3);
    const relatedContainer = find("[data-related]");
    relatedContainer.replaceChildren(...related.map((item, index) => TripNest.createDestinationCard(item, index, true)));

    loading.hidden = true;
    errorState.hidden = true;
    content.hidden = false;
  }

  function showError(message) {
    loading.hidden = true;
    content.hidden = true;
    errorState.hidden = false;
    setText("[data-error-message]", message);
  }

  if (!destinationId) {
    showError("網址沒有指定目的地，回到旅行庫再選一站吧。");
    return;
  }

  TripNest.loadDestinations()
    .then((destinations) => {
      const destination = destinations.find((item) => item.id === destinationId);
      if (!destination) {
        showError(`找不到「${destinationId}」這個目的地，可能尚未收錄或網址有誤。`);
        return;
      }
      renderDestination(destination, destinations);
    })
    .catch((error) => showError(`城市資料暫時無法載入：${error.message}`));
})();
