import mongoose from "mongoose";

const EditHistorySchema = new mongoose.Schema({
  editor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  editedAt: {
    type: Date,
    default: Date.now,
  },
  previousVersion: {
    title: String,
    description: String,
    status: String,
    incompleteReason: String,
    dueDate: Date,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    priority: String,
    images: [String],
  },
});

const TodoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["complete", "incomplete"],
      default: "incomplete",
    },
    incompleteReason: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned user is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
    },
    priority: {
      type: String,
      enum: ["urgent", "none"],
      default: "none",
    },
    version: {
      type: Number,
      default: 1,
    },
    editHistory: [EditHistorySchema],
  },
  {
    timestamps: true,
  }
);

const Todo = mongoose.models.Todo || mongoose.model("Todo", TodoSchema);

export default Todo;