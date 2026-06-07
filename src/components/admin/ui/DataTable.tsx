import { cn } from '../../../lib/cn'

interface Column<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  keyExtractor: (row: T) => string
  className?: string
}

export function DataTable<T>({ columns, rows, keyExtractor, className }: DataTableProps<T>) {
  return (
    <div className={cn('overflow-x-auto rounded-2xl border border-white/5', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn('px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-ink-500', col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={keyExtractor(row)} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3 text-cream-200', col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
