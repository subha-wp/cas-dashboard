/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useRouter } from "next/navigation";
import { Card } from "@prisma/client";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { PlusIcon, MoreHorizontal } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import StatusBadge from "@/components/cards/StatusBadge";
import useSWR from "swr";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CardWithRelations = Card & {
  household: {
    headName: string;
  };
  plan: {
    name: string;
  };
};

export default function CardsPage() {
  const router = useRouter();
  const {
    data: cards,
    error,
    isLoading,
  } = useSWR<CardWithRelations[]>("/api/cards");

  const columns: ColumnDef<CardWithRelations>[] = [
    {
      accessorKey: "id",
      header: "Card ID",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.id.substring(0, 8)}</div>
      ),
    },
    {
      accessorKey: "household.headName",
      header: "Household",
    },
    {
      accessorKey: "plan.name",
      header: "Plan",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "issueDate",
      header: "Issue Date",
      cell: ({ row }) => format(new Date(row.original.issueDate), "PP"),
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry Date",
      cell: ({ row }) => {
        const expiryDate = new Date(row.original.expiryDate);
        const isExpired = expiryDate < new Date();
        return (
          <div className={isExpired ? "text-red-600" : ""}>
            {format(expiryDate, "PP")}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const card = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/admin/cards/${card.id}`)}
              >
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/admin/cards/${card.id}/edit`)}
              >
                Edit card
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // This would open a confirmation dialog before suspension
                  if (card.status === "ACTIVE") {
                    console.log("Suspend card:", card.id);
                  } else if (card.status === "SUSPENDED") {
                    console.log("Reactivate card:", card.id);
                  }
                }}
              >
                {card.status === "ACTIVE" ? "Suspend card" : "Reactivate card"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (error) {
    return (
      <AdminLayout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Cards</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <p className="text-red-600">Error loading cards: {error.message}</p>
        </div>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Cards</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Cards</h1>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Card
        </Button>
      </div>

      {/* <DataTable
        columns={columns}
        data={cards || []}
        searchColumn="household.headName"
        searchPlaceholder="Search households..."
      /> */}
    </AdminLayout>
  );
}
