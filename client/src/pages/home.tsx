import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SelectCity } from "@/components/ui/select-city";
import { StepIndicator } from "@/components/ui/step-indicator";
import { useToast } from "@/hooks/use-toast";

// Form validation schema
const formSchema = z.object({
  city: z.string().min(1, "Please select a city"),
  location: z.string().min(1, "Please select a location"),
  restaurant: z.string().min(1, "Please select a restaurant"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // React Hook Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: "",
      location: "",
      restaurant: "",
    },
  });
  
  const onSubmit = (data: FormValues) => {
    // Navigate to the restaurant menu page
    navigate(`/menu/${data.restaurant}`);
  };

  return (
    <>
      <StepIndicator 
        currentStep={1} 
        steps={["Select Location", "Choose Menu", "Checkout"]} 
      />
      
      <Card className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-heading font-semibold mb-6">Choose Your Restaurant</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <SelectCity form={form} />
            
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-primary text-white py-6 px-6 rounded-md font-medium hover:bg-primary/90 transition"
                disabled={!form.formState.isValid}
              >
                View Menu
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </>
  );
}
