"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
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
import { BeltSelector, BELT_CONFIGS } from "@/components/belt-select";
import { cn } from "@/lib/utils";

type YearsOfExperience =
  | "less-than-6-months"
  | "6-months-to-2-years"
  | "2-years-plus";

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

const BELT_DISCIPLINE_NAMES = Object.keys(BELT_CONFIGS);

interface BeltSelection {
  discipline: string;
  belt: string;
  stripe?: number;
  dan?: number;
}

interface FormData {
  name: string;
  username: string;
  dateOfBirth: Date | undefined;
  country: Country | undefined;
  disciplines: string[];
  belts: BeltSelection[];
  yearsOfExperience: YearsOfExperience | "";
  goals: string[];
}

function getAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export default function AccountSetupForm() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const createUser = useMutation(api.users.createUser);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: user?.fullName ?? "",
    username: user?.username ?? "",
    dateOfBirth: undefined,
    country: undefined,
    disciplines: [],
    belts: [],
    yearsOfExperience: "",
    goals: [],
  });

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Username uniqueness check
  const usernameCheck = useQuery(
    api.users.checkUsername,
    formData.username.trim() ? { username: formData.username.trim() } : "skip",
  );
  const isUsernameTaken = usernameCheck !== undefined && !usernameCheck.available;

  // Whether the user selected any belt-based disciplines
  const selectedBeltDisciplines = useMemo(
    () => formData.disciplines.filter((d) => BELT_DISCIPLINE_NAMES.includes(d)),
    [formData.disciplines],
  );
  const hasBeltStep = selectedBeltDisciplines.length > 0;

  // Dynamic step mapping
  // 1: Name, 2: Username, 3: DOB, 4: Country, 5: Disciplines,
  // 6: Belts (conditional), 6/7: Experience, 7/8: Goals
  const totalSteps = hasBeltStep ? 8 : 7;
  const STEP_BELT = 6;

  // Map a logical step to its actual meaning, accounting for the conditional belt step
  const getStepId = (s: number): string => {
    if (s <= 5) return ["name", "username", "dob", "country", "disciplines"][s - 1];
    if (hasBeltStep) {
      if (s === 6) return "belts";
      if (s === 7) return "experience";
      return "goals";
    }
    if (s === 6) return "experience";
    return "goals";
  };

  // DOB validation
  const dobError = useMemo(() => {
    if (!formData.dateOfBirth) return null;
    const age = getAge(formData.dateOfBirth);
    if (age < 16) return "You must be at least 16 years old.";
    if (age > 120) return "Please enter a valid date of birth.";
    return null;
  }, [formData.dateOfBirth]);

  const canProceed = () => {
    const stepId = getStepId(step);
    switch (stepId) {
      case "name":
        return formData.name.trim() !== "";
      case "username":
        return formData.username.trim() !== "" && !isUsernameTaken && usernameCheck !== undefined;
      case "dob":
        return formData.dateOfBirth !== undefined && !dobError;
      case "country":
        return formData.country !== undefined;
      case "disciplines":
        return formData.disciplines.length > 0;
      case "belts":
        // Every selected belt discipline must have a belt chosen
        return selectedBeltDisciplines.every((d) =>
          formData.belts.some((b) => b.discipline === d && b.belt),
        );
      case "experience":
        return formData.yearsOfExperience !== "";
      case "goals":
        return formData.goals.length > 0;
      default:
        return false;
    }
  };

  const toggleArrayItem = (field: "disciplines" | "goals", value: string) => {
    setFormData((prev) => {
      const isRemoving = prev[field].includes(value);
      const updated = isRemoving
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value];

      if (field === "disciplines") {
        if (isRemoving) {
          return { ...prev, [field]: updated, belts: prev.belts.filter((b) => b.discipline !== value) };
        }
        // Auto-create default belt entry when adding a belt discipline
        if (BELT_DISCIPLINE_NAMES.includes(value)) {
          return { ...prev, [field]: updated, belts: [...prev.belts, { discipline: value, belt: "White" }] };
        }
      }

      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = async () => {
    if (
      !canProceed() ||
      !formData.dateOfBirth ||
      !formData.country ||
      !formData.yearsOfExperience
    )
      return;

    if (!isLoaded || !isSignedIn || !user || !isAuthenticated) {
      console.error("User not authenticated");
      return;
    }

    setIsSubmitting(true);
    try {
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
        belts: formData.belts.length > 0 ? formData.belts : undefined,
      });
      router.push("/courses");
    } catch (error) {
      console.error("Error creating user:", error);
      setIsSubmitting(false);
    }
  };

  const stepId = getStepId(step);

  return (
    <Card className="w-full max-w-lg border-transparent bg-transparent">
      <CardHeader>
        <CardTitle className="text-xl">
          {stepId === "name" && "What's your name?"}
          {stepId === "username" && "Choose a username"}
          {stepId === "dob" && "When were you born?"}
          {stepId === "country" && "Where are you located?"}
          {stepId === "disciplines" && "What do you train?"}
          {stepId === "belts" && "What's your belt rank?"}
          {stepId === "experience" && "Years of experience"}
          {stepId === "goals" && "What are your goals?"}
        </CardTitle>
        <CardDescription>
          {stepId === "name" && "Tell us how you'd like to be called."}
          {stepId === "username" && "Pick a unique username for your profile."}
          {stepId === "dob" && "Your date of birth helps us personalize your experience."}
          {stepId === "country" && "Your country helps us connect you with nearby training."}
          {stepId === "disciplines" && "Select all disciplines you practice."}
          {stepId === "belts" && "Select your current belt for each discipline."}
          {stepId === "experience" && "How many years have you been training?"}
          {stepId === "goals" && "What are you training for?"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Step: Name */}
        {stepId === "name" && (
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

        {/* Step: Username */}
        {stepId === "username" && (
          <div className="space-y-2">
            <Input
              id="username"
              placeholder="Pick a username"
              className={cn(
                "onboarding border-transparent bg-transparent",
                isUsernameTaken && "border-destructive! ring-destructive/30 ring-2",
              )}
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, username: e.target.value }))
              }
            />
            {isUsernameTaken && (
              <p className="text-sm text-destructive">
                That username is already taken.
              </p>
            )}
          </div>
        )}

        {/* Step: Date of Birth */}
        {stepId === "dob" && (
          <div className="space-y-2">
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "onboarding w-full justify-start text-left font-normal border-transparent bg-transparent",
                    dobError && "border-destructive! ring-destructive/30 ring-2",
                  )}
                >
                  {formData.dateOfBirth
                    ? formData.dateOfBirth.toLocaleDateString()
                    : "Select date"}
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
            {dobError && (
              <p className="text-sm text-destructive">{dobError}</p>
            )}
          </div>
        )}

        {/* Step: Country */}
        {stepId === "country" && (
          <div className="space-y-2">
            <CountryDropdown
              placeholder="Select a country"
              onChange={(country) =>
                setFormData((prev) => ({ ...prev, country }))
              }
            />
          </div>
        )}

        {/* Step: Disciplines */}
        {stepId === "disciplines" && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {DISCIPLINES.map((d) => (
                <Button
                  key={d}
                  type="button"
                  variant={
                    formData.disciplines.includes(d) ? "default" : "outline"
                  }
                  onClick={() => toggleArrayItem("disciplines", d)}
                  className="rounded-full"
                >
                  {d}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Belt Selection */}
        {stepId === "belts" && (
          <div className="space-y-8">
            {selectedBeltDisciplines.map((discipline) => {
              const config = BELT_CONFIGS[discipline];
              if (!config) return null;
              const currentBelt = formData.belts.find(
                (b) => b.discipline === discipline,
              );

              return (
                <div key={discipline} className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground text-center">
                    {discipline}
                  </h3>
                  <BeltSelector
                    belts={config.belts}
                    maxStripes={config.maxStripes}
                    maxDan={config.maxDan}
                    initialBelt={currentBelt?.belt}
                    initialStripe={currentBelt?.stripe}
                    initialDan={currentBelt?.dan}
                    onChange={(belt, stripe, dan) => {
                      setFormData((prev) => ({
                        ...prev,
                        belts: prev.belts.map((b) =>
                          b.discipline === discipline
                            ? {
                                discipline,
                                belt,
                                stripe: stripe > 0 ? stripe : undefined,
                                dan: dan > 0 ? dan : undefined,
                              }
                            : b,
                        ),
                      }));
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Step: Years of Experience */}
        {stepId === "experience" && (
          <div className="space-y-2">
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant={
                  formData.yearsOfExperience === "less-than-6-months"
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    yearsOfExperience: "less-than-6-months" as YearsOfExperience,
                  }))
                }
                className="w-full justify-start"
              >
                Less than 6 months
              </Button>
              <Button
                type="button"
                variant={
                  formData.yearsOfExperience === "6-months-to-2-years"
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    yearsOfExperience: "6-months-to-2-years" as YearsOfExperience,
                  }))
                }
                className="w-full justify-start"
              >
                6 months - 2 years
              </Button>
              <Button
                type="button"
                variant={
                  formData.yearsOfExperience === "2-years-plus"
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    yearsOfExperience: "2-years-plus" as YearsOfExperience,
                  }))
                }
                className="w-full justify-start"
              >
                2 years +
              </Button>
            </div>
          </div>
        )}

        {/* Step: Goals */}
        {stepId === "goals" && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <Button
                  key={g}
                  type="button"
                  variant={
                    formData.goals.includes(g) ? "default" : "outline"
                  }
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

        {step < totalSteps ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
          >
            Continue
            <ArrowRight size={16} />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting || isAuthLoading || !isAuthenticated}
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
