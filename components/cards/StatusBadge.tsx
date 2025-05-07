import { Badge } from "@/components/ui/badge";
import { CardStatus } from "@prisma/client";

interface StatusBadgeProps {
  status: CardStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: CardStatus) => {
    switch (status) {
      case "ACTIVE":
        return { label: "Active", variant: "success" as const };
      case "SUSPENDED":
        return { label: "Suspended", variant: "warning" as const };
      case "EXPIRED":
        return { label: "Expired", variant: "destructive" as const };
      case "CANCELLED":
        return { label: "Cancelled", variant: "outline" as const };
      default:
        return { label: status, variant: "default" as const };
    }
  };

  const { label, variant } = getStatusConfig(status);

  const variantClassNames: Record<string, string> = {
    success: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
    warning: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200",
    destructive: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
    outline: "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200",
    default: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200",
  };

  return (
    <Badge className={`${variantClassNames[variant]} ${className || ""}`}>
      {label}
    </Badge>
  );
}