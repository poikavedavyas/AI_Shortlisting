import { useState } from "react"
import EvaluateTab from "./components/EvaluateTab"
import VerifyTab from "./components/VerifyTab"
import "./index.css"


export default function App() {
  const [activeTab, setActiveTab] = useState("evaluate")

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <h1 className="header-title">
          AI Resume Shortlisting System
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "center" }}>
          <a
            href="https://github.com/poikavedavyas/AI_Shortlisting"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none", color: "#3182CE", fontSize: "0.9rem" }}
          >
            GitHub →
          </a>
          <span style={{ color: "#4A5568", fontSize: "0.9rem" }}>
            Developed by Vedavyas S. Poika
          </span>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="tab-container">
        <button
          className={`tab-btn ${activeTab === "evaluate" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("evaluate")}
        >
          📄 Evaluate Resume
        </button>
        <button
          className={`tab-btn ${activeTab === "verify" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("verify")}
        >
          🔍 Verify Claims
        </button>
      </div>

      {/* Tab Content */}
      <main className="main-content">
        {activeTab === "evaluate" && <EvaluateTab />}
        {activeTab === "verify" && <VerifyTab />}
      </main>

    </div>
  )
}