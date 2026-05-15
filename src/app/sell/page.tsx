
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
import { Camera, Image as ImageIcon, X, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { autoProductListing } from '@/ai/flows/auto-product-listing-flow';

export default function SellPage() {
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const buyerPrice = price ? Math.ceil(parseFloat(price) * (1 + COMMISSION_RATE)) : 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 10 - images.length);
      files.forEach(file => {
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

  const handleSmartDraft = async () => {
    if (!title || images.length === 0) {
      toast({
        title: "Infos manquantes",
        description: "Veuillez ajouter un titre et au moins une photo pour générer la description.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await autoProductListing({
        title,
        photoDataUris: images
      });
      setDescription(result.description);
      // Try to match the first suggested category
      if (result.suggestedCategories.length > 0) {
        const suggested = result.suggestedCategories[0].toLowerCase();
        const found = CATEGORIES.find(c => suggested.includes(c.name.toLowerCase()));
        if (found) setCategory(found.id);
      }
      toast({
        title: "Description générée !",
        description: "Nous avons rédigé une annonce professionnelle pour vous."
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer la description automatique.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Annonce soumise !",
      description: "Notre équipe va valider votre article sous 24h.",
    });
  };

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
              {/* Image Upload */}
              <div className="space-y-4">
                <Label className="text-lg font-bold">Photos (Max 10)</Label>
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
                      <span className="text-[10px] font-bold uppercase text-muted-foreground text-center px-2">Ajouter des photos</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>

              {/* Basic Info */}
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
                    <Select value={category} onValueChange={setCategory}>
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
                    <Select defaultValue="used">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description" className="text-sm font-black uppercase tracking-wider">Description</Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary font-bold hover:bg-primary/5"
                      onClick={handleSmartDraft}
                      disabled={isGenerating}
                    >
                      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                      Générer par IA
                    </Button>
                  </div>
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

              {/* Pricing Section */}
              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-black uppercase tracking-wider text-primary">Votre prix de vente (FCFA)</Label>
                  <div className="relative">
                    <Input 
                      id="price" 
                      type="number" 
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

              <Button type="submit" size="lg" className="w-full h-16 text-xl font-black uppercase rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-xl shadow-secondary/20">
                Publier mon annonce
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
