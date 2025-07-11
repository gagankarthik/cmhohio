export default function AdminContactPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
      {/* NavBar */}
      <header className="flex justify-between items-center px-6 py-4 border-b shadow-sm">
        <div className="text-xl font-bold">
          CMHOhio Admin
        </div>
        <nav className="space-x-4 text-sm">
          <a href="/" className="hover:underline">Home</a>
          <a href="/events" className="hover:underline">Events</a>
          <a href="/events/new" className="hover:underline">Post Event</a>
          <a href="/admin/login" className="border border-neutral-900 px-3 py-1 rounded hover:bg-neutral-900 hover:text-white transition">Admin Login</a>
        </nav>
      </header>

      {/* Main Section */}
      <main className="flex flex-col items-center justify-center flex-1 px-4 py-12 bg-neutral-50">
        <h1 className="text-4xl font-bold mb-6 text-center">Contact Our Admin for Support</h1>
        <p className="text-neutral-600 text-center mb-10 max-w-xl">
          Have questions about posting events or need help with our platform? Contact our admin below. We're here to help keep Columbus events accessible to everyone.
        </p>

        {/* Contact Card */}
        <div className="max-w-sm w-full bg-white border rounded-xl shadow p-6 text-center">
          <img
            src="/admin-profile.jpg"
            alt="Admin"
            className="w-24 h-24 object-cover rounded-full mx-auto mb-4 border"
          />
          <h2 className="text-2xl font-semibold mb-2">Gagan Admin</h2>
          <p className="text-neutral-600 mb-4">Community Events Coordinator</p>

          <div className="space-y-2">
            <a href="tel:+11234567890" className="block border border-neutral-900 px-4 py-2 rounded hover:bg-neutral-900 hover:text-white transition">
              📞 Call: +1 (123) 456-7890
            </a>
            <a href="mailto:admin@cmhohio.com" className="block border border-neutral-900 px-4 py-2 rounded hover:bg-neutral-900 hover:text-white transition">
              ✉️ Email: admin@cmhohio.com
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-4 text-center text-sm text-neutral-500">
        © 2025 CMHOhio. All rights reserved.
      </footer>
    </div>
  );
}
