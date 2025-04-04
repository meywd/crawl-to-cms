export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} WebCrawler | Website Replication Tool. Use responsibly and respect website owners' rights.
        </p>
      </div>
    </footer>
  );
}
