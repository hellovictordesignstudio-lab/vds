type PropRow = {
  name: string;
  type: string;
  default: string;
  description: string;
  required?: boolean;
};

type PropsTableProps = {
  props: PropRow[];
};

const colWidths = {
  name: 130,
  type: 260,
  default: 100,
} as const;

export function PropsTable({ props: rows }: PropsTableProps) {
  return (
    <div className="props-table-wrap">
      <table className="props-table">
        <colgroup>
          <col style={{ width: `${colWidths.name}px` }} />
          <col style={{ width: `${colWidths.type}px` }} />
          <col style={{ width: `${colWidths.default}px` }} />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td className="props-table__name">
                {row.name}
                {row.required ? (
                  <span className="props-table__required-dot" aria-label="Required" role="img" />
                ) : null}
              </td>
              <td className="props-table__type type-cell">{row.type}</td>
              <td className="props-table__default">
                {row.default === '' || row.default === undefined ? '—' : row.default}
              </td>
              <td className="props-table__desc">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
