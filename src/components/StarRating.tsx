interface StarRatingProps {
  rating: number | null
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
}

export default function StarRating({ rating, maxRating = 5, size = 'md' }: StarRatingProps) {
  if (!rating) {
    return (
      <span className="text-gray-400 text-sm" aria-label="No rating available">
        No rating
      </span>
    )
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const stars = []
  
  for (let i = 1; i <= maxRating; i++) {
    const isFilled = i <= rating
    const isHalfFilled = i - 0.5 <= rating && i > rating
    
    stars.push(
      <svg
        key={i}
        className={`${sizeClasses[size]} ${
          isFilled ? 'text-yellow-400' : isHalfFilled ? 'text-yellow-300' : 'text-gray-300'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        role="presentation"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )
  }

  const ratingText = `Rating: ${rating.toFixed(1)} out of ${maxRating} stars`

  return (
    <div 
      className="flex items-center space-x-1" 
      role="img" 
      aria-label={ratingText}
    >
      <div className="flex" aria-hidden="true">
        {stars}
      </div>
      <span className="text-sm text-gray-600 ml-1" aria-hidden="true">
        {rating.toFixed(1)}
      </span>
    </div>
  )
}