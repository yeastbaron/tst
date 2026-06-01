
"use client";

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulation d'envoi
    setTimeout(() => {
      toast({
        title: "Message envoyé",
        description: "Notre équipe vous répondra dans les plus brefs délais.",
      });
      setIsSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <Header />
      
      <main className="flex-1">
        {/* Titre de section pleine largeur style Bebas */}
        <div className="w-full bg-muted border-y border-border/50 py-3">
          <div className="container mx-auto px-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h1 className="text-[14px] font-bebas tracking-[0.1em] uppercase">Contactez-nous</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Colonne Informations */}
            <div className="lg:col-span-1 space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-black uppercase tracking-tight text-secondary">Parlons de votre projet</h2>
                <p className="text-muted-foreground font-medium">
                  Une question sur une annonce ? Besoin d'assistance pour une vente ? Notre équipe est là pour vous accompagner.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4">
                <Card className="border-none bg-white shadow-sm rounded-2xl overflow-hidden">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Téléphone</p>
                      <a href="tel:+221761740641" className="font-bold hover:text-primary transition-colors">+221 76 174 06 41</a>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none bg-white shadow-sm rounded-2xl overflow-hidden">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</p>
                      <p className="font-bold">contact@salledevente.sn</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none bg-white shadow-sm rounded-2xl overflow-hidden">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bureau</p>
                      <p className="font-bold">Dakar, Plateau - Sénégal</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Colonne Formulaire */}
            <div className="lg:col-span-2">
              <Card className="border-none bg-white shadow-xl rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest">Nom complet</Label>
                        <Input id="name" placeholder="Votre nom" className="h-12 bg-muted/30 border-none rounded-xl" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest">Email</Label>
                        <Input id="email" type="email" placeholder="votre@email.com" className="h-12 bg-muted/30 border-none rounded-xl" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-xs font-black uppercase tracking-widest">Sujet</Label>
                      <Input id="subject" placeholder="De quoi s'agit-il ?" className="h-12 bg-muted/30 border-none rounded-xl" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-xs font-black uppercase tracking-widest">Message</Label>
                      <Textarea id="message" placeholder="Votre message..." className="min-h-[150px] bg-muted/30 border-none rounded-2xl p-4" required />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={isSubmitting}
                      className="w-full h-16 bg-secondary text-white hover:bg-secondary/90 font-black uppercase tracking-tight rounded-2xl gap-3 text-lg"
                    >
                      {isSubmitting ? "Envoi en cours..." : (
                        <>
                          <Send className="h-5 w-5" />
                          Envoyer le message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
