"use client";

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES } from '@/lib/constants';
import { Switch } from '@/components/ui/switch';
import { Camera, X, Loader2, CheckCircle2, AlertTriangle, UserIcon, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

export default function SellPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user, profile, loading } = useUser();
  const router = useRouter();

  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [condition, setCondition] = useState('used');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Vente en gros
  const [allowWholesale, setAllowWholesale] = useState(false);
  const [wholesaleOnly, setWholesaleOnly] = useState(false);
  const [minWholesaleQuantity, setMinWholesaleQuantity] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');

  // Enchères
  const [saleType, setSaleType] = useState<'direct' | 'auction'>('direct');
  const [auctionDuration, setAuctionDuration] = useState<string>('3');

  const selectedCategoryObj = CATEGORIES.find(c => c.id === category);
  const subcategories = selectedCategoryObj ? selectedCategoryObj.subcategories : [];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 10 - images.length);
      files.forEach(file => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              // Compresser en JPEG 0.6 (excellent compromis qualité/poids : ~40-60KB au lieu de plusieurs Mo)
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
              setImages(prev => [...prev, compressedBase64]);
            }
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit triggered!");
    if (!db || !user || !profile) {
      console.warn("Missing database, user, or profile:", { db: !!db, user: !!user, profile: !!profile });
      return;
    }
    
    // Protection supplémentaire
    if (profile.isBanned) {
      console.warn("User is banned, denying submit.");
      toast({
        title: "Action refusée",
        description: "Votre compte est banni.",
        variant: "destructive"
      });
      return;
    }

    if (!profile.name || !profile.phone || !profile.address) {
      console.warn("Incomplete contact info, denying submit:", { name: profile.name, phone: profile.phone, address: profile.address });
      toast({
        title: "Action refusée",
        description: "Veuillez d'abord compléter vos coordonnées de contact.",
        variant: "destructive"
      });
      return;
    }

    // Validation de la vente en gros
    const isWholesaleActive = allowWholesale && profile.type === 'professionnel';
    if (isWholesaleActive) {
      const minQty = parseInt(minWholesaleQuantity, 10);
      const wPrice = parseFloat(wholesalePrice);
      
      if (isNaN(minQty) || minQty < 2) {
        toast({
          title: "Quantité minimale invalide",
          description: "La quantité minimale pour la vente en gros doit être supérieure ou égale à 2.",
          variant: "destructive"
        });
        return;
      }
      
      if (isNaN(wPrice) || wPrice <= 0) {
        toast({
          title: "Prix de gros invalide",
          description: "Veuillez entrer un prix de gros valide.",
          variant: "destructive"
        });
        return;
      }

      const retailPrice = parseFloat(price);
      if (wPrice > retailPrice) {
        toast({
          title: "Prix de gros trop élevé",
          description: "Le prix de gros unitaire ne peut pas être supérieur au prix classique de détail.",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSubmitting(true);
    console.log("Form values:", { title, price, category, subcategory, condition, imagesCount: images.length });

    // Déterminer en temps réel si l'utilisateur est PRO et actif (non expiré)
    let isProActive = false;
    if (profile.type === 'professionnel') {
      if (!profile.proExpiresAt) {
        isProActive = true;
      } else {
        const expiryDate = typeof profile.proExpiresAt.toDate === 'function'
          ? profile.proExpiresAt.toDate()
          : new Date(profile.proExpiresAt);
        isProActive = expiryDate > new Date();
      }
    }

    // Déterminer en temps réel si le badge Super-Vendeur est actif et non expiré
    let isSuperActive = false;
    let superSellerExpiryStr: string | null = null;
    if (profile.isSuperSeller === true && profile.superSellerExpiresAt) {
      const expiryDate = typeof profile.superSellerExpiresAt.toDate === 'function'
        ? profile.superSellerExpiresAt.toDate()
        : new Date(profile.superSellerExpiresAt);
      isSuperActive = expiryDate > new Date();
      if (isSuperActive) {
        superSellerExpiryStr = expiryDate.toISOString();
      }
    }

    const isAuctionActive = saleType === 'auction';
    let auctionEndAtVal = null;
    if (isAuctionActive) {
      const days = parseInt(auctionDuration, 10);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      auctionEndAtVal = endDate;
    }

    const productData = {
      title: title.trim(),
      description: description.trim(),
      basePrice: parseFloat(price),
      category,
      subcategory,
      condition,
      images,
      status: 'active', // Immédiatement actif (approbation automatique)
      createdAt: serverTimestamp(),
      sellerId: user.uid,
      isPro: isProActive, // Flag de priorité d'affichage
      sellerIsSuper: isSuperActive,
      sellerSuperExpiresAt: superSellerExpiryStr,
      allowWholesale: isAuctionActive ? false : isWholesaleActive,
      wholesaleOnly: isAuctionActive ? false : (isWholesaleActive ? wholesaleOnly : false),
      minWholesaleQuantity: isAuctionActive ? null : (isWholesaleActive ? parseInt(minWholesaleQuantity, 10) : null),
      wholesalePrice: isAuctionActive ? null : (isWholesaleActive ? parseFloat(wholesalePrice) : null),
      isAuction: isAuctionActive,
      auctionEndAt: auctionEndAtVal,
      auctionStartPrice: isAuctionActive ? parseFloat(price) : null,
      currentBid: isAuctionActive ? parseFloat(price) : null,
      currentBidderId: null,
      currentBidderName: null,
      bidsCount: isAuctionActive ? 0 : null
    };

    console.log("Adding product doc to Firestore...", productData);

    addDoc(collection(db, 'products'), productData)
      .then((docRef) => {
        console.log("Product added successfully! ID:", docRef.id);
        setIsSuccess(true);
        toast({
          title: "Annonce en ligne !",
          description: "Votre article a été publié avec succès et est visible dès maintenant.",
        });
        setTimeout(() => router.push('/'), 2000);
      })
      .catch(async (err) => {
        console.error("Failed to add product:", err);
        errorEmitter.emit('app-error', err);
        setIsSubmitting(false);
      });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  // Utilisateur non connecté
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/20">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center space-y-6 rounded-[2.5rem] border-border/50 shadow-xl bg-white">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <UserIcon className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black uppercase tracking-tight text-primary">Connexion requise</h1>
              <p className="text-muted-foreground font-medium">Vous devez vous connecter pour pouvoir publier une annonce sur la plateforme.</p>
            </div>
            <Button asChild className="w-full rounded-xl font-bold h-12">
              <Link href="/login">Se connecter</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Utilisateur banni
  if (profile?.isBanned) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/20">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center space-y-6 rounded-[2.5rem] border-red-200 border-2 shadow-xl bg-white">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-red-600">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black uppercase tracking-tight text-red-800">Compte Suspendu</h1>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Votre compte a été banni par l'administration de SalleDeVente.sn pour non-respect des conditions d'utilisation. Vous n'êtes plus autorisé à vendre.
              </p>
            </div>
            <Button asChild variant="outline" className="w-full rounded-xl font-bold h-12">
              <Link href="/">Retour à l'accueil</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Utilisateur avec profil incomplet (champs requis : name, phone, address, type)
  const isProfileIncomplete = !profile?.name || !profile?.phone || !profile?.address || !profile?.type;

  if (isProfileIncomplete) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/20">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center space-y-6 rounded-[2.5rem] border-amber-200 border-2 shadow-xl bg-white">
            <div className="bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-amber-600">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black uppercase tracking-tight text-amber-800">Profil Incomplet</h1>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Pour pouvoir vendre un article, vous devez renseigner vos coordonnées de contact (Nom complet, Téléphone et Adresse). Ces informations permettront aux acheteurs intéressés de vous contacter directement.
              </p>
            </div>
            <Button asChild className="w-full rounded-xl font-black uppercase h-12 gap-2 bg-amber-600 hover:bg-amber-700 text-white border-none">
              <Link href="/profile">Compléter mes Coordonnées <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/20">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-12 rounded-[3rem] text-center space-y-6 shadow-xl max-w-md w-full border">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Annonce en ligne !</h1>
            <p className="text-muted-foreground font-medium leading-relaxed">
              Votre article a été publié avec succès. Il est désormais visible par tous les utilisateurs de la marketplace !
            </p>
            <p className="text-xs text-muted-foreground italic">Redirection vers l'accueil...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-border/50">
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-primary">Vendre un article</h1>
              <p className="text-muted-foreground font-medium mt-1">Gratuit, rapide et en direct avec les acheteurs.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <Label className="text-lg font-bold uppercase tracking-tight">Photos ({images.length}/10)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                      <Image src={img} alt="" fill className="object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 10 && (
                    <label className="aspect-square border-2 border-dashed border-muted-foreground/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
                      <Camera className="h-8 w-8 text-muted-foreground mb-1" />
                      <span className="text-[10px] font-black uppercase text-muted-foreground">Ajouter</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Titre de l'annonce</Label>
                  <Input 
                    id="title" 
                    placeholder="Ex: iPhone 15 Pro Max..." 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                    className="h-14 rounded-xl text-lg font-bold border-muted/50 focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Catégorie</Label>
                    <Select value={category} onValueChange={(val) => {
                      setCategory(val);
                      setSubcategory('');
                    }} required>
                      <SelectTrigger className="h-14 rounded-xl font-bold border-muted/50">
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subcategory" className="text-xs font-black uppercase tracking-widest text-muted-foreground font-bold">Sous-catégorie</Label>
                    <Select value={subcategory} onValueChange={setSubcategory} disabled={!category} required>
                      <SelectTrigger className="h-14 rounded-xl font-bold border-muted/50 disabled:opacity-50">
                        <SelectValue placeholder={category ? "Choisir une sous-catégorie" : "Sélectionnez d'abord une catégorie"} />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories.map(sub => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="condition" className="text-xs font-black uppercase tracking-widest text-muted-foreground">État de l'article</Label>
                    <Select value={condition} onValueChange={setCondition} required>
                      <SelectTrigger className="h-14 rounded-xl font-bold border-muted/50">
                        <SelectValue placeholder="État" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Neuf (jamais utilisé)</SelectItem>
                        <SelectItem value="used">Occasion (bon état)</SelectItem>
                        <SelectItem value="refurbished">Reconditionné</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 bg-muted/20 border border-border/50 p-6 rounded-2xl">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground block">Type de Transaction</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSaleType('direct')}
                      className={cn(
                        "p-4 rounded-xl border text-center font-black uppercase text-xs transition-all",
                        saleType === 'direct'
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-white text-muted-foreground hover:bg-muted/50 border-border"
                      )}
                    >
                      🏷️ Vente Directe
                    </button>
                    <button
                      type="button"
                      onClick={() => setSaleType('auction')}
                      className={cn(
                        "p-4 rounded-xl border text-center font-black uppercase text-xs transition-all",
                        saleType === 'auction'
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                          : "bg-white text-muted-foreground hover:bg-muted/50 border-border"
                      )}
                    >
                      🔨 Enchères
                    </button>
                  </div>

                  {saleType === 'auction' && (
                    <div className="space-y-4 pt-4 border-t border-border/50 animate-in slide-in-from-top-1 duration-200">
                      <Label htmlFor="auctionDuration" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Durée de l'enchère</Label>
                      <Select value={auctionDuration} onValueChange={setAuctionDuration}>
                        <SelectTrigger id="auctionDuration" className="h-12 rounded-xl font-bold border-muted/50">
                          <SelectValue placeholder="Sélectionnez une durée" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1" className="font-bold">24 Heures (1 jour)</SelectItem>
                          <SelectItem value="3" className="font-bold">3 Jours</SelectItem>
                          <SelectItem value="5" className="font-bold">5 Jours</SelectItem>
                          <SelectItem value="7" className="font-bold">7 Jours</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200 p-3 rounded-lg leading-normal">
                        ⚠️ Une fois publiée, une enchère ne pourra plus être modifiée dès que le premier acquéreur aura formulé une offre.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    {saleType === 'auction' ? "Prix de départ (FCFA)" : "Prix de l'article (FCFA)"}
                  </Label>
                  <div className="relative">
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="0" 
                      value={price} 
                      onChange={(e) => setPrice(e.target.value)} 
                      required 
                      className="h-14 rounded-xl text-2xl font-black border-muted/50 focus:border-primary pr-20"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground">FCFA</div>
                  </div>
                  {price && saleType === 'direct' && (
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Prix de vente direct (0% commission)</p>
                      <p className="text-xl font-black text-primary">{parseFloat(price).toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  )}
                </div>

                {profile?.type === 'professionnel' && saleType === 'direct' && (
                  <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl space-y-6 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-black uppercase text-amber-800">📦 Option Vente en Gros</Label>
                        <p className="text-xs text-muted-foreground font-medium">Proposer des tarifs réduits pour l'achat en quantité.</p>
                      </div>
                      <Switch 
                        checked={allowWholesale} 
                        onCheckedChange={(checked) => {
                          setAllowWholesale(checked);
                          if (!checked) {
                            setWholesaleOnly(false);
                            setMinWholesaleQuantity('');
                            setWholesalePrice('');
                          }
                        }}
                      />
                    </div>

                    {allowWholesale && (
                      <div className="space-y-6 pt-4 border-t border-amber-500/10 animate-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-xs font-black uppercase text-amber-800">Vente exclusive en gros</Label>
                            <p className="text-[11px] text-muted-foreground font-medium">L'article ne sera disponible qu'en gros (pas de vente à l'unité).</p>
                          </div>
                          <Switch 
                            checked={wholesaleOnly} 
                            onCheckedChange={setWholesaleOnly}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="minWholesaleQuantity" className="text-[10px] font-black uppercase tracking-wider text-amber-800">Quantité minimale</Label>
                            <Input 
                              id="minWholesaleQuantity" 
                              type="number"
                              min="2"
                              placeholder="Ex: 5" 
                              value={minWholesaleQuantity} 
                              onChange={(e) => setMinWholesaleQuantity(e.target.value)} 
                              required={allowWholesale}
                              className="h-12 rounded-xl font-bold border-amber-200 focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="wholesalePrice" className="text-[10px] font-black uppercase tracking-wider text-amber-800">Prix de gros unitaire (FCFA)</Label>
                            <Input 
                              id="wholesalePrice" 
                              type="number"
                              placeholder="Ex: 8000" 
                              value={wholesalePrice} 
                              onChange={(e) => setWholesalePrice(e.target.value)} 
                              required={allowWholesale}
                              className="h-12 rounded-xl font-bold border-amber-200 focus:border-amber-500"
                            />
                          </div>
                        </div>
                        
                        {minWholesaleQuantity && wholesalePrice && (
                          <div className="bg-amber-500/10 p-3 rounded-xl text-xs font-bold text-amber-900 border border-amber-500/20">
                            Coût total minimal du lot : <span className="font-black">{(parseInt(minWholesaleQuantity, 10) * parseFloat(wholesalePrice)).toLocaleString('fr-FR')} FCFA</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description détaillée</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Décrivez l'état de votre article, les accessoires inclus..." 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    required 
                    className="min-h-[150px] rounded-2xl p-4 font-medium border-muted/50 focus:border-primary"
                  />
                </div>
              </div>

              <div className="bg-secondary/5 border border-secondary/20 p-4 rounded-2xl space-y-1">
                <p className="text-xs font-black text-secondary uppercase tracking-wider">🔒 Transparence & Signalement</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Votre annonce est publiée immédiatement. Cependant, tout utilisateur connecté peut la signaler si elle ne respecte pas nos CGU. L'administration se réserve le droit de supprimer toute annonce non conforme et de bannir son auteur.
                </p>
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                size="lg" 
                className="w-full h-16 text-xl font-black uppercase rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                {isSubmitting ? <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Publication...</> : "Publier mon annonce"}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
