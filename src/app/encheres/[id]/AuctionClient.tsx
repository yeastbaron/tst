"use client";

import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  ShieldCheck, ArrowLeft, Loader2, MessageCircle, Phone, 
  MapPin, Sparkles, User, AlertTriangle, Gavel, Clock, CheckCircle2, TrendingUp 
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFirestore, useDoc, useMemoFirebase, useUser, sendNotification } from '@/firebase';
import { doc, updateDoc, increment, runTransaction } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function AuctionClient() {
  const { id } = useParams();
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const db = useFirestore();
  const { user, profile, loading: authLoading } = useUser();
  const { toast } = useToast();

  const [bidAmount, setBidAmount] = useState<string>('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastBiddedAmount, setLastBiddedAmount] = useState<number>(0);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  // Charger le produit
  const productRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id as string);
  }, [db, id]);

  const { data: product, loading: productLoading } = useDoc(productRef);

  // Charger le vendeur si le produit existe
  const sellerRef = useMemoFirebase(() => {
    if (!db || !product?.sellerId) return null;
    return doc(db, 'users', product.sellerId);
  }, [db, product?.sellerId]);

  const { data: seller, loading: sellerLoading } = useDoc(sellerRef);

  // Gérer le compte à rebours
  useEffect(() => {
    if (!product?.auctionEndAt) return;

    const calculateTimeLeft = () => {
      const endAt = product.auctionEndAt.toDate
        ? product.auctionEndAt.toDate()
        : new Date(product.auctionEndAt);
      
      const difference = +endAt - +new Date();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [product?.auctionEndAt]);

  const loading = productLoading || authLoading || sellerLoading;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!product || !product.isAuction) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center space-y-4 p-8">
          <AlertTriangle className="h-12 w-12 text-red-500 animate-bounce" />
          <h1 className="text-2xl font-black uppercase">Oups ! Enchère introuvable.</h1>
          <Button asChild className="rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white"><Link href="/encheres">Retour aux enchères</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  const currentPrice = product.currentBid || product.basePrice;
  const minNextBid = currentPrice + 1000;
  const images = product.images || ['https://picsum.photos/seed/placeholder/800/800'];
  
  // Validation de profil
  const isProfileIncomplete = user && (!profile?.name || !profile?.phone || !profile?.address || !profile?.type);
  const isSeller = user?.uid === product.sellerId;

  // Surlignages de compte à rebours
  const isUrgent = !timeLeft.isExpired && timeLeft.days === 0 && timeLeft.hours < 24;
  const isCritical = !timeLeft.isExpired && timeLeft.days === 0 && timeLeft.hours < 1;

  // Masquer les informations confidentielles de l'acheteur
  const getMaskedBidderName = (nameStr: string) => {
    if (!nameStr) return "Anonyme";
    const cleaned = nameStr.trim();
    if (cleaned.includes("@")) {
      const [local, domain] = cleaned.split("@");
      if (local.length <= 3) return local + "***@" + domain;
      return local.slice(0, 3) + "***@" + domain;
    }
    if (cleaned.length <= 4) return cleaned.slice(0, 1) + "***";
    return cleaned.slice(0, 2) + "***" + cleaned.slice(-1);
  };

  const handleQuickBid = (increment: number) => {
    const nextAmount = currentPrice + increment;
    setBidAmount(nextAmount.toString());
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user || !profile) return;

    if (profile.isBanned) {
      toast({
        title: "Action refusée",
        description: "Votre compte est banni.",
        variant: "destructive"
      });
      return;
    }

    if (isProfileIncomplete) {
      toast({
        title: "Profil incomplet",
        description: "Veuillez compléter vos informations de contact avant de soumettre une offre.",
        variant: "destructive"
      });
      return;
    }

    const parsedBid = parseFloat(bidAmount);
    if (isNaN(parsedBid) || parsedBid < minNextBid) {
      toast({
        title: "Offre invalide",
        description: `Le montant minimum de la prochaine enchère doit être de ${minNextBid.toLocaleString('fr-FR')} FCFA.`,
        variant: "destructive"
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Conditions requises",
        description: "Vous devez accepter vos responsabilités d'enchéreur.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingBid(true);

    try {
      const productDocRef = doc(db, 'products', product.id);
      const previousBidderId = product.currentBidderId;

      await runTransaction(db, async (transaction) => {
        const productDoc = await transaction.get(productDocRef);
        if (!productDoc.exists()) {
          throw new Error("L'article n'existe plus.");
        }
        
        const data = productDoc.data();
        if (data.status !== 'active') {
          throw new Error("Cette enchère n'est plus active.");
        }

        const endAt = data.auctionEndAt.toDate
          ? data.auctionEndAt.toDate()
          : new Date(data.auctionEndAt);
        
        if (endAt < new Date()) {
          throw new Error("Cette enchère est déjà terminée.");
        }

        if (parsedBid <= (data.currentBid || data.basePrice)) {
          throw new Error("Votre offre doit être supérieure à l'offre actuelle.");
        }

        transaction.update(productDocRef, {
          currentBid: parsedBid,
          currentBidderId: user.uid,
          currentBidderName: profile.name || user.displayName || user.email || 'Enchérisseur',
          bidsCount: (data.bidsCount || 0) + 1
        });
      });

      // Notifier le vendeur
      sendNotification(db, product.sellerId, {
        title: "Nouvelle enchère ! 🔨",
        message: `Votre article "${product.title}" a reçu une offre de ${parsedBid.toLocaleString('fr-FR')} FCFA par ${profile.name || 'un acheteur'}.`,
        type: "profile",
        link: `/encheres/${product.id}`
      });

      // Notifier le précédent enchéreur
      if (previousBidderId && previousBidderId !== user.uid) {
        sendNotification(db, previousBidderId, {
          title: "Vous avez été surenchéri ! ⚠️",
          message: `Une offre supérieure de ${parsedBid.toLocaleString('fr-FR')} FCFA a été formulée sur l'article "${product.title}".`,
          type: "profile",
          link: `/encheres/${product.id}`
        });
      }

      setLastBiddedAmount(parsedBid);
      setShowSuccessModal(true);
      setBidAmount('');
      setAcceptTerms(false);
      toast({
        title: "Offre validée !",
        description: `Votre offre de ${parsedBid.toLocaleString('fr-FR')} FCFA a été enregistrée avec succès.`,
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erreur lors de l'enchère",
        description: err.message || "Impossible de soumettre votre enchère. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const whatsappWinnerMessage = `Bonjour, j'ai remporté l'enchère pour votre produit "${product.title}" sur SalleDeVente.sn pour un montant de ${currentPrice.toLocaleString('fr-FR')} FCFA. Je vous contacte pour convenir du retrait et du paiement.`;

  return (
    <div className="flex flex-col min-h-screen bg-muted/5">
      <Header />
      
      <main className="flex-1 py-6 md:py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <Link href="/encheres" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-indigo-600 mb-6">
            <ArrowLeft className="h-4 w-4" /> Retour aux enchères
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Colonne de Gauche : Photos & Description (7/12) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-4">
                <div className="aspect-square relative rounded-[2rem] overflow-hidden bg-white border shadow-sm">
                  <Image src={images[activeImage]} alt={product.title} fill className="object-cover" />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img: string, idx: number) => (
                      <button 
                        key={idx} 
                        onClick={() => setActiveImage(idx)}
                        className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === idx ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-transparent'}`}
                      >
                        <Image src={img} alt="" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4">
                <div className="bg-white p-4 rounded-xl border">
                  <h3 className="text-lg font-black uppercase text-slate-800 tracking-wider">Description</h3>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">{product.description}</p>
              </div>
            </div>

            {/* Colonne de Droite : Enchères Widget (5/12) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Card Principale Enchère */}
              <Card className="rounded-[2.5rem] border-indigo-200 shadow-xl overflow-hidden bg-white relative">
                
                {/* Header Widget */}
                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="px-3 py-1 font-black text-xs uppercase bg-indigo-500/20 text-indigo-300 border-indigo-400/20">
                      {product.condition === 'new' ? 'Neuf' : 'Occasion'}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase font-black tracking-wider text-slate-300 border-slate-700">
                      {CATEGORIES.find(c => c.id === product.category)?.name || product.category}
                    </Badge>
                  </div>
                  
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight uppercase">
                    {product.title}
                  </h1>
                </div>

                <CardContent className="p-6 md:p-8 space-y-6">
                  
                  {/* COMPTE À REBOURS LIVE */}
                  <div className={`p-5 rounded-2xl border text-center transition-all ${
                    timeLeft.isExpired 
                      ? "bg-slate-50 border-slate-200 text-slate-500" 
                      : isCritical 
                        ? "bg-red-500/5 border-red-500/35 text-red-600 animate-pulse" 
                        : isUrgent 
                          ? "bg-amber-500/5 border-amber-500/30 text-amber-700" 
                          : "bg-indigo-500/5 border-indigo-500/10 text-indigo-900"
                  }`}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1.5 mb-2">
                      <Clock className="h-4 w-4" /> Temps restant
                    </p>
                    {timeLeft.isExpired ? (
                      <p className="text-2xl font-black uppercase tracking-tight text-slate-700">Enchère terminée</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 text-center max-w-[280px] mx-auto">
                        <div>
                          <p className="text-2xl font-black leading-none">{String(timeLeft.days).padStart(2, '0')}</p>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">jours</span>
                        </div>
                        <div>
                          <p className="text-2xl font-black leading-none">{String(timeLeft.hours).padStart(2, '0')}</p>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">heures</span>
                        </div>
                        <div>
                          <p className="text-2xl font-black leading-none">{String(timeLeft.minutes).padStart(2, '0')}</p>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">min</span>
                        </div>
                        <div>
                          <p className="text-2xl font-black leading-none">{String(timeLeft.seconds).padStart(2, '0')}</p>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">sec</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* INFO ENCHÈRES (PRIX ACTUEL / DERNIER ENCHÉRISEUR) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl space-y-0.5">
                      <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 block">Offre Actuelle</span>
                      <span className="text-xl md:text-2xl font-black text-indigo-650">{currentPrice.toLocaleString('fr-FR')}</span>
                      <span className="text-xs font-bold text-indigo-600 ml-1">FCFA</span>
                    </div>
                    
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-0.5">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Dernière Mise</span>
                      <span className="text-xs font-black text-slate-700 block truncate">
                        {product.currentBidderId ? getMaskedBidderName(product.currentBidderName) : "Aucune offre"}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 block">{product.bidsCount || 0} offre(s) placée(s)</span>
                    </div>
                  </div>

                  {/* CAS 1 : ENCHÈRE TERMINÉE */}
                  {timeLeft.isExpired && (
                    <div className="space-y-4 pt-4 border-t">
                      {product.currentBidderId ? (
                        user?.uid === product.currentBidderId ? (
                          <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl text-center space-y-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                              <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-black uppercase tracking-tight text-emerald-800 text-sm">Félicitations !</h3>
                              <p className="text-xs text-slate-600 leading-normal">
                                Vous avez remporté cette enchère au prix de <strong>{currentPrice.toLocaleString('fr-FR')} FCFA</strong>. Contactez immédiatement le vendeur pour organiser le retrait.
                              </p>
                            </div>
                            
                            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl">
                              <a 
                                href={`https://wa.me/${seller?.phone?.replace(/\s+/g, '')}?text=${encodeURIComponent(whatsappWinnerMessage)}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <MessageCircle className="h-5 w-5 mr-1.5" /> Contacter par WhatsApp
                              </a>
                            </Button>
                          </div>
                        ) : (
                          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center space-y-1">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Gagnant</span>
                            <p className="font-black text-slate-700 text-sm">{getMaskedBidderName(product.currentBidderName)}</p>
                            <p className="text-xs text-slate-500">Remportée à {currentPrice.toLocaleString('fr-FR')} FCFA</p>
                          </div>
                        )
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center text-xs font-bold text-slate-500">
                          Aucune offre n'a été formulée. L'enchère s'est clôturée sans acquéreur.
                        </div>
                      )}
                    </div>
                  )}

                  {/* CAS 2 : ENCHÈRE EN COURS */}
                  {!timeLeft.isExpired && (
                    <div className="space-y-6 pt-4 border-t">
                      
                      {/* VÉRIFICATION UTILISATEUR COMPTE */}
                      {!user ? (
                        <div className="text-center p-4 bg-slate-50 border rounded-xl space-y-3">
                          <p className="text-xs font-bold text-slate-600">Vous devez être connecté et disposer d'un compte validé pour miser.</p>
                          <Button asChild className="w-full bg-indigo-650 hover:bg-indigo-700 rounded-xl font-bold h-10">
                            <Link href="/login">Se connecter</Link>
                          </Button>
                        </div>
                      ) : isProfileIncomplete ? (
                        <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl space-y-3 text-center">
                          <p className="text-xs font-medium text-amber-800 leading-normal">
                            ⚠️ Votre profil est incomplet. Pour participer aux enchères, vous devez d'abord renseigner votre Nom complet, Téléphone et Adresse dans votre profil.
                          </p>
                          <Button asChild className="w-full bg-amber-600 hover:bg-amber-700 text-white border-none rounded-xl font-bold h-10">
                            <Link href="/profile">Compléter mon profil</Link>
                          </Button>
                        </div>
                      ) : isSeller ? (
                        <div className="bg-slate-100 border border-slate-300 p-4 rounded-xl text-center text-xs font-bold text-slate-500">
                          ℹ️ Cet article est le vôtre. Vous ne pouvez pas miser sur votre propre enchère.
                        </div>
                      ) : (
                        <form onSubmit={handlePlaceBid} className="space-y-4">
                          
                          {/* Suggérer des augmentations (Taps rapides) */}
                          <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block">Augmenter rapidement</span>
                            <div className="grid grid-cols-3 gap-2">
                              <button 
                                type="button"
                                onClick={() => handleQuickBid(1000)}
                                className="h-9 rounded-lg border text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50 border-indigo-200 transition-all"
                              >
                                +1 000 F
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleQuickBid(5000)}
                                className="h-9 rounded-lg border text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50 border-indigo-200 transition-all"
                              >
                                +5 000 F
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleQuickBid(10000)}
                                className="h-9 rounded-lg border text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50 border-indigo-200 transition-all"
                              >
                                +10 000 F
                              </button>
                            </div>
                          </div>

                          {/* Champ Saisie Offre */}
                          <div className="space-y-2">
                            <Label htmlFor="bid" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Votre offre (FCFA)</Label>
                            <div className="relative">
                              <Input 
                                id="bid"
                                type="number"
                                placeholder={`Min. ${minNextBid}`}
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                required
                                className="h-12 rounded-xl text-lg font-black pr-16 focus-visible:ring-indigo-500/20"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-xs text-muted-foreground">FCFA</span>
                            </div>
                          </div>

                          {/* Rappel des responsabilités enchéreur */}
                          <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl space-y-3">
                            <p className="text-[10px] font-bold text-red-700 leading-normal flex items-start gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-red-600" />
                              Chaque offre vous engage légalement. Si vous êtes le meilleur enchéreur à la fin du compte à rebours, vous devez procéder à l'achat sous 48 heures. Tout abandon entraînera le bannissement définitif de votre compte.
                            </p>
                            
                            <div className="flex items-center space-x-2 pt-1">
                              <Checkbox 
                                id="terms" 
                                checked={acceptTerms} 
                                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                                className="border-red-400 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                              />
                              <Label htmlFor="terms" className="text-[10px] font-bold text-red-800 uppercase tracking-wide cursor-pointer">
                                J'accepte mes responsabilités d'enchéreur
                              </Label>
                            </div>
                          </div>

                          {/* Bouton de validation */}
                          <Button 
                            type="submit"
                            disabled={isSubmittingBid || !acceptTerms}
                            className="w-full h-14 rounded-xl font-black uppercase bg-indigo-600 hover:bg-indigo-700 text-white text-base shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01]"
                          >
                            {isSubmittingBid ? (
                              <Loader2 className="animate-spin h-5 w-5 mr-1" />
                            ) : null}
                            Valider mon offre
                          </Button>
                        </form>
                      )}

                    </div>
                  )}

                  {/* INFOS DU VENDEUR (SEULEMENT LE LIEU ET CONTACTS À LA FIN SI CONFIDENTIALITÉ) */}
                  <div className="border-t pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground block">Vendeur</span>
                        <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          <User className="h-4 w-4 text-muted-foreground" /> {seller?.name || 'Vendeur SalleDeVente'}
                        </p>
                      </div>
                      
                      {seller?.type === 'professionnel' && (!seller?.proExpiresAt || new Date(seller.proExpiresAt) > new Date()) && (
                        <Link 
                          href={`/shops/${seller.shopSlug || seller.uid}`}
                          className="text-[10px] font-black text-amber-600 hover:text-amber-700 underline uppercase tracking-wider flex items-center gap-1"
                        >
                          👁️ Boutique PRO
                        </Link>
                      )}
                    </div>

                    <p className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{seller?.address || 'Dakar, Sénégal'}</span>
                    </p>
                  </div>

                </CardContent>
              </Card>

              {/* Badges de confiance */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="flex flex-col items-center gap-1.5 bg-white p-4 rounded-2xl border">
                  <ShieldCheck className="h-6 w-6 text-indigo-650" />
                  <p className="font-bold text-xs uppercase text-slate-700 leading-none">Transactions Sécurisées</p>
                </div>
                <div className="flex flex-col items-center gap-1.5 bg-white p-4 rounded-2xl border">
                  <TrendingUp className="h-6 w-6 text-indigo-650" />
                  <p className="font-bold text-xs uppercase text-slate-700 leading-none">Offres en direct</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>

      {/* MODAL DE SUCCÈS CELEBRATION */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 text-center space-y-6 border border-indigo-100 shadow-2xl animate-in zoom-in-95 duration-250">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600 animate-bounce">
              <Gavel className="h-10 w-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase text-indigo-950">Offre enregistrée !</h2>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                Votre offre de <span className="font-black text-indigo-700">{lastBiddedAmount.toLocaleString('fr-FR')} FCFA</span> a été validée. Vous êtes désormais le meilleur enchéreur sur cet article.
              </p>
            </div>

            <p className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 p-3 rounded-lg leading-normal">
              ⚠️ Si un autre utilisateur surenchérit, vous recevrez immédiatement une notification dans votre espace membre.
            </p>

            <Button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl"
            >
              Fermer
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
