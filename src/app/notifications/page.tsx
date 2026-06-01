"use client";

import { useUser, useNotifications } from '@/firebase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, Trash2, CheckCheck, ShieldCheck, Sparkles, 
  Megaphone, ExternalLink, ChevronRight, Inbox, Loader2, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { LoadingLogo } from '@/components/ui/loading-logo';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const { user, loading: authLoading } = useUser();
  const { 
    notifications, 
    unreadCount, 
    loading: notificationsLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAllNotifications
  } = useNotifications(user?.uid);

  const [activeFilter, setActiveFilter] = useState<'all' | 'profile' | 'global' | 'commercial'>('all');

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    if (activeFilter === 'all') return notifications;
    return notifications.filter(n => n.type === activeFilter);
  }, [notifications, activeFilter]);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingLogo />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/10">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center space-y-6 rounded-[2.5rem] shadow-xl bg-white border border-border/50">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Bell className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Connexion Requise</h1>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                Veuillez vous connecter à votre compte pour consulter vos notifications et actualités.
              </p>
            </div>
            <Button asChild className="w-full rounded-2xl font-black uppercase h-12">
              <Link href="/login">Se connecter</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/10 font-sans">
      <Header />
      <main className="flex-1">
        {/* BANNIÈRE HERO EN-TÊTE */}
        <div className="w-full bg-muted border-y border-border/50 py-4">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-white/50">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="text-[14px] font-bebas tracking-[0.1em] uppercase text-primary">Centre de Notifications</h1>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="font-bold text-[9px] rounded-full px-2 py-0.5 animate-pulse uppercase tracking-wider">
                  {unreadCount} non lue(s)
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest hidden sm:block">SalleDeVente.sn</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
          {/* BARRE D'ACTIONS RAPIDES */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between border-b pb-4 border-border/50">
            {/* Filtres par Onglets */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setActiveFilter('all')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap",
                  activeFilter === 'all'
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white border text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                )}
              >
                Toutes ({notifications.length})
              </button>
              <button
                onClick={() => setActiveFilter('profile')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5",
                  activeFilter === 'profile'
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white border text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                )}
              >
                👤 Mon Profil
              </button>
              <button
                onClick={() => setActiveFilter('global')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5",
                  activeFilter === 'global'
                    ? "bg-primary/95 text-white shadow-sm"
                    : "bg-white border text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                )}
              >
                📢 Plateforme
              </button>
              <button
                onClick={() => setActiveFilter('commercial')}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5",
                  activeFilter === 'commercial'
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-white border text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                )}
              >
                💎 Offres & Badges
              </button>
            </div>

            {/* Actions Massives */}
            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                <Button 
                  onClick={markAllAsRead} 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl font-bold text-xs uppercase tracking-wider h-10 border-border bg-white flex-1 sm:flex-initial gap-1.5"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Tout lire
                </Button>
                <Button 
                  onClick={clearAllNotifications} 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl font-bold text-xs uppercase tracking-wider h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex-1 sm:flex-initial gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Tout effacer
                </Button>
              </div>
            )}
          </div>

          {/* LISTE DES NOTIFICATIONS */}
          {notificationsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Chargement des notifications...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((n) => {
                const isUnread = !n.read;
                return (
                  <Card 
                    key={n.id} 
                    onClick={() => {
                      if (isUnread) markAsRead(n.id);
                    }}
                    className={cn(
                      "rounded-[1.75rem] border transition-all duration-300 relative overflow-hidden group hover:shadow-md cursor-pointer",
                      isUnread 
                        ? "border-primary/20 bg-gradient-to-r from-primary/[0.02] to-transparent shadow-[inset_4px_0_0_0_#1e3a8a]" 
                        : "border-border/60 bg-white"
                    )}
                  >
                    <CardContent className="p-5 flex items-start gap-4">
                      {/* Icône selon type */}
                      <div className={cn(
                        "p-3 rounded-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-105",
                        n.type === 'profile' && "bg-slate-100 text-slate-700",
                        n.type === 'global' && "bg-primary/10 text-primary",
                        n.type === 'commercial' && "bg-amber-100 text-amber-600"
                      )}>
                        {n.type === 'profile' && <ShieldCheck className="h-5 w-5" />}
                        {n.type === 'global' && <Megaphone className="h-5 w-5" />}
                        {n.type === 'commercial' && <Sparkles className="h-5 w-5" />}
                      </div>

                      {/* Corps de la notification */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={cn(
                            "text-sm uppercase tracking-tight",
                            isUnread ? "font-black text-slate-900" : "font-bold text-slate-700"
                          )}>
                            {n.title}
                          </h4>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          )}
                          <span className="text-[10px] text-muted-foreground font-semibold ml-auto">
                            {n.createdAt ? new Date(n.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : ''}
                          </span>
                        </div>
                        <p className={cn(
                          "text-xs leading-relaxed font-medium",
                          isUnread ? "text-slate-700" : "text-muted-foreground"
                        )}>
                          {n.message}
                        </p>

                        {/* Lien de redirection */}
                        {n.link && (
                          <Link 
                            href={n.link}
                            className="inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline pt-2 group-hover:translate-x-0.5 transition-transform"
                          >
                            Consulter / Agir <ChevronRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>

                      {/* Boutons d'action unitaire */}
                      <div className="flex items-center gap-1 self-center md:self-start opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        {isUnread && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Marquer comme lu"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(n.id);
                            }}
                            className="text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded-xl"
                          >
                            <CheckCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Supprimer"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(n.id);
                          }}
                          className="text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-border flex flex-col items-center gap-4 shadow-inner">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Inbox className="h-8 w-8 text-muted-foreground opacity-40" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-black uppercase text-slate-800">Boîte de réception vide</p>
                <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">
                  {activeFilter === 'all' 
                    ? "Vous n'avez reçu aucune notification pour le moment." 
                    : "Aucune notification ne correspond à ce filtre actuellement."}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
