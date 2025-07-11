'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AdminDashboard() {
  const router = useRouter();

  const [userChecked, setUserChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(false);

  // ✅ Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      setLoading(true);

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin/login');
        return;
      }

      const userId = session.user.id;

      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (profileError || !profile?.is_admin) {
        router.push('/admin/login');
        return;
      }

      // ✅ User is admin
      setIsAdmin(true);
      setUserChecked(true);
    };

    checkAdmin();
  }, [router]);

  // ✅ Fetch events only if admin confirmed
  useEffect(() => {
    if (!isAdmin) return;

    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    };

    fetchEvents();
  }, [isAdmin, refreshToggle]);

  const approveEvent = async (id: string) => {
    await supabase
      .from('events')
      .update({ approved: true })
      .eq('id', id);
    setRefreshToggle(prev => !prev);
  };

  const handleSignOut = async () => {
  await supabase.auth.signOut();
  router.push('/admin/login');
};


  const deleteEvent = async (id: string) => {
    await supabase
      .from('events')
      .delete()
      .eq('id', id);
    setRefreshToggle(prev => !prev);
  };

  if (!userChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-500">
        Checking admin access...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
     <header className="border-b p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
  <div>
    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
    <p className="text-sm text-neutral-500">Review and moderate events</p>
  </div>
  <button
    onClick={handleSignOut}
    className="border border-neutral-900 px-4 py-2 rounded hover:bg-neutral-900 hover:text-white transition text-sm"
  >
    Sign Out
  </button>
</header>


      <main className="p-6">
        {loading && <div className="text-center py-10">Loading events...</div>}

        {!loading && events.length === 0 && (
          <div className="text-center py-10 text-neutral-500">No events found.</div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map(event => (
            <div
              key={event.id}
              className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image_url || '/placeholder.jpg'}
                  alt={event.title}
                  className="object-cover w-full h-full"
                />
                {!event.approved && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    Pending
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold">{event.title}</h2>
                <p className="text-sm text-neutral-600">
                  {event.date_time ? new Date(event.date_time).toLocaleString() : ''}
                </p>
                <p className="text-sm text-neutral-600">{event.location}</p>
                <div className="mt-4 flex space-x-2">
                  {!event.approved && (
                    <button
                      onClick={() => approveEvent(event.id)}
                      className="flex-1 border border-green-600 text-green-600 px-3 py-1 rounded hover:bg-green-600 hover:text-white transition"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="flex-1 border border-red-600 text-red-600 px-3 py-1 rounded hover:bg-red-600 hover:text-white transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
