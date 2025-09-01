import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Brain,
  Sparkles,
  Send,
  TrendingUp,
  MapPin,
  BookOpen,
  Briefcase,
  Plus,
  X,
  Settings2,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

/**
 * Personalized Career & Skills Advisor — Responsive MVP
 * ----------------------------------------------------
 * Tech: React + Tailwind + shadcn/ui + framer-motion + recharts + lucide-react
 * Single-file, responsive, production-ready MVP with mocked data & local state.
 * You can wire APIs later (jobs, courses, auth) without changing the UI much.
 */

const CAREER_LIBRARY = [
  {
    id: "data-scientist",
    title: "Data Scientist",
    outlook: "High growth",
    medianSalary: 135000,
    skillsRequired: {
      Python: 0.9,
      "Machine Learning": 1.0,
      Statistics: 0.85,
      SQL: 0.8,
      "Data Visualization": 0.7,
      "Deep Learning": 0.6,
      "Cloud (Any)": 0.5,
    },
    sampleRoadmap: [
      "Master Python for Data (pandas, numpy)",
      "Learn ML fundamentals (supervised/unsupervised)",
      "Do 3 portfolio projects with real datasets",
      "Deploy a model (Streamlit/FastAPI)",
      "Prep with case studies & ML system design",
    ],
  },
  {
    id: "frontend-engineer",
    title: "Frontend Engineer",
    outlook: "Stable to rising",
    medianSalary: 115000,
    skillsRequired: {
      JavaScript: 1.0,
      React: 0.9,
      HTML: 0.8,
      CSS: 0.85,
      TypeScript: 0.75,
      "Web Performance": 0.6,
      "Testing (Jest/RTL)": 0.5,
    },
    sampleRoadmap: [
      "Solidify JS/TS fundamentals",
      "Build 4 UI clones + 2 original apps",
      "Master React patterns & state management",
      "Add testing & accessibility",
      "Apply with a polished portfolio",
    ],
  },
  {
    id: "product-manager",
    title: "Product Manager",
    outlook: "Competitive",
    medianSalary: 130000,
    skillsRequired: {
      "User Research": 0.9,
      "Roadmapping": 0.85,
      "Stakeholder Mgmt": 0.8,
      Analytics: 0.7,
      "Prioritization": 0.9,
      "Writing/Comms": 1.0,
      "A/B Testing": 0.6,
    },
    sampleRoadmap: [
      "Learn discovery & research methods",
      "Ship 2–3 side projects end-to-end",
      "Practice PRDs & metric trees",
      "Interview loops & case practice",
    ],
  },
];

const COURSE_LIBRARY = [
  { id: 1, title: "Intro to Python for Data", provider: "Coursera", url: "#", skill: "Python" },
  { id: 2, title: "Machine Learning Specialization", provider: "Coursera", url: "#", skill: "Machine Learning" },
  { id: 3, title: "Statistics with Python", provider: "edX", url: "#", skill: "Statistics" },
  { id: 4, title: "SQL for Data Analysis", provider: "Udemy", url: "#", skill: "SQL" },
  { id: 5, title: "React – Complete Guide", provider: "Udemy", url: "#", skill: "React" },
  { id: 6, title: "Product Management: Building Great Products", provider: "LinkedIn Learning", url: "#", skill: "Roadmapping" },
];

const MOCK_JOBS = [
  { id: 1, title: "Junior Data Scientist", company: "Acme Analytics", location: "Remote", tags: ["Python", "ML", "SQL"] },
  { id: 2, title: "Frontend Engineer (React)", company: "PixelWorks", location: "Bengaluru, IN", tags: ["React", "TypeScript", "CSS"] },
  { id: 3, title: "Associate Product Manager", company: "Nimbus", location: "Hyderabad, IN", tags: ["Roadmapping", "Analytics"] },
];

function currency(n) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function pillify(skill) {
  return skill.trim().replace(/\s+/g, " ");
}

const Section = ({ children }) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="w-full"
  >
    {children}
  </motion.section>
);

export default function App() {
  const [name, setName] = useState("Alex");
  const [location, setLocation] = useState("Bengaluru, IN");
  const [currentRole, setCurrentRole] = useState("Software Tester");
  const [skills, setSkills] = useState(["Manual Testing", "SQL", "Jira"]);
  const [newSkill, setNewSkill] = useState("");
  const [targetCareerId, setTargetCareerId] = useState("data-scientist");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [chat, setChat] = useState([
    { role: "assistant", text: "Hi! Tell me your goal and I’ll draft a roadmap." },
  ]);
  const [message, setMessage] = useState("");

  const targetCareer = useMemo(
    () => CAREER_LIBRARY.find((c) => c.id === targetCareerId)!,
    [targetCareerId]
  );

  const requiredSkills = useMemo(
    () => Object.entries(targetCareer.skillsRequired).map(([skill, weight]) => ({ skill, weight })),
    [targetCareer]
  );

  // Compute coverage and gaps
  const { coveragePct, gaps, chartData } = useMemo(() => {
    const userSet = new Set(skills.map((s) => s.toLowerCase()));
    const req = Object.entries(targetCareer.skillsRequired);
    const coveredWeights = req
      .filter(([skill]) => userSet.has(skill.toLowerCase()))
      .reduce((acc, [, w]) => acc + w, 0);
    const totalWeights = req.reduce((acc, [, w]) => acc + w, 0);
    const coverage = totalWeights ? Math.round((coveredWeights / totalWeights) * 100) : 0;
    const missing = req
      .filter(([skill]) => !userSet.has(skill.toLowerCase()))
      .map(([skill, weight]) => ({ skill, weight }));

    const chart = req.map(([skill, weight]) => ({
      name: skill,
      Required: Math.round(weight * 100),
      You: userSet.has(skill.toLowerCase()) ? Math.round(weight * 100) : 0,
    }));

    return { coveragePct: coverage, gaps: missing, chartData: chart };
  }, [skills, targetCareer]);

  const recommendedCourses = useMemo(() => {
    const gapNames = new Set(gaps.map((g) => g.skill));
    return COURSE_LIBRARY.filter((c) => gapNames.has(c.skill)).slice(0, 6);
  }, [gaps]);

  const handleAddSkill = () => {
    const s = pillify(newSkill);
    if (!s) return;
    if (!skills.map((x) => x.toLowerCase()).includes(s.toLowerCase())) {
      setSkills([...skills, s]);
    }
    setNewSkill("");
  };

  const handleRemoveSkill = (s) => {
    setSkills(skills.filter((x) => x !== s));
  };

  const handleSend = () => {
    if (!message.trim()) return;
    const m = message.trim();
    setChat((c) => [...c, { role: "user", text: m },
      {
        role: "assistant",
        text: `Based on your goal of ${targetCareer.title}, focus next on: ${gaps
          .slice(0, 3)
          .map((g) => g.skill)
          .join(", ") || "deepening current skills"}. Try a mini-project this week.`,
      },
    ]);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-slate-900 text-white grid place-items-center shadow">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">Career & Skills Advisor</h1>
              <p className="text-xs text-slate-500">Personalized roadmap • Skill gaps • Learning plan</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" className="rounded-2xl"><Settings2 className="h-4 w-4 mr-2"/>Settings</Button>
            <Button className="rounded-2xl"><Sparkles className="h-4 w-4 mr-2"/>Generate Roadmap</Button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left + Middle columns */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Profile & Goal */}
          <Section>
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Your Profile</CardTitle>
                <CardDescription>Tell us where you are and where you want to go.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="loc">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400"/>
                    <Input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} className="pl-9 rounded-xl"/>
                  </div>
                </div>
                <div>
                  <Label htmlFor="role">Current Role</Label>
                  <Input id="role" value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} className="rounded-xl"/>
                </div>
                <div className="md:col-span-3">
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((s) => (
                      <Badge key={s} variant="secondary" className="rounded-2xl px-3 py-1 text-sm flex items-center gap-1">
                        {s}
                        <button className="rounded-full hover:bg-slate-200 p-1" onClick={() => handleRemoveSkill(s)} aria-label={`Remove ${s}`}>
                          <X className="h-3 w-3"/>
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a skill (e.g., Python)" className="rounded-xl"/>
                    <Button onClick={handleAddSkill} className="rounded-2xl" aria-label="Add skill"><Plus className="h-4 w-4 mr-1"/>Add</Button>
                  </div>
                </div>
                <div className="md:col-span-3">
                  <Label>Target Career</Label>
                  <Tabs value={targetCareerId} onValueChange={setTargetCareerId} className="mt-2">
                    <TabsList className="grid grid-cols-3 rounded-2xl">
                      {CAREER_LIBRARY.map((c) => (
                        <TabsTrigger key={c.id} value={c.id} className="rounded-xl text-xs md:text-sm">{c.title}</TabsTrigger>
                      ))}
                    </TabsList>
                    {CAREER_LIBRARY.map((c) => (
                      <TabsContent key={c.id} value={c.id} className="mt-3">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                          <Badge className="rounded-2xl" variant="outline"><TrendingUp className="h-4 w-4 mr-1"/>{c.outlook}</Badge>
                          <Badge className="rounded-2xl" variant="secondary">Median: {currency(c.medianSalary)}</Badge>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
                <div className="md:col-span-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch id="adv" checked={showAdvanced} onCheckedChange={setShowAdvanced} />
                    <Label htmlFor="adv" className="text-sm text-slate-600">Show advanced inputs</Label>
                  </div>
                  <Button className="rounded-2xl"><Sparkles className="h-4 w-4 mr-2"/>Update Insights</Button>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* Insights */}
          <Section>
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Skill Gap Analysis</CardTitle>
                <CardDescription>Your coverage for the selected career.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Coverage</span>
                      <span className="text-sm text-slate-600">{coveragePct}%</span>
                    </div>
                    <Progress value={coveragePct} className="h-3 rounded-full" />
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Top Gaps</div>
                    <div className="flex flex-wrap gap-2">
                      {gaps.length === 0 ? (
                        <span className="text-sm text-slate-500">No major gaps—consider deepening expertise.</span>
                      ) : (
                        gaps
                          .sort((a, b) => b.weight - a.weight)
                          .slice(0, 6)
                          .map((g) => (
                            <Badge key={g.skill} className="rounded-2xl" variant="outline">{g.skill}</Badge>
                          ))
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">Target: {targetCareer.title}</div>
                </div>
                <div className="lg:col-span-3 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Required" />
                      <Bar dataKey="You" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* Courses + Roadmap */}
          <Section>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2"><BookOpen className="h-5 w-5"/>Recommended Courses</CardTitle>
                  <CardDescription>Resources tailored to your top gaps.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendedCourses.length === 0 ? (
                    <p className="text-sm text-slate-600">You're well covered. Consider advanced specialization courses.</p>
                  ) : (
                    recommendedCourses.map((c) => (
                      <div key={c.id} className="p-3 border rounded-xl flex items-center justify-between hover:bg-slate-50 transition">
                        <div>
                          <div className="font-medium">{c.title}</div>
                          <div className="text-xs text-slate-500">{c.provider} • Targets: {c.skill}</div>
                        </div>
                        <Button variant="outline" className="rounded-2xl">Open</Button>
                      </div>
                    ))
                  )}
                </CardContent>
                <CardFooter className="justify-end">
                  <Button variant="ghost" className="rounded-2xl">See all</Button>
                </CardFooter>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2"><TrendingUp className="h-5 w-5"/>Personalized Roadmap</CardTitle>
                  <CardDescription>Milestones to reach {targetCareer.title}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="space-y-3">
                    {targetCareer.sampleRoadmap.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="mt-1 h-6 w-6 rounded-full bg-slate-900 text-white text-xs grid place-items-center">{idx + 1}</div>
                        <div className="flex-1">
                          <div className="font-medium">{step}</div>
                          <div className="text-xs text-slate-500">Weekly action • <button className="underline">Add to planner</button></div>
                        </div>
                        <button className="rounded-full p-1 hover:bg-slate-100" aria-label="Details"><ChevronRight className="h-4 w-4"/></button>
                      </li>
                    ))}
                  </ol>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button className="rounded-2xl">Export as PDF</Button>
                </CardFooter>
              </Card>
            </div>
          </Section>

          {/* Jobs */}
          <Section>
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2"><Briefcase className="h-5 w-5"/>Job Market Snapshot</CardTitle>
                <CardDescription>Trending roles near you (mocked).</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MOCK_JOBS.map((j) => (
                  <div key={j.id} className="p-4 border rounded-xl hover:shadow-sm transition">
                    <div className="font-medium">{j.title}</div>
                    <div className="text-sm text-slate-600">{j.company}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin className="h-3 w-3"/>{j.location}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {j.tags.map((t) => (
                        <Badge key={t} variant="secondary" className="rounded-2xl">{t}</Badge>
                      ))}
                    </div>
                    <Button variant="outline" className="mt-3 w-full rounded-2xl">View</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </Section>
        </div>

        {/* Chat (Right column) */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <Section>
            <Card className="rounded-2xl shadow-sm h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2"><Sparkles className="h-5 w-5"/>AI Career Mentor</CardTitle>
                <CardDescription>Ask anything—skills, resume, interviews.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto max-h-[28rem] space-y-3 pr-1">
                {chat.map((m, idx) => (
                  <div key={idx} className={`p-3 rounded-xl text-sm ${m.role === "user" ? "bg-slate-900 text-white ml-8" : "bg-slate-100 mr-8"}`}>{m.text}</div>
                ))}
              </CardContent>
              <CardFooter className="gap-2">
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message the mentor..." className="rounded-xl resize-none"/>
                <Button onClick={handleSend} className="rounded-2xl" aria-label="Send"><Send className="h-4 w-4"/></Button>
              </CardFooter>
            </Card>
          </Section>
        </aside>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 mt-4">
        <div className="text-center text-xs text-slate-500">
          Built with ❤️ — React • Tailwind • shadcn/ui • framer-motion • recharts
        </div>
      </footer>
    </div>
  );
}
