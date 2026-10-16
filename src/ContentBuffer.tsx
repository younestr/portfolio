import { education, experience, profile, skills, themes } from "./content";
type Props = {
  name: string;
  theme: string;
  onTheme: (id: string) => void;
  execute: (command: string) => void;
};
export default function ContentBuffer({
  name,
  theme,
  onTheme,
  execute,
}: Props) {
  if (name === "about")
    return (
      <>
        <h1>{profile.name}</h1>
        <p className="lead">
          Building intelligent systems from models to production.
        </p>
        <p>
          {profile.role}
          <br />
          {profile.location}
        </p>
        <p>
          I work across AI, optimization, computer vision and software
          engineering, connecting models to applications people can use.
        </p>
        <h2>education</h2>
        {education.map(([date, title, place]) => (
          <article className="entry" key={date}>
            <small>{date}</small>
            <h3>{title}</h3>
            <p>{place}</p>
          </article>
        ))}
        <button onClick={() => execute("resume")}>download résumé ↗</button>
      </>
    );
  if (name === "experience")
    return (
      <>
        {experience.map((item) => (
          <article className="entry" key={item.company}>
            <small>{item.date}</small>
            <h2>{item.company}</h2>
            <h3>{item.role}</h3>
            <p>{item.text}</p>
          </article>
        ))}
        <h2>selected achievements</h2>
        <p>
          First Prize — HPC Hackathon, UM6P · December 2024
          <br />
          First Prize — CROMEK 7 · May 2024
          <br />
          Third Place — NXP Cup Qualifications · April 2024
        </p>
      </>
    );
  if (name === "skills")
    return (
      <>
        <h1>Tools & disciplines</h1>
        <p className="comment">
          Experience across work, study and prototypes; depth varies.
        </p>
        {skills.map(([title, tools]) => (
          <article className="entry" key={title}>
            <h2>{title}</h2>
            <p>{tools}</p>
          </article>
        ))}
      </>
    );
  if (name === "contact")
    return (
      <>
        <h1>Let’s build something meaningful.</h1>
        <p>For engineering opportunities and thoughtful collaborations.</p>
        <h2>email</h2>
        <a className="contact-link" href={`mailto:${profile.email}`}>
          {profile.email} ↗
        </a>
        <h2>elsewhere</h2>
        <div className="contact-links">
          <a href={profile.github} target="_blank" rel="noreferrer">
            github / younestr ↗
          </a>
          {profile.linkedin && (
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
          )}
          {profile.kaggle && (
            <a href={profile.kaggle} target="_blank" rel="noreferrer">
              Kaggle ↗
            </a>
          )}
        </div>
        <p>{profile.location}</p>
        <a href={profile.resume} download>
          download résumé.pdf ↓
        </a>
      </>
    );
  if (name === "theme")
    return (
      <>
        <h1>A different light.</h1>
        <p>Color schemes for the entire workspace.</p>
        <div className="theme-list">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => onTheme(t.id)}
              aria-pressed={theme === t.id}
            >
              <span>
                {theme === t.id ? "●" : "○"} {t.label}
              </span>
              <small>{t.detail}</small>
            </button>
          ))}
        </div>
      </>
    );
  return (
    <>
      <h1>Move through the workspace.</h1>
      <dl className="controls">
        <dt>enter ↩</dt>
        <dd>Enter the explorer / open project details</dd>
        <dt>↑ ↓ / j k</dt>
        <dd>Select previous / next project</dd>
        <dt>wheel / drag</dt>
        <dd>Move through the finite project rail</dd>
        <dt>esc</dt>
        <dd>Close a buffer, leave details, or return to intro</dd>
        <dt>:</dt>
        <dd>Open command input</dd>
        <dt>?</dt>
        <dd>Show this guide</dd>
      </dl>
      <div className="help-commands">
        {[
          "about",
          "projects",
          "experience",
          "skills",
          "contact",
          "resume",
          "theme",
          "home",
        ].map((c) => (
          <button key={c} onClick={() => execute(c)}>
            :{c}
          </button>
        ))}
      </div>
      <p className="comment">
        All diagrams and code are original illustrations. They contain no
        employer source, client data or live performance metrics.
      </p>
    </>
  );
}
