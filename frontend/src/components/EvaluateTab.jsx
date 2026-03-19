import { useState } from "react"
import axios from "axios"
import ScoreBar from "./ScoreBar"
import TierBadge from "./TierBadge"

export default function EvaluateTab() {

  //State Variables 
  const [file, setFile] = useState(null)
  const [jd, setJd] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  //Handle File Selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
  }

  //Handle Form Submit
  const handleSubmit = async () => {

    // validate inputs
    if (!file) {
      setError("Please upload a resume PDF")
      return
    }
    if (!jd.trim()) {
      setError("Please enter a job description")
      return
    }

    // reset state
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // build form data
      // FormData is used to send files + text together
      const formData = new FormData()
      formData.append("file", file)
      formData.append("jd", jd)

      // call FastAPI backend
      const response = await axios.post(
        "/api/evaluate",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      )

      // store result
      setResult(response.data)

    } catch (err) {
      setError("Something went wrong. Make sure backend is running.")
    } finally {
      setLoading(false)
    }
  }

  //Render
  return (
    <div>

      {/* Title */}
      <h2 style={{ marginBottom: "1.5rem", fontSize: "1.3rem" }}>
        📄 Evaluate Resume
      </h2>

      {/* File Upload */}
      <div className="form-group">
        <label className="form-label">Resume PDF</label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="file-upload"
        />
        {file && (
          <p className="file-name">
            ✓ {file.name} selected
          </p>
        )}
      </div>

      {/* JD Text Area */}
      <div className="form-group">
        <label className="form-label">Job Description</label>
        <textarea
          className="form-textarea"
          placeholder="Paste the job description here..."
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={6}
        />
      </div>

      {/* Submit Button */}
      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Evaluating..." : "🔍 Evaluate Resume"}
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
          <p>Analyzing resume with Groq AI...</p>
        </div>
      )}

      {/* Results Section */}
      {result && !loading && (
        <div style={{ marginTop: "2rem" }}>

          {/* Overall Score + Tier */}
          <div className="card">
            <div className="results-header">
              <div>
                <p className="overall-label">Overall Score</p>
                <p className="overall-score">
                  {result.scores?.overall}
                  <span style={{ fontSize: "1.2rem", color: "#94a3b8" }}>
                    /100
                  </span>
                </p>
              </div>
              <TierBadge tier={result.tier} />
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
              {result.summary}
            </p>
          </div>

          {/* 4 Score Bars */}
          <div className="card">
            <p className="section-title">Dimension Scores</p>
            <ScoreBar
              label="Exact Match"
              score={result.scores?.exactMatch}
            />
            <ScoreBar
              label="Semantic Similarity"
              score={result.scores?.semanticSimilarity}
            />
            <ScoreBar
              label="Achievements"
              score={result.scores?.achievements}
            />
            <ScoreBar
              label="Ownership"
              score={result.scores?.ownership}
            />
          </div>

          {/* Strengths and Gaps */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

            {/* Strengths */}
            <div className="card">
              <p className="section-title">✓ Strengths</p>
              {result.strengths?.map((strength, index) => (
                <div key={index} className="list-item">
                  <span className="icon-success">✓</span>
                  <span>{strength}</span>
                </div>
              ))}
            </div>

            {/* Gaps */}
            <div className="card">
              <p className="section-title">✗ Gaps</p>
              {result.gaps?.map((gap, index) => (
                <div key={index} className="list-item">
                  <span className="icon-danger">✗</span>
                  <span>{gap}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Score Explanations */}
          <div className="card" style={{ marginTop: "1rem" }}>
            <p className="section-title">Score Explanations</p>

            <div className="explanation-box">
              <p className="explanation-label">Exact Match</p>
              <p>{result.exactMatchExplanation}</p>
            </div>

            <div className="explanation-box">
              <p className="explanation-label">Semantic Similarity</p>
              <p>{result.semanticExplanation}</p>
            </div>

            <div className="explanation-box">
              <p className="explanation-label">Achievements</p>
              <p>{result.achievementsExplanation}</p>
            </div>

            <div className="explanation-box">
              <p className="explanation-label">Ownership</p>
              <p>{result.ownershipExplanation}</p>
            </div>

          </div>

          {/* Recommendation */}
          <div className="card" style={{ marginTop: "1rem" }}>
            <p className="section-title">💡 Recommendation</p>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
              {result.recommendation}
            </p>
          </div>

        </div>
      )}

    </div>
  )
}