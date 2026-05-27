import type { GearCategory } from "../types/trip";

type Props = {
  categories: GearCategory[];
};

export function GearChecklist({ categories }: Props) {
  return (
    <div className="gear-checklist">
      {categories.map((cat) => (
        <section key={cat.name} className="checklist-group">
          <h3>{cat.name}</h3>
          <ul>
            {cat.items.map((item) => (
              <li key={item}>
                <label className="check-item">
                  <input type="checkbox" />
                  <span>{item}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
