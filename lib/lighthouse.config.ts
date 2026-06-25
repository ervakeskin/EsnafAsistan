// Lighthouse performans testi yapılandırması
// Çalıştırma: npx lighthouse http://localhost:3000 --config-path=lib/lighthouse.config.ts --view

export default {
  extends: "lighthouse:default",
  settings: {
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
    },
    screenEmulation: {
      mobile: true,
      width: 412,
      height: 915,
      deviceScaleFactor: 2,
      disabled: false,
    },
    formFactor: "mobile",
    locales: "tr-TR",
  },
}
