"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase, sendNotification, sendGlobalNotification } from '@/firebase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Check, X, Eye, ShieldAlert, Loader2, Users, FileText, 
  BarChart3, ShieldCheck, Star, Search, ShieldX, UserMinus, 
  UserCheck, Trash2, ShieldAlert as FlagIcon, ListCollapse, Undo,
  Sparkles, MessageSquare, Phone, AlertTriangle, Package, Bell, Send,
  Activity
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { LoadingLogo } from '@/components/ui/loading-logo';
import { collection, query, where, doc, updateDoc, writeBatch, getDocs, deleteDoc, orderBy } from 'firebase/firestore';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';
import { MonitoringDashboard } from '@/components/admin/MonitoringDashboard';

export default function AdminPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'reports' | 'all-products' | 'users' | 'notifications' | 'monitoring'>('monitoring');
  const [userSearch, setUserSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [adminSelectedMonths, setAdminSelectedMonths] = useState<Record<string, number>>({});
  const [adminSelectedBadgeDays, setAdminSelectedBadgeDays] = useState<Record<string, number>>({});

  // States for notifications
  const [globalTitle, setGlobalTitle] = useState('');
  const [globalMessage, setGlobalMessage] = useState('');
  const [globalLink, setGlobalLink] = useState('');
  const [globalType, setGlobalType] = useState<'global' | 'commercial'>('global');
  const [isSendingGlobal, setIsSendingGlobal] = useState(false);

  const [directTitle, setDirectTitle] = useState('');
  const [directMessage, setDirectMessage] = useState('');
  const [directLink, setDirectLink] = useState('');
  const [directType, setDirectType] = useState<'profile' | 'global' | 'commercial'>('profile');
  const [isSendingDirect, setIsSendingDirect] = useState(false);
  const [notifyingUser, setNotifyingUser] = useState<any>(null);

  const isAdmin = user?.email === 'ndaw22@gmail.com';

  // 1. Charger tous les produits du marché (pour recherche globale et signalements)
  const productsQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  }, [db, isAdmin]);

  const { data: allProducts, loading: productsLoading } = useCollection(productsQuery);

  // 2. Charger les utilisateurs
  const usersQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return collection(db, 'users');
  }, [db, isAdmin]);

  const { data: allUsers, loading: usersLoading } = useCollection(usersQuery);

  // Filtrer les articles signalés (reportsCount > 0)
  const reportedProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter((p: any) => p.reportsCount && p.reportsCount > 0)
      .sort((a, b) => (b.reportsCount || 0) - (a.reportsCount || 0));
  }, [allProducts]);

  // Filtrer la liste globale des produits
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    if (!productSearch.trim()) return allProducts;
    const search = productSearch.toLowerCase();
    return allProducts.filter((p: any) => 
      (p.title || '').toLowerCase().includes(search) ||
      (p.description || '').toLowerCase().includes(search) ||
      (p.category || '').toLowerCase().includes(search)
    );
  }, [allProducts, productSearch]);

  // Filtrer les utilisateurs par champ de recherche
  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    if (!userSearch.trim()) return allUsers;
    const search = userSearch.toLowerCase();
    return allUsers.filter(u => 
      (u.name || '').toLowerCase().includes(search) || 
      (u.email || '').toLowerCase().includes(search) || 
      (u.phone || '').toLowerCase().includes(search)
    );
  }, [allUsers, userSearch]);

  // Filtrer les demandes d'agrément PRO en attente
  const pendingProUsers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter((u: any) => u.proStatus === 'pending');
  }, [allUsers]);

  // Filtrer les demandes de badge Super-Vendeur en attente
  const pendingSuperBadgeUsers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter((u: any) => u.superSellerRequest && u.superSellerRequest.status === 'pending');
  }, [allUsers]);

  // Action Admin : Supprimer définitivement un produit
  const handleAdminDeleteProduct = async (productId: string) => {
    if (!db) return;
    if (!confirm("Voulez-vous vraiment supprimer définitivement cet article ? Cette action est irréversible.")) return;
    
    try {
      await deleteDoc(doc(db, 'products', productId));
      toast({
        title: "Article supprimé",
        description: "L'annonce a été retirée de la plateforme.",
        variant: "destructive"
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Action impossible",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive"
      });
    }
  };

  // Action Admin : Réhabiliter un produit (remettre reportsCount à 0)
  const handleDismissReports = async (productId: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'products', productId), {
        reportsCount: 0
      });
      toast({
        title: "Signalements effacés",
        description: "L'annonce a été réhabilitée avec succès.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description: "Impossible d'effacer les signalements.",
        variant: "destructive"
      });
    }
  };

  // Action Admin : Bannir / Débannir un membre
  const handleToggleBan = (userId: string, currentBanStatus: boolean) => {
    if (!db) return;
    setUpdatingUserId(userId);
    const userDocRef = doc(db, 'users', userId);
    updateDoc(userDocRef, { isBanned: !currentBanStatus })
      .then(() => {
        toast({
          title: !currentBanStatus ? "Utilisateur banni" : "Accès restauré",
          description: !currentBanStatus ? "L'accès à la plateforme est suspendu." : "L'utilisateur peut à nouveau vendre et acheter.",
          variant: !currentBanStatus ? "destructive" : "default"
        });
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Erreur de mise à jour",
          description: "Permissions insuffisantes dans Firestore.",
          variant: "destructive"
        });
      })
      .finally(() => setUpdatingUserId(null));
  };

  // Action Admin : Élever au rang PRO / Rétrograder
  const handleTogglePro = async (userId: string, currentType: string, durationMonths?: number) => {
    if (!db) return;
    setUpdatingUserId(userId);
    const nextType = currentType === 'professionnel' ? 'particulier' : 'professionnel';
    const userDocRef = doc(db, 'users', userId);

    try {
      let expiresAt: any = null;
      if (nextType === 'professionnel') {
        const months = durationMonths || 1;
        expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + months);
      }

      // 1. Mettre à jour le type de compte utilisateur et effacer l'état pending
      const userUpdate: any = { 
        type: nextType,
        proStatus: nextType === 'professionnel' ? 'approved' : null,
        isProPending: false,
        proExpiresAt: expiresAt ? expiresAt.toISOString() : null
      };
      await updateDoc(userDocRef, userUpdate);

      // 2. Synchroniser isPro sur toutes ses annonces existantes
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('sellerId', '==', userId));
      const querySnap = await getDocs(q);
      
      if (!querySnap.empty) {
        const batch = writeBatch(db);
        querySnap.forEach((productDoc) => {
          batch.update(productDoc.ref, { isPro: nextType === 'professionnel' });
        });
        await batch.commit();
      }

      // 3. Envoyer une notification à l'utilisateur
      if (nextType === 'professionnel') {
        await sendNotification(db, userId, {
          title: "Compte PRO Activé 👑",
          message: `Félicitations ! Votre compte professionnel a été validé et activé pour une durée de ${durationMonths || 1} mois. Votre boutique est désormais en ligne.`,
          type: "profile",
          link: "/profile"
        });
      } else {
        await sendNotification(db, userId, {
          title: "Retour au statut particulier 👤",
          message: "Votre profil a été repassé au statut particulier par l'administrateur.",
          type: "profile"
        });
      }

      toast({
        title: nextType === 'professionnel' ? "Élévation au rang PRO" : "Retour au rang Particulier",
        description: nextType === 'professionnel' 
          ? "Le membre est désormais identifié PRO et ses annonces sont valorisées." 
          : "Le membre est repassé en compte régulier.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur de mise à jour",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive"
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Action Admin : Définir comme Super-Vendeur / Rétrograder avec durée
  const handleToggleSuperSeller = async (userId: string, currentSuperSellerStatus: boolean, durationDays?: number) => {
    if (!db) return;
    setUpdatingUserId(userId);
    const nextStatus = !currentSuperSellerStatus;
    const userDocRef = doc(db, 'users', userId);

    try {
      const days = durationDays || 7;
      let expiresAt: any = null;
      if (nextStatus) {
        expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      }

      // 1. Mettre à jour isSuperSeller et superSellerExpiresAt sur l'utilisateur
      const userUpdate: any = { 
        isSuperSeller: nextStatus,
        superSellerExpiresAt: expiresAt ? expiresAt.toISOString() : null
      };

      if (nextStatus) {
        userUpdate.superSellerRequest = {
          status: 'approved',
          approvedAt: new Date().toISOString(),
          durationDays: days
        };
      } else {
        userUpdate.superSellerRequest = null;
      }

      await updateDoc(userDocRef, userUpdate);

      // 2. Synchroniser sellerIsSuper et sellerSuperExpiresAt sur toutes ses annonces existantes
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('sellerId', '==', userId));
      const querySnap = await getDocs(q);
      
      if (!querySnap.empty) {
        const batch = writeBatch(db);
        querySnap.forEach((productDoc) => {
          batch.update(productDoc.ref, { 
            sellerIsSuper: nextStatus,
            sellerSuperExpiresAt: expiresAt ? expiresAt.toISOString() : null
          });
        });
        await batch.commit();
      }

      // 3. Envoyer une notification à l'utilisateur
      if (nextStatus) {
        await sendNotification(db, userId, {
          title: "Badge Super-Vendeur Activé ✨",
          message: `Félicitations ! Votre badge Super-Vendeur a été activé pour une durée de ${days} jours. Vos annonces sont désormais mises en avant sur la plateforme.`,
          type: "profile",
          link: "/badges"
        });
      } else {
        await sendNotification(db, userId, {
          title: "Badge Super-Vendeur Désactivé 👤",
          message: "Votre badge Super-Vendeur a été désactivé par l'administrateur.",
          type: "profile"
        });
      }

      toast({
        title: nextStatus ? "Élevé au rang Super-Vendeur ✨" : "Retour au statut classique",
        description: nextStatus 
          ? `Le membre est désormais Super-Vendeur pour ${days} jours.` 
          : "Le statut de Super-Vendeur a été retiré.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur de mise à jour",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive"
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Charger les notifications globales
  const globalNotifsQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null;
    return query(collection(db, 'global_notifications'), orderBy('createdAt', 'desc'));
  }, [db, isAdmin]);

  const { data: globalNotifs, loading: globalNotifsLoading } = useCollection(globalNotifsQuery);

  const handleSendGlobalNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    if (!globalTitle.trim() || !globalMessage.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre et le message sont requis.",
        variant: "destructive"
      });
      return;
    }

    setIsSendingGlobal(true);
    try {
      const res = await sendGlobalNotification(db, {
        title: globalTitle,
        message: globalMessage,
        type: globalType,
        link: globalLink || undefined
      });

      if (res) {
        toast({
          title: "Notification globale envoyée",
          description: "La notification a été diffusée sur toute la plateforme.",
        });
        setGlobalTitle('');
        setGlobalMessage('');
        setGlobalLink('');
      } else {
        throw new Error("Failed to send");
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la notification globale.",
        variant: "destructive"
      });
    } finally {
      setIsSendingGlobal(false);
    }
  };

  const handleSendDirectNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !notifyingUser) return;
    if (!directTitle.trim() || !directMessage.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre et le message sont requis.",
        variant: "destructive"
      });
      return;
    }

    setIsSendingDirect(true);
    try {
      const res = await sendNotification(db, notifyingUser.uid, {
        title: directTitle,
        message: directMessage,
        type: directType,
        link: directLink || undefined
      });

      if (res) {
        toast({
          title: "Notification envoyée",
          description: `La notification directe a été envoyée à ${notifyingUser.name || notifyingUser.email}.`,
        });
        setDirectTitle('');
        setDirectMessage('');
        setDirectLink('');
        setNotifyingUser(null);
      } else {
        throw new Error("Failed to send");
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la notification directe.",
        variant: "destructive"
      });
    } finally {
      setIsSendingDirect(false);
    }
  };

  const handleDeleteGlobalNotification = async (notifId: string) => {
    if (!db) return;
    if (!confirm("Voulez-vous vraiment supprimer cette notification globale ? Elle ne sera plus synchronisée pour les nouveaux utilisateurs.")) return;

    try {
      await deleteDoc(doc(db, 'global_notifications', notifId));
      toast({
        title: "Notification supprimée",
        description: "La notification globale a été retirée.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la notification globale.",
        variant: "destructive"
      });
    }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center"><LoadingLogo /></div>;

  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/10">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-10 text-center space-y-6 border-destructive/20 rounded-[2.5rem] shadow-xl bg-white">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black uppercase tracking-tight text-destructive">Accès Refusé</h1>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Cet espace est strictement réservé à l'administrateur certifié de la marketplace SalleDeVente.sn.
              </p>
            </div>
            <Button asChild className="w-full rounded-2xl font-black uppercase h-12" variant="outline"><Link href="/">Retour à l'accueil</Link></Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Compteurs statistiques
  const totalUsers = allUsers?.length || 0;
  const proUsers = allUsers?.filter(u => u.type === 'professionnel').length || 0;
  const bannedUsers = allUsers?.filter(u => u.isBanned).length || 0;
  const totalMarketListings = allProducts?.length || 0;

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <Header />
      <main className="flex-1">
        {/* BANNIÈRE TITRE */}
        <div className="w-full bg-muted border-y border-border/50 py-3">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-[14px] font-bebas tracking-[0.1em] uppercase text-primary">Tableau de Bord Administratif</h1>
              <Badge variant="secondary" className="font-bold text-[10px] rounded-full">
                Espace Super-Admin
              </Badge>
            </div>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest hidden sm:block">SalleDeVente.sn Modération</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
          {/* GRILLE STATISTIQUES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="rounded-2xl border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-xl"><FlagIcon className="h-6 w-6" /></div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Signalements</p>
                  <p className="text-2xl font-black text-foreground">{reportedProducts.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl"><ListCollapse className="h-6 w-6" /></div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Total Produits</p>
                  <p className="text-2xl font-black text-foreground">{totalMarketListings}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl"><Star className="h-6 w-6 fill-amber-500/10" /></div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Membres PRO</p>
                  <p className="text-2xl font-black text-foreground">{proUsers}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl"><ShieldX className="h-6 w-6" /></div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Suspendus</p>
                  <p className="text-2xl font-black text-foreground">{bannedUsers}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ONGLET NAVIGATION */}
          <div className="flex border-b border-border/60 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('monitoring')}
              className={cn(
                "px-6 py-4 font-black uppercase text-sm tracking-tight border-b-2 flex items-center gap-2 transition-all whitespace-nowrap",
                activeTab === 'monitoring' 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Activity className="h-4 w-4" /> Monitoring
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={cn(
                "px-6 py-4 font-black uppercase text-sm tracking-tight border-b-2 flex items-center gap-2 transition-all whitespace-nowrap",
                activeTab === 'reports' 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <FlagIcon className="h-4 w-4" /> Signalés ({reportedProducts.length})
            </button>
            <button 
              onClick={() => setActiveTab('all-products')}
              className={cn(
                "px-6 py-4 font-black uppercase text-sm tracking-tight border-b-2 flex items-center gap-2 transition-all whitespace-nowrap",
                activeTab === 'all-products' 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <ListCollapse className="h-4 w-4" /> Tous les Produits ({totalMarketListings})
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={cn(
                "px-6 py-4 font-black uppercase text-sm tracking-tight border-b-2 flex items-center gap-2 transition-all whitespace-nowrap",
                activeTab === 'users' 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="h-4 w-4" /> Gestion des Membres ({totalUsers})
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={cn(
                "px-6 py-4 font-black uppercase text-sm tracking-tight border-b-2 flex items-center gap-2 transition-all whitespace-nowrap",
                activeTab === 'notifications' 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Bell className="h-4 w-4" /> Notifications Globales
            </button>
          </div>

          {/* CONTENU ONGLETS */}
          
          {/* 0. MONITORING PLATFORME */}
          {activeTab === 'monitoring' && (
            <MonitoringDashboard allUsers={allUsers || []} allProducts={allProducts || []} />
          )}

          {/* 1. ARTICLES SIGNALÉS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {productsLoading ? (
                <div className="flex justify-center py-24">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : reportedProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {reportedProducts.map((p: any) => (
                    <Card key={p.id} className="overflow-hidden border-red-200 hover:border-red-400 bg-red-50/5 hover:bg-white transition-all rounded-[2rem] shadow-sm group">
                      <CardContent className="p-0 flex flex-col md:flex-row">
                        <div className="relative w-full md:w-56 aspect-square md:aspect-auto overflow-hidden">
                          <Image 
                            src={p.images?.[0] || 'https://picsum.photos/seed/placeholder/400/400'} 
                            alt={p.title} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        </div>
                        <div className="flex-1 p-6 md:p-8 space-y-4">
                          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <Badge variant="destructive" className="animate-pulse uppercase text-[10px] font-black tracking-widest px-3 gap-1">
                                  ⚠️ {p.reportsCount} signalement(s)
                                </Badge>
                                <Badge variant="outline" className="uppercase text-[9px] font-black px-2">
                                  {CATEGORIES.find(c => c.id === p.category)?.name || p.category}
                                </Badge>
                              </div>
                              <h3 className="text-xl font-black uppercase tracking-tight pt-1 leading-none">{p.title}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-2 max-w-xl">{p.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-black text-primary tracking-tighter">{p.basePrice?.toLocaleString('fr-FR')} FCFA</p>
                              <span className="text-[10px] font-medium text-muted-foreground">Statut: {p.status}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                            <Button 
                              variant="destructive" 
                              className="font-black uppercase gap-1.5 rounded-xl h-10 px-4" 
                              onClick={() => handleAdminDeleteProduct(p.id)}
                            >
                              <Trash2 className="h-4 w-4" /> Supprimer définitivement
                            </Button>
                            <Button 
                              variant="outline" 
                              className="font-black uppercase gap-1.5 rounded-xl h-10 px-4 border-green-200 text-green-600 hover:bg-green-50" 
                              onClick={() => handleDismissReports(p.id)}
                            >
                              <Undo className="h-4 w-4" /> Réhabiliter (Effacer)
                            </Button>
                            <Button variant="outline" className="font-black uppercase gap-1.5 rounded-xl h-10 px-4 ml-auto" asChild>
                              <Link href={`/products/${p.id}`} target="_blank"><Eye className="h-4 w-4" /> Voir</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-border shadow-inner flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-xl font-black uppercase text-muted-foreground">Aucun article signalé</p>
                  <p className="text-sm text-muted-foreground font-medium">La marketplace est parfaitement saine.</p>
                </div>
              )}
            </div>
          )}

          {/* 2. TOUS LES PRODUITS (RECHERCHE ET SUPPRESSION GLOBAL) */}
          {activeTab === 'all-products' && (
            <div className="space-y-6">
              {/* FILTRE RECHERCHE */}
              <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Rechercher un article par titre, description..." 
                  className="h-12 pl-12 rounded-2xl border-border bg-white shadow-sm font-medium"
                />
              </div>

              {productsLoading ? (
                <div className="flex justify-center py-24">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredProducts.map((p: any) => (
                    <Card key={p.id} className="rounded-2xl border bg-white overflow-hidden shadow-sm hover:border-primary/20 transition-all">
                      <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <Image 
                            src={p.images?.[0] || 'https://picsum.photos/seed/placeholder/400/400'} 
                            alt={p.title} 
                            fill 
                            className="object-cover" 
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <span className="font-black text-base uppercase truncate max-w-xs">{p.title}</span>
                            <Badge variant="outline" className="text-[9px] uppercase font-bold px-2">
                              {CATEGORIES.find(c => c.id === p.category)?.name || p.category}
                            </Badge>
                            {p.reportsCount && p.reportsCount > 0 ? (
                              <Badge variant="destructive" className="text-[8px] font-bold">
                                ⚠️ {p.reportsCount} Signalement(s)
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-md mx-auto sm:mx-0">{p.description}</p>
                          <p className="text-sm font-bold text-primary">{p.basePrice?.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 w-full sm:w-auto justify-center sm:justify-end">
                          <Button size="sm" variant="outline" className="rounded-xl font-bold h-10 gap-1.5" asChild>
                            <Link href={`/products/${p.id}`} target="_blank"><Eye className="h-4 w-4" /> Voir</Link>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="rounded-xl font-bold h-10 gap-1.5" 
                            onClick={() => handleAdminDeleteProduct(p.id)}
                          >
                            <Trash2 className="h-4 w-4" /> Supprimer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-border flex flex-col items-center gap-3">
                  <Package className="h-10 w-10 text-muted-foreground opacity-30" />
                  <p className="text-lg font-bold text-muted-foreground">Aucun article ne correspond à votre recherche.</p>
                </div>
              )}
            </div>
          )}

          {/* 3. GESTION DES MEMBRES */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* FILTRE RECHERCHE */}
              <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Rechercher un membre (Nom, email, tel)..." 
                  className="h-12 pl-12 rounded-2xl border-border bg-white shadow-sm font-medium"
                />
              </div>

              {/* DEMANDES D'AGRÉMENT PRO EN ATTENTE */}
              {pendingProUsers.length > 0 && (
                <div className="space-y-4 bg-amber-50/20 border border-amber-200/50 p-6 rounded-[2rem]">
                  <h3 className="font-bebas text-lg tracking-[0.05em] text-amber-700 uppercase flex items-center gap-2">
                    ⏳ Demandes d&apos;Agrément Professionnel ({pendingProUsers.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {pendingProUsers.map((u: any) => {
                      const isUpdating = updatingUserId === u.uid;
                      return (
                        <Card key={u.uid} className="rounded-[2rem] border-2 border-amber-300/80 overflow-hidden shadow-md bg-white">
                          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-black uppercase tracking-tight text-slate-800 text-base">{u.name || 'Nom non défini'}</h4>
                                <Badge className="font-bold text-[8px] bg-amber-500 hover:bg-amber-600 text-white uppercase tracking-widest px-2.5 py-1 rounded-full border-none">
                                  En attente de validation
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-semibold text-muted-foreground pt-1">
                                <p className="truncate"><span className="font-bold">Email:</span> {u.email}</p>
                                <p><span className="font-bold">Tél:</span> {u.phone || 'Non renseigné'}</p>
                                <p className="truncate"><span className="font-bold">Adresse:</span> {u.address || 'Non renseigné'}</p>
                                <p className="text-amber-700 font-bold"><span className="font-bold text-muted-foreground">Demande:</span> {u.requestedProMonths || 1} mois</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap md:border-l md:pl-6 flex-shrink-0">
                              <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-xl border">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Durée :</span>
                                <Select 
                                  value={String(adminSelectedMonths[u.uid] || u.requestedProMonths || 1)} 
                                  onValueChange={(val) => setAdminSelectedMonths(prev => ({ ...prev, [u.uid]: Number(val) }))}
                                  disabled={isUpdating}
                                >
                                  <SelectTrigger className="w-24 h-8 rounded-lg font-bold bg-white border-border text-xs">
                                    <SelectValue placeholder="Mois" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 24].map((m) => (
                                      <SelectItem key={m} value={String(m)}>{m} mois</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => handleTogglePro(u.uid, u.type || '', adminSelectedMonths[u.uid] || u.requestedProMonths || 1)}
                                className="font-black uppercase rounded-xl h-11 bg-green-600 hover:bg-green-500 text-white px-5 gap-1.5"
                              >
                                <Check className="h-4 w-4" /> Activer
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isUpdating}
                                onClick={async () => {
                                  if (!db) return;
                                  setUpdatingUserId(u.uid);
                                  try {
                                    await updateDoc(doc(db, 'users', u.uid), {
                                      proStatus: 'rejected',
                                      isProPending: false
                                    });
                                    await sendNotification(db, u.uid, {
                                      title: "Demande PRO Refusée ❌",
                                      message: "Votre demande d'agrément professionnel a été rejetée par l'administrateur.",
                                      type: "profile"
                                    });
                                    toast({
                                      title: "Demande rejetée",
                                      description: "La demande d'agrément pro a été rejetée."
                                    });
                                  } catch (err) {
                                    console.error(err);
                                  } finally {
                                    setUpdatingUserId(null);
                                  }
                                }}
                                className="font-black uppercase rounded-xl h-11 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 px-5 gap-1.5"
                              >
                                <X className="h-4 w-4" /> Rejeter
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* DEMANDES DE BADGES SUPER-VENDEUR */}
              {pendingSuperBadgeUsers.length > 0 && (
                <div className="space-y-4 bg-amber-500/5 border border-amber-400/20 p-6 rounded-[2rem]">
                  <h3 className="font-bebas text-lg tracking-[0.05em] text-amber-600 uppercase flex items-center gap-2">
                    ✨ Demandes de Badges Super-Vendeur ({pendingSuperBadgeUsers.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {pendingSuperBadgeUsers.map((u: any) => {
                      const isUpdating = updatingUserId === u.uid;
                      const requestedDays = u.superSellerRequest?.durationDays || 7;
                      return (
                        <Card key={u.uid} className="rounded-[2rem] border-2 border-amber-400/80 overflow-hidden shadow-md bg-white">
                          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-black uppercase tracking-tight text-slate-800 text-base">{u.name || 'Nom non défini'}</h4>
                                <Badge className="font-bold text-[8px] bg-gradient-to-r from-amber-500 to-yellow-500 text-white uppercase tracking-widest px-2.5 py-1 rounded-full border-none">
                                  Demande Badge {requestedDays} jours
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-semibold text-muted-foreground pt-1">
                                <p className="truncate"><span className="font-bold">Email:</span> {u.email}</p>
                                <p><span className="font-bold">Tél:</span> {u.phone || 'Non renseigné'}</p>
                                <p className="truncate"><span className="font-bold">Offre:</span> {requestedDays} jours ({requestedDays === 3 ? "10.000 FCFA" : requestedDays === 7 ? "20.000 FCFA" : "50.000 FCFA"})</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 md:border-l md:pl-6 flex-shrink-0">
                              <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-xl border">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Durée :</span>
                                <Select 
                                  value={String(adminSelectedBadgeDays[u.uid] || requestedDays)} 
                                  onValueChange={(val) => setAdminSelectedBadgeDays(prev => ({ ...prev, [u.uid]: Number(val) }))}
                                  disabled={isUpdating}
                                >
                                  <SelectTrigger className="w-24 h-8 rounded-lg font-bold bg-white border-border text-xs">
                                    <SelectValue placeholder="Jours" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[3, 5, 7, 14, 30, 90].map((d) => (
                                      <SelectItem key={d} value={String(d)}>{d} jours</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => handleToggleSuperSeller(u.uid, false, adminSelectedBadgeDays[u.uid] || requestedDays)}
                                className="font-black uppercase rounded-xl h-11 bg-green-600 hover:bg-green-500 text-white px-5 gap-1.5"
                              >
                                <Check className="h-4 w-4" /> Activer
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isUpdating}
                                onClick={async () => {
                                  if (!db) return;
                                  setUpdatingUserId(u.uid);
                                  try {
                                    await updateDoc(doc(db, 'users', u.uid), {
                                      superSellerRequest: {
                                        ...u.superSellerRequest,
                                        status: 'rejected',
                                        rejectedAt: new Date().toISOString()
                                      }
                                    });
                                    await sendNotification(db, u.uid, {
                                      title: "Demande de Badge Refusée ❌",
                                      message: "Votre demande de badge Super-Vendeur a été rejetée par l'administrateur.",
                                      type: "profile"
                                    });
                                    toast({
                                      title: "Demande rejetée",
                                      description: "La demande de badge super-vendeur a été rejetée."
                                    });
                                  } catch (err) {
                                    console.error(err);
                                  } finally {
                                    setUpdatingUserId(null);
                                  }
                                }}
                                className="font-black uppercase rounded-xl h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 px-4 gap-1.5"
                              >
                                <X className="h-4 w-4" /> Rejeter
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {usersLoading ? (
                <div className="flex justify-center py-24">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredUsers.map((u: any) => {
                    const isUserPro = u.type === 'professionnel';
                    const isUserBanned = u.isBanned === true;
                    const isUpdating = updatingUserId === u.uid;

                    return (
                      <Card key={u.uid} className={cn(
                        "rounded-[2rem] border overflow-hidden shadow-sm bg-white transition-all",
                        isUserBanned ? "border-red-200 bg-red-50/5" : "border-border/60",
                        isUserPro ? "border-amber-300" : ""
                      )}>
                        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-black uppercase tracking-tight text-lg text-foreground">{u.name || 'Nom non défini'}</h3>
                              <Badge className={cn(
                                "font-bold text-[8px] tracking-widest px-2 py-0.5 rounded-full uppercase border-none",
                                isUserPro ? "bg-amber-500 text-white" : "bg-primary/10 text-primary"
                              )}>
                                {isUserPro ? `👑 Professionnel ${u.proExpiresAt ? `(Exp: ${new Date(u.proExpiresAt).toLocaleDateString('fr-FR')})` : ''}` : "Particulier"}
                              </Badge>
                              {isUserPro && u.isSuperSeller && (
                                <Badge className="font-bold text-[8px] tracking-widest px-2 py-0.5 rounded-full uppercase border-none bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm animate-pulse">
                                  ✨ Super-Vendeur {u.superSellerExpiresAt ? `(Exp: ${new Date(u.superSellerExpiresAt).toLocaleDateString('fr-FR')})` : ''}
                                </Badge>
                              )}
                              {isUserBanned && (
                                <Badge variant="destructive" className="font-bold text-[8px] tracking-widest px-2 py-0.5 rounded-full uppercase">
                                  🚫 SUSPENDU
                                </Badge>
                              )}
                            </div>
 
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs font-semibold text-muted-foreground">
                              <p className="truncate"><span className="font-bold">Email:</span> {u.email}</p>
                              <p><span className="font-bold">Tél:</span> {u.phone || 'Non renseigné'}</p>
                              <p className="truncate"><span className="font-bold">Adresse:</span> {u.address || 'Non renseigné'}</p>
                            </div>
                          </div>
 
                          <div className="flex flex-wrap items-center gap-3 md:border-l md:pl-6">
                            {/* Élever/Rétrograder Pro */}
                            {!isUserPro ? (
                              <div className="flex items-center gap-2 bg-muted/40 px-3 h-10 rounded-xl border border-border/60">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Durée :</span>
                                <Select 
                                  value={String(adminSelectedMonths[u.uid] || 1)} 
                                  onValueChange={(val) => setAdminSelectedMonths(prev => ({ ...prev, [u.uid]: Number(val) }))}
                                  disabled={isUpdating}
                                >
                                  <SelectTrigger className="w-20 h-7 rounded-lg font-bold bg-white border-border text-xs">
                                    <SelectValue placeholder="Mois" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 24].map((m) => (
                                      <SelectItem key={m} value={String(m)}>{m} mois</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  disabled={isUpdating || u.email === 'ndaw22@gmail.com'}
                                  onClick={() => handleTogglePro(u.uid, u.type || '', adminSelectedMonths[u.uid] || 1)}
                                  className="font-black uppercase rounded-lg h-7 gap-1 border-none bg-primary text-white hover:bg-primary/95 text-[10px] px-2.5"
                                >
                                  <Star className="h-3 w-3 fill-white text-white" />
                                  Élever en PRO
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled={isUpdating || u.email === 'ndaw22@gmail.com'}
                                onClick={() => handleTogglePro(u.uid, u.type || '')}
                                className={cn(
                                  "font-black uppercase rounded-xl h-10 gap-1.5",
                                  "text-amber-600 hover:text-amber-700 bg-amber-50 border-amber-200"
                                )}
                              >
                                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                                Rétrograder
                              </Button>
                            )}

                            {/* Option Super-Vendeur (seulement pour les PROs) */}
                            {isUserPro && (
                              !u.isSuperSeller ? (
                                <div className="flex items-center gap-2 bg-muted/40 px-3 h-10 rounded-xl border border-border/60">
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Badge :</span>
                                  <Select 
                                    value={String(adminSelectedBadgeDays[u.uid] || 7)} 
                                    onValueChange={(val) => setAdminSelectedBadgeDays(prev => ({ ...prev, [u.uid]: Number(val) }))}
                                    disabled={isUpdating}
                                  >
                                    <SelectTrigger className="w-20 h-7 rounded-lg font-bold bg-white border-border text-xs">
                                      <SelectValue placeholder="Jours" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[3, 5, 7, 14, 30, 90].map((d) => (
                                        <SelectItem key={d} value={String(d)}>{d} jours</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    disabled={isUpdating || u.email === 'ndaw22@gmail.com'}
                                    onClick={() => handleToggleSuperSeller(u.uid, false, adminSelectedBadgeDays[u.uid] || 7)}
                                    className="font-black uppercase rounded-lg h-7 gap-1 border-none bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 text-[10px] px-2.5"
                                  >
                                    <Sparkles className="h-3 w-3 fill-white text-white" />
                                    Super-Vendeur
                                  </Button>
                                </div>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  disabled={isUpdating || u.email === 'ndaw22@gmail.com'}
                                  onClick={() => handleToggleSuperSeller(u.uid, true)}
                                  className={cn(
                                    "font-black uppercase rounded-xl h-10 gap-1.5 transition-all duration-300",
                                    "text-amber-500 hover:text-amber-600 bg-amber-50 border-amber-300 shadow-sm"
                                  )}
                                >
                                  <Sparkles className="h-4 w-4 fill-amber-500 text-amber-500 animate-pulse" />
                                  Rétrograder Super
                                </Button>
                              )
                            )}
 
                            {/* Bannir/Débannir */}
                            <Button 
                              size="sm"
                              disabled={isUpdating || u.email === 'ndaw22@gmail.com'}
                              variant={isUserBanned ? "default" : "destructive"}
                              onClick={() => handleToggleBan(u.uid, isUserBanned)}
                              className="font-black uppercase rounded-xl h-10 gap-1.5"
                            >
                              {isUserBanned ? <UserCheck className="h-4 w-4" /> : <UserMinus className="h-4 w-4" />}
                              {isUserBanned ? "Débannir" : "Bannir"}
                            </Button>

                            {/* Notifier l'utilisateur */}
                            <Button 
                              size="sm"
                              variant="outline"
                              disabled={isUpdating || u.email === 'ndaw22@gmail.com'}
                              onClick={() => setNotifyingUser(u)}
                              className="font-black uppercase rounded-xl h-10 gap-1.5 border-primary/20 text-primary hover:bg-primary/5"
                            >
                              <Bell className="h-4 w-4" />
                              Notifier
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-border flex flex-col items-center gap-3">
                  <UserMinus className="h-10 w-10 text-muted-foreground opacity-30" />
                  <p className="text-lg font-bold text-muted-foreground">Aucun membre ne correspond à votre recherche.</p>
                </div>
              )}
            </div>
          )}

          {/* 4. NOTIFICATIONS GLOBALES */}
          {activeTab === 'notifications' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Formulaire de création */}
              <div className="md:col-span-1 space-y-6">
                <Card className="rounded-[2rem] border bg-white p-6 shadow-sm">
                  <div className="space-y-1.5 mb-6">
                    <h3 className="font-bebas text-xl tracking-[0.05em] uppercase text-primary">Publier une annonce</h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      Cette notification sera diffusée à tous les utilisateurs de la plateforme.
                    </p>
                  </div>

                  <form onSubmit={handleSendGlobalNotification} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-bebas">Type d&apos;annonce</label>
                      <select 
                        value={globalType}
                        onChange={(e: any) => setGlobalType(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-border bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="global">📢 Mise à jour globale</option>
                        <option value="commercial">💎 Offre commerciale / Badges</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-bebas">Titre de l&apos;annonce</label>
                      <Input 
                        value={globalTitle}
                        onChange={(e) => setGlobalTitle(e.target.value)}
                        placeholder="Ex: Maintenance de la plateforme"
                        required
                        className="h-11 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-bebas">Message</label>
                      <textarea 
                        value={globalMessage}
                        onChange={(e) => setGlobalMessage(e.target.value)}
                        placeholder="Écrivez le message de l'annonce ici..."
                        required
                        rows={4}
                        className="w-full p-3 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-bebas">Lien de redirection (optionnel)</label>
                      <Input 
                        value={globalLink}
                        onChange={(e) => setGlobalLink(e.target.value)}
                        placeholder="Ex: /badges ou /shops"
                        className="h-11 rounded-xl"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSendingGlobal}
                      className="w-full rounded-xl h-11 uppercase font-black gap-2 pt-1"
                    >
                      {isSendingGlobal ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" /> Publier l&apos;annonce
                        </>
                      )}
                    </Button>
                  </form>
                </Card>
              </div>

              {/* Historique des annonces */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-border/50">
                  <h3 className="font-bebas text-xl tracking-[0.05em] uppercase text-slate-800">
                    Historique des notifications globales ({globalNotifs?.length || 0})
                  </h3>
                </div>

                {globalNotifsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : globalNotifs && globalNotifs.length > 0 ? (
                  <div className="space-y-4">
                    {globalNotifs.map((n: any) => (
                      <Card key={n.id} className="rounded-2xl border bg-white p-5 shadow-sm hover:border-primary/20 transition-all flex items-start gap-4">
                        <div className={cn(
                          "p-3 rounded-xl flex-shrink-0",
                          n.type === 'commercial' ? "bg-amber-100 text-amber-600" : "bg-primary/10 text-primary"
                        )}>
                          {n.type === 'commercial' ? <Sparkles className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-black text-sm uppercase">{n.title}</h4>
                            <Badge className={cn(
                              "text-[8px] font-bold tracking-widest px-2 py-0.5 rounded-full border-none",
                              n.type === 'commercial' ? "bg-amber-500 text-white" : "bg-primary text-white"
                            )}>
                              {n.type === 'commercial' ? "💎 Commercial" : "📢 Plateforme"}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              {n.createdAt ? new Date(n.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium leading-relaxed">{n.message}</p>
                          {n.link && (
                            <Link href={n.link} className="text-[10px] font-bold text-primary hover:underline block pt-1">
                              Lien : {n.link}
                            </Link>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteGlobalNotification(n.id)}
                          className="text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-border flex flex-col items-center gap-3">
                    <Bell className="h-8 w-8 text-muted-foreground opacity-30" />
                    <p className="text-sm font-bold text-muted-foreground">Aucune notification globale envoyée pour le moment.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL DE NOTIFICATION DIRECTE */}
      {notifyingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 space-y-4 rounded-[2rem] border border-white/20 bg-white/95 shadow-2xl relative">
            <button 
              onClick={() => setNotifyingUser(null)} 
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="space-y-1">
              <h2 className="text-xl font-black uppercase tracking-tight text-primary flex items-center gap-2">
                <Bell className="h-5 w-5" /> Notifier {notifyingUser.name || 'le membre'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Envoyer une notification directe à {notifyingUser.email}
              </p>
            </div>

            <form onSubmit={handleSendDirectNotification} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-bebas">Type de notification</label>
                <select 
                  value={directType}
                  onChange={(e: any) => setDirectType(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-border bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="profile">👤 Profil & Sécurité</option>
                  <option value="global">📢 Info Plateforme</option>
                  <option value="commercial">💎 Offre / Commercial</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-bebas">Titre de la notification</label>
                <Input 
                  value={directTitle}
                  onChange={(e) => setDirectTitle(e.target.value)}
                  placeholder="Ex: Validation de votre compte"
                  required
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-bebas">Message</label>
                <textarea 
                  value={directMessage}
                  onChange={(e) => setDirectMessage(e.target.value)}
                  placeholder="Écrivez le message de la notification ici..."
                  required
                  rows={4}
                  className="w-full p-3 rounded-xl border border-border bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-bebas">Lien de redirection (optionnel)</label>
                <Input 
                  value={directLink}
                  onChange={(e) => setDirectLink(e.target.value)}
                  placeholder="Ex: /profile ou /badges"
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setNotifyingUser(null)}
                  className="flex-1 rounded-xl h-11 uppercase font-black"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSendingDirect}
                  className="flex-1 rounded-xl h-11 uppercase font-black gap-2"
                >
                  {isSendingDirect ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Envoyer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
