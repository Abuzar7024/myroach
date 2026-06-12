"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { SOCIAL } from "@/lib/constants";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
});

const faqs = [
  {
    q: "What is your return policy?",
    a: "We offer complimentary returns within 30 days of delivery. Items must be unworn with original tags attached.",
  },
  {
    q: "How long does shipping take?",
    a: "Standard shipping takes 5-7 business days. Express options are available at checkout.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, we ship to over 40 countries worldwide. Duties and taxes may apply depending on your location.",
  },
  {
    q: "How can I track my order?",
    a: "Once shipped, you'll receive a tracking number via email. You can also view order status in your account.",
  },
];

export function ContactContent() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(contactSchema),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-32">
      <div className="mb-16 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-accent-cyan">hit us up, bhai</p>
        <h1 className="font-display mt-3 text-3xl sm:text-4xl md:text-5xl">Contact the Crew</h1>
      </div>

      <div className="grid gap-16 lg:grid-cols-2">
        <div>
          <form
            className="space-y-4"
            onSubmit={handleSubmit(() => {
              toast.success("Message sent! We'll respond within 24 hours.");
              reset();
            })}
          >
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} className="mt-2" />
              {errors.name && <p className="mt-1 text-xs text-red-500">Required</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" {...register("subject")} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                {...register("message")}
                rows={5}
                className="mt-2 w-full border border-noire-border bg-noire-charcoal px-4 py-3 text-base text-noire-white focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/50 sm:text-sm"
              />
            </div>
            <Button type="submit" className="w-full min-h-[44px] sm:w-auto">Send Message</Button>
          </form>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            {[
              { icon: MapPin, text: "420 Roach Lane, Bandra, Mumbai 400050" },
              { icon: Mail, text: SOCIAL.email },
              { icon: Phone, text: SOCIAL.phone },
              { icon: Clock, text: "Mon–Sat: 11am – 9pm IST" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 text-accent-cyan" />
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>

          <div className="aspect-video bg-noire-cream flex items-center justify-center border border-noire-border">
            <p className="text-sm text-noire-muted">Google Maps Placeholder</p>
          </div>
        </div>
      </div>

      <section id="faq" className="mt-20">
        <h2 className="font-display mb-8 text-2xl font-light">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="max-w-2xl">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionContent>{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
