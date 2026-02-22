"use strict";

const SITE_CONFIG = {
  appName: "Game Oracle",
  version: "v1.0.0",
  releaseDate: "February 22, 2026",
  fileName: "Game-Oracle-win64.zip",
  fileSize: "74.48 MB",
  sha256: "2BB430160CC90E5B246A5E9AAC86E458D3454CC66D6A7E499742584CB56E5C1C",
  releaseTag: "v1.0.0",
  downloadUrl: "",
  releaseUrl: "",
  repoUrl: ""
};

const ui = {
  downloadBtn: document.getElementById("downloadBtn"),
  releaseBtn: document.getElementById("releaseBtn"),
  repoLink: document.getElementById("repoLink"),
  versionBadge: document.getElementById("versionBadge"),
  updatedBadge: document.getElementById("updatedBadge"),
  sizeBadge: document.getElementById("sizeBadge"),
  configNotice: document.getElementById("configNotice"),
  shaValue: document.getElementById("shaValue"),
  copyHashBtn: document.getElementById("copyHashBtn")
};

function detectGitHubRepo() {
  const host = window.location.hostname.toLowerCase();
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  if (!host.endsWith(".github.io")) {
    return null;
  }
  if (pathParts.length < 1) {
    return null;
  }
  const owner = host.replace(".github.io", "");
  const repo = pathParts[0];
  if (!owner || !repo) {
    return null;
  }
  return { owner, repo };
}

function withFallbackReleaseLinks(config) {
  if (config.downloadUrl && config.releaseUrl && config.repoUrl) {
    return config;
  }

  const repo = detectGitHubRepo();
  if (!repo) {
    return config;
  }

  const repoUrl = `https://github.com/${repo.owner}/${repo.repo}`;
  return {
    ...config,
    repoUrl: config.repoUrl || repoUrl,
    releaseUrl: config.releaseUrl || `${repoUrl}/releases/tag/${config.releaseTag}`,
    downloadUrl: config.downloadUrl || `${repoUrl}/releases/download/${config.releaseTag}/${config.fileName}`
  };
}

function hasPlaceholder(config) {
  const joined = [
    config.downloadUrl,
    config.releaseUrl,
    config.repoUrl,
    config.sha256
  ].join(" ");
  return /YOURNAME|YOURREPO|PASTE_SHA256_HERE/i.test(joined);
}

function bindCopyHash(hashText) {
  ui.copyHashBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(hashText);
      ui.copyHashBtn.textContent = "Copied";
      setTimeout(() => {
        ui.copyHashBtn.textContent = "Copy hash";
      }, 1200);
    } catch {
      ui.copyHashBtn.textContent = "Copy failed";
      setTimeout(() => {
        ui.copyHashBtn.textContent = "Copy hash";
      }, 1200);
    }
  });
}

function init() {
  const config = withFallbackReleaseLinks(SITE_CONFIG);
  const linkPlaceholder = !config.downloadUrl || !config.releaseUrl || !config.repoUrl || hasPlaceholder(config);
  const hashReady = config.sha256 && !/PASTE_SHA256_HERE/i.test(config.sha256);

  ui.versionBadge.textContent = `Version ${config.version}`;
  ui.updatedBadge.textContent = `Updated ${config.releaseDate}`;
  ui.sizeBadge.textContent = `File size ${config.fileSize}`;

  if (linkPlaceholder) {
    ui.configNotice.classList.remove("hidden");
    ui.downloadBtn.classList.add("is-disabled");
    ui.releaseBtn.classList.add("is-disabled");
    ui.repoLink.textContent = "Set repo URL in docs/app.js";
    ui.repoLink.removeAttribute("href");
  } else {
    ui.downloadBtn.href = config.downloadUrl;
    ui.releaseBtn.href = config.releaseUrl;
    ui.repoLink.href = config.repoUrl;
  }

  if (hashReady) {
    ui.shaValue.textContent = config.sha256;
    bindCopyHash(config.sha256);
  } else {
    ui.shaValue.textContent = "Add SHA256 in docs/app.js";
    ui.copyHashBtn.disabled = true;
  }

  document.title = `${config.appName} Download`;
}

init();
