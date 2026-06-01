"use client";

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, ShieldCheck, Scale, AlertOctagon, HelpCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <Header />
      
      <main className="flex-1">
        {/* Titre de section pleine largeur style Bebas */}
        <div className="w-full bg-muted border-y border-border/50 py-3">
          <div className="container mx-auto px-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h1 className="text-[14px] font-bebas tracking-[0.1em] uppercase">Conditions Générales d&apos;Utilisation</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="space-y-8">
            {/* Entête de présentation */}
            <div className="space-y-4 text-center max-w-2xl mx-auto">
              <h2 className="text-4xl font-black uppercase tracking-tight text-secondary">CGU & Mentions Légales</h2>
              <p className="text-muted-foreground font-medium">
                Veuillez lire attentivement les présentes conditions d&apos;utilisation avant d&apos;utiliser la plateforme SalleDeVente.sn.
              </p>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest pt-2">
                Dernière mise à jour : 18 Mai 2026
              </div>
            </div>

            {/* Grille de cartes récapitulatives */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <Card className="border-none bg-white shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-3">
                  <div className="p-3 bg-primary/10 rounded-xl w-fit">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-black uppercase tracking-tight text-sm text-secondary">Confidentialité</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Nous protégeons l&apos;identité de nos vendeurs. Les transactions et échanges sont encadrés pour garantir un anonymat protecteur.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none bg-white shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-3">
                  <div className="p-3 bg-primary/10 rounded-xl w-fit">
                    <Scale className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-black uppercase tracking-tight text-sm text-secondary">Commission Transparente</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Une marge automatique de 10% est ajoutée au prix fixé par le vendeur. Pas de frais cachés, tout est calculé à l&apos;avance.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none bg-white shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-3">
                  <div className="p-3 bg-primary/10 rounded-xl w-fit">
                    <AlertOctagon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-black uppercase tracking-tight text-sm text-secondary">Modération Stricte</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Toutes les annonces sont soumises à modération. Les comportements frauduleux ou non conformes entraînent un bannissement immédiat.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contenu textuel structuré */}
            <Card className="border-none bg-white shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 md:p-12 space-y-8">
                
                <section className="space-y-3">
                  <h3 className="text-xl font-black uppercase tracking-tight text-secondary">1. Mentions Légales</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    La plateforme <strong>SalleDeVente.sn</strong> est la propriété exclusive de la société <strong>Ogo&apos;o SARL</strong>, société à responsabilité limitée établie à Dakar, Sénégal, sous le numéro de Registre de Commerce <strong>SN.DKR.2019.B.36376</strong>, boîte postale BP 25000.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-xl font-black uppercase tracking-tight text-secondary">2. Description des Services</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    SalleDeVente.sn est une plateforme numérique intermédiaire mettant en relation des acheteurs et des vendeurs à Dakar et sur l&apos;ensemble du Sénégal. Nous offrons :
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm font-medium">
                    <li>Un catalogue de produits triés par catégories pour faciliter la navigation.</li>
                    <li>Un outil de recherche sémantique propulsé par l&apos;IA pour comprendre vos requêtes textuelles naturelles.</li>
                    <li>Un système de dépôt d&apos;annonce simplifié permettant de fixer un prix net vendeur.</li>
                    <li>Un service de conciliation d&apos;achat et de livraison sécurisé.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h3 className="text-xl font-black uppercase tracking-tight text-secondary">3. Système de Commission (Marge de 10%)</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    Le fonctionnement de notre modèle économique est simple et transparent :
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    Lorsqu&apos;un vendeur dépose une annonce, il définit le <strong>prix net vendeur</strong> qu&apos;il souhaite recevoir. Notre moteur de tarification calcule et ajoute automatiquement une commission de 10% sur le prix final affiché à l&apos;acheteur. Ces 10% couvrent les frais de plateforme, de mise en relation et de service de transaction commerciale.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-xl font-black uppercase tracking-tight text-secondary">4. Confidentialité des Vendeurs</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    Afin d&apos;éviter les contournements de plateforme et de protéger la vie privée des utilisateurs, l&apos;identité et les coordonnées directes du vendeur restent strictement masquées et confidentielles. Aucun acheteur ne peut accéder aux données personnelles du vendeur. Toutes les demandes d&apos;information et de finalisation d&apos;achat transitent par notre support administratif.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-xl font-black uppercase tracking-tight text-secondary">5. Obligations des Utilisateurs & Dépôt d&apos;Annonces</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    En déposant une annonce ou en effectuant un achat sur SalleDeVente.sn, l&apos;utilisateur s&apos;engage à :
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm font-medium">
                    <li>Fournir des informations exactes, réelles et conformes à l&apos;état du produit proposé.</li>
                    <li>Ne proposer à la vente aucun article contrefait, illégal, dangereux ou contraire aux lois de la République du Sénégal.</li>
                    <li>Honorer les commandes initiées ou acceptées sur la plateforme.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h3 className="text-xl font-black uppercase tracking-tight text-secondary">6. Modération, Signalement et Bannissement</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    Notre équipe d&apos;administration se réserve le droit de modérer, de suspendre ou de supprimer toute annonce jugée suspecte, frauduleuse ou contraire à nos CGU. Tout utilisateur tentant de contourner les règles, d&apos;arnaquer d&apos;autres membres ou de violer les termes légaux fera l&apos;objet d&apos;un bannissement immédiat et définitif de son compte.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-xl font-black uppercase tracking-tight text-secondary">7. Limitation de Responsabilité</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    SalleDeVente.sn agit comme plateforme intermédiaire de mise en relation. Bien que nous fassions nos meilleurs efforts pour valider la qualité des vendeurs (grâce à nos badges de vérification) et la conformité des annonces, nous ne saurions être tenus responsables des vices cachés des produits ou des litiges financiers directs survenant hors du contrôle de notre protocole sécurisé.
                  </p>
                </section>

                <div className="pt-6 border-t border-border flex items-center gap-3">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground font-bold">
                    Une question concernant nos CGU ? <a href="/contact" className="text-primary hover:underline">Contactez notre support administratif</a>.
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
