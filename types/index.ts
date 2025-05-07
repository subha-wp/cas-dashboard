import { Card, CardStatus, Household, Member, MemberRelation, Plan, User, UserRole } from "@prisma/client";

export type HouseholdWithMembers = Household & {
  members: Member[];
  card?: Card & {
    plan: Plan;
  };
};

export type CardWithDetails = Card & {
  household: Household & {
    members: Member[];
  };
  plan: Plan;
  createdBy: User;
  updatedBy: User;
};

export type PlanWithCards = Plan & {
  cards: Card[];
};

export interface ServerPageProps {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export type { 
  User, 
  Card, 
  Plan, 
  Member, 
  Household, 
  CardStatus, 
  UserRole, 
  MemberRelation 
};

export interface CardFormData {
  householdId: string;
  planId: string;
  status: CardStatus;
  issueDate: string;
}

export interface HouseholdFormData {
  headName: string;
  address: string;
  phone: string;
}

export interface MemberFormData {
  firstName: string;
  lastName: string;
  dob: string;
  relation: MemberRelation;
  householdId: string;
}

export interface PlanFormData {
  name: string;
  description: string;
  price: string;
  durationDays: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}