/**
 * Interview Coach Page Component
 * -----------------------------
 * This page allows users to practice mock interviews based on their resume and target job.
 * It provides AI-powered interview questions and analysis.
 */

import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { Mic, Upload, Send, Loader2, Download } from "lucide-react";
import { API_ENDPOINTS } from "@/config";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateInterviewPDF } from "@/utils/pdfGenerator";
import { useToast } from '@/components/ui/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface InterviewAnalysis {
  questionAnalysis: {
    question: string;
    answer: string;
    feedback: string;
  }[];
  overallAnalysis: string;
}

const InterviewCoach = () => {
  const { toast } = useToast();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [interviewAnalysis, setInterviewAnalysis] = useState<InterviewAnalysis | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (sessionId) setSessionId(null);
    };
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const startInterview = async () => {
    if (!resumeFile || !jobDescription) {
      toast({
        title: 'Missing Input',
        description: 'Please upload a resume and enter a job description.',
        variant: 'destructive',
      });
      return;
    }

    setIsStarting(true);
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("job_description", jobDescription);

    try {
      const res = await fetch(API_ENDPOINTS.INTERVIEW_COACH_START, {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to start interview');
      }
      
      const data = await res.json();
      if (!data.session_id || !data.question) {
        throw new Error('Invalid response from server');
      }
      
      setSessionId(data.session_id);
      setMessages([{ role: 'assistant', content: data.question }]);
      setIsInterviewActive(true);
      toast({ title: 'Interview Started', description: 'Respond to each question in turn.' });
    } catch (error) {
      console.error('Interview start error:', error);
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Could not start interview.', 
        variant: 'destructive' 
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || !sessionId) return;

    setIsProcessing(true);
    setMessages([...messages, { role: 'user', content: userAnswer }]);
    setUserAnswer("");

    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('answer', userAnswer);

      const res = await fetch(API_ENDPOINTS.INTERVIEW_COACH_SUBMIT, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.status === "success") {
        if (data.isComplete) {
          setInterviewAnalysis(data.analysis);
          setIsInterviewActive(false);
          setMessages(prev => [...prev, { role: 'assistant', content: 'Interview complete! See your analysis below.' }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: data.nextQuestion }]);
        }
      }
    } catch (error) {
      console.error('Submit answer error:', error);
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to submit answer.', 
        variant: 'destructive' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!interviewAnalysis) return;
    try {
      const pdfBuffer = await generateInterviewPDF(interviewAnalysis);
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'interview-analysis.pdf';
      link.click();
    } catch {
      toast({ title: 'Error', description: 'PDF generation failed.', variant: 'destructive' });
    }
  };

  return (
    <MainLayout>
      <div className="py-12 bg-gray-50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Mic className="h-12 w-12 text-portfolioai-accent mx-auto" />
            <h1 className="text-3xl font-bold text-portfolioai-primary">AI Interview Coach</h1>
            <p className="mt-3 text-gray-600">
              Get role specific interview practice with analysis and improvement tips.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Upload Resume</CardTitle>
                <CardDescription>Select your resume in PDF format</CardDescription>
              </CardHeader>
              <CardContent>
                <Input type="file" accept=".pdf" onChange={handleFileChange} />
                {resumeFile && <p className="text-sm text-gray-600 mt-2">Selected: {resumeFile.name}</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>Paste your target job's description</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea rows={8} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button onClick={startInterview} disabled={isStarting || isInterviewActive}>
              {isStarting ? (<><Loader2 className="h-4 w-4 animate-spin mr-2" />Starting...</>) : 'Start Mock Interview'}
            </Button>
          </div>

          {isInterviewActive && (
            <Card className="mt-8">
              <CardHeader><CardTitle>Mock Interview</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] rounded-md border p-4 mb-4">
                  <div className="space-y-4">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] p-4 rounded-lg ${msg.role === 'assistant' ? 'bg-gray-100 text-gray-900' : 'bg-portfolioai-primary text-white'}`}>{msg.content}</div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <form onSubmit={handleSubmitAnswer} className="flex gap-2">
                  <Textarea value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} rows={3} placeholder="Type your answer here..." className="flex-1" />
                  <Button type="submit" disabled={isProcessing || !userAnswer.trim()}>
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {interviewAnalysis && (
            <div className="mt-10">
              <Card className="mt-6">
                <CardHeader><CardTitle>Interview Feedback</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {interviewAnalysis.questionAnalysis.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <p className="font-semibold">Q{i + 1}: {item.question}</p>
                      <p><strong>Your Answer:</strong> {item.answer}</p>
                      <p><strong>Feedback:</strong> {item.feedback}</p>
                    </div>
                  ))}
                  <div className="mt-6">
                    <h4 className="font-semibold text-xl">Overall Analysis</h4>
                    <p className="text-gray-700 mt-2 whitespace-pre-wrap">{interviewAnalysis.overallAnalysis}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default InterviewCoach;
