export default function LynxMascot({ ready }: { ready: boolean }) {
  return (
    <div
      className={`lynx-mascot${ready ? " is-happy" : ""}`}
      role="img"
      aria-label={ready ? "Blije lynx: je UTM-link is klaar" : "Lynx wacht op je UTM-link"}
    >
      <span className="lynx-sprite" aria-hidden="true" />
    </div>
  );
}
