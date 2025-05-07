"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AdminLayout from "@/components/layouts/AdminLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  UserIcon,
  CreditCardIcon,
  HomeIcon,
  PackageIcon,
  BadgeAlertIcon,
  CheckCircleIcon,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHouseholds: 0,
    totalCards: 0,
    totalPlans: 0,
    activeCards: 0,
    expiredCards: 0,
  });

  const [cardsByStatus, setCardsByStatus] = useState([
    { name: "Active", value: 0, fill: "#16a34a" },
    { name: "Suspended", value: 0, fill: "#ea580c" },
    { name: "Expired", value: 0, fill: "#dc2626" },
    { name: "Cancelled", value: 0, fill: "#6b7280" },
  ]);

  // In a real application, you'd fetch this data from your API
  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchData = async () => {
      // This would be replaced with actual API calls
      setStats({
        totalUsers: 24,
        totalHouseholds: 150,
        totalCards: 145,
        totalPlans: 5,
        activeCards: 120,
        expiredCards: 15,
      });

      setCardsByStatus([
        { name: "Active", value: 120, fill: "#16a34a" },
        { name: "Suspended", value: 8, fill: "#ea580c" },
        { name: "Expired", value: 15, fill: "#dc2626" },
        { name: "Cancelled", value: 2, fill: "#6b7280" },
      ]);
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "System users",
      icon: UserIcon,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Households",
      value: stats.totalHouseholds,
      description: "Registered households",
      icon: HomeIcon,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Total Cards",
      value: stats.totalCards,
      description: "All card statuses",
      icon: CreditCardIcon,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Total Plans",
      value: stats.totalPlans,
      description: "Available plans",
      icon: PackageIcon,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Active Cards",
      value: stats.activeCards,
      description: "Currently active",
      icon: CheckCircleIcon,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Expired Cards",
      value: stats.expiredCards,
      description: "Needs renewal",
      icon: BadgeAlertIcon,
      color: "bg-red-50 text-red-600",
    },
  ];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
              <CardDescription>{stat.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Card Status Distribution</CardTitle>
            <CardDescription>Current card status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cardsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "Card issued",
                  user: "John Office",
                  time: "2 hours ago",
                },
                {
                  action: "Plan updated",
                  user: "Admin User",
                  time: "5 hours ago",
                },
                {
                  action: "Household added",
                  user: "Jane Office",
                  time: "1 day ago",
                },
                {
                  action: "Card renewed",
                  user: "John Office",
                  time: "2 days ago",
                },
                {
                  action: "User created",
                  user: "Admin User",
                  time: "3 days ago",
                },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-start space-x-3 border-b pb-3 last:border-0"
                >
                  <div className="bg-muted rounded-full p-1.5">
                    <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <div className="flex text-sm text-muted-foreground">
                      <span>{activity.user}</span>
                      <span className="mx-2">•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
