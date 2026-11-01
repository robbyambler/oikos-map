// All the words for "Share this app" (the Share button and the QR code) live
// here, so they can be reworded without touching any layout code.

export const SHARE_APP = {
  button: "Share this app",
  qrButton: "Show QR code",
  // Text handed to the phone's share sheet. The link itself is added separately.
  shareTitle: "Oikos Map",
  shareText: "A simple way to map the people in your life you want to pray for and share Jesus with.",
  copied: "Link copied",
  copyFailed: "We couldn't copy it for you. Select the link below and copy it.",
  copyButton: "Copy link",
  linkLabel: "Link to Oikos Map",
  privacyNote: "This only shares the app. Your map and the names on it stay on your device.",
  dialogTitle: "Share Oikos Map",
  dialogIntro: "Point a phone camera at the square to open the app. Anyone can use it for free, and there's nothing to sign up for.",
  qrLabel: (url: string) => `QR code that opens ${url}`,
  printButton: "Print this page",
  closeButton: "Close",
};
