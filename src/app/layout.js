import "leaflet/dist/leaflet.css";
import "./globals.css"; // If you have a global CSS file

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}