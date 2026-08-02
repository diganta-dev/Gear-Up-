import { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, MessageSquare, HelpCircle } from "lucide-react";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Us | Gear Up Support & Inquiries",
  description:
    "Have questions about renting gear, listing your equipment, or payment issues? Contact the Gear Up team today.",
};

const CONTACT_INFO = [
  {
    icon: Mail,
    title: "Email Us",
    detail: "support@gearup.com",
    subDetail: "Average response time: 2-4 hours",
    href: "mailto:support@gearup.com",
  },
  {
    icon: Phone,
    title: "Call Us",
    detail: "+880 1700-000000",
    subDetail: "Mon-Fri from 9am to 8pm",
    href: "tel:+8801700000000",
  },
  {
    icon: MapPin,
    title: "Headquarters",
    detail: "Dhaka, Bangladesh",
    subDetail: "Tech Hub Tower, Level 8",
    href: "#",
  },
  {
    icon: Clock,
    title: "Support Hours",
    detail: "24/7 Digital Support",
    subDetail: "Always here when you need us",
    href: "#",
  },
];

const FAQS = [
  {
    question: "How do I rent equipment on Gear Up?",
    answer:
      "Simply browse available gear on our Browse Gear page, select your start and end rental dates, and click 'Book Rental'. Follow the checkout prompts to complete your order.",
  },
  {
    question: "How do I list my gear as a Provider?",
    answer:
      "Register or switch your account role to Provider, navigate to your Provider Dashboard, and click 'Add New Gear'. Enter specs, pricing, and images to list your item instantly.",
  },
  {
    question: "What happens if gear is damaged during rental?",
    answer:
      "All rentals are covered under Gear Up's Community Trust policy. Providers and renters inspect gear upon pickup and return. Damaged items are evaluated according to our terms.",
  },
  {
    question: "How do status updates work for rental orders?",
    answer:
      "Providers can confirm incoming orders, mark items as picked up, and confirm returns directly inside their Provider Dashboard in real-time.",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-muted/50 via-background to-background pt-16 pb-16">
        <div className="container mx-auto px-4 text-center max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <MessageSquare className="h-4 w-4" />
            WE&apos;RE HERE TO HELP
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
            Contact Support & Inquiries
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Have questions about a rental order, listing equipment, or account settings? Get in touch with our team.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Details Column */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold tracking-tight">Get in Touch</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fill out the contact form or reach out to us directly through any of our channels below.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {CONTACT_INFO.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.title}
                      href={item.href}
                      className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm hover:border-primary/50 transition-colors flex items-start gap-4"
                    >
                      <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {item.title}
                        </p>
                        <p className="text-base font-bold text-foreground">{item.detail}</p>
                        <p className="text-xs text-muted-foreground">{item.subDetail}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <div className="p-6 sm:p-8 rounded-2xl border bg-card text-card-foreground shadow-sm space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight">Send Us a Message</h3>
                  <p className="text-xs text-muted-foreground">
                    We typically respond to inquiries within a few hours.
                  </p>
                </div>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 border-t bg-muted/20">
        <div className="container mx-auto px-4 max-w-4xl space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <HelpCircle className="h-4 w-4" />
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Common Questions</h2>
            <p className="text-muted-foreground text-sm">
              Quick answers to common inquiries regarding Gear Up rentals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQS.map((faq) => (
              <div
                key={faq.question}
                className="p-6 rounded-xl border bg-card shadow-sm space-y-2"
              >
                <h3 className="font-bold text-base tracking-tight text-foreground">
                  {faq.question}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
