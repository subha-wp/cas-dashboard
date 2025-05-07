/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SearchIcon, CheckCircle2Icon, XCircleIcon, Clock } from "lucide-react";
import HospitalLayout from "@/components/layouts/HospitalLayout";
import { format } from "date-fns";
import StatusBadge from "@/components/cards/StatusBadge";

interface VerificationResult {
  verified: boolean;
  card: {
    id: string;
    status: string;
    issueDate: string;
    expiryDate: string;
    isExpired: boolean;
  };
  household: {
    id: string;
    headName: string;
  };
  plan: {
    id: string;
    name: string;
  };
  members: {
    id: string;
    firstName: string;
    lastName: string;
    relation: string;
  }[];
}

export default function VerifyPage() {
  const [searchType, setSearchType] = useState("householdId");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError("Please enter a search value");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `/api/cards/verify?${searchType}=${searchValue}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to verify card");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while verifying the card");
    } finally {
      setLoading(false);
    }
  };

  return (
    <HospitalLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Verify Card Eligibility
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Card Verification</CardTitle>
              <CardDescription>
                Enter the household ID or member ID to verify card status and
                eligibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search by</Label>
                <RadioGroup
                  defaultValue="householdId"
                  value={searchType}
                  onValueChange={setSearchType}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="householdId" id="householdId" />
                    <Label htmlFor="householdId">Household ID</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="memberId" id="memberId" />
                    <Label htmlFor="memberId">Member ID</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="searchValue">Enter ID</Label>
                <div className="flex space-x-2">
                  <Input
                    id="searchValue"
                    placeholder={`Enter ${
                      searchType === "householdId" ? "household" : "member"
                    } ID`}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                  <Button
                    type="button"
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    {loading ? (
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <SearchIcon className="h-4 w-4 mr-2" />
                    )}
                    Verify
                  </Button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {result && (
            <Card
              className={
                result.verified ? "border-green-200" : "border-red-200"
              }
            >
              <CardHeader
                className={result.verified ? "bg-green-50" : "bg-red-50"}
              >
                <div className="flex items-center space-x-2">
                  {result.verified ? (
                    <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                  )}
                  <CardTitle>
                    {result.verified ? "Coverage Verified" : "Not Eligible"}
                  </CardTitle>
                </div>
                <CardDescription>
                  {result.verified
                    ? "This household has active coverage"
                    : "This household does not have active coverage"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Household</p>
                    <p className="font-medium">{result.household.headName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="font-medium">{result.plan.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <StatusBadge status={result.card.status as any} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expiry</p>
                    <p
                      className={`font-medium ${
                        result.card.isExpired ? "text-red-600" : ""
                      }`}
                    >
                      {format(new Date(result.card.expiryDate), "PP")}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Covered Members</p>
                  <div className="bg-muted/50 rounded-md p-3">
                    <table className="w-full">
                      <thead className="text-xs text-muted-foreground">
                        <tr>
                          <th className="text-left pb-2">Name</th>
                          <th className="text-left pb-2">Relation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.members.map((member) => (
                          <tr key={member.id} className="border-t border-muted">
                            <td className="py-2">
                              {member.firstName} {member.lastName}
                            </td>
                            <td className="py-2 capitalize">
                              {member.relation.toLowerCase()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 text-sm text-muted-foreground">
                Card #{result.card.id.substring(0, 8)}
              </CardFooter>
            </Card>
          )}

          {!result && !loading && (
            <Card className="border-dashed border-muted h-full flex items-center justify-center">
              <CardContent className="py-12 text-center">
                <SearchIcon className="h-12 w-12 text-muted mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Enter a household or member ID to verify eligibility
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </HospitalLayout>
  );
}
