interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold">
        {title}
        {subtitle && ` & ${subtitle}`}
      </h1>
    </div>
  )
}