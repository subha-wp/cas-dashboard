import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/cards/verify?householdId=xxx
// This endpoint is specifically for hospital users to check card status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const householdId = searchParams.get("householdId");
    const memberId = searchParams.get("memberId");

    if (!householdId && !memberId) {
      return NextResponse.json(
        { error: "Either householdId or memberId is required" },
        { status: 400 }
      );
    }

    let card;

    // If searching by memberId, need to get householdId first
    if (memberId) {
      const member = await prisma.member.findUnique({
        where: { id: memberId },
        select: { householdId: true },
      });

      if (!member) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
      }

      card = await prisma.card.findUnique({
        where: { householdId: member.householdId },
        include: {
          household: {
            include: {
              members: true,
            },
          },
          plan: true,
        },
      });
    } else {
      // Direct search by householdId
      card = await prisma.card.findUnique({
        where: { householdId: householdId! },
        include: {
          household: {
            include: {
              members: true,
            },
          },
          plan: true,
        },
      });
    }

    if (!card) {
      return NextResponse.json(
        { error: "No active card found for this household" },
        { status: 404 }
      );
    }

    // Check if card is valid (ACTIVE and not expired)
    const isCardActive = card.status === "ACTIVE";
    const isCardExpired = new Date(card.expiryDate) < new Date();

    // Return verification result
    return NextResponse.json({
      verified: isCardActive && !isCardExpired,
      card: {
        id: card.id,
        status: card.status,
        issueDate: card.issueDate,
        expiryDate: card.expiryDate,
        isExpired: isCardExpired,
      },
      household: {
        id: card.household.id,
        headName: card.household.headName,
      },
      plan: {
        id: card.plan.id,
        name: card.plan.name,
      },
      members: card.household.members.map((member) => ({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        relation: member.relation,
      })),
    });
  } catch (error: any) {
    console.error("[API_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}