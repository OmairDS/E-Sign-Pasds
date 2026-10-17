export const metadata = { title: 'E-Sign' };
export default function RootLayout({ children }) {
  return (
    <html lang="en"><body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f4f6f8', color: '#14213d' }}>
      {children}
    </body></html>
  );
}
