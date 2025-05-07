import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow, format } from "date-fns";
import { CardWithDetails } from "@/types";
import StatusBadge from "@/components/cards/StatusBadge";

interface CardDetailsProps {
  card: CardWithDetails;
}

export default function CardDetails({ card }: CardDetailsProps) {
  return (
    <Card className="w-full mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Card #{card.id.substring(0, 8)}</CardTitle>
            <CardDescription>
              Issued to {card.household.headName}'s Household
            </CardDescription>
          </div>
          <StatusBadge status={card.status} className="ml-2" />
        </div>
      </CardHeader>
      
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Plan</h3>
            <p className="font-medium">{card.plan.name}</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Issue Date</h3>
            <p className="font-medium">{format(new Date(card.issueDate), "PPP")}</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">Expiry Date</h3>
            <p className="font-medium">
              {format(new Date(card.expiryDate), "PPP")}
              <span className="ml-2 text-sm text-muted-foreground">
                ({new Date(card.expiryDate) > new Date() 
                  ? `Expires in ${formatDistanceToNow(new Date(card.expiryDate))}` 
                  : `Expired ${formatDistanceToNow(new Date(card.expiryDate))} ago`})
              </span>
            </p>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Covered Members</h3>
          <div className="bg-muted/50 rounded-md p-3">
            <table className="w-full">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="text-left pb-2">Name</th>
                  <th className="text-left pb-2">Relation</th>
                  <th className="text-left pb-2">Date of Birth</th>
                </tr>
              </thead>
              <tbody>
                {card.household.members.map((member) => (
                  <tr key={member.id} className="border-t border-muted">
                    <td className="py-2">{member.firstName} {member.lastName}</td>
                    <td className="py-2 capitalize">{member.relation.toLowerCase()}</td>
                    <td className="py-2">{format(new Date(member.dob), "PP")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground border-t pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-2">
          <div>Created by {card.createdBy.name} on {format(new Date(card.createdAt), "PPp")}</div>
          <div className="sm:text-right">Last updated by {card.updatedBy.name} on {format(new Date(card.updatedAt), "PPp")}</div>
        </div>
      </CardFooter>
    </Card>
  );
}