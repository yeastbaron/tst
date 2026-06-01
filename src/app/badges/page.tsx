"use client";

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare, 
  Phone, 
  Clock, 
  ArrowRight, 
  ChevronDown, 
  ShoppingBag, 
  TrendingUp, 
  Zap,
  BadgePercent,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function BadgesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const proBenefits = [
    "Priorité haute dans les résultats de recherche",
    "Badge 'Vendeur PRO' certifié visible par les clients",
    "Boutique en ligne dédiée regroupant toutes vos annonces",
    "Support commercial prioritaire par WhatsApp / Téléphone",
    "Statistiques avancées des vues sur vos articles (à venir)",
  ];

  const superBenefits = [
    "Affichage en pole position dans la section 'Articles mis en avant' en page d'accueil",
    "Bordure dorée animée exclusive et scintillante sur toutes vos cartes produits",
    "Badge 'Super-Vendeur' doré avec animation de rebond accrocheuse",
    "Jusqu'à 10 fois plus de clics et de contacts qualifiés",
    "Activation immédiate par l'admin après paiement rapide",
  ];

  const superPacks = [
    { duration: "3 jours", price: "10.000 FCFA", highlight: "Idéal Test", desc: "Parfait pour vendre un produit à forte demande de manière flash." },
    { duration: "7 jours", price: "20.000 FCFA", highlight: "Populaire", desc: "La formule préférée pour écouler le stock de la semaine.", bestSeller: true },
    { duration: "30 jours", price: "50.000 FCFA", highlight: "Max Visibilité", desc: "Une présence royale continue tout au long du mois." },
  ];

  const faqs = [
    {
      q: "Comment s'effectue la validation de mon compte Professionnel ?",
      a: "Dès que vous choisissez le type 'Professionnel' dans vos réglages, notre équipe commerciale est notifiée. L'approbation administrative prend moins de 24 heures. Pour accélérer l'activation, vous pouvez directement contacter notre service commercial par WhatsApp pour finaliser le règlement mensuel de 10.000 FCFA."
    },
    {
      q: "Comment payer mon abonnement ou mon badge Super-Vendeur ?",
      a: "Nous acceptons les règlements via Wave, Orange Money ou virement. Contactez directement notre service commercial via les boutons d'appel ou de discussion WhatsApp intégrés sur la plateforme pour obtenir les coordonnées de paiement sécurisé."
    },
    {
      q: "Quelles sont les notifications reçues après validation ?",
      a: "Dès que l'administrateur approuve votre statut de Vendeur Professionnel ou valide votre badge de Super-Vendeur, vous recevez une notification automatique par Email et par WhatsApp pour vous confirmer le début de votre couverture premium."
    },
    {
      q: "Le badge Super-Vendeur est-il renouvelable ?",
      a: "Absolument. Vous pouvez demander un nouveau badge directement à partir de votre profil d'utilisateur à tout moment. Dès expiration de la durée accordée, le badge se retire automatiquement mais vos produits restent en ligne sous le format standard."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-muted/5 font-sans">
      <Header />
      
      <main className="flex-1 pb-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary to-slate-900 text-white py-16 md:py-24 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.1),transparent)]" />
          <div className="container mx-auto px-4 relative z-10 max-w-4xl space-y-6">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3 w-3 animate-pulse" /> Boostez vos ventes à Dakar &amp; Sénégal
            </span>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
              Propulsez Votre <span className="text-amber-400">Visibilité</span>
            </h1>
            <p className="text-sm md:text-lg text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
              Découvrez nos outils professionnels pour capter l&apos;attention des acheteurs, asseoir votre crédibilité et vendre vos articles en un temps record.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="rounded-xl font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 border-none px-8 py-6 h-auto text-sm">
                <Link href="/profile">Devenir Professionnel</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl font-bold bg-white/10 hover:bg-white/20 border-white/20 px-8 py-6 h-auto text-sm text-white">
                <a href="https://wa.me/221761740641?text=Bonjour,%20je%20souhaite%20des%20renseignements%20sur%20les%20badges%20Premium" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Service Commercial
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Pricing/Benefits Grids */}
        <section className="container mx-auto px-4 -mt-10 relative z-20 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* CARD 1: PROFESSIONNEL */}
            <Card className="border-border/50 rounded-[2.5rem] bg-white shadow-xl overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 group">
              <div className="p-8 md:p-10 border-b relative overflow-hidden bg-gradient-to-r from-primary/5 to-transparent">
                <div className="absolute top-6 right-6 p-3 bg-primary/10 rounded-2xl text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-2">Abonnement Mensuel</h3>
                <h2 className="text-3xl font-black text-slate-900 uppercase">Profil Professionnel</h2>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">10.000 FCFA</span>
                  <span className="text-muted-foreground font-bold">/ mois</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium mt-2 leading-relaxed">
                  L&apos;outil indispensable pour les boutiques, importateurs et commerçants réguliers souhaitant installer leur vitrine permanente sur notre plateforme.
                </p>
              </div>
              <CardContent className="p-8 md:p-10 flex-1 flex flex-col justify-between space-y-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Avantages inclus :</p>
                  <ul className="space-y-3.5">
                    {proBenefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 text-sm font-medium leading-tight">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-3 pt-6 border-t">
                  <Button asChild className="w-full rounded-xl font-bold h-12 bg-primary hover:bg-primary/90 text-white">
                    <Link href="/profile">Activer sur mon profil</Link>
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-wide">Validation administrative sous 24h maximum</p>
                </div>
              </CardContent>
            </Card>

            {/* CARD 2: SUPER-VENDEUR */}
            <Card className="border-amber-300 rounded-[2.5rem] bg-white shadow-xl overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 ring-2 ring-amber-300/40 relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600" />
              <div className="p-8 md:p-10 border-b relative overflow-hidden bg-gradient-to-r from-amber-50 to-transparent">
                <div className="absolute top-6 right-6 p-3 bg-amber-400/20 rounded-2xl text-amber-600">
                  <Sparkles className="h-6 w-6 animate-spin-slow" />
                </div>
                <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-2">Boost Temporisé</h3>
                <h2 className="text-3xl font-black text-slate-900 uppercase">Badge Super-Vendeur</h2>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-xs font-bold text-muted-foreground mr-1">À partir de</span>
                  <span className="text-4xl font-black text-amber-500">10.000 FCFA</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium mt-2 leading-relaxed">
                  Réservé aux professionnels. Donne à vos annonces une aura dorée animée et une visibilité absolue tout en haut de la page d&apos;accueil.
                </p>
              </div>
              <CardContent className="p-8 md:p-10 flex-1 flex flex-col justify-between space-y-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Privilèges exclusifs :</p>
                  <ul className="space-y-3.5">
                    {superBenefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 text-sm font-medium leading-tight">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-3 pt-6 border-t">
                  <Button asChild className="w-full rounded-xl font-bold h-12 bg-amber-500 hover:bg-amber-400 text-slate-950 border-none">
                    <Link href="/profile">Demander le badge doré</Link>
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-wide text-amber-600">Réservé uniquement aux comptes Professionnels</p>
                </div>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* Super Seller Packs Table */}
        <section className="container mx-auto px-4 pt-16 max-w-4xl space-y-8 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-slate-900">Les Formules du Badge Super-Vendeur</h2>
            <p className="text-muted-foreground text-sm font-medium">Choisissez la durée idéale pour écouler votre catalogue rapidement.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {superPacks.map((pack, index) => (
              <div 
                key={index}
                className={`relative rounded-3xl p-6 bg-white border text-left flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-transform duration-300 shadow-sm ${
                  pack.bestSeller ? "border-amber-400 ring-2 ring-amber-400/20" : "border-border/60"
                }`}
              >
                {pack.bestSeller && (
                  <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-amber-505 text-slate-950 text-[9px] font-black uppercase tracking-widest bg-amber-500">
                    ⭐ Recommandé
                  </span>
                )}
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider">{pack.highlight}</span>
                  <h3 className="text-xl font-black text-slate-900 uppercase pt-2">{pack.duration}</h3>
                  <p className="text-2xl font-black text-amber-500">{pack.price}</p>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed pt-2">{pack.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Contacts Block */}
        <section className="container mx-auto px-4 pt-16 max-w-4xl">
          <div className="bg-gradient-to-r from-indigo-50 via-white to-pink-50 border border-border/40 p-8 md:p-12 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900 flex items-center justify-center md:justify-start gap-2">
                📞 Service Client &amp; Support Commercial
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm font-medium leading-relaxed max-w-md">
                Besoin d&apos;aide pour payer par Orange Money ou Wave ? Vous souhaitez valider rapidement votre compte sous moins d&apos;une heure ? Nos conseillers sont à votre disposition.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <Button asChild className="w-full sm:w-auto rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white gap-2 h-12 px-6 border-none">
                <a href="https://wa.me/221761740641?text=Bonjour,%20je%20souhaite%20valider%20mon%20statut%20premium%20sur%20SalleDeVente.sn" target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="h-4 w-4" /> WhatsApp Direct
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto rounded-xl font-bold border-border/60 hover:bg-muted h-12 px-6">
                <a href="tel:+221761740641" className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" /> Appeler Service
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="container mx-auto px-4 pt-20 max-w-3xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900">Questions Fréquentes</h2>
            <p className="text-muted-foreground text-sm font-medium">Tout ce qu&apos;il faut savoir sur nos services d&apos;abonnements et de badges.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden transition-all"
              >
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full p-6 text-left flex items-center justify-between font-bold text-slate-900 text-sm md:text-base hover:bg-muted/10 transition-colors"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                
                {openFaq === i && (
                  <div className="px-6 pb-6 pt-1 border-t border-muted/30 text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
