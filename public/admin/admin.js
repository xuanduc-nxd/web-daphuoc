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
  let imageUrl = "";
  document.querySelectorAll("[data-image-input]").forEach((input) => {
    input.addEventListener("change", () => {
      input.setCustomValidity("");
      const preview = input
        .closest("form")
        .querySelector("[data-image-preview]");
      const error = input.closest("label").querySelector("[data-image-error]");
      const file = input.files[0];
      if (error) {
        error.textContent = "";
        error.hidden = true;
      }
      if (!file) {
        if (preview && preview.dataset.original) {
          preview.src = preview.dataset.original;
          preview.hidden = false;
        } else if (preview) preview.hidden = true;
        return;
      }
      if (
        !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type,
        ) ||
        file.size > 5 * 1024 * 1024
      ) {
        const message = "Chọn ảnh JPG, PNG, WebP hoặc GIF tối đa 5 MB.";
        input.setCustomValidity(message);
        if (error) {
          error.textContent = message;
          error.hidden = false;
        }
        input.reportValidity();
        return;
      }
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      imageUrl = URL.createObjectURL(file);
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
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  });
  const editor = document.querySelector("[data-post-editor]");
  const preview = document.getElementById("post-preview-dialog");
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
      const image = editor.querySelector("[data-image-preview]");
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
  document.querySelectorAll("form[data-editor]").forEach((form) => {
    form.addEventListener("input", () => {
      dirty = true;
    });
    form.addEventListener("change", () => {
      dirty = true;
    });
    form.addEventListener("submit", () => {
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
