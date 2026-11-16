(() => {
  "use strict";

  const DATA_URL = "data/destinations.json";
  let destinationCache = null;

  async function loadDestinations() {
    if (destinationCache) return destinationCache;
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`資料載入失敗（${response.status}）`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("目的地資料格式不正確");
    destinationCache = data;
    return data;
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function setImageFallback(image, city) {
    image.classList.add("image-fallback");
    image.removeAttribute("src");
    image.removeAttribute("srcset");
    image.alt = `${city}圖片暫時無法載入`;
    image.style.background = "linear-gradient(145deg, #d9c9ad, #244d40)";
  }

  function createDestinationCard(destination, index, compact = false) {
    const article = createElement("article", "destination-card");
    const link = createElement("a", "card-link");
    link.href = `destination.html?id=${encodeURIComponent(destination.id)}`;
    link.setAttribute("aria-label", `查看${destination.city}旅行指南`);

    const imageWrap = createElement("div", "card-image-wrap");
    const image = createElement("img", "card-image");
    image.src = destination.heroImage;
    image.alt = destination.imageAlt;
    image.loading = index > 1 || compact ? "lazy" : "eager";
    image.decoding = "async";
    image.addEventListener("error", () => setImageFallback(image, destination.city), { once: true });
    imageWrap.append(
      image,
      createElement("span", "card-number", String(index + 1).padStart(2, "0")),
      createElement("span", "card-theme", destination.theme)
    );

    const content = createElement("div", "card-content");
    const text = createElement("div");
    text.append(createElement("span", "card-kicker", `${destination.region} · ${destination.recommendedDays}`));
    const title = createElement("h3", "", destination.city);
    title.append(createElement("small", "", destination.cityEn));
    text.append(title, createElement("p", "", destination.tagline));
    content.append(text, createElement("span", "card-arrow", "↗"));
    link.append(imageWrap, content);
    article.append(link);
    return article;
  }

  function formatDate(dateValue) {
    const [year, month, day] = dateValue.split("-").map(Number);
    if (!year || !month || !day) return dateValue;
    return new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(new Date(Date.UTC(year, month - 1, day)));
  }

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  window.TripNest = {
    loadDestinations,
    createDestinationCard,
    createElement,
    formatDate
  };
})();
