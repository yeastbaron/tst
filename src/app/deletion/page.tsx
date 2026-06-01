"use client";

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

export default function DeletionInstructionsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <Header />
      
      <main className="flex-1">
        <div className="w-full bg-muted border-y border-border/50 py-3">
          <div className="container mx-auto px-4 flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-primary" />
            <h1 className="text-[14px] font-bebas tracking-[0.1em] uppercase">Suppression des Données</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="space-y-8">
            <div className="space-y-4 text-center max-w-2xl mx-auto">
              <h2 className="text-4xl font-black uppercase tracking-tight text-secondary">Instructions de Suppression des Données</h2>
              <p className="text-muted-foreground font-medium">
                Vous souhaitez supprimer votre compte ou retirer vos données personnelles de notre plateforme ? Voici la procédure simple et conforme.
              </p>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest pt-2">
                Conformité Meta & RGPD
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <Card className="border-none bg-white shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-3">
                  <div className="p-3 bg-red-100 rounded-xl w-fit">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-black uppercase tracking-tight text-sm text-secondary">Effet Définitif</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    La suppression de votre compte est irréversible. Toutes vos annonces en cours, badges acquis et données de profil seront effacés de manière permanente.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none bg-white shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-3">
                  <div className="p-3 bg-green-100 rounded-xl w-fit">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-black uppercase tracking-tight text-sm text-secondary">Délai de Traitement</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Les demandes par email ou formulaire de contact sont traitées sous 48 heures ouvrées par nos équipes techniques.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none bg-white shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 md:p-12 space-y-8">
                
                <section className="space-y-3">
                  <h3 className="text-xl font-black uppercase tracking-tight text-secondary">Comment supprimer votre compte et vos données</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    SalleDeVente.sn met à votre disposition deux méthodes simples pour supprimer vos informations personnelles :
                  </p>
                  
                  <div className="space-y-4 pt-4">
                    <div className="flex gap-4">
                      <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">
                        1
                      </div>
                      <div>
                        <h4 className="font-black uppercase tracking-tight text-sm text-secondary">Via notre formulaire de contact (Recommandé)</h4>
                        <p className="text-muted-foreground text-xs leading-relaxed font-medium pt-1">
                          Rendez-vous sur notre page de <a href="/contact" className="text-primary hover:underline">Contact</a>, sélectionnez le sujet &quot;Suppression de compte / Données personnelles&quot; et indiquez l&apos;adresse email liée à votre compte. Notre équipe procédera au nettoyage complet de vos bases de données.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">
                        2
                      </div>
                      <div>
                        <h4 className="font-black uppercase tracking-tight text-sm text-secondary">Par Email Direct</h4>
                        <p className="text-muted-foreground text-xs leading-relaxed font-medium pt-1">
                          Envoyez simplement un email à l&apos;adresse <strong>contact@salledevente.sn</strong> avec pour objet &quot;Demande de suppression de compte&quot;, en précisant le nom et l&apos;adresse email associés à votre compte SalleDeVente.sn.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-xl font-black uppercase tracking-tight text-secondary">Quelles données sont supprimées ?</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    Lorsque vous demandez la suppression de vos données, nous effaçons définitivement :
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm font-medium">
                    <li>Votre profil utilisateur (Nom, Email, Photo, Téléphone, Adresse).</li>
                    <li>Toutes les annonces que vous avez déposées sur la plateforme.</li>
                    <li>Les jetons d&apos;authentification de tiers (Facebook, Google).</li>
                    <li>Vos historiques de messages ou de négociations de prix.</li>
                  </ul>
                </section>

                <div className="pt-6 border-t border-border flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground font-bold">
                    Une question sur la conformité de notre service ? <a href="/contact" className="text-primary hover:underline">Contactez notre support client</a>.
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
