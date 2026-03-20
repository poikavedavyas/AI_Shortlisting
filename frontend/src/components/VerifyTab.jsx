import { useState } from "react"
import axios from "axios"

export default function VerifyTab() {

  //State Variables
  const [githubUrl, setGithubUrl] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [claims, setClaims] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  //Handle Submit
  const handleSubmit = async () => {

    //validate inputs
    if (!githubUrl.trim()) {
      setError("Please enter a GitHub URL")
      return
    }
    if (!claims.trim()) {
      setError("Please enter candidate claims")
      return
    }

    //reset state
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      //call FastAPI backend
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/verify`, {
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        claims: claims
      })

      //store result
      setResult(response.data)

    } catch (err) {
      setError("Something went wrong. Make sure backend is running.")
    } finally {
      setLoading(false)
    }
  }

  //Plausibility Color
  const getPlausibilityClass = (plausibility) => {
    if (plausibility === "High") return "plausibility-high"
    if (plausibility === "Medium") return "plausibility-medium"
    return "plausibility-low"
  }

  // ── Authenticity Color ────────────────────
  const getAuthColor = (score) => {
    if (score >= 75) return "#22c55e"
    if (score >= 50) return "#f59e0b"
    return "#ef4444"
  }

  //Render
  return (
    <div>

      {/* Title */}
      <h2 style={{ marginBottom: "1.5rem", fontSize: "1.3rem" }}>
        🔍 Verify Candidate Claims
      </h2>

      {/* GitHub URL */}
      <div className="form-group">
        <label className="form-label">GitHub URL</label>
        <input
          type="text"
          className="form-input"
          placeholder="https://github.com/username"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
        />
      </div>

      {/* LinkedIn URL */}
      <div className="form-group">
        <label className="form-label">LinkedIn URL</label>
        <input
          type="text"
          className="form-input"
          placeholder="https://linkedin.com/in/username"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
        />
      </div>

      {/* Claims */}
      <div className="form-group">
        <label className="form-label">Candidate Claims</label>
        <textarea
          className="form-textarea"
          placeholder="Enter candidate claims here...
Example:
5 years Python experience
Built Kafka pipelines
Open source contributor
Led a team of 5 engineers"
          value={claims}
          onChange={(e) => setClaims(e.target.value)}
          rows={6}
        />
      </div>

      {/* Submit Button */}
      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Verifying..." : "🔍 Verify Claims"}
      </button>

      {/* Error Message */}
      {error && (
        <div className="error-box">
          ⚠ {error}
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="loading">
          <div className="loading-spinner" />
          <p>Fetching GitHub data and analyzing claims...</p>
        </div>
      )}

      {/* Results Section */}
      {result && !loading && (
        <div style={{ marginTop: "2rem" }}>

          {/* Authenticity Score */}
          <div className="card">
            <p
              className="auth-score"
              style={{ color: getAuthColor(result.overallAuthenticity) }}
            >
              {result.overallAuthenticity}%
            </p>
            <p className="auth-label">Overall Authenticity Score</p>

            {/* Verdict */}
            <div className="verdict-box">
              {result.verdict}
            </div>
          </div>

          {/* GitHub Signals */}
          {result.githubSignals && (
            <div className="card">
              <p className="section-title">
                GitHub Signals — {result.githubSignals.score}/100
              </p>

              {/* Findings */}
              {result.githubSignals.findings?.map((finding, index) => (
                <div key={index} className="list-item">
                  <span className="icon-success">✓</span>
                  <span>{finding}</span>
                </div>
              ))}

              {/* Flags */}
              {result.githubSignals.flags?.filter(Boolean).map((flag, index) => (
                <div key={index} className="list-item">
                  <span className="icon-danger">⚠</span>
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          )}

          {/* Claim by Claim Analysis */}
          {result.claimVerification && (
            <div className="card">
              <p className="section-title">Claim Analysis</p>

              {result.claimVerification.map((claim, index) => (
                <div key={index} className="claim-item">

                  {/* Claim Header */}
                  <div className="claim-header">
                    <span className="claim-text">
                      {claim.claim}
                    </span>
                    <span className={getPlausibilityClass(claim.plausibility)}>
                      {claim.plausibility}
                    </span>
                  </div>

                  {/* Reasoning */}
                  <p className="claim-reasoning">
                    {claim.reasoning}
                  </p>

                  {/* Verification Tip */}
                  <p className="claim-tip">
                    💡 {claim.verificationTip}
                  </p>

                </div>
              ))}
            </div>
          )}

          {/* Green Flags and Red Flags */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

            {/* Green Flags */}
            <div className="card">
              <p className="section-title">✓ Green Flags</p>
              {result.greenFlags?.length > 0
                ? result.greenFlags.map((flag, index) => (
                    <div key={index} className="list-item">
                      <span className="icon-success">✓</span>
                      <span>{flag}</span>
                    </div>
                  ))
                : <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                    None identified
                  </p>
              }
            </div>

            {/* Red Flags */}
            <div className="card">
              <p className="section-title">⚠ Red Flags</p>
              {result.redFlags?.filter(Boolean).length > 0
                ? result.redFlags.filter(Boolean).map((flag, index) => (
                    <div key={index} className="list-item">
                      <span className="icon-danger">⚠</span>
                      <span>{flag}</span>
                    </div>
                  ))
                : <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                    None identified
                  </p>
              }
            </div>

          </div>

        </div>
      )}

    </div>
  )
}