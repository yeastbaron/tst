
"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, COMMISSION_RATE } from '@/lib/constants';
import { Camera, X, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function SellPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading } = useUser();
  const db = useFirestore();
  
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('used');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/sell');
    }
  }, [user, loading, router]);

  const buyerPrice = price ? Math.ceil(parseFloat(price) * (1 + COMMISSION_RATE)) : 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 10 - images.length);
      files.forEach(file => {
        // Validation simple du type de fichier
        if (!file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
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
    if (!user || !db) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté et la base de données doit être prête.",
      });
      return;
    }

    if (images.length === 0) {
      toast({
        variant: "destructive",
        title: "Photos manquantes",
        description: "Veuillez ajouter au moins une photo de votre article.",
      });
      return;
    }

    setIsSubmitting(true);

    const productData = {
      title,
      description,
      basePrice: parseFloat(price),
      category,
      condition,
      images,
      sellerId: user.uid,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    addDoc(collection(db, 'products'), productData)
      .then(() => {
        toast({
          title: "Annonce soumise !",
          description: "Notre équipe va valider votre article sous 24h.",
        });
        router.push('/my-listings');
      })
      .catch(async (error) => {
        setIsSubmitting(false);
        console.error("Erreur lors de la publication:", error);
        
        const permissionError = new FirestorePermissionError({
          path: 'products',
          operation: 'create',
          requestResourceData: productData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-border/50">
            <div className="mb-8">
              <h1 className="text-3xl font-black uppercase tracking-tight text-primary">Vendre un article</h1>
              <p className="text-muted-foreground font-medium">Postez votre annonce en moins de 2 minutes.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-bold">Photos (Max 10)</Label>
                  <span className="text-xs text-muted-foreground font-medium">{images.length}/10</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-muted group">
                      <img src={img} alt="" className="object-cover w-full h-full" />
                      <button 
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {images.length < 10 && (
                    <label className="aspect-square border-2 border-dashed border-muted-foreground/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                      <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-[10px] font-bold uppercase text-muted-foreground text-center px-2">Ajouter</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
                {images.length === 0 && (
                  <div className="flex items-center gap-2 text-destructive text-xs font-bold uppercase">
                    <AlertCircle className="h-4 w-4" /> Au moins une photo requise
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-black uppercase tracking-wider">Titre de l&apos;annonce</Label>
                  <Input 
                    id="title" 
                    placeholder="Ex: Samsung Galaxy S21 Ultra" 
                    className="h-12 text-lg font-medium" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-black uppercase tracking-wider">Catégorie</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger id="category" className="h-12 font-medium">
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
                    <Label htmlFor="condition" className="text-sm font-black uppercase tracking-wider">État</Label>
                    <Select value={condition} onValueChange={setCondition} required>
                      <SelectTrigger id="condition" className="h-12 font-medium">
                        <SelectValue placeholder="État du produit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Neuf</SelectItem>
                        <SelectItem value="used">Occasion</SelectItem>
                        <SelectItem value="refurbished">Reconditionné</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-black uppercase tracking-wider">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Décrivez votre article (points forts, défauts, etc.)" 
                    className="min-h-[150px] font-medium"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-black uppercase tracking-wider text-primary">Votre prix de vente (FCFA)</Label>
                  <div className="relative">
                    <Input 
                      id="price" 
                      type="number" 
                      min="100"
                      placeholder="0" 
                      className="h-16 text-3xl font-black pl-4 pr-16 bg-white border-primary/20 focus-visible:ring-secondary" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                      FCFA
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase opacity-60">Prix affiché au client</p>
                    <p className="text-sm text-muted-foreground italic">+10% commission SalleDeVente.sn</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-secondary">
                      {buyerPrice.toLocaleString('fr-FR')} <small className="text-xs font-normal">FCFA</small>
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting}
                className="w-full h-16 text-xl font-black uppercase rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-xl shadow-secondary/20"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Publication...
                  </div>
                ) : (
                  "Publier mon annonce"
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
