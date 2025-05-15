import mongoose from "mongoose";

const DailyReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    summary: {
      type: String,
      required: [true, "Summary is required"],
      trim: true,
    },
    tasksCompleted: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Todo",
    }],
  },
  {
    timestamps: true,
  }
);

const DailyReport = mongoose.models.DailyReport || mongoose.model("DailyReport", DailyReportSchema);

export default DailyReport;