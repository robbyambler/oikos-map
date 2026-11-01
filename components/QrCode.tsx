import qrcode from "qrcode-generator";

// Draws a QR code as one crisp SVG path. Nothing is fetched: the code is made
// right here in the browser, and it scales to any size (slides, handouts, print).
export default function QrCode({ value, label }: { value: string; label: string }) {
  const qr = qrcode(0, "M"); // type 0 = pick the smallest size that fits
  qr.addData(value);
  qr.make();
  const count = qr.getModuleCount();
  const quiet = 4; // the blank border scanners need around a code
  const size = count + quiet * 2;

  let d = "";
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) d += `M${c + quiet} ${r + quiet}h1v1h-1z`;
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className="qr-code h-auto w-full"
    >
      <rect width={size} height={size} fill="#fff" />
      <path d={d} fill="#000" />
    </svg>
  );
}
