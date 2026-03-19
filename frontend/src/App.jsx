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
        <p className="header-subtitle">
          Powered by Groq LLaMA 3.3 70B
        </p>
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