"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { z } from "zod";
import { format, differenceInDays } from "date-fns";
import { ChevronLeft, Upload, Loader2, X } from "lucide-react";
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
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

    const generateLeaveLetter = async (data: FormValues) => {
        // Create new PDF document
        const doc = new jsPDF();
    
        // Set default font
        doc.setFont("helvetica");
    
        // Add company letterhead with styling
        doc.setFillColor(240, 240, 240);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(50, 50, 150);
        doc.text("DISPLAY PROMOTION", 105, 20, { align: "center" });
    
        // Add decorative line
        doc.setDrawColor(50, 50, 150);
        doc.setLineWidth(0.5);
        doc.line(20, 32, 190, 32);
    
        // Add current date (right aligned)
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(format(new Date(), "MMMM d, yyyy"), 190, 40, { align: "right" });
    
        // Add recipient details with styling
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("To,", 20, 50);
        doc.setFont("helvetica", "normal");
        doc.text("The Manager", 20, 57);
        doc.text("Display Promotion", 20, 64);
        doc.text("Company Address", 20, 71);
    
        // Add subject line with background
        doc.setFillColor(240, 240, 240);
        doc.rect(20, 80, 170, 10, 'F');
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Subject: Leave Application", 25, 87);
    
        // Add salutation
        doc.setFont("helvetica", "normal");
        doc.text("Dear Sir/Madam,", 20, 100);
    
        // Add letter content with proper spacing
        const content = `I, ${session?.user?.name} from the ${data.department} department, would like to formally request leave from ${format(data.startDate, "MMMM d, yyyy")} to ${format(data.endDate, "MMMM d, yyyy")} (${totalDays} days) for ${data.leaveType === "other" ? data.otherReason : data.leaveType}.

    Reason for leave:
    ${data.reason}

    I have ensured that all my pending responsibilities are properly delegated and will remain available on my mobile phone ("provided in HR records") for any urgent matters during my absence.

    I appreciate your consideration of my request and will be grateful for your approval.`;

        const contentLines = doc.splitTextToSize(content, 170);
        doc.text(contentLines, 20, 110);
    
        // Add closing
        doc.text("Thank you for your understanding.", 20, 180);
        doc.text("Yours sincerely,", 20, 195);
        doc.setFont("helvetica", "bold");
        doc.text(session?.user?.name!, 20, 202);
        doc.setFont("helvetica", "normal");
        doc.text(data.department, 20, 209);
    
        // Add approval section with styling
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 220, 190, 220);
        doc.setFontSize(11);
        doc.text("For Office Use Only", 105, 228, { align: "center" });
        doc.text("Approved: _________________", 20, 240);
        doc.text("Date: _________________", 120, 240);
        doc.text("Manager's Signature: _________________", 20, 250);
    
        // Convert to PDF bytes
        const pdfBytes = doc.output('arraybuffer');
    
        // Create a new PDF document using pdf-lib
        const mergedPdf = await PDFDocument.create();
    
        // Add the leave letter
        const letterPdf = await PDFDocument.load(pdfBytes);
        const [letterPage] = await mergedPdf.copyPages(letterPdf, [0]);
        mergedPdf.addPage(letterPage);
    
        // Add supporting documents with better handling
        if (files && files.length > 0) {
            doc.addPage();
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text("Supporting Documents", 105, 20, { align: "center" });
        
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                try {
                    const fileArrayBuffer = await file.arrayBuffer();
                    if (file.type === 'application/pdf') {
                        const docPdf = await PDFDocument.load(fileArrayBuffer);
                        const docPages = await mergedPdf.copyPages(docPdf, docPdf.getPageIndices());
                        docPages.forEach(page => mergedPdf.addPage(page));
                    } else {
                        // For images, create a new page with proper scaling
                        const page = mergedPdf.addPage([600, 800]);
                        let image;
                        try {
                            if (file.type === 'image/jpeg') {
                                image = await mergedPdf.embedJpg(fileArrayBuffer);
                            } else if (file.type === 'image/png') {
                                image = await mergedPdf.embedPng(fileArrayBuffer);
                            }
                        
                            if (image) {
                                // Scale image to fit page while maintaining aspect ratio
                                const { width, height } = image.scaleToFit(500, 700);
                                page.drawImage(image, {
                                    x: page.getWidth() / 2 - width / 2,
                                    y: page.getHeight() / 2 - height / 2,
                                    width,
                                    height,
                                });
                            
                                // Add caption
                                page.drawText(`Attachment ${i + 1}: ${file.name}`, {
                                    x: 50,
                                    y: 30,
                                    size: 10,
                                });
                            }
                        } catch (error) {
                            console.error(`Error embedding image ${file.name}:`, error);
                            page.drawText(`Could not display ${file.name}`, {
                                x: 50,
                                y: 400,
                                size: 12,
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Error processing file ${file.name}:`, error);
                    toast.error(`Error processing file: ${file.name}`);
                }
            }
        }
    
        // Save and download the merged PDF with better filename
        const mergedBytes = await mergedPdf.save();
        const blob = new Blob([mergedBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Leave_Application_${session?.user?.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    
        toast.success("Leave application generated successfully!");
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

            <div className="space-y-4">
              <FormLabel>Supporting Documents</FormLabel>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="flex-1"
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {files.length} file(s) selected
                  </p>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
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