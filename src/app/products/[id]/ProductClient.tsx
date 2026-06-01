"use client";

import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Truck, ArrowLeft, Loader2, MessageCircle, Phone, MapPin, Sparkles, User, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser, sendAdminNotification } from '@/firebase';
import { doc, addDoc, collection, serverTimestamp, updateDoc, increment, query, where, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ProductCard } from '@/components/products/ProductCard';

export default function ProductClient() {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const db = useFirestore();
  const { user, profile, loading: authLoading } = useUser();
  const { toast } = useToast();
  const [isReporting, setIsReporting] = useState(false);
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [phoneClicksTracked, setPhoneClicksTracked] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);

  const getMaskedPhone = (phoneStr: string) => {
    if (!phoneStr) return "---";
    const cleaned = phoneStr.trim();
    if (cleaned.length <= 6) return cleaned + " •• ••";
    const prefix = cleaned.slice(0, cleaned.length - 4);
    return prefix + " •• ••";
  };

  const handleRevealPhone = async () => {
    setShowFullPhone(true);
    if (!phoneClicksTracked && id && db) {
      setPhoneClicksTracked(true);
      const productDocRef = doc(db, 'products', id as string);
      try {
        await updateDoc(productDocRef, {
          phoneClicksCount: increment(1)
        });
      } catch (err) {
        console.error("Error incrementing phoneClicksCount:", err);
      }
    }
  };

  // Charger le produit
  const productRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id as string);
  }, [db, id]);

  const { data: product, loading: productLoading } = useDoc(productRef);
  const router = useRouter();

  useEffect(() => {
    if (product?.isAuction) {
      router.replace(`/encheres/${id}`);
    }
  }, [product, id, router]);

  useEffect(() => {
    if (id && db && product && !viewTracked && !product.isAuction) {
      setViewTracked(true);
      const productDocRef = doc(db, 'products', id as string);
      updateDoc(productDocRef, {
        viewsCount: increment(1)
      }).catch(err => console.error("Error incrementing viewsCount:", err));
    }
  }, [id, db, product, viewTracked]);

  // Charger le vendeur si le produit existe
  const sellerRef = useMemoFirebase(() => {
    if (!db || !product?.sellerId) return null;
    return doc(db, 'users', product.sellerId);
  }, [db, product?.sellerId]);

  const { data: seller, loading: sellerLoading } = useDoc(sellerRef);

  // Charger les produits similaires de la même catégorie
  const similarProductsQuery = useMemoFirebase(() => {
    if (!db || !product?.category) return null;
    return query(
      collection(db, 'products'),
      where('status', '==', 'active'),
      where('category', '==', product.category),
      limit(5)
    );
  }, [db, product?.category]);

  const { data: similarProductsRaw } = useCollection(similarProductsQuery);

  const similarProducts = (similarProductsRaw || [])
    .filter((p: any) => p.id !== id)
    .slice(0, 4);

  const loading = productLoading || authLoading || sellerLoading;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center space-y-4 p-8">
          <h1 className="text-2xl font-black uppercase">Oups ! Article introuvable.</h1>
          <Button asChild className="rounded-xl"><Link href="/products">Retour aux articles</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  const finalPrice = product.basePrice;
  const images = product.images || ['https://picsum.photos/seed/placeholder/800/800'];
  const isProfileIncomplete = user && (!profile?.name || !profile?.phone || !profile?.address || !profile?.type);

  const handleReportProduct = async () => {
    if (!db || !user || !product) return;
    setIsReporting(true);
    try {
      // 1. Créer le document de signalement
      await addDoc(collection(db, 'reports'), {
        productId: product.id || (id as string),
        productTitle: product.title,
        reporterId: user.uid,
        reporterEmail: user.email || '',
        createdAt: serverTimestamp(),
        reason: "Non respect des CGU / Contenu inapproprié"
      });

      // 2. Incrémenter le compteur de signalements sur le produit lui-même
      await updateDoc(doc(db, 'products', product.id || (id as string)), {
        reportsCount: (product.reportsCount || 0) + 1
      });

      // 3. Notifier l'admin du signalement
      sendAdminNotification(db, {
        title: "⚠️ Produit signalé",
        message: `Le produit "${product.title}" a été signalé par ${user.email || 'un utilisateur'}. Raison : Non respect des CGU / Contenu inapproprié.`,
        type: "profile",
        link: "/admin"
      });

      toast({
        title: "Article signalé !",
        description: "Merci pour votre signalement. L'administration va examiner cet article sous peu.",
      });
    } catch (error) {
      console.error("Failed to report product:", error);
      toast({
        title: "Action impossible",
        description: "Une erreur est survenue lors du signalement.",
        variant: "destructive"
      });
    } finally {
      setIsReporting(false);
    }
  };

  const whatsappMessage = product?.allowWholesale
    ? product.wholesaleOnly
      ? `Bonjour, je suis intéressé par l'achat en gros de votre produit "${product.title}" au prix de gros unitaire de ${product.wholesalePrice} FCFA (lot de ${product.minWholesaleQuantity} pièces minimum).`
      : `Bonjour, je suis intéressé par votre produit "${product.title}" (option détail à ${product.basePrice} FCFA ou option gros à ${product.wholesalePrice} FCFA/u dès ${product.minWholesaleQuantity} pièces).`
    : `Bonjour, je suis intéressé par votre article "${product.title}" publié sur SalleDeVente.sn au prix de ${product.basePrice} FCFA.`;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8 md:py-12 bg-muted/10">
        <div className="container mx-auto px-4">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" /> Retour à la liste
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-square relative rounded-[2rem] overflow-hidden bg-white border shadow-sm">
                <Image src={images[activeImage]} alt={product.title} fill className="object-cover" />
              </div>
              {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {images.map((img: string, idx: number) => (
                    <button 
                      key={idx} 
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 ${activeImage === idx ? 'border-primary' : 'border-transparent'}`}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-3 py-1 font-bold text-xs uppercase bg-primary/10 text-primary">
                    {product.condition === 'new' ? 'Neuf' : 'Occasion'}
                  </Badge>
                  <Badge variant="outline" className="text-xs uppercase font-bold">
                    {CATEGORIES.find(c => c.id === product.category)?.name || product.category}
                    {product.subcategory && ` › ${product.subcategory}`}
                  </Badge>
                  {product.isPro && (
                    <Badge className="bg-amber-500 text-white font-bold gap-1 text-xs uppercase border-none px-3 py-1 rounded-full shadow-sm">
                      <Sparkles className="h-3 w-3 fill-white" /> Vendeur PRO
                    </Badge>
                  )}
                  {product.allowWholesale && (
                    product.wholesaleOnly ? (
                      <Badge className="bg-purple-600 text-white font-bold gap-1 text-xs uppercase border-none px-3 py-1 rounded-full shadow-sm">
                        📦 En gros uniquement
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-600 text-white font-bold gap-1 text-xs uppercase border-none px-3 py-1 rounded-full shadow-sm">
                        📦 Vente en gros disponible
                      </Badge>
                    )
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight uppercase">
                  {product.title}
                </h1>
                {product.wholesaleOnly ? (
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-6xl font-black text-purple-600">
                        {product.wholesalePrice?.toLocaleString('fr-FR')} 
                      </span>
                      <span className="text-xl font-bold text-purple-600">FCFA</span>
                      <span className="text-xs font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded border border-purple-200 uppercase ml-2">
                        Prix de gros unitaire
                      </span>
                    </div>
                    <p className="text-sm text-purple-600 font-bold">⚠️ Cet article est vendu exclusivement en gros.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-6xl font-black text-primary">
                        {finalPrice.toLocaleString('fr-FR')} 
                      </span>
                      <span className="text-xl font-bold text-primary">FCFA</span>
                    </div>
                    {product.allowWholesale && product.wholesalePrice && (
                      <p className="text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 w-fit">
                        📦 Tarif de gros : <span className="font-black">{product.wholesalePrice.toLocaleString('fr-FR')} FCFA</span> / pièce (dès {product.minWholesaleQuantity} pièces)
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION ACHAT DIRECT / CONTACT SÉCURISÉ */}
              <div className="pt-2">
                {profile?.isBanned ? (
                  <div className="bg-red-50 border border-red-200 p-6 rounded-[2rem] text-center space-y-2 flex items-start gap-4">
                    <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <h3 className="font-black uppercase tracking-tight text-red-800">Compte Suspendu</h3>
                      <p className="text-xs text-red-600 font-medium mt-1">
                        Votre compte a été banni. Vous n'êtes plus autorisé à voir les coordonnées des vendeurs sur la plateforme.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-[2rem] border border-border/50 shadow-md space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vendeur</h3>
                        <p className="font-black text-xl text-foreground mt-0.5 flex items-center gap-2">
                          <User className="h-5 w-5 text-muted-foreground" /> {seller?.name || 'Vendeur SalleDeVente'}
                        </p>
                      </div>
                      {seller?.type === 'professionnel' && (!seller?.proExpiresAt || new Date(seller.proExpiresAt) > new Date()) && (
                        <div className="flex flex-col items-end gap-1.5">
                          <Badge className="bg-amber-500 text-white font-bold px-3 py-1 rounded-full text-[10px] uppercase border-none">
                            PRO
                          </Badge>
                          <Link 
                            href={`/shops/${seller.shopSlug || seller.uid}`}
                            className="text-[10px] font-black text-amber-600 hover:text-amber-700 underline uppercase tracking-wider flex items-center gap-1 transition-colors"
                          >
                            <Sparkles className="h-2.5 w-2.5 fill-amber-600" /> Visiter la boutique
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 font-medium text-sm text-muted-foreground">
                      <p className="flex items-center gap-2 text-foreground">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider w-20 flex-shrink-0">📍 Lieu :</span>
                        <span>{seller?.address || 'Dakar, Sénégal'}</span>
                      </p>
                      <p className="flex items-center gap-2 text-foreground">
                        <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider w-20 flex-shrink-0">📞 Tél :</span>
                        {showFullPhone ? (
                          <span className="font-bold text-base transition-all duration-300">{seller?.phone}</span>
                        ) : (
                          <span 
                            onClick={handleRevealPhone}
                            className="font-bold text-xs cursor-pointer hover:text-primary transition-all duration-300 flex items-center gap-2 bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 border-dashed"
                          >
                            <span className="tracking-widest">{getMaskedPhone(seller?.phone || '')}</span>
                            <span className="text-[9px] font-black uppercase text-primary animate-pulse">Afficher</span>
                          </span>
                        )}
                      </p>
                    </div>

                    {product.allowWholesale && product.wholesalePrice && (
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 space-y-3 text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800">📦 Détails Vente en Gros</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase block">Qte Min. :</span>
                            <span className="text-base font-black text-emerald-800">{product.minWholesaleQuantity} pièces</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase block">Prix de gros / u :</span>
                            <span className="text-base font-black text-emerald-800">{product.wholesalePrice.toLocaleString('fr-FR')} FCFA</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-emerald-200 flex justify-between items-baseline">
                          <span className="text-[10px] text-emerald-950 font-black uppercase">Total Lot :</span>
                          <span className="text-lg font-black text-emerald-700">
                             {((product.minWholesaleQuantity || 2) * product.wholesalePrice).toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      {showFullPhone ? (
                        <>
                          <Button asChild className="flex-1 h-14 font-black uppercase rounded-xl bg-primary text-white hover:bg-primary/95 text-sm" size="lg">
                            <a href={`tel:${seller?.phone}`}>📞 Appeler ({seller?.phone})</a>
                          </Button>
                          <Button asChild className="flex-1 h-14 font-black uppercase rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm" size="lg">
                            <a 
                              href={`https://wa.me/${seller?.phone?.replace(/\s+/g, '')}?text=${encodeURIComponent(whatsappMessage)}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <MessageCircle className="h-5 w-5 mr-1" /> WhatsApp
                            </a>
                          </Button>
                        </>
                      ) : (
                        <Button 
                          onClick={handleRevealPhone} 
                          className="w-full h-14 font-black uppercase rounded-xl bg-primary text-white hover:bg-primary/95 text-sm shadow-md transition-all hover:scale-[1.01] active:scale-95" 
                          size="lg"
                        >
                          🔓 Afficher les contacts du vendeur
                        </Button>
                      )}
                    </div>

                    <div className="pt-3 border-t text-center">
                      <Button 
                        onClick={handleReportProduct} 
                        disabled={isReporting}
                        variant="ghost" 
                        className="text-xs font-black text-red-500 hover:text-red-600 hover:bg-red-50/50 rounded-xl gap-1 w-full"
                      >
                        ⚠️ {isReporting ? "Signalement en cours..." : "Signaler cet article à la modération"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-3 items-center bg-white p-4 rounded-2xl border">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                  <div><p className="font-bold text-sm">Vente Directe</p></div>
                </div>
                <div className="flex gap-3 items-center bg-white p-4 rounded-2xl border">
                  <Truck className="h-8 w-8 text-secondary" />
                  <div><p className="font-bold text-sm">Remise en main propre</p></div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="bg-muted p-4 rounded-xl border">
                  <h3 className="text-lg font-normal uppercase">Description</h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            </div>
          </div>

          {/* Annonces similaires */}
          {similarProducts.length > 0 && (
            <div className="mt-16 pt-8 border-t border-border/50">
              <h2 className="text-2xl font-black uppercase tracking-tight text-primary mb-6">
                Annonces similaires
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {similarProducts.map((p) => (
                  <ProductCard key={p.id} product={{
                    id: p.id,
                    title: p.title,
                    basePrice: p.basePrice,
                    image: p.images?.[0] || 'https://picsum.photos/seed/placeholder/400/400',
                    condition: p.condition as any,
                    category: CATEGORIES.find(c => c.id === p.category)?.name || p.category,
                    subcategory: p.subcategory,
                    isPro: p.isPro,
                    isSuperSeller: p.isSuperSeller,
                    sellerIsSuper: p.sellerIsSuper,
                    sellerSuperExpiresAt: p.sellerSuperExpiresAt,
                    allowWholesale: p.allowWholesale,
                    wholesaleOnly: p.wholesaleOnly,
                    minWholesaleQuantity: p.minWholesaleQuantity,
                    wholesalePrice: p.wholesalePrice
                  }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
