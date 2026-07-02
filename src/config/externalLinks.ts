// External system links. Authoring source of truth: config/external-links.md.
// These are the machine-readable equivalents used by adapters and the UI.
// Keep in sync with config/external-links.md when links change.

export const externalLinks = {
  onedrive: {
    // 個管共用資料夾 (A個管)
    sharedFolder:
      "https://eden365-my.sharepoint.com/shared?listurl=https%3A%2F%2Feden365%2Dmy%2Esharepoint%2Ecom%2Fpersonal%2F7428%5Feden%5Forg%5Ftw%2FDocuments&id=%2Fpersonal%2F7428%5Feden%5Forg%5Ftw%2FDocuments%2FA%E5%80%8B%E7%AE%A1&viewid=39d6e591%2D68fc%2D4085%2Da0e6%2D629cfd94cc56",
  },
  googleAppsScript: {
    // 家訪倒數網頁 — Visit Manager SSOT
    visitManager:
      "https://script.google.com/macros/s/AKfycbzwseScW25fZtSBJtxd4EsckqkSTtQejpuISBrkGlzmnGvBGiFk2kxKC5gb1ot7Z7WC/exec",
    // 派案系統 Web App
    dispatchConsole:
      "https://longcare-dispatch-api-604629567534.asia-east1.run.app/dashboard",
  },
  github: {
    orbikt: "https://github.com/yzfgzct2g2-cloud/Orbikt.git",
    aa01: "https://yzfgzct2g2-cloud.github.io/aa01-ai-system/",
    knowledge: "https://yzfgzct2g2-cloud.github.io/longcare-knowledge-platform/",
    qaEngine: "https://github.com/yzfgzct2g2-cloud/longcare-qa-engine",
    authTest: "https://github.com/yzfgzct2g2-cloud/longcare-user-auth",
  },
} as const;
