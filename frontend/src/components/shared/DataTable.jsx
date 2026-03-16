import React from "react";
export default function DataTable({ columns, data, onRowClick, expandedRowRender, expandedRowId, rowKey = "id", emptyMessage = "No records found" }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-gray-300 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const key = row[rowKey] || idx;

                return (
                  <React.Fragment key={key}>
                    <tr
                      key={key}
                      onClick={() => onRowClick?.(row)}
                      className={`transition-colors duration-100 ${onRowClick ? "cursor-pointer hover:bg-[#FFFBE8]" : "hover:bg-gray-50/50"}`}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          style={{ width: col.width }}
                          className="px-5 py-4 text-gray-700 whitespace-nowrap"
                        >
                          {col.render ? col.render(row[col.key], row) : row[col.key] ?? "—"}
                        </td>
                      ))}
                    </tr>

                    {expandedRowId === key && expandedRowRender && (
                      <tr>
                        <td colSpan={columns.length} className="p-0">
                          {expandedRowRender(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}