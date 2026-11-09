import { roles } from '../content/profile';

// The roles I am open to, grouped. One list for the hero plate and the finish panel, so they can never disagree.
export default function RoleList() {
  return roles.map((g) => (
    <section key={g.group}>
      <h2 className="roles-head">{g.group}</h2>
      <ul className="roles-list">
        {g.titles.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </section>
  ));
}
