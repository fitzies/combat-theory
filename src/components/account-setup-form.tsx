"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { CountryDropdown, type Country } from "@/components/country-dropdown";
import { cn } from "@/lib/utils";

type YearsOfExperience = "less-than-6-months" | "6-months-to-2-years" | "2-years-plus";

const DISCIPLINES = [
  "Brazilian Jiu-Jitsu",
  "Muay Thai",
  "Boxing",
  "Wrestling",
  "MMA",
  "Judo",
  "Karate",
  "Taekwondo",
] as const;

const GOALS = [
  "Competition",
  "Self-defense",
  "Fitness",
  "Hobby",
  "Professional fighting",
  "Coaching",
] as const;

interface FormData {
  name: string;
  username: string;
  dateOfBirth: Date | undefined;
  country: Country | undefined;
  disciplines: string[];
  yearsOfExperience: YearsOfExperience | "";
  goals: string[];
}

const TOTAL_STEPS = 7;

export default function AccountSetupForm() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const createUser = useMutation(api.users.createUser);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: user?.fullName ?? "",
    username: user?.username ?? "",
    dateOfBirth: undefined,
    country: undefined,
    disciplines: [],
    yearsOfExperience: "",
    goals: [],
  });

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.trim() !== "";
      case 2:
        return formData.username.trim() !== "";
      case 3:
        return formData.dateOfBirth !== undefined;
      case 4:
        return formData.country !== undefined;
      case 5:
        return formData.disciplines.length > 0;
      case 6:
        return formData.yearsOfExperience !== "";
      case 7:
        return formData.goals.length > 0;
      default:
        return false;
    }
  };

  const toggleArrayItem = (field: "disciplines" | "goals", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async () => {
    if (!canProceed() || !formData.dateOfBirth || !formData.country || !formData.yearsOfExperience) return;
    
    // Ensure user is authenticated before submitting
    if (!isLoaded || !isSignedIn || !user) {
      console.error("User not authenticated");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert years of experience to a number for storage
      // less-than-6-months = 0, 6-months-to-2-years = 1.5, 2-years-plus = 2
      const yearsOfExperienceMap: Record<YearsOfExperience, number> = {
        "less-than-6-months": 0,
        "6-months-to-2-years": 1.5,
        "2-years-plus": 2,
      };

      await createUser({
        name: formData.name,
        username: formData.username,
        imageUrl: user.imageUrl,
        dateOfBirth: formData.dateOfBirth.getTime(),
        country: formData.country.name,
        disciplines: formData.disciplines,
        yearsOfExperience: yearsOfExperienceMap[formData.yearsOfExperience],
        goals: formData.goals,
      });
      router.push("/courses");
    } catch (error) {
      console.error("Error creating user:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg border-transparent">
      <CardHeader>
        <CardTitle className="text-xl">
          {step === 1 && "What's your name?"}
          {step === 2 && "Choose a username"}
          {step === 3 && "When were you born?"}
          {step === 4 && "Where are you located?"}
          {step === 5 && "What do you train?"}
          {step === 6 && "Years of experience"}
          {step === 7 && "What are your goals?"}
        </CardTitle>
        <CardDescription>
          {step === 1 && "Tell us how you'd like to be called."}
          {step === 2 && "Pick a unique username for your profile."}
          {step === 3 && "Your date of birth helps us personalize your experience."}
          {step === 4 && "Your country helps us connect you with nearby training."}
          {step === 5 && "Select all disciplines you practice."}
          {step === 6 && "How many years have you been training?"}
          {step === 7 && "What are you training for?"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {step === 1 && (
          <div className="space-y-2">
            <Input
              id="name"
              placeholder="Your name"
              value={formData.name}
              className="onboarding border-transparent bg-transparent"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <Input
              id="username"
              placeholder="Pick a username"
              className="onboarding border-transparent bg-transparent"
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2">
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="onboarding w-full justify-start text-left font-normal border-transparent bg-transparent"
                >
                  {formData.dateOfBirth ? (
                    formData.dateOfBirth.toLocaleDateString()
                  ) : (
                    "Select date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dateOfBirth}
                  defaultMonth={formData.dateOfBirth}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setFormData((prev) => ({ ...prev, dateOfBirth: date }));
                    setDatePickerOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-2">
            <CountryDropdown
              placeholder="Select a country"
              onChange={(country) =>
                setFormData((prev) => ({ ...prev, country }))
              }
            />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {DISCIPLINES.map((d) => (
                <Button
                  key={d}
                  type="button"
                  variant={formData.disciplines.includes(d) ? "default" : "outline"}
                  onClick={() => toggleArrayItem("disciplines", d)}
                  className="rounded-full"
                >
                  {d}
                </Button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-2">
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant={formData.yearsOfExperience === "less-than-6-months" ? "default" : "outline"}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, yearsOfExperience: "less-than-6-months" as YearsOfExperience }))
                }
                className="w-full justify-start"
              >
                Less than 6 months
              </Button>
              <Button
                type="button"
                variant={formData.yearsOfExperience === "6-months-to-2-years" ? "default" : "outline"}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, yearsOfExperience: "6-months-to-2-years" as YearsOfExperience }))
                }
                className="w-full justify-start"
              >
                6 months - 2 years
              </Button>
              <Button
                type="button"
                variant={formData.yearsOfExperience === "2-years-plus" ? "default" : "outline"}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, yearsOfExperience: "2-years-plus" as YearsOfExperience }))
                }
                className="w-full justify-start"
              >
                2 years +
              </Button>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <Button
                  key={g}
                  type="button"
                  variant={formData.goals.includes(g) ? "default" : "outline"}
                  onClick={() => toggleArrayItem("goals", g)}
                  className="rounded-full"
                >
                  {g}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {step > 1 ? (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft size={16} />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < TOTAL_STEPS ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
            Continue
            <ArrowRight size={16} />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Check size={16} />
                Finish
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
