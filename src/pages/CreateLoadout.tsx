import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../store/auth";
import { insertInto } from "../utils/supabaseApi";

export default function CreateLoadout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("You must be logged in to create a loadout.");
      return;
    }

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: insertError } = await insertInto('user_loadouts', {
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        budget: budget ? parseFloat(budget) : null
      }, { select: true });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else if (data) {
      // Navigate to the new loadout
      navigate(`/loadouts/user/${(data as any)[0].id}`);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Create Loadout</h2>
        <p className="text-gray-600">You must be logged in to create a loadout.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create New Loadout</h1>
        <button
          onClick={() => navigate('/loadouts')}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Loadout Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-dark w-full"
            placeholder="Enter loadout title..."
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input-dark w-full"
            placeholder="Describe your loadout..."
          />
        </div>

        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
            Budget (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              id="budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="input-dark w-full pl-8"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Set a budget to track your loadout cost
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Loadout"}
          </button>
          <button
            type="button"
            onClick={() => navigate('/loadouts')}
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 