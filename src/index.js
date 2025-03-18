export { BaseFormFiller } from "./common/BaseFormFiller";
export { GreenhouseAccountFiller } from "./greenhouse/GreenhouseAccountFiller";

// Export default configuration
export const DEFAULT_CONFIG = {
  timeout: 5000,
  retries: 3,
  defaultLocation: "Asia",
};

// Export supported platforms
export const SUPPORTED_PLATFORMS = {
  GREENHOUSE: "greenhouse.io",
  WORKDAY: "workday.com",
  BAMBOO_HR: "bamboohr.com",
  WORKABLE: "workable.com",
  ZOHO_RECRUIT: "zoho.com/recruit",
  BULLHORN: "bullhorn.com",
  RECRUITEE: "recruitee.com",
  BREEZY_HR: "breezy.hr",
  ICIMS: "icims.com",
  JAZZ_HR: "jazzhr.com",
  MANATAL: "manatal.com",
};
