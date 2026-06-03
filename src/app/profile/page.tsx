"use client";

import { useUser, useAuth } from '@/firebase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, LogOut, Settings, User as UserIcon, ShieldCheck, ChevronRight, MapPin, Phone, UserCheck, AlertTriangle, Sparkles, MessageSquare, Camera, Image as ImageIcon, Upload } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { useFirestore, sendAdminNotification } from '@/firebase';
import { generateSlug } from '@/lib/utils';

export default function ProfilePage() {
  const { user, profile, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<'particulier' | 'professionnel' | ''>('');
  const [isSaving, setIsSaving] = useState(false);

  // Nouvel état pour la demande de badge Super-Vendeur
  const [selectedBadgeDays, setSelectedBadgeDays] = useState<number | null>(7);
  const [isRequestingBadge, setIsRequestingBadge] = useState(false);

  // États pour la boutique
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [shopLogo, setShopLogo] = useState('');
  const [shopCover, setShopCover] = useState('');
  const [isSavingShop, setIsSavingShop] = useState(false);

  // Paiement PayTech
  const [isPaying, setIsPaying] = useState(false);

  // Gérer le retour de paiement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('payment_status');
      if (status === 'success') {
        toast({
          title: "Paiement en cours de traitement ! 🎉",
          description: "Votre transaction a été validée. Les modifications seront effectives sous quelques secondes.",
        });
        router.replace('/profile');
      } else if (status === 'cancel') {
        toast({
          title: "Paiement annulé ⚠️",
          description: "Vous avez annulé la transaction.",
          variant: "destructive"
        });
        router.replace('/profile');
      }
    }
  }, [router, toast]);

  const handlePayOnline = async (paymentType: 'pro' | 'super_seller', durationDays?: number) => {
    if (!db || !user) return;
    setIsPaying(true);
    try {
      const refCommand = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      let price = 100;
      if (paymentType === 'super_seller') {
        if (durationDays === 3) price = 10000;
        else if (durationDays === 7) price = 20000;
        else if (durationDays === 30) price = 50000;
      }

      await setDoc(doc(db, 'transactions', refCommand), {
        transactionId: refCommand,
        status: 'pending',
        userId: user.uid,
        type: paymentType,
        amount: price,
        durationDays: durationDays || null,
        createdAt: new Date().toISOString()
      });

      const response = await fetch('/api/paytech/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: paymentType,
          durationDays,
          userId: user.uid,
          refCommand
        })
      });

      const data = await response.json();

      if (data.success && data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        throw new Error(data.message || "Erreur d'initialisation PayTech.");
      }
    } catch (err: any) {
      console.error("Payment initiation failed:", err);
      toast({
        title: "Paiement impossible",
        description: err.message || "Une erreur est survenue lors de l'ouverture de la passerelle de paiement.",
        variant: "destructive"
      });
    } finally {
      setIsPaying(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 250;
          const MAX_HEIGHT = 250;
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
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
            setShopLogo(compressedBase64);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 400;
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
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
            setShopCover(compressedBase64);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    if (!shopName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez donner un nom à votre boutique.",
        variant: "destructive"
      });
      return;
    }

    setIsSavingShop(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        shopName: shopName.trim(),
        shopDescription: shopDescription.trim(),
        shopLogo,
        shopCover,
        shopSlug: generateSlug(shopName.trim())
      });
      toast({
        title: "Boutique mise à jour",
        description: "Les informations de votre vitrine pro ont été enregistrées avec succès.",
      });
    } catch (error) {
      console.error("Failed to save shop info:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les informations de votre boutique.",
        variant: "destructive"
      });
    } finally {
      setIsSavingShop(false);
    }
  };

  const handleRequestSuperBadge = async () => {
    if (!db || !user || !selectedBadgeDays) return;
    setIsRequestingBadge(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        superSellerRequest: {
          durationDays: selectedBadgeDays,
          status: 'pending',
          requestedAt: new Date().toISOString()
        }
      });
      
      // Notifier l'admin de la demande de badge
      sendAdminNotification(db, {
        title: "✨ Demande de Badge Super-Vendeur",
        message: `L'utilisateur ${profile?.name || user.email || 'Utilisateur'} (${user.email}) a demandé un badge Super-Vendeur pour ${selectedBadgeDays} jours.`,
        type: "commercial",
        link: "/admin"
      });

      toast({
        title: "Demande soumise",
        description: `Votre demande de badge Super-Vendeur (${selectedBadgeDays} jours) a été enregistrée.`,
      });
    } catch (error) {
      console.error("Failed to request badge:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande.",
        variant: "destructive"
      });
    } finally {
      setIsRequestingBadge(false);
    }
  };

  // Initialise les valeurs du formulaire
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      // Si l'utilisateur est PRO approuvé ou en attente, le type local est initialisé
      setType(profile.type || '');
      
      // Boutique
      setShopName(profile.shopName || profile.name || '');
      setShopDescription(profile.shopDescription || '');
      setShopLogo(profile.shopLogo || '');
      setShopCover(profile.shopCover || '');
      
      // Si le profil est incomplet, on ouvre l'édition par défaut
      if (!profile.name || !profile.phone || !profile.address || !profile.type) {
        setIsEditing(true);
      }
    }
  }, [profile]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès.",
      });
      router.push('/');
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;

    if (!name.trim() || !phone.trim() || !address.trim() || !type) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir toutes les informations personnelles.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const updateData: any = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      };

      if (type === 'professionnel') {
        if (profile?.type !== 'professionnel' && profile?.proStatus !== 'approved') {
          updateData.proStatus = 'pending';
          updateData.isProPending = true;
          // Conserver l'ancien type ou particulier temporairement en attendant validation
          updateData.type = profile?.type || 'particulier';
        } else {
          updateData.type = 'professionnel';
          // Si le profil est déjà professionnel, on n'envoie pas proStatus et isProPending
          // sauf s'ils étaient déjà 'approved', pour respecter les règles de sécurité Firestore.
          if (profile?.proStatus === 'approved') {
            updateData.proStatus = 'approved';
            updateData.isProPending = false;
          }
        }
      } else {
        updateData.type = 'particulier';
        updateData.proStatus = null;
        updateData.isProPending = false;
      }

      await updateDoc(doc(db, 'users', user.uid), updateData);

      // Si c'est une nouvelle demande d'agrément PRO en attente, notifier l'admin
      if (updateData.proStatus === 'pending') {
        sendAdminNotification(db, {
          title: "💼 Demande d'agrément PRO",
          message: `L'utilisateur ${updateData.name || user.email || 'Utilisateur'} (${user.email}) a demandé l'approbation du statut de Vendeur Professionnel.`,
          type: "profile",
          link: "/admin"
        });
      }

      toast({
        title: "Profil mis à jour",
        description: type === 'professionnel' && profile?.type !== 'professionnel' && profile?.proStatus !== 'approved'
          ? "Vos informations ont été enregistrées. Votre demande d'activation Pro est en attente commerciale."
          : "Vos informations ont été enregistrées avec succès.",
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le profil.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isAdmin = user?.email === 'ndaw22@gmail.com';
  const isProfileIncomplete = profile && (!profile.name || !profile.phone || !profile.address || !profile.type);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4 bg-muted/10">
          <Card className="max-w-md w-full p-8 text-center space-y-6 rounded-[2rem] border-border/50 shadow-sm">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <UserIcon className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-normal uppercase">Accès restreint</h1>
              <p className="text-muted-foreground font-medium">Vous devez être connecté pour accéder à votre profil.</p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button asChild className="w-full rounded-xl font-bold h-12 bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/15 transition-all hover:scale-[1.02] active:scale-95">
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button asChild variant="outline" className="w-full rounded-xl font-bold h-12 border-border/60 hover:bg-muted text-foreground transition-all hover:scale-[1.02] active:scale-95">
                <Link href="/">Retour à l'accueil</Link>
              </Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <Header />
      <main className="flex-1">
        <div className="w-full bg-muted border-y border-border/50 py-3">
          <div className="container mx-auto px-4">
            <h1 className="text-[14px] font-bebas tracking-[0.1em] uppercase">Mon Profil Utilisateur</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {profile?.isBanned && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-6 rounded-[2rem] mb-8 flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-black uppercase tracking-tight text-red-800">Compte Suspendu (Banni)</h3>
                <p className="text-sm font-medium mt-1">
                  Ce compte a été restreint par l'administration pour non-respect des Conditions Générales d'Utilisation. Vous ne pouvez plus publier d'annonces ni consulter les coordonnées des vendeurs.
                </p>
              </div>
            </div>
          )}

          {isProfileIncomplete && !profile?.isBanned && (
            <div className="bg-amber-50 border-2 border-amber-200 text-amber-700 p-6 rounded-[2rem] mb-8 flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-black uppercase tracking-tight text-amber-800">Profil Incomplet</h3>
                <p className="text-sm font-medium mt-1">
                  Veuillez renseigner votre nom, adresse, numéro de téléphone et type de compte pour pouvoir publier des annonces et contacter des vendeurs sur SalleDeVente.sn.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-1 border-border/50 rounded-[2rem] overflow-hidden shadow-sm h-fit bg-white">
              <CardContent className="p-8 text-center space-y-4">
                <Avatar className="h-32 w-32 mx-auto border-4 border-primary/10 shadow-lg">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || ''} />
                  <AvatarFallback className="bg-primary text-white text-3xl font-black">
                    {user.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 pt-4">
                  <h2 className="text-xl font-black uppercase tracking-tight">{name || user.displayName}</h2>
                  <p className="text-muted-foreground text-sm font-medium">{user.email}</p>
                </div>
                 <div className="flex flex-col items-center gap-2 pt-2">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full font-bold">
                    {profile?.type === 'professionnel' ? 'Vendeur PRO' : profile?.proStatus === 'pending' ? 'PRO (En attente)' : 'Membre Particulier'}
                  </Badge>
                  {isAdmin && (
                    <Badge variant="secondary" className="gap-1 px-4 py-1">
                      <ShieldCheck className="h-3 w-3" /> Administrateur
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-2 space-y-6">
              {isAdmin && (
                <Card className="border-secondary/30 bg-secondary/5 rounded-[2rem] overflow-hidden shadow-sm border-2">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-secondary rounded-2xl">
                          <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-black uppercase text-secondary tracking-tight">Espace Administrateur</h3>
                          <p className="text-sm text-muted-foreground font-medium">Gérer les validations et les membres.</p>
                        </div>
                      </div>
                      <Button asChild variant="secondary" className="rounded-xl font-black uppercase">
                        <Link href="/admin">Y accéder <ChevronRight className="ml-1 h-4 w-4" /></Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {profile?.proStatus === 'pending' && (
                <div className="bg-amber-50 border-2 border-amber-200 text-amber-700 p-6 rounded-[2rem] space-y-4 shadow-sm animate-pulse">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-black uppercase tracking-tight text-amber-800">Demande de profil PRO en attente</h3>
                      <p className="text-xs font-medium leading-relaxed mt-1">
                        Votre demande de passage au statut Professionnel est en cours de traitement. Pour activer immédiatement votre compte, veuillez régler votre abonnement mensuel de 100 FCFA en ligne, ou contacter notre service commercial au (+221 76 174 06 41).
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-amber-200/50">
                    <Button 
                      onClick={() => handlePayOnline('pro')}
                      disabled={isPaying}
                      size="sm" 
                      className="rounded-xl font-bold bg-[#2E5BFF] hover:bg-[#2E5BFF]/90 text-white gap-2 flex-1 border-none h-9 text-[11px]"
                    >
                      {isPaying ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : "💳 Payer mon abonnement PRO (100 F)"}
                    </Button>
                    <Button asChild size="sm" className="rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white gap-2 flex-1 border-none h-9 text-[11px]">
                      <a href={`https://wa.me/221761740641?text=Bonjour,%20je%20souhaite%20finaliser%20mon%20abonnement%20PRO%20de%20100%20FCFA%20pour%20le%20compte%20${encodeURIComponent(user.email || "")}`} target="_blank" rel="noopener noreferrer">
                        <MessageSquare className="h-4 w-4" /> WhatsApp Commercial
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {profile?.type === 'professionnel' && (
                <Card className="border-amber-300/60 rounded-[2rem] overflow-hidden shadow-md bg-gradient-to-br from-amber-50/50 to-white relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-500" />
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-400/20 rounded-2xl text-amber-600">
                        <Sparkles className="h-6 w-6 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-black uppercase text-slate-800 tracking-tight">⭐ Badge Super-Vendeur</h3>
                        <p className="text-xs text-muted-foreground font-medium">Bénéficiez d&apos;une visibilité absolue sur SalleDeVente.sn</p>
                      </div>
                    </div>

                    {profile?.isSuperSeller && profile?.superSellerExpiresAt && (
                      (typeof profile.superSellerExpiresAt.toDate === 'function'
                        ? profile.superSellerExpiresAt.toDate()
                        : new Date(profile.superSellerExpiresAt)) > new Date()
                    ) ? (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl space-y-1">
                        <p className="text-xs font-black text-amber-700 uppercase tracking-wider">✨ Badge Actif et Brillant</p>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                          Votre badge Super-Vendeur est actif et en ligne ! Vos produits apparaissent dans la vitrine dorée d&apos;accueil.
                        </p>
                        <p className="text-[10px] text-amber-600 font-black uppercase pt-1.5">
                          Expire le : {profile.superSellerExpiresAt.toDate ? profile.superSellerExpiresAt.toDate().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date(profile.superSellerExpiresAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    ) : profile?.superSellerRequest?.status === 'pending' ? (
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
                        <div className="space-y-1">
                          <p className="text-xs font-black text-amber-700 uppercase tracking-wider">⏳ Demande de badge en cours</p>
                          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                            Votre demande de badge Super-Vendeur pour **{profile?.superSellerRequest?.durationDays} jours** a bien été reçue. Vous pouvez régler immédiatement en ligne ou par contact WhatsApp.
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button 
                            onClick={() => {
                              if (profile?.superSellerRequest?.durationDays) {
                                handlePayOnline('super_seller', profile.superSellerRequest.durationDays);
                              }
                            }}
                            disabled={isPaying}
                            size="sm" 
                            className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-white flex-1 h-9 text-[11px] gap-1"
                          >
                            {isPaying ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : "💳 Payer en ligne (Wave/OM)"}
                          </Button>
                          <Button asChild size="sm" variant="outline" className="rounded-xl font-bold border-amber-300 text-amber-800 hover:bg-amber-100 flex-1 h-9 text-[11px]">
                            <a href={`https://wa.me/221761740641?text=Bonjour,%20je%20souhaite%20finaliser%20mon%20badge%20Super-Vendeur%20de%20${profile?.superSellerRequest?.durationDays}%20jours%20pour%20mon%20compte%20${encodeURIComponent(user.email || "")}`} target="_blank" rel="noopener noreferrer">
                              <MessageSquare className="h-3.5 w-3.5 mr-1" /> WhatsApp Commercial
                            </a>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                          Sélectionnez l&apos;offre de votre choix pour demander l&apos;activation de votre badge or :
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { days: 3, price: "10k" },
                            { days: 7, price: "20k" },
                            { days: 30, price: "50k" }
                          ].map((pack) => (
                            <button
                              type="button"
                              key={pack.days}
                              onClick={() => setSelectedBadgeDays(pack.days)}
                              className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                                selectedBadgeDays === pack.days 
                                  ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm" 
                                  : "border-border/60 hover:border-amber-200 bg-white"
                              }`}
                            >
                              <span className="text-sm font-black">{pack.days} jours</span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">{pack.price} FCFA</span>
                            </button>
                          ))}
                        </div>
                        
                        <Button 
                          type="button"
                          onClick={handleRequestSuperBadge}
                          disabled={isRequestingBadge || !selectedBadgeDays}
                          className="w-full rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 border-none h-11"
                        >
                          {isRequestingBadge ? <Loader2 className="animate-spin h-4 w-4" /> : "Soumettre ma Demande"}
                        </Button>
                      </div>
                    )}
                    <div className="text-center pt-2 border-t">
                      <Link href="/badges" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-amber-500 transition-colors">
                        Voir le détail des offres &amp; tarifs ➔
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {profile?.type === 'professionnel' && (
                <Card className="border-border/50 rounded-[2rem] overflow-hidden shadow-sm bg-white">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <h3 className="font-bold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500" />
                        Ma Boutique Professionnelle
                      </h3>
                      <Link 
                        href={`/shops/${profile?.shopSlug || user.uid}`}
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                      >
                        Voir ma boutique ➔
                      </Link>
                    </div>

                    <form onSubmit={handleSaveShop} className="space-y-6">
                      {/* Photo de couverture */}
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Photo de couverture de la boutique</Label>
                        <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-gradient-to-r from-[#2E5BFF]/10 via-[#2E5BFF]/5 to-transparent border-2 border-dashed border-border/60 shadow-inner flex items-center justify-center">
                          {shopCover ? (
                            <Image src={shopCover} alt="Couverture" fill className="object-cover animate-in fade-in duration-300" />
                          ) : (
                            <div className="text-center p-4">
                              <ImageIcon className="h-8 w-8 text-muted-foreground/30 mx-auto mb-1" />
                              <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider">
                                Recommandé : 800 x 400 pixels
                              </span>
                            </div>
                          )}
                          <div className="absolute bottom-3 right-3 z-20">
                            <label className="bg-white/95 hover:bg-white text-slate-800 text-[10px] font-black uppercase tracking-wider py-2 px-3.5 rounded-xl cursor-pointer shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5 border border-border/20">
                              <Camera className="h-3.5 w-3.5" /> Choisir une couverture
                              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Logo de la boutique */}
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Logo de la boutique</Label>
                        <div className="flex items-center gap-4 p-3 bg-muted/20 rounded-2xl border border-border/30">
                          <div className="relative w-16 h-16 rounded-xl border bg-white shadow-sm flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {shopLogo ? (
                              <Image src={shopLogo} alt="Logo" fill className="object-cover animate-in fade-in duration-300" />
                            ) : (
                              <span className="text-xl font-black text-muted-foreground/40 uppercase">
                                {shopName.charAt(0) || profile?.name?.charAt(0) || 'B'}
                              </span>
                            )}
                          </div>
                          <div>
                            <label className="bg-white hover:bg-muted text-slate-800 text-[10px] font-black uppercase tracking-wider py-2 px-3.5 rounded-xl cursor-pointer shadow border border-border/60 hover:scale-[1.02] active:scale-95 transition-all inline-flex items-center gap-1.5">
                              <Upload className="h-3.5 w-3.5" /> Télécharger le logo
                              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                            </label>
                            <p className="text-[9px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">Format carré (250x250 px max) • max 100ko</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="shop-name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nom commercial de la boutique</Label>
                          <Input 
                            id="shop-name" 
                            value={shopName} 
                            onChange={(e) => setShopName(e.target.value)} 
                            placeholder="Nom de votre enseigne..." 
                            required 
                            className="h-12 rounded-xl font-bold"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="shop-desc" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description / Présentation de votre activité</Label>
                          <Input 
                            id="shop-desc" 
                            value={shopDescription} 
                            onChange={(e) => setShopDescription(e.target.value)} 
                            placeholder="Ex: Importateur de prêt-à-porter, produits cosmétiques de luxe..." 
                            className="h-12 rounded-xl font-bold"
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSavingShop} 
                        className="w-full h-12 rounded-xl font-black uppercase bg-amber-500 hover:bg-amber-400 text-slate-950 border-none shadow-lg shadow-amber-500/10 hover:scale-[1.01] active:scale-95 transition-all"
                      >
                        {isSavingShop ? <Loader2 className="animate-spin h-5 w-5" /> : "Enregistrer ma Vitrine"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Card className="border-border/50 rounded-[2rem] overflow-hidden shadow-sm bg-white">
                <CardContent className="p-8 space-y-6">
                  {isEditing ? (
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b">
                        <h3 className="font-bold flex items-center gap-2">
                          <Settings className="h-5 w-5 text-primary" />
                          Compléter mes informations
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nom complet / Raison Sociale</Label>
                          <Input 
                            id="edit-name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Votre nom complet" 
                            required 
                            className="h-12 rounded-xl font-bold"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Numéro de téléphone</Label>
                            <Input 
                              id="edit-phone" 
                              value={phone} 
                              onChange={(e) => setPhone(e.target.value)} 
                              placeholder="+221 77 XXX XX XX" 
                              required 
                              className="h-12 rounded-xl font-bold"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-type" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Type de compte</Label>
                            <Select value={type} onValueChange={(val: any) => setType(val)} required>
                              <SelectTrigger id="edit-type" className="h-12 rounded-xl font-bold">
                                <SelectValue placeholder="Particulier ou Pro" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="particulier">Particulier (Ventes occasionnelles)</SelectItem>
                                <SelectItem value="professionnel">Professionnel (Commerce / Boutique)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-address" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Adresse complète (Dakar, Région...)</Label>
                          <Input 
                            id="edit-address" 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            placeholder="Ex: Médina, Rue 6 x 11, Dakar" 
                            required 
                            className="h-12 rounded-xl font-bold"
                          />
                        </div>
                      </div>

                      {type === 'professionnel' && (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-1">
                          <p className="text-xs font-black text-amber-700 uppercase tracking-wider">💼 Abonnement Professionnel - 100 FCFA / mois</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            L&apos;approbation administrative de votre compte professionnel prend moins de 24h. Vous serez immédiatement notifié par **Email et WhatsApp** dès validation. Vous pouvez contacter le service commercial pour accélérer le processus ou effectuer votre paiement sécurisé.
                          </p>
                        </div>
                      )}

                      <div className="flex gap-4 pt-4">
                        <Button 
                          type="submit" 
                          disabled={isSaving} 
                          className="flex-1 h-12 rounded-xl font-bold bg-primary text-white"
                        >
                          {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : "Enregistrer"}
                        </Button>
                        {!isProfileIncomplete && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsEditing(false)} 
                            className="h-12 rounded-xl font-bold"
                          >
                            Annuler
                          </Button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center justify-between pb-4 border-b">
                        <h3 className="font-bold flex items-center gap-2">
                          <UserIcon className="h-5 w-5 text-secondary" />
                          Mes Informations Coordonnées
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-xl text-primary mt-0.5"><UserCheck className="h-4 w-4" /></div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Nom / Raison Sociale</p>
                            <p className="font-bold text-sm text-foreground">{profile?.name || 'Non renseigné'}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-xl text-primary mt-0.5"><Phone className="h-4 w-4" /></div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Numéro de téléphone</p>
                            <p className="font-bold text-sm text-foreground">{profile?.phone || 'Non renseigné'}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 sm:col-span-2">
                          <div className="p-2 bg-primary/10 rounded-xl text-primary mt-0.5"><MapPin className="h-4 w-4" /></div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Adresse complète</p>
                            <p className="font-bold text-sm text-foreground">{profile?.address || 'Non renseigné'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t">
                        <Button variant="outline" className="h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 group hover:border-primary/50 transition-all" asChild>
                          <Link href="/my-listings">
                            <span className="text-2xl font-black text-primary group-hover:scale-110 transition-transform">Gérer</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Mes Annonces</span>
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(true)} 
                          className="h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 group hover:border-secondary/50 transition-all"
                        >
                          <Settings className="h-6 w-6 text-secondary group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Modifier mes Coordonnées</span>
                        </Button>
                      </div>

                      <div className="space-y-4 pt-4 border-t">
                        <Button variant="ghost" className="w-full justify-start font-bold rounded-xl h-12 text-destructive hover:text-destructive hover:bg-destructive/5" onClick={handleLogout}>
                          <LogOut className="h-4 w-4 mr-2" /> Se déconnecter
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="bg-secondary/5 border border-secondary/20 p-6 rounded-[2rem] space-y-2">
                <p className="text-sm font-bold text-secondary uppercase tracking-wider">Transactions Directes</p>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Sur SalleDeVente.sn, les ventes se font directement de particulier à particulier ou auprès de commerces professionnels. Vos coordonnées ne sont révélées qu'aux acheteurs connectés possédant également un compte valide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
