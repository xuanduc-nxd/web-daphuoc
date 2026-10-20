(() => {
  "use strict";
  const toast = (message) => {
    const element = document.getElementById("ui-toast");
    if (!element) return;
    element.textContent = message;
    element.hidden = false;
    clearTimeout(element.hideTimer);
    element.hideTimer = setTimeout(() => {
      element.hidden = true;
    }, 3500);
  };
  const normalize = (value) =>
    String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLocaleLowerCase("vi")
      .trim();
  const menu = document.getElementById("mobileMenu");
  const toggle = document.getElementById("menuToggle");
  const backdrop = document.querySelector("[data-menu-backdrop]");
  const mobile = window.matchMedia("(max-width: 1099px)");
  const setMenu = (open) => {
    if (!menu || !toggle) return;
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
    toggle.innerHTML =
      '<i class="ph ph-' + (open ? "x" : "list") + '" aria-hidden="true"></i>';
    document.body.classList.toggle("menu-open", open);
    if (backdrop) backdrop.hidden = !open;
  };
  toggle?.addEventListener("click", () =>
    setMenu(toggle.getAttribute("aria-expanded") !== "true"),
  );
  backdrop?.addEventListener("click", () => {
    setMenu(false);
    toggle?.focus();
  });
  mobile.addEventListener("change", () => setMenu(false));
  document.querySelectorAll(".submenu-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const submenu = document.getElementById(
        button.getAttribute("aria-controls"),
      );
      const open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      if (submenu) submenu.hidden = !open;
    });
  });
  document.querySelectorAll(".has-submenu").forEach((item) => {
    const button = item.querySelector(".submenu-toggle");
    const submenu = item.querySelector(".nav-submenu");
    item.addEventListener("pointerenter", () => {
      if (!mobile.matches) {
        submenu.hidden = false;
        button.setAttribute("aria-expanded", "true");
      }
    });
    item.addEventListener("pointerleave", () => {
      if (!mobile.matches && !item.contains(document.activeElement)) {
        submenu.hidden = true;
        button.setAttribute("aria-expanded", "false");
      }
    });
    item.addEventListener("focusout", (event) => {
      if (!item.contains(event.relatedTarget)) {
        submenu.hidden = true;
        button.setAttribute("aria-expanded", "false");
      }
    });
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".has-submenu")) {
      document.querySelectorAll(".submenu-toggle").forEach((button) => {
        button.setAttribute("aria-expanded", "false");
        const submenu = document.getElementById(
          button.getAttribute("aria-controls"),
        );
        if (submenu) submenu.hidden = true;
      });
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document
        .querySelectorAll('.submenu-toggle[aria-expanded="true"]')
        .forEach((button) => {
          button.setAttribute("aria-expanded", "false");
          document.getElementById(button.getAttribute("aria-controls")).hidden =
            true;
          button.focus();
        });
      if (toggle?.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    }
    if (
      event.key === "Tab" &&
      mobile.matches &&
      toggle?.getAttribute("aria-expanded") === "true"
    ) {
      const elements = [toggle, ...menu.querySelectorAll("a,button")].filter(
        (el) => el.getClientRects().length,
      );
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        elements[1]?.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  document.querySelectorAll("img[data-fallback]").forEach((img) => {
    const fallback = () => {
      if (img.dataset.fallbackUsed) return;
      img.dataset.fallbackUsed = "true";
      img.removeAttribute("srcset");
      img.removeAttribute("sizes");
      img.src = img.dataset.fallback;
    };
    img.addEventListener("error", fallback);
    if (img.complete && img.naturalWidth === 0) fallback();
  });
  document.querySelectorAll("[data-collection]").forEach((collection) => {
    const items = [...collection.querySelectorAll("[data-filter-item]")];
    if (!items.length) return;
    const input = collection.querySelector("[data-search-input]");
    const category = collection.querySelector("[data-category-filter]");
    const year = collection.querySelector("[data-year-filter]");
    const sort = collection.querySelector("[data-sort-input]");
    const count = collection.querySelector("[data-result-count]");
    const empty = collection.querySelector("[data-filter-empty]");
    const pagination = collection.querySelector("[data-pagination]");
    const pageSize = Number(collection.dataset.pageSize || 6);
    let currentPage = 1;
    const restore = () => {
      const query = new URL(location.href).searchParams;
      if (input) input.value = query.get("q") || "";
      if (category) category.value = query.get("category") || "";
      if (year) year.value = query.get("year") || "";
      if (sort) sort.value = query.get("sort") || "newest";
      currentPage = Math.max(1, Number(query.get("page")) || 1);
    };
    const save = () => {
      const url = new URL(location.href);
      for (const [key, value] of [
        ["q", input?.value.trim()],
        ["category", category?.value],
        ["year", year?.value],
        ["sort", sort?.value === "newest" ? "" : sort?.value],
        ["page", currentPage > 1 ? currentPage : ""],
      ]) {
        if (value) url.searchParams.set(key, value);
        else url.searchParams.delete(key);
      }
      history.replaceState(null, "", url);
    };
    const render = (persist = true) => {
      const words = normalize(input?.value || "")
        .split(/\s+/)
        .filter(Boolean);
      const filtered = items.filter(
        (item) =>
          words.every((word) =>
            normalize(item.dataset.search || item.textContent).includes(word),
          ) &&
          (!category?.value || item.dataset.category === category.value) &&
          (!year?.value || item.dataset.year === year.value),
      );
      filtered.sort((a, b) =>
        sort?.value === "az"
          ? (a.dataset.search || a.textContent).localeCompare(
              b.dataset.search || b.textContent,
              "vi",
            )
          : sort?.value === "oldest"
            ? Number(a.dataset.date || 0) - Number(b.dataset.date || 0)
            : Number(b.dataset.date || 0) - Number(a.dataset.date || 0),
      );
      const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
      currentPage = Math.min(currentPage, pages);
      items.forEach((item) => {
        item.hidden = true;
      });
      filtered.forEach((item, index) => {
        item.parentElement.appendChild(item);
        item.hidden =
          index < (currentPage - 1) * pageSize ||
          index >= currentPage * pageSize;
      });
      if (count)
        count.textContent =
          filtered.length +
          " " +
          (collection.dataset.resultLabel || "bài viết");
      if (empty) empty.hidden = filtered.length > 0;
      const active = Boolean(
        input?.value ||
        category?.value ||
        year?.value ||
        (sort && sort.value !== "newest"),
      );
      collection.querySelectorAll("[data-reset-filters]").forEach((button) => {
        if (button.closest(".collection-summary")) button.hidden = !active;
      });
      if (pagination) {
        pagination.replaceChildren();
        pagination.hidden = pages < 2;
        if (pages > 1) {
          const addButton = (label, page, disabled, selected = false) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = label;
            button.disabled = disabled;
            button.setAttribute(
              "aria-label",
              /^\d+$/.test(label) ? "Trang " + label : label,
            );
            if (selected) button.setAttribute("aria-current", "page");
            button.addEventListener("click", () => {
              currentPage = page;
              render();
              collection.scrollIntoView({
                behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "instant"
                  : "smooth",
                block: "start",
              });
              collection
                .querySelector("[data-filter-item]:not([hidden]) a")
                ?.focus({ preventScroll: true });
            });
            pagination.appendChild(button);
          };
          addButton("Trước", currentPage - 1, currentPage === 1);
          for (let page = 1; page <= pages; page++) {
            if (
              page === 1 ||
              page === pages ||
              Math.abs(page - currentPage) <= 1
            )
              addButton(String(page), page, false, page === currentPage);
            else if (page === currentPage - 2 || page === currentPage + 2) {
              const gap = document.createElement("span");
              gap.textContent = "…";
              pagination.appendChild(gap);
            }
          }
          addButton("Sau", currentPage + 1, currentPage === pages);
        }
      }
      if (persist) save();
    };
    [input, category, year, sort].filter(Boolean).forEach((control) =>
      control.addEventListener(control === input ? "input" : "change", () => {
        currentPage = 1;
        render();
      }),
    );
    collection.querySelectorAll("[data-reset-filters]").forEach((button) =>
      button.addEventListener("click", () => {
        if (input) input.value = "";
        if (category) category.value = "";
        if (year) year.value = "";
        if (sort) sort.value = "newest";
        currentPage = 1;
        render();
        input?.focus();
      }),
    );
    restore();
    render(false);
    window.addEventListener("popstate", () => {
      restore();
      render(false);
    });
  });
  const imageDialog = document.getElementById("image-dialog");
  document.querySelectorAll("[data-lightbox]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!imageDialog) return;
      const source = button.querySelector("img");
      const img = document.getElementById("image-dialog-image");
      img.src = button.dataset.lightbox || source?.currentSrc;
      img.alt = source?.alt || "Ảnh hoạt động";
      document.getElementById("image-dialog-caption").textContent = img.alt;
      imageDialog.showModal();
    });
  });
  document
    .querySelectorAll("[data-close-dialog]")
    .forEach((button) =>
      button.addEventListener("click", () => button.closest("dialog").close()),
    );
  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close();
    });
  });
  document
    .querySelectorAll("[data-share], [data-copy-link]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          if (button.hasAttribute("data-share") && navigator.share) {
            await navigator.share({
              title: document.title,
              url: location.href,
            });
            return;
          }
          if (navigator.clipboard?.writeText)
            await navigator.clipboard.writeText(location.href);
          else {
            const input = document.createElement("textarea");
            input.value = location.href;
            input.style.position = "fixed";
            input.style.opacity = "0";
            document.body.appendChild(input);
            input.select();
            const copied = document.execCommand("copy");
            input.remove();
            if (!copied) throw new Error("copy");
          }
          toast("Đã sao chép liên kết bài viết");
        } catch (error) {
          if (error.name !== "AbortError")
            toast(
              "Chưa sao chép được. Bạn có thể sao chép địa chỉ trên trình duyệt.",
            );
        }
      });
    });
  document.querySelectorAll("[data-support-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll("[data-support-choice]")
        .forEach((choice) =>
          choice.setAttribute("aria-pressed", String(choice === button)),
        );
      document.querySelectorAll("[data-support-panel]").forEach((panel) => {
        panel.hidden =
          panel.dataset.supportPanel !== button.dataset.supportChoice;
      });
    });
  });
})();
