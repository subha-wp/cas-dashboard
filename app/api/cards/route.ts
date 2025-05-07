import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { CardStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addDays } from "date-fns";

// GET /api/cards - Get all cards
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const householdId = searchParams.get("householdId");
    const status = searchParams.get("status") as CardStatus | null;
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    const where: any = {};
    if (householdId) where.householdId = householdId;
    if (status) where.status = status;

    const cards = await prisma.card.findMany({
      where,
      include: {
        household: {
          include: {
            members: true,
          },
        },
        plan: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json(cards);
  } catch (error: any) {
    console.error("[API_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/cards - Create a new card
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN and OFFICE_AGENT can create cards
    if (!["ADMIN", "OFFICE_AGENT"].includes(session.user?.role as string)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { householdId, planId, status = "ACTIVE" } = await request.json();

    // Check if household exists
    const household = await prisma.household.findUnique({
      where: { id: householdId },
    });

    if (!household) {
      return NextResponse.json(
        { error: "Household not found" },
        { status: 404 }
      );
    }

    // Check if household already has a card
    const existingCard = await prisma.card.findUnique({
      where: { householdId },
    });

    if (existingCard) {
      return NextResponse.json(
        { error: "Household already has a card" },
        { status: 409 }
      );
    }

    // Get plan details for duration calculation
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Calculate expiry date based on plan duration
    const issueDate = new Date();
    const expiryDate = addDays(issueDate, plan.durationDays);

    // Create card with transaction to ensure audit log is created
    const card = await prisma.$transaction(async (tx) => {
      // Create the card
      const newCard = await tx.card.create({
        data: {
          status: status as CardStatus,
          householdId,
          planId,
          issueDate,
          expiryDate,
          createdById: session.user?.id as string,
          updatedById: session.user?.id as string,
        },
        include: {
          household: true,
          plan: true,
        },
      });

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          userId: session.user?.id as string,
          cardId: newCard.id,
          action: "CARD_CREATED",
          metadata: {
            status,
            householdId,
            planId,
            issueDate,
            expiryDate,
          },
        },
      });

      return newCard;
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error: any) {
    console.error("[API_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/cards/:id - Update a card
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = request.url.split("/cards/")[1];
    if (!id) {
      return NextResponse.json({ error: "Card ID is required" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN and OFFICE_AGENT can update cards
    if (!["ADMIN", "OFFICE_AGENT"].includes(session.user?.role as string)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status, planId } = await request.json();

    // Verify card exists
    const existingCard = await prisma.card.findUnique({
      where: { id },
    });

    if (!existingCard) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // If changing plan, recalculate expiry date
    let expiryDate = undefined;
    
    if (planId && planId !== existingCard.planId) {
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      // Calculate new expiry date based on today + plan duration
      expiryDate = addDays(new Date(), plan.durationDays);
    }

    // Prepare update data
    const updateData: any = {
      updatedById: session.user?.id as string,
    };

    if (status) updateData.status = status;
    if (planId) updateData.planId = planId;
    if (expiryDate) updateData.expiryDate = expiryDate;

    // Update card with transaction to ensure audit log is created
    const card = await prisma.$transaction(async (tx) => {
      // Update the card
      const updatedCard = await tx.card.update({
        where: { id },
        data: updateData,
        include: {
          household: {
            include: {
              members: true,
            },
          },
          plan: true,
          createdBy: {
            select: {
              name: true,
            },
          },
          updatedBy: {
            select: {
              name: true,
            },
          },
        },
      });

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          userId: session.user?.id as string,
          cardId: id,
          action: "CARD_UPDATED",
          metadata: {
            previousStatus: existingCard.status,
            newStatus: status,
            previousPlanId: existingCard.planId,
            newPlanId: planId,
            previousExpiryDate: existingCard.expiryDate,
            newExpiryDate: expiryDate,
          },
        },
      });

      return updatedCard;
    });

    return NextResponse.json(card);
  } catch (error: any) {
    console.error("[API_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/cards/:id - Delete a card (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = request.url.split("/cards/")[1];
    if (!id) {
      return NextResponse.json({ error: "Card ID is required" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can delete cards
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify card exists
    const existingCard = await prisma.card.findUnique({
      where: { id },
    });

    if (!existingCard) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Delete card with transaction to ensure audit log is created
    await prisma.$transaction(async (tx) => {
      // Create audit log entry before deletion
      await tx.auditLog.create({
        data: {
          userId: session.user?.id as string,
          action: "CARD_DELETED",
          metadata: {
            cardId: id,
            householdId: existingCard.householdId,
            status: existingCard.status,
            planId: existingCard.planId,
          },
        },
      });

      // Delete the card
      await tx.card.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}