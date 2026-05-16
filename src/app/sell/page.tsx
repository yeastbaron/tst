
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
import { Camera, X, Sparkles, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SellPage() {
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('used');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      variant: "destructive",
      title: "Service indisponible",
      description: "Le système de dépôt d'annonces est en cours de maintenance.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Alert variant="destructive" className="mb-8 bg-destructive/5 rounded-2xl border-destructive/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Mode Maintenance</AlertTitle>
            <AlertDescription>
              La base de données est en cours de réinitialisation. Le dépôt d'annonces est temporairement suspendu.
            </AlertDescription>
          </Alert>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-border/50 opacity-60 pointer-events-none">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight text-primary">Vendre un article</h1>
                <p className="text-muted-foreground font-medium">Postez votre annonce en quelques clics.</p>
              </div>
              <Button disabled variant="outline" size="sm" className="rounded-xl font-bold gap-2">
                <Sparkles className="h-4 w-4" /> IA Assist
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <Label className="text-lg font-bold">Photos (Max 10)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <label className="aspect-square border-2 border-dashed border-muted-foreground/20 rounded-xl flex flex-col items-center justify-center cursor-pointer">
                    <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Ajouter</span>
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-black uppercase tracking-wider">Titre</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-black uppercase tracking-wider">Catégorie</Label>
                    <Select disabled>
                      <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition" className="text-sm font-black uppercase tracking-wider">État</Label>
                    <Select disabled>
                      <SelectTrigger><SelectValue placeholder="État" /></SelectTrigger>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-black uppercase tracking-wider">Description</Label>
                  <Textarea id="description" disabled />
                </div>
              </div>

              <Button disabled size="lg" className="w-full h-16 text-xl font-black uppercase rounded-2xl">
                Publication suspendue
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
