export default function SectionHeader({ sector, title, accent, intro, id }) {
  return (
    <header className="sechead">
      <span className="eyebrow">{sector}</span>
      <h2 id={id}>
        {title} {accent && <em>{accent}</em>}
      </h2>
      <span className="livery" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {intro && <p>{intro}</p>}
    </header>
  );
}
