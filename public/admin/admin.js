(() => {
  "use strict";
  const sidebar = document.getElementById("admin-sidebar");
  const menuButton = document.querySelector("[data-admin-menu]");
  const backdrop = document.querySelector("[data-admin-backdrop]");
  const setMenu = (open) => {
    sidebar?.classList.toggle("is-open", open);
    menuButton?.setAttribute("aria-expanded", String(open));
    menuButton?.setAttribute(
      "aria-label",
      open ? "Đóng menu quản trị" : "Mở menu quản trị",
    );
    if (backdrop) backdrop.hidden = !open;
    document.body.classList.toggle("menu-open", open);
    if (open) sidebar?.querySelector("[data-admin-close]")?.focus();
  };
  menuButton?.addEventListener("click", () =>
    setMenu(menuButton.getAttribute("aria-expanded") !== "true"),
  );
  backdrop?.addEventListener("click", () => {
    setMenu(false);
    menuButton?.focus();
  });
  document
    .querySelector("[data-admin-close]")
    ?.addEventListener("click", () => {
      setMenu(false);
      menuButton?.focus();
    });
  matchMedia("(min-width: 901px)").addEventListener("change", () =>
    setMenu(false),
  );
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menuButton?.getAttribute("aria-expanded") === "true"
    ) {
      setMenu(false);
      menuButton.focus();
    }
    if (
      event.key === "Tab" &&
      menuButton?.getAttribute("aria-expanded") === "true"
    ) {
      const elements = [...sidebar.querySelectorAll("a,button")].filter(
        (el) => el.getClientRects().length,
      );
      if (!event.shiftKey && document.activeElement === elements[0]) {
        event.preventDefault();
        elements[1]?.focus();
      } else if (event.shiftKey && document.activeElement === elements[0]) {
        event.preventDefault();
        elements.at(-1).focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === elements.at(-1)
      ) {
        event.preventDefault();
        elements[0].focus();
      }
    }
  });
  document
    .querySelector("[data-toggle-password]")
    ?.addEventListener("click", (event) => {
      const button = event.currentTarget;
      const input = document.querySelector('input[name="password"]');
      const visible = input.type === "password";
      input.type = visible ? "text" : "password";
      button.setAttribute("aria-pressed", String(visible));
      button.setAttribute(
        "aria-label",
        visible ? "Ẩn mật khẩu" : "Hiện mật khẩu",
      );
      button.innerHTML =
        '<i class="ph ph-' +
        (visible ? "eye-slash" : "eye") +
        '" aria-hidden="true"></i>';
    });
  const confirmation = document.getElementById("confirm-dialog");
  let pendingForm = null;
  document.querySelectorAll("form[data-confirm]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      if (form.dataset.confirmed === "true") return;
      event.preventDefault();
      pendingForm = form;
      document.getElementById("confirm-message").textContent =
        form.dataset.confirm;
      confirmation.showModal();
      confirmation.querySelector("[data-confirm-cancel]").focus();
    });
  });
  confirmation
    ?.querySelector("[data-confirm-cancel]")
    ?.addEventListener("click", () => confirmation.close());
  confirmation
    ?.querySelector("[data-confirm-accept]")
    ?.addEventListener("click", () => {
      if (!pendingForm) return;
      const form = pendingForm;
      form.dataset.confirmed = "true";
      confirmation.close();
      form.requestSubmit();
    });
  confirmation?.addEventListener("close", () => {
    pendingForm = null;
  });
  const imageUrls = new Map();
  document.querySelectorAll("[data-banner-remove]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const card = checkbox.closest(".settings-slide-row");
      const url = card?.querySelector('input[name$="_slide[]"]');
      const preview = card?.querySelector("[data-image-preview]");
      const empty = card?.querySelector("[data-image-empty]");
      const input = card?.querySelector("[data-image-input]");
      if (url) url.value = checkbox.checked ? "" : url.dataset.original || "";
      if (checkbox.checked && input) { input.value = ""; input.setCustomValidity(""); }
      if (preview) { preview.src = preview.dataset.original || ""; preview.hidden = checkbox.checked; }
      if (empty) empty.hidden = !checkbox.checked;
    });
  });
  document.querySelectorAll("[data-image-input]").forEach((input) => {
    input.addEventListener("change", () => {
      input.setCustomValidity("");
      const card = input.closest(".settings-slide-row, .settings-image-card");
      const preview = input.closest("label")?.querySelector("[data-image-preview]")
        || card?.querySelector("[data-image-preview]")
        || input.closest("form")?.querySelector("[data-image-preview]");
      const empty = card?.querySelector("[data-image-empty]");
      const remove = card?.querySelector("[data-banner-remove]");
      const error = input.closest("label").querySelector("[data-image-error]");
      const file = input.files[0];
      if (error) {
        error.textContent = "";
        error.hidden = true;
      }
      if (!file) {
        if (imageUrls.has(input)) URL.revokeObjectURL(imageUrls.get(input));
        imageUrls.delete(input);
        if (preview && preview.dataset.original) {
          preview.src = preview.dataset.original;
          preview.hidden = false;
        } else if (preview) preview.hidden = true;
        if (empty) empty.hidden = Boolean(preview?.dataset.original);
        return;
      }
      if (
        !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type,
        ) ||
        file.size > 10 * 1024 * 1024
      ) {
        const message = "Chọn ảnh JPG, PNG, WebP hoặc GIF tối đa 10 MB.";
        input.setCustomValidity(message);
        if (error) {
          error.textContent = message;
          error.hidden = false;
        }
        input.reportValidity();
        return;
      }
      if (imageUrls.has(input)) URL.revokeObjectURL(imageUrls.get(input));
      const imageUrl = URL.createObjectURL(file);
      imageUrls.set(input, imageUrl);
      if (remove) { remove.checked = false; const saved = card?.querySelector('input[name$="_slide[]"]'); if (saved) saved.value = saved.dataset.original || ""; }
      if (empty) empty.hidden = true;
      const removeImage = input
        .closest("form")
        .querySelector('[name="remove_image"]');
      if (removeImage) removeImage.checked = false;
      if (preview) {
        preview.src = imageUrl;
        preview.hidden = false;
      }
    });
  });
  document
    .querySelector('[name="remove_image"]')
    ?.addEventListener("change", (event) => {
      const form = event.target.closest("form");
      const preview = form.querySelector("[data-image-preview]");
      const input = form.querySelector("[data-image-input]");
      if (event.target.checked) {
        input.value = "";
        input.setCustomValidity("");
        if (preview) preview.hidden = true;
      } else if (preview?.dataset.original) {
        preview.src = preview.dataset.original;
        preview.hidden = false;
      }
    });
  window.addEventListener("pagehide", () => {
    imageUrls.forEach((url) => URL.revokeObjectURL(url));
  });
  const editor = document.querySelector("[data-post-editor]");
  const preview = document.getElementById("post-preview-dialog");
  if (editor) {
    const kind = editor.elements.namedItem("kind");
    const updateKind = () => {
      const value = kind?.value || "";
      editor.querySelectorAll("[data-kind-section]").forEach((section) => {
        section.hidden = section.dataset.kindSection !== value;
      });
      const singleImage = editor.querySelector("[data-single-image-section]");
      if (singleImage) singleImage.hidden = value === "activity";
    };
    kind?.addEventListener("change", updateKind);
    updateKind();
  }
  document.querySelectorAll("[data-gallery-input]").forEach((galleryInput) => {
    const galleryEditor = galleryInput.closest("form");
    const galleryNew = galleryEditor?.querySelector("[data-gallery-new]");
    const galleryError = galleryEditor?.querySelector("[data-gallery-error]");
    const supportsCover = galleryInput.hasAttribute("data-gallery-cover");
    let galleryUrls = [];
    const clearGalleryPreviews = () => {
      galleryUrls.forEach((url) => URL.revokeObjectURL(url));
      galleryUrls = [];
      galleryNew?.replaceChildren();
    };
    galleryInput?.addEventListener("change", () => {
      clearGalleryPreviews();
      galleryInput.setCustomValidity("");
      if (galleryError) galleryError.hidden = true;
      const files = [...galleryInput.files];
      const kept = [...galleryEditor.querySelectorAll("[data-gallery-item]")].filter(
        (item) => !item.querySelector('[name="gallery_remove[]"]')?.checked,
      ).length;
      if (
        files.length + kept > 20 ||
        files.some(
          (file) =>
            !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type) ||
            file.size > 10 * 1024 * 1024,
        )
      ) {
        const message = "Album tối đa 20 ảnh; mỗi ảnh là JPG, PNG, WebP hoặc GIF không quá 10 MB.";
        galleryInput.setCustomValidity(message);
        if (galleryError) {
          galleryError.textContent = message;
          galleryError.hidden = false;
        }
        galleryInput.reportValidity();
        return;
      }
      files.forEach((file, index) => {
        const url = URL.createObjectURL(file);
        galleryUrls.push(url);
        const item = document.createElement("div");
        item.className = "gallery-edit-item gallery-new-item";
        const img = document.createElement("img");
        img.src = url;
        img.alt = "Ảnh mới " + (index + 1);
        item.append(img);
        if (supportsCover) {
          const label = document.createElement("label");
          label.className = "gallery-choice";
          const radio = document.createElement("input");
          radio.type = "radio";
          radio.name = "gallery_cover";
          radio.value = "new:" + index;
          if (!galleryEditor.querySelector('[name="gallery_cover"]:checked')) radio.checked = true;
          label.append(radio, " Đặt làm ảnh đại diện");
          item.append(label);
        }
        galleryNew.appendChild(item);
      });
    });
    window.addEventListener("pagehide", clearGalleryPreviews);
  });
  document
    .querySelector("[data-post-preview]")
    ?.addEventListener("click", () => {
      const read = (name) => editor.elements.namedItem(name)?.value || "";
      preview.querySelector("[data-preview-title]").textContent =
        read("title") || "Bài viết chưa có tiêu đề";
      preview.querySelector("[data-preview-excerpt]").textContent =
        read("excerpt");
      preview.querySelector("[data-preview-content]").textContent =
        read("content");
      preview.querySelector("[data-preview-meta]").textContent = [
        read("role"),
        read("author"),
        read("date"),
      ]
        .filter(Boolean)
        .join(" · ");
      const image = editor.elements.namedItem("kind")?.value === "activity"
        ? editor.querySelector('[name="gallery_cover"]:checked')?.closest(".gallery-edit-item")?.querySelector("img")
        : editor.querySelector("[data-image-preview]");
      const previewImage = preview.querySelector("[data-preview-image]");
      previewImage.hidden = !image || image.hidden;
      if (image && !image.hidden) previewImage.src = image.src;
      preview.showModal();
    });
  document.querySelectorAll("[data-character-count]").forEach((counter) => {
    const input = document.getElementById(counter.dataset.characterCount);
    const update = () => {
      counter.textContent = [...input.value].length + " ký tự";
    };
    input?.addEventListener("input", update);
    if (input) update();
  });
  let dirty = false;
  document.querySelector("[data-settings-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector('button[type="submit"]');
    const originalLabel = button?.innerHTML;
    if (button) { button.disabled = true; button.textContent = "Đang lưu..."; }
    try {
      const response = await fetch(form.action || location.href, {
        method: "POST", body: new FormData(form), credentials: "same-origin", redirect: "manual",
      });
      if (response.status >= 300 && response.status < 400) {
        dirty = false;
        location.assign(response.headers.get("Location") || "settings.php");
        return;
      }
      const resultPage = new DOMParser().parseFromString(await response.text(), "text/html");
      const message = resultPage.querySelector(".flash.error")?.textContent?.trim()
        || resultPage.querySelector("main")?.textContent?.trim().replace(/\s+/g, " ").slice(0, 400)
        || `Không lưu được thông tin (HTTP ${response.status}). Vui lòng kiểm tra lại.`;
      let alert = form.previousElementSibling;
      if (!alert?.matches(".flash.error")) {
        alert = document.createElement("div");
        alert.className = "flash error";
        alert.setAttribute("role", "alert");
        form.before(alert);
      }
      alert.textContent = message;
      alert.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {
      let alert = form.previousElementSibling;
      if (!alert?.matches(".flash.error")) {
        alert = document.createElement("div");
        alert.className = "flash error";
        alert.setAttribute("role", "alert");
        form.before(alert);
      }
      alert.textContent = "Không kết nối được máy chủ. Ảnh đã chọn vẫn còn; hãy thử lưu lại.";
    } finally {
      if (button) { button.disabled = false; button.innerHTML = originalLabel; }
    }
  });
  document.querySelectorAll("form[data-editor]").forEach((form) => {
    form.addEventListener("input", () => {
      dirty = true;
    });
    form.addEventListener("change", () => {
      dirty = true;
    });
    form.addEventListener("submit", () => {
      if (form.hasAttribute("data-settings-form")) return;
      dirty = false;
      const button = form.querySelector('button[type="submit"]');
      if (button) {
        button.disabled = true;
        button.textContent = "Đang lưu...";
      }
    });
  });
  window.addEventListener("beforeunload", (event) => {
    if (dirty) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
})();
