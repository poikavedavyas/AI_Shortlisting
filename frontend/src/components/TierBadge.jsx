export default function TierBadge({ tier }) {

  // tier config — label and CSS class for each tier
  const tierConfig = {
    A: {
      label: "Tier A — Fast Track",
      className: "tier-badge tier-a"
    },
    B: {
      label: "Tier B — Technical Screen",
      className: "tier-badge tier-b"
    },
    C: {
      label: "Tier C — Needs Evaluation",
      className: "tier-badge tier-c"
    }
  }

  // get config for this tier
  // fallback to C if tier is unknown
  const config = tierConfig[tier] || tierConfig["C"]

  return (
    <div className={config.className}>
      <span style={{ fontSize: "1.2rem", fontWeight: 800 }}>
        {tier}
      </span>
      <span>{config.label}</span>
    </div>
  )
}