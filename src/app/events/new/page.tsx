'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function NewEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [organisationName, setOrganisationName] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [pricing, setPricing] = useState('');
  const [location, setLocation] = useState('');
  const [about, setAbout] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Get logged-in user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in.');
      }

      const userId = session.user.id;
      let imageUrl = '';

      // Upload image if present
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('event-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase
          .storage
          .from('event-images')
          .getPublicUrl(uploadData.path);

        imageUrl = publicUrlData.publicUrl;
      }

      // Insert event into DB
      const { error: insertError } = await supabase
        .from('events')
        .insert([
          {
            user_id: userId,
            title,
            organisation_name: organisationName || null,
            date_time: dateTime ? new Date(dateTime).toISOString() : null,
            pricing,
            location,
            about,
            contact_details: contactDetails,
            image_url: imageUrl,
            approved: false
          }
        ]);

      if (insertError) throw insertError;

      // Redirect to homepage or admin moderation page
      router.push('/events');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Post a New Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Event Title"
          required
          className="w-full border rounded px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Organization Name (optional)"
          className="w-full border rounded px-3 py-2"
          value={organisationName}
          onChange={(e) => setOrganisationName(e.target.value)}
        />

        <input
          type="datetime-local"
          className="w-full border rounded px-3 py-2"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
        />

        <input
          type="text"
          placeholder="Pricing (e.g. Free / $20)"
          className="w-full border rounded px-3 py-2"
          value={pricing}
          onChange={(e) => setPricing(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          required
          className="w-full border rounded px-3 py-2"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <textarea
          placeholder="About Event"
          className="w-full border rounded px-3 py-2"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
        />

        <textarea
          placeholder="Contact Details"
          className="w-full border rounded px-3 py-2"
          value={contactDetails}
          onChange={(e) => setContactDetails(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          className="w-full border rounded px-3 py-2"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-neutral-900 text-white px-4 py-2 rounded hover:bg-neutral-800 transition"
        >
          {loading ? 'Posting...' : 'Post Event'}
        </button>
      </form>
    </div>
  );
}
