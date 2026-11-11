import { roles, rolesPanel, profile } from '../content/profile';

// The target roles, grouped. One list for the hero plate and the finish panel, so they can never disagree.
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

// The closing lines of the roles panel (the heading and introduction sit with each panel's own header).
export function RolesFoot() {
  return (
    <div className="roles-foot">
      <p>{rolesPanel.support}</p>
      <p className="roles-loc">{profile.location}</p>
    </div>
  );
}
