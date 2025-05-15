import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import DailyReport from "@/models/dailyReport";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const userId = searchParams.get("userId");

    await connectToDB();

    let query: any = {};
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // If user is not admin, they can only see their own reports
    if (session.user.role !== "admin") {
      query.user = session.user.id;
    } else if (userId) {
      query.user = userId;
    }

    const reports = await DailyReport.find(query)
      .populate("user", "name email")
      .populate("tasksCompleted", "title status")
      .sort({ date: -1 });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { message: "Error fetching reports" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { summary, date, tasksCompleted } = await req.json();
    
    if (!summary) {
      return NextResponse.json(
        { message: "Summary is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Check if a report already exists for this user and date
    const existingReport = await DailyReport.findOne({
      user: session.user.id,
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(date).setHours(23, 59, 59, 999)),
      },
    });

    if (existingReport) {
      // Update existing report
      existingReport.summary = summary;
      existingReport.tasksCompleted = tasksCompleted;
      await existingReport.save();

      const populatedReport = await existingReport
        .populate("user", "name email")
        .populate("tasksCompleted", "title status");

      return NextResponse.json(populatedReport);
    }

    // Create new report
    const newReport = await DailyReport.create({
      user: session.user.id,
      date,
      summary,
      tasksCompleted,
    });

    const populatedReport = await DailyReport.findById(newReport._id)
      .populate("user", "name email")
      .populate("tasksCompleted", "title status");

    return NextResponse.json(populatedReport, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { message: "Error creating report" },
      { status: 500 }
    );
  }
}