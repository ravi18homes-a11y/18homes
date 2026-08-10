"use client";
import React, { useState, useEffect } from "react";
import { Star, Trash2, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

const PropertyReviews = ({ propertyId, ownerId }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(5.0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [myReview, setMyReview] = useState(null);

  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const databaseUrl = process.env.NEXT_PUBLIC_APP_DATABASE_URL || "";
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const userDataStr = typeof window !== "undefined" ? localStorage.getItem("userData") : null;
  
  let currentUser = null;
  if (userDataStr) {
    try { currentUser = JSON.parse(userDataStr); } catch (e) {}
  }

  const isOwner = currentUser && (currentUser._id === ownerId || currentUser.id === ownerId);

  const fetchReviews = async () => {
    if (!propertyId) return;
    try {
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${databaseUrl}/api/reviews/property/${propertyId}`, { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setReviews(json.data.reviews || []);
          setAverageRating(json.data.averageRating || 5.0);
          setTotalRatings(json.data.totalRatings || 0);
          if (json.data.myReview) {
            setMyReview(json.data.myReview);
            setRatingInput(json.data.myReview.rating || 5);
            setCommentInput(json.data.myReview.comment || "");
          }
        }
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [propertyId, token]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please login to post a rating & review");
      return;
    }

    if (isOwner) {
      toast.error("You cannot rate your own property");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${databaseUrl}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId,
          rating: ratingInput,
          comment: commentInput,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(myReview ? "Review updated successfully!" : "Thank you for your rating & review!");
        fetchReviews();
      } else {
        toast.error(json.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Submit review error:", err);
      toast.error("Network error while submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(`${databaseUrl}/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Review deleted successfully");
        setMyReview(null);
        setRatingInput(5);
        setCommentInput("");
        fetchReviews();
      } else {
        toast.error(json.message || "Failed to delete review");
      }
    } catch (err) {
      console.error("Delete review error:", err);
      toast.error("Network error while deleting review");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
      {/* Header with Average Rating */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-red-600" />
            User Ratings & Reviews
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Ratings affect listing rank: lower rated properties move to the bottom.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl self-start sm:self-auto">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-amber-900">{averageRating.toFixed(1)}</span>
            <span className="text-xs text-amber-700 block font-medium">
              {totalRatings} {totalRatings === 1 ? "Rating" : "Ratings"}
            </span>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {!isOwner ? (
        <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {myReview ? "Update Your Rating & Review" : "Rate This Property & Service"}
          </h3>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Star Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Your Rating:</span>
              <div className="flex items-center gap-1 cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRatingInput(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-125"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverRating || ratingInput)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm font-bold text-amber-600 ml-2">
                {hoverRating || ratingInput} / 5 Stars
              </span>
            </div>

            {/* Comment Textarea */}
            <div>
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write your review or experience about this property or seller..."
                rows={3}
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm text-gray-800 bg-white"
              ></textarea>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {token ? `Posting as ${currentUser?.name || currentUser?.email || "User"}` : "Login required to post"}
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50 text-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Submitting..." : myReview ? "Update Review" : "Submit Rating"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg font-medium">
          ℹ️ You are the owner of this property. You cannot rate your own property.
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4 pt-2">
        <h3 className="text-lg font-bold text-gray-800">
          User Reviews ({reviews.length})
        </h3>

        {loading ? (
          <div className="text-center py-6 text-gray-500 text-sm">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm font-medium">No reviews yet for this property.</p>
            <p className="text-gray-400 text-xs mt-1">Be the first user to give a rating!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map((rev) => {
              const isMyRev = currentUser && (rev.user?._id === currentUser._id || rev.user?.id === currentUser._id || rev.user === currentUser._id);
              const isAdmin = currentUser?.role === "admin";

              return (
                <div key={rev._id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-sm border border-red-200 overflow-hidden">
                        {rev.user?.avatar ? (
                          <img src={rev.user.avatar} alt={rev.user.name} className="w-full h-full object-cover" />
                        ) : (
                          (rev.user?.name || "U")[0].toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                          {rev.user?.name || "User"}
                          {isMyRev && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                              Your Review
                            </span>
                          )}
                        </h4>
                        <span className="text-[11px] text-gray-400">
                          {new Date(rev.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-extrabold text-amber-900">{rev.rating}</span>
                      </div>

                      {(isMyRev || isAdmin) && (
                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer rounded-lg hover:bg-gray-100"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {rev.comment && (
                    <p className="text-sm text-gray-700 pl-12 leading-relaxed bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                      "{rev.comment}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyReviews;
