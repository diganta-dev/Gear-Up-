"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createReview } from "@/service/reviews";
import { toast } from "sonner";

interface ReviewFormProps {
  gearItemId: string;
  rentalOrderId: string;
}

export default function ReviewForm({ gearItemId, rentalOrderId }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (rating < 1 || rating > 5) {
      toast.error("Please select a star rating between 1 and 5.");
      return;
    }

    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMsg("Please write a review comment (minimum 5 characters).");
      toast.error("Please write a review comment (minimum 5 characters).");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createReview({
        gearItemId,
        rating,
        comment: comment.trim(),
        rentalOrderId,
      });

      if (response.success) {
        toast.success("Thank you! Your review has been submitted successfully.");
        window.location.href = "/dashboard";
      } else {
        const error = response.message || "Failed to submit review. You may have already reviewed this item.";
        setErrorMsg(error);
        toast.error(error);
        setIsSubmitting(false);
      }
    } catch (_err) {
      toast.error("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          {errorMsg}
        </div>
      )}

      {/* Rating Selector */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Your Rating</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = (hoverRating || rating) >= star;
            return (
              <button
                key={star}
                type="button"
                className="p-1 rounded-md transition-colors hover:bg-amber-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <Star
                  className={`w-8 h-8 transition-all ${
                    isFilled
                      ? "fill-amber-400 text-amber-400 scale-110"
                      : "text-muted-foreground/30 hover:text-amber-400/50"
                  }`}
                />
              </button>
            );
          })}
          <span className="ml-3 text-sm font-medium text-muted-foreground">
            {rating} of 5 Stars
          </span>
        </div>
      </div>

      {/* Written Comment Field */}
      <div className="space-y-2">
        <Label htmlFor="review-comment" className="text-sm font-medium">
          Written Review
        </Label>
        <Textarea
          id="review-comment"
          placeholder="Describe the condition of the gear, ease of pickup/return, and overall rental experience..."
          rows={4}
          value={comment}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
          className="resize-none"
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          Minimum 5 characters. Be honest and constructive to help future renters!
        </p>
      </div>

      {/* Submit Action */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" /> Submit Review
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
