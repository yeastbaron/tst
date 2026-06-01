"use client";

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, Package, PlusCircle, ExternalLink, Clock, 
  CheckCircle2, XCircle, Tag, Edit, Trash2, Check, X, AlertTriangle 
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { CATEGORIES } from '@/lib/constants';

export default function MyListingsPage() {
  const { user, profile, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  // États pour l'édition d'une annonce
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSubcategory, setEditSubcategory] = useState('');
  const [editCondition, setEditCondition] = useState('used');
  const [editAllowWholesale, setEditAllowWholesale] = useState(false);
  const [editWholesaleOnly, setEditWholesaleOnly] = useState(false);
  const [editMinWholesaleQuantity, setEditMinWholesaleQuantity] = useState('');
  const [editWholesalePrice, setEditWholesalePrice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const listingsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'products'),
      where('sellerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: listings, loading: dataLoading } = useCollection(listingsQuery);

  // Marquer un produit comme vendu
  const handleMarkAsSold = async (productId: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'products', productId), {
        status: 'sold'
      });
      toast({
        title: "Félicitations !",
        description: "Votre article a été marqué comme vendu.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Action impossible",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive"
      });
    }
  };

  // Supprimer un produit
  const handleDeleteListing = async (productId: string) => {
    if (!db) return;
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement cette annonce ?")) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
      toast({
        title: "Annonce supprimée",
        description: "Votre annonce a été retirée de la plateforme.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Action impossible",
        description: "Impossible de supprimer l'annonce.",
        variant: "destructive"
      });
    }
  };

  // Ouvrir le modal d'édition
  const openEditModal = (item: any) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditPrice(item.basePrice.toString());
    setEditDescription(item.description);
    setEditCategory(item.category);
    setEditSubcategory(item.subcategory || '');
    setEditCondition(item.condition || 'used');
    setEditAllowWholesale(item.allowWholesale || false);
    setEditWholesaleOnly(item.wholesaleOnly || false);
    setEditMinWholesaleQuantity(item.minWholesaleQuantity?.toString() || '');
    setEditWholesalePrice(item.wholesalePrice?.toString() || '');
  };

  // Enregistrer les modifications
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !editingItem) return;

    const isWholesaleActive = editAllowWholesale && profile?.type === 'professionnel';
    let minQty: number | null = null;
    let wPrice: number | null = null;

    if (isWholesaleActive) {
      const parsedQty = parseInt(editMinWholesaleQuantity, 10);
      const parsedPrice = parseFloat(editWholesalePrice);

      if (isNaN(parsedQty) || parsedQty < 2) {
        toast({
          title: "Quantité minimale invalide",
          description: "La quantité minimale pour la vente en gros doit être supérieure ou égale à 2.",
          variant: "destructive"
        });
        return;
      }

      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        toast({
          title: "Prix de gros invalide",
          description: "Veuillez entrer un prix de gros valide.",
          variant: "destructive"
        });
        return;
      }

      const retailPrice = parseFloat(editPrice);
      if (parsedPrice > retailPrice) {
        toast({
          title: "Prix de gros trop élevé",
          description: "Le prix de gros unitaire ne peut pas être supérieur au prix classique de détail.",
          variant: "destructive"
        });
        return;
      }
      minQty = parsedQty;
      wPrice = parsedPrice;
    }
    
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'products', editingItem.id), {
        title: editTitle.trim(),
        basePrice: parseFloat(editPrice),
        description: editDescription.trim(),
        category: editCategory,
        subcategory: editSubcategory,
        condition: editCondition,
        allowWholesale: isWholesaleActive,
        wholesaleOnly: isWholesaleActive ? editWholesaleOnly : false,
        minWholesaleQuantity: minQty,
        wholesalePrice: wPrice
      });
      
      toast({
        title: "Annonce modifiée !",
        description: "Vos modifications ont été enregistrées avec succès.",
      });
      setEditingItem(null);
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les modifications.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || dataLoading) {
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
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center space-y-4 rounded-3xl border-border/50">
            <Package className="h-16 w-16 text-muted-foreground mx-auto" />
            <h1 className="text-xl font-normal uppercase">Accès restreint</h1>
            <p className="text-muted-foreground font-medium">Connectez-vous pour voir vos annonces.</p>
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600 gap-1"><CheckCircle2 className="h-3 w-3" /> En ligne</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> En attente</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Refusée</Badge>;
      case 'sold':
        return <Badge className="bg-blue-500 hover:bg-blue-600 gap-1"><Tag className="h-3 w-3" /> Vendue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <Header />
      <main className="flex-1">
        <div className="w-full bg-muted border-y border-border/50 py-3">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <h1 className="text-[14px] font-bebas tracking-[0.1em] uppercase text-primary">Mes Annonces</h1>
            <Button asChild size="sm" className="rounded-xl font-bebas text-[14px] tracking-widest gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4">
              <Link href="/sell"><PlusCircle className="h-4 w-4" /> Vendre un article</Link>
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-5xl">
          {listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {listings.map((item: any) => (
                <Card key={item.id} className="overflow-hidden border-border/50 hover:border-primary/20 transition-all rounded-2xl shadow-sm bg-white">
                  <CardContent className="p-4 flex flex-row gap-4 items-start">
                    {/* Image miniature avec coins arrondis */}
                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border border-border/40">
                      <Image 
                        src={item.images?.[0] || 'https://picsum.photos/seed/placeholder/400/400'} 
                        alt={item.title} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    
                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            {item.isAuction ? (
                              (item.auctionEndAt && (
                                typeof item.auctionEndAt.toDate === 'function'
                                  ? item.auctionEndAt.toDate()
                                  : new Date(item.auctionEndAt)
                              ) < new Date()) ? (
                                <Badge className="bg-slate-500 hover:bg-slate-600 gap-1"><CheckCircle2 className="h-3 w-3" /> Terminée</Badge>
                              ) : (
                                <Badge className="bg-indigo-600 hover:bg-indigo-700 gap-1"><Clock className="h-3 w-3 animate-pulse" /> Enchère active</Badge>
                              )
                            ) : (
                              getStatusBadge(item.status)
                            )}
                            <Badge variant="outline" className="text-[9px] font-black uppercase py-0 px-2">
                              {CATEGORIES.find(c => c.id === item.category)?.name || item.category}
                            </Badge>
                          </div>
                          <h3 className="text-base md:text-lg font-black uppercase leading-tight truncate" title={item.title}>
                            {item.title}
                          </h3>
                          {item.isAuction ? (
                            <div className="flex flex-col gap-0.5">
                              <p className="text-lg md:text-xl font-black text-indigo-600">
                                {(item.currentBid || item.basePrice).toLocaleString('fr-FR')} FCFA
                              </p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                🔨 {item.bidsCount || 0} offre(s) formulée(s)
                              </p>
                            </div>
                          ) : (
                            <p className="text-lg md:text-xl font-black text-primary">
                              {item.basePrice.toLocaleString('fr-FR')} FCFA
                            </p>
                          )}
                        </div>
                        
                        {/* Boutons d'actions */}
                        <div className="flex flex-wrap gap-1.5 pt-1 lg:pt-0">
                          <Button size="sm" variant="outline" className="rounded-lg font-bold gap-1 text-[11px] h-8 px-2.5" asChild>
                            <Link href={item.isAuction ? `/encheres/${item.id}` : `/products/${item.id}`}>
                              <ExternalLink className="h-3.5 w-3.5" /> Voir
                            </Link>
                          </Button>
                          
                          {!item.isAuction && item.status !== 'sold' && (
                            <Button 
                              onClick={() => handleMarkAsSold(item.id)} 
                              size="sm" 
                              className="rounded-lg font-bold gap-1 text-[11px] h-8 px-2.5 bg-blue-600 hover:bg-blue-700 text-white border-none"
                            >
                              <Check className="h-3.5 w-3.5" /> Vendu
                            </Button>
                          )}

                          <Button 
                            onClick={() => openEditModal(item)} 
                            size="sm" 
                            variant="secondary"
                            disabled={item.isAuction && item.bidsCount > 0}
                            className="rounded-lg font-bold gap-1 text-[11px] h-8 px-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
                            title={item.isAuction && item.bidsCount > 0 ? "Les enchères ayant reçu des offres ne peuvent pas être modifiées" : ""}
                          >
                            <Edit className="h-3.5 w-3.5" /> Modifier
                          </Button>

                          <Button 
                            onClick={() => handleDeleteListing(item.id)} 
                            size="sm" 
                            variant="destructive"
                            disabled={item.isAuction && item.bidsCount > 0}
                            className="rounded-lg font-bold gap-1 text-[11px] h-8 px-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
                            title={item.isAuction && item.bidsCount > 0 ? "Les enchères ayant reçu des offres ne peuvent pas être supprimées" : ""}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Supprimer
                          </Button>
                        </div>
                      </div>

                      {item.isAuction && item.bidsCount > 0 && (
                        <p className="text-[10px] font-bold text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                          Les modifications et suppressions sont verrouillées car cette enchère a déjà reçu des offres.
                        </p>
                      )}
                      
                      {/* Section Statistiques - Réservé aux PRO */}
                      {profile?.type === 'professionnel' && (
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex flex-wrap gap-4 items-center justify-between my-2">
                          <div className="flex items-center gap-1.5 text-amber-900">
                            <span className="text-xs font-black uppercase tracking-widest text-amber-800">📊 Statistiques PRO :</span>
                          </div>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                              <span className="text-muted-foreground">Vues :</span>
                              <span className="bg-slate-100 px-2 py-0.5 rounded font-black text-slate-900">
                                {item.viewsCount || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                              <span className="text-muted-foreground">Clics Tél :</span>
                              <span className="bg-amber-100 px-2 py-0.5 rounded font-black text-amber-900">
                                {item.phoneClicksCount || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                              <span className="text-muted-foreground">Intérêt :</span>
                              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-black">
                                {item.viewsCount && item.viewsCount > 0
                                  ? `${Math.round(((item.phoneClicksCount || 0) / item.viewsCount) * 100)}%`
                                  : '0%'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-2 border-t flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                        <p>Publié le {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('fr-FR') : 'Date inconnue'}</p>
                        {item.reportsCount && item.reportsCount > 0 ? (
                          <span className="text-red-500 font-bold flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> {item.reportsCount} signalement(s)
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-muted-foreground/30 flex flex-col items-center space-y-4">
              <Package className="h-12 w-12 text-muted-foreground opacity-20" />
              <p className="text-xl font-bold text-muted-foreground">Vous n'avez pas encore d'annonces.</p>
              <Button asChild className="rounded-xl font-black uppercase">
                <Link href="/sell">Vendre mon premier article</Link>
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* MODAL D'ÉDITION ÉLÉGANT */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full rounded-[2.5rem] shadow-2xl border overflow-hidden bg-white animate-in zoom-in-95 duration-200">
            <div className="bg-primary text-white p-6 flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Edit className="h-5 w-5" /> Modifier l&apos;annonce
              </h2>
              <button 
                onClick={() => setEditingItem(null)} 
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit}>
              <CardContent className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Titre de l&apos;annonce</Label>
                  <Input 
                    id="title" 
                    value={editTitle} 
                    onChange={(e) => setEditTitle(e.target.value)} 
                    required 
                    className="h-12 rounded-xl font-bold border-muted/50 focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Prix (FCFA)</Label>
                    <Input 
                      id="price" 
                      type="number"
                      value={editPrice} 
                      onChange={(e) => setEditPrice(e.target.value)} 
                      required 
                      className="h-12 rounded-xl font-bold border-muted/50 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition" className="text-xs font-black uppercase tracking-widest text-muted-foreground font-bebas">État de l&apos;article</Label>
                    <Select value={editCondition} onValueChange={setEditCondition}>
                      <SelectTrigger id="condition" className="h-12 rounded-xl font-bold border-muted/50 focus:border-primary">
                        <SelectValue placeholder="État" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new" className="font-bold">Neuf (Jamais utilisé)</SelectItem>
                        <SelectItem value="like-new" className="font-bold">Très bon état</SelectItem>
                        <SelectItem value="used" className="font-bold">Bon état (Usagé)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Catégorie</Label>
                    <Select value={editCategory} onValueChange={(val) => {
                      setEditCategory(val);
                      setEditSubcategory('');
                    }}>
                      <SelectTrigger id="category" className="h-12 rounded-xl font-bold border-muted/50 focus:border-primary">
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="font-bold">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subcategory" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sous-catégorie</Label>
                    <Select value={editSubcategory} onValueChange={setEditSubcategory} disabled={!editCategory}>
                      <SelectTrigger id="subcategory" className="h-12 rounded-xl font-bold border-muted/50 focus:border-primary">
                        <SelectValue placeholder={editCategory ? "Choisir une sous-catégorie" : "Sélectionnez d'abord une catégorie"} />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.find(c => c.id === editCategory)?.subcategories.map((sub) => (
                          <SelectItem key={sub} value={sub} className="font-bold">
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description</Label>
                  <Textarea 
                    id="description" 
                    value={editDescription} 
                    onChange={(e) => setEditDescription(e.target.value)} 
                    required 
                    className="min-h-[120px] rounded-xl font-medium border-muted/50 focus:border-primary"
                  />
                </div>

                {profile?.type === 'professionnel' && (
                  <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl space-y-6 mt-4 text-left">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-black uppercase text-amber-800">📦 Option Vente en Gros</Label>
                        <p className="text-xs text-muted-foreground font-medium">Proposer des tarifs réduits pour l'achat en quantité.</p>
                      </div>
                      <Switch 
                        checked={editAllowWholesale} 
                        onCheckedChange={(checked) => {
                          setEditAllowWholesale(checked);
                          if (!checked) {
                            setEditWholesaleOnly(false);
                            setEditMinWholesaleQuantity('');
                            setEditWholesalePrice('');
                          }
                        }}
                      />
                    </div>

                    {editAllowWholesale && (
                      <div className="space-y-6 pt-4 border-t border-amber-500/10 animate-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-xs font-black uppercase text-amber-800">Vente exclusive en gros</Label>
                            <p className="text-[11px] text-muted-foreground font-medium">L'article ne sera disponible qu'en gros (pas de vente à l'unité).</p>
                          </div>
                          <Switch 
                            checked={editWholesaleOnly} 
                            onCheckedChange={setEditWholesaleOnly}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="editMinWholesaleQuantity" className="text-[10px] font-black uppercase tracking-wider text-amber-800">Quantité minimale</Label>
                            <Input 
                              id="editMinWholesaleQuantity" 
                              type="number"
                              min="2"
                              placeholder="Ex: 5" 
                              value={editMinWholesaleQuantity} 
                              onChange={(e) => setEditMinWholesaleQuantity(e.target.value)} 
                              required={editAllowWholesale}
                              className="h-12 rounded-xl font-bold border-amber-200 focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="editWholesalePrice" className="text-[10px] font-black uppercase tracking-wider text-amber-800">Prix de gros unitaire (FCFA)</Label>
                            <Input 
                              id="editWholesalePrice" 
                              type="number"
                              placeholder="Ex: 8000" 
                              value={editWholesalePrice} 
                              onChange={(e) => setEditWholesalePrice(e.target.value)} 
                              required={editAllowWholesale}
                              className="h-12 rounded-xl font-bold border-amber-200 focus:border-amber-500"
                            />
                          </div>
                        </div>
                        
                        {editMinWholesaleQuantity && editWholesalePrice && (
                          <div className="bg-amber-500/10 p-3 rounded-xl text-xs font-bold text-amber-900 border border-amber-500/20">
                            Coût total minimal du lot : <span className="font-black">{(parseInt(editMinWholesaleQuantity, 10) * parseFloat(editWholesalePrice)).toLocaleString('fr-FR')} FCFA</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>

              <div className="p-6 border-t bg-muted/20 flex gap-3 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingItem(null)} 
                  className="rounded-xl font-bold h-12"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="rounded-xl font-black uppercase h-12 px-6"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Enregistrer les modifications
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
