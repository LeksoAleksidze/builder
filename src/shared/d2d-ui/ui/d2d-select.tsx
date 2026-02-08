import { useState, useRef, useEffect, useCallback } from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@d2d-ui/utils"

export interface D2DSelectOption {
  value: string
  label: string
}

interface D2DSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: D2DSelectOption[]
  placeholder?: string
  disabled?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  className?: string
}

export function D2DSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  disabled = false,
  searchable = false,
  searchPlaceholder = "Search...",
  className,
}: D2DSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filteredOptions = searchable && searchTerm
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options

  const selectedLabel = options.find((opt) => opt.value === value)?.label

  const close = useCallback(() => {
    setIsOpen(false)
    setSearchTerm("")
    setHighlightedIndex(-1)
  }, [])

  // Outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [isOpen, close])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [isOpen, close])

  // Auto-focus search input
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 0)
    }
  }, [isOpen, searchable])

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [searchTerm])

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return
    const items = listRef.current.querySelectorAll("[data-select-item]")
    items[highlightedIndex]?.scrollIntoView({ block: "nearest" })
  }, [highlightedIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          onValueChange(filteredOptions[highlightedIndex].value)
          close()
        }
        break
    }
  }

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue)
    close()
  }

  return (
    <div ref={containerRef} className={cn("relative", className)} onKeyDown={handleKeyDown}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        className={cn(
          "flex h-[2.375rem] w-full items-center justify-between rounded-[0.5rem] border border-input bg-background px-3 py-2 text-[13px] ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150",
          !value && "text-muted-foreground"
        )}
      >
        <span className="line-clamp-1 text-left">
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className={cn(
          "h-3.5 w-3.5 opacity-40 transition-transform duration-150 ml-2 flex-shrink-0",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[8rem] max-h-72 overflow-hidden rounded-xl border border-border/60 bg-popover text-popover-foreground shadow-xl d2d-select-dropdown-enter">
          {/* Search */}
          {searchable && (
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full h-8 pl-8 pr-3 text-[13px] bg-transparent border border-input rounded-lg outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary/50 placeholder:text-muted-foreground"
                />
              </div>
            </div>
          )}

          {/* Items */}
          <div ref={listRef} className="p-1 overflow-y-auto max-h-60">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  data-select-item
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-[13px] outline-none transition-colors duration-100",
                    highlightedIndex === index && "bg-accent text-accent-foreground",
                    highlightedIndex !== index && "hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {value === option.value && (
                    <span className="absolute left-2.5 top-2.5 flex h-3.5 w-3.5 items-center justify-center text-primary">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <span className="break-words whitespace-normal text-left">{option.label}</span>
                </button>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground text-center">
                {searchable ? "Not found" : "No options"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
