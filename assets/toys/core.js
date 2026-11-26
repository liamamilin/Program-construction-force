/* ==========================================================================
   PCFToys Core Engine — 零外部依赖前端交互组件统一挂载引擎
   ========================================================================== */
(function (global) {
  "use strict";

  const registry = Object.create(null);

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        const v = attrs[k];
        if (v == null || v === false) return;
        if (k === "class" || k === "className") {
          node.className = v;
        } else if (k === "text") {
          node.textContent = v;
        } else if (k === "html") {
          node.innerHTML = v;
        } else if (k.indexOf("on") === 0 && typeof v === "function") {
          node.addEventListener(k.slice(2).toLowerCase(), v);
        } else if (k === "style" && typeof v === "object") {
          Object.assign(node.style, v);
        } else {
          node.setAttribute(k, v === true ? "" : String(v));
        }
      });
    }
    if (children != null) {
      const list = Array.isArray(children) ? children : [children];
      list.forEach(function (child) {
        if (child == null || child === false) return;
        if (typeof child === "string" || typeof child === "number") {
          node.appendChild(document.createTextNode(String(child)));
        } else {
          node.appendChild(child);
        }
      });
    }
    return node;
  }

  function register(id, spec) {
    if (!id || typeof spec !== "object" || typeof spec.render !== "function") {
      throw new Error("PCFToys.register: invalid spec for " + id);
    }
    registry[id] = spec;
  }

  function mountOne(container) {
    const id = container.getAttribute("data-toy");
    if (!id) return { status: "missing-attr" };
    if (container.getAttribute("data-mounted") === "1") {
      return { status: "already-mounted", id: id };
    }
    const spec = registry[id];
    if (!spec) {
      container.innerHTML =
        '<div class="pcf-card"><div class="pcf-body">' +
        '<span class="pcf-pill err">未注册交互实验：' + esc(id) + "</span>" +
        "</div></div>";
      return { status: "unregistered", id: id };
    }

    function renderIntoShell() {
      container.innerHTML = "";
      const body = el("div", { class: "pcf-body" });
      const toneClass = spec.tone ? " tone-" + spec.tone : "";
      const resetBtn = el("button", {
        type: "button",
        class: "pcf-btn pcf-reset",
        text: "重置",
        onClick: function () {
          renderIntoShell();
        },
      });
      const head = el("div", { class: "pcf-head" }, [
        el("div", { class: "pcf-head-meta" }, [
          el("div", { class: "pcf-badge-row" }, [
            el("span", { class: "pcf-badge" + toneClass, text: spec.badge || "交互实验" }),
          ]),
          el("div", { class: "pcf-title", text: spec.title }),
          spec.subtitle ? el("p", { class: "pcf-sub", text: spec.subtitle }) : null,
        ]),
        resetBtn,
      ]);
      const card = el("div", { class: "pcf-card" }, [head, body]);
      container.appendChild(card);
      try {
        spec.render(body, { el: el, esc: esc, reset: renderIntoShell });
      } catch (err) {
        body.innerHTML =
          '<span class="pcf-pill err">实验渲染异常：' + esc(err && err.message ? err.message : err) + "</span>";
      }
    }

    renderIntoShell();
    container.setAttribute("data-mounted", "1");
    return { status: "mounted", id: id };
  }

  function mountAll(root) {
    const scope = root || document;
    const nodes = scope.querySelectorAll(".pcf-toy[data-toy]");
    const mounted = [];
    const missing = [];
    nodes.forEach(function (node) {
      const res = mountOne(node);
      if (res.status === "mounted" || res.status === "already-mounted") {
        mounted.push(res.id);
      } else if (res.status === "unregistered") {
        missing.push(res.id);
      }
    });
    const report = {
      registeredCount: Object.keys(registry).length,
      mountedCount: mounted.length,
      mounted: mounted,
      missing: missing,
    };
    api._report = report;
    return report;
  }

  const api = {
    version: "1.0.0",
    register: register,
    mountAll: mountAll,
    getRegisteredIds: function () {
      return Object.keys(registry);
    },
    el: el,
    esc: esc,
    _report: null,
  };

  global.PCFToys = api;
})(window);
