import "./globals.css";

export const metadata = {
  title: 'MyCollection',
  description: 'MyCollection',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
