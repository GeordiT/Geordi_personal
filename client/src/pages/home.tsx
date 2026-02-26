import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X, ChevronDown, ChevronUp, Clock, GraduationCap, Globe, Languages, Send, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import profileData from "@/data/profile.json";
import articlesData from "@/data/articles.json";
import experienceData from "@/data/experience.json";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [expandedRoles, setExpandedRoles] = useState<Record<number, boolean>>({});
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [contactError, setContactError] = useState("");
  const { toast } = useToast();

  const FORMSPREE_URL = "https://formspree.io/f/mpqjowog";

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = contactForm.name.trim() && isValidEmail(contactForm.email) && contactForm.message.trim();

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setContactStatus("sending");
    setContactError("");

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" },
      });

      if (res.ok) {
        setContactStatus("success");
        setContactForm({ name: "", email: "", message: "" });
      } else {
        const data = await res.json();
        setContactStatus("error");
        setContactError(data?.errors?.[0]?.message || "Something went wrong. Please try again.");
      }
    } catch {
      setContactStatus("error");
      setContactError("Unable to send message. Please try again later.");
    }
  };

  const insightCards = articlesData;

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["about", "perspectives", "narrative"];
      let current = "";
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= element.offsetTop - 200) {
          current = section;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 relative">
      <div className="fixed inset-0 texture-overlay z-0" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-black/5 px-6 py-4 transition-all" data-testid="nav-bar">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <div
            className="font-serif font-semibold text-2xl tracking-tight text-slate-900 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            data-testid="link-home"
          >
            {profileData.name}.
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 items-center">
            <div className="flex gap-8 text-sm font-medium text-slate-500">
              {[
                { id: "about", label: "About" },
                { id: "perspectives", label: "Perspectives" },
                { id: "narrative", label: "Narrative" },
              ].map(link => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  data-testid={`link-${link.id}`}
                  className={`hover:text-slate-900 transition-colors relative pb-1 ${activeSection === link.id ? "text-slate-900" : ""}`}
                >
                  {link.label}
                  {activeSection === link.id && (
                    <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>
            <Button
              onClick={() => scrollToSection("contact")}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 shadow-sm transition-transform active:scale-95"
              data-testid="button-contact-desktop"
            >
              Get in Touch
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-slate-900 relative z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background pt-24 px-6 md:hidden flex flex-col"
          >
            <div className="flex flex-col gap-6 text-2xl font-serif text-slate-900">
              <button onClick={() => scrollToSection("about")} className="text-left border-b border-slate-100 pb-4" data-testid="link-about-mobile">About</button>
              <button onClick={() => scrollToSection("perspectives")} className="text-left border-b border-slate-100 pb-4" data-testid="link-perspectives-mobile">Perspectives</button>
              <button onClick={() => scrollToSection("narrative")} className="text-left border-b border-slate-100 pb-4" data-testid="link-narrative-mobile">Narrative</button>
            </div>
            <Button
              onClick={() => { scrollToSection("contact"); }}
              size="lg"
              className="mt-8 bg-slate-900 text-white rounded-full w-full"
              data-testid="button-contact-mobile"
            >
              Get in Touch
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1200px] mx-auto relative z-10">

        {/* HERO SECTION */}
        <section id="about" className="grid lg:grid-cols-12 gap-12 items-center mb-32 md:mb-48 pt-12 scroll-mt-32">
          <motion.div initial="initial" animate="animate" variants={staggerContainer} className="lg:col-span-7 space-y-8">
            <motion.div variants={fadeInUp} className="flex items-center gap-3 text-primary font-medium text-sm tracking-wide uppercase">
              <span className="w-8 h-px bg-primary"></span>
              {profileData.tagline}
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-serif text-slate-900 leading-[1.1] tracking-tight" data-testid="text-headline">
              {profileData.headline}
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xl text-slate-600 max-w-xl font-light leading-relaxed" data-testid="text-bio">
              {profileData.bio}
            </motion.p>

            <motion.div variants={fadeInUp} className="pt-4 flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => scrollToSection("perspectives")}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 text-base shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                data-testid="button-read-perspectives"
              >
                Read My Perspectives
              </Button>
              <Button
                onClick={() => scrollToSection("narrative")}
                size="lg"
                variant="ghost"
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full px-8 text-base group"
                data-testid="button-narrative-cta"
              >
                Professional Narrative <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="aspect-[3/4] md:aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl shadow-black/10 relative bg-slate-100 group">
              <img
                src={profileData.headshotUrl}
                alt={profileData.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                data-testid="img-headshot"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
            </div>
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-secondary rounded-full -z-10 blur-2xl opacity-60 mix-blend-multiply"></div>
          </motion.div>
        </section>

        {/* UPCOMING INSIGHTS */}
        <section id="perspectives" className="mb-32 md:mb-48 scroll-mt-32">
          <div className="max-w-3xl mb-14">
            <h2 className="text-4xl font-serif text-slate-900 mb-4">Upcoming Insights</h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              A preview of essays and analyses currently in development — exploring the intersections of cybersecurity governance, energy economics, data privacy, and product strategy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {insightCards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative rounded-2xl border border-slate-100 bg-slate-50/60 p-8 editorial-shadow select-none"
                data-testid={`card-article-${card.id}`}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
                    {card.tag}
                  </span>
                  <Badge variant="outline" className="rounded-full border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium gap-1.5 pointer-events-none">
                    <Clock className="w-3 h-3" /> Coming Soon
                  </Badge>
                </div>
                <h3 className="text-2xl font-serif text-slate-900 mb-4 leading-snug">
                  {card.title}
                </h3>
                <p className="text-slate-500 leading-relaxed text-[15px] italic">
                  "{card.summary}"
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* PROFESSIONAL NARRATIVE */}
        <section id="narrative" className="mb-32 scroll-mt-32">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-4xl font-serif text-slate-900 mb-6">Professional Narrative</h2>
            <p className="text-slate-600 text-lg leading-relaxed" data-testid="text-narrative-intro">
              {profileData.narrativeIntro}
            </p>
          </div>

          <div className="max-w-4xl mx-auto relative">
            <div className="space-y-24">
              {experienceData.map((job, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="relative grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16 items-start group"
                  data-testid={`card-experience-${idx}`}
                >
                  <div className="md:text-right pt-2">
                    <h3 className="text-2xl font-serif text-slate-900 group-hover:text-primary transition-colors">{job.role}</h3>
                    <div className={`${job.active ? "text-primary" : "text-slate-500"} font-medium mt-1`}>{job.company}</div>
                  </div>
                  <div className="relative">
                    <div className={`hidden md:block absolute -left-8 top-4 w-3 h-3 rounded-full transition-all duration-300 ${
                      job.active ? "bg-primary ring-4 ring-primary/20" : "bg-slate-300 group-hover:bg-primary group-hover:scale-125"
                    }`}></div>
                    {idx !== experienceData.length - 1 && (
                      <div className="hidden md:block absolute -left-[26px] top-10 bottom-[-80px] w-px bg-slate-200 group-hover:bg-slate-300 transition-colors"></div>
                    )}
                    {job.expandable ? (
                      <>
                        <p className="text-slate-600 leading-[1.8] mb-4">
                          {expandedRoles[idx] 
                            ? job.description 
                            : job.description.slice(0, 180) + "..."}
                        </p>
                        <button
                          onClick={() => setExpandedRoles(prev => ({ ...prev, [idx]: !prev[idx] }))}
                          className="text-primary text-sm font-medium flex items-center gap-1 mb-6 hover:underline underline-offset-4 transition-colors"
                          data-testid={`button-expand-${idx}`}
                        >
                          {expandedRoles[idx] ? (
                            <>Read Less <ChevronUp className="w-3.5 h-3.5" /></>
                          ) : (
                            <>Read More <ChevronDown className="w-3.5 h-3.5" /></>
                          )}
                        </button>
                      </>
                    ) : (
                      <p className="text-slate-600 leading-[1.8] mb-6">{job.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 items-center">
                      {job.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="rounded-full text-slate-500 border-slate-200 bg-white hover:bg-slate-50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* EDUCATION & EXPERTISE */}
        <section className="mb-32 scroll-mt-32">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-serif text-slate-900 mb-14 text-center">Education & Expertise</h2>

            <div className="grid md:grid-cols-3 gap-10 mb-16">
              {/* Academic Degrees */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Academic Degrees</h3>
                </div>
                <div className="space-y-5">
                  {profileData.credentials.education.map((edu, i) => (
                    <div key={i} className="border-l-2 border-primary/30 pl-5">
                      <h4 className="font-medium text-slate-900">{edu.degree}</h4>
                      <p className="text-slate-500 text-sm mt-1">{edu.school}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Development */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Professional Development</h3>
                </div>
                <div className="space-y-5">
                  {profileData.credentials.development.map((dev, i) => (
                    <div key={i} className="border-l-2 border-amber-300/50 pl-5">
                      <h4 className="font-medium text-slate-900">{dev.program}</h4>
                      <p className="text-slate-500 text-sm mt-1">{dev.school}</p>
                      <p className="text-slate-400 text-xs mt-2 leading-relaxed italic">{dev.context}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linguistic Proficiency */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Languages className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Linguistic Proficiency</h3>
                </div>
                <div className="space-y-6">
                  {profileData.credentials.languages.map((lang, i) => (
                    <div key={i} className="border-l-2 border-blue-200/60 pl-5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium text-slate-900">{lang.language}</span>
                        <span className="text-slate-300 mx-1">·</span>
                        <span className="text-sm text-slate-500">{lang.level}</span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed italic">{lang.context}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="border-t border-slate-100 pt-12">
              <h3 className="text-2xl font-serif text-slate-900 mb-8 text-center">Technical Expertise</h3>
              <div className="grid md:grid-cols-3 gap-8">
                {Object.entries(profileData.credentials.skills).map(([category, skills]) => (
                  <div key={category} className="text-center">
                    <h4 className="text-xs font-medium text-primary uppercase tracking-widest mb-4">{category}</h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {skills.map(skill => (
                        <Badge key={skill} variant="outline" className="rounded-full text-slate-600 border-slate-200 bg-white hover:bg-slate-50 px-3 py-1">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT FORM */}
        <section id="contact" className="mb-32 scroll-mt-32">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif text-slate-900 mb-4">Get in Touch</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Have a question, collaboration idea, or just want to connect? I'd love to hear from you.
              </p>
            </div>

            {contactStatus === "success" ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 px-8 rounded-2xl border border-primary/20 bg-primary/5"
              >
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-xl font-serif text-slate-900 mb-2">Thank you!</p>
                <p className="text-slate-600">Your message has been sent. I'll be in touch shortly.</p>
                <button
                  onClick={() => setContactStatus("idle")}
                  className="mt-6 text-sm text-primary hover:underline underline-offset-4"
                  data-testid="button-send-another"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6" data-testid="form-contact">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      placeholder="Your name"
                      required
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      placeholder="your@email.com"
                      required
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <input type="hidden" name="_subject" value="New Portfolio Inquiry - Geordi Taylor" />
                <input type="text" name="_honey" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                    placeholder="Your message..."
                    required
                    data-testid="input-message"
                  />
                </div>

                {contactStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {contactError}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={!isFormValid || contactStatus === "sending"}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 py-3 text-base shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="button-submit-contact"
                >
                  {contactStatus === "sending" ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" /> Send Message
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </section>

        {/* CLOSING STATEMENT */}
        <section className="my-32 py-20 text-center max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-serif italic text-2xl md:text-3xl text-slate-700 leading-relaxed tracking-tight"
          >
            "Optimizing for a future where energy is sustainable, data is secure, and complexity is simplified."
          </motion.p>
        </section>

        {/* FOOTER */}
        <footer className="pt-12 border-t border-slate-200" data-testid="footer">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <div className="font-serif font-semibold text-2xl text-slate-900 mb-6">{profileData.name}.</div>
              <p className="text-slate-600 max-w-sm">
                Securing and modernizing the world's most complex enterprise and energy systems.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 md:justify-items-end">
              <div className="space-y-4 flex flex-col">
                <h4 className="font-medium text-slate-900">Connect</h4>
                <a href={profileData.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-primary transition-colors" data-testid="link-linkedin">LinkedIn</a>
                <a href={profileData.social.github} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-primary transition-colors" data-testid="link-github">GitHub</a>
              </div>
              <div className="space-y-4 flex flex-col">
                <h4 className="font-medium text-slate-900">Contact</h4>
                <button onClick={() => scrollToSection("contact")} className="text-slate-500 hover:text-primary transition-colors text-left" data-testid="link-contact-footer">Send a Message</button>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm pt-8 border-t border-slate-100">
            <p>© {new Date().getFullYear()} {profileData.name}. All rights reserved.</p>
            <p className="mt-2 md:mt-0">{profileData.location}</p>
          </div>
        </footer>

      </main>
    </div>
  );
}