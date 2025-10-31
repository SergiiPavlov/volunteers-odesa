
export default async function Footer(){
  return (
    <footer className="mt-20 border-t">
      <div className="container mx-auto px-4 py-10 text-sm text-slate-600 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>© Волонтерський фонд</div>
        <div className="flex items-center gap-4">
          <a href="/manifest.webmanifest">PWA</a>
          <a href="/robots.txt">robots.txt</a>
          <a href="/sitemap.xml">sitemap.xml</a>
        </div>
      </div>
    </footer>
  );
}