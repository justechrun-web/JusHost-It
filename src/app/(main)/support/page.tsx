'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFirestore } from "@/firebase/provider";
import { collection, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SupportPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Database not available. Please try again later.',
        });
        return;
    }
    setIsSubmitting(true);
    setStatus('Sending...');

    try {
      // Writing to this collection triggers the Firebase Email Extension
      await addDoc(collection(db, "mail"), {
        to: "support@jushostit.com", // Updated branding
        message: {
          subject: `JusHostIt Inquiry: ${formData.subject}`,
          html: `
            <p><strong>From:</strong> ${formData.name} (${formData.email})</p>
            <p><strong>Message:</strong></p>
            <p>${formData.message}</p>
          `,
        },
      });
      setStatus('Message sent successfully!');
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully.',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error("Error sending message: ", error);
      setStatus('Failed to send. Please try again.');
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
       <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Contact Us</h1>
        <p className="text-muted-foreground">
          Have a question or need help? Send us a message.
        </p>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Contact JusHostIt Support</CardTitle>
          <CardDescription>Our team will get back to you as soon as possible.</CardDescription>
        </CardHeader>
        <CardContent>
           <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name"
                  type="text" 
                  placeholder="Your Name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="Your Email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input 
                  id="subject"
                  type="text" 
                  placeholder="Subject" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required 
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message"
                  placeholder="How can JusHostIt help you today?" 
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                />
            </div>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send Message
            </Button>
            {status && <p className="mt-4 text-center text-sm text-muted-foreground">{status}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
