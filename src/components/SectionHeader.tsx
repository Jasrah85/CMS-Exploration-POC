export default function SectionHeader({
  title,
  eyebrow,
  description,
  action,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="text-xs uppercase tracking-wide text-gray-500">{eyebrow}</div>}
        <h2 className="text-2xl font-semibold">{title}</h2>
        {description && <p className="mt-1 text-gray-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}
