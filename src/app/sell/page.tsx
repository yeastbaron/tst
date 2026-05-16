
"use client";

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, COMMISSION_RATE } from '@/lib/constants';
import { Camera, X, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SellPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const router = useRouter();
  
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('used');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const buyerPrice = price ? Math.ceil(parseFloat(price) * (1 + COMMISSION_RATE)) : 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 10 - images.length);
      files.forEach(file => {
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
    if (!db) return;
    
    setIsSubmitting(true);

    const productData = {
      title,
      description,
      basePrice: parseFloat(price),
      category,
      condition,
      images,
      status: 'active', // Auto-active for now for testing
      createdAt: serverTimestamp(),
      sellerId: 'anonymous' // Anonymous for now as requested
    };

    addDoc(collection(db, 'products'), productData)
      .then(() => {
        setIsSuccess(true);
        toast({
          title: "Annonce publiée !",
          description: "Votre article est désormais visible sur la plateforme.",
        });
        setTimeout(() => router.push('/'), 2000);
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: 'products',
          operation: 'create',
          requestResourceData: productData
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsSubmitting(false);
      });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/20">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-12 rounded-[3rem] text-center space-y-6 shadow-xl max-w-md w-full">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Annonce en ligne !</h1>
            <p className="text-muted-foreground font-medium">Redirection vers l'accueil...</p>
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
            <div className="mb-10 flex justify-between items-start">
              <div>
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-primary">Vendre un article</h1>
                <p className="text-muted-foreground font-medium mt-1">Gratuit, rapide et 100% sécurisé.</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl font-bold gap-2 text-primary border-primary/20 hover:bg-primary/5">
                <Sparkles className="h-4 w-4" /> IA Assist
              </Button>
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
                    <Select value={category} onValueChange={setCategory} required>
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

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Prix de base (FCFA)</Label>
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
                  {price && (
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Prix affiché pour l'acheteur (+10%)</p>
                      <p className="text-xl font-black text-primary">{buyerPrice.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  )}
                </div>

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

              <Button 
                type="submit"
                disabled={isSubmitting}
                size="lg" 
                className="w-full h-16 text-xl font-black uppercase rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                {isSubmitting ? <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Publication...</> : "Publier l'annonce"}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
