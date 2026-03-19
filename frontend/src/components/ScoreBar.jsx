export default function ScoreBar({ label, score }) {

  // determine color based on score
  const getColor = (score) => {
    if (score >= 75) return "#22c55e"  // green  → high score
    if (score >= 50) return "#f59e0b"  // yellow → medium score
    return "#ef4444"                   // red    → low score
  }

  return (
    <div className="score-bar-container">

      {/* Label and Score Number */}
      <div className="score-bar-header">
        <span className="score-bar-label">{label}</span>
        <span className="score-bar-value">{score}/100</span>
      </div>

      {/* Progress Bar Track */}
      <div className="score-bar-track">

        {/* Progress Bar Fill */}
        <div
          className="score-bar-fill"
          style={{
            width: `${score}%`,
            background: getColor(score)
          }}
        />

      </div>
    </div>
  )
}