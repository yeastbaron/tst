"use client";

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Eye, Lock, Database, HelpCircle } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <Header />
      
      <main className="flex-1">
        <div className="w-full bg-muted border-y border-border/50 py-3">
          <div className="container mx-auto px-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h1 className="text-[14px] font-bebas tracking-[0.1em] uppercase">Politique de Confidentialité</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="space-y-8">
            <div className="space-y-4 text-center max-w-2xl mx-auto">
              <h2 className="text-4xl font-black uppercase tracking-tight text-secondary">Politique de Confidentialité</h2>
              <p className="text-muted-foreground font-medium">
                La protection de vos données personnelles est notre priorité. Découvrez comment nous gérons vos informations sur SalleDeVente.sn.
              </p>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest pt-2">
                Dernière mise à jour : 19 Mai 2026
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <Card className="border-none bg-white shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-3">
                  <div className="p-3 bg-primary/10 rounded-xl w-fit">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-black uppercase tracking-tight text-sm text-secondary">Transparence</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Nous ne collectons que les informations strictement nécessaires à la publication d&apos;annonces et aux transactions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none bg-white shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-3">
                  <div className="p-3 bg-primary/10 rounded-xl w-fit">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-black uppercase tracking-tight text-sm text-secondary">Sécurité</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Toutes vos données sont stockées de manière sécurisée sur l&apos;infrastructure chiffrée de Google Cloud et Firebase.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none bg-white shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-3">
                  <div className="p-3 bg-primary/10 rounded-xl w-fit">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-black uppercase tracking-tight text-sm text-secondary">Contrôle total</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Vous pouvez à tout moment consulter, modifier ou demander la suppression définitive de vos données personnelles.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none bg-white shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 md:p-12 space-y-8">
                
                <section className="space-y-3">
                  <h3 className="text-xl font-black uppercase tracking-tight text-secondary">1. Données Collectées</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    Dans le cadre de l&apos;utilisation de SalleDeVente.sn, nous collectons les données suivantes :
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm font-medium">
                    <li><strong>Informations d&apos;inscription :</strong> Nom, adresse email et photo de profil lorsque vous vous connectez via Google ou Facebook.</li>
                    <li><strong>Informations de profil :</strong> Numéro de téléphone et adresse (si vous décidez de compléter votre profil pour publier des annonces).</li>
                    <li><strong>Informations de contenu :</strong> Les photos, descriptions et prix des articles que vous déposez en vente.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h3 className="text-xl font-black uppercase tracking-tight text-secondary">2. Utilisation des Données</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    Vos données sont uniquement utilisées pour :
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm font-medium">
                    <li>Créer et sécuriser votre compte utilisateur.</li>
                    <li>Gérer la publication, la modification et le retrait de vos annonces.</li>
                    <li>Permettre à nos équipes administratives de vous contacter concernant la validation de vos ventes ou la livraison de vos articles.</li>
                    <li>Assurer la modération et la sécurité de la plateforme contre la fraude.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h3 className="text-xl font-black uppercase tracking-tight text-secondary">3. Partage des Données</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    Nous respectons scrupuleusement la confidentialité de nos membres :
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    <strong>Aucune donnée personnelle n&apos;est vendue ou partagée avec des tiers à des fins publicitaires.</strong> L&apos;identité et les coordonnées des vendeurs restent confidentielles et ne sont jamais visibles par les acheteurs sur la plateforme.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-xl font-black uppercase tracking-tight text-secondary">4. Droits des Utilisateurs (RGPD & Droits Nationaux)</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    Conformément aux réglementations sur la protection des données personnelles, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données personnelles. Vous pouvez exercer ces droits directement depuis votre page profil ou en nous adressant une demande.
                  </p>
                </section>

                <div className="pt-6 border-t border-border flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground font-bold">
                    Besoin de plus d&apos;informations ? <a href="/contact" className="text-primary hover:underline">Contactez notre délégué à la protection des données</a>.
                  </p>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
