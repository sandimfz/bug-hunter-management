"use client"

import { Button } from "@workspace/ui/components/button"

interface PaginationProps {
  total: number
  offset: number
  limit: number
  onChange: (offset: number) => void
}

export function Pagination({ total, offset, limit, onChange }: PaginationProps) {
  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.ceil(total / limit)

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs text-muted-foreground font-mono">
        Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="xs"
          onClick={() => onChange(Math.max(0, offset - limit))}
          disabled={offset === 0}
          className="font-mono"
        >
          Prev
        </Button>
        <span className="text-xs text-muted-foreground font-mono px-2">
          {currentPage}/{totalPages}
        </span>
        <Button
          variant="outline"
          size="xs"
          onClick={() => onChange(Math.min((totalPages - 1) * limit, offset + limit))}
          disabled={offset + limit >= total}
          className="font-mono"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
