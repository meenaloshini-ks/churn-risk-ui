// Reusable labelled input/select. `options` turns it into a dropdown.
export default function Field({ label, name, value, onChange, options, ...rest }) {
  const id = `field-${name}`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {options ? (
        <select id={id} name={name} value={value} onChange={onChange} {...rest}>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input id={id} name={name} value={value} onChange={onChange} {...rest} />
      )}
    </div>
  );
}
