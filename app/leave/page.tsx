"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { z } from "zod";
import { format, differenceInDays } from "date-fns";
import { ChevronLeft, Upload, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { PDFDocument } from "pdf-lib";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const leaveTypes = [
  { value: "annual", label: "Annual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "personal", label: "Personal Leave" },
  { value: "emergency", label: "Family Emergency" },
  { value: "other", label: "Other" },
] as const;

const departments = [
  { value: "engineering", label: "Engineering" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "hr", label: "Human Resources" },
  { value: "finance", label: "Finance" },
] as const;

const formSchema = z.object({
  employeeName: z.string().min(2, "Name must be at least 2 characters"),
  employeeId: z.string().min(1, "Employee ID is required"),
  department: z.string().min(1, "Department is required"),
  leaveType: z.string().min(1, "Leave type is required"),
  otherReason: z.string().optional(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function LeavePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeName: "",
      employeeId: "",
      department: "",
      leaveType: "",
      otherReason: "",
      reason: "",
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const watchStartDate = form.watch("startDate");
  const watchEndDate = form.watch("endDate");
  const totalDays = watchStartDate && watchEndDate
    ? differenceInDays(watchEndDate, watchStartDate) + 1
    : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const isValidType = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      if (!isValidType) toast.error(`Invalid file type: ${file.name}`);
      if (!isValidSize) toast.error(`File too large: ${file.name}`);
      return isValidType && isValidSize;
    });
    setFiles(validFiles);
  };

  const generateLeaveLetter = async (data: FormValues) => {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add company letterhead
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Company Name", 105, 20, { align: "center" });
    
    // Add current date
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(format(new Date(), "MMMM d, yyyy"), 20, 40);
    
    // Add recipient details
    doc.text("HR Manager", 20, 55);
    doc.text("Company Name", 20, 62);
    
    // Add subject line
    doc.setFont("helvetica", "bold");
    doc.text("Subject: Leave Application", 20, 82);
    
    // Add letter content
    doc.setFont("helvetica", "normal");
    const content = `Dear Sir/Madam,

I, ${data.employeeName} (Employee ID: ${data.employeeId}) from the ${data.department} department, would like to request leave from ${format(data.startDate, "MMMM d, yyyy")} to ${format(data.endDate, "MMMM d, yyyy")} (${totalDays} days) for ${data.leaveType === "other" ? data.otherReason : data.leaveType}.

Reason for leave:
${data.reason}

I will ensure all my responsibilities are properly handed over and will be available on phone if needed.

Thank you for your consideration.

Sincerely,
${data.employeeName}
${data.employeeId}`;

    const contentLines = doc.splitTextToSize(content, 170);
    doc.text(contentLines, 20, 100);
    
    // Add approval section
    doc.text("Approved By: _________________", 20, 230);
    doc.text("Date: _________________", 20, 240);

    // Convert to PDF bytes
    const pdfBytes = doc.output('arraybuffer');
    
    // Create a new PDF document using pdf-lib
    const mergedPdf = await PDFDocument.create();
    
    // Add the leave letter
    const letterPdf = await PDFDocument.load(pdfBytes);
    const [letterPage] = await mergedPdf.copyPages(letterPdf, [0]);
    mergedPdf.addPage(letterPage);
    
    // Add supporting documents
    for (const file of files) {
      try {
        const fileArrayBuffer = await file.arrayBuffer();
        if (file.type === 'application/pdf') {
          const docPdf = await PDFDocument.load(fileArrayBuffer);
          const docPages = await mergedPdf.copyPages(docPdf, docPdf.getPageIndices());
          docPages.forEach(page => mergedPdf.addPage(page));
        } else {
          // For images, create a new page and embed the image
          const page = mergedPdf.addPage();
          let image;
          if (file.type === 'image/jpeg') {
            image = await mergedPdf.embedJpg(fileArrayBuffer);
          } else if (file.type === 'image/png') {
            image = await mergedPdf.embedPng(fileArrayBuffer);
          }
          if (image) {
            const { width, height } = image.scale(0.5);
            page.drawImage(image, {
              x: page.getWidth() / 2 - width / 2,
              y: page.getHeight() / 2 - height / 2,
              width,
              height,
            });
          }
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        toast.error(`Error processing file: ${file.name}`);
      }
    }
    
    // Save and download the merged PDF
    const mergedBytes = await mergedPdf.save();
    const blob = new Blob([mergedBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leave_application_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      await generateLeaveLetter(data);
      toast.success("Leave application generated successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error generating leave application:", error);
      toast.error("Error generating leave application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Leave Application</h1>
        <p className="text-muted-foreground">
          Fill out the form below to submit your leave application
        </p>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="employeeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your employee ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="leaveType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("leaveType") === "other" && (
              <FormField
                control={form.control}
                name="otherReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify Other Leave Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter leave type" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < watchStartDate ||
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Total Days:</span>
              <span className="font-medium">{totalDays}</span>
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Leave</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter detailed reason for leave"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Supporting Documents</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={() => setFiles([])}>
                  Clear
                </Button>
              </div>
              {files.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {files.length} file(s) selected
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Generate Leave Application
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}