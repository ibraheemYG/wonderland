import React from 'react';

const StarIcon = ({ filled, half }: { filled: boolean; half?: boolean }) => (
  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
    {half ? (
      <>
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        <path fill="lightgray" d="M10 15l5.878 3.09-1.123-6.545L19.511 6.91l-6.572-.955L10 0v15z" />
      </>
    ) : filled ? (
      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
    ) : (
      <path fill="lightgray" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
    )}
  </svg>
);

const Rating = ({ rating }: { rating: number }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<StarIcon key={i} filled={true} />);
    } else if (i - 0.5 <= rating) {
      stars.push(<StarIcon key={i} filled={true} half={true} />);
    } else {
      stars.push(<StarIcon key={i} filled={false} />);
    }
  }
  return <div className="flex">{stars}</div>;
};

export default Rating;
